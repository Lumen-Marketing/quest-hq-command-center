import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildCommandIndex,
  explainCommandMatch,
  filterCommands,
} from '../src/command-palette.js';
import { buildCompanySearchRecords, buildCompanySearchRecordsFromState } from '../src/company-search.js';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('company search builds contacts, quotes, jobs, tasks, and files with workspace-aware routes', () => {
  const records = buildCompanySearchRecords({
    contacts: [{
      id: 'contact-1',
      workspace_id: 'sales',
      name: 'Maria Gonzalez',
      email: 'maria@example.com',
      phone: '602-555-0100',
      location: 'Scottsdale',
      stage: 'Lead',
    }],
    quotes: [{
      id: 'quote-1',
      workspace_id: 'sales',
      name: 'Gonzalez tile reroof',
      owner_name: 'Josh',
      stage: 'Estimate sent',
    }],
    jobs: [{
      id: 'job-1',
      workspace_id: 'production',
      name: 'Gonzalez production',
      client_name: 'Maria Gonzalez',
      site_address: '123 Main St',
      stage: 'Scheduled',
    }],
    tasks: [{
      id: 'task-1',
      workspace_id: 'production',
      project_id: 'job-1',
      title: 'Order Eagle tile',
      description: 'Confirm bronze flashing',
      assignee_name: 'Shan',
      due: '2026-08-01',
    }],
    files: [{
      id: 'file-1',
      workspace_id: 'production',
      job_id: 'job-1',
      folder: 'jobs',
      file_name: 'permit-set.pdf',
      category: 'Permit',
      notes: 'City approved',
    }],
    workspaceNames: {
      sales: 'Sales',
      production: 'Production',
    },
  });

  assert.deepEqual(records.map((record) => record.group), ['Contacts', 'Quotes', 'Jobs', 'Tasks', 'Files']);
  assert.deepEqual(records[0].params, { contact_id: 'contact-1', workspace: 'sales' });
  assert.deepEqual(records[1].params, { tab: 'profile', deal_id: 'quote-1', workspace: 'sales' });
  assert.deepEqual(records[2].params, { tab: 'profile', job_id: 'job-1', workspace: 'production' });
  assert.deepEqual(records[3].params, { task_id: 'task-1', job_id: 'job-1', workspace: 'production' });
  assert.deepEqual(records[4].params, {
    folder: 'jobs',
    job_id: 'job-1',
    file_id: 'file-1',
    workspace: 'production',
  });
  assert.match(records[3].hint, /Production/);
  assert.match(records[4].hint, /Production/);
});

test('company search finds module-specific metadata, not only record titles', () => {
  const records = buildCompanySearchRecords({
    contacts: [{ id: 'c1', workspace_id: 'sales', name: 'Maria', email: 'maria@example.com' }],
    quotes: [{ id: 'q1', workspace_id: 'sales', name: 'Roof quote', owner_name: 'Josh' }],
    jobs: [{ id: 'j1', workspace_id: 'production', name: 'Roof job', site_address: '123 Main St' }],
    tasks: [{ id: 't1', workspace_id: 'production', title: 'Order material', assignee_name: 'Shan' }],
    files: [{ id: 'f1', workspace_id: 'production', file_name: 'permit.pdf', notes: 'City approved' }],
  });
  const commands = buildCommandIndex({ records });

  assert.equal(filterCommands(commands, 'maria@example')[0]?.group, 'Contacts');
  assert.equal(filterCommands(commands, 'Josh')[0]?.group, 'Quotes');
  assert.equal(filterCommands(commands, '123 Main')[0]?.group, 'Jobs');
  assert.equal(filterCommands(commands, 'Shan')[0]?.group, 'Tasks');
  assert.equal(filterCommands(commands, 'City approved')[0]?.group, 'Files');
});

test('company search explains metadata matches and ranks exact values first', () => {
  const records = buildCompanySearchRecords({
    contacts: [
      { id: 'c1', name: 'Alex Parra', email: 'roof@example.com' },
      { id: 'c2', name: 'Roof', email: 'alex@example.com' },
    ],
    jobs: [{ id: 'j1', name: 'Smith project', job_type: 'Roof' }],
  });
  const commands = buildCommandIndex({ records });
  const matches = filterCommands(commands, 'Roof');

  assert.equal(matches[0].label, 'Roof', 'an exact record name should win');
  assert.equal(matches[1].match, 'Job type: Roof');
  assert.equal(matches[2].match, 'Email: roof@example.com');
  assert.equal(explainCommandMatch(matches[0], 'Roof'), 'Exact name');
});

test('company search excludes inaccessible workspaces before indexing records', () => {
  const records = buildCompanySearchRecordsFromState({
    state: {
      contacts: [
        { id: 'allowed', company_id: 'quest', workspace_id: 'sales', name: 'Allowed contact' },
        { id: 'blocked', company_id: 'quest', workspace_id: 'secret', name: 'Blocked contact' },
      ],
      deals: [],
      jobs: [],
      tasks: [],
      files: [],
      proposals: [],
    },
    companyId: 'quest',
    workspaces: [{ id: 'sales', name: 'Sales', is_default: true }],
    canAccess: () => true,
    memberName: () => '',
  });

  assert.deepEqual(records.map((record) => record.label), ['Allowed contact']);
});

test('the Search this company field opens the cross-module palette instead of filtering one page', () => {
  assert.match(source, /class="global-search topbar-global-search" data-action="command-open"/);
  assert.match(source, /function openCommandPalette\(initialQuery = ''\)/);
  assert.match(source, /if \(event\.target\.matches\('\[data-global-search\]'\)\) \{\s*openCommandPalette\(event\.target\.value\);/);
  assert.doesNotMatch(source, /if \(event\.target\.matches\('\[data-global-search\]'\)\) \{\s*state\.query = event\.target\.value;/);
  assert.match(source, /buildCompanySearchRecordsFromState\(\{/);
});
