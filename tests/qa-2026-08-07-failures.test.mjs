import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { findDuplicateGroups } from '../src/data/dedupe.js';

// Regressions for the browser QA run of 2026-08-07.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
// Both underwriting fixes moved into the underwriter page when it stopped being carried in the
// entry bundle. The regression is in the code, not in the file it happens to sit in, so this
// follows it rather than being deleted -- the bug it pins is still perfectly reachable.
const underwriter = readFileSync(join(root, 'src', 'crm', 'underwriter-page.js'), 'utf8');

// --- #37 Underwriter: "saved" but reload showed zeros -------------------------------------
// The save was never the problem -- the row in production held every cost and the notes. The
// draft was built while the underwriting cases were still being fetched, so it was all zeros,
// and it was then cached under the contact id and served for the rest of the session.

function underwritingDraftFn() {
  const at = underwriter.indexOf('function underwritingDraftForContact(contact, companyId)');
  assert.notEqual(at, -1);
  return underwriter.slice(at, underwriter.indexOf('function ', at + 10));
}

test('an underwriting draft built before the cases arrive is not cached as the answer', () => {
  const fn = underwritingDraftFn();
  assert.match(fn, /const ready = ensureDomainLoaded\('underwriting'\);/);
  // Reuse only a draft that is the user's: hydrated from loaded cases, or typed into.
  assert.match(fn, /if \(matches && \(draft\.hydrated \|\| !ready\)\) return draft;/);
  assert.match(fn, /hydrated: ready,/);
});

test('typing owns the draft, so the rebuild cannot discard it', () => {
  // syncUnderwritingForm runs on every keystroke and replaces the draft wholesale. Without
  // the flag the rebuild above would fire on the next render and wipe what was being typed.
  const at = underwriter.indexOf('function syncUnderwritingForm(form)');
  assert.notEqual(at, -1);
  const fn = underwriter.slice(at, underwriter.indexOf('\n  }', at));
  assert.match(fn, /state\.underwritingDraft = \{ companyId: activeCompanyId\(\), \.\.\.input, hydrated: true \};/);
  const save = main.slice(main.indexOf('async function saveUnderwritingCase(form)'));
  assert.match(save.slice(0, save.indexOf('\nasync function ')), /state\.underwritingDraft = \{ companyId, \.\.\.input, hydrated: true \};/);
});

// --- #7 Password reset: the link signed the user in instead of asking for a new password ---
// requestPasswordReset redirects to /?auth=recovery, but recovery mode was only ever set from
// the PASSWORD_RECOVERY auth event. A code-exchange recovery link emits SIGNED_IN instead, so
// the event never fired and the user landed in the app with no new-password form.

test('recovery mode is taken from the URL the reset link lands on, not only the auth event', () => {
  assert.match(main, /function adoptRecoveryModeFromUrl\(\)/);
  const at = main.indexOf('function adoptRecoveryModeFromUrl()');
  const fn = main.slice(at, main.indexOf('\nfunction render()', at));
  assert.match(fn, /params\.get\('auth'\) !== 'recovery' && hash\.get\('type'\) !== 'recovery'/);
  assert.match(fn, /state\.authMode = 'recovery';/);
  // An already-running recovery must not be reset out from under the form.
  assert.match(fn, /if \(state\.authMode === 'recovery'\) return;/);
  // And it has to actually run on every render, before the signed-in redirect decides.
  assert.match(main, /state\.route = getRoute\(\);\s*adoptRecoveryModeFromUrl\(\);/);
});

test('the reset email still points at the URL that triggers recovery', () => {
  assert.match(main, /const redirectTo = `\$\{authOrigin\(\)\}\$\{appHref\('\/\?auth=recovery'\)\}`;/);
});

test('a signed-in user mid-recovery stays on the form instead of being sent to the dashboard', () => {
  assert.match(main, /state\.session\?\.auth === 'supabase' && state\.authMode !== 'recovery'/);
});

// --- #33 Duplicates: reported as unreliable for name and phone ----------------------------
// Could not be reproduced -- the matcher links on both. Pinned here so a real regression in
// this area is caught by a test rather than by another QA round.

test('duplicates link on email, phone and name, not email alone', () => {
  const byPhone = findDuplicateGroups([
    { id: 'a', name: 'John Smith', email: 'j@x.com', phone: '(555) 123-4567' },
    { id: 'b', name: 'J. Smith', email: 'other@x.com', phone: '555.123.4567' },
  ]);
  assert.equal(byPhone.length, 1, 'same phone in different formats must group');
  assert.ok(byPhone[0].reasons.includes('phone'));

  const byName = findDuplicateGroups([
    { id: 'a', name: 'John Smith', email: 'j@x.com', phone: '555-111-2222' },
    { id: 'b', name: 'john smith', email: 'other@x.com', phone: '555-333-4444' },
  ]);
  assert.equal(byName.length, 1, 'same name in different case must group');
  assert.ok(byName[0].reasons.includes('name'));

  const withCountryCode = findDuplicateGroups([
    { id: 'a', name: 'A One', email: 'a@x.com', phone: '+1 555 123 4567' },
    { id: 'b', name: 'B Two', email: 'b@x.com', phone: '555-123-4567' },
  ]);
  assert.equal(withCountryCode.length, 1, '+1 must not defeat the match');
});

test('a single-word name is still too weak to link strangers', () => {
  const groups = findDuplicateGroups([
    { id: 'a', name: 'John', email: '', phone: '' },
    { id: 'b', name: 'John', email: '', phone: '' },
  ]);
  assert.equal(groups.length, 0, 'two people called John are not the same person');
});
