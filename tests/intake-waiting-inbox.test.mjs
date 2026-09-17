// "a submitted form notifies nobody" -- the second half of the fix.
//
// The alert (api/_lib/intake-db.js, covered in wb-intake-api.test.mjs) reaches one person. This is
// what reaches everybody else: a count on the app in the strip, and one list of everything waiting
// on the workspace home, instead of a per-app panel somebody had to open on purpose.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('../src/main.js');
const manage = read('../src/intake/manage.js');
const styles = read('../src/styles.css');

const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.ok(at > -1, `${name} is defined`);
  return main.slice(at, main.indexOf('\nfunction ', at + 1));
};

test('waiting submissions are read once per company, with the member own permission', () => {
  const loader = fn('ensureIntakePendingLoaded');
  assert.match(loader, /if \(state\.wbIntakePending\[key\]\) return;/, 'read once, not on every paint');
  assert.match(loader, /from\('wb_intake_submissions'\)/);
  assert.match(loader, /\.eq\('status', 'pending'\)/);
  assert.match(loader, /\.eq\('company_id', key\)/, 'this company only');
  assert.match(loader, /\.limit\(50\)/, 'bounded');
  // RLS decides what comes back. A refusal must leave the page alone, not break it.
  assert.match(loader, /if \(result\.error\) return;/);
  assert.match(main, /wbIntakePending: \{\},/, 'the state field exists, or the first read throws');
});

test('it loads with the workspace, and only there', () => {
  assert.match(main, /if \(state\.route\?\.section === 'workspaces'\) \{ wbMountTopbar\(\); ensureIntakePendingLoaded\(companyId\); \}/);
});

test('an app carries the count of what is waiting on it', () => {
  const header = fn('wbWorkspaceHeader');
  assert.match(header, /const waiting = wbIntakePendingFor\(companyId, a\.id\);/);
  assert.match(header, /wb-topbar-waiting/);
  assert.match(header, /waiting > 9 \? '9\+' : waiting/, 'a big number cannot burst the tab');
  assert.match(header, /waiting \? ` - \$\{waiting\} waiting to be added` : ''/, 'and it is in the tooltip too');
  // The all-apps grid clones these tabs, so the count follows into it for free.
  const picker = read('../src/workspace/all-apps.js');
  assert.match(picker, /tab\.cloneNode\(true\)/);
});

test('the workspace home lists them, above the feed, for somebody who can act', () => {
  const waiting = fn('wbIntakeWaiting');
  assert.match(waiting, /if \(!can\('workspaces\.manage', companyId\)\) return '';/);
  assert.match(waiting, /if \(!rows\.length\) return '';/, 'an empty queue leaves the page as it was');
  assert.match(waiting, /data-wb-intake-review="/);
  assert.match(waiting, /rows\.slice\(0, 6\)/);
  assert.match(waiting, /and \$\{rows\.length - 6\} more/, 'a long queue says how much it is not showing');
  assert.match(main, /wbIntakeWaiting\(companyId, workspace\)\}\$\{composer\}/, 'above the composer, not below the feed');
  assert.match(main, /bind\('\[data-wb-intake-review\]', \(el\) => openIntakeManage\(/, 'Review opens the panel that accepts it');
});

test('who sent it is read from the answers, as the review list reads it', () => {
  const sender = fn('wbIntakeSender');
  assert.match(sender, /row\.submitted_name/, 'an older submission keeps the name it came with');
  assert.match(sender, /f\.type === 'text'/);
  assert.match(sender, /'Someone'/);
});

test('accepting or discarding one clears the count behind it', () => {
  // Both lists read the same rows. Without this the badge keeps a number that is no longer true
  // until the next full load.
  assert.equal((manage.match(/ctx\.onSubmissionsChanged\?\.\(\)/g) || []).length, 2, 'accept and discard both report');
  assert.match(main, /onSubmissionsChanged: \(\) => wbIntakePendingReload\(companyId\),/);
  assert.match(fn('wbIntakePendingReload'), /delete state\.wbIntakePending\[canonicalCompanyId\(companyId\)\];/);
});

test('the badge and the list are styled by the sheet every page already has', () => {
  // The strip and the workspace home are drawn before the lazy builder stylesheet arrives; styling
  // them from that sheet would show an unstyled count first.
  for (const rule of ['.wb-topbar-waiting {', '.wb-waiting {', '.wb-waiting-row {']) {
    assert.ok(styles.includes(rule), `${rule} belongs in the entry stylesheet`);
  }
  const badge = styles.slice(styles.indexOf('.wb-topbar-waiting {'), styles.indexOf('}', styles.indexOf('.wb-topbar-waiting {')));
  assert.match(badge, /position: absolute/);
  // Anchored on the app's icon, which is the positioned element it sits on.
  assert.ok(styles.includes('.wb-topbar-ic { position: relative; }'));
});
