// The two sounds the app makes: a notification, and an alarm.
//
// "Add a notification sound on the system, add an alarm sound on the system."
//
// Synthesised rather than shipped. A pair of mp3s is a hundred kilobytes and two more requests
// for something that is four notes long; WebAudio draws them from nothing, they are the same on
// every machine, and they can be tuned by changing a number rather than re-recording.
//
// Fetched on demand, and only ever after a user gesture has unlocked audio -- a browser will not
// let a page make noise before somebody has interacted with it, which is a rule worth keeping
// rather than working around.

let context = null;

function audio() {
  if (context) return context;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

/**
 * One note.
 *
 * Attack and release are deliberate: a bare gain switch clicks, because the waveform is cut
 * mid-cycle. The short ramps at each end are what make it a tone rather than a pop.
 */
function note(when, hz, seconds, volume, shape = 'sine') {
  const ctx = audio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = shape;
  osc.frequency.setValueAtTime(hz, when);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(volume, when + 0.012);
  gain.gain.setValueAtTime(volume, when + seconds - 0.05);
  gain.gain.linearRampToValueAtTime(0, when + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + seconds + 0.02);
}

/** A short rising pair. Meant to be noticed once and then forgotten. */
export function playNotification({ volume = 0.16 } = {}) {
  const ctx = audio();
  if (!ctx) return false;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const at = ctx.currentTime + 0.01;
  note(at, 880, 0.11, volume);          // A5
  note(at + 0.11, 1318.5, 0.16, volume); // E6
  return true;
}

/**
 * An alarm: the same two notes, low to high, repeated.
 *
 * Deliberately more insistent than the notification and deliberately finite -- a sound with no
 * end is one people learn to turn off entirely, and then it never works again.
 */
export function playAlarm({ volume = 0.2, rounds = 3 } = {}) {
  const ctx = audio();
  if (!ctx) return false;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const start = ctx.currentTime + 0.01;
  for (let round = 0; round < Math.max(1, Math.min(8, rounds)); round += 1) {
    const at = start + round * 0.46;
    note(at, 660, 0.17, volume, 'square');
    note(at + 0.2, 990, 0.2, volume, 'square');
  }
  return true;
}

export const SOUNDS = { notification: playNotification, alarm: playAlarm };

/** Play one by name, ignoring anything the browser will not allow. */
export function play(name, options) {
  try {
    return (SOUNDS[name] || SOUNDS.notification)(options) || false;
  } catch {
    return false;
  }
}
