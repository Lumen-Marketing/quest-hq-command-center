import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  analyticsJobChoiceLabel,
  compactContactFilterValues,
} from '../src/ui/audit-hardening.js';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('large contact field groups stay compact and become searchable', () => {
  const values = Array.from({ length: 263 }, (_, index) => `Roof type ${index + 1}`);

  assert.deepEqual(compactContactFilterValues(values, ''), {
    items: values.slice(0, 7),
    total: 263,
    matchCount: 263,
    hiddenCount: 256,
    searchable: true,
  });

  assert.deepEqual(compactContactFilterValues(values, 'type 26'), {
    items: ['Roof type 26', 'Roof type 260', 'Roof type 261', 'Roof type 262', 'Roof type 263'],
    total: 263,
    matchCount: 5,
    hiddenCount: 0,
    searchable: true,
  });
});

test('reports job choices include enough context to distinguish duplicate names', () => {
  assert.equal(analyticsJobChoiceLabel({
    name: 'Johnson roof',
    site_address: '22 Main Street',
    client_name: 'Mary Johnson',
    stage: 'Production',
  }), 'Johnson roof - 22 Main Street - Production');

  assert.equal(analyticsJobChoiceLabel({
    name: 'Johnson roof',
    client_name: 'Mary Johnson',
    stage: 'Production',
  }), 'Johnson roof - Mary Johnson - Production');
});

test('icon-only contact, message, and file controls expose names and button semantics', () => {
  assert.match(source, /title="Table view" aria-label="Table view"/);
  assert.match(source, /title="Board view" aria-label="Board view"/);
  assert.match(source, /title="Manage stages" aria-label="Manage stages"/);
  assert.match(source, /data-message-search[^>]+aria-label="Find a chat or person"/);
  assert.match(source, /data-action="pick-message-attachments"[^>]+aria-label="Attach files"/);
  assert.doesNotMatch(source, /<label class="icon-button message-attach-button"/);
  assert.match(source, /type="submit" title="Send" aria-label="Send message"/);
  assert.match(source, /data-file-search[^>]+aria-label="Search drive"/);
  assert.match(source, /<div class="explorer-row[^>]+role="row">[\s\S]*?<button class="file-check[^>]+aria-label="Select \$\{h\(file\.file_name\)\}"/);
  assert.match(source, /<button class="explorer-file-open"[^>]+aria-label="Open \$\{h\(file\.file_name\)\}"/);
  assert.match(source, /<article class="file-card-live[^>]*>[\s\S]*?<button class="file-check tile[^>]+aria-label="Select \$\{h\(file\.file_name\)\}"/);
});

test('display names stay consistent with the navigation labels', () => {
  assert.match(source, /<span><strong>Questbase<\/strong><small>workspace<\/small><\/span>/);
  assert.doesNotMatch(source, /<strong>Quest<\/strong><small>command center<\/small>/);
  assert.match(source, /function routeTitle\(route\)[\s\S]*?navigationLabel\(route\.section/);
  assert.match(source, /<strong>Reports<\/strong>/);
  assert.match(source, /analyticsJobChoiceLabel\(job\)/);
});

test('job photos keep their form note inside a padded modal body', () => {
  assert.match(styles, /\.job-photos-shell\s*\{[\s\S]*?padding:\s*18px/);
  assert.match(styles, /\.job-photo-uploader \.form-actions\s*\{[\s\S]*?grid-template-columns:\s*max-content minmax\(0, 1fr\)/);
  assert.match(styles, /\.job-photo-uploader \.form-note\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
});

test('desktop shell and compact settings controls meet the hardened target sizes', () => {
  assert.match(styles, /\.quest-nav-v2 \.side-item\s*\{[\s\S]*?min-height:\s*40px/);
  assert.match(styles, /\.quest-nav-v2 \.side-sub-link\s*\{[\s\S]*?min-height:\s*36px/);
  assert.match(styles, /\.quest-nav-v2 \.side-pipe-toggle\s*\{[\s\S]*?width:\s*40px;[\s\S]*?height:\s*40px/);
  assert.match(styles, /\.appearance-seg button\s*\{[\s\S]*?min-height:\s*40px/);
  assert.match(styles, /\.message-meta button\s*\{[\s\S]*?width:\s*40px;[\s\S]*?height:\s*40px/);
});

test('jobs only hide duplicate stage chips when the same stage navigation is visible', () => {
  assert.match(source, /jobs-pipeline \$\{showSidebarStageNav \? 'stage-nav-in-sidebar' : ''\}/);
  assert.match(styles, /\.jobs-pipeline\.stage-nav-in-sidebar \.pipe-toolbar \.pipe-chips\s*\{\s*display:\s*none/);
  assert.match(styles, /\.pipe-board\s*\{[\s\S]*?scroll-snap-type:\s*inline proximity/);
});

test('the active account name can wrap instead of being clipped', () => {
  assert.match(styles, /\.quest-nav-v2 \.deck-user-card strong\s*\{[\s\S]*?white-space:\s*normal/);
  assert.match(styles, /\.quest-nav-v2 \.deck-user-card strong\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
});
