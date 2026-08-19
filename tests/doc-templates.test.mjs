import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { DOC_TEMPLATES, buildTemplate } from '../src/form/doc-templates.js';
import { normalizeDoc, pageMm } from '../src/form/doc-model.js';
import { writePdf } from '../src/form/doc-pdf.js';
import { plainFieldText } from '../src/form/host-values.js';

// A document that already looks like something.
//
// "On the setup of form field, I can set up a default form that they will use when they use this
// field, or start from blank."
//
// A template is not a special kind of document -- it BUILDS an ordinary one, which is then dragged
// around and rewritten like any other. Nothing here is locked, and that is the point.

const APP_FIELDS = [
  { id: 'f-ref', type: 'autonumber', label: 'Job number', config: {} },
  { id: 'f-client', type: 'text', label: 'Client', config: {} },
  { id: 'f-site', type: 'location', label: 'Site address', config: {} },
  { id: 'f-when', type: 'date', label: 'Start date', config: {} },
  { id: 'f-scope', type: 'textarea', label: 'Scope of work', config: {} },
  { id: 'f-total', type: 'money', label: 'Contract value', config: {} },
];

const built = (id, fields = APP_FIELDS) => normalizeDoc(buildTemplate(id, fields), () => `e${Math.random()}`);

test('every template is offered with a name and a line saying what it is', () => {
  assert.ok(DOC_TEMPLATES.length >= 4, 'one template is not a choice');
  for (const template of DOC_TEMPLATES) {
    assert.match(template.id, /^[a-z][a-z-]*$/, `${template.id} is not a usable id`);
    assert.ok(template.name && template.name.length < 20, `${template.name} is not a name`);
    assert.ok(template.hint && template.hint.length > 10, `${template.id} does not say what it is`);
    assert.equal(typeof template.build, 'function');
  }
  const ids = DOC_TEMPLATES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'two templates share an id');
});

test('every template builds a real document that fits on the paper', () => {
  // An element hanging off the edge prints as nothing and nobody knows why -- so this is checked
  // against the page the template itself asks for, not against an assumption about A4.
  for (const template of DOC_TEMPLATES) {
    const doc = built(template.id);
    const [pw, ph] = pageMm(doc.page);
    assert.ok(doc.elements.length >= 6, `${template.id} is barely a layout`);
    for (const el of doc.elements) {
      assert.ok(el.x >= 0 && el.x + el.w <= pw + 0.01, `${template.id}: ${el.kind} runs off the side`);
      assert.ok(el.y >= 0 && el.y + el.h <= ph + 0.01, `${template.id}: ${el.kind} runs off the bottom`);
    }
  }
});

test('an unknown template is nothing, not a broken page', () => {
  assert.equal(buildTemplate('nope', APP_FIELDS), null);
  assert.equal(buildTemplate('', APP_FIELDS), null);
  assert.equal(buildTemplate(undefined), null);
});

// --- what fills itself in ---------------------------------------------------------------------

test('a placed slot binds to the app\'s own field, so the document reads live', () => {
  const doc = built('proposal');
  const bound = doc.elements.filter((el) => el.kind === 'field');
  assert.ok(bound.length >= 4, 'a proposal that fills in nothing is just clip art');
  // The client line is the client field, not the first text box that happened to come along.
  assert.ok(bound.some((el) => el.from === 'f-client'));
  assert.ok(bound.some((el) => el.from === 'f-total'));
  assert.ok(bound.some((el) => el.from === 'f-when'));
});

test('a label match beats a type match', () => {
  // An app with four text fields has exactly one called Client; taking the first would put the
  // job number where the name belongs.
  const fields = [
    { id: 'f-a', type: 'text', label: 'Internal notes', config: {} },
    { id: 'f-b', type: 'text', label: 'Client', config: {} },
  ];
  const doc = built('letter', fields);
  const bound = doc.elements.filter((el) => el.kind === 'field');
  assert.ok(bound.some((el) => el.from === 'f-b'), 'the field actually called Client must win');
});

test('type priority is the template\'s order, not the order the app declared its fields in', () => {
  // An address wants a Location field before it wants any old text box, even when the text box
  // was added to the app first.
  const fields = [
    { id: 'f-text', type: 'text', label: 'Anything', config: {} },
    { id: 'f-loc', type: 'location', label: 'Where', config: {} },
  ];
  const doc = built('work-order', fields);
  const bound = doc.elements.filter((el) => el.kind === 'field');
  assert.ok(bound.some((el) => el.from === 'f-loc'), 'the Location field is the address');
});

test('one field never fills two slots on the same page', () => {
  // The same words printed twice reads as a broken template rather than an unmatched one.
  for (const template of DOC_TEMPLATES) {
    const bound = built(template.id).elements.filter((el) => el.kind === 'field').map((el) => el.from);
    assert.equal(new Set(bound).size, bound.length, `${template.id} used one field twice`);
  }
});

test('an app with nothing to bind still gets the whole layout, in words', () => {
  // This is what makes a template safe to offer on any app at all.
  for (const template of DOC_TEMPLATES) {
    const doc = built(template.id, []);
    assert.equal(doc.elements.filter((el) => el.kind === 'field').length, 0);
    assert.ok(doc.elements.length >= 6, `${template.id} collapsed without fields to bind`);
    assert.ok(
      doc.elements.some((el) => el.kind === 'text' && el.text.trim()),
      `${template.id} came out blank`,
    );
  }
});

test('a bound slot prints the value alone, not "Client: value"', () => {
  // The template has already written the heading where it wanted one.
  const doc = built('invoice');
  for (const el of doc.elements.filter((entry) => entry.kind === 'field')) {
    assert.equal(el.withLabel, false, 'a label would be printed twice');
  }
});

test('a slot that binds keeps its words as the fallback, for a record that is empty', () => {
  const doc = built('proposal');
  const client = doc.elements.find((el) => el.kind === 'field' && el.from === 'f-client');
  assert.ok(client.fallback, 'an empty record would print a blank line with no hint what goes there');
});

// --- it survives the whole pipeline --------------------------------------------------------------

test('a template prints, through the real PDF writer', () => {
  const doc = built('proposal');
  const values = { 'f-client': 'Acme Roofing', 'f-total': 42500 };
  const items = doc.elements.map((el) => ({
    ...el,
    text: el.kind === 'field'
      ? plainFieldText(APP_FIELDS.find((f) => f.id === el.from), values[el.from], {})
      : (el.text || ''),
  }));
  const bytes = writePdf({ page: doc.page, items, images: [], title: 'Proposal' });
  const text = Buffer.from(bytes).toString('latin1');
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.trimEnd().endsWith('%%EOF'));
  assert.ok(text.includes('(Proposal) Tj'), 'the heading the template wrote');
  assert.ok(text.includes('(Acme Roofing) Tj'), 'and the record it was filled in from');
  assert.ok(text.includes('($42,500.00) Tj'), `expected the formatted total: ${text.match(/\([^)]*\) Tj/g)}`);
});

// --- where it is offered ---------------------------------------------------------------------

test('the builder offers them, and only replaces a full page on purpose', () => {
  const editor = readFileSync(new URL('../src/form/doc-editor.js', import.meta.url), 'utf8');
  assert.match(editor, /data-fd-template="\$\{esc\(template\.id\)\}"/);
  // Up front while the page is empty -- which is when it is wanted and when it can do no harm --
  // and behind a toggle afterwards, because replacing somebody's layout is a decision.
  assert.match(editor, /const empty = !doc\.elements\.length;/);
  assert.match(editor, /data-fd-templates/);
  // Through commit(), so Undo takes it back like anything else.
  assert.match(editor, /commit\(\{ \.\.\.doc, page: built\.page, elements: built\.elements \}\)/);
  // The name, the versions and any uploaded PDF are the document's, not the template's.
  assert.ok(!/elements: built\.elements, versions/.test(editor));
});

test('the field setup says where the templates are', () => {
  // The question was asked on the setup screen, so that is where the answer has to be readable.
  const panel = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8');
  assert.match(panel, /Proposal<\/b>, <b>Invoice/);
  assert.match(panel, /or just start dragging things on/i);
});
