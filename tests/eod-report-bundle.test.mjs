import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "create me an EOD Report for each workspace, Prospecting, Underwriting, Sales and Job" --
// as one app installed four times rather than four apps kept in step.
//
// The generic bundle checks in app-bundles.test.mjs already prove it IMPORTS. These are about
// what makes one report fit four different stages, which is the whole idea and the part a future
// edit could quietly undo.

const app = JSON.parse(
  readFileSync(new URL('../docs/apps/EOD Report.questapp.json', import.meta.url), 'utf8'),
).app;

const byId = Object.fromEntries(app.fields.map((f) => [f.id, f]));
const byLabel = Object.fromEntries(app.fields.map((f) => [f.label, f]));

test('it carries a stage for each of the four workspaces', () => {
  assert.deepEqual(
    byId['f-stage'].config.options.map((o) => o.label),
    ['Prospecting', 'Underwriting', 'Sales', 'Production'],
  );
  assert.equal(byId['f-stage'].required, true, 'a report that does not say which stage cannot be read across them');
});

test('it installs into ANY workspace, because it points at nothing outside itself', () => {
  // This is what lets one app be installed four times. A relationship, a rollup or a button with
  // a destination all name another APP -- ids install cannot remap -- so the same file dropped
  // into four workspaces would arrive pointing at whatever happened to be in the first one.
  const outward = ['relationship', 'rollup', 'button'];
  const found = app.fields.filter((f) => outward.includes(f.type)).map((f) => f.label);
  assert.deepEqual(found, [], 'nothing here reaches into another app');
  assert.deepEqual(app.collections, [], 'and no sub-item lists to remap');
  assert.deepEqual(app.automations, [], 'and no automations naming field ids');
});

test('the day is the first field, so a report titles itself', () => {
  // A record is named by its first field with a readable value. Anything else first and every
  // report in the list reads "Untitled" until somebody types a name nobody needs.
  assert.equal(app.fields[0].id, 'f-date');
  assert.equal(app.fields[0].type, 'date');
  assert.equal(app.fields[0].required, true);
});

test('the counts are the same words in every stage', () => {
  // A lead arriving and a job arriving are the same event to whoever reads the week, so the
  // labels do not change per workspace -- that is what makes four reports comparable.
  ['New in', 'Moved forward', 'Stalled', 'Calls made', 'Messages sent', 'Due tomorrow']
    .forEach((label) => assert.ok(byLabel[label], `${label} is missing`));
});

test('Touches adds two STORED numbers, never another calculation', () => {
  // wbCalcRaw substitutes Number(values[id] || 0) and a calculation's value is never written to
  // the record, so a formula over one silently reads zero.
  const refs = [...byLabel.Touches.config.formula.matchAll(/\{([^}]+)\}/g)].map(([, r]) => r.trim());
  assert.deepEqual(refs, ['Calls made', 'Messages sent']);
  refs.forEach((label) => assert.ok(['number', 'money'].includes(byLabel[label].type)));
});

test('every sum on the dashboard reads a field that actually holds a value', () => {
  // The trap this bundle exists downstream of: a sum widget reads item.values[fieldId] directly,
  // so pointed at a calculation it reports zero for ever while looking configured. It cost the
  // Underwriting Calculator a "$0.00 however many roofs were priced" card.
  app.dashboard
    .filter((w) => w.type === 'metric' && w.config.metric === 'sum')
    .forEach((w) => {
      const field = byId[w.config.fieldId];
      assert.ok(field, `${w.id} points at no field`);
      assert.ok(['number', 'money'].includes(field.type), `${w.id} sums "${field.label}", a ${field.type}`);
    });
});

test('the close-out checklist drives its own progress bar', () => {
  const progress = byId['f-done'];
  assert.equal(progress.type, 'progress');
  assert.equal(byId[progress.config.source].type, 'checklist');
  assert.ok(!String(progress.config.source).startsWith('link:'), 'a linked source install cannot remap');
  assert.ok(byId['f-close'].config.steps.length >= 4, 'a close-out with one step is a tick box, not a routine');
});

test('both saved views group by something that can be grouped', () => {
  app.views.forEach((view) => {
    assert.equal(view.scope, 'team', 'a private view is dropped on install');
    assert.ok(['status', 'category'].includes(byId[view.fieldId].type));
  });
});

test('the record page places every field, so none is invisible', () => {
  // An explicit fieldIds list is honoured exactly -- a field left out of every group renders
  // nowhere, with nothing on screen to say why.
  const placed = app.recordLayout.filter((b) => b.type === 'fields').flatMap((b) => b.config.fieldIds);
  assert.equal(new Set(placed).size, placed.length, 'nothing is placed twice');
  app.fields.forEach((f) => assert.ok(placed.includes(f.id), `"${f.label}" is on no card`));
});
