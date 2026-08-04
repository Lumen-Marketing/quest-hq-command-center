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

/**
 * The job-walk dialog: start, stop, attach.
 *
 * A factory rather than more loose exports, because this half needs the app -- state, the
 * modal shell, the uploader -- while everything above it is pure. Keeping both in one module
 * means the recorder and the dialog that drives it are fetched together, which is the only
 * way either is ever used.
 */
export function createJobWalk(ctx) {
  const {
    state, render, showToast, renderModalShell, emptyState, h, jobById,
    isLiveSupabaseSession, uploadJobFile,
  } = ctx;
  let recorder = null;

  function open(job) {
    if (!canRecord()) {
      showToast('This browser cannot record audio. Use a phone, or add the note as a file.', 'local', 'Jobs');
      return;
    }
    state.jobWalk = { jobId: job.id, phase: 'idle', elapsed: 0, error: '' };
    state.modal = 'job-walk';
    render();
  }

  function renderModal() {
    const walk = state.jobWalk;
    const job = walk ? jobById(walk.jobId) : null;
    if (!job) return renderModalShell('Jobs', 'Job walk', emptyState('That job is no longer available.'), 'wb-modal-sm');
    const recording = walk.phase === 'recording';
    return renderModalShell('Jobs', 'Job walk', `
      <div class="jw">
        <p class="jd-job"><b>${h(job.name)}</b></p>
        ${walk.error ? `<div class="wb-modal-error" role="alert">${h(walk.error)}</div>` : ''}
        <div class="jw-stage ${recording ? 'on' : ''}">
          <span class="jw-dot" aria-hidden="true"></span>
          <strong class="jw-time">${h(formatElapsed(walk.elapsed))}</strong>
          <span class="jf-sub">${recording ? 'Recording — talk the walk' : walk.phase === 'saving' ? 'Attaching…' : 'Ready'}</span>
        </div>
        <p class="jf-sub">The recording attaches to this job's files. It is not transcribed —
          nothing is connected that can do that yet, so the audio is the record.</p>
        <div class="modal-actions">
          ${recording
    ? `<button class="btn" type="button" data-action="job-walk-cancel">Discard</button>
             <button class="btn btn-primary" type="button" data-action="job-walk-stop"><i class="ti ti-check"></i>Finish &amp; attach</button>`
    : `<button class="btn" type="button" data-action="job-walk-cancel">Close</button>
             <button class="btn btn-primary" type="button" data-action="job-walk-start" ${walk.phase === 'saving' ? 'disabled' : ''}><i class="ti ti-microphone"></i>Start recording</button>`}
        </div>
      </div>`, 'wb-modal-sm');
  }

  function start() {
    const walk = state.jobWalk;
    const job = walk ? jobById(walk.jobId) : null;
    if (!walk || !job) return;
    recorder = createRecorder({
      // Repainting the whole app twice a second to move a clock is wasteful; the timer element
      // is the only thing that changes, so it is written directly.
      onTick: (ms) => {
        walk.elapsed = ms;
        const el = document.querySelector('.jw-time');
        if (el) el.textContent = formatElapsed(ms);
      },
      onStop: (blob, elapsed) => { recorder = null; save(job, blob, elapsed); },
      onError: (error) => {
        recorder = null;
        walk.phase = 'idle';
        walk.error = error?.message || 'Recording failed.';
        render();
      },
    });
    recorder.start().then(() => {
      walk.phase = 'recording';
      walk.error = '';
      render();
    }).catch((error) => {
      recorder = null;
      walk.phase = 'idle';
      // The overwhelmingly common cause is a denied permission prompt, so name it.
      walk.error = error?.name === 'NotAllowedError'
        ? 'Microphone access was blocked. Allow it in your browser, then try again.'
        : (error?.message || 'Could not start recording.');
      render();
    });
  }

  const stop = () => { if (recorder) recorder.stop(); };
  const cancel = () => { if (recorder) { recorder.cancel(); recorder = null; } };

  async function save(job, blob, elapsed) {
    const walk = state.jobWalk;
    if (!blob) {
      if (walk) { walk.phase = 'idle'; walk.error = 'Nothing was recorded.'; render(); }
      return;
    }
    if (walk) { walk.phase = 'saving'; render(); }
    const name = voiceNoteName(new Date(), extensionFor(blob.type));
    const file = new File([blob], name, { type: blob.type || 'audio/webm' });
    try {
      await uploadJobFile(job, file, `Job walk · ${formatElapsed(elapsed)}`, 'Job walk', 'audio');
      state.modal = '';
      state.jobWalk = null;
      showToast('Job walk attached to this job.', isLiveSupabaseSession() ? 'live' : 'local', 'Jobs');
      render();
    } catch (error) {
      if (walk) { walk.phase = 'idle'; walk.error = error?.message || 'Could not attach the recording.'; }
      render();
    }
  }

  return { open, renderModal, start, stop, cancel };
}
