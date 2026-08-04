// Job walk: record a voice note in the browser and attach it to the job.
//
// Fetched on demand -- only the job file offers it, and MediaRecorder plus a stream is not
// something every page should carry.
//
// The v1 design has this transcribing and pinging the foreman. Transcription needs a speech
// service nobody has connected yet, so this does the half that works without one: capture and
// attach. That half is most of the value -- a walk recorded on site beats a walk remembered
// in the truck -- and the UI says plainly that no transcript is produced, rather than
// implying one is coming.

/** What the browser will actually give us, in order of preference. */
const CANDIDATE_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

export function supportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return CANDIDATE_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

export const canRecord = () => Boolean(
  typeof MediaRecorder !== 'undefined'
  && typeof navigator !== 'undefined'
  && navigator.mediaDevices
  && navigator.mediaDevices.getUserMedia,
);

export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * One recording session.
 *
 * The microphone track is stopped on every exit path -- finish, cancel, or error. A live
 * track leaves the browser's recording indicator on after the dialog has closed, which reads
 * as the app still listening.
 */
export function createRecorder({ onTick, onStop, onError } = {}) {
  let recorder = null;
  let stream = null;
  let chunks = [];
  let startedAt = 0;
  let timer = null;

  function releaseMicrophone() {
    if (timer) { clearInterval(timer); timer = null; }
    if (stream) { stream.getTracks().forEach((track) => track.stop()); stream = null; }
  }

  async function start() {
    if (!canRecord()) throw new Error('This browser cannot record audio.');
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = supportedMimeType();
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunks = [];
    recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
    recorder.onerror = (event) => { releaseMicrophone(); if (onError) onError(event.error || new Error('Recording failed')); };
    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(chunks, { type });
      const elapsed = Date.now() - startedAt;
      releaseMicrophone();
      // A blob with no bytes is a failed recording, not a short one. Saying so beats
      // attaching a file that plays nothing.
      if (onStop) onStop(blob.size ? blob : null, elapsed);
    };
    startedAt = Date.now();
    recorder.start();
    timer = setInterval(() => { if (onTick) onTick(Date.now() - startedAt); }, 500);
    return true;
  }

  function stop() {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    else releaseMicrophone();
  }

  /** Abandon it: stop the hardware and throw the audio away without calling onStop. */
  function cancel() {
    if (recorder) recorder.onstop = () => releaseMicrophone();
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    else releaseMicrophone();
    chunks = [];
  }

  const isRecording = () => Boolean(recorder && recorder.state === 'recording');

  return { start, stop, cancel, isRecording, releaseMicrophone };
}

/** A stable, sortable name so the job's files read chronologically. */
export function voiceNoteName(date = new Date(), extension = 'webm') {
  const pad = (n) => String(n).padStart(2, '0');
  return `job-walk-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `-${pad(date.getHours())}${pad(date.getMinutes())}.${extension}`;
}

export function extensionFor(mimeType) {
  const type = String(mimeType || '');
  if (type.includes('mp4')) return 'm4a';
  if (type.includes('ogg')) return 'ogg';
  return 'webm';
}
