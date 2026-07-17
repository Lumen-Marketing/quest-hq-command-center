import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607151500_knowledge_base.sql', import.meta.url), 'utf8');

test('knowledge is a live module wired to its page, not a planned stub', () => {
  assert.match(main, /id: 'knowledge', group: 'Workspace'[^}]*status: 'live'[^}]*permission: 'files\.view'/);
  assert.match(main, /route\.section === 'knowledge'\) return renderKnowledgePage/);
  // Moved out of the Future nav group.
  assert.match(main, /label: 'Workspace', ids: \['workspaces', 'workday', 'deals', 'files', 'forms', 'client-portals', 'knowledge'\]/);
});

test('CRUD goes through Supabase, gated by files.manage', () => {
  assert.match(main, /from\('knowledge_articles'\)\.upsert/);
  assert.match(main, /from\('knowledge_articles'\)\.delete\(\)/);
  assert.match(main, /requirePermission\('files\.manage'/);
  // Loaded on demand, not woven into the main Promise.all.
  assert.match(main, /function loadKnowledgeArticles\(companyId\)/);
  assert.match(main, /knowledgeLoadedCompanies/);
});

test('the migration creates a company-scoped, RLS-protected table', () => {
  assert.match(migration, /create table if not exists public\.knowledge_articles/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /app_private\.is_company_member\(company_id\)/);
  assert.match(migration, /has_company_permission\(company_id, 'files\.manage'\)/);
  assert.match(migration, /grant select, insert, update, delete on public\.knowledge_articles to authenticated/);
});
