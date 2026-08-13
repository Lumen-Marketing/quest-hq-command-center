import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  COMPUTED_TYPES, PULL_FAMILY, canPull, effectivePull, matchedFields, pullTargets,
} from '../src/workspace/relationship-pull.js';
// Its own module: main.js reads the DOM rows synchronously, so importing the compatibility
// table there would drag it into the entry bundle for one small helper.
import { readPullRows } from '../src/workspace/pull-rows.js';

// "On the relationship field add an option where I can copy the data inputted on the other
// field so it will automatically input on it... but it still displays what I set on the field
// relationship."
//
// Two separate jobs were being asked of one setting: the link decides what is DISPLAYED (Show
// field), the mapping decides what is COPIED. Adding the mapping leaves Show field alone.
//
// And then: "on selecting record here can you display also the selected show field, so there
// is a distinction on selecting a record" — two records with the same Identify-by value are a
// coin toss until the row says what else it is.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const picker = readFileSync(join(root, 'src', 'workspace', 'relationship-picker.js'), 'utf8');
const fieldUi = readFileSync(join(root, 'src', 'workspace', 'field-config-ui.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

const fn = (source, name) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const end = source.slice(at).search(/\r?\n\s{0,2}\}/);
  return source.slice(at, at + end);
};

test('a value may only be copied into a field that can hold it', () => {
  // Phone into Text is a copy; Date into Money is a corruption.
  assert.ok(canPull('phone', 'text'));
  assert.ok(canPull('email', 'textarea'));
  assert.ok(canPull('money', 'number'));
  assert.ok(canPull('number', 'money'));
  assert.ok(canPull('date', 'date'));
  assert.ok(!canPull('date', 'money'));
  assert.ok(!canPull('text', 'number'), 'a line of text is not a number');
  assert.ok(!canPull('money', 'date'));
  // Anything readable can land in a text field, which is the one lossless destination.
  assert.ok(canPull('date', 'text'));
  assert.ok(canPull('status', 'text'));
  assert.ok(canPull('checkbox', 'text'));
});

test('nothing can be copied into a field that stores nothing', () => {
  // A calculation recomputes from its formula and a created-time is stamped by the system, so
  // a value written there vanishes on the next render — which reads as the copy having failed.
  COMPUTED_TYPES.forEach((type) => {
    assert.ok(!canPull('text', type), `${type} is computed and cannot receive a copy`);
    assert.ok(!canPull('number', type));
  });
  // They are still legitimate SOURCES — a calculation's result is worth copying out.
  assert.ok(canPull('calculation', 'money'));
  assert.ok(canPull('rollup', 'number'));
  assert.ok(canPull('autonumber', 'text'));
});

test('the destination list offers only what fits, and never the link itself', () => {
  const app = {
    fields: [
      { id: 'rel', type: 'relationship', label: 'Leads' },
      { id: 't', type: 'text', label: 'Notes' },
      { id: 'm', type: 'money', label: 'Value' },
      { id: 'd', type: 'date', label: 'When' },
      { id: 'c', type: 'calculation', label: 'Total' },
    ],
  };
  const ids = pullTargets(app, { id: 'x', type: 'money', label: 'Contract' }, 'rel').map((f) => f.id);
  assert.deepEqual(ids, ['t', 'm'], 'money fits text and money; not date, not a calculation');
  // Copying a link into its own picker is a loop, not a mapping.
  assert.ok(!pullTargets(app, { id: 'y', type: 'relationship' }, 'rel').some((f) => f.id === 'rel'));
  assert.deepEqual(pullTargets(app, null, 'rel'), []);
});

test('a half-chosen row survives editing and is dropped on save', () => {
  const rows = [{ from: 'a', to: '' }, { from: 'b', to: 'z' }, { from: '', to: '' }];
  // While the panel is open the row must not vanish under the person filling it in.
  assert.deepEqual(readPullRows(rows, { keepPartial: true }), [{ from: 'a', to: '' }, { from: 'b', to: 'z' }]);
  // Saving is where it stops being in progress.
  assert.deepEqual(readPullRows(rows), [{ from: 'b', to: 'z' }]);
  assert.match(fn(main, 'wbSubmitModal'), /m\.draft\.config\.pull = readPullRows\(m\.draft\.config\.pull\)/);
  assert.match(main, /\{ keepPartial: true \}\);/, 'the collector keeps partials');
});

test('two rows cannot both write the same field', () => {
  // The second would silently win, which is a rule nobody can see in the UI.
  assert.deepEqual(readPullRows([{ from: 'a', to: 'z' }, { from: 'b', to: 'z' }]), [{ from: 'a', to: 'z' }]);
});

test('the copy fills a blank and never overwrites', () => {
  // Somebody who typed an address and then linked a record did not ask for it to be replaced.
  const body = fn(picker, 'applyPull');
  assert.match(body, /if \(target\.checked\) return;/);
  assert.match(body, /if \(target\.value\) return;/, 'a select that already has a value is left alone');
  assert.match(body, /if \(String\(target\.value \|\| ''\)\.trim\(\)\) return;/);
  // Both events, because an automation listens for change and a calculation redraws on input.
  assert.match(body, /new Event\('input', \{ bubbles: true \}\)/);
  assert.match(body, /new Event\('change', \{ bubbles: true \}\)/);
});

test('a stage travels as its label, because option ids mean nothing in the other app', () => {
  assert.match(fieldUi, /if \(src\.type === 'status' \|\| src\.type === 'category'\) \{[\s\S]*?out\[pair\.to\] = String\(option\.label\)/);
  assert.match(fn(picker, 'applyPull'), /o\.textContent\.trim\(\)\.toLowerCase\(\) === String\(value\)\.trim\(\)\.toLowerCase\(\)/);
});

test('the copy is scoped to its own form', () => {
  // Two record forms on one page must not fill each other in.
  assert.match(fn(picker, 'applyPull'), /select\.closest\('form, \.wb-modal, \.wb-record-page'\) \|\| document/);
});

test('picking a record triggers the copy', () => {
  assert.match(fn(picker, 'wbBindRelationshipPickers'), /if \(option\) applyPull\(select, option\.id\);/);
});

test('the mapping is offered only where it has an answer', () => {
  // With several linked records there is no answer to "which one's address?".
  assert.match(fieldUi, /\$\{targetApp && !fd\.config\.multiple \? pullConfigUI\(h, fd, app, targetApp\) : ''\}/);
  assert.match(main, /if \(m\.draft\.config\.multiple\) \{ m\.draft\.config\.pull = \[\]; m\.draft\.config\.pullAll = false; \}/);
  // A different linked app invalidates every mapping, which named its fields.
  assert.match(main, /m\.draft\.config\.fixedItem = ''; m\.draft\.config\.pull = \[\]; \}/);
});

test('Show field is untouched — the link still displays what it was set to', () => {
  assert.match(fieldUi, /id="wbRelDisplay"/);
  const config = fn(fieldUi, 'pullConfigUI');
  assert.ok(!/displayField/.test(config), 'the mapping must not touch what is displayed');
});

// --- telling two records apart when choosing ------------------------------------------------

test('an option carries the Show field beside the Identify-by value', () => {
  // "so it displays ROMAN JUAN EUGENIO — demo and ROMAN JUAN EUGENIO — roofing".
  assert.match(fieldUi, /const label = wbRelLabel\(ta, it, f\.config\.identifyField\);/);
  assert.match(fieldUi, /const shown = f\.config\.displayField \? wbRelLabel\(ta, it, f\.config\.displayField\) : '';/);
  assert.match(fieldUi, /text: detail \? `\$\{label\} — \$\{detail\}` : label/);
  assert.match(fieldUi, /data-detail="\$\{h\(it\.detail\)\}"/);
});

test('no second line where there is no second thing to say', () => {
  // With no Show field set both fall back to the item title, and "Roman — Roman" is noise
  // pretending to be a distinction.
  assert.match(fieldUi, /const detail = shown && shown !== label \? shown : '';/);
  assert.match(fn(picker, 'wbBindRelationshipPickers'), /\$\{option\.detail \? `<span class="wb-rel-result-detail">/);
});

test('the chosen record keeps the distinction in the box', () => {
  // Picking one of two identical names and then seeing only the name again is the same coin
  // toss one step later.
  assert.match(fieldUi, /value="\$\{h\(chosen \? chosen\.text : ''\)\}"/);
});

test('searching matches either half', () => {
  // label is the whole "name — detail" string, and the filter runs over label.
  const body = fn(picker, 'wbBindRelationshipPickers');
  assert.match(body, /options\.filter\(\(option\) => option\.label\.toLowerCase\(\)\.includes\(needle\)\)/);
  assert.match(body, /const label = option\.textContent;/);
});

test('every family in the table has a rule, so no type silently copies nothing', () => {
  Object.entries(PULL_FAMILY).forEach(([type, family]) => {
    assert.ok(family, `${type} has no family`);
    assert.ok(canPull(type, 'text'), `${type} cannot be copied anywhere`);
  });
});

// --- copying every field the two apps share --------------------------------------------------

const SALES = {
  id: 'app-sales',
  fields: [
    { id: 's-deal', type: 'text', label: 'Deal' },
    { id: 's-contact', type: 'company_contact', label: 'Contact' },
    { id: 's-address', type: 'location', label: 'Address' },
    { id: 's-trade', type: 'category', label: 'Trade' },
    { id: 's-value', type: 'money', label: 'Contract value' },
    { id: 's-closer', type: 'user', label: 'Closer' },
    { id: 's-signed', type: 'date', label: 'Signed on' },
  ],
};
const JOBS = {
  id: 'app-jobs',
  fields: [
    { id: 'j-rel', type: 'relationship', label: 'From deal' },
    { id: 'j-job', type: 'text', label: 'Job' },
    { id: 'j-contact', type: 'company_contact', label: 'Contact' },
    { id: 'j-address', type: 'location', label: 'Address' },
    { id: 'j-trade', type: 'category', label: 'Trade' },
    { id: 'j-value', type: 'money', label: 'Contract value' },
    { id: 'j-budget', type: 'money', label: 'Budget' },
    { id: 'j-margin', type: 'calculation', label: 'Contract value ', config: { formula: '1' } },
  ],
};

test('every field the two apps call the same thing is matched', () => {
  const pairs = matchedFields(JOBS, SALES, 'j-rel');
  assert.deepEqual(pairs.map((p) => p.label), ['Contact', 'Address', 'Trade', 'Contract value']);
  // Deal/Job are named differently, so they are not a match — that is what a manual row is for.
  assert.ok(!pairs.some((p) => p.to === 'j-job'));
  // Budget exists only here, and Closer/Signed on only there.
  assert.ok(!pairs.some((p) => p.to === 'j-budget'));
});

test('a match still has to be a value the destination can hold', () => {
  const from = { id: 'x', fields: [{ id: 'a', type: 'date', label: 'Budget' }] };
  const to = { id: 'y', fields: [{ id: 'b', type: 'money', label: 'Budget' }] };
  assert.deepEqual(matchedFields(to, from), [], 'same name, but a date is not money');
});

test('the relationship field itself is never a destination', () => {
  const from = { fields: [{ id: 'a', type: 'text', label: 'From deal' }] };
  assert.deepEqual(matchedFields(JOBS, from, 'j-rel'), []);
});

test('a duplicated label resolves to the first, as it does everywhere else', () => {
  // JOBS has "Contract value" twice — the second is a calculation with a trailing space in its
  // label. Matching must not silently pick the one that cannot receive a copy.
  const pairs = matchedFields(JOBS, SALES, 'j-rel');
  const value = pairs.find((p) => p.label.trim() === 'Contract value');
  assert.equal(value.to, 'j-value');
});

test('the switch copies everything shared, and a written row overrides it', () => {
  const auto = effectivePull(JOBS, SALES, { id: 'j-rel', config: { pullAll: true } });
  assert.deepEqual(auto.map((p) => p.to), ['j-contact', 'j-address', 'j-trade', 'j-value']);

  // Somebody who says "their Signed on into my Budget" means it, even though Contract value
  // would otherwise fill Budget's neighbour.
  const withRow = effectivePull(JOBS, SALES, {
    id: 'j-rel',
    config: { pullAll: true, pull: [{ from: 's-value', to: 'j-budget' }] },
  });
  assert.deepEqual(withRow.map((p) => p.to), ['j-contact', 'j-address', 'j-trade', 'j-value', 'j-budget']);

  // And an explicit row for a field the switch also matched wins outright — one source per
  // destination, no duplicate writes.
  const overridden = effectivePull(JOBS, SALES, {
    id: 'j-rel',
    config: { pullAll: true, pull: [{ from: 's-deal', to: 'j-address' }] },
  });
  const addressWrites = overridden.filter((p) => p.to === 'j-address');
  assert.equal(addressWrites.length, 1);
  assert.equal(addressWrites[0].from, 's-deal', 'the written row, not the name match');
});

test('with the switch off nothing is copied but the written rows', () => {
  assert.deepEqual(effectivePull(JOBS, SALES, { id: 'j-rel', config: {} }), []);
  assert.deepEqual(
    effectivePull(JOBS, SALES, { id: 'j-rel', config: { pull: [{ from: 's-value', to: 'j-value' }] } }),
    [{ from: 's-value', to: 'j-value' }],
  );
});

test('the switch is wired end to end, and named in the panel', () => {
  assert.match(fieldUi, /id="wbRelPullAll"/);
  assert.match(fieldUi, /Copy every field they share/);
  // Not a black box: the panel says which fields it would copy.
  assert.match(fieldUi, /const shared = matchedFields\(app, targetApp, fd\.id\);/);
  assert.match(main, /m\.draft\.config\.pullAll = !!checked\('wbRelPullAll'\);/);
  // Several links has no answer to "which one's address?" — that applies to the switch too.
  assert.match(main, /if \(m\.draft\.config\.multiple\) \{ m\.draft\.config\.pull = \[\]; m\.draft\.config\.pullAll = false; \}/);
  // And the record input resolves the merged mapping, not the written rows alone.
  assert.match(fieldUi, /const pulls = effectivePull\(ownerAppOf\(companyId, f\.id\), ta, f\);/);
});

test('the mapping rows have styles, not just markup', () => {
  // The markup emits these and the stylesheet did not define them, so the rows shipped as a
  // stack of unstyled controls. A class in a template with no rule behind it is invisible to
  // every test that only reads JavaScript.
  ['wb-pull-list', 'wb-pull-row'].forEach((cls) => {
    assert.match(fieldUi, new RegExp(`class="${cls}`), `${cls} should be emitted`);
    assert.match(styles, new RegExp(`\.${cls} \{`), `${cls} has no rule behind it`);
  });
});
