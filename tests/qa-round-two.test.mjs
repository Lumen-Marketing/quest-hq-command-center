import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Second pass over the consolidated QA fix list.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const styles = (readFileSync(join(root, 'src', 'styles.css'), 'utf8') + '\n' + readFileSync(join(root, 'src', 'workspace', 'builder.css'), 'utf8'));
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

// "I cant link jobs and even if i changed the scope the private i can still see the event."
// The second half is not a bug -- private is enforced identically in the client and in the
// calendar_events RLS policy, and the tester is an Owner, who holds calendar.view_team. The
// first half is: the job list is fetched on demand and the calendar never asked for it.

test('the calendar waits for jobs before it renders', () => {
  // The page is a fetched module now; the copy left in main.js is only the loader shim.
  const page = readFileSync(join(root, 'src', 'ops', 'calendar-page.js'), 'utf8');
  const fn = page.slice(page.indexOf('function renderCalendarPage(route, companyId)'));
  const body = fn.slice(0, fn.indexOf('\n    return `'));
  assert.match(body, /if \(!ensureDomainLoaded\('production'\)\) return questLoader\('Loading calendar'\);/);
  // Open Calendar without visiting Jobs first and the dropdown held only "No linked job".
  assert.ok(
    body.indexOf("ensureDomainLoaded('production')") < body.indexOf('filteredCalendarItems'),
    'the jobs have to be there before anything reads them',
  );
});

test('the linked-job control offers the company jobs', () => {
  assert.match(main, /selectField\('Linked job', 'linked_job_id', jobValue, \[\['', 'No linked job'\]\]\.concat\(companyJobs\(companyId\)/);
});

test('saving a calendar event says it is working', () => {
  const fn = main.slice(main.indexOf('async function saveCalendarEvent(form)'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /const done = beginSubmitting\(form, 'Saving…'\);/);
  assert.match(body, /if \(!done\) return;/);
  // Released on every path, or a failed save leaves the dialog stuck.
  assert.match(body, /\} finally \{\s*[\r\n]+\s*done\(\);/);
});

// "its saying restore failed and other pop up toasts like restore successfully and error:
// something" -- one action, three contradictory messages. The restore loops ~25 tables and
// raised a toast per failing table, then returned normally so the caller announced success.

test('a restore reports one outcome, not one per table', () => {
  const fn = main.slice(main.indexOf('async function persistWorkspaceBackupPayloadToSupabase'));
  // Bounded on a CRLF-safe closing brace: '\n}\n' never matches in this file, and the slice
  // silently ran to the end of it, sweeping in unrelated functions.
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /const failures = \[\];/);
  assert.match(body, /failures\.push\(\{ table, message: result\.error\.message/);
  assert.match(body, /return failures;/);
  // Announcing from inside the loop is the bug.
  assert.ok(!/notifySyncFailure\(result\.error, 'Restore'\)/.test(body));
});

test('the caller states what did not come back', () => {
  const fn = main.slice(main.indexOf('async function restoreWorkspaceBackup(backupId)'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /const failures = isLiveSupabaseSession\(\)/);
  assert.match(body, /if \(failures\.length\) \{/);
  assert.match(body, /could not be written/);
  assert.match(body, /First error: \$\{failures\[0\]\.message\}/, 'name one thing to look at');
  // Success is only claimed when there is nothing to report.
  assert.ok(
    body.indexOf('Workspace restored from backup.') > body.indexOf('if (failures.length)'),
    'the success message belongs in the else branch',
  );
});

// "You cant drag the apps." Drag-to-pan worked -- verified with real pointer events -- so the
// ask was reordering, which did not exist. Dragging a TILE now reorders; dragging the strip
// itself still pans, because the two cannot share one gesture.

test('a drag decides once whether it is a reorder or a pan', () => {
  const drag = readFileSync(join(root, 'src', 'workspace', 'topbar-drag.js'), 'utf8');
  assert.match(drag, /let reordering = null;/);
  // Decided on pointerdown and not revisited, or a drag could change meaning mid-gesture.
  assert.match(drag, /reordering = track\.dataset\.wbReorder === '1' && event\.target\.closest/);
  assert.match(drag, /\? event\.target\.closest\('\[data-wb-app-id\]'\)/);
  // Panning must not also run while reordering.
  assert.match(drag, /if \(reordering\) \{[\s\S]{0,700}?return;/);
});

test('the module reports the order and stores nothing itself', () => {
  const drag = readFileSync(join(root, 'src', 'workspace', 'topbar-drag.js'), 'utf8');
  assert.match(drag, /new CustomEvent\('wb-topbar-reorder', \{ bubbles: true, detail: \{ ids \} \}\)/);
  // It is deliberately context-free; knowing about workspaces would break that.
  assert.ok(!/wbSave|workspace/i.test(drag.replace(/\/\/[^\n]*/g, '')), 'no workspace knowledge in the gesture');
});

test('only someone who can manage workspaces gets the reorder handle', () => {
  // >= 1 rather than > 1: Activity sits among the apps now, so a single app already has a
  // second tile to be reordered against.
  assert.match(main, /const canReorderApps = can\('workspaces\.manage', companyId\) && apps\.length >= 1;/);
  assert.match(main, /\$\{canReorderApps \? ' data-wb-reorder="1"' : ''\}/);
  // A tab is a link; without this the browser's own drag steals the gesture.
  assert.match(main, /data-router draggable="false" data-wb-app-id="\$\{h\(a\.id\)\}"/);
});

test('the stored order keeps entries the strip never showed', () => {
  const fn = main.slice(main.indexOf('function wbApplyAppOrder(companyId, ids)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /if \(!can\('workspaces\.manage', companyId\)\) return;/);
  assert.match(body, /entries\.forEach\(\(entry\) => \{ if \(!next\.includes\(entry\)\) next\.push\(entry\); \}\);/);
  // A drag that ended where it started must not write a revision.
  assert.ok(body.includes('if (activityAt === wasAt && next.every((entry, at) => entry === entries[at])) return;'), 'a drag that ended where it started writes nothing');
  assert.match(body, /wbSave\(companyId\);/);
  // Activity is dragged with the apps but is not one, so it comes out of the reported order
  // and is remembered as a position. Left in, the lookup would silently drop it and the strip
  // would put it back at the front on the next reload.
  assert.ok(body.includes('const appIds = ids.filter((id) => id !== WB_ACTIVITY_TILE);'));
  assert.ok(body.includes('workspace.activityAt = activityAt;'));
});

// "After clicking the link and making an account, when I log in it says invalid login
// credentials." I could not reproduce it and auth.users holds no unconfirmed account, so
// there is no orphaned sign-up to repair. What is real is the message: Supabase returns
// "Invalid login credentials" for a wrong password, an unknown address AND an unconfirmed
// account, and both call sites passed it straight through.

test('a sign-up with no session names the confirmation step', () => {
  const fn = main.slice(main.indexOf('async function registerWorkspace(formNode)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /state\.authMessage = `Account created\. Check \$\{email\} for a confirmation link, then sign in\.`;/);
  assert.match(body, /state\.authMode = 'signin';/);
  // Telling somebody to sign in is what sent them into the refusal they reported.
  assert.ok(!/Please sign in to finish workspace setup/.test(body));
  // It is not an error -- the account exists -- so it must not paint as one.
  assert.match(body, /state\.loginError = '';/);
});

test('the sign-in refusal says what else it can mean', () => {
  const fn = main.slice(main.indexOf('async function signInWithSupabase'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /const generic = \/invalid login credentials\/i\.test\(result\.error\.message \|\| ''\);/);
  assert.match(body, /confirm it from the email we sent first/);
  // Any other error is still reported verbatim; only the ambiguous one is expanded.
  assert.match(body, /: result\.error\.message \|\| 'Unable to sign in\.';/);
});
