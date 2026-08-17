import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  appBalanceFor, companyContactFieldsOf, contactUsage, referencedContactIds, usageBalance, usageSummary,
} from '../src/company-contacts/model.js';

// Company Contacts: one directory for the whole company, pointed at by App Builder apps in
// any workspace. "Active with us" and "Open balance" are read live from the builder document
// rather than stored on the contact, so they cannot drift from the records they describe.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');
const fieldUi = readFileSync(join(root, 'src', 'workspace', 'field-config-ui.js'), 'utf8');
const catalog = readFileSync(join(root, 'src', 'workspaces', 'plugin-catalog.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

const fn = (name, source = main) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const start = source.lastIndexOf('\n', at) + 1;
  const close = source === main ? '\n}' : '\n  }';
  return source.slice(start, source.indexOf(close, at) + close.length);
};

// A company with two workspaces: Sales has a Deal app, Production has a Job app. Both point
// at the directory, and both nominate which of their fields is the money.
const doc = () => ({
  workspaces: [
    {
      id: 'ws-sales',
      name: 'Sales',
      apps: [{
        id: 'app-deal',
        name: 'Deals',
        recordName: 'Deal',
        fields: [
          { id: 'f-client', type: 'company_contact', label: 'Client', config: { balanceFieldId: 'f-value' } },
          { id: 'f-value', type: 'money', label: 'Contract value', config: {} },
          { id: 'f-title', type: 'text', label: 'Title', config: {} },
        ],
        items: [
          { id: 'i1', values: { 'f-client': 'kevin', 'f-value': '22500', 'f-title': '58th Pl — Roofing' } },
          { id: 'i2', values: { 'f-client': 'joe', 'f-value': '1000' } },
        ],
      }],
    },
    {
      id: 'ws-prod',
      name: 'Production',
      apps: [{
        id: 'app-job',
        name: 'Job Tracker',
        recordName: 'Job',
        fields: [
          { id: 'g-client', type: 'company_contact', label: 'Client', config: { balanceFieldId: 'g-open' } },
          { id: 'g-open', type: 'number', label: 'Open balance', config: {} },
          { id: 'g-name', type: 'text', label: 'Job name', config: {} },
        ],
        items: [
          { id: 'j1', values: { 'g-client': 'kevin', 'g-open': '10000', 'g-name': '58th Pl — Framing' } },
          { id: 'j2', values: { 'g-client': 'kevin', 'g-open': '2500', 'g-name': 'Onyx Ave — Demo' } },
        ],
      }],
    },
  ],
});

test('a contact is found across every workspace, not just the one you are in', () => {
  const uses = contactUsage(doc(), 'kevin');
  assert.deepEqual(uses.map((use) => [use.workspaceName, use.appName, use.count]), [
    ['Sales', 'Deals', 1],
    ['Production', 'Job Tracker', 2],
  ]);
});

test('"Active with us" names the record, not the app, and pluralises properly', () => {
  // The app may be called "Job Tracker"; nobody says "2 Job Trackers".
  assert.equal(usageSummary(contactUsage(doc(), 'kevin')), '1 Deal · 2 Jobs');
  assert.equal(usageSummary(contactUsage(doc(), 'joe')), '1 Deal');
  assert.equal(usageSummary(contactUsage(doc(), 'nobody')), '');
});

test('the workspace is added only when the record name alone is ambiguous', () => {
  // Two workspaces with a "Jobs" app each is the case where "3 Jobs" tells you nothing.
  const twoJobApps = {
    workspaces: [
      { id: 'a', name: 'Roofing', apps: [{ id: 'x', name: 'Jobs', recordName: 'Job', fields: [{ id: 'c', type: 'company_contact', config: {} }], items: [{ id: '1', values: { c: 'kevin' } }] }] },
      { id: 'b', name: 'Solar', apps: [{ id: 'y', name: 'Jobs', recordName: 'Job', fields: [{ id: 'c', type: 'company_contact', config: {} }], items: [{ id: '2', values: { c: 'kevin' } }] }] },
    ],
  };
  assert.equal(usageSummary(contactUsage(twoJobApps, 'kevin')), '1 Job (Roofing) · 1 Job (Solar)');
});

test('open balance comes from the field the app nominated', () => {
  // Summing every money field would add Contract Value to Collected to Change Orders and
  // produce a number that means nothing, so the Company Contact field names one.
  const uses = contactUsage(doc(), 'kevin');
  assert.equal(usageBalance(uses), 35000, '22,500 from the deal + 10,000 + 2,500 from the jobs');
  assert.equal(uses[0].balance, 22500);
  assert.equal(uses[1].balance, 12500);
});

test('a contact field that nominates nothing contributes no balance', () => {
  const app = {
    fields: [{ id: 'c', type: 'company_contact', config: {} }, { id: 'm', type: 'money', config: {} }],
    items: [{ id: '1', values: { c: 'kevin', m: '99999' } }],
  };
  assert.equal(appBalanceFor(app, app.items), 0, 'guessing at the money field is worse than showing none');
});

test('only a money, number or calculation field can be the balance', () => {
  const app = {
    fields: [
      { id: 'c', type: 'company_contact', config: { balanceFieldId: 't' } },
      { id: 't', type: 'text', config: {} },
    ],
    items: [{ id: '1', values: { c: 'kevin', t: '5000' } }],
  };
  assert.equal(appBalanceFor(app, app.items), 0, 'a text field that happens to hold digits is not money');
});

test('two contact fields on one app cannot count the same money twice', () => {
  // A Job with both a Client and a GC pointing at the directory: the balance is the job's,
  // not one per contact field.
  const app = {
    fields: [
      { id: 'client', type: 'company_contact', config: { balanceFieldId: 'amt' } },
      { id: 'gc', type: 'company_contact', config: { balanceFieldId: 'amt' } },
      { id: 'amt', type: 'money', config: {} },
    ],
    items: [{ id: '1', values: { client: 'kevin', gc: 'joe', amt: '1000' } }],
  };
  assert.equal(appBalanceFor(app, app.items), 1000);
  // And the record is listed once for a contact that matches either field.
  assert.equal(contactUsage({ workspaces: [{ id: 'w', name: 'W', apps: [app] }] }, 'kevin')[0].count, 1);
});

test('an installed copy of another workspace\'s app is not counted twice', () => {
  // A linked app is a pointer, not a copy. Counting it would report the same job at home and
  // again wherever somebody installed it.
  const linked = {
    workspaces: [
      { id: 'a', name: 'Home', apps: [{ id: 'x', name: 'Jobs', recordName: 'Job', fields: [{ id: 'c', type: 'company_contact', config: {} }], items: [{ id: '1', values: { c: 'kevin' } }] }] },
      { id: 'b', name: 'Elsewhere', apps: [{ id: 'x2', linked: true, linkedFromWs: 'a' }] },
    ],
  };
  assert.equal(usageSummary(contactUsage(linked, 'kevin')), '1 Job');
});

test('money is read past whatever formatting the value carries', () => {
  const app = {
    fields: [{ id: 'c', type: 'company_contact', config: { balanceFieldId: 'm' } }, { id: 'm', type: 'money', config: {} }],
    items: [{ id: '1', values: { c: 'k', m: '$1,250.50' } }, { id: '2', values: { c: 'k', m: 2 } }, { id: '3', values: { c: 'k', m: 'n/a' } }],
  };
  assert.equal(appBalanceFor(app, app.items), 1252.5, 'a junk value is zero, not NaN across the whole total');
});

test('a record is named by its text field, not by the contact link on it', () => {
  // Taking the first value on the item labelled every row with the contact id of the person
  // whose card you were already looking at -- values are keyed by field id in write order,
  // and the contact link is very often written first.
  const uses = contactUsage(doc(), 'kevin');
  assert.equal(uses[0].items[0].title, '58th Pl — Roofing');
  assert.deepEqual(uses[1].items.map((item) => item.title), ['58th Pl — Framing', 'Onyx Ave — Demo']);
});

test('a record with no text field is named by its data, not by its id', () => {
  // "Case -ff7" named nothing. With no text anywhere, the first field carrying something is a
  // better name than the id's tail -- and the app author controls which field that is.
  const app = {
    name: 'Job Tracker', recordName: 'Job',
    fields: [{ id: 'c', type: 'company_contact', config: {} }, { id: 'm', type: 'money', config: {} }],
    items: [{ id: 'item-abcd', values: { c: 'kevin', m: '10' } }],
  };
  const [use] = contactUsage({ workspaces: [{ id: 'w', name: 'W', apps: [app] }] }, 'kevin');
  assert.equal(use.items[0].title, '10', 'never the contact id, and never blank');
  assert.ok(!/kevin/.test(use.items[0].title));

  // Only when there is nothing at all does the id tail stand in -- and without its separator.
  const empty = { ...app, items: [{ id: 'item-abcd', values: {} }] };
  const [none] = contactUsage({ workspaces: [{ id: 'w', name: 'W', apps: [empty] }] }, 'kevin');
  assert.equal(none, undefined, 'a record that does not mention the contact is not listed');
  const solo = { ...app, items: [{ id: 'item-abcd', values: { c: 'kevin' } }] };
  const [only] = contactUsage({ workspaces: [{ id: 'w', name: 'W', apps: [solo] }] }, 'kevin');
  assert.equal(only.items[0].title, 'Job abcd');
});

test('every contact anyone points at can be listed in one pass', () => {
  assert.deepEqual([...referencedContactIds(doc())].sort(), ['joe', 'kevin']);
  assert.deepEqual(companyContactFieldsOf(doc().workspaces[0].apps[0]).map((f) => f.id), ['f-client']);
});

test('the field type is registered, or the builder silently rewrites it to text', () => {
  // normalizeWorkspaceBuilderDoc coerces any type not in WB_FIELD_TYPES to 'text', so an
  // unregistered type would survive one render and be gone on reload.
  assert.match(main, /company_contact: \{ label: 'Company Contact'/);
  // Offered in the picker. Its neighbours are the other fields that reach into another app,
  // and Button joined them, so this pins company_contact's presence rather than the exact run.
  assert.match(main, /'user', 'relationship', 'company_contact',/, 'and it has to be offered in the picker');
});

test('the picker stores the id and shows the name', () => {
  // A name would break the moment somebody renames the contact; an id shown raw is unusable.
  assert.match(fieldUi, /case 'company_contact': \{/);
  assert.match(fieldUi, /data-wb-cc-name/);
  assert.match(fieldUi, /<input type="hidden" data-f="\$\{h\(f\.id\)\}" data-wb-cc-id/);
  const sync = fn('syncCompanyContactPicker');
  assert.match(sync, /idField\.value = match \? match\.id : '';/, 'a name matching nobody must not keep the old id');
  // Both event paths, for the reason the job Client field taught us.
  assert.match(fn('onDocumentInput'), /\[data-wb-cc-name\]/);
  assert.match(fn('onDocumentChange'), /\[data-wb-cc-name\]/);
});

test('a stored id that no longer resolves stays visible as broken', () => {
  const cell = fn('wbFmtVal').slice(fn('wbFmtVal').indexOf("case 'company_contact': {"));
  assert.match(cell.slice(0, 600), /if \(!contact\) return value \? '<span class="wb-tag wb-rel">\?<\/span>' : '';/);
  // And the text form gives the name, because it feeds search, sort and CSV export.
  assert.match(main, /case 'company_contact': return companyContactLabel\(String\(value \|\| ''\)\);/);
});

test('the directory is company-scoped, with no workspace filter anywhere near it', () => {
  // The absence of workspace_id is the entire feature.
  const body = fn('companyContactsFor');
  assert.match(body, /contact\.company_id === target/);
  assert.ok(!/workspace/i.test(body), 'a workspace filter here would break the one thing this is for');
  assert.match(main, /const COMPANY_CONTACT_COLS = \['id', 'company_id', 'name'/);
  assert.ok(!/COMPANY_CONTACT_COLS = \[[^\]]*'workspace_id'/.test(main));
});

test('the card links out and never edits a workspace record', () => {
  // These were ws / app / item, which the router does not read — so the row opened the
  // workspaces section and never the record. It reads workspace / app_id / item_id.
  assert.match(page, /companyPath\('workspaces', \{\s*\n\s*workspace: use\.workspaceRouteId, app_id: use\.appId, tab: 'items', item_id: item\.id,\s*\n\s*\}, companyId\)/);
  // The only write on the page is the contact's own details. The note that used to say so is
  // gone — it explained the design once, where a way back is wanted every time — so the rule
  // is asserted rather than described.
  assert.ok(!/data-action="wb-/.test(page), 'no workspace record actions belong on this card');
  assert.match(page, /class="cc-card-foot"[\s\S]*?Back to Company Contacts/);
  assert.match(page, /href="\$\{h\(appHref\(companyPath\('company-contacts', \{\}, companyId\)\)\)\}" data-router/);
});

test('the plugin is company-shared and auto-installed', () => {
  assert.match(catalog, /id: 'company_contacts'[^}]*dataScope: PLUGIN_DATA_SCOPES\.COMPANY_SHARED/);
  assert.match(catalog, /module_ids: \['company-contacts'\]/);
  assert.match(main, /\['company_contacts\.view', 'View company contacts'\]/);
  assert.match(main, /\['company_contacts\.manage', 'Add\/edit company contacts'\]/);
  assert.match(main, /\{ label: 'Work', ids: \['dashboard', 'tasks', 'messages'\] \}/);
  assert.match(main, /id: 'company-contacts', group: 'Work'[^}]*permission: 'company_contacts\.view'/);
  assert.match(main, /route\.section === 'company-contacts'/, 'the nav item needs somewhere to go');
});

test('the migration is company-scoped, gated, and does not fail open', () => {
  // Across every migration: the table was created under one name and renamed with the
  // module, so the guarantees below are spread over more than one file now.
  const dir = join(root, 'supabase', 'migrations');
  const sql = readdirSync(dir).filter((n) => n.endsWith('.sql')).map((n) => readFileSync(join(dir, n), 'utf8')).join(String.fromCharCode(10));
  // Scoped to the table's own definition: every other migration in the tree mentions
  // workspace_id, so checking the whole concatenation would always fail.
  const createTable = sql.slice(sql.indexOf('create table if not exists public.company_contacts'));
  assert.ok(!/workspace_id/.test(createTable.slice(0, createTable.indexOf(');'))),
    'a workspace column on the directory would defeat the point of it');
  // Read is every active member -- Sales and Production have to see the same person.
  assert.match(sql, /for select using \(app_private\.is_company_member\(company_id\)\)/);
  // Write is gated, and the same gate on both USING and WITH CHECK, or an update could move
  // a row into a company you cannot write to.
  assert.match(sql, /for update using \(app_private\.has_company_permission\(company_id, 'company_contacts\.manage'\)\)\s*\nwith check \(app_private\.has_company_permission\(company_id, 'company_contacts\.manage'\)\)/);
  // permission_plugin_ids returns an empty array for anything unmapped, which
  // permission_plugin_available reads as "no plugin needed" -- so the mapping has to exist
  // or uninstalling the plugin would leave the module reachable.
  assert.match(sql, /when permission like 'company_\w+\.%' then array\['company_\w+'\]::text\[\]/);
  assert.match(sql, /insert into public\.company_plugins[\s\S]*?'company_contacts', 'installed'/, 'baseline install');
  assert.match(sql, /update public\.company_plugins set plugin_id = 'company_contacts'/, 'renamed with the module');
  // The whitelist has to name it, or that insert is rejected by a check constraint.
  assert.match(sql, /'crm', 'crm_2', 'company_contacts'/, 'the whitelist names it');
});

test('the page is fetched on demand and its ctx is complete', () => {
  assert.match(main, /import\('\.\/company-contacts\/page\.js'\)/);
  assert.ok(!/^import .*company-contacts/m.test(main), 'a static import would put it in the entry bundle');
  const ctx = main.slice(main.indexOf('mod.createCompanyContactsPage({'), main.indexOf('});', main.indexOf('mod.createCompanyContactsPage({')));
  const destructured = page.slice(page.indexOf('const {') + 7, page.indexOf('} = ctx;')).split(',').map((n) => n.trim()).filter(Boolean);
  for (const name of destructured) assert.ok(ctx.includes(name), `page.js needs ${name}`);
});

test('the built-in columns are fixed and the rest are the company’s', () => {
  // Name, Active with us, Open balance and Last touch are this view's own — no field of theirs
  // produces them. Everything between is their fields, one column each.
  const head = page.slice(page.indexOf('<div class="table-head"'), page.indexOf('</div>', page.indexOf('<div class="table-head"')));
  assert.match(head, /<span>Name<\/span>/);
  assert.match(head, /columns\.map\(\(field\) => `<span>\$\{h\(field\.label\)\}<\/span>`\)/);
  assert.match(head, /<span>Active with us<\/span>/);
  assert.match(head, /Open balance/);
  assert.match(head, /Last touch/);
});

test('a hidden field is dropped from the table, not from the record', () => {
  const body = fn('renderDirectory', page);
  assert.match(body, /companyContactFieldsFor\(companyId\)\.filter\(\(field\) => !field\.hidden\)/);
  // The card shows everything: hiding is about this table's columns.
  assert.match(fn('renderCard', page), /const placeable = fields\.filter\(\(field\) => field !== chipField/);
  assert.ok(!/placeable = fields\.filter\([^;]*field\.hidden/.test(page), 'hiding is a column setting, not a card one');
  assert.ok(!/!field\.hidden && companyContactValue/.test(page), 'the card no longer skips hidden fields');
});

test('the grid is built from the column count, and can still collapse', () => {
  // A fixed six-track rule mis-aligned every row the moment a seventh column appeared.
  const body = fn('renderDirectory', page);
  // A leading track is allowed before the name column -- the tick-box column that Select turns
  // on lives there. The derivation from the column COUNT is what this guards; that the head and
  // the rows agree on the total is checked by rendering both, in
  // company-contact-bulk-select.test.mjs.
  assert.match(body, /const tracks = \[.*'minmax\(200px, 1\.4fr\)', \.\.\.columns\.map/);
  assert.match(body, /--cc-cols:\$\{tracks\};--cc-min:\$\{minWidth\}px/);
  // Custom properties, not the properties themselves: an inline grid-template-columns would
  // beat the narrow-screen rule that collapses the row to one column.
  assert.match(styles, /grid-template-columns: var\(--cc-cols/);
  assert.match(styles, /min-width: var\(--cc-min/);
  assert.match(styles, /\.cc-table \.table-row > span:not\(\.cc-cell-name\) \{ display: none; \}/);
  // Wider than a laptop panel, so it has to be reachable sideways.
  assert.match(styles, /\.cc-table \{\n  overflow-x: auto;/);
});
