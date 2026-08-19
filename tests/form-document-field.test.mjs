import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

import { collectFieldConfig, createFieldInput, renderFieldConfig } from '../src/workspace/field-config-ui.js';
import { normalizeDoc } from '../src/form/doc-model.js';

// The Form field, end to end through the code that actually runs.
//
// This field has been shipped wrong twice, both times with every test green:
//   - registered in WB_FIELD_TYPES but not WB_FIELD_ORDER, so the palette never drew it. The
//     render tests passed because they called the renderers directly and never the palette.
//   - built as a label/value form filler when what was asked for was a document builder.
// So these tests CALL the panel, CALL the record renderer, and read main.js for the one line that
// makes the button do anything -- a card with a dead button is the same bug as a missing field.

const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const CONFIG_UI = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8');

const APP = {
  id: 'app-deals',
  name: 'Deals',
  fields: [
    { id: 'f-form', type: 'form', label: 'Proposal', config: {} },
    { id: 'f-client', type: 'text', label: 'Client', config: {} },
    { id: 'f-total', type: 'money', label: 'Contract value', config: {} },
    { id: 'f-btn', type: 'button', label: 'Send', config: {} },
  ],
  items: [],
};

const configCtx = {
  h,
  state: { builderModal: { companyId: 'co', workspaceId: 'ws', appId: 'app-deals' } },
  canonicalCompanyId: (id) => id || 'co',
  companyName: () => 'Quest Roofing',
  wbProgressDisplayHtml: () => '',
  wbRelTargetApp: () => null,
  wbCompanyApps: () => [],
  wbTargetApp: () => null,
  wbRelLabel: () => '',
  companyContactFieldsFor: () => [],
  WB_PROGRESS_STOPS_DEFAULT: [],
  WB_FIELD_TYPES: { form: { label: 'Form' } },
  WB_PROGRESS_DISPLAYS: [['bar', 'Linear bar']],
};

const renderInput = (field, value = '') => createFieldInput({
  h,
  WB_FIELD_TYPES: { form: { label: 'Form' } },
  companyContactOptions: () => [],
  wbMembers: () => [],
  wbRelTargetApp: () => null,
  wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [APP] }] }),
  wbRelLabel: () => '',
  wbProgressColor: () => '#000',
  wbProgressDisplayHtml: () => '',
  wbChecklistValue: () => ({ steps: [] }),
  wbChecklistBodyHtml: () => '',
  wbRatingStars: () => '',
  wbAutoNumberText: () => '',
  companyContactFieldsFor: () => [],
})('co', 'ws', field, value);

const DESIGN = {
  title: 'Roof Proposal',
  page: { size: 'a4', margin: 14 },
  elements: [
    { id: 'e1', kind: 'text', text: 'Roof Replacement Proposal', x: 14, y: 12, w: 180, h: 12, style: { size: 20, bold: true } },
    { id: 'e2', kind: 'field', from: 'f-client', x: 14, y: 40, w: 90, h: 8 },
    { id: 'e3', kind: 'shape', shape: 'line', x: 14, y: 34, w: 182, h: 1 },
  ],
};

// --- the field's own panel ------------------------------------------------------------------------

test('the panel is a name and a button that opens the builder, not a description of a layout', () => {
  const html = renderFieldConfig({ id: 'f-form', type: 'form', label: 'Proposal', config: {} }, APP, configCtx);
  assert.match(html, /id="wbFormTitle"/, 'the document has a name');
  assert.match(html, /data-wb-form-open="wbFormDoc"/, 'and a button that opens the real thing');
  assert.match(html, /id="wbFormDoc"/, 'the starting document rides in a hidden input');
  assert.match(html, /Design the document/, 'an empty field says design, not edit');
  // The row-based scaffolding this replaced tried to describe a document with inputs. If any of it
  // comes back, this field has regressed to a form filler.
  ['data-wb-form-row', 'data-wb-form-add', 'data-wb-form-formula', 'Add a field to the form'].forEach((gone) => {
    assert.ok(!html.includes(gone), `${gone} is the form-filler scaffolding, which was the wrong field`);
  });
});

test('a field that already has a design says edit, and shows a thumbnail of it', () => {
  const html = renderFieldConfig({ id: 'f-form', type: 'form', label: 'Proposal', config: { doc: DESIGN } }, APP, configCtx);
  assert.match(html, /Edit the starting document/);
  assert.match(html, /class="wb-form-mini"/);
  // Three elements, three blocks, each placed as a percentage of the page so the thumbnail keeps
  // the document's proportions at any size.
  assert.equal((html.match(/wb-form-blk/g) || []).length, 3);
  assert.match(html, /left:6\.67%/, '14 mm across a 210 mm page');
});

test('the panel renders for every combination of empty, designed and uploaded', () => {
  // renderFieldConfig throwing takes the WHOLE panel down, not just one control -- which is how
  // the relationship panel once went blank. Nothing here inspects the output; it only has to run.
  [
    {},
    { doc: DESIGN },
    { doc: { ...DESIGN, source: 'upload', upload: { name: 'Signed.pdf', src: 'data:application/pdf;base64,AA' } } },
    { doc: { elements: 'not an array', page: { size: 'foolscap' } } },
  ].forEach((config, i) => {
    assert.doesNotThrow(
      () => renderFieldConfig({ id: 'f-form', type: 'form', label: 'Proposal', config }, APP, configCtx),
      `config ${i} took the panel down`,
    );
  });
});

test('an uploaded PDF is named in the thumbnail rather than drawn as blocks', () => {
  const html = renderFieldConfig({
    id: 'f-form',
    type: 'form',
    label: 'Proposal',
    config: { doc: { ...DESIGN, source: 'upload', upload: { name: 'Signed contract.pdf', src: 'data:application/pdf;base64,AA' } } },
  }, APP, configCtx);
  assert.match(html, /wb-form-mini uploaded/);
  assert.match(html, /Signed contract\.pdf/);
  assert.ok(!html.includes('wb-form-blk'), 'the design is not what this document is any more');
});

// --- reading the panel back -----------------------------------------------------------------------

test('the panel is read back into config.doc, with the typed name winning', () => {
  const nodes = {
    wbFormTitle: { value: '  Proposal v2  ' },
    wbFormDoc: { value: JSON.stringify({ ...DESIGN, title: 'stale name from the builder' }) },
  };
  globalThis.document = { getElementById: (id) => nodes[id] || null, querySelectorAll: () => [] };
  try {
    const config = {};
    collectFieldConfig('form', config, 'co');
    assert.equal(config.doc.title, 'Proposal v2', 'the name is typed in the panel, so it wins');
    assert.equal(config.doc.elements.length, 3, 'the design came back with it');
  } finally { delete globalThis.document; }
});

test('a panel whose hidden input holds nonsense reads as an empty document, not a crash', () => {
  globalThis.document = {
    getElementById: (id) => (id === 'wbFormDoc' ? { value: '{{{' } : { value: 'Named' }),
    querySelectorAll: () => [],
  };
  try {
    const config = {};
    collectFieldConfig('form', config, 'co');
    assert.equal(config.doc.title, 'Named');
    assert.ok(!config.doc.elements, 'nothing was invented to replace the broken JSON');
  } finally { delete globalThis.document; }
});

// --- the card on a record -------------------------------------------------------------------------

test('a record shows a card with a preview and a button, the way a sheet does', () => {
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: { doc: DESIGN } });
  assert.match(html, /data-wb-form-open="f-form"/, 'the button names the field it opens');
  assert.match(html, /Open form/);
  assert.match(html, /class="wb-sheet-card"/, 'the same card shape the sheet field uses');
  assert.match(html, /<input type="hidden" data-f="f-form"/, 'one JSON value, like the sheet');
  assert.match(html, /wb-form-mini/, 'and a look at what is in it');
  // The label/value rows of the first attempt must not come back.
  assert.ok(!html.includes('wb-form-row'), 'a document is not a list of labelled inputs');
});

test('an untouched record starts from the field\'s design, so one layout serves the whole app', () => {
  // This is what makes the starting document worth having: without it every record opens blank and
  // the proposal has to be laid out again from scratch, one client at a time.
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: { doc: DESIGN } }, '');
  assert.match(html, /Roof Replacement Proposal/, 'the starting design is in the stored value');
  assert.equal((html.match(/wb-form-blk/g) || []).length, 3);
  assert.match(html, /Open form/, 'and it counts as filled, so the button does not say "start"');
});

test('a record that has its own document keeps it, and does not fall back to the template', () => {
  const own = { title: 'This client only', elements: [{ id: 'x1', kind: 'text', text: 'Bespoke', x: 5, y: 5, w: 50, h: 8 }] };
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: { doc: DESIGN } }, JSON.stringify(own));
  assert.match(html, /Bespoke/);
  assert.ok(!html.includes('Roof Replacement Proposal'), 'the template must not overwrite a record that has moved on');
  assert.equal((html.match(/wb-form-blk/g) || []).length, 1);
});

test('a field with no design at all invites one rather than showing an empty card', () => {
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: {} }, '');
  assert.match(html, /Start the document/);
  assert.match(html, /Nothing on the page yet/);
});

test('the stored value is normalized, so a hand-edited record cannot poison the builder', () => {
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: {} }, JSON.stringify({
    elements: [{ kind: 'text', text: '<img src=x onerror=alert(1)>', x: -50, y: -50, w: 9999, h: 9999 }],
    page: { size: 'billboard' },
  }));
  // The words themselves survive -- they are somebody's document -- but as text, not as a tag. The
  // string "onerror=alert(1)" inside an escaped attribute is inert; an unescaped "<img" is not.
  assert.ok(!/<img/i.test(html), 'markup in element text must be escaped on the way into the card');
  const stored = JSON.parse(html.match(/data-wb-form-title="[^"]*" value="([^"]*)"/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'"));
  assert.equal(stored.page.size, 'a4', 'an unknown page size fell back');
  assert.equal(stored.elements[0].x, 0, 'a negative position was clamped to the page');
});

test('the versions a record has saved are counted on its card', () => {
  const withVersions = { ...DESIGN, versions: [{ id: 'v1', name: 'Sent 12 Aug', elements: [] }, { id: 'v2', name: 'Draft', elements: [] }] };
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: {} }, JSON.stringify(withVersions));
  assert.match(html, /2 saved versions/);
  const one = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: {} }, JSON.stringify({ ...DESIGN, versions: [{ id: 'v1', name: 'Only', elements: [] }] }));
  assert.match(one, /1 saved version(?!s)/);
});

// --- the wiring that makes the button do something -------------------------------------------------

test('the button is wired, in main.js, to a lazily-fetched builder', () => {
  // A card whose button does nothing is the same bug as a field the palette never draws. Both were
  // shipped; both passed every render test.
  assert.match(MAIN, /\[data-wb-form-open\]/, 'nothing listens for the click');
  assert.match(MAIN, /wbOpenForm\(formOpen\.dataset\.wbFormOpen\)/, 'the field id has to reach the opener');
  assert.match(MAIN, /import\('\.\/form\/doc-editor\.js'\)/, 'and the builder is fetched, not bundled');
  // Ordered before the record form's own click handling, the way the sheet's is: opening a
  // document must not also open something behind it.
  assert.ok(
    MAIN.indexOf('[data-wb-form-open]') < MAIN.indexOf("[data-wb-sheet-open]'"),
    'the form click is handled in the same place as the sheet click',
  );
});

test('the Form field is in the palette as well as the type table', () => {
  // The exact mistake of the first attempt: registered, and invisible.
  assert.match(MAIN, /form: \{ label: 'Form'/, 'not in WB_FIELD_TYPES');
  const order = MAIN.match(/const WB_FIELD_ORDER = \[[\s\S]*?\];/);
  assert.ok(order, 'WB_FIELD_ORDER is what the palette iterates');
  assert.match(order[0], /'form'/, "the palette does not draw a type that is not in WB_FIELD_ORDER");
});

test('the record read path knows a form is JSON, so saving it does not stringify an object', () => {
  assert.match(MAIN, /if \(f\.type === 'form'\) \{ try \{ return JSON\.parse\(el\.value \|\| '\{\}'\); \}/);
});

test('nothing in the entry bundle statically imports the builder or the PDF writer', () => {
  // A static import is bundled into the same chunk, which would put a page editor and a PDF
  // generator in front of every session that never opens one. Only a dynamic import splits.
  assert.ok(!/^import[^\n]*form\/doc-editor/m.test(MAIN));
  assert.ok(!/^import[^\n]*form\/doc-pdf/m.test(MAIN));
  // The config panel is itself a lazy chunk, so it may import the model directly -- and does, for
  // the card and the thumbnail.
  assert.match(CONFIG_UI, /from '\.\.\/form\/doc-model\.js'/);
  assert.ok(!/doc-pdf/.test(CONFIG_UI), 'the PDF writer belongs to the export, not to the card');
});

// --- the two halves agree about the stored shape ----------------------------------------------------

test('what the card stores is exactly what the model reads back', () => {
  // The card writes JSON and the builder parses it. A field the card drops, or a shape it invents,
  // is a document that loses part of itself every time the record is opened and closed.
  const html = renderInput({ id: 'f-form', type: 'form', label: 'Proposal', config: { doc: DESIGN } }, '');
  const raw = html.match(/data-wb-form-title="[^"]*" value="([^"]*)"/)[1]
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
  const stored = JSON.parse(raw);
  const round = normalizeDoc(stored, () => 'x');
  assert.deepEqual(round, stored, 'a round trip through the model changed the document');
});

// --- a document must not leak its JSON into the places a value is shown as text -------------------

test('a document never prints its own JSON in a cell, a CSV column or a title', () => {
  // Exactly the bug the Sheet field already fixed, and the reason its cases exist: falling through
  // to the default branch put `{"rows":39,"cols":24,"cells":…` in the activity feed as the record's
  // title. A document is bigger than a sheet, so it would be worse.
  const at = MAIN.indexOf("    case 'form': {");
  assert.notEqual(at, -1, 'a form value in a table cell falls through to h(value): the page as JSON');
  const cell = MAIN.slice(at, MAIN.indexOf('\n    }', at));
  assert.match(cell, /wbSheetLabel\(value, 'Document'\)/, 'the cell shows the name, not the contents');
  assert.ok(!/JSON\.stringify|value\}/.test(cell), 'nothing about the cell may print the value itself');
  assert.ok(/case 'form': return wbSheetLabel\(value, 'Document'\);/.test(MAIN), 'the search index and CSV column print the JSON');
  // wbNameValue is what titles a record and what the activity feed reads.
  const names = MAIN.match(/case 'created_time': case 'updated_time': case 'sheet':[^\n]*return '';/);
  assert.ok(names, 'wbNameValue is not shaped as expected');
  assert.match(names[0], /case 'form':/, "a document is not a name, so it must not become a record's title");
});

test('an unnamed document is called Document, not Spreadsheet', () => {
  // The two share one helper; sharing its fallback word too would label every proposal a spreadsheet.
  assert.match(MAIN, /function wbSheetLabel\(raw, fallback = 'Spreadsheet'\)/);
});

// --- the chip in a row opens the document, the way the sheet chip does ------------------------------

test('a form chip in a table row is a button that opens the document', () => {
  const at = MAIN.indexOf("    case 'form': {");
  const cell = MAIN.slice(at, MAIN.indexOf('\n    }', at));
  assert.match(cell, /data-wb-form-row="\$\{h\(field\.id\)\}"/, 'the chip must name its field');
  assert.match(cell, /data-wb-form-ctx="\$\{h\(wbSeat\(ctx\)\)\}"/, 'and the record it sits on');
  // Without an item there is no record to open -- a header, a template preview -- so it stays inert
  // rather than being a button that cannot work.
  assert.match(cell, /ctx\.item\s*\n?\s*\?/, 'a chip with no record behind it must not be clickable');
  assert.match(cell, /<span class="wb-sheet-chip">/, 'and falls back to plain text');
});

test('the row click is delegated, and stops the row from also opening', () => {
  // The record modal opens on a row click. Without stopPropagation, one press on the chip opens the
  // document AND the record behind it -- which is what the sheet chip already guards against.
  const at = MAIN.indexOf("const formRow = event.target.closest('[data-wb-form-row]');");
  assert.notEqual(at, -1, 'nothing listens for a click on the chip');
  const branch = MAIN.slice(at, at + 400);
  assert.match(branch, /event\.preventDefault\(\)/);
  assert.match(branch, /event\.stopPropagation\(\)/);
  assert.match(branch, /wbOpenFormRow\(formRow\.dataset\.wbFormRow, formRow\.dataset\.wbFormCtx \|\| ''\)/);
});

test('the row opener is lazy too, and hands over what it needs to find the record', () => {
  // Both ways in share one named context now, so what the row opener gets is what that names.
  const at = MAIN.indexOf('function wbOpenFormRow(');
  assert.notEqual(at, -1);
  const body = MAIN.slice(at, MAIN.indexOf('\n}', at));
  assert.ok(body.includes('openForRecord(fieldId, seat, wbDocEditorCtx())'));
  const loader = MAIN.slice(MAIN.indexOf('const wbOpenDoc ='), MAIN.indexOf('function wbOpenFormRow('));
  assert.ok(loader.includes("import('./form/doc-editor.js')"), 'a page editor must not be in the entry bundle');
  const shared = MAIN.slice(MAIN.indexOf('const wbDocEditorCtx ='), MAIN.indexOf('const wbOpenDoc ='));
  // wbSave and render, because a row has no form around it to write the change back through.
  ['wbDoc', 'wbSave', 'render', 'can'].forEach((needed) => {
    assert.ok(shared.includes(needed), `${needed} has to reach the module`);
  });
});

// --- an image field is placed as a picture --------------------------------------------------------

test('the picture a field is holding is found however the app stored it', async () => {
  const { fieldImageUrl } = await import('../src/form/host-values.js');
  const image = { id: 'f-photo', type: 'image', label: 'Roof photo', config: {} };
  // One object, an array of them, a JSON string of either, or a bare URL -- every shape the file
  // field has ever written.
  assert.equal(fieldImageUrl(image, '{"name":"a.png","url":"https://x/a.png?token=1.2.3"}'), 'https://x/a.png?token=1.2.3');
  assert.equal(fieldImageUrl(image, [{ name: 'a.jpg', url: 'u/a.jpg' }, { url: 'b.png' }]), 'u/a.jpg');
  assert.equal(fieldImageUrl(image, 'https://x/photo.WEBP'), 'https://x/photo.WEBP');
  assert.equal(fieldImageUrl(image, 'data:image/png;base64,AA'), 'data:image/png;base64,AA');
});

test('a signed link is judged on its path, not on the token hanging off it', () => {
  // Every Supabase URL ends in something like "...&token=eyJ.hbG.ci0", so reading the extension
  // off the whole string finds ".ci0" and decides nothing is ever a picture.
  const image = { id: 'f-photo', type: 'image', config: {} };
  return import('../src/form/host-values.js').then(({ fieldImageUrl }) => {
    assert.ok(fieldImageUrl(image, 'https://s.co/o/sign/roof.jpeg?token=eyJ.hbG.ci0'));
    assert.equal(fieldImageUrl(image, 'https://s.co/o/sign/scope.pdf?token=eyJ.hbG.png'), '', 'the token must not decide it either');
  });
});

test('only a picture is a picture', async () => {
  const { fieldImageUrl } = await import('../src/form/host-values.js');
  // A file field holding a document keeps printing its name -- that is all a page can say about
  // a spreadsheet -- and a text field holding a URL is text, not an image somebody smuggled in.
  assert.equal(fieldImageUrl({ type: 'file', config: {} }, '{"name":"scope.pdf","url":"https://x/scope.pdf"}'), '');
  assert.equal(fieldImageUrl({ type: 'text', config: {} }, 'https://x/a.png'), '');
  assert.equal(fieldImageUrl({ type: 'image', config: {} }, ''), '');
  assert.equal(fieldImageUrl(null, 'https://x/a.png'), '');
  // But a file field that really is holding one draws it.
  assert.equal(fieldImageUrl({ type: 'file', config: {} }, '{"name":"roof.jpg","url":"https://x/roof.jpg"}'), 'https://x/roof.jpg');
});

// --- a placed field prints a NAME, never an id ----------------------------------------------------

test('a company contact prints the person, not cc-91dffeeb-0787-49a8-...', async () => {
  // The id lives in the company's own contact directory, not among the app's records, so the
  // resolver that walks app.items finds nothing and prints the raw id onto the document.
  const { plainFieldText } = await import('../src/form/host-values.js');
  const field = { id: 'f-contact', type: 'company_contact', label: 'Client', config: {} };
  const helpers = {
    contactName: (id) => (id === 'cc-91dffeeb' ? 'Eugenio Roman' : ''),
    recordTitle: (id) => String(id),
  };
  assert.equal(plainFieldText(field, 'cc-91dffeeb', helpers), 'Eugenio Roman');
});

test('a contact nobody can resolve still shows its id, rather than an empty line', () => {
  // A broken link is worth seeing. A blank line on a proposal is not.
  return import('../src/form/host-values.js').then(({ plainFieldText }) => {
    const field = { id: 'f-contact', type: 'company_contact', label: 'Client', config: {} };
    assert.equal(plainFieldText(field, 'cc-gone', { recordTitle: (id) => String(id) }), 'cc-gone');
  });
});

test('the builder hands the contact directory to the resolver, from both ways in', () => {
  const editor = readFileSync(new URL('../src/form/doc-editor.js', import.meta.url), 'utf8');
  assert.match(editor, /function contactNamer\(state\)/);
  assert.match(editor, /state\?\.companyContacts/);
  // Both entry points: the form's hidden input, and a row or the record page.
  assert.equal((editor.match(/contactName: contactNamer\(state\)/g) || []).length, 2);
  // And main.js hands `state` to BOTH ways in, from one named context -- the row path did not
  // need it before, and two copies of the same list is where the next one gets forgotten.
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(main.includes('const wbDocEditorCtx = () => ({'), 'the shared context is not named');
  assert.ok(main.includes('state, wbDoc, wbFind, wbSave, render, can, formatDate, memberName, wbItemTitle,'));
  assert.ok(main.includes('openForRecord(fieldId, seat, wbDocEditorCtx())'), 'the row path must take it');
  assert.ok(main.includes('...wbDocEditorCtx(),'), 'and so must the form path');
});

test('a placed field prints the value with no field name in front of it', async () => {
  const { normalizeElement, elementText } = await import('../src/form/doc-model.js');
  const el = normalizeElement({ kind: 'field', from: 'f-name' }, () => 'e1');
  const fields = [{ id: 'f-name', type: 'text', label: 'Name' }];
  assert.equal(elementText(el, { fields, values: { 'f-name': 'Kim' } }), 'Kim');
});
