// Make a photo small enough to store, instead of refusing it.
//
// "lets change the 5mb limit on uploading images and files, lets make it max is 100mb, so if
// exceeds 100mb it will compress to make it below 100mb."
//
// A phone camera produces 8-15 MB a shot and a DSLR several times that, so the old 5 MB image
// cap was refusing ordinary photos of a roof. Nothing about a bigger cap makes those bytes
// worth keeping, though: what is wanted is the picture, not the sensor's original file. This
// re-encodes it -- the same trick the workspace icon and the avatar already use -- so what
// arrives at storage is a few megabytes whatever the camera did.
//
// Only for still photos. An animated GIF drawn to a canvas comes back as its first frame, and
// a video cannot be transcoded in a browser without shipping a codec, so both are left alone
// by the caller and stand or fall on the cap.
//
// Fetched on demand: most sessions never upload an image, and this is a canvas, a decode ladder
// and a base64 reader that they should not carry.

/**
 * The rungs, in order. WebP wins by a wide margin at photo sizes; a browser that cannot encode
 * it hands back a PNG from toDataURL, which the JPEG rungs then undercut.
 *
 * The ladder exists so an awkward image compresses FURTHER rather than being rejected -- each
 * rung is tried in turn and the first one inside the budget wins.
 */
const RUNGS = [
  ['image/webp', 0.86], ['image/webp', 0.74], ['image/webp', 0.6],
  ['image/jpeg', 0.82], ['image/jpeg', 0.65], ['image/jpeg', 0.45],
];

const EXT_FOR = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

/**
 * Decode without materialising an inflated base64 copy first.
 *
 * createImageBitmap streams from the File and applies EXIF rotation, so a 40 MP photo costs one
 * bitmap rather than a ~1.37x data-URL string plus a decoded <img>. Older Safari rejects the
 * options bag, which is what the fallback is for.
 */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close?.() };
    } catch { /* fall through */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('That image could not be read.'));
      el.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** A data URL back to bytes, without a round trip through fetch(). */
function dataUrlToBlob(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const meta = dataUrl.slice(0, comma);
  const type = meta.slice(5, meta.indexOf(';') > -1 ? meta.indexOf(';') : meta.length) || 'image/jpeg';
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

/** The name the shrunk file should carry: the original, with the extension it now really is. */
export function renameFor(name, type) {
  const ext = EXT_FOR[type] || 'jpg';
  const stem = String(name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
  return `${stem}.${ext}`;
}

/**
 * How big to draw it. Anything past `maxEdge` is scaled down before a single rung is tried,
 * because pixels are what the file is made of -- dropping quality on a 8000px photo to hit a
 * budget produces a large, soft image where a smaller sharp one was wanted.
 */
export function scaleFor(width, height, maxEdge) {
  const longest = Math.max(width, height);
  if (!longest || longest <= maxEdge) return { width, height };
  const factor = maxEdge / longest;
  return { width: Math.max(1, Math.round(width * factor)), height: Math.max(1, Math.round(height * factor)) };
}

/**
 * Re-encode `file` until it fits `budget` bytes.
 *
 * Returns the ORIGINAL file untouched when it already fits: re-encoding something that is
 * already small enough spends quality for nothing and changes a name nobody asked to change.
 *
 * @returns {Promise<File|Blob>} what to upload
 */
export async function shrinkImageToBudget(file, budget, { maxEdge = 2560 } = {}) {
  if (!file || !budget || file.size <= budget) return file;
  const decoded = await decode(file);
  try {
    const { width, height } = scaleFor(decoded.width, decoded.height, maxEdge);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(decoded.source, 0, 0, width, height);
    let smallest = '';
    for (const [type, quality] of RUNGS) {
      const output = canvas.toDataURL(type, quality);
      if (!smallest || output.length < smallest.length) smallest = output;
      // Compared against the base64 length rather than the decoded byte count, which overstates
      // it by about a third. Erring small is the right way round for a storage ceiling.
      if (output.length <= budget) break;
    }
    const blob = dataUrlToBlob(smallest);
    // Still too big after the last rung -- a photograph of noise, or a budget set very low. The
    // caller has a cap to enforce and a message to show; silently uploading it would defeat it.
    if (blob.size > budget) return blob.size < file.size ? asFile(blob, file.name) : file;
    return asFile(blob, file.name);
  } finally {
    decoded.release();
  }
}

function asFile(blob, name) {
  const renamed = renameFor(name, blob.type);
  try {
    return new File([blob], renamed, { type: blob.type });
  } catch {
    // Older Safari has no File constructor. A Blob uploads the same; the name rides in the
    // storage path, which the caller builds.
    return blob;
  }
}

/**
 * How small a still photo is made before it is stored.
 *
 * Comfortably inside every bucket's own ceiling, so a file that passes the client's cap is one
 * storage will actually accept -- the two limits are not the same number and the smaller one is
 * the one that decides.
 */
export const IMAGE_UPLOAD_BUDGET_BYTES = 8 * 1024 * 1024;

/**
 * The caller's whole interface: hand it a photo, get back one worth uploading.
 *
 * The already-small case is answered here rather than in main.js so the number lives beside the
 * ladder that has to honour it, and the entry bundle carries neither.
 */
export function shrinkForUpload(file, budget = IMAGE_UPLOAD_BUDGET_BYTES) {
  if (!file || file.size <= budget) return Promise.resolve(file);
  return shrinkImageToBudget(file, budget);
}
