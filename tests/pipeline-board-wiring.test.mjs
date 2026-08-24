import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderBoard, renderStageDeletePrompt, renderStageManager } from '../src/workspace/board-view.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  + readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8')
  // The Items tab is fetched on demand now; what it renders is unchanged.
  + readFileSync(new URL('../src/workspace/items-view.js', import.meta.url), 'utf8');
const css = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
// The Automations tab and its rule editor are fetched on demand now, so the stage-trigger
// UI is read from its own module rather than from main.js.
const automations = readFileSync(new URL('../src/workspace/automations-ui.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The LAST definition, and a closing brace at any indentation. A tab that has been moved into
// its own module leaves a three-line loader of the same name behind in main.js, and the first
// match is that wrapper -- which slices to ";" and passes nothing.
const fn = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  const end = main.slice(at).search(/\n\s{0,2}\}\n/);
  return main.slice(at, end === -1 ? undefined : at + end);
};

const cols = [
  { id: null, label: 'No stage', color: '#999', items: [{ id: 'x' }], count: 1, total: 0 },
  { id: 'lead', label: 'Lead', color: '#f00', items: [{ id: 'a' }], count: 1, total: 100 },
  { id: 'won', label: 'Won', color: '#0f0', items: [], count: 0, total: 0 },
];
const card = (item) => `<b>${item.id}</b>`;

// --- the board ---------------------------------------------------------------------

test('every column is a drop target, including the empty one', () => {
  // The first record onto a stage always lands on an empty column. If that column is not
  // a target, a new pipeline can never be filled by dragging.
  const html = renderBoard(cols, { cardHtml: card, canManage: true });
  const targets = [...html.matchAll(/data-drop-stage="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(targets, ['', 'lead', 'won']);
  assert.match(html, /Drop a record here/, 'the empty column says what it is for');
});

test('the "no stage" column can be dropped onto, so a mis-drop is reversible', () => {
  assert.match(renderBoard(cols, { cardHtml: card, canManage: true }), /data-drop-stage=""/);
});

test('cards are only draggable for someone who may edit', () => {
  assert.match(renderBoard(cols, { cardHtml: card, canManage: true }), /draggable="true"/);
  assert.ok(!/draggable="true"/.test(renderBoard(cols, { cardHtml: card, canManage: false })));
  assert.match(renderBoard(cols, { cardHtml: card, canManage: false }), /Nothing here yet/);
});

test('the card body comes from the caller, so board and Cards cannot drift', () => {
  assert.match(renderBoard(cols, { cardHtml: (i) => `<i>${i.id}</i>` }), /<i>a<\/i>/);
});

test('each card carries the id and kind the drop handler matches on', () => {
  const html = renderBoard(cols, { cardHtml: card, canManage: true, dragKind: 'wb-item' });
  assert.match(html, /data-drag-kind="wb-item" data-drag-id="a"/);
});

test('totals show only when asked for, and are formatted by the caller', () => {
  assert.match(renderBoard(cols, { cardHtml: card, formatTotal: (n) => `$${n}` }), /\$100/);
  assert.ok(!/wb-board-total/.test(renderBoard(cols, { cardHtml: card })), 'no formatter, no total line');
});

test('a column with a null total shows no total even when a formatter is given', () => {
  const none = [{ id: 'a', label: 'A', color: '#000', items: [], count: 0, total: null }];
  assert.ok(!/wb-board-total/.test(renderBoard(none, { cardHtml: card, formatTotal: (n) => `$${n}` })));
});

test('a column announces its name and how many records it holds', () => {
  assert.match(renderBoard(cols, { cardHtml: card }), /aria-label="Lead, 1 record"/);
  assert.match(renderBoard(cols, { cardHtml: card }), /aria-label="Won, 0 records"/);
});

test('stage names from users are escaped', () => {
  const evil = [{ id: 'x', label: '<img src=x onerror=alert(1)>', color: '#000', items: [], count: 0, total: null }];
  const html = renderBoard(evil, { cardHtml: card });
  assert.ok(!html.includes('<img'), html);
});

// --- the stage manager -------------------------------------------------------------

test('reorder buttons stop at the ends rather than wrapping', () => {
  const stages = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
  const html = renderStageManager(stages, new Map([['a', 2]]));
  const rows = html.split('wb-stage-row').slice(1);
  assert.match(rows[0], /data-wb-stage-move="-1" disabled/);
  assert.ok(!/data-wb-stage-move="1" disabled/.test(rows[0]));
  assert.match(rows[2], /data-wb-stage-move="1" disabled/);
});

test('each stage shows how many records it holds, before you delete it', () => {
  const html = renderStageManager([{ id: 'a', label: 'A' }], new Map([['a', 7]]));
  assert.match(html, /wb-stage-count[^>]*>7</);
  // A stage nobody has used reads 0 rather than blank.
  assert.match(renderStageManager([{ id: 'b', label: 'B' }], new Map()), /wb-stage-count[^>]*>0</);
});

test('an app with no stages yet explains what happens to records meanwhile', () => {
  assert.match(renderStageManager([], new Map()), /No stage/);
});

test('deleting offers a destination AND clearing, so the last stage can go', () => {
  const html = renderStageDeletePrompt({ id: 'a', label: 'Won' }, 3, [{ id: 'b', label: 'Lead' }]);
  assert.match(html, /<option value="b">Lead<\/option>/);
  assert.match(html, /<option value="">No stage<\/option>/, 'without this, the last stage is undeletable');
  assert.match(html, /3 records/);
  assert.match(html, /records are kept either way/);
});

// --- main.js wiring -----------------------------------------------------------------

test('the board is fetched on use, not bundled into the entry chunk', () => {
  assert.ok(!/^import .*board-view\.js/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/workspace\/board-view\.js'\)/);
  // The model, by contrast, is eager: the stage pill and filters need it on first paint.
  assert.match(main, /from '\.\/workspace\/pipeline-core\.js'/);
});

test('a failed board fetch can be retried', () => {
  assert.match(fn('wbLoadBoard'), /wbBoardPending = null;/);
});

test('an app with no status field is offered a pipeline instead of an empty grid', () => {
  assert.match(fn('wbRenderItemsBoard'), /if \(!field\) return wbBoardSetupPrompt\(app, canManage\)/);
  assert.match(fn('wbBoardSetupPrompt'), /data-wb-manage-stages/);
  assert.match(fn('wbBoardSetupPrompt'), /Status<\/b> field/);
});

test('stage setup is reachable on an app with no records', () => {
  // The toolbar is not rendered when the app is empty, which is exactly when you want to
  // lay out the pipeline first.
  const view = fn('wbViewItems');
  const empty = view.slice(view.indexOf('No items yet'));
  assert.match(empty.slice(0, 400), /data-wb-manage-stages/);
  assert.match(empty.slice(0, 400), /'Manage stages' : 'Set up stages'/);
});

test('dragging a record is an ordinary edit, so automations still fire', () => {
  const body = fn('wbSetItemStage');
  assert.match(body, /wbRunAutomations\(companyId, workspace, app, item, 'updated', prev\)/);
  assert.match(body, /item\.updatedAt = stamp/);
  assert.match(body, /wbSave\(companyId\)/);
});

test('a drop is permission-checked and refused onto a deleted stage', () => {
  const body = fn('wbSetItemStage');
  assert.match(body, /if \(!can\('workspaces\.manage', companyId\)\) return;/);
  assert.match(body, /if \(next && !canDropOn\(field, next\)\)/);
  // Dropping a record back where it already was should not stamp it as edited.
  assert.match(body, /if \(\(item\.values\[fieldId\] \|\| ''\) === next\) return;/);
});

test('the record knows only its id; the app comes from the board it was dropped on', () => {
  // Two boards could be on screen; the card must not carry stale coordinates.
  const drop = fn('onPipeDrop');
  assert.match(drop, /const board = lane\.closest\('\[data-wb-board\]'\)/);
  assert.match(drop, /board\.dataset\.company, board\.dataset\.workspace, board\.dataset\.app/);
});

test('the board reuses the existing drag plumbing rather than a second system', () => {
  assert.match(fn('onPipeDragEnd'), /\.wb-board-col\.drag-over/);
  assert.match(main, /const boardBar = ui\.view === 'board' \? wbBoardToolbar\(app, ui, canManage\) : ''/);
});

test('board columns and the CRM pipeline scroll the same way', () => {
  // Same idea over different data; a board that behaved differently would read as a bug.
  const board = css.slice(css.indexOf('.wb-board {'), css.indexOf('.wb-board-col {'));
  assert.match(board, /overflow-x: auto/);
  assert.match(board, /scroll-snap-type: inline proximity/);
  assert.match(css, /\.wb-board-col\.drag-over \{/);
});

// --- stage automations ---------------------------------------------------------------

test('a stage rule fires only when the stage actually changed', () => {
  // Otherwise every save on a record would trip every pipeline rule attached to it.
  const engine = main.slice(main.indexOf("else if (t.event === 'stage_moves')"));
  const body = engine.slice(0, engine.indexOf("} else if (t.event === 'field_is')"));
  assert.match(body, /now !== was/);
  assert.match(body, /const fromOk = !t\.from \|\| was === t\.from;/);
  assert.match(body, /const toOk = !t\.to \|\| now === t\.to;/);
});

test('an empty from/to means "any stage", which is a real choice', () => {
  const collect = main.slice(main.indexOf("const tFrom = document.querySelector('[data-wb-trig-from]')"));
  assert.match(collect.slice(0, 260), /m\.draft\.trigger\.from = tFrom\.value/);
  assert.match(collect.slice(0, 260), /m\.draft\.trigger\.to = tTo\.value/);
  const ui = automations.slice(automations.indexOf('function wbTrigCfgUI('));
  assert.match(ui, /<option value="">\$\{h\(anyLabel\)\}<\/option>/);
});

test('the trigger is offered, described, and refused without a pipeline', () => {
  assert.match(main, /<option value="stage_moves"[^>]*>A record moves between pipeline stages<\/option>/);
  assert.match(fn('wbTriggerText'), /if \(t\.event === 'stage_moves'\)/);
  assert.match(automations, /This app has no pipeline yet/);
  assert.match(main, /trigger\.event === 'stage_moves' && !pipelineField\(/, 'saving must be gated too');
});
