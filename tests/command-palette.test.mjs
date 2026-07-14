import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCommandIndex,
  scoreCommand,
  filterCommands,
  groupCommands,
} from '../src/command-palette.js';

const MODULES = [
  { id: 'jobs', label: 'Jobs', group: 'Quest CRM', icon: 'ti-hammer' },
  { id: 'contacts', label: 'Contacts', group: 'Quest CRM', icon: 'ti-id-badge-2' },
  { id: 'finance', label: 'Finance', group: 'Workspace', icon: 'ti-receipt-dollar' },
];
const COMPANIES = [
  { id: 'lumen', name: 'Lumen' },
  { id: 'quest', name: 'Quest Roofing' },
];
const ACTIONS = [
  { id: 'new-contact', label: 'New contact', action: 'quick-add', data: { type: 'contact' }, keywords: 'add create person' },
];

test('buildCommandIndex fans the sources into one flat, tagged list', () => {
  const cmds = buildCommandIndex({ modules: MODULES, companies: COMPANIES, actions: ACTIONS, activeCompanyId: 'lumen' });
  assert.equal(cmds.length, 6);
  assert.deepEqual([...new Set(cmds.map((c) => c.group))], ['Go to', 'Switch workspace', 'Actions']);

  const jobs = cmds.find((c) => c.id === 'nav:jobs');
  assert.deepEqual(jobs.run, { kind: 'navigate', section: 'jobs' });

  const contactAction = cmds.find((c) => c.id === 'act:new-contact');
  assert.deepEqual(contactAction.run, { kind: 'action', action: 'quick-add', data: { type: 'contact' } });
});

test('the active company is tagged so the caller can no-op it', () => {
  const cmds = buildCommandIndex({ companies: COMPANIES, activeCompanyId: 'lumen' });
  const active = cmds.find((c) => c.id === 'co:lumen');
  const other = cmds.find((c) => c.id === 'co:quest');
  assert.equal(active.run.noop, true);
  assert.equal(active.hint, 'Current');
  assert.equal(other.run.noop, false);
});

test('a prefix match beats a mid-word match beats a subsequence', () => {
  const cmds = buildCommandIndex({ modules: MODULES, actions: ACTIONS });
  const ranked = filterCommands(cmds, 'con');
  // "Contacts" (prefix) must rank above "New contact" (mid-word) and above
  // anything that only matches as a scattered subsequence.
  assert.equal(ranked[0].label, 'Contacts');
  assert.ok(ranked.some((c) => c.label === 'New contact'));
});

test('subsequence matching finds "New contact" from initials "nc"', () => {
  const cmds = buildCommandIndex({ actions: ACTIONS });
  const ranked = filterCommands(cmds, 'nc');
  assert.equal(ranked[0].label, 'New contact');
});

test('a query that matches nothing yields an empty list, not everything', () => {
  const cmds = buildCommandIndex({ modules: MODULES });
  assert.deepEqual(filterCommands(cmds, 'zzzzz'), []);
});

test('an empty query returns every command in source order', () => {
  const cmds = buildCommandIndex({ modules: MODULES, companies: COMPANIES, actions: ACTIONS });
  const ranked = filterCommands(cmds, '   ');
  assert.equal(ranked.length, cmds.length);
  assert.deepEqual(ranked.map((c) => c.id), cmds.map((c) => c.id));
});

test('keywords match even when the label does not', () => {
  const cmds = buildCommandIndex({ actions: ACTIONS });
  // "person" is only in keywords, never in the label "New contact".
  const ranked = filterCommands(cmds, 'person');
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].label, 'New contact');
});

test('scoreCommand returns null for a non-subsequence and a number for a hit', () => {
  const [jobs] = buildCommandIndex({ modules: [MODULES[0]] });
  assert.equal(scoreCommand(jobs, 'xyz'), null);
  assert.ok(typeof scoreCommand(jobs, 'job') === 'number');
  assert.equal(scoreCommand(jobs, ''), 0);
});

test('tighter subsequence runs outrank scattered ones', () => {
  const cmds = [
    { id: 'a', label: 'Form responses', group: 'g', keywords: '' },
    { id: 'b', label: 'Finance overview reports', group: 'g', keywords: '' },
  ];
  // "for" is contiguous in "Form" but scattered in "Finance...reports".
  const ranked = filterCommands(cmds, 'for');
  assert.equal(ranked[0].label, 'Form responses');
});

test('groupCommands preserves order and buckets by group', () => {
  const cmds = buildCommandIndex({ modules: MODULES, companies: COMPANIES, actions: ACTIONS });
  const groups = groupCommands(cmds);
  assert.deepEqual(groups.map((g) => g.group), ['Go to', 'Switch workspace', 'Actions']);
  assert.equal(groups[0].items.length, 3);
  assert.equal(groups[1].items.length, 2);
});
