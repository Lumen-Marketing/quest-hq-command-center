// Writing a PDF by hand.
//
// There is no PDF library in this project and adding one would cost more than the whole Form
// field: the smallest credible generator is bigger than the entry bundle's entire remaining
// budget. So this writes the file itself, the same way sheet-xlsx.js writes a workbook.
//
// It is far less mad than it sounds, because of two things a proposal happens to allow:
//
//   1. The fourteen base fonts. Every PDF reader already has Helvetica, so a document that asks
//      for it embeds no font data at all -- which is where the weight in a PDF library goes.
//      Their metrics are fixed and public, so the two tables below are all that is needed to
//      wrap and centre text correctly.
//   2. JPEG passes straight through. A /DCTDecode image stream IS the .jpg file, byte for byte,
//      so an image is embedded by copying it. No encoder, no zlib. The editor converts whatever
//      was dropped on the page -- PNG, SVG, a rasterised icon -- to JPEG on a canvas first,
//      which browsers do natively.
//
// The text stays real text: selectable, searchable and copyable out of the PDF, which a
// screenshot pasted into a page would not be.
//
// Pure over its inputs -- bytes in, bytes out, no DOM -- so a page of text can be laid out and
// measured in a test.

import { colorChannels, pageMm } from './doc-model.js';

/** Millimetres to PostScript points, the unit a PDF is measured in. */
export const MM_TO_PT = 72 / 25.4;

// Helvetica and Helvetica-Bold advance widths for ASCII 32..126, in 1/1000 em -- the numbers
// from the Adobe metrics, which is what every reader lays these fonts out with. Oblique is a
// sheared upright and shares its widths, so two tables cover all four faces.
const W_REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const W_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

/** The width of one string, in points, in the face it will be drawn in. */
export function textWidth(text, size, bold = false) {
  const widths = bold ? W_BOLD : W_REGULAR;
  let mille = 0;
  for (const ch of String(text ?? '')) {
    const code = ch.codePointAt(0);
    // Anything outside the metrics -- an accent, an em dash, a glyph from another script --
    // is measured as an 'n'. Guessing slightly wrong is better than measuring it as zero and
    // letting a line silently run off the paper.
    mille += code >= 32 && code <= 126 ? widths[code - 32] : widths[110 - 32];
  }
  return (mille / 1000) * size;
}

/**
 * Break text into lines that fit a given width.
 *
 * Wraps on spaces, and falls back to breaking mid-word for a word that cannot fit on a line of
 * its own -- a pasted URL, usually. Blank lines in the source are kept, because somebody who
 * pressed Return twice meant it.
 */
export function wrapText(text, widthPt, size, bold = false) {
  const out = [];
  String(text ?? '').split('\n').forEach((paragraph) => {
    const words = paragraph.split(/ +/);
    let line = '';
    const push = () => { out.push(line); line = ''; };
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, size, bold) <= widthPt || !line) {
        // A single word too long for the whole line is chopped, one character at a time, rather
        // than left to overflow.
        if (!line && textWidth(word, size, bold) > widthPt) {
          let chunk = '';
          for (const ch of word) {
            if (textWidth(chunk + ch, size, bold) > widthPt && chunk) { out.push(chunk); chunk = ch; } else chunk += ch;
          }
          line = chunk;
          return;
        }
        line = candidate;
        return;
      }
      push();
      line = word;
    });
    out.push(line);
  });
  return out;
}

/** A PDF string literal. Backslash, brackets and anything non-Latin-1 have to be dealt with. */
function pdfString(text) {
  let out = '';
  for (const ch of String(text ?? '')) {
    const code = ch.codePointAt(0);
    if (ch === '\\' || ch === '(' || ch === ')') out += `\\${ch}`;
    else if (code < 32) out += ' ';
    // WinAnsiEncoding is Latin-1 plus a handful; past that a glyph the font has not got would
    // draw as a wrong character, so the common typographic ones are folded to their ASCII
    // equivalents and the rest become '?'.
    else if (code <= 255) out += ch;
    else if (code === 0x2018 || code === 0x2019) out += "'";
    else if (code === 0x201c || code === 0x201d) out += '"';
    else if (code === 0x2013 || code === 0x2014) out += '-';
    else if (code === 0x2022) out += '-';
    else out += '?';
  }
  return out;
}

/**
 * A JPEG's pixel size and colour space, read out of its own header.
 *
 * The PDF has to declare /Width, /Height and /ColorSpace for an image whose bytes it is not
 * decoding, so they are taken from the SOF marker. Walking the segment lengths is the only
 * reliable way -- a JPEG is a chain of markers, and the SOF is not at a fixed offset.
 */
export function jpegInfo(bytes) {
  const b = bytes;
  if (!b || b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) throw new Error('That image is not a JPEG.');
  let i = 2;
  while (i < b.length - 1) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const marker = b[i + 1];
    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = (b[i + 2] << 8) | b[i + 3];
    // Any SOFn but the arithmetic-coded ones, which no browser produces.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return {
        height: (b[i + 5] << 8) | b[i + 6],
        width: (b[i + 7] << 8) | b[i + 8],
        components: b[i + 9],
      };
    }
    i += 2 + len;
  }
  throw new Error('That JPEG has no size in it.');
}

// --- the content stream ------------------------------------------------------------------------

const fmt = (n) => (Math.round(n * 1000) / 1000).toString();

function fillOp(color) {
  const rgb = colorChannels(color);
  return rgb ? `${fmt(rgb[0])} ${fmt(rgb[1])} ${fmt(rgb[2])} rg\n` : '';
}

function strokeOp(color) {
  const rgb = colorChannels(color);
  return rgb ? `${fmt(rgb[0])} ${fmt(rgb[1])} ${fmt(rgb[2])} RG\n` : '';
}

/** A rounded rectangle as four lines and four Bézier arcs. */
function roundRectPath(x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2);
  if (k <= 0) return `${fmt(x)} ${fmt(y)} ${fmt(w)} ${fmt(h)} re\n`;
  // 0.5523 is the circle-to-Bézier constant; anything else makes a corner that looks wrong.
  const c = k * 0.5523;
  return `${fmt(x + k)} ${fmt(y)} m\n`
    + `${fmt(x + w - k)} ${fmt(y)} l\n`
    + `${fmt(x + w - k + c)} ${fmt(y)} ${fmt(x + w)} ${fmt(y + k - c)} ${fmt(x + w)} ${fmt(y + k)} c\n`
    + `${fmt(x + w)} ${fmt(y + h - k)} l\n`
    + `${fmt(x + w)} ${fmt(y + h - k + c)} ${fmt(x + w - k + c)} ${fmt(y + h)} ${fmt(x + w - k)} ${fmt(y + h)} c\n`
    + `${fmt(x + k)} ${fmt(y + h)} l\n`
    + `${fmt(x + k - c)} ${fmt(y + h)} ${fmt(x)} ${fmt(y + h - k + c)} ${fmt(x)} ${fmt(y + h - k)} c\n`
    + `${fmt(x)} ${fmt(y + k)} l\n`
    + `${fmt(x)} ${fmt(y + k - c)} ${fmt(x + k - c)} ${fmt(y)} ${fmt(x + k)} ${fmt(y)} c\n`;
}

function ellipsePath(x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const ax = (w / 2) * 0.5523;
  const ay = (h / 2) * 0.5523;
  return `${fmt(cx)} ${fmt(y + h)} m\n`
    + `${fmt(cx + ax)} ${fmt(y + h)} ${fmt(x + w)} ${fmt(cy + ay)} ${fmt(x + w)} ${fmt(cy)} c\n`
    + `${fmt(x + w)} ${fmt(cy - ay)} ${fmt(cx + ax)} ${fmt(y)} ${fmt(cx)} ${fmt(y)} c\n`
    + `${fmt(cx - ax)} ${fmt(y)} ${fmt(x)} ${fmt(cy - ay)} ${fmt(x)} ${fmt(cy)} c\n`
    + `${fmt(x)} ${fmt(cy + ay)} ${fmt(cx - ax)} ${fmt(y + h)} ${fmt(cx)} ${fmt(y + h)} c\n`;
}

function paintOp(style) {
  const hasFill = colorChannels(style.fill) && style.fill !== 'none';
  const hasStroke = colorChannels(style.stroke) && style.stroke !== 'none' && style.strokeWidth > 0;
  if (hasFill && hasStroke) return 'B\n';
  if (hasFill) return 'f\n';
  if (hasStroke) return 'S\n';
  // Nothing to paint: the path is dropped rather than left on the stack, which would make the
  // next element inherit it.
  return 'n\n';
}

/**
 * One element as content-stream operators.
 *
 * `top` converts the document's downward millimetres to the PDF's upward points. Getting this
 * one line wrong flips the whole page upside down, which is the classic first PDF bug.
 */
function drawItem(item, pageHeightPt, imageNames) {
  const K = MM_TO_PT;
  const x = item.x * K;
  const w = item.w * K;
  const h = item.h * K;
  const y = pageHeightPt - (item.y * K) - h;
  const style = item.style;
  // Opacity would need a transparency group and an ExtGState per value; a document is printed on
  // white paper, so a faded element is drawn at full strength rather than pretending.
  let s = 'q\n';

  if (item.kind === 'shape') {
    s += fillOp(style.fill) + strokeOp(style.stroke);
    if (style.strokeWidth > 0) s += `${fmt(style.strokeWidth * K)} w\n`;
    if (item.shape === 'line') {
      // A rule across the middle of its box, which is what a line is for on a document.
      s += `${fmt(x)} ${fmt(y + h / 2)} m\n${fmt(x + w)} ${fmt(y + h / 2)} l\nS\n`;
    } else if (item.shape === 'ellipse') {
      s += ellipsePath(x, y, w, h) + paintOp(style);
    } else {
      s += roundRectPath(x, y, w, h, style.radius * K) + paintOp(style);
    }
    return `${s}Q\n`;
  }

  if (item.kind === 'image' || item.kind === 'icon') {
    const name = imageNames.get(item.id);
    // An image that could not be converted is skipped rather than drawn as a black box.
    if (!name) return '';
    // The image matrix maps the unit square onto the box, so scaling is the matrix and there is
    // no resampling to do.
    return `${s}${fmt(w)} 0 0 ${fmt(h)} ${fmt(x)} ${fmt(y)} cm\n/${name} Do\nQ\n`;
  }

  // Text and a record field are the same drawing problem: a wrapped, aligned, possibly
  // underlined block of words inside a box.
  const text = String(item.text ?? '');
  if (!text.trim()) return '';
  const size = style.size;
  const bold = !!style.bold;
  const font = `/F${bold && style.italic ? 4 : bold ? 2 : style.italic ? 3 : 1}`;
  const lines = wrapText(text, w, size, bold);
  const lead = size * 1.2;
  s += fillOp(style.color);
  s += 'BT\n';
  s += `${font} ${fmt(size)} Tf\n`;
  let drawn = '';
  lines.forEach((line, i) => {
    // The first baseline sits one ascent below the top edge, so text starts inside its box
    // rather than straddling the edge.
    const baseline = y + h - (size * 0.85) - i * lead;
    // A line that has run out of box is dropped: growing past the bottom edge would print over
    // whatever is underneath.
    if (baseline < y - size * 0.25) return;
    const lineWidth = textWidth(line, size, bold);
    const offset = style.align === 'center' ? (w - lineWidth) / 2 : style.align === 'right' ? w - lineWidth : 0;
    drawn += `1 0 0 1 ${fmt(x + Math.max(0, offset))} ${fmt(baseline)} Tm\n(${pdfString(line)}) Tj\n`;
    if (style.underline) {
      // Drawn as a thin filled rectangle: PDF has no underline attribute, and every generator
      // does it this way.
      drawn += `ET\n${fmt(x + Math.max(0, offset))} ${fmt(baseline - size * 0.13)} ${fmt(lineWidth)} ${fmt(Math.max(0.4, size * 0.06))} re\nf\nBT\n${font} ${fmt(size)} Tf\n`;
    }
  });
  s += drawn;
  s += 'ET\n';
  return `${s}Q\n`;
}

// --- the file ----------------------------------------------------------------------------------

function latin1Bytes(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

function concat(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  parts.forEach((part) => { out.set(part, at); at += part.length; });
  return out;
}

/**
 * The whole PDF.
 *
 * `items` are already resolved -- text worked out, images converted to JPEG bytes -- so this
 * function has no opinion about records or the DOM. `title` becomes the document's name in the
 * reader's title bar and in the print dialog.
 *
 * Objects are written in order and their byte offsets recorded as they go, because the cross
 * reference table at the end has to name the exact offset of every one of them; a table that is
 * even one byte out makes a file some readers refuse.
 */
export function writePdf({ page, items = [], images = [], title = '' }) {
  const [wMm, hMm] = pageMm(page);
  const pageWidthPt = wMm * MM_TO_PT;
  const pageHeightPt = hMm * MM_TO_PT;

  const imageNames = new Map();
  const usable = images.filter((image) => image && image.bytes && image.bytes.length);
  usable.forEach((image, i) => imageNames.set(image.id, `Im${i}`));

  const content = items.map((item) => drawItem(item, pageHeightPt, imageNames)).join('');

  // 1 catalog, 2 pages, 3 page, 4..7 fonts, 8 content, then one per image.
  const fontObjects = [
    '/Helvetica', '/Helvetica-Bold', '/Helvetica-Oblique', '/Helvetica-BoldOblique',
  ].map((base) => `<< /Type /Font /Subtype /Type1 /BaseFont ${base} /Encoding /WinAnsiEncoding >>`);

  const xobjectRefs = usable.map((image, i) => `/Im${i} ${9 + i} 0 R`).join(' ');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(pageWidthPt)} ${fmt(pageHeightPt)}] `
      + '/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >>'
      + `${xobjectRefs ? ` /XObject << ${xobjectRefs} >>` : ''} >> /Contents 8 0 R >>`,
    ...fontObjects,
    { stream: latin1Bytes(content), dict: '' },
    ...usable.map((image) => ({
      stream: image.bytes,
      dict: `/Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} `
        + `/ColorSpace ${image.components === 1 ? '/DeviceGray' : '/DeviceRGB'} /BitsPerComponent 8 /Filter /DCTDecode`,
    })),
    // Last, and its own object: /Info in the trailer has to be an indirect reference, not the
    // dictionary itself. This is what puts the document's name in the reader's title bar.
    `<< /Title (${pdfString(title || 'Document')}) /Producer (Quest HQ) >>`,
  ];
  const infoObject = objects.length;

  const parts = [];
  let offset = 0;
  const put = (bytes) => { parts.push(bytes); offset += bytes.length; };
  // A binary comment on line two is what tells a transfer program the file is not text.
  put(latin1Bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));

  const offsets = [];
  objects.forEach((object, i) => {
    offsets.push(offset);
    const n = i + 1;
    if (typeof object === 'string') {
      put(latin1Bytes(`${n} 0 obj\n${object}\nendobj\n`));
      return;
    }
    put(latin1Bytes(`${n} 0 obj\n<< ${object.dict}${object.dict ? ' ' : ''}/Length ${object.stream.length} >>\nstream\n`));
    put(object.stream);
    put(latin1Bytes('\nendstream\nendobj\n'));
  });

  const xrefAt = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((at) => { xref += `${String(at).padStart(10, '0')} 00000 n \n`; });
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObject} 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  put(latin1Bytes(xref));

  return concat(parts);
}
