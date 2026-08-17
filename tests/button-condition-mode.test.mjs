import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

import { conditionMet, impossibleConditions } from '../src/workspace/button-field.js';

// "I set the condition to Status is Warm, and it IS warm — why isn't the button enabled?"
//
// Because there were two: Status is Hot, and Status is Warm. Conditions were AND-ed with no
// way to say otherwise, so one field asked to equal two things at once could never hold and
// the button sat dead with two conditions on screen that each looked right.

const APP = {
  fields: [
    { id: 's', label: 'Status', type: 'status', config: { options: [{ id: 'o1', label: 'Hot' }, { id: 'o2', label: 'Warm' }] } },
    { id: 'p', label: 'Price', type: 'money', config: {} },
  ],
};
const warm = { values: { s: 'o2', p: 1000 } };
const btn = (when, whenMode) => ({ id: 'b', config: { when, ...(whenMode ? { whenMode } : {}) } });
const HOT_OR_WARM = [{ field: 's', op: 'eq', value: 'Hot' }, { field: 's', op: 'eq', value: 'Warm' }];

test('the reported case: two values for one field, ANY lights it up', () => {
  assert.equal(conditionMet(btn(HOT_OR_WARM), warm, APP), false, 'ALL can never hold here');
  assert.equal(conditionMet(btn(HOT_OR_WARM, 'any'), warm, APP), true);
});

test('ALL stays the default, so every button written before this is unchanged', () => {
  const both = [{ field: 's', op: 'eq', value: 'Warm' }, { field: 'p', op: 'filled', value: '' }];
  assert.equal(conditionMet(btn(both), warm, APP), true);
  assert.equal(conditionMet(btn(both), { values: { s: 'o2' } }, APP), false, 'a missing price should still block it');
  assert.equal(conditionMet({ id: 'b', config: { when: both, whenMode: 'all' } }, warm, APP), true);
});

test('ANY needs only one of several to hold', () => {
  const either = [{ field: 's', op: 'eq', value: 'Hot' }, { field: 'p', op: 'filled', value: '' }];
  assert.equal(conditionMet(btn(either, 'any'), warm, APP), true, 'the price is filled, so it passes');
  assert.equal(conditionMet(btn(either, 'any'), { values: { s: 'o2' } }, APP), false, 'neither holds');
});

test('no conditions at all is still always enabled, in either mode', () => {
  assert.equal(conditionMet(btn([]), warm, APP), true);
  assert.equal(conditionMet(btn([], 'any'), warm, APP), true);
  assert.equal(conditionMet({ id: 'b', config: {} }, warm, APP), true);
});

test('a half-written rule is ignored rather than locking the button', () => {
  assert.equal(conditionMet(btn([{ field: 's', op: '', value: 'Hot' }], 'any'), warm, APP), true);
});

test('the impossible combination is named, so it can be said out loud', () => {
  assert.deepEqual(impossibleConditions({ when: HOT_OR_WARM }), ['s']);
  // Not a clash once ANY is chosen — that is exactly what ANY is for.
  assert.deepEqual(impossibleConditions({ when: HOT_OR_WARM, whenMode: 'any' }), []);
  // Nor when the two rules are on different fields, or repeat the same value.
  assert.deepEqual(impossibleConditions({ when: [{ field: 's', op: 'eq', value: 'Hot' }, { field: 'p', op: 'eq', value: '1' }] }), []);
  assert.deepEqual(impossibleConditions({ when: [{ field: 's', op: 'eq', value: 'Hot' }, { field: 's', op: 'eq', value: 'hot' }] }), [], 'case only');
  // "is not" twice is perfectly satisfiable, so it is not flagged.
  assert.deepEqual(impossibleConditions({ when: [{ field: 's', op: 'neq', value: 'Hot' }, { field: 's', op: 'neq', value: 'Warm' }] }), []);
});

test('the panel offers the mode and warns, and the readback stores it', () => {
  const ui = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8');
  assert.match(ui, /Any one of these is enough/);
  assert.match(ui, /This button can never light up/);
  assert.match(ui, /config\.whenMode = val\('wbBtnWhenMode'\) === 'any' \? 'any' : 'all';/);
  // Only shown once there are two conditions to relate.
  assert.match(ui, /rules\.filter\(\(rule\) => rule\.field\)\.length > 1 \?/);
});
