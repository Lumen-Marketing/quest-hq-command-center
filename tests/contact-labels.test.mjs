import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../supabase/migrations/202608011200_contact_labels.sql', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n');

test('labels are rows, not text in a notes field', () => {
  assert.match(sql, /create table if not exists public\.contact_labels/);
  assert.match(sql, /create table if not exists public\.contact_label_assignments/);
  // Many-to-many: a contact has many labels and a label has many contacts. An array
  // column on the contact would make renaming a label a rewrite of every contact row.
  assert.match(sql, /primary key \(contact_id, label_id\)/);
});

test('the assignment table matches the real contacts.id type', () => {
  // contacts.id is text in this schema. Declaring uuid here fails at foreign-key
  // creation rather than silently, which is how the mismatch was caught — but the type
  // is worth pinning so a future edit does not reintroduce it.
  assert.match(sql, /contact_id text not null references public\.contacts \(id\) on delete cascade/);
  assert.match(sql, /label_id uuid not null references public\.contact_labels \(id\) on delete cascade/);
});

test('deleting a contact or a label removes its assignments', () => {
  const assignments = sql.slice(sql.indexOf('create table if not exists public.contact_label_assignments'));
  const body = assignments.slice(0, assignments.indexOf(');'));
  // Without cascade, deleting a contact would leave assignment rows pointing at nothing.
  assert.equal((body.match(/on delete cascade/g) || []).length, 3, 'contact, label and workspace should all cascade');
  // The people references must NOT cascade — losing an assignment because the person who
  // made it left the company would be data loss.
  assert.match(body, /assigned_by uuid references public\.profiles \(id\) on delete set null/);
});

test('every table has row-level security enabled', () => {
  for (const t of ['contact_labels', 'contact_label_assignments']) {
    assert.match(sql, new RegExp(`alter table public\\.${t} enable row level security`));
  }
});

test('scoping matches contacts exactly, so labels cannot outlive their permission', () => {
  // Reading a label requires the same permission as reading the contacts it describes.
  assert.match(sql, /"contact labels workspace read"[\s\S]*?has_workspace_permission\(workspace_id, 'crm\.view'\)/);
  for (const action of ['insert', 'update', 'delete']) {
    assert.match(
      sql,
      new RegExp(`"contact labels workspace ${action}"[\\s\\S]*?has_workspace_permission\\(workspace_id, 'crm\\.manage'\\)`),
      `${action} should require crm.manage`,
    );
  }
});

// This is the defect class fixed in 202608010900: a policy that checks only the row's own
// workspace column lets a caller name a workspace they belong to while pointing at a
// record that lives somewhere else.
test('assignment policies verify the contact really is in the claimed workspace', () => {
  for (const action of ['read', 'insert', 'delete']) {
    const start = sql.indexOf(`create policy "contact label assignments workspace ${action}"`);
    assert.notEqual(start, -1, `${action} policy should exist`);
    const policy = sql.slice(start, sql.indexOf(';', start));
    assert.match(policy, /from public\.contacts c[\s\S]*?c\.workspace_id = contact_label_assignments\.workspace_id/,
      `${action} must confirm the contact's workspace matches`);
    assert.ok(!/c\.workspace_id = c\.workspace_id/.test(policy), 'self-comparison enforces nothing');
  }
});

test('insert also verifies the label belongs to the claimed workspace', () => {
  const start = sql.indexOf('create policy "contact label assignments workspace insert"');
  const policy = sql.slice(start, sql.indexOf(';', start));
  assert.match(policy, /from public\.contact_labels l[\s\S]*?l\.workspace_id = contact_label_assignments\.workspace_id/);
});

test('assignments have no update policy, because they carry no mutable state', () => {
  assert.ok(!/create policy "contact label assignments workspace update"/.test(sql),
    'changing a label means delete plus insert, which keeps assigned_at honest');
});

test('label names are unique per workspace, case-insensitively', () => {
  // "Hot Lead" and "hot lead" are the same label to a person; allowing both produces two
  // identical-looking chips that count separately.
  assert.match(sql, /create unique index if not exists contact_labels_workspace_name_key\s*\n\s*on public\.contact_labels \(workspace_id, lower\(name\)\)/);
});

test('the queries segments will be built on are indexed', () => {
  // The composite primary key leads with contact_id, so it does not serve
  // "which contacts carry this label" — the query a saved segment is.
  assert.match(sql, /contact_label_assignments_label_idx\s*\n\s*on public\.contact_label_assignments \(label_id\)/);
  // Both foreign keys to profiles need their own index or deleting a person scans.
  assert.match(sql, /contact_labels_created_by_fk_idx/);
  assert.match(sql, /contact_label_assignments_assigned_by_fk_idx/);
});
