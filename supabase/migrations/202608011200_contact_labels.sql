-- Contact labels, as durable rows rather than text smuggled into a notes field.
--
-- The problem this replaces: the campaign action wrote label names into the contact's
-- notes and overwrote lead_source to record membership. Both are lossy — a label could
-- not be renamed, removed, counted or filtered on, and overwriting lead_source destroyed
-- the record of where the contact actually came from. That is checklist item P1 6.
--
-- Two tables, because a contact has many labels and a label has many contacts. Storing an
-- array on the contact would make "rename this label" a rewrite of every contact row and
-- "which contacts have this label" a scan.
--
-- Scoping matches `contacts` exactly — workspace membership plus crm.view / crm.manage —
-- because a label is only ever seen alongside the contacts it belongs to. Anything looser
-- would leak one workspace's segmentation vocabulary into another's.

create table if not exists public.contact_labels (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  color text not null default '#64748b',
  description text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case-insensitive uniqueness per workspace: "Hot Lead" and "hot lead" are the same label
-- to a person, and allowing both produces two chips that look identical and count apart.
create unique index if not exists contact_labels_workspace_name_key
  on public.contact_labels (workspace_id, lower(name));

create index if not exists contact_labels_company_idx on public.contact_labels (company_id);
create index if not exists contact_labels_created_by_fk_idx on public.contact_labels (created_by);

create table if not exists public.contact_label_assignments (
  -- text, not uuid: contacts.id is text in this schema. A uuid column here would
  -- fail to create the foreign key at all, which is how this was caught.
  contact_id text not null references public.contacts (id) on delete cascade,
  label_id uuid not null references public.contact_labels (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id text not null,
  assigned_by uuid references public.profiles (id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (contact_id, label_id)
);

-- The composite primary key covers (contact_id, ...) but not label_id on its own, and
-- "which contacts have this label" is the query segments will be built on.
create index if not exists contact_label_assignments_label_idx
  on public.contact_label_assignments (label_id);
create index if not exists contact_label_assignments_workspace_idx
  on public.contact_label_assignments (workspace_id);
create index if not exists contact_label_assignments_assigned_by_fk_idx
  on public.contact_label_assignments (assigned_by);

-- A row must not be able to claim one workspace while its contact belongs to another.
-- Enforced in the policy below rather than by a constraint, because the check needs to
-- read the contact row.

alter table public.contact_labels enable row level security;
alter table public.contact_label_assignments enable row level security;

-- Labels ------------------------------------------------------------------------------
drop policy if exists "contact labels workspace read" on public.contact_labels;
create policy "contact labels workspace read" on public.contact_labels
  for select to authenticated
  using (app_private.is_workspace_member(workspace_id)
         and app_private.has_workspace_permission(workspace_id, 'crm.view'));

drop policy if exists "contact labels workspace insert" on public.contact_labels;
create policy "contact labels workspace insert" on public.contact_labels
  for insert to authenticated
  with check (app_private.is_workspace_member(workspace_id)
              and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

drop policy if exists "contact labels workspace update" on public.contact_labels;
create policy "contact labels workspace update" on public.contact_labels
  for update to authenticated
  using (app_private.is_workspace_member(workspace_id)
         and app_private.has_workspace_permission(workspace_id, 'crm.manage'))
  with check (app_private.is_workspace_member(workspace_id)
              and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

drop policy if exists "contact labels workspace delete" on public.contact_labels;
create policy "contact labels workspace delete" on public.contact_labels
  for delete to authenticated
  using (app_private.is_workspace_member(workspace_id)
         and app_private.has_workspace_permission(workspace_id, 'crm.manage'));

-- Assignments --------------------------------------------------------------------------
-- Every policy verifies the assignment's workspace against BOTH the contact's and the
-- label's own workspace. Checking only the assignment's own column would let a caller
-- name a workspace it belongs to while pointing at a contact in another — the same class
-- of defect as the tautological messaging checks fixed in 202608010900.

drop policy if exists "contact label assignments workspace read" on public.contact_label_assignments;
create policy "contact label assignments workspace read" on public.contact_label_assignments
  for select to authenticated
  using (app_private.is_workspace_member(workspace_id)
         and app_private.has_workspace_permission(workspace_id, 'crm.view')
         and exists (select 1 from public.contacts c
                     where c.id = contact_label_assignments.contact_id
                       and c.workspace_id = contact_label_assignments.workspace_id));

drop policy if exists "contact label assignments workspace insert" on public.contact_label_assignments;
create policy "contact label assignments workspace insert" on public.contact_label_assignments
  for insert to authenticated
  with check (app_private.is_workspace_member(workspace_id)
              and app_private.has_workspace_permission(workspace_id, 'crm.manage')
              and exists (select 1 from public.contacts c
                          where c.id = contact_label_assignments.contact_id
                            and c.workspace_id = contact_label_assignments.workspace_id)
              and exists (select 1 from public.contact_labels l
                          where l.id = contact_label_assignments.label_id
                            and l.workspace_id = contact_label_assignments.workspace_id));

drop policy if exists "contact label assignments workspace delete" on public.contact_label_assignments;
create policy "contact label assignments workspace delete" on public.contact_label_assignments
  for delete to authenticated
  using (app_private.is_workspace_member(workspace_id)
         and app_private.has_workspace_permission(workspace_id, 'crm.manage')
         and exists (select 1 from public.contacts c
                     where c.id = contact_label_assignments.contact_id
                       and c.workspace_id = contact_label_assignments.workspace_id));

-- No UPDATE policy: an assignment carries no mutable state. Changing which label applies
-- means deleting one row and inserting another, which keeps assigned_at honest.

create trigger contact_labels_set_updated_at
  before update on public.contact_labels
  for each row execute function set_updated_at();
