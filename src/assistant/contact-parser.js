// Rule-based contact parser — pulls a name, email and phone out of a plain
// instruction like "add contact John Doe, 602-555-1234, john@quest.com". No LLM.
// Pure and deterministic. The caller shows the result in a confirm card the user
// edits before the contact is created, so this errs toward a best guess.

const EMAIL_RE = /\b[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+\b/;
// A phone-ish run: starts and ends with a digit, >= 7 digits total.
const PHONE_RE = /\+?\d[\d\s().-]{5,}\d/;
const PREFIX_RE = /^\s*(please\s+)?(add|create|new|save)\s+(a\s+|an\s+)?(new\s+)?(contact|person|lead)\s*[:\-]?\s*/i;

function digitsOnly(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function cleanName(value) {
  const name = String(value || '')
    .replace(/[,;|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:.\-]+/, '')
    .replace(/[\s,;:.\-]+$/, '')
    // drop a dangling connective the phone/email used to follow
    .replace(/\b(email|e-mail|phone|cell|mobile|number|tel|at|is)\b\s*$/i, '')
    .trim();
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}

export function parseContactInstruction(instruction) {
  const raw = String(instruction || '').trim();
  let working = raw.replace(PREFIX_RE, '');

  let email = '';
  const emailMatch = working.match(EMAIL_RE);
  if (emailMatch) { email = emailMatch[0]; working = working.replace(emailMatch[0], ' '); }

  let phone = '';
  const phoneMatch = working.match(PHONE_RE);
  if (phoneMatch && digitsOnly(phoneMatch[0]).length >= 7) {
    phone = phoneMatch[0].trim();
    working = working.replace(phoneMatch[0], ' ');
  }

  let name = cleanName(working);
  if (!name && email) name = email.split('@')[0];
  if (!name) name = 'New contact';

  return {
    name,
    email,
    phone,
    found: { email: !!email, phone: !!phone },
    raw,
  };
}

// Whether an instruction is explicitly about creating a contact (vs a task).
export function looksLikeContactInstruction(instruction) {
  return PREFIX_RE.test(String(instruction || ''));
}
