import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Quick filter chips on an app's items list: one chip per value of a field the user picks,
// with a live count, the way the Jobs trade spine reads.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const slice = (name) => main.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0] || '';

test('only fields with a bounded value set can drive the chips', () => {
  // A text, date or money field would produce roughly one chip per record, which is not a
  // filter bar -- it is the list again, wrapped onto four lines.
  assert.match(main, /const WB_CHIP_FIELD_TYPES = \['status', 'category', 'user', 'checkbox'\];/);
  assert.match(slice('wbChipFields'), /WB_CHIP_FIELD_TYPES\.includes\(f\.type\)/);
});

test('the chip field falls back rather than blanking when the chosen one is deleted', () => {
  const source = slice('wbChipField');
  assert.match(source, /candidates\.find\(\(f\) => f\.id === ui\.chipFieldId\) \|\| pipelineField\(app\) \|\| candidates\[0\]/);
});

test('off is a real choice, distinct from having no preference', () => {
  // '' means "pick a sensible default"; WB_CHIP_OFF means the user turned them off, and
  // collapsing the two would switch the bar back on at every render.
  assert.match(main, /const WB_CHIP_OFF = '__off';/);
  assert.match(slice('wbChipField'), /ui\.chipFieldId === WB_CHIP_OFF/);
  assert.match(main, /chipFieldId: '', chipValue: ''/);
});

test('counts are taken before the chip is applied', () => {
  // Otherwise picking a chip collapses every other chip to zero, and there is no way to see
  // where to move next.
  const at = main.indexOf('const chipBar = wbItemsChipBar(companyId, app, ui, rows);');
  const then = main.indexOf('if (chipField && ui.chipValue) rows = rows.filter');
  assert.ok(at !== -1 && then > at, 'the bar must be built from the unnarrowed rows');
});

test('the chip narrows on top of search, filters and the deck stage', () => {
  const order = ['let rows = ui.filters.length', 'if (navStage) rows = rows.filter', 'if (chipField && ui.chipValue) rows = rows.filter']
    .map((needle) => main.indexOf(needle));
  assert.ok(order.every((i) => i !== -1), 'all three stages must be present');
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'they must apply in that order');
});

test('clicking the active chip clears it', () => {
  assert.match(main, /ui\.chipValue = ui\.chipValue === next \? '' : next;/);
});

test('changing the field clears the chosen chip', () => {
  // The chip id belongs to the old field and would match nothing, leaving an empty list
  // with no chip highlighted to explain why.
  assert.match(main, /ui\.chipFieldId = el\.value; ui\.chipValue = ''; render\(\);/);
});

test('an empty result names the chip and offers to clear it', () => {
  assert.match(main, /Nothing here is <b>\$\{h\(chipLabel\)\}<\/b>/);
  assert.match(main, /Clear quick filter/);
});

test('the bar scrolls sideways rather than wrapping', () => {
  // An app with fifteen options would otherwise push the list off the screen.
  const rule = styles.match(/\.wb-chip-bar \{([^}]*)\}/)?.[1] || '';
  assert.match(rule, /overflow-x:\s*auto/);
  assert.match(styles, /\.wb-chip \{[^}]*flex: none/);
  assert.match(styles, /\.wb-chip\.on \{/, 'the active chip needs a selected state');
});

// --- bucket semantics ------------------------------------------------------------------

test('status chips keep the field option order, not a count order', () => {
  // Those options are a sequence the user arranged. Sorting by count would reshuffle the
  // bar every time a record moved.
  const source = slice('wbChipOptions');
  const statusPart = source.slice(source.indexOf('const options = '));
  assert.ok(!/sort\(/.test(statusPart), 'status and category must not re-sort');
  assert.match(source, /\.sort\(\(a, b\) => b\.count - a\.count \|\| a\.label\.localeCompare\(b\.label\)\)/);
});

test('unset and deleted options share one chip so the counts add up', () => {
  const source = slice('wbChipOptions');
  assert.match(source, /v == null \|\| v === '' \|\| !known\.has\(v\)/);
  assert.match(source, /label: 'Unset'/);
  assert.match(slice('wbItemInChip'), /!\(field\.config\?\.options \|\| \[\]\)\.some\(\(o\) => o\.id === value\)/);
});

test('a checkbox chip that matches nothing is not rendered', () => {
  // Yes/No are the only two possible values, so an empty one is dead weight on every app
  // that happens to have all records on one side.
  assert.match(slice('wbChipOptions'), /\]\.filter\(\(chip\) => chip\.count\);/);
});
