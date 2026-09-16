import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { remapApp, remapChildren } from '../src/workspace/app-portability.js';
import { pipelineField } from '../src/workspace/pipeline-core.js';
import { safeHexColor, sanitizeColorConfig } from '../src/security/color.js';

// Sample apps for the Quest App Market: ten general CRM apps (docs/apps/market/crm) and ten school
// management and learning apps (docs/apps/market/school). Any company installs them, so they
// cannot lean on anybody's pipeline -- each has to stand up on its own in an empty workspace.
//
// app-bundles.test.mjs proves each one imports. These run them through the REAL installer and
// automation engine lifted out of main.js, because a sample that misfires on a blank record is
// the first thing every installer sees.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};
const typesAt = main.indexOf('const WB_FIELD_TYPES = {');
const typesSrc = main.slice(typesAt, main.indexOf('\n};', typesAt) + 3);

let seq = 0;
const stubs = {
  remapApp, remapChildren, pipelineField, safeHexColor, sanitizeColorConfig,
  wbUid: () => `wb-${(seq += 1)}`,
  WB_PALETTE: ['#e0552d', '#2563eb'], WB_ICON_CLASS: /^ti-[a-z0-9-]+$/, WB_DEFAULT_APP_ICON: 'ti-address-book',
  WB_TRIG_OPS: [['=='], ['!='], ['>'], ['<'], ['>='], ['<=']],
  wbChecklistStats: () => ({ pct: 0 }),
  wbLogActivity: () => {}, showToast: () => {}, h: String, wbItemTitle: () => '',
};
// eslint-disable-next-line no-new-func
const engine = new Function(...Object.keys(stubs), `${typesSrc}
${cut('wbCalcRaw')}
${cut('wbComputeSetValue')}
${cut('wbRunAutomations')}
${cut('wbBuildInstalledApp')}
return { wbBuildInstalledApp, wbRunAutomations, wbCalcRaw };`)(...Object.values(stubs));

const MARKET_TYPES = ['Contacts', 'Tasks', 'Projects', 'Records', 'Inventory', 'Documents', 'Calendar', 'Tickets', 'Invoices', 'Custom'];
const SETS = {
  crm: ['Client Accounts', 'Support Tickets', 'Client Onboarding', 'Appointments', 'Meeting Notes',
    'Contracts & Renewals', 'Invoice Tracker', 'Product Catalog', 'Customer Feedback', 'Marketing Campaigns'],
  school: ['Students', 'Admissions', 'Attendance', 'Fees & Payments', 'Staff Directory',
    'Courses & Classes', 'Assignments', 'Gradebook', 'Timetable', 'Parent Communication'],
  store: ['Products', 'Sales', 'Purchase Orders', 'Suppliers', 'Stock Counts',
    'Customers & Loyalty', 'Returns & Refunds', 'Register Close', 'Staff Shifts', 'Promotions'],
};
const dirOf = (set) => join(root, 'docs', 'apps', 'market', set);
const load = (set, name) => JSON.parse(readFileSync(join(dirOf(set), `${name}.questapp.json`), 'utf8')).app;
const ALL = Object.entries(SETS).flatMap(([set, names]) => names.map((name) => ({ set, name, app: load(set, name) })));
const find = (name) => ALL.find((e) => e.name === name).app;

// Install the way the Market does (structure only), then work with the INSTALLED copy, whose
// field ids are reminted -- labels are the only stable handle.
const install = (src, includeItems = false) => {
  const workspace = { apps: [] };
  const app = engine.wbBuildInstalledApp(workspace, JSON.parse(JSON.stringify(src)), includeItems);
  workspace.apps.push(app);
  return { workspace, app };
};
const idOf = (app, label) => {
  const field = app.fields.find((f) => f.label === label);
  assert.ok(field, `${app.name} has no "${label}"`);
  return field.id;
};
const byLabels = (app, entries) => Object.fromEntries(Object.entries(entries).map(([label, v]) => [idOf(app, label), v]));
const calc = (app, label, entries) => engine.wbCalcRaw(app, app.fields.find((f) => f.label === label), byLabels(app, entries));
const optionId = (app, label, optionLabel) => app.fields.find((f) => f.label === label).config.options.find((o) => o.label === optionLabel).id;
// Save a record from `prev` to `next` (both by label) and return what fired plus the values after.
const save = (installed, prev, next, event = 'updated') => {
  const { workspace, app } = installed;
  const item = { id: 'item', values: byLabels(app, next) };
  const fired = engine.wbRunAutomations('c1', workspace, app, item, event, prev ? byLabels(app, prev) : undefined);
  return { fired, values: item.values };
};

test('both sample sets are complete, and nothing else sits in their folders', () => {
  Object.entries(SETS).forEach(([set, names]) => {
    const files = readdirSync(dirOf(set)).filter((f) => f.endsWith('.questapp.json')).map((f) => f.replace('.questapp.json', '')).sort();
    assert.deepEqual(files, [...names].sort(), `docs/apps/market/${set}`);
  });
  assert.equal(new Set(ALL.map((e) => e.name)).size, 30, 'no two sample apps share a name');
});

test('every sample files itself under a Market category', () => {
  // The Market groups apps by Type. A type outside the create dialog's ten still shows, but as a
  // one-app category of its own after them, which is not where a sample belongs.
  ALL.forEach(({ name, app }) => assert.ok(MARKET_TYPES.includes(app.type), `${name} has type "${app.type}"`));
});

test('every sample stands alone in an empty workspace', () => {
  // A button, relationship or rollup names another app by an id that does not exist in the
  // installing company. A sample must work the moment it lands.
  ALL.forEach(({ name, app }) => {
    const outward = app.fields.filter((f) => ['button', 'relationship', 'rollup'].includes(f.type)).map((f) => f.label);
    assert.deepEqual(outward, [], `${name} reaches into another app`);
    assert.deepEqual(app.items, [], `${name} ships records`);
    assert.equal(app.fields[0].type, 'text', `${name} does not title its records from a text field`);
    assert.equal(app.fields[0].required, true, `${name}: "${app.fields[0].label}" is not required`);
    assert.ok(app.description.length > 80 && app.description.length < 480, `${name}: the Market description is ${app.description.length} characters`);
  });
});

test('every sample installs from the Market and from a file, twice, with nothing left dangling', () => {
  ALL.forEach(({ name, app: src }) => {
    [false, true].forEach((includeItems) => {
      const { workspace, app } = install(src, includeItems);
      const second = engine.wbBuildInstalledApp(workspace, JSON.parse(JSON.stringify(src)), includeItems);
      const ids = new Set(app.fields.map((f) => f.id));
      assert.equal(second.name, `${name} (2)`);
      second.fields.forEach((f) => assert.ok(!ids.has(f.id), `${name}: a second install shares a field id`));
      assert.equal(app.icon, src.icon, `${name}: icon rejected`);
      assert.equal(app.color, src.color, `${name}: colour rejected`);
      app.fields.forEach((f, i) => assert.deepEqual(f.config, src.fields[i].config.source ? f.config : src.fields[i].config, `${name}: "${f.label}" config rewritten`));
      app.fields.filter((f) => f.type === 'progress').forEach((f) => {
        assert.equal(app.fields.find((x) => x.id === f.config.source)?.type, 'checklist', `${name}: "${f.label}" lost its checklist`);
      });
      const placed = app.recordLayout.filter((b) => b.type === 'fields').flatMap((b) => b.config.fieldIds);
      app.fields.forEach((f) => assert.ok(placed.includes(f.id), `${name}: "${f.label}" is on no card after install`));
      const listCards = app.recordLayout.filter((b) => b.type === 'collection');
      assert.equal(listCards.length, (src.collections || []).length, `${name}: a sub-item card was dropped`);
      listCards.forEach((b) => assert.ok(app.collections.some((c) => c.id === b.config.collectionId)));
      app.cardFields.forEach((id) => assert.ok(ids.has(id), `${name}: a card field dangles`));
      app.views.forEach((v) => assert.ok(ids.has(v.fieldId), `${name}: view "${v.title}" dangles`));
      app.dashboard.filter((wg) => wg.config.fieldId !== undefined).forEach((wg) => assert.ok(ids.has(wg.config.fieldId), `${name}: widget ${wg.type} dangles`));
      app.automations.forEach((au) => {
        if (au.trigger.fieldId) assert.ok(ids.has(au.trigger.fieldId), `${name}: "${au.name}" trigger dangles`);
        au.actions.filter((a) => a.fieldId).forEach((a) => assert.ok(ids.has(a.fieldId), `${name}: "${au.name}" action dangles`));
      });
    });
  });
});

test('a brand-new blank record fires only the welcome rules', () => {
  // The misfire every installer would meet first: an empty calculation reads 0, and 0 is below
  // every "less than" threshold -- so without a guard a blank grade report is an F needing
  // intervention and a blank course is full.
  ALL.forEach(({ name, app: src }) => {
    const installed = install(src);
    const { fired } = save(installed, undefined, {}, 'created');
    const welcome = installed.app.automations.filter((a) => a.trigger.event === 'created').map((a) => a.name);
    assert.deepEqual(fired, welcome, `${name} fired on a blank record`);
  });
});

test('every automation fires through the real engine', () => {
  // One scenario per rule that is not a plain stage move or option pick: the numbers that should
  // trip it, and the numbers the record held just before.
  const numeric = {
    'Client Onboarding': { 'Over the hours budget': [{ 'Hours budgeted': 10, 'Hours used': 8 }, { 'Hours budgeted': 10, 'Hours used': 12 }] },
    'Marketing Campaigns': { 'Over budget — decide': [{ Budget: 1000, Spent: 900 }, { Budget: 1000, Spent: 1200 }] },
    'Product Catalog': {
      'Below reorder point — low stock': [{ 'In stock': 8, 'Reorder point': 5 }, { 'In stock': 3, 'Reorder point': 5 }],
      'Nothing left — out of stock': [{ 'In stock': 3 }, { 'In stock': 0 }],
    },
    'Customer Feedback': {
      'Score 9 or 10 — Promoter': [{}, { Score: 10 }], 'Score 7 — Passive': [{}, { Score: 7 }],
      'Score 8 — Passive': [{}, { Score: 8 }], 'Score 6 or below — Detractor': [{}, { Score: 3 }],
    },
    Students: { 'Attendance below 90% — follow up': [{ 'Days enrolled this term': 50, 'Days present this term': 48 }, { 'Days enrolled this term': 50, 'Days present this term': 40 }] },
    Attendance: {
      'Unexcused absence — contact the family': [{}, { 'Unexcused absences': 2 }],
      'Attendance below 85%': [{ 'On roll': 30, Present: 29 }, { 'On roll': 30, Present: 20 }],
    },
    'Courses & Classes': { 'Course full — close enrollment': [{ Capacity: 25, Enrolled: 24 }, { Capacity: 25, Enrolled: 25 }] },
    Products: {
      'Below the reorder point — low stock': [{ 'In stock': 20, 'Reorder point': 12 }, { 'In stock': 5, 'Reorder point': 12 }],
      'Nothing left — out of stock': [{ 'In stock': 5 }, { 'In stock': 0 }],
    },
    Suppliers: { 'Third late delivery — review them': [{ 'Deliveries late': 2 }, { 'Deliveries late': 3 }] },
    'Stock Counts': { 'Counted short — investigate': [{ 'Value expected': 3180, 'Value counted': 3180 }, { 'Value expected': 3180, 'Value counted': 3105 }] },
    'Customers & Loyalty': {
      'Spend reaches 500 — Silver': [{ 'Total spend': 100 }, { 'Total spend': 600 }],
      'Spend reaches 1,000 — Gold': [{ 'Total spend': 600 }, { 'Total spend': 1200 }],
      'Spend reaches 2,500 — VIP': [{ 'Total spend': 1200 }, { 'Total spend': 3000 }],
    },
    'Register Close': {
      'Drawer is short': [{ 'Opening float': 150, 'Cash takings': 642.3, 'Paid out of the till': 25, Banked: 500, 'Cash counted': 267.3 },
        { 'Opening float': 150, 'Cash takings': 642.3, 'Paid out of the till': 25, Banked: 500, 'Cash counted': 265.8 }],
      'Drawer is over': [{ 'Opening float': 150, 'Cash takings': 642.3, 'Paid out of the till': 25, Banked: 500, 'Cash counted': 267.3 },
        { 'Opening float': 150, 'Cash takings': 642.3, 'Paid out of the till': 25, Banked: 500, 'Cash counted': 269.3 }],
    },
    Promotions: { 'Behind target': [{ 'Revenue target': 4000, Revenue: 4200 }, { 'Revenue target': 4000, Revenue: 3200 }] },
  };
  let total = 0;
  ALL.filter(({ name }) => name !== 'Gradebook').forEach(({ name, app: src }) => {
    const installed = install(src);
    const { app } = installed;
    app.automations.forEach((au) => {
      const t = au.trigger;
      let fired;
      if (t.event === 'created') ({ fired } = save(installed, undefined, {}, 'created'));
      else if (numeric[name]?.[au.name]) ({ fired } = save(installed, ...numeric[name][au.name]));
      else {
        const field = app.fields.find((f) => f.id === t.fieldId);
        const value = t.event === 'stage_moves' ? field.config.options.find((o) => o.id === t.to).label : null;
        const item = { id: 'item', values: { [field.id]: t.event === 'stage_moves' ? t.to : t.value } };
        const prev = t.from ? { [field.id]: t.from } : {};
        fired = engine.wbRunAutomations('c1', installed.workspace, app, item, 'updated', prev);
        assert.ok(value === null || value, `${name}: "${au.name}" moves to a stage with no label`);
      }
      assert.ok(fired.includes(au.name), `${name}: "${au.name}" did not fire`);
      total += 1;
    });
  });
  assert.ok(total >= 50, `only ${total} automations exercised`);
});

// --- the arithmetic a user would check by hand -------------------------------------------------

test('Invoice Tracker and Fees & Payments work out total and balance', () => {
  const inv = install(find('Invoice Tracker')).app;
  const bill = { Subtotal: 2400, Discount: 200, Tax: 176, 'Amount paid': 1000 };
  assert.equal(calc(inv, 'Total', bill), 2376);
  assert.equal(calc(inv, 'Balance due', bill), 1376);

  const fees = install(find('Fees & Payments')).app;
  const term = {
    Tuition: 4500, 'Registration fee': 250, 'Books and materials': 180, Transport: 300,
    'Activities and trips': 120, 'Scholarship or discount': 900, 'Amount paid': 2000,
  };
  assert.equal(calc(fees, 'Total due', term), 4450);
  assert.equal(calc(fees, 'Balance', term), 2450);
});

test('an overdue invoice counts its reminders', () => {
  ['Invoice Tracker', 'Fees & Payments'].forEach((name) => {
    const installed = install(find(name));
    const overdue = optionId(installed.app, 'Status', 'Overdue');
    const first = save(installed, { 'Reminders sent': '' }, { Status: overdue });
    assert.equal(first.values[idOf(installed.app, 'Reminders sent')], 1, `${name} counts from empty`);
  });
});

test('Product Catalog margin, markup and stock value', () => {
  const app = install(find('Product Catalog')).app;
  const product = { 'Unit cost': 60, 'Sale price': 100, 'In stock': 12, 'Reorder point': 5 };
  assert.equal(calc(app, 'Profit per unit', product), 40);
  assert.equal(calc(app, 'Margin %', product), 40);
  assert.equal(calc(app, 'Markup %', product), 66.67);
  assert.equal(calc(app, 'Stock value', product), 720);
  assert.equal(calc(app, 'Above reorder point', product), 7);
  assert.equal(calc(app, 'Margin %', { 'Unit cost': 60 }), null, 'no price yet is no margin');
});

test('Product Catalog marks stock low, then out', () => {
  const installed = install(find('Product Catalog'));
  const { app } = installed;
  const low = save(installed, { 'In stock': 8, 'Reorder point': 5 }, { 'In stock': 3, 'Reorder point': 5 });
  assert.equal(low.values[idOf(app, 'Status')], optionId(app, 'Status', 'Low stock'));
  const out = save(installed, { 'In stock': 3, 'Reorder point': 5 }, { 'In stock': 0, 'Reorder point': 5 });
  assert.equal(out.values[idOf(app, 'Status')], optionId(app, 'Status', 'Out of stock'), 'the later rule wins');
});

test('Marketing Campaigns ratios, and no budget means no overspend', () => {
  const app = install(find('Marketing Campaigns')).app;
  const run = { Budget: 5000, Spent: 4200, Leads: 60, Appointments: 24, 'Clients won': 6, 'Revenue won': 96000 };
  assert.equal(calc(app, 'Budget left', run), 800);
  assert.equal(calc(app, 'Cost per lead', run), 70);
  assert.equal(calc(app, 'Lead to appointment %', run), 40);
  assert.equal(calc(app, 'Appointment to client %', run), 25);
  assert.equal(calc(app, 'Cost per client won', run), 700);
  assert.equal(calc(app, 'Return on spend %', run), 2185.71);
  assert.equal(calc(app, 'Budget left', { Spent: 300 }), null, 'a campaign with no budget is not over it');
});

test('Client Onboarding hours, Client Accounts average, Contracts renewal price', () => {
  const onboarding = install(find('Client Onboarding')).app;
  assert.equal(calc(onboarding, 'Hours left', { 'Hours budgeted': 40, 'Hours used': 28.5 }), 11.5);
  assert.equal(calc(onboarding, 'Hours left', { 'Hours used': 5 }), null);

  const accounts = install(find('Client Accounts')).app;
  assert.equal(calc(accounts, 'Average order', { 'Revenue this year': 18000, 'Orders this year': 8 }), 2250);

  const contracts = install(find('Contracts & Renewals')).app;
  assert.equal(calc(contracts, 'Annual value', { 'Monthly value': 450 }), 5400);
  assert.equal(calc(contracts, 'Annual value at renewal', { 'Monthly value': 450, 'Renewal increase %': 5 }), 5670);
});

test('Customer Feedback sorts every score into its group', () => {
  const installed = install(find('Customer Feedback'));
  const { app } = installed;
  const group = (score) => save(installed, {}, { Score: score }).values[idOf(app, 'Group')];
  [0, 3, 6].forEach((s) => assert.equal(group(s), optionId(app, 'Group', 'Detractor'), `score ${s}`));
  [7, 8].forEach((s) => assert.equal(group(s), optionId(app, 'Group', 'Passive'), `score ${s}`));
  [9, 10].forEach((s) => assert.equal(group(s), optionId(app, 'Group', 'Promoter'), `score ${s}`));
});

test('Students and Attendance work out absence and attendance %', () => {
  const students = install(find('Students')).app;
  const term = { 'Days enrolled this term': 60, 'Days present this term': 57 };
  assert.equal(calc(students, 'Days absent', term), 3);
  assert.equal(calc(students, 'Attendance %', term), 95);

  const attendance = install(find('Attendance')).app;
  assert.equal(calc(attendance, 'Absent', { 'On roll': 28, Present: 26 }), 2);
  assert.equal(calc(attendance, 'Attendance %', { 'On roll': 28, Present: 26 }), 92.86);
  assert.ok(attendance.collections.some((c) => c.name === 'Absences'), 'who was away, not just how many');
});

test('Courses count seats only once a capacity is set', () => {
  const app = install(find('Courses & Classes')).app;
  assert.equal(calc(app, 'Seats left', { Capacity: 28, Enrolled: 22 }), 6);
  assert.equal(calc(app, 'Seats left', { Enrolled: 22 }), null, 'no capacity is not a full course');
});

test('Assignments track hand-in and grading', () => {
  const app = install(find('Assignments')).app;
  const work = { 'Students assigned': 28, 'Handed in': 21, Graded: 15, 'Points possible': 40, 'Average score': 31 };
  assert.equal(calc(app, 'Missing', work), 7);
  assert.equal(calc(app, 'Left to grade', work), 6);
  assert.equal(calc(app, 'Hand-in rate %', work), 75);
  assert.equal(calc(app, 'Class average %', work), 77.5);
});

test('Gradebook weights the final grade once the exam is in', () => {
  const app = install(find('Gradebook')).app;
  const scores = { 'Homework %': 92, 'Quizzes %': 84, 'Projects %': 88, 'Exams %': 79, 'Participation %': 100 };
  // 92*20 + 84*15 + 88*20 + 79*35 + 100*10 = 8625
  assert.equal(calc(app, 'Final %', scores), 86.25);
  assert.equal(calc(app, 'Final %', { 'Homework %': 92, 'Quizzes %': 84 }), null, 'no exam yet, no final grade');
});

test('Gradebook letter grades follow the final % up and down', () => {
  // A numeric rule fires only on ENTERING its range, so the letter is kept right by rising rules
  // in ascending order and falling rules in descending order. Walk it both ways.
  const installed = install(find('Gradebook'));
  const { app } = installed;
  const all = (x) => ({ 'Homework %': x, 'Quizzes %': x, 'Projects %': x, 'Exams %': x, 'Participation %': x });
  const letter = (label) => optionId(app, 'Letter grade', label);
  let prev = {};
  const walk = [[75, 'C'], [85, 'B'], [95, 'A'], [89, 'B'], [65, 'D'], [72, 'C'], [90, 'A'], [55, 'F'], [61, 'D'], [80, 'B']];
  let values = {};
  walk.forEach(([score, expected]) => {
    const next = all(score);
    const item = { id: 'g', values: { ...values, ...byLabels(app, next) } };
    engine.wbRunAutomations('c1', installed.workspace, app, item, 'updated', byLabels(app, prev));
    assert.equal(item.values[idOf(app, 'Letter grade')], letter(expected), `${prev['Exams %'] ?? 'blank'} → ${score} should read ${expected}`);
    values = item.values;
    prev = next;
  });
  // Falling below 60 also flags the report.
  assert.equal(values[idOf(app, 'Status')], optionId(app, 'Status', 'Needs intervention'));
});

// --- the store set: inventory, the till, and the day ------------------------------------------

test('Products prices a line and values the shelf', () => {
  const app = install(find('Products')).app;
  const line = { 'Cost price': 4.2, 'Retail price': 7.5, 'In stock': 36, Reserved: 6, 'Reorder point': 12 };
  assert.equal(calc(app, 'Profit per unit', line), 3.3);
  assert.equal(calc(app, 'Margin %', line), 44);
  assert.equal(calc(app, 'Markup %', line), 78.57);
  assert.equal(calc(app, 'Available to sell', line), 30, 'what is reserved is not on sale');
  assert.equal(calc(app, 'Stock at cost', line), 151.2);
  assert.equal(calc(app, 'Stock at retail', line), 270);
  assert.equal(calc(app, 'Above reorder point', line), 24);
  assert.equal(calc(app, 'Above reorder point', { 'Reorder point': 12 }), null, 'stock not counted yet is not low stock');
  assert.equal(calc(app, 'Margin %', { 'Cost price': 4.2 }), null);
});

test('a sale totals the basket and shows what it earned', () => {
  const app = install(find('Sales')).app;
  const basket = { Subtotal: 84.5, Discount: 5, Tax: 6.36, 'Cost of goods': 47.3, 'Amount paid': 100 };
  assert.equal(calc(app, 'Total', basket), 85.86);
  assert.equal(calc(app, 'Gross profit', basket), 32.2, 'tax is the state\'s, not the shop\'s');
  assert.equal(calc(app, 'Margin %', basket), 40.5);
  assert.equal(calc(app, 'Balance', basket), -14.14, 'paid more than the total is change owed');
});

test('a purchase order totals cost and counts what is still to come', () => {
  const app = install(find('Purchase Orders')).app;
  const order = {
    'Goods subtotal': 1240, Shipping: 35, Tax: 96.5, 'Supplier discount': 60,
    'Amount paid': 500, 'Units ordered': 300, 'Units received': 260,
  };
  assert.equal(calc(app, 'Order total', order), 1311.5);
  assert.equal(calc(app, 'Balance owed', order), 811.5);
  assert.equal(calc(app, 'Units outstanding', order), 40);
});

test('Suppliers averages the spend and scores the deliveries', () => {
  const app = install(find('Suppliers')).app;
  assert.equal(calc(app, 'Average order', { 'Spend this year': 18400, 'Orders this year': 23 }), 800);
  assert.equal(calc(app, 'On-time %', { 'Deliveries on time': 17, 'Deliveries late': 3 }), 85);
  assert.equal(calc(app, 'On-time %', {}), null, 'no deliveries yet is not 0% on time');
});

test('a stock count shows the variance and the shrinkage', () => {
  const app = install(find('Stock Counts')).app;
  const count = { 'Units expected': 420, 'Units counted': 412, 'Value expected': 3180, 'Value counted': 3105 };
  assert.equal(calc(app, 'Unit variance', count), -8);
  assert.equal(calc(app, 'Value variance', count), -75);
  assert.equal(calc(app, 'Shrinkage %', count), 2.36);
  // Half-counted is not a shortage: the figures appear once something has been counted.
  assert.equal(calc(app, 'Value variance', { 'Value expected': 3180 }), null);
  assert.equal(calc(app, 'Unit variance', { 'Units expected': 420 }), null);
});

test('loyalty points and basket, and the tiers climb themselves', () => {
  const installed = install(find('Customers & Loyalty'));
  const { app } = installed;
  assert.equal(calc(app, 'Points available', { 'Points earned': 1450, 'Points redeemed': 600 }), 850);
  assert.equal(calc(app, 'Average basket', { 'Total spend': 1240, Visits: 31 }), 40);
  assert.equal(calc(app, 'Average basket', { 'Total spend': 1240 }), null, 'a member who has not visited has no basket');

  const tier = (from, to) => save(installed, { 'Total spend': from }, { 'Total spend': to }).values[idOf(app, 'Tier')];
  assert.equal(tier(100, 400), undefined, 'under 500 sets no tier');
  assert.equal(tier(100, 600), optionId(app, 'Tier', 'Silver'));
  assert.equal(tier(600, 1200), optionId(app, 'Tier', 'Gold'));
  assert.equal(tier(1200, 3000), optionId(app, 'Tier', 'VIP'));
  // The step-by-step climbs above cross one threshold at a time, so they pass whatever order the
  // rules are in. A first spend straight past every tier fires all three at once, and only the
  // ascending order lands on the right one.
  assert.equal(tier('', 3000), optionId(app, 'Tier', 'VIP'), 'a first spend past 2,500 is VIP, not Silver');
  assert.equal(tier('', 1200), optionId(app, 'Tier', 'Gold'), 'a first spend past 1,000 is Gold, not Silver');
});

test('a return nets off the restocking fee', () => {
  const app = install(find('Returns & Refunds')).app;
  assert.equal(calc(app, 'Net refund', { 'Refund amount': 79.99, 'Restocking fee': 5 }), 74.99);
});

test('the register close balances the drawer both ways', () => {
  const installed = install(find('Register Close'));
  const { app } = installed;
  const day = {
    'Opening float': 150, 'Cash takings': 642.3, 'Card takings': 1184.55, 'Mobile wallet takings': 96.4,
    'Gift card takings': 40, 'Other takings': 0, 'Paid out of the till': 25, Banked: 500,
    Transactions: 96, Footfall: 240,
  };
  assert.equal(calc(app, 'Total takings', day), 1963.25);
  assert.equal(calc(app, 'Cash expected', day), 267.3, 'float plus cash, less payouts and banking');
  assert.equal(calc(app, 'Average basket', day), 20.45);
  assert.equal(calc(app, 'Conversion %', day), 40);
  assert.equal(calc(app, 'Over or short', { ...day, 'Cash counted': 265.8 }), -1.5);
  assert.equal(calc(app, 'Over or short', { ...day, 'Cash counted': 269.3 }), 2);
  assert.equal(calc(app, 'Over or short', day), null, 'an uncounted drawer is not short');

  const status = (counted) => save(installed, { ...day, 'Cash counted': 267.3 }, { ...day, 'Cash counted': counted }).values[idOf(app, 'Status')];
  assert.equal(status(265.8), optionId(app, 'Status', 'Short'));
  assert.equal(status(269.3), optionId(app, 'Status', 'Over'));
});

test('a shift costs what it worked, and earns what it took', () => {
  const app = install(find('Staff Shifts')).app;
  const shift = { 'Hours scheduled': 8, 'Hours worked': 9.5, 'Hourly rate': 14.5, 'Sales taken': 1840 };
  assert.equal(calc(app, 'Overtime', shift), 1.5);
  assert.equal(calc(app, 'Shift cost', shift), 137.75);
  assert.equal(calc(app, 'Sales per hour', shift), 193.68);
  assert.equal(calc(app, 'Overtime', { 'Hours scheduled': 8 }), null, 'a shift not yet worked is not 8 hours under');
});

test('a promotion is judged on profit, not on how busy it felt', () => {
  const app = install(find('Promotions')).app;
  const promo = { Revenue: 4820, 'Cost of goods': 3210, 'Discount given': 640, 'Units sold': 800, 'Revenue target': 4000 };
  assert.equal(calc(app, 'Gross profit', promo), 1610);
  assert.equal(calc(app, 'Margin %', promo), 33.4);
  assert.equal(calc(app, 'Discount per unit', promo), 0.8);
  assert.equal(calc(app, 'Against target', promo), 820);
  assert.equal(calc(app, 'Against target', { Revenue: 4820 }), null, 'no target set is not behind target');
});

test('the store set agrees on departments, payment methods and channels', () => {
  // The three lists a shop reads across apps: a sale, a product and a promotion must file
  // things under the same department, or the totals cannot be compared.
  const optionsOf = (name, label) => find(name).fields.find((f) => f.label === label && f.config.options)?.config.options;
  const same = (label, pairs) => {
    const lists = pairs.map(([name, field]) => {
      const options = optionsOf(name, field);
      assert.ok(options, `${name} has no "${field}" options`);
      return JSON.stringify(options);
    });
    assert.equal(new Set(lists).size, 1, `${label} options drift across the store set`);
  };
  same('Departments', [['Products', 'Department'], ['Purchase Orders', 'Department'], ['Stock Counts', 'Department'],
    ['Suppliers', 'Supplies'], ['Customers & Loyalty', 'Shops mostly in'], ['Promotions', 'Departments']]);
  same('Payment methods', [['Sales', 'Payment method'], ['Returns & Refunds', 'Refunded to']]);
  same('Channels', [['Sales', 'Channel'], ['Customers & Loyalty', 'Usually buys'], ['Promotions', 'Where it runs']]);
  same('Payment terms', [['Purchase Orders', 'Payment terms'], ['Suppliers', 'Payment terms']]);
});

test('school option lists agree across the set', () => {
  // A school that later links two of these with a button matches options by label, so Grade,
  // Subject and Term must read the same everywhere they appear.
  // Parent Communication's "Subject" is the message's subject line, so only option fields count.
  const optionsOf = (name, label) => find(name).fields.find((f) => f.label === label && f.config.options)?.config.options;
  [['Grade', ['Students', 'Attendance', 'Fees & Payments', 'Courses & Classes', 'Assignments', 'Gradebook', 'Timetable', 'Parent Communication']],
    ['Subject', ['Courses & Classes', 'Assignments', 'Gradebook', 'Timetable']],
    ['Term', ['Fees & Payments', 'Courses & Classes', 'Gradebook', 'Timetable']]].forEach(([label, names]) => {
    const lists = names.map((name) => {
      const options = optionsOf(name, label);
      assert.ok(options, `${name} has no "${label}" options`);
      return JSON.stringify(options);
    });
    assert.equal(new Set(lists).size, 1, `${label} options drift between school apps`);
  });
  assert.deepEqual(optionsOf('Admissions', 'Applying for'), optionsOf('Students', 'Grade'));
  assert.deepEqual(optionsOf('Staff Directory', 'Subjects taught'), optionsOf('Assignments', 'Subject'));
});
