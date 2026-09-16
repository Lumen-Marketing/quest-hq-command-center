// The Quest App Market sorts shared apps by their Type and offers a button per category.
// Rendered for real with a stub context rather than read as text: what matters is which apps
// land under which button, not how the template is spelled.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBuilderModal } from '../src/workspace/builder-modal.js';

const h = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const entry = (id, name, type) => ({ companyId: 'c1', companyLabel: 'Quest Roofing', workspaceName: 'Sales', app: { id, name, type, fields: [], automations: [] } });

function renderMarket({ cat, q, library }) {
  const state = { builderModal: { kind: 'app-chooser', step: 'library', cat, q }, wbAppLibrary: library };
  const { renderWorkspaceBuilderModal } = createBuilderModal({
    state, h, WB_FIELD_TYPES: {}, WB_PALETTE: ['#111', '#222'],
    wbModalShell: (_title, _cls, head, body, foot) => `${head}${body}${foot}`,
  });
  return renderWorkspaceBuilderModal();
}

const library = [
  entry('a1', 'Prospect', 'records'),
  entry('a2', 'Leads', 'Records'),
  entry('a3', 'Crew roster', 'Contacts'),
  entry('a4', 'Nurturing', ''),
  entry('a5', 'Warranty claims', 'Claims'),
];

const buttons = (html) => [...html.matchAll(/data-wb-lib-cat="([^"]*)"[^>]*>.*?<\/i>([^<]*)<span>(\d+)<\/span>/g)].map((m) => [m[1], Number(m[3])]);
const groupTitles = (html) => [...html.matchAll(/wb-lib-group-title"><i[^>]*><\/i>([^<]*?) <span>/g)].map((m) => m[1]);
const visibleApps = (html) => [...html.matchAll(/<div class="wb-lib-card"[^>]*?(hidden)?>[\s\S]*?<b>([^<]*)<\/b>/g)].filter((m) => !m[1]).map((m) => m[2]);

test('one button per category, known types first in their order, then freehand, then uncategorized', () => {
  const html = renderMarket({ library });
  assert.deepEqual(buttons(html), [['', 5], ['Contacts', 1], ['Records', 2], ['Claims', 1], ['Uncategorized', 1]]);
});

test('a type is matched without regard to case, so "records" and "Records" are one category', () => {
  const html = renderMarket({ library, cat: 'Records' });
  assert.deepEqual(visibleApps(html), ['Prospect', 'Leads']);
});

test('All shows every app under its category title', () => {
  const html = renderMarket({ library });
  assert.deepEqual(groupTitles(html), ['Contacts', 'Records', 'Claims', 'Uncategorized']);
  assert.equal(visibleApps(html).length, 5);
});

test('a chosen category shows only its apps, marks its button, and drops the titles', () => {
  const html = renderMarket({ library, cat: 'Uncategorized' });
  assert.deepEqual(visibleApps(html), ['Nurturing']);
  assert.match(html, /class="wb-lib-cat active" aria-pressed="true" data-wb-lib-cat="Uncategorized"/);
  assert.deepEqual(groupTitles(html), []);
});

test('search narrows within the chosen category and says so when nothing matches', () => {
  assert.deepEqual(visibleApps(renderMarket({ library, cat: 'Records', q: 'lead' })), ['Leads']);
  const none = renderMarket({ library, cat: 'Contacts', q: 'lead' });
  assert.deepEqual(visibleApps(none), []);
  assert.match(none, /id="wbLibNoMatch">[\s\S]*No shared apps in Contacts match your search/);
});

test('a category that no longer exists falls back to All', () => {
  const html = renderMarket({ library, cat: 'Invoices' });
  assert.match(html, /class="wb-lib-cat active" aria-pressed="true" data-wb-lib-cat=""/);
  assert.equal(visibleApps(html).length, 5);
});

test('the search box hides cards and empty categories in place, and the buttons re-render', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /\[data-wb-lib-group\][\s\S]{0,400}group\.hidden = !groupShown/);
  assert.match(main, /\[data-wb-lib-cat\][\s\S]{0,120}m\.cat = b\.dataset\.wbLibCat; render\(\)/);
});
