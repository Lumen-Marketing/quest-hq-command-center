// The browser half of the intake passcode.
//
// Deliberately the same algorithm and the same parameters as api/_lib/intake.js, because the
// server is what VERIFIES what this produces. tests/wb-intake-passcode-parity.test.mjs runs
// both and fails if they ever disagree -- there is no way to notice a drift here from the
// application, since a mismatch just reads as "that passcode is not right".
//
// Why the client hashes at all: the row is inserted by the client under RLS, which is the only
// thing deciding whether somebody may create a link. Moving the hash server-side would mean an
// endpoint re-deciding that question, and a second copy of an authorization rule is how a
// permission quietly stops meaning anything.

export const PASSCODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const PASSCODE_LENGTH = 6;
export const PASSCODE_ITERATIONS = 150_000;

const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Uniform over the alphabet: `% alphabet.length` biases the first few characters. */
export function generatePasscode(length = PASSCODE_LENGTH) {
  const max = Math.floor(256 / PASSCODE_ALPHABET.length) * PASSCODE_ALPHABET.length;
  let out = '';
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) {
      if (byte >= max) continue;
      out += PASSCODE_ALPHABET[byte % PASSCODE_ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function makePasscodeSalt() {
  return hex(crypto.getRandomValues(new Uint8Array(16)));
}

export function normalizePasscode(input) {
  return String(input ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
}

export async function hashPasscode(passcode, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(normalizePasscode(passcode)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(String(salt || '')), iterations: PASSCODE_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return hex(bits);
}
