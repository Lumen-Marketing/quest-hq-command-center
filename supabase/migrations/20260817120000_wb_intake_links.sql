-- Public intake links: a client fills in an App Builder record without signing in.
--
-- WHY A STAGING TABLE RATHER THAN WRITING THE RECORD DIRECTLY.
--
-- Every App Builder app, field and record for a company lives in ONE row:
-- public.workspace_builder_state is keyed by company_id with the whole document in `doc jsonb`.
-- There is no such thing as "insert one record" there -- the only write is REPLACE THE WHOLE
-- COMPANY DOCUMENT. So an anonymous writer cannot be given RLS write access to it under any
-- policy that means what it says: anybody holding a link would hold permission to overwrite
-- every app in the company. And even server-side, appending is a read-modify-write of the
-- entire document, which is exactly the contention src/workspace/builder-merge.js (a 148-line
-- three-way merge) exists to paper over today.
--
-- So a submission lands here, in its own row, and a signed-in member with workspaces.manage
-- turns it into a record through the client's own save path. That also buys a review step: a
-- public link that appends straight into a live app is a spam vector with no undo.
--
-- NEITHER TABLE IS REACHABLE BY anon. The public page talks to /api/wb-intake-open and
-- /api/wb-intake-submit, which use the service role and return only the fields the link
-- exposes -- never the company document. Grants are revoked from anon explicitly below.

create table if not exists public.wb_intake_links (
  -- High-entropy, URL-safe, minted by the server. This is the secret in a public link.
  token text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  -- The App Builder app id INSIDE the document. Not a foreign key -- there is no table of
  -- apps to point at, which is the same limitation this whole file is written around.
  app_id text not null,
  title text not null default '',
  intro text not null default '',
  -- 'public'  -- anyone with the link may fill it in.
  -- 'private' -- a 6-character passcode is required before the fields are even returned.
  visibility text not null default 'public'
    check (visibility in ('public', 'private')),
  -- scrypt(passcode, salt). The passcode itself is never stored and cannot be read back;
  -- regenerating is the only recovery, which is the correct behaviour for a shared secret.
  passcode_hash text,
  passcode_salt text,
  -- Which of the app's fields the client may fill. Empty means every fillable field.
  -- Stored as ids; the labels, types and options are read live from the document by the API,
  -- so renaming a field in the App Builder is reflected without touching this row.
  field_ids jsonb not null default '[]'::jsonb,
  status text not null default 'active'
    check (status in ('active', 'paused')),
  submission_count integer not null default 0,
  -- null means unlimited. A link handed to one client usually wants 1.
  max_submissions integer,
  expires_at timestamptz,
  -- Passcode guessing is bounded here as well as by the API's per-IP limiter, because that
  -- limiter is in-memory and per serverless instance. This one survives a cold start.
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A private link with no passcode is not private; a public one must not carry a stale hash.
  constraint wb_intake_links_passcode_matches_visibility check (
    (visibility = 'private' and passcode_hash is not null and passcode_salt is not null)
    or (visibility = 'public' and passcode_hash is null and passcode_salt is null)
  ),
  constraint wb_intake_links_max_submissions_positive check (
    max_submissions is null or max_submissions > 0
  )
);

create index if not exists wb_intake_links_by_app
  on public.wb_intake_links (company_id, workspace_id, app_id);

create table if not exists public.wb_intake_submissions (
  id uuid primary key default gen_random_uuid(),
  token text not null references public.wb_intake_links(token) on delete cascade,
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  app_id text not null,
  -- Keyed by the app's field ids, already validated against the field types by the API.
  values jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  -- The App Builder item this became, once somebody accepted it. A doc-internal id, so again
  -- not a foreign key.
  accepted_item_id text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  submitted_name text not null default '',
  submitted_email text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists wb_intake_submissions_pending
  on public.wb_intake_submissions (company_id, workspace_id, app_id, status, created_at desc);

create index if not exists wb_intake_submissions_by_token
  on public.wb_intake_submissions (token);

alter table public.wb_intake_links enable row level security;
alter table public.wb_intake_submissions enable row level security;

-- ---- Policies ------------------------------------------------------------------------------
-- Reading a link row means reading its passcode hash and the token that unlocks the form, so
-- it is gated at the same level as editing the app itself, not at view level.

drop policy if exists "managers read intake links" on public.wb_intake_links;
create policy "managers read intake links" on public.wb_intake_links
for select using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

drop policy if exists "managers write intake links" on public.wb_intake_links;
create policy "managers write intake links" on public.wb_intake_links
for all using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

-- A submission is somebody's answer to a form, not configuration: anyone who can open the
-- workspace may read it. Accepting or rejecting one writes a record, so that needs manage.
drop policy if exists "members read intake submissions" on public.wb_intake_submissions;
create policy "members read intake submissions" on public.wb_intake_submissions
for select using (app_private.has_workspace_permission(workspace_id, 'workspaces.view'));

drop policy if exists "managers review intake submissions" on public.wb_intake_submissions;
create policy "managers review intake submissions" on public.wb_intake_submissions
for update using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

drop policy if exists "managers delete intake submissions" on public.wb_intake_submissions;
create policy "managers delete intake submissions" on public.wb_intake_submissions
for delete using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

-- No INSERT policy on submissions ON PURPOSE. The only writer is /api/wb-intake-submit under
-- the service role, which bypasses RLS. A signed-in member has no reason to insert one, and
-- leaving the verb closed means a compromised session cannot forge client submissions.

-- ---- Grants --------------------------------------------------------------------------------
-- anon must never touch either table. The public page reaches them only through the two API
-- routes, which read the app's fields out of the company document and return nothing else.

revoke all on public.wb_intake_links from anon;
revoke all on public.wb_intake_submissions from anon;

grant select, insert, update, delete on public.wb_intake_links to authenticated;
grant select, update, delete on public.wb_intake_submissions to authenticated;
