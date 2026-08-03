import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clearableCount, clearedActivity, logStamp, matchBuilderWorkspace } from '../src/workspace/activity-log.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const log = readFileSync(new URL('../src/workspace/activity-log.js', import.meta.url), 'utf8');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

// --- the model ------------------------------------------------------------------------

test('clearing leaves a trace of itself', () => {
  // The whole point. An empty log and a log that was never written look the same, so the
  // clear has to say it happened.
  const next = clearedActivity({ activity: [{ id: '1' }, { id: '2' }, { id: '3' }] }, {
    actorName: 'Rom', at: '2026-08-03T10:00:00.000Z', id: 'new',
  });
  assert.equal(next.length, 1);
  assert.match(next[0].text, /Rom cleared the activity log \(3 entries removed\)/);
  assert.equal(next[0].removed, 3);
  assert.equal(next[0].ts, '2026-08-03T10:00:00.000Z');
});

test('one entry reads as "entry", not "1 entries"', () => {
  assert.match(clearedActivity({ activity: [{ id: '1' }] }, { actorName: 'Rom', at: 'x', id: 'y' })[0].text, /\(1 entry removed\)/);
});

test('clearing an already-empty log is harmless and still honest', () => {
  const next = clearedActivity({}, { actorName: 'Rom', at: 'x', id: 'y' });
  assert.equal(next.length, 1);
  assert.equal(next[0].removed, 0);
});

test('the original array is not mutated, so a failed save cannot half-erase it', () => {
  const workspace = { activity: [{ id: '1' }, { id: '2' }] };
  clearedActivity(workspace, { actorName: 'Rom', at: 'x', id: 'y' });
  assert.equal(workspace.activity.length, 2);
});

test('the count survives a workspace with no log at all', () => {
  assert.equal(clearableCount(undefined), 0);
  assert.equal(clearableCount({}), 0);
  assert.equal(clearableCount({ activity: 'nonsense' }), 0);
  assert.equal(clearableCount({ activity: [1, 2] }), 2);
});

// --- what it must not reach -------------------------------------------------------------

test('the feed and the audit trail are out of scope, in code and in writing', () => {
  const body = fn('wbClearWorkspaceActivity');
  assert.ok(!/\.feed\b/.test(body), 'clearing the log must not touch posts and files');
  assert.ok(!/audit_events|logAudit|recordAudit/.test(body), 'the company audit trail is not a workspace admin\'s to erase');
  assert.match(log, /audit_events\s+KEPT/, 'the module says what it deliberately leaves alone');
  assert.match(log, /workspace\.feed\s+KEPT/);
});

test('only workspace.activity is replaced', () => {
  assert.match(fn('wbClearWorkspaceActivity'), /workspace\.activity = clearedActivity\(workspace, \{/);
});

// --- the password gate ------------------------------------------------------------------

test('a live session must re-enter its password', () => {
  const body = fn('wbClearWorkspaceActivity');
  assert.match(body, /if \(isLiveSupabaseSession\(\)\) \{/);
  assert.match(body, /client\.auth\.signInWithPassword\(\{ email, password \}\)/);
  assert.match(body, /if \(reauth\.error\) \{ m\.error = 'Incorrect password\.'/);
  // Refused before anything is written.
  assert.ok(
    body.indexOf('reauth.error') < body.indexOf('workspace.activity = clearedActivity'),
    'the password check must gate the clear, not follow it',
  );
});

test('an empty password is refused without a round trip', () => {
  assert.match(fn('wbClearWorkspaceActivity'), /if \(!password\) \{ m\.error = 'Enter your password to confirm\.'/);
});

test('the permission is checked too, not just the password', () => {
  // A password proves who you are, not that you are allowed.
  const body = fn('wbClearWorkspaceActivity');
  assert.match(body, /if \(!can\('workspaces\.manage', m\.companyId\)\)/);
  assert.ok(
    body.indexOf("can('workspaces.manage'") < body.indexOf('isLiveSupabaseSession()'),
    'the cheap check comes first',
  );
});

test('the button is only rendered for someone who may use it', () => {
  assert.match(main, /\$\{editing && can\('workspaces\.manage', m\.companyId\) \? `/);
  assert.match(main, /data-wb-clear-activity \$\{clearableCount\(editing\) \? '' : 'disabled'\}/);
});

// --- the dialog ---------------------------------------------------------------------------

test('the confirm dialog states the count before you agree to it', () => {
  const modal = main.slice(main.indexOf("if (m.kind === 'clear-activity') {"));
  const body = modal.slice(0, modal.indexOf("if (m.kind === 'app-chooser')"));
  assert.match(body, /const count = clearableCount\(ws\);/);
  assert.match(body, /It cannot be undone/);
  assert.match(body, /One entry is kept/);
  assert.match(body, /Posts and files in the feed are not touched/);
  // Local demo sessions have no password to check, so they are not asked for one.
  assert.match(body, /\$\{isLiveSupabaseSession\(\) \? `<div class="wb-field">\s*\n\s*<label for="wbClearPw">Confirm your password<\/label>/);
});

test('opening the dialog keeps the workspace edits typed behind it', () => {
  // The button lives inside the workspace modal. Losing a rename because you looked at the
  // clear dialog and cancelled would be its own bug.
  const handler = main.slice(main.indexOf('if (clearActivity) clearActivity.onclick'));
  const body = handler.slice(0, handler.indexOf('const confirmClear'));
  assert.match(body, /wbCollectModalDraft\(\);/);
  assert.match(body, /returnTo: \{ \.\.\.m \}/);
  assert.match(fn('wbClearWorkspaceActivity'), /state\.builderModal = m\.returnTo \? \{ \.\.\.m\.returnTo \} : null;/);
});

test('the clear is saved, not just held in memory', () => {
  assert.match(fn('wbClearWorkspaceActivity'), /wbSave\(m\.companyId\);/);
});

// --- reaching it from the sidebar workspace dialog ---------------------------------------

test('a sidebar workspace is matched to its App Builder twin by name only when unambiguous', () => {
  // Two separate records with no id linking them; name is the only bridge. An ambiguous
  // match must offer nothing rather than clear a log nobody pointed at.
  const list = [{ id: 'a', name: 'Main' }, { id: 'b', name: 'Field crew' }];
  assert.equal(matchBuilderWorkspace(list, 'Main').id, 'a');
  assert.equal(matchBuilderWorkspace(list, '  main  ').id, 'a', 'case and padding should not matter');
  assert.equal(matchBuilderWorkspace(list, 'Ops'), null);
  assert.equal(matchBuilderWorkspace([{ id: 'a', name: 'Main' }, { id: 'b', name: 'main' }], 'Main'), null, 'two matches is no match');
  assert.equal(matchBuilderWorkspace(list, ''), null);
  assert.equal(matchBuilderWorkspace(undefined, 'Main'), null);
});

test('Configure workspace offers the clear only when there is a log to clear', () => {
  const modal = main.slice(main.indexOf('function renderOperationalWorkspaceEditModal('));
  const body = modal.slice(0, modal.indexOf('\n}\n'));
  assert.match(body, /const builderWs = canManage\s*\n\s*\? matchBuilderWorkspace\(/, 'no match, no button, and no button without permission');
  assert.match(body, /data-action="open-clear-workspace-activity"/);
  assert.match(body, /\$\{clearCount \? '' : 'disabled'\}/);
});

test('the confirm opens over the dialog rather than replacing it', () => {
  // renderActiveModal checks state.builderModal before state.modal, so the Configure
  // workspace dialog stays mounted underneath and cancelling lands back on it.
  assert.match(main, /if \(state\.builderModal\) return renderWorkspaceBuilderModal\(\);/);
  const handler = main.slice(main.indexOf("if (action === 'open-clear-workspace-activity')"));
  assert.match(handler.slice(0, 600), /openWbModal\(\{ kind: 'clear-activity'/);
  assert.ok(!/state\.modal = ''/.test(handler.slice(0, 600)), 'the dialog underneath must not be torn down');
});

// --- the command palette must not sit behind it -------------------------------------------

test('the palette closes rather than lingering behind a dialog', () => {
  // It is painted outside renderActiveModal, so nothing else reconciles the two. Dozens of
  // paths set state.modal; the render path catches all of them.
  assert.match(main, /if \(state\.commandPalette\.open && \(state\.modal \|\| state\.builderModal\)\) resetCommandPalette\(\);/);
  const at = main.indexOf('resetCommandPalette();');
  assert.ok(at < main.indexOf('app.innerHTML = shellTemplate('), 'reconcile before painting');
});

test('a dialog owns the keyboard, not the palette', () => {
  // This is what made the password field impossible to type into: the palette answered the
  // keydown first and returned, so the dialog never saw a keystroke.
  assert.match(main, /if \(state\.commandPalette\.open && !\(state\.builderModal \|\| state\.modal\) && commandPaletteKeydown\(event\)\) return;/);
});

test('the palette refuses to open over a dialog at all', () => {
  const body = fn('openCommandPalette');
  assert.match(body, /if \(state\.modal \|\| state\.builderModal\) return;/);
  assert.ok(
    body.indexOf('state.modal || state.builderModal') < body.indexOf('state.commandPalette = { open: true'),
    'refuse before opening',
  );
});

test('the password field names the account, so managers do not fill the topbar search', () => {
  // The trigger for the whole bug: a lone current-password field with no username sibling.
  const modal = main.slice(main.indexOf("if (m.kind === 'clear-activity') {"));
  const body = modal.slice(0, modal.indexOf("if (m.kind === 'app-chooser')"));
  assert.match(body, /autocomplete="username"/);
  assert.match(body, /readonly/);
  assert.ok(!/hidden/.test(body.slice(body.indexOf('autocomplete="username"') - 260, body.indexOf('autocomplete="username"') + 60)), 'display:none username fields get skipped');
  assert.ok(
    body.indexOf('autocomplete="username"') < body.indexOf('autocomplete="current-password"'),
    'the username comes first, as managers expect',
  );
});

// --- timestamps ---------------------------------------------------------------------------

test('a log entry carries the actual date and time, not only "2h ago"', () => {
  // "1h ago" is not evidence: it drifts with every render, and two entries an hour apart can
  // both say it.
  const stamp = logStamp('2026-08-03T10:52:00.000Z');
  assert.match(stamp, /Aug 3, 2026/);
  assert.match(stamp, /\d{1,2}:\d{2}\s?(AM|PM)/);
  assert.match(stamp, / · /);
});

test('the year is included, because the log has no time limit', () => {
  // 60 entries deep with no age cap, so "Aug 3" read in February is a question.
  assert.match(logStamp('2024-01-09T23:05:00.000Z'), /2024/);
});

test('a missing or broken stamp degrades instead of printing Invalid Date', () => {
  assert.equal(logStamp(''), '');
  assert.equal(logStamp(undefined), '');
  assert.equal(logStamp('not a date'), '');
});

test('the row keeps the relative time and marks up the exact instant', () => {
  const row = fn('wbActivityRow');
  assert.match(row, /<time datetime="\$\{h\(ev\.ts\)\}">/, 'machine-readable value is the instant, not the rounded label');
  assert.match(row, /wb-act-rel/);
  assert.match(row, /: h\(wbTimeAgo\(ev\.ts\) \|\| ''\)/, 'an unparseable stamp still falls back');
});
