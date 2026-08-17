// Public intake: what a link exposes, and what a stranger is allowed to send back.
//
// Pure except for the crypto. No database access, no request handling -- the two routes do
// that -- so the field projection and the value validation can be tested without a server.
//
// This file is the ONLY place the rules live. The public page renders whatever `publicFields`
// returns and validates nothing of consequence itself, so there is no second copy of the rules
// on the client to drift away from these.

import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

// PBKDF2-SHA256 rather than scrypt, for one reason: the browser can compute it too.
//
// A link is CREATED by a signed-in member, and the row that carries it is guarded by RLS
// (workspaces.manage). If the hash could only be produced on the server, creating a link would
// need an authenticated endpoint, and that endpoint would have to re-decide who is allowed to
// make one -- a second copy of an authorization rule the database already enforces, which is
// exactly how public.clients ended up writable by any member. With PBKDF2 the client derives
// the hash through SubtleCrypto and inserts the row itself, so RLS stays the only judge.
export const PASSCODE_ITERATIONS = 150_000;

// ---- secrets ---------------------------------------------------------------------------------

// No 0/O/1/I/L. A passcode is read off a screen and typed into a phone by somebody who did not
// choose it, and those five characters are where that goes wrong.
export const PASSCODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const PASSCODE_LENGTH = 6;

/** Uniform over the alphabet: `% alphabet.length` on a random byte is not, and biases the
 *  first few characters. Rejection sampling costs nothing at this size. */
export function generatePasscode(length = PASSCODE_LENGTH) {
  const max = Math.floor(256 / PASSCODE_ALPHABET.length) * PASSCODE_ALPHABET.length;
  let out = '';
  while (out.length < length) {
    for (const byte of randomBytes(length * 2)) {
      if (byte >= max) continue;
      out += PASSCODE_ALPHABET[byte % PASSCODE_ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

/** The secret in a public link. 32 bytes, base64url, so it is not guessable and survives
 *  being pasted into a text message without escaping. */
export function generateToken() {
  return randomBytes(32).toString('base64url');
}

/** Typed by a human: case and spacing are not part of the secret. */
export function normalizePasscode(input) {
  return String(input ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
}

export function makePasscodeSalt() {
  return randomBytes(16).toString('hex');
}

export function hashPasscode(passcode, salt) {
  return pbkdf2Sync(normalizePasscode(passcode), String(salt || ''), PASSCODE_ITERATIONS, 32, 'sha256').toString('hex');
}

/** Constant time, and false rather than a throw on a malformed stored hash -- a corrupt row
 *  must read as "wrong passcode", never as "let them in" or a 500. */
export function verifyPasscode(passcode, salt, expectedHex) {
  const expected = Buffer.from(String(expectedHex || ''), 'hex');
  if (!expected.length) return false;
  const actual = Buffer.from(hashPasscode(passcode, salt), 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

// ---- which fields a stranger may fill ---------------------------------------------------------

// Everything else in the palette is excluded, each for its own reason:
//
//   calculation, rollup, autonumber, created_time, updated_time  -- automatic. A value written
//     to one of these is discarded on the next render, so offering the box is a lie.
//   button        -- an action, not a value.
//   relationship  -- points at records in another app the visitor cannot see or be shown.
//   company_contact -- would let an anonymous stranger mint rows in the COMPANY directory,
//     which is shared by every workspace. The intake carries name/email/phone as plain fields
//     instead, and whoever accepts the submission decides whether a contact is created.
//   file, image   -- uploads need a storage path and a virus/abuse story of their own. The
//     Forms module has one (public-form-file-upload); this deliberately does not yet.
//   sheet, form   -- a document editor, not a form control.
//   progress      -- derived from a checklist when sourced, so a typed value is overwritten.
//   checklist     -- steps are the app owner's, not a thing to hand a stranger.
//   user          -- names a workspace member, who a stranger must not be able to enumerate.
export const INTAKE_FIELD_TYPES = new Set([
  'text', 'textarea', 'number', 'money', 'date', 'category', 'status',
  'tags', 'email', 'phone', 'location', 'checkbox', 'duration', 'rating',
]);

const OPTION_TYPES = new Set(['category', 'status', 'tags']);

/**
 * The app's fields, reduced to what the public page needs to draw them.
 *
 * Deliberately a projection rather than the field objects: a field's config carries copy rules,
 * sources and other internals that a stranger has no business receiving. Only the label, the
 * type, the placeholder and -- for a dropdown -- the option ids and their labels cross.
 */
export function publicFields(app, fieldIds) {
  const wanted = Array.isArray(fieldIds) && fieldIds.length ? new Set(fieldIds.map(String)) : null;
  return (Array.isArray(app?.fields) ? app.fields : [])
    .filter((field) => INTAKE_FIELD_TYPES.has(field?.type) && !field?.hidden)
    .filter((field) => !wanted || wanted.has(String(field.id)))
    .map((field) => {
      const config = field.config && typeof field.config === 'object' ? field.config : {};
      const out = {
        id: String(field.id),
        label: String(field.label || 'Field'),
        type: field.type,
        required: !!field.required,
        placeholder: String(config.placeholder || '').slice(0, 200),
        unit: String(config.unit || '').slice(0, 24),
        currency: String(config.currency || '').slice(0, 8),
      };
      if (OPTION_TYPES.has(field.type)) {
        out.options = (Array.isArray(config.options) ? config.options : [])
          .slice(0, 200)
          .map((option) => ({
            id: String(option?.id || ''),
            label: String(option?.label || ''),
            color: /^#[0-9a-f]{3,8}$/i.test(String(option?.color || '')) ? String(option.color) : '',
          }))
          .filter((option) => option.id && option.label);
      }
      return out;
    });
}

// ---- what comes back --------------------------------------------------------------------------

export class IntakeValueError extends Error {}

const asNumber = (value) => {
  const n = Number(String(value).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : null;
};

function cleanOne(field, raw) {
  switch (field.type) {
    case 'number':
    case 'money':
    case 'duration': {
      if (raw === '' || raw === null || raw === undefined) return '';
      const n = asNumber(raw);
      if (n === null) throw new IntakeValueError(`"${field.label}" must be a number.`);
      return n;
    }
    case 'rating': {
      if (raw === '' || raw === null || raw === undefined) return '';
      const n = asNumber(raw);
      if (n === null || n < 0 || n > 5) throw new IntakeValueError(`"${field.label}" must be between 0 and 5.`);
      return Math.round(n);
    }
    case 'checkbox':
      return raw === true || raw === 'true' || raw === 'on' || raw === 1 || raw === '1';
    case 'date': {
      const text = String(raw ?? '').trim();
      if (!text) return '';
      // The field stores a day. Anything the browser's date input can produce matches this;
      // anything else is somebody posting by hand.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
        throw new IntakeValueError(`"${field.label}" must be a date.`);
      }
      return text;
    }
    case 'email': {
      const text = String(raw ?? '').trim().slice(0, 240);
      if (text && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(text)) {
        throw new IntakeValueError(`"${field.label}" must be an email address.`);
      }
      return text;
    }
    case 'category':
    case 'status': {
      const text = String(raw ?? '').trim();
      if (!text) return '';
      // An option ID, matched against this field's own list. A stranger cannot mint an option
      // that everybody in the workspace would then be stuck with.
      if (!(field.options || []).some((option) => option.id === text)) {
        throw new IntakeValueError(`"${field.label}" has a choice that does not exist.`);
      }
      return text;
    }
    case 'tags': {
      const list = Array.isArray(raw) ? raw : (raw === '' || raw == null ? [] : [raw]);
      if (list.length > 50) throw new IntakeValueError(`"${field.label}" has too many choices.`);
      return list.map((item) => {
        const text = String(item ?? '').trim();
        if (!(field.options || []).some((option) => option.id === text)) {
          throw new IntakeValueError(`"${field.label}" has a choice that does not exist.`);
        }
        return text;
      });
    }
    // Trimmed, so that a required field cannot be satisfied with a space. Only the ends go:
    // the line breaks inside a textarea are the answer.
    case 'textarea':
      return String(raw ?? '').trim().slice(0, 10000);
    default:
      return String(raw ?? '').trim().slice(0, 1000);
  }
}

const isEmpty = (value) => value === '' || value === undefined || value === null
  || (Array.isArray(value) && value.length === 0);

/**
 * Validate a submission against the fields the link actually exposes.
 *
 * A key naming a field the link does not expose is a hard error rather than something to drop
 * quietly: it means the caller is not the page we served, and the interesting case is somebody
 * probing for fields that were deliberately withheld.
 */
export function cleanIntakeValues(input, fields) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const byId = new Map(fields.map((field) => [field.id, field]));
  if (Object.keys(source).length > 300) throw new IntakeValueError('Too many answers.');

  const values = {};
  for (const [key, raw] of Object.entries(source)) {
    const field = byId.get(String(key));
    if (!field) throw new IntakeValueError('This form does not have that field.');
    const value = cleanOne(field, raw);
    if (!isEmpty(value) || value === false) values[field.id] = value;
  }
  for (const field of fields) {
    if (field.required && isEmpty(values[field.id])) {
      throw new IntakeValueError(`"${field.label}" is required.`);
    }
  }
  return values;
}

// ---- link state ------------------------------------------------------------------------------

/** Why a link cannot be opened right now, or '' when it can. One place, so `open` and `submit`
 *  can never disagree about whether a link is usable. */
export function linkUnavailableReason(link, now = new Date()) {
  if (!link) return 'This link was not found.';
  if (link.status !== 'active') return 'This link has been paused.';
  if (link.expires_at && new Date(link.expires_at) <= now) return 'This link has expired.';
  if (link.max_submissions != null && Number(link.submission_count || 0) >= Number(link.max_submissions)) {
    return 'This link has already been filled in.';
  }
  return '';
}

export function lockedReason(link, now = new Date()) {
  if (link?.locked_until && new Date(link.locked_until) > now) {
    return 'Too many incorrect passcodes. Try again later.';
  }
  return '';
}

export const MAX_PASSCODE_ATTEMPTS = 8;
export const LOCKOUT_MINUTES = 15;
