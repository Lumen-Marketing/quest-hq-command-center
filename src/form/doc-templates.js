// Documents that already look like something, so nobody starts from an empty page.
//
// "I can set up a default form that they will use when they use this field, or start from blank."
//
// A template is not a special kind of document: it BUILDS an ordinary one, which is then dragged
// around and rewritten like any other. That is the point -- nothing here is locked, and a layout
// that is 80% right is worth more than a blank page and an explanation.
//
// Pure: shapes and millimetres, no DOM. Laid out for A4 portrait with a 14 mm margin, which
// leaves 182 mm of usable width -- every x and w below is a fraction of that.

/**
 * What a placed element would rather be filled in FROM.
 *
 * A template cannot know an app's field ids, so it says what it wants -- a client, a date, a
 * total -- and the app's own fields are matched to it at the moment the template is used. When
 * nothing matches, the element stays as the words in `text`, which still reads correctly on a
 * printed page. That fallback is what makes these safe to offer on any app at all.
 */
const WANTS = {
  client: { types: ['company_contact', 'relationship', 'text'], label: /client|customer|contact|name|company/i },
  address: { types: ['location', 'textarea', 'text'], label: /address|site|property|location/i },
  date: { types: ['date'], label: /date/i },
  total: { types: ['money', 'calculation', 'rollup', 'number'], label: /total|amount|price|value|cost/i },
  reference: { types: ['autonumber', 'text'], label: /number|ref|invoice|job|order|id/i },
  scope: { types: ['textarea'], label: /scope|note|detail|description|summary/i },
};

/**
 * The app's best field for what an element wants.
 *
 * Three rules, in order, and each one exists because of a way this goes wrong:
 *
 *  1. A LABEL match wins. An app with four text fields has exactly one called "Client", and
 *     taking the first text field instead puts the job number where the client's name belongs.
 *  2. Then TYPE PRIORITY, in the order the want lists them -- not the order the app happens to
 *     declare its fields in. An address wants a Location field before it wants any old text box.
 *  3. Nothing already used. One field filling the client line AND the address line prints the
 *     same words twice and reads as a broken template rather than an unmatched one.
 */
function pickField(fields, want, used) {
  const rule = WANTS[want];
  if (!rule) return null;
  const free = (fields || []).filter((field) => field && !used.has(field.id));
  const usable = free.filter((field) => rule.types.includes(field.type));
  const named = usable.find((field) => rule.label.test(String(field.label || '')));
  const byType = rule.types.map((type) => usable.find((field) => field.type === type)).find(Boolean);
  const found = named || byType || null;
  if (found) used.add(found.id);
  return found;
}

/**
 * One line of the layout, resolved against the app: a live field where possible, words where not.
 *
 * Named `slot` rather than `resolve` on purpose -- a module-level `resolve` collides with the
 * name main.js uses for promises, and the extracted-module guard cannot tell the two apart.
 */
function slot(spec, ctx) {
  const {
    want, text = '', withLabel = false, ...box
  } = spec;
  const field = want ? pickField(ctx.fields, want, ctx.used) : null;
  // withLabel off: a proposal says "Acme Roofing", not "Client: Acme Roofing". The template has
  // already written the heading, if it wanted one.
  if (field) return { ...box, kind: 'field', from: field.id, withLabel, fallback: text };
  return { ...box, kind: 'text', text };
}

const line = (y, w = 182, x = 14, thickness = 0.6) => ({
  kind: 'shape',
  shape: 'line',
  x,
  y,
  w,
  h: 1,
  style: { stroke: '#111111', strokeWidth: thickness },
});

const heading = (text, y, size = 12) => ({
  kind: 'text', text, x: 14, y, w: 182, h: 7, style: { size, bold: true },
});

const quiet = (text, x, y, w) => ({
  kind: 'text', text, x, y, w, h: 6, style: { size: 9, bold: true, color: '#6b7280' },
});

/** Two signature blocks side by side, which is how every one of these documents ends. */
const signatures = (y, left = 'Accepted by', right = 'Date') => [
  line(y, 80, 14),
  { kind: 'text', text: left, x: 14, y: y + 2, w: 80, h: 6, style: { size: 9, color: '#6b7280' } },
  line(y, 80, 116),
  { kind: 'text', text: right, x: 116, y: y + 2, w: 80, h: 6, style: { size: 9, color: '#6b7280' } },
];

export const DOC_TEMPLATES = [
  {
    id: 'proposal',
    name: 'Proposal',
    hint: 'Client, scope and a total to sign off',
    build: (ctx) => [
      { kind: 'text', text: 'Proposal', x: 14, y: 16, w: 120, h: 14, style: { size: 26, bold: true } },
      slot({
        want: 'reference', text: '', x: 136, y: 20, w: 60, h: 7, style: { size: 10, align: 'right', color: '#6b7280' },
      }, ctx),
      line(34),
      slot({
        want: 'client', text: 'Client name', x: 14, y: 40, w: 110, h: 8, style: { size: 13, bold: true },
      }, ctx),
      slot({
        want: 'date', text: '', x: 136, y: 41, w: 60, h: 7, style: { size: 10, align: 'right', color: '#6b7280' },
      }, ctx),
      slot({
        want: 'address', text: 'Site address', x: 14, y: 49, w: 110, h: 12, style: { size: 10, color: '#4b5563' },
      }, ctx),
      heading('Scope of work', 68),
      slot({
        want: 'scope',
        text: 'What the job covers, written the way you would say it to the client.',
        x: 14,
        y: 77,
        w: 182,
        h: 70,
        style: { size: 11 },
      }, ctx),
      heading('What it costs', 156),
      line(164),
      { kind: 'text', text: 'Total', x: 100, y: 168, w: 50, h: 8, style: { size: 13, bold: true, align: 'right' } },
      slot({
        want: 'total', text: '', x: 152, y: 168, w: 44, h: 8, style: { size: 13, bold: true, align: 'right' },
      }, ctx),
      ...signatures(240),
    ],
  },
  {
    id: 'invoice',
    name: 'Invoice',
    hint: 'Bill to, a number, and the amount due',
    build: (ctx) => [
      { kind: 'text', text: 'Invoice', x: 14, y: 16, w: 120, h: 14, style: { size: 26, bold: true } },
      slot({
        want: 'reference', text: 'No. 0001', x: 136, y: 20, w: 60, h: 7, style: { size: 11, align: 'right', bold: true },
      }, ctx),
      slot({
        want: 'date', text: '', x: 136, y: 29, w: 60, h: 7, style: { size: 10, align: 'right', color: '#6b7280' },
      }, ctx),
      line(40),
      quiet('Bill to', 14, 46, 80),
      slot({
        want: 'client', text: 'Client name', x: 14, y: 53, w: 110, h: 8, style: { size: 13, bold: true },
      }, ctx),
      slot({
        want: 'address', text: 'Billing address', x: 14, y: 62, w: 110, h: 14, style: { size: 10, color: '#4b5563' },
      }, ctx),
      heading('Work carried out', 90),
      slot({
        want: 'scope', text: 'One line per item, and what each one was for.', x: 14, y: 99, w: 182, h: 80, style: { size: 11 },
      }, ctx),
      line(188),
      { kind: 'text', text: 'Amount due', x: 90, y: 192, w: 60, h: 8, style: { size: 13, bold: true, align: 'right' } },
      slot({
        want: 'total', text: '', x: 152, y: 192, w: 44, h: 8, style: { size: 13, bold: true, align: 'right' },
      }, ctx),
      { kind: 'text', text: 'Thank you for your business.', x: 14, y: 214, w: 182, h: 6, style: { size: 10, color: '#6b7280' } },
      ...signatures(255, 'Paid by', 'Date paid'),
    ],
  },
  {
    id: 'work-order',
    name: 'Work order',
    hint: 'Who, where, what to do, and a sign-off',
    build: (ctx) => [
      { kind: 'shape', shape: 'rect', x: 14, y: 14, w: 182, h: 26, style: { fill: '#f3f4f6', stroke: 'none', radius: 3 } },
      { kind: 'text', text: 'Work order', x: 20, y: 20, w: 110, h: 12, style: { size: 20, bold: true } },
      slot({
        want: 'reference', text: '', x: 130, y: 24, w: 60, h: 7, style: { size: 11, align: 'right', bold: true },
      }, ctx),
      quiet('Client', 14, 50, 60),
      slot({
        want: 'client', text: 'Client name', x: 14, y: 57, w: 88, h: 8, style: { size: 12 },
      }, ctx),
      quiet('Scheduled', 108, 50, 60),
      slot({
        want: 'date', text: '', x: 108, y: 57, w: 88, h: 8, style: { size: 12 },
      }, ctx),
      quiet('Address', 14, 70, 60),
      slot({
        want: 'address', text: 'Site address', x: 14, y: 77, w: 182, h: 12, style: { size: 12 },
      }, ctx),
      line(94),
      heading('What needs doing', 100),
      slot({
        want: 'scope', text: 'The work, step by step.', x: 14, y: 109, w: 182, h: 90, style: { size: 11 },
      }, ctx),
      heading('Notes from site', 208),
      {
        kind: 'shape', shape: 'rect', x: 14, y: 216, w: 182, h: 40, style: { fill: 'none', stroke: '#d1d5db', strokeWidth: 0.4, radius: 3 },
      },
      ...signatures(266, 'Completed by', 'Date'),
    ],
  },
  {
    id: 'letter',
    name: 'Letter',
    hint: 'A plain letterhead, a date and a body',
    build: (ctx) => [
      { kind: 'text', text: 'Your company', x: 14, y: 16, w: 120, h: 10, style: { size: 16, bold: true } },
      { kind: 'text', text: 'Address · Phone · Email', x: 14, y: 27, w: 120, h: 6, style: { size: 9, color: '#6b7280' } },
      line(38),
      slot({
        want: 'date', text: '', x: 136, y: 46, w: 60, h: 7, style: { size: 10, align: 'right', color: '#6b7280' },
      }, ctx),
      slot({
        want: 'client', text: 'Client name', x: 14, y: 56, w: 110, h: 8, style: { size: 12, bold: true },
      }, ctx),
      slot({
        want: 'address', text: 'Their address', x: 14, y: 65, w: 110, h: 14, style: { size: 10, color: '#4b5563' },
      }, ctx),
      { kind: 'text', text: 'Dear', x: 14, y: 90, w: 182, h: 7, style: { size: 11 } },
      { kind: 'text', text: 'What you want to say.', x: 14, y: 100, w: 182, h: 110, style: { size: 11 } },
      { kind: 'text', text: 'Kind regards,', x: 14, y: 220, w: 90, h: 7, style: { size: 11 } },
      line(242, 80, 14),
      { kind: 'text', text: 'Name and title', x: 14, y: 244, w: 80, h: 6, style: { size: 9, color: '#6b7280' } },
    ],
  },
];

/**
 * One template, as a document.
 *
 * Returns the page and the elements ONLY. Anything else the document has -- its name, the
 * versions saved along the way, an uploaded PDF sitting beside the design -- belongs to the
 * document and is the caller's to keep: a template replaces a layout, not a history.
 */
export function buildTemplate(id, fields = []) {
  const found = DOC_TEMPLATES.find((template) => template.id === id);
  if (!found) return null;
  return {
    page: { size: 'a4', landscape: false, margin: 14 },
    // `used` is shared across the whole layout, which is what stops one field being claimed by
    // three different slots on the same page.
    elements: found.build({ fields, used: new Set() }),
  };
}
