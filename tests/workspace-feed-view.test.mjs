import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const picker = source.match(/function wbFeedPicker\(workspace\)[\s\S]*?\n\}/)[0];
const stream = source.match(/function wbFeedStream\(companyId, workspace\)[\s\S]*?\n\}/)[0];

// "On the App Activity dashboard, add a button to display post feed, activity feed, or both."
//
// Posts and activity are two different reading jobs -- a conversation you catch up on, and a
// ledger you scan -- and a busy week of record edits buries every post under a hundred log
// lines. Interleaved stays the default, because that is the dashboard's whole idea.

test('three views, and both is one of them', () => {
  const table = source.match(/const WB_FEED_VIEWS = \[[\s\S]*?\];/)[0];
  assert.match(table, /\['all', 'Both', /);
  assert.match(table, /\['posts', 'Posts', /);
  assert.match(table, /\['activity', 'Activity', /);
});

test('the stream drops the half you did not ask for', () => {
  assert.match(stream, /const posts = view === 'activity' \? \[\] :/);
  assert.match(stream, /const acts = view === 'posts' \? \[\] :/);
});

test('filtering happens before the sixty-row trim, not after', () => {
  // The other order shows whichever handful of posts survived sixty rows of mostly activity,
  // which is the bug this feature exists to fix rather than reproduce one level down.
  const filterAt = stream.indexOf("view === 'activity' ? [] :");
  const trimAt = stream.indexOf('.slice(0, 60)');
  assert.ok(filterAt >= 0 && trimAt > filterAt, 'the filter must run before the slice');
});

test('an unknown stored value falls back to both rather than matching nothing', () => {
  // It comes off localStorage and off a DOM attribute, and a view matching neither branch
  // would empty the stream with no button lit to undo it.
  assert.match(source, /function wbFeedView\(\) \{\s*\n\s*return WB_FEED_VIEWS\.some\(\(\[id\]\) => id === state\.wbFeedView\) \? state\.wbFeedView : 'all';/);
  assert.match(source, /const view = WB_FEED_VIEWS\.some\(\(\[id\]\) => id === node\.dataset\.view\) \? node\.dataset\.view : 'all';/);
});

test('the counts are on the buttons, so you can see if the other side is worth a press', () => {
  assert.match(picker, /posts: \(workspace\.feed \|\| \[\]\)\.length,/);
  assert.match(picker, /activity: \(workspace\.activity \|\| \[\]\)\.length,/);
  assert.match(picker, /<b>\$\{h\(String\(totals\[id\]\)\)\}<\/b>/);
});

test('an empty workspace gets no picker: three zeroes above "nothing here yet" is noise', () => {
  assert.match(picker, /if \(!totals\.all\) return '';/);
});

test('the empty state answers what was asked for, not what the workspace holds', () => {
  // "Nothing here yet" under a filter is wrong twice: there may be plenty here, and it sends
  // somebody off to write a post when all they had to do was press Both.
  assert.match(stream, /No posts yet\. Share an update, or press Activity/);
  assert.match(stream, /No app activity yet\./);
  assert.match(stream, /Nothing here yet\. Share an update or create an app/);
});

test('sharing while reading only Activity widens the view instead of posting into the void', () => {
  const share = source.match(/async function wbComposerShare\(companyId\)[\s\S]*?\n\}/)[0];
  assert.match(share, /if \(wbFeedView\(\) === 'activity'\) \{/);
  assert.match(share, /state\.wbFeedView = 'all';/);
  // Widened, not switched to Posts: the ledger they were reading stays on screen.
  assert.doesNotMatch(share, /state\.wbFeedView = 'posts'/);
});

test('the choice is kept, and follows you to your other devices', () => {
  assert.match(source, /const WB_FEED_VIEW_KEY = 'quest-hq-wb-feed-view';/);
  assert.match(source, /wbFeedView: localStorage\.getItem\(WB_FEED_VIEW_KEY\) \|\| 'all',/);
  assert.match(source, /localStorage\.setItem\(WB_FEED_VIEW_KEY, view\);/);
  // Declared in the table the prefs sync walks, rather than in a hand-kept list beside it.
  assert.match(source, /\{ group: 'views', name: 'workspaceFeed', store: WB_FEED_VIEW_KEY, json: false,/);
});

test('the control sits between the composer and the stream it governs', () => {
  const column = source.match(/function wbFeedColumn\(companyId, workspace\)[\s\S]*?\n\}/)[0];
  assert.match(column, /\$\{composer\}\$\{wbFeedPicker\(workspace\)\}\$\{wbFeedStream\(companyId, workspace\)\}/);
  assert.match(styles, /\.wb-feed-picker \{ display: flex; justify-content: flex-end; \}/);
});

// --- the picker is half-size, and only the picker ----------------------------------------------

/** The declarations of one rule, as {prop: value}. */
function rule(css, selector) {
  const at = css.indexOf(`\n${selector} {`);
  assert.notEqual(at, -1, `no rule for ${selector}`);
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
  return Object.fromEntries([...body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
}
const px = (v) => Number(String(v).replace('px', ''));

test('the picker is smaller than a standard segmented control', () => {
  // A filter above the thing it filters, not a primary action — it was carrying the full
  // button chrome for no reason.
  const base = rule(styles, '.segmented button');
  const small = rule(styles, '.wb-feed-picker .segmented button');
  assert.ok(px(small['min-height']) < px(base['min-height']), 'the picker is no shorter than a normal one');
  // The CONTAINER carries its own min-height, so shrinking only the buttons leaves the control
  // exactly as tall as it was with the buttons floating inside it.
  const box = rule(styles, '.wb-feed-picker .segmented');
  assert.equal(px(box['min-height']), px(small['min-height']), 'the box and its buttons disagree on height');
  assert.ok(px(box['min-height']) < px(rule(styles, '.segmented')['min-height']));
  assert.ok(px(small['font-size']) < px(base['font-size']));
  assert.ok(px(small.gap) <= px(base.gap) / 2, 'the gap should be halved');
  // Padding is the "0 Npx" shorthand; the side value is what drives the width.
  assert.ok(px(small.padding.split(' ')[1]) <= px(base.padding.split(' ')[1]) / 2, 'the side padding should be halved');
});

test('it stops at the minimum target size rather than the literal half', () => {
  // 38 / 2 is 19, which is under the 24x24 floor. A filter nobody can reliably hit is not
  // smaller, it is broken.
  const small = rule(styles, '.wb-feed-picker .segmented button');
  assert.ok(px(small['min-height']) >= 24, `a ${small['min-height']} target is too small to hit`);
});

test('the shrinking does not leak to segmented controls elsewhere', () => {
  // `.segmented` is shared with controls that ARE the main thing on their row. Every rule that
  // resizes must name .wb-feed-picker, or the whole app shrinks with it.
  const base = rule(styles, '.segmented button');
  assert.equal(px(base['min-height']), 38, 'the standard segmented button changed size');
  assert.equal(px(base['font-size']), 13);
  assert.equal(px(rule(styles, '.segmented')['min-height']), 38);
});

test('the icon is told its size, since it does not inherit one', () => {
  // Left alone it keeps its old size inside a box half as tall and crowds the label out.
  assert.match(styles, /\.wb-feed-picker \.segmented button i \{ font-size: \d+px; \}/);
});
