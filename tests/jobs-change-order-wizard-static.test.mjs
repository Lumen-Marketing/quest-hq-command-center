import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const wizard = readFileSync(new URL('../src/jobs/change-order-wizard.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const jobFile = readFileSync(new URL('../src/jobs/job-file.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202608060900_job_change_order_lines.sql', import.meta.url), 'utf8');

test('the wizard is fetched on demand, not carried by every page', () => {
  assert.match(main, /import\('\.\/jobs\/change-order-wizard\.js'\)/);
  assert.ok(!/^import .*change-order-wizard/m.test(main), 'a static import would defeat the split');
  // Retryable: a failed load must clear the pending promise or it sticks forever.
  assert.match(main, /changeOrderWizardPending = null;\n {6}throw error;/);
});

test('the three steps are separate, and step one is required before pricing', () => {
  assert.match(wizard, /d\.step === 2 \? stepPrice\(d, job\) : d\.step === 3 \? stepSend\(d, job\) : stepCapture\(d, job\)/);
  // Blocking at the step boundary keeps the message beside the box it is about.
  assert.match(wizard, /if \(next > 1 && !String\(d\.what \|\| ''\)\.trim\(\)\)/);
});

test('typing is read back before any re-render', () => {
  // Every chip click re-renders. Without this, choosing "Text message" wiped the description.
  const collect = wizard.slice(wizard.indexOf('function collect(root)'));
  assert.match(collect.slice(0, collect.indexOf('\n  }')), /querySelectorAll\('\[data-co-field\]'\)/);
  for (const action of ['co-wizard-set', 'co-wizard-step', 'co-wizard-line-add', 'co-wizard-line-del']) {
    const at = wizard.indexOf(`action === '${action}'`);
    const body = wizard.slice(at, at + 240);
    assert.match(body, /collect\(root\);/, `${action} must collect before it re-renders`);
  }
});

test('documenting without charging is a first-class outcome', () => {
  // "The client asked for something, we are not charging" still has to be recorded, or the
  // crew builds something nobody agreed to.
  assert.match(wizard, /data-action="co-wizard-document"/);
  assert.match(wizard, /step: documentOnly \? 'requested' : 'sent',/);
  assert.match(wizard, /price: documentOnly \? 0 : Number\(sum\.price\.toFixed\(2\)\)/);
});

test('the change order is saved before its lines, and outlives them', () => {
  // A priced change order with no working is still worth having; losing the whole thing
  // because one line was rejected would throw away the part that matters.
  const save = wizard.slice(wizard.indexOf('async function saveWizard('));
  const body = save.slice(0, save.indexOf('\n}\n'));
  assert.ok(
    body.indexOf("from('job_change_orders').insert") < body.indexOf("from('job_change_order_lines').insert"),
    'the parent must be inserted first',
  );
  assert.match(body, /Change order saved, but its pricing lines did not/);
});

test('saving checks the permission on the job, not the active company', () => {
  const save = wizard.slice(wizard.indexOf('async function saveWizard('));
  assert.match(save.slice(0, 900), /requirePermission\('jobs\.manage', job\.company_id/);
});

test('the lines are fetched with the rest of production and sliced per job', () => {
  assert.match(main, /client\.from\('job_change_order_lines'\)\.select\('\*'\)\.order\('sort_order'/);
  assert.match(main, /state\.jobChangeOrderLines = \(coLines\.data \|\| \[\]\)\.map\(normalizeChangeOrderLine\)/);
  assert.match(main, /changeOrderLines: state\.jobChangeOrderLines\.filter\(\(row\) => row\.job_id === id\)/);
});

test('the job file shows the working, shut by default', () => {
  assert.match(jobFile, /<details class="jf-co-lines">/);
  assert.match(jobFile, /how this was priced/);
  // A flat-priced change order says so rather than looking like one whose lines failed to load.
  assert.match(jobFile, /Priced as a flat fee\./);
});

test('a labour line reads as guys x days x rate, a material line as qty x unit', () => {
  assert.match(jobFile, /\$\{h\(line\.qty\)\} × \$\{h\(line\.days\)\} day\$\{line\.days === 1 \? '' : 's'\} × \$\{h\(money\(line\.unitCost\)\)\}/);
});

test('the lines table cascades from its change order but never from the price book', () => {
  // Deleting a material must not rewrite what was already quoted -- the change order is a
  // historical record of an agreement.
  assert.match(migration, /change_order_id uuid not null references public\.job_change_orders\(id\) on delete cascade/);
  assert.match(migration, /material_id uuid references public\.pricebook_materials\(id\) on delete set null/);
});

test('the lines table is tenanted exactly like its siblings', () => {
  for (const verb of ['select', 'insert', 'update', 'delete']) {
    assert.match(migration, new RegExp(`for ${verb} to authenticated`), `${verb} needs a policy`);
  }
  assert.match(migration, /using \(app_private\.can_view_job\(job_id\)\)/);
  assert.match(migration, /with check \(app_private\.can_manage_job\(job_id\)\)/);
  assert.match(migration, /revoke all on public\.job_change_order_lines from anon/);
  assert.match(migration, /enable row level security/);
});

test('quantities cannot go negative at the database, not only in the model', () => {
  assert.match(migration, /qty numeric\(12, 2\) not null default 1 check \(qty >= 0\)/);
  assert.match(migration, /days numeric\(12, 2\) not null default 1 check \(days >= 0\)/);
});

test('the wizard has styles for every piece it renders', () => {
  for (const cls of ['cow-chip', 'cow-line', 'cow-price', 'cow-total', 'cow-step', 'cow-add', 'cow-group']) {
    assert.ok(css.includes(`.${cls}`), `.${cls} is rendered but unstyled`);
  }
  // Numbers in columns line up.
  assert.match(css, /\.cow-line-num \{[^}]*tabular-nums/);
  assert.match(css, /\.cow-total strong \{[^}]*tabular-nums/);
});
