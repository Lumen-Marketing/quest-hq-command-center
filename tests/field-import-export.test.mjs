import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  FIELD_SET_FORMAT, OWN_FIELD_REFS, adoptFields, buildFieldSet, presentIn, readFieldSet,
} from '../src/workspace/field-portability.js';

// "on the form fields on the setup, can you make it import and export so i can reuse other
// layout i have from other apps."
//
// The whole-app download was already there and is the wrong tool for it: it builds a NEW app,
// so reusing one form's shape in an app you are already standing in meant installing the whole
// thing -- records, automations and all -- then deleting what you did not want. This carries
// the field list on its own, into the app you are already in.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const dataIo = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');
const builderModal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

let n = 0;
const makeId = () => `new${++n}`;
const app = (name, fields) => ({ name, color: '#123456', fields });

test.beforeEach(() => { n = 0; });

/* ---- the file that is written ---------------------------------------------------------- */

test('an export carries the fields and nothing else', () => {
  // Records are the thing somebody importing a LAYOUT explicitly does not want, and a file
  // that quietly brought three hundred of them across would be the wrong answer twice over --
  // once for the surprise, once for the size.
  const source = app('Quotes', [{ id: 'f1', label: 'Amount', type: 'money', required: true, hidden: false, config: { currency: '$' } }]);
  source.items = [{ id: 'i1', values: { f1: 900 } }];
  source.automations = [{ id: 'a1' }];
  const bundle = buildFieldSet(source, source.fields, { workspaceName: 'Sales', exportedAt: '2026-08-19T00:00:00.000Z' });

  assert.equal(bundle.format, FIELD_SET_FORMAT);
  assert.equal(bundle.source.app, 'Quotes');
  assert.equal(bundle.source.workspace, 'Sales');
  assert.deepEqual(bundle.fields, [{ id: 'f1', label: 'Amount', type: 'money', required: true, hidden: false, config: { currency: '$' } }]);
  assert.ok(!('items' in bundle) && !('automations' in bundle));
});

test('the config is copied, not shared with the app it came from', () => {
  const source = app('Quotes', [{ id: 'f1', label: 'Stage', type: 'status', config: { options: [{ id: 'o1', label: 'New' }] } }]);
  const bundle = buildFieldSet(source, source.fields);
  bundle.fields[0].config.options[0].label = 'Edited';
  assert.equal(source.fields[0].config.options[0].label, 'New');
});

/* ---- the file that is read -------------------------------------------------------------- */

test('a whole-app bundle is a field export too', () => {
  // Somebody holding last month's .questapp.json backup should not have to install the whole
  // app -- records and all -- to get its five fields.
  const read = readFieldSet({ app: { name: 'Jobs', fields: [{ id: 'f1', label: 'Site', type: 'location' }] } });
  assert.equal(read.ok, true);
  assert.equal(read.source.app, 'Jobs');
  assert.equal(read.fields.length, 1);
});

test('a type this build has never heard of is dropped and counted, not coerced', () => {
  // A "Signature" field arriving silently as an empty text box is a worse lie than a gap.
  const read = readFieldSet(
    { format: FIELD_SET_FORMAT, fields: [{ id: 'a', label: 'Name', type: 'text' }, { id: 'b', label: 'Sign', type: 'signature' }] },
    (type) => type === 'text',
  );
  assert.equal(read.ok, true);
  assert.equal(read.dropped, 1);
  assert.deepEqual(read.fields.map((f) => f.type), ['text']);
});

test('a file with nothing usable in it says so rather than importing nothing', () => {
  assert.equal(readFieldSet(null).ok, false);
  assert.equal(readFieldSet({ hello: 'world' }).ok, false);
  assert.equal(readFieldSet({ fields: [] }).ok, false);
  const allUnknown = readFieldSet({ fields: [{ id: 'a', label: 'Sign', type: 'signature' }] }, () => false);
  assert.equal(allUnknown.ok, false);
  assert.match(allUnknown.error, /types this version knows about/);
});

/* ---- what happens on the way in --------------------------------------------------------- */

test('every field arrives with a fresh id, so two apps can never share one', () => {
  const { fields } = adoptFields([{ id: 'f1', label: 'Amount', type: 'money', config: {} }], [], { makeId });
  assert.equal(fields[0].id, 'new1');
  assert.notEqual(fields[0].id, 'f1');
});

test('a name the app already uses is numbered, never merged into', () => {
  // Two fields called Amount is a choice somebody can see and undo. Landing on the existing
  // one is a silent edit of a column that already holds values.
  const { fields, renamed } = adoptFields(
    [{ id: 'f1', label: 'Amount', type: 'money', config: {} }],
    [{ id: 'x', label: 'amount', type: 'text' }],
    { makeId },
  );
  assert.equal(fields[0].label, 'Amount 2');
  assert.deepEqual(renamed, [{ from: 'Amount', to: 'Amount 2' }]);
});

test('a formula follows the field it was renamed with, not the one already there', () => {
  // Formulas name their inputs by LABEL. Left alone, {Amount} in the imported total would read
  // the TARGET app's Amount -- a sum quietly taken over the wrong column.
  const { fields } = adoptFields(
    [
      { id: 'f1', label: 'Amount', type: 'money', config: {} },
      { id: 'f2', label: 'Total', type: 'calculation', config: { formula: '{Amount} * 1.1' } },
    ],
    [{ id: 'x', label: 'Amount', type: 'number' }],
    { makeId },
  );
  assert.equal(fields[0].label, 'Amount 2');
  assert.equal(fields[1].config.formula, '{Amount 2} * 1.1');
});

test('a reference between two imported fields is re-pointed at the new ids', () => {
  const incoming = [
    { id: 'rel', label: 'Job', type: 'relationship', config: { targetApp: 'app9', targetCompany: 'c1', pull: [{ from: 'their1', to: 'note' }] } },
    { id: 'note', label: 'Notes', type: 'textarea', config: {} },
    { id: 'roll', label: 'Hours', type: 'rollup', config: { relField: 'rel', targetField: 'their2', agg: 'sum' } },
    { id: 'steps', label: 'Steps', type: 'checklist', config: { steps: ['a'] } },
    { id: 'pct', label: 'Done', type: 'progress', config: { source: 'steps' } },
  ];
  const { fields } = adoptFields(incoming, [], { makeId });
  const by = Object.fromEntries(fields.map((f) => [f.label, f]));

  assert.equal(by.Hours.config.relField, by.Job.id);
  assert.equal(by.Done.config.source, by.Steps.id);
  assert.deepEqual(by.Job.config.pull, [{ from: 'their1', to: by.Notes.id }]);
  // The far halves belong to another app and are left exactly as they were: reused inside the
  // same account they still resolve, and where they do not the builder already says so.
  assert.equal(by.Job.config.targetApp, 'app9');
  assert.equal(by.Hours.config.targetField, 'their2');
});

test('only the near half of a linked progress source is reminted', () => {
  // `link:<relationship field here>:<progress field over there>`.
  const { fields } = adoptFields(
    [
      { id: 'rel', label: 'Job', type: 'relationship', config: {} },
      { id: 'pct', label: 'Done', type: 'progress', config: { source: 'link:rel:their9' } },
    ],
    [],
    { makeId },
  );
  const rel = fields.find((f) => f.label === 'Job');
  assert.equal(fields.find((f) => f.label === 'Done').config.source, `link:${rel.id}:their9`);
});

test('a button brings its conditions, its writes and its push list with it', () => {
  const incoming = [
    { id: 'stage', label: 'Stage', type: 'status', config: {} },
    { id: 'won', label: 'Won on', type: 'date', config: {} },
    {
      id: 'btn',
      label: 'Send',
      type: 'button',
      config: {
        action: 'push',
        targetApp: 'app9',
        pickFields: true,
        fields: ['stage', 'won'],
        set: [{ field: 'won', value: 'today' }],
        when: [{ field: 'stage', op: 'is', value: 'Hot' }],
        map: [{ from: 'stage', to: 'their1' }],
      },
    },
  ];
  const { fields } = adoptFields(incoming, [], { makeId });
  const by = Object.fromEntries(fields.map((f) => [f.label, f]));
  const cfg = by.Send.config;

  assert.deepEqual(cfg.fields, [by.Stage.id, by['Won on'].id]);
  assert.deepEqual(cfg.set, [{ field: by['Won on'].id, value: 'today' }]);
  assert.deepEqual(cfg.when, [{ field: by.Stage.id, op: 'is', value: 'Hot' }]);
  // from is this record's field and travels; to names a field in the destination app.
  assert.deepEqual(cfg.map, [{ from: by.Stage.id, to: 'their1' }]);
});

test('a reference to a field that was left unticked is dropped, not carried', () => {
  // A dangling id renders as a control with nothing in it and no way to tell why -- the same
  // reason app-portability drops one rather than carrying it through.
  const { fields } = adoptFields(
    [{ id: 'roll', label: 'Hours', type: 'rollup', config: { relField: 'rel-not-imported', agg: 'sum' } }],
    [],
    { makeId },
  );
  assert.equal(fields[0].config.relField, '');
});

test('a push list emptied by the picking has its switch moved to match', () => {
  // An empty list already means "push everything" to planPush, so leaving the switch on
  // "only these" would show a rule the button does not follow.
  const { fields } = adoptFields(
    [{ id: 'btn', label: 'Send', type: 'button', config: { pickFields: true, fields: ['gone'] } }],
    [],
    { makeId },
  );
  assert.deepEqual(fields[0].config.fields, []);
  assert.equal(fields[0].config.pickFields, false);
});

test('importing the same file twice makes two fields, not one field twice', () => {
  const file = [{ id: 'f1', label: 'Amount', type: 'money', config: {} }];
  const target = { fields: [] };
  target.fields.push(...adoptFields(file, target.fields, { makeId }).fields);
  target.fields.push(...adoptFields(file, target.fields, { makeId }).fields);
  assert.deepEqual(target.fields.map((f) => f.label), ['Amount', 'Amount 2']);
  assert.notEqual(target.fields[0].id, target.fields[1].id);
});

test('every same-app reference the remapper handles is written down', () => {
  // The list in OWN_FIELD_REFS is the only place these are recorded. A field type that grows a
  // new reference and is not added here imports as a broken control.
  assert.deepEqual(Object.keys(OWN_FIELD_REFS).sort(), [
    'button', 'calculation', 'company_contact', 'progress', 'relationship', 'rollup',
  ]);
});

/* ---- the surface it hangs off ----------------------------------------------------------- */

test('both buttons are on the Fields tab, and only Import needs the permission', () => {
  // Export is read-only, like Print and Export CSV next door. Import writes fields.
  assert.match(main, /if \(tab === 'fields' && app\.fields\.length\) headBtn \+= `<button class="btn" data-wb-export-fields/);
  assert.match(main, /bind\('\[data-wb-import-fields\]', \(\) => \{ if \(!wbGuard\(\)\) return; wbImportFieldsPrompt/);
  assert.match(main, /bind\('\[data-wb-export-fields\]', \(\) => wbExportFields\(companyId, workspaceId, appId\)\);/);
  assert.match(main, /bind\('\[data-wb-import-fields\]', \(\) => \{ if \(!wbGuard\(\)\) return; wbImportFieldsPrompt\(companyId, workspaceId, appId\)\); \}\);|bind\('\[data-wb-import-fields\]', \(\) => \{ if \(!wbGuard\(\)\) return; wbImportFieldsPrompt\(companyId, workspaceId, appId\); \}\);/);
});

test('the flow lives in the module that is already fetched on demand', () => {
  // data-io.js is the home of print / CSV / download, and an app view prefetches it. Putting
  // this in main.js would have spent entry-chunk headroom on a button nobody presses twice.
  for (const name of ['wbExportFields', 'wbImportFieldsPrompt', 'wbApplyFieldImport']) {
    assert.match(dataIo, new RegExp(`function ${name}\\(`), `${name} is defined in data-io.js`);
    assert.match(dataIo, new RegExp(`\\b${name}\\b[,\\s]`), `${name} is returned from data-io.js`);
    assert.match(main, new RegExp(`wbDataIO\\('${name}'`), `${name} is reached through wbDataIO`);
  }
  // And everything it needs is actually handed over.
  assert.match(main, /WB_FIELD_TYPES, WB_PALETTE, openWbModal, closeWbModal, safeHexColor, sanitizeColorConfig,/);
  assert.match(dataIo, /WB_FIELD_TYPES, WB_PALETTE, openWbModal, closeWbModal, safeHexColor, sanitizeColorConfig,/);
});

test('a file is read and then ASKED about, never applied on the spot', () => {
  // Twelve of somebody else's fields appearing the instant a file is picked is not an import,
  // it is an accident.
  assert.match(dataIo, /kind: 'field-import',/);
  assert.match(dataIo, /picks: read\.fields\.map\(\(_, i\) => i\).filter\(\(i\) => !present\[i\]\),/);
  assert.match(builderModal, /if \(m\.kind === 'field-import'\) \{/);
  assert.match(builderModal, /data-wb-fi-pick="\$\{i\}"/);
  assert.match(builderModal, /data-wb-fi-go/);
  // The ticks live on the modal, not in the DOM: every one of these re-renders.
  assert.match(main, /m\.picks = b\.checked \? \[\.\.\.m\.picks, at\] : m\.picks\.filter\(\(i\) => i !== at\);/);
  assert.match(main, /if \(fiGo\) fiGo\.onclick = \(\) => wbApplyFieldImport\(m\);/);
});

test('the import adds and never replaces', () => {
  // The one promise that makes this safe to press on an app with records in it. Clearing the
  // old fields out first is the Fields tab's own bulk delete, which shows what it will destroy.
  assert.match(dataIo, /app\.fields\.push\(\.\.\.fields\);/);
  assert.ok(!/app\.fields = /.test(dataIo), 'nothing here reassigns the field list');
  assert.match(builderModal, /These are <b>added to<\/b>/);
});

/* ---- what this app is MISSING is what comes across --------------------------------------- */

test('a field the app already has is found by label, ignoring case and space', () => {
  // Ids are per-app and would match nothing. The label is what "the same field" means to
  // somebody looking at two apps -- the rule matchedFields already uses for a relationship.
  const found = presentIn(
    [{ id: 'a', label: ' amount ', type: 'money' }, { id: 'b', label: 'Trade', type: 'category' }],
    [{ id: 'x', label: 'Amount', type: 'text' }],
  );
  assert.deepEqual(found, [{ label: 'Amount', type: 'text' }, null]);
});

test('presentIn reports, it does not filter', () => {
  // The dialog needs the whole list so it can SAY what it is leaving out, and so somebody can
  // still tick one deliberately.
  const found = presentIn([{ label: 'A' }, { label: 'B' }], [{ label: 'A' }]);
  assert.equal(found.length, 2);
});

test('the target holding two fields of one name resolves to the first', () => {
  // Same tie-break as everywhere else that resolves a field by name; picking the later one
  // would differ from the rest of the app for no reason anybody could see.
  const found = presentIn([{ label: 'Amount' }], [{ id: 'first', label: 'Amount' }, { id: 'second', label: 'amount' }]);
  assert.deepEqual(found, [{ label: 'Amount', type: '' }]);
});

test('what arrives ticked is what this app is missing', () => {
  // "if other field types with the same label is not present or does not exist let it be ...
  // ignore fields that do not match the current." A second Amount beside the Amount already
  // holding values is not reuse, it is a mess to clean up.
  assert.match(dataIo, /const present = presentIn\(read\.fields, app\.fields\);/);
  assert.match(dataIo, /picks: read\.fields\.map\(\(_, i\) => i\).filter\(\(i\) => !present\[i\]\),/);
  // The row is still tickable, and the dialog says what it left out and why.
  assert.match(builderModal, /Already here/);
  assert.ok(builderModal.includes("<b>already ${alreadyVerb} here</b>"), 'the dialog says what it is leaving out');
  assert.ok(!/disabled/.test(builderModal.split('wb-fi-pick')[1].split('</label>')[0]), 'an already-here row is unticked, not disabled');
});

test('ticking an already-here field numbers it rather than touching what is there', () => {
  // The escape hatch for the case the label cannot see: an Amount that is text here and money
  // there. Nothing is ever written over -- the existing field keeps its values.
  const existing = [{ id: 'x', label: 'Amount', type: 'text' }];
  const { fields, renamed } = adoptFields([{ id: 'f1', label: 'Amount', type: 'money', config: {} }], existing, { makeId });
  assert.equal(fields[0].label, 'Amount 2');
  assert.deepEqual(renamed, [{ from: 'Amount', to: 'Amount 2' }]);
  assert.deepEqual(existing, [{ id: 'x', label: 'Amount', type: 'text' }]);
});

test('the chip names the type it is here AS, but only when that differs', () => {
  // Two fields called Amount look identical in a list. Which one is money and which is text is
  // the entire reason somebody would tick a row the app already has.
  assert.match(builderModal, /mine && mine\.type !== field\.type/);
  assert.ok(builderModal.includes("wb-fi-has${asType ? ' differs' : ''}"), 'the differs modifier rides on the chip itself');
});

test('every class the dialog draws is styled', () => {
  for (const name of ['wb-fi-bar', 'wb-fi-list', 'wb-fi-row', 'wb-fi-meta', 'wb-fi-has']) {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  }
  // A twenty-field app must not push the Add button off the bottom of a phone.
  assert.match(styles, /\.wb-fi-list \{ max-height: 46vh; overflow-y: auto;/);
});
