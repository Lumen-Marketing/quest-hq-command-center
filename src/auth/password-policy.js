export const PASSWORD_MIN_LENGTH = 12;

// Supabase's own leaked-password protection is Pro-plan only, so we do the same
// check ourselves against the public Pwned Passwords API.
export const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/';

export function passwordRequirements() {
  return [
    `At least ${PASSWORD_MIN_LENGTH} characters`,
    'One uppercase letter',
    'One lowercase letter',
    'One number',
    'Not found in a known data breach',
  ];
}

export function passwordPolicy(value) {
  const password = String(value || '');
  const checks = [
    [password.length >= PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`],
    [/[A-Z]/.test(password), 'Add an uppercase letter.'],
    [/[a-z]/.test(password), 'Add a lowercase letter.'],
    [/\d/.test(password), 'Add a number.'],
  ];
  const issues = checks.filter(([valid]) => !valid).map(([, message]) => message);
  return { valid: issues.length === 0, issues };
}

async function sha1Hex(text) {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * How many times this password appears in the Pwned Passwords corpus. 0 = not breached.
 *
 * k-anonymity: only the first 5 hex chars of the SHA-1 hash are sent. The API returns
 * every suffix sharing that prefix (~800 of them) and we match locally, so the password
 * — and even its full hash — never leaves the browser, and HIBP cannot tell which of
 * the candidates we were asking about.
 *
 * `Add-Padding` makes every response a uniform size, so an observer watching response
 * lengths cannot infer anything either. Padded filler entries carry a count of 0 and so
 * are naturally ignored by the `> 0` test at the call site.
 *
 * Throws on network/HTTP failure — callers decide the failure posture.
 */
export async function passwordBreachCount(password, fetchImpl = globalThis.fetch) {
  const hash = await sha1Hex(String(password || ''));
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetchImpl(`${HIBP_RANGE_URL}${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!response.ok) throw new Error(`Pwned Passwords responded ${response.status}`);

  for (const line of (await response.text()).split('\n')) {
    const [candidate, count] = line.trim().split(':');
    if (candidate === suffix) return Number(count) || 0;
  }
  return 0;
}

/**
 * Full policy: the local rules, plus the breach check when the local rules pass.
 *
 * Fails OPEN. If Pwned Passwords is unreachable we accept a password that satisfies the
 * local rules rather than locking people out of signup because a third-party API is down;
 * `checked: false` records that we could not verify. This is the same posture Supabase
 * takes. The local rules are never skipped.
 */
export async function passwordPolicyAsync(value, { fetchImpl } = {}) {
  const base = passwordPolicy(value);
  if (!base.valid) return { ...base, breached: false, checked: false };

  try {
    const breachCount = await passwordBreachCount(value, fetchImpl);
    if (breachCount > 0) {
      return {
        valid: false,
        issues: ['This password has appeared in a known data breach. Please choose a different one.'],
        breached: true,
        checked: true,
        breachCount,
      };
    }
    return { valid: true, issues: [], breached: false, checked: true, breachCount: 0 };
  } catch {
    return { ...base, breached: false, checked: false };
  }
}
