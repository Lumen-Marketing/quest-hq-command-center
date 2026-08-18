import assert from 'node:assert/strict';
import test from 'node:test';

import { createCompanyContactsPage } from '../src/company-contacts/page.js';

// Pressing a day on the contact calendar, RENDERED and CLICKED rather than grepped.
//
// The feature's own tests assert that page.js contains the right lines, and this session has
// already been caught four times by exactly that: a source-text assertion cannot tell a bound
// handler from one that throws, and it cannot tell a link that navigates from one whose default
// was cancelled on the way out. So the card is rendered for real, the elements are built from
// the markup that render actually produced, mountCard binds the real handlers, and the presses
// go through them.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const CONTACTS = [
  { id: 'c1', company_id: 'quest', name: 'joe smith', field_values: {}, updated_at: '2026-08-15T00:00:00Z' },
  { id: 'c2', company_id: 'quest', name: 'karen', field_values: {}, updated_at: '2026-08-15T00:00:00Z' },
];

// The same fixture the timeline tests use: two records on 20 Aug, one on 2 Sep, one belonging
// to somebody else. `ws-1` is what the route id is sliced out of.
const doc = () => ({
  workspaces: [{
    id: 'ws-1',
    name: 'Prospecting',
    activity: [],
    apps: [{
      id: 'app1',
      name: 'Prospecting',
      fields: [
        { id: 'f-c', type: 'company_contact', label: 'Contacts' },
        { id: 'f-t', type: 'text', label: 'Name' },
        { id: 'f-d', type: 'date', label: 'Site visit' },
        { id: 'f-d2', type: 'date', label: 'Follow up' },
      ],
      items: [
        { id: 'i1', values: { 'f-c': 'c1', 'f-t': 'Wew', 'f-d': '2026-08-20', 'f-d2': '2026-09-02' } },
        { id: 'i2', values: { 'f-c': 'c1', 'f-t': 'Wew2', 'f-d': '2026-08-20' } },
        { id: 'other', values: { 'f-c': 'c9', 'f-t': 'Not theirs', 'f-d': '2026-08-21' } },
      ],
    }],
  }],
});

function build(overrides = {}) {
  const state = {
    companyContacts: CONTACTS.map((contact) => ({ ...contact })),
    companyContactQuery: '',
    companyContactTypeFilter: 'all',
    // August 2026 rather than today, so the fixture's dates are on screen whenever this runs.
    ccCalAt: '2026-08-15',
    ccCalView: 'month',
    route: { params: new URLSearchParams() },
    ...overrides,
  };
  const renders = [];
  global.window = { confirm: () => true };

  const page = createCompanyContactsPage({
    h,
    state,
    activeCompanyId: () => 'quest',
    canonicalCompanyId: (id) => id || 'quest',
    can: () => true,
    requirePermission: () => true,
    companyContactsFor: () => state.companyContacts,
    companyContactById: (id) => state.companyContacts.find((contact) => contact.id === id) || null,
    companyContactFieldsFor: () => [],
    companyContactChipField: () => null,
    companyContactValue: () => '',
    wbDoc: () => doc(),
    // The record's own title, the way the app builder reads one: the first named field.
    wbNameValue: (app, field, item) => String(item?.values?.[field?.id] ?? ''),
    wbCompanyApps: () => [],
    supabaseWrite: () => Promise.resolve({ ok: true }),
    isLiveSupabaseSession: () => false,
    showToast: () => {},
    render: () => { renders.push(1); },
    navigate: () => {},
    emptyState: (message) => `<div class="empty">${message}</div>`,
    money: (n) => `$${n}`,
    timeAgo: () => '1d ago',
    formatDate: (value) => `on ${String(value).slice(0, 10)}`,
    appHref: (path) => path,
    companyPath: (section, params = {}, companyId = '') => `/${companyId}/${section}?${new URLSearchParams(params)}`,
    WB_FIELD_TYPES: {},
  });

  const card = (contactId = 'c1') => page.renderCompanyContactsPage(
    { params: new URLSearchParams({ contact_id: contactId }) },
    'quest',
  );
  return { page, state, renders, card };
}

// ---- the smallest DOM that carries what render produced ----------------------------------------

const camel = (name) => name.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Every tag in the markup, as a node carrying the attributes it was actually written with. */
function parse(html) {
  const nodes = [];
  for (const [, tag, attrText] of html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*?)?)\/?>/g)) {
    const attrs = {};
    const dataset = {};
    for (const [, name, value] of attrText.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)(?:="([^"]*)")?/g)) {
      attrs[name] = value ?? '';
      if (name.startsWith('data-')) dataset[camel(name)] = value ?? '';
    }
    nodes.push({
      tag,
      attrs,
      dataset,
      className: attrs.class || '',
      tabIndex: 0,
      onclick: null,
      onkeydown: null,
      listeners: [],
      focused: 0,
      addEventListener(type, fn) { this.listeners.push({ type, fn }); },
      focus() { this.focused += 1; },
    });
  }
  return nodes;
}

const matches = (node, selector) => (selector.startsWith('.')
  ? node.className.split(/\s+/).includes(selector.slice(1))
  : node.attrs[selector.slice(1, -1)] !== undefined);

/** Stand the markup up as the card mountCard goes looking for, and mount it. */
function mount(page, html) {
  const nodes = parse(html);
  const card = {
    querySelectorAll: (selector) => nodes.filter((node) => matches(node, selector)),
    querySelector: (selector) => nodes.find((node) => matches(node, selector)) || null,
  };
  global.document = {
    querySelector: (selector) => (selector === '[data-cc-card]' ? card : null),
    querySelectorAll: () => [],
  };
  page.mountCard();
  return { nodes, card, find: (selector) => card.querySelector(selector) };
}

/** A press, through whichever of the two paths the element was bound by. */
function press(node, overrides = {}) {
  const event = {
    target: node,
    prevented: false,
    stopped: false,
    preventDefault() { event.prevented = true; },
    stopPropagation() { event.stopped = true; },
    ...overrides,
  };
  node.onclick?.(event);
  node.listeners.filter((l) => l.type === 'click').forEach((l) => l.fn(event));
  return event;
}

// ---- the cell ----------------------------------------------------------------------------------

test('a month cell with something on it is a button carrying its key and its contact', () => {
  const { card } = build();
  const html = card();
  const open = parse(html).filter((node) => node.dataset.ccCalOpen);
  assert.equal(open.length, 2, '20 Aug and 2 Sep, and nothing else in view');
  const august = open.find((node) => node.dataset.ccCalOpen === '2026-08-20');
  assert.ok(august, 'the day two records share is pressable');
  assert.equal(august.tag, 'button', 'a real button, so it is reachable without a tabindex');
  assert.equal(august.dataset.ccCalFor, 'c1');
  assert.match(august.attrs['aria-label'], /^2 on /);
});

test('a day with nothing on it is not pressable', () => {
  const { card } = build();
  const keys = parse(card()).filter((node) => node.dataset.ccCalOpen).map((node) => node.dataset.ccCalOpen);
  assert.ok(!keys.includes('2026-08-19'));
  assert.ok(!keys.includes('2026-08-21'), "another contact's record is not on this calendar");
});

test('day and week cells stay plain, because they already list their entries as links', () => {
  // A link inside a button is a nested control and two different things to hit in one place.
  ['day', 'week'].forEach((view) => {
    const { card } = build({ ccCalView: view, ccCalAt: '2026-08-20' });
    const html = card();
    assert.ok(!/data-cc-cal-open/.test(html), `${view} should not make the cell a button`);
    assert.match(html, /cc-cal-item/, `${view} should still list the entries`);
  });
});

test('a year cell keys the whole month', () => {
  const { card } = build({ ccCalView: 'year' });
  const keys = parse(card()).filter((node) => node.dataset.ccCalOpen).map((node) => node.dataset.ccCalOpen);
  assert.deepEqual(keys, ['2026-08', '2026-09']);
});

// ---- pressing it -------------------------------------------------------------------------------

test('pressing a cell opens that day, and the dialog lists what the count stood for', () => {
  const { page, state, renders, card } = build();
  const { find } = mount(page, card());

  const cell = find('[data-cc-cal-open]');
  press(cell);
  assert.equal(state.ccCalDay, '2026-08-20');
  assert.equal(state.ccCalDayFor, 'c1');
  assert.equal(renders.length, 1, 'the press redraws the card');

  const html = card();
  assert.match(html, /cc-cal-dialog/);
  // Both records that made the count, each with the field label that put it on that day and the
  // app it lives in -- which is the whole reason a count was not enough.
  assert.match(html, /Wew<\/b>/);
  assert.match(html, /Wew2<\/b>/);
  assert.match(html, /Site visit<\/em>/);
  assert.match(html, /Prospecting/);
  // And each row leads to the record itself.
  const rows = parse(html).filter((node) => node.dataset.ccCalGo !== undefined);
  assert.equal(rows.length, 2);
  rows.forEach((row) => {
    assert.equal(row.tag, 'a');
    assert.match(row.attrs.href, /app_id=app1/);
    assert.match(row.attrs.href, /item_id=i[12]/);
  });
});

test('a year cell opens the month, titled as a month', () => {
  const { page, state, card } = build({ ccCalView: 'year' });
  const { find } = mount(page, card());
  press(find('[data-cc-cal-open]'));
  assert.equal(state.ccCalDay, '2026-08');

  const html = card();
  assert.match(html, /August 2026/);
  assert.equal(parse(html).filter((node) => node.dataset.ccCalGo !== undefined).length, 2);
});

test('an open day belongs to the contact it was opened on', () => {
  // Otherwise walking to another contact carries the dialog across, where the same key finds
  // nothing and reads as "nothing on this day" about a day nobody asked to see.
  const { state, card } = build();
  state.ccCalDay = '2026-08-20';
  state.ccCalDayFor = 'c1';
  assert.match(card('c1'), /cc-cal-dialog/);
  assert.ok(!/cc-cal-dialog/.test(card('c2')), "another contact's card shows no dialog");
});

test('a day that emptied under the reader says so rather than drawing an empty dialog', () => {
  const { state, card } = build();
  state.ccCalDay = '2026-08-19';
  state.ccCalDayFor = 'c1';
  const html = card();
  assert.match(html, /cc-cal-dialog/);
  assert.match(html, /Nothing on this day any more\./);
});

// ---- closing it --------------------------------------------------------------------------------

test('the close button and Escape both close it', () => {
  const { page, state, card } = build();
  state.ccCalDay = '2026-08-20';
  state.ccCalDayFor = 'c1';

  const closed = mount(page, card());
  press(closed.find('[data-cc-cal-close]'));
  assert.equal(state.ccCalDay, '');

  state.ccCalDay = '2026-08-20';
  const again = mount(page, card());
  const dialog = again.find('.cc-cal-dialog');
  dialog.onkeydown({ key: 'a', stopPropagation() {} });
  assert.equal(state.ccCalDay, '2026-08-20', 'only Escape closes');
  let stopped = false;
  dialog.onkeydown({ key: 'Escape', stopPropagation() { stopped = true; } });
  assert.equal(state.ccCalDay, '');
  assert.ok(stopped, 'the card behind it must not also act on the key');
});

test('the backdrop closes only when the backdrop itself was pressed', () => {
  // Without the identity check every press inside the dialog closes it on the way up, which
  // makes the thing impossible to read.
  const { page, state, card } = build();
  state.ccCalDay = '2026-08-20';
  state.ccCalDayFor = 'c1';
  const { find } = mount(page, card());
  const backdrop = find('[data-cc-cal-backdrop]');

  press(backdrop, { target: find('.cc-cal-dialog') });
  assert.equal(state.ccCalDay, '2026-08-20', 'a press inside the dialog must not close it');
  press(backdrop);
  assert.equal(state.ccCalDay, '');
});

test('a row navigates: its default is never cancelled', () => {
  // `bind` calls preventDefault on everything it binds, and on a real link that is the
  // difference between going to the record and doing nothing at all.
  const { page, state, card } = build();
  state.ccCalDay = '2026-08-20';
  state.ccCalDayFor = 'c1';
  const { find } = mount(page, card());
  const row = find('[data-cc-cal-go]');

  assert.equal(row.onclick, null, 'a row must not be bound through the preventDefault helper');
  const event = press(row);
  assert.equal(event.prevented, false, 'the navigation was cancelled');
  assert.equal(state.ccCalDay, '', 'it still banks the closed state on the way past');
});

// ---- focus -------------------------------------------------------------------------------------

test('the dialog takes focus once, not on every redraw', () => {
  // mountCard runs on EVERY render. Focusing each time would snatch the caret back from whatever
  // the reader had tabbed to inside the dialog.
  const { page, state, card } = build();
  state.ccCalDay = '2026-08-20';
  state.ccCalDayFor = 'c1';

  const first = mount(page, card());
  assert.equal(first.find('.cc-cal-dialog').focused, 1);
  assert.equal(first.find('.cc-cal-dialog').tabIndex, -1, 'focusable without being in the tab order');

  const second = mount(page, card());
  assert.equal(second.find('.cc-cal-dialog').focused, 0, 'a redraw of the same day must not re-focus');

  // A different day is a different dialog, and does take focus.
  state.ccCalDay = '2026-09-02';
  const third = mount(page, card());
  assert.equal(third.find('.cc-cal-dialog').focused, 1);
});

test('closing and reopening the same day focuses it again', () => {
  // The guard is a stored key; if closing did not clear it, the second visit would open silent.
  const { page, state, card } = build();
  state.ccCalDay = '2026-08-20';
  state.ccCalDayFor = 'c1';
  mount(page, card());

  state.ccCalDay = '';
  mount(page, card());
  state.ccCalDay = '2026-08-20';
  const back = mount(page, card());
  assert.equal(back.find('.cc-cal-dialog').focused, 1);
});
