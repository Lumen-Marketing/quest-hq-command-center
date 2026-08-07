import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Second pass over the consolidated QA fix list.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
const board = readFileSync(join(root, 'src', 'crm', 'deal-board.js'), 'utf8');

// The deep QA measured 68 extra notification rows and 40 extra audit rows in 24 hours, and
// one access change producing eight identical notifications. Three causes: repeat submits
// (fixed by the busy button), the RPC writing an event when nothing changed, and the client
// announcing every save whether or not anything moved.

test('an access save that changed nothing announces nothing', () => {
  const fn = main.slice(main.indexOf('async function persistUserAccess'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /const identityChanged = previousMembership\?\.role !== membership\.role/);
  assert.match(body, /\|\| previousMembership\?\.status !== membership\.status;/);
  assert.match(body, /if \(identityChanged\) \{/);
  // Re-saving to adjust workspace assignments must not notify anybody.
  assert.ok(
    body.indexOf('if (identityChanged)') < body.indexOf("notifyLocalEvent('access.role'"),
    'the notification has to sit inside the guard',
  );
});

test('the audit row is written once, by the procedure that made the change', () => {
  const fn = main.slice(main.indexOf('async function persistUserAccess'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  // update_company_member_access already writes one inside the same statement. Recording a
  // second here is what produced two audit entries for every access save.
  assert.match(body, /if \(!isLiveSupabaseSession\(\)\) \{\s*[\r\n]+\s*recordAuditEvent\(/);
});

test('a quote can be deleted from the board, not only from its edit dialog', () => {
  const fn = board.slice(board.indexOf('function dealCard(deal)'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /const canDelete = can\('crm\.manage', deal\.company_id\);/);
  assert.match(body, /data-action="delete-deal" data-deal-id="\$\{h\(deal\.id\)\}"/);
  assert.match(body, /aria-label="Delete \$\{h\(deal\.name\)\}"/, 'an icon button needs a name');
  // The action already existed; only the affordance was missing.
  assert.match(main, /if \(action === 'delete-deal'\) \{/);
  assert.match(main, /openRecycleDeleteModal\(\{ type: 'deal', id: node\.dataset\.dealId \}\)/);
});

test('the board delete is reachable without a hover', () => {
  // It is revealed on hover on a pointer device, which does not exist on a phone.
  assert.match(styles, /@media \(hover: none\) \{ \.pipe-card-delete \{ opacity: 1; \} \}/);
  assert.match(styles, /\.pipe-card-delete:focus-visible \{ opacity: 1; \}|\.pipe-card-delete:focus-visible/);
});

// "When you change the theme of the side menu then color under theme is not working."
// The accent picker sits directly under the theme picker, but a preset theme returned its
// own baked-in highlight verbatim, so the accent only ever affected the Custom theme.

test('the accent applies to preset sidebar themes, not just Custom', () => {
  const fn = main.slice(main.indexOf('function sidebarThemeVars(settings)'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /const preset = \(SIDEBAR_THEMES\.find/);
  assert.match(body, /const accent = settings\.sidebarAccent;/);
  assert.match(body, /\.\.\.preset,/, 'the preset palette is kept and only the accent is layered on');
  assert.match(body, /activeBg: hexToRgba\(accent, preset\.dark \? 0\.18 : 0\.13\)/);
  assert.match(body, /activeText: preset\.dark \? accent : `color-mix\(in srgb, \$\{accent\} 65%, #000\)`/);
  // Returning the preset untouched is the bug.
  assert.ok(!/return \(SIDEBAR_THEMES\.find\(\(\[key\]\) => key === id\) \|\| \[\]\)\[2\] \|\| null;/.test(body));
});

test('a theme with no accent set still renders', () => {
  const fn = main.slice(main.indexOf('function sidebarThemeVars(settings)'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(!preset\) return null;/, "'default' has no palette and must stay on the stylesheet");
  assert.match(body, /if \(!accent\) return preset;/);
});

test('an accent is darkened for the one light sidebar', () => {
  // A mid-tone accent on near-white fails contrast; the Light preset shipped #c2410c rather
  // than the raw brand orange for exactly this reason. CSS does the mixing.
  const fn = main.slice(main.indexOf('function sidebarThemeVars(settings)'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /color-mix\(in srgb, \$\{accent\} 65%, #000\)/);
});
