# Company and Workspace Tenancy Design

**Date:** 2026-07-21
**Status:** Approved in chat by the product owner with “alright fix everything”

## Outcome

Quest HQ will distinguish the customer account from the operational workspaces inside it. A person has one Supabase Auth identity and one profile. Company membership determines whether the person is an Owner, Admin, or Member of the customer account. Workspace membership and a company-defined role determine which operational workspace the person can enter and what they can do there.

The first market-ready slice makes CRM and production pipelines truly workspace-scoped and makes plugin activation configurable per workspace. Existing companies and records migrate into a default workspace without losing access or changing existing URLs.

## Product vocabulary

- **User/profile:** one human identity backed by Supabase Auth.
- **Company:** the customer, subscription, billing, and top-level security tenant.
- **Company membership:** the user’s relationship to the customer account. Owners and Admins manage the account; Members require explicit workspace access.
- **Workspace:** a configurable operating environment inside one company, such as Cold Calling, Sales, Underwriting, Production, or Management.
- **Workspace membership:** permission for a Member to enter a specific workspace. Owners and company Admins have implicit access to all workspaces.
- **Role:** a reusable company-defined permission set, assignable inside a workspace.
- **Company plugin entitlement:** an app the company owns or may use.
- **Workspace plugin:** an entitled app enabled and configured for one workspace.

The existing Workspace App Builder remains a plugin for custom database-like apps. Its customer-facing label becomes **Custom Apps** where needed so it is not confused with operational workspaces.

## Authorization model

Supabase Auth will not contain separate owner and worker account types. Signup path creates authorization records:

1. **Create a company:** the authenticated profile receives an active `company_memberships` row with role `owner`. The system creates a default operational workspace, gives the Owner access, and seeds its plugin/pipeline configuration.
2. **Join by invite:** the authenticated profile may only join the company identified by a valid email-bound invite. The accepted company role becomes `member` unless the inviter explicitly grants an administrative role. The invite acceptance transaction creates default workspace access or the workspace assignments embedded in the invite.
3. **Existing company member:** Owners/Admins manage workspace access. Members cannot self-promote or assign themselves to a workspace.

Authorization decisions must not use `profiles.raw_user_meta_data`, `profiles.role`, or `profiles.company_ids`. The two profile columns remain temporarily for backward compatibility but are no longer authoritative for new code or policies. Company and workspace membership tables are the source of truth.

Company-level access:

- `owner`: billing, ownership, company settings, all workspaces, users, and plugins.
- `admin`: company users, workspace configuration, and all workspaces; no ownership transfer or billing authority unless separately granted.
- `member`: only explicitly assigned workspaces and permissions.

Workspace-level access:

- Owners and Admins have implicit access.
- Members require an active `workspace_memberships` row.
- The workspace membership references one company-defined role. Existing company-wide role assignments remain a backward-compatible fallback during migration.
- RLS checks both `company_id` and `workspace_id` for workspace-scoped rows.

## Database design

### `workspaces`

Operational workspace identity:

- `id uuid primary key default gen_random_uuid()`
- `company_id text not null references companies(id) on delete cascade`
- `slug text not null`
- `name text not null`
- `description text not null default ''`
- `icon_key text not null default 'home'`
- `color text not null default '#f0b23b'`
- `status text not null default 'active'` constrained to `active|archived`
- `is_default boolean not null default false`
- `created_by uuid references profiles(id)`
- timestamps
- unique case-insensitive slug per company
- one partial unique default workspace per company

### `workspace_memberships`

- `workspace_id uuid references workspaces(id) on delete cascade`
- `profile_id uuid references profiles(id) on delete cascade`
- `role_id uuid references roles(id) on delete set null`
- `status text` constrained to `active|disabled`
- `assigned_by uuid references profiles(id)`
- timestamps
- primary key `(workspace_id, profile_id)`

A constraint trigger verifies that the selected role and workspace belong to the same company.

### `workspace_plugins`

- `workspace_id uuid references workspaces(id) on delete cascade`
- `plugin_id text`
- `status text` constrained to `installed|disabled`
- `config jsonb not null default '{}'`
- install/disable actor and timestamps
- primary key `(workspace_id, plugin_id)`

`company_plugins` remains the entitlement layer. A workspace can only install a plugin that is installed for its company. Disabling a workspace plugin preserves its data.

### Workspace-scoped operational records

The following records gain `workspace_id uuid references workspaces(id)` and are backfilled to each company’s default workspace:

- `accounts`
- `contacts`
- `crm_sites`
- `deals`
- `activities`
- `jobs`
- `tasks`
- `pipeline_stages`
- `underwriting_cases`
- `job_files`
- `proposal_documents`

This set covers the complete contact → quote → underwriting → proposal → job → task production pipeline. Company-level billing, company membership, role definitions, invitations, audit, and subscription records intentionally remain company-scoped.

Existing cross-record links must stay within the same company and workspace. Application writes always include the active workspace id. Database triggers reject a record whose linked contact/deal/job belongs to another workspace.

## Database functions and RLS

Security helpers live in the non-exposed `app_private` schema and use `SECURITY DEFINER` only to read membership tables without RLS recursion. They use a fixed empty `search_path`, fully qualified relation names, explicit `auth.uid()` checks, and revoked public execution.

- `app_private.is_workspace_member(target_workspace_id uuid)`
- `app_private.is_workspace_admin(target_workspace_id uuid)`
- `app_private.has_workspace_permission(target_workspace_id uuid, permission text)`
- `app_private.workspace_has_plugin(target_workspace_id uuid, target_plugin_id text)`

Authenticated RPCs:

- `create_operational_workspace(target_company_id text, workspace_name text, preset_code text, icon_key text)` creates the workspace, assigns the creator, copies allowed plugins, and seeds pipeline stages atomically.
- `set_workspace_member(target_workspace_id uuid, target_profile_id uuid, target_role_id uuid, next_status text)` is Owner/Admin-only and cannot bypass company membership.
- `set_workspace_plugin(target_workspace_id uuid, target_plugin_id text, next_status text)` enforces company entitlement.
- `apply_workspace_plugin_preset(target_workspace_id uuid, preset_code text)` enables only company-entitled plugins.
- `replace_workspace_pipeline_stages(p_workspace_id uuid, p_kind text, p_stages jsonb, p_rename_map jsonb)` replaces stages and renames records only inside that workspace.

Every new public table receives explicit Data API grants and RLS in the same migration. Policies include `TO authenticated`, indexed membership lookup columns, and both `USING` and `WITH CHECK` for updates.

## Migration and compatibility

The migration is additive and forward-only:

1. Create one default `Main` workspace for every existing company.
2. Backfill all active company memberships into each default workspace, preserving the user’s current assigned role when available.
3. Copy installed `company_plugins` rows into default `workspace_plugins` rows.
4. Backfill the pipeline tables to the default workspace.
5. Add indexes and workspace-aware uniqueness constraints.
6. Replace workspace-scoped policies only after data is backfilled.
7. Keep existing `/company/:companyId/:section` routes. When no `workspace` query parameter is present, the client selects the default allowed workspace and canonicalizes subsequent navigation.

No company, membership, pipeline record, plugin data, or URL is deleted. Existing profile authorization columns remain present until a later migration proves no older policy consumes them.

## Application behavior

### Active context

The browser stores `activeCompanyId` and `activeWorkspaceId` separately. `companyPath()` preserves the active workspace in a `workspace` query parameter. Changing company resolves its default allowed workspace. Changing workspace preserves the current module when that module is installed; otherwise it opens Dashboard.

All CRM/production selectors filter by both company and active workspace. Every create/update payload for a scoped record includes `workspace_id`.

### Sidebar

The command rail shows:

1. Company account header with the signed-in company role.
2. A `WORKSPACES` section listing only allowed operational workspaces.
3. Active workspace highlight and workspace role.
4. Owner/Admin actions: `Create workspace` and `Manage workspaces`.
5. The existing module navigation filtered by the active workspace’s plugins and role permissions.

This matches the provided Podio-style hierarchy without hardcoding Cold Calling, Sales, Underwriting, Production, or Management. Those are workspace names a customer may create and configure.

### Workspace management

Company settings gains a workspace management panel:

- create, rename, recolor, and archive workspaces;
- assign/remove company members;
- select a role for each workspace member;
- configure enabled plugins and plugin presets for the selected workspace;
- show the default workspace and prevent archiving the only active/default workspace.

### User differentiation

The Users page displays company role separately from workspace access. Owners/Admins can edit workspace assignments. Workers see only their assigned workspace list. The application never lets a registering user select Owner/Admin privileges for an existing company.

## Error handling

- An inaccessible workspace parameter redirects to the first allowed workspace without exposing whether another workspace exists.
- Archived or disabled workspace access is treated as no access.
- Cross-workspace link attempts fail server-side and the UI keeps the form open with the returned message.
- Plugin installation fails if the company lacks entitlement.
- The default workspace cannot be archived, and the final active workspace cannot be removed.
- Failed live writes never fall back to browser-only success.

## Verification

Automated tests must prove:

- existing companies receive one default workspace;
- existing records and plugin configuration backfill without null workspace ids;
- Owner/Admin implicit access and Member explicit access behave correctly;
- one user may be Owner in one company and Member in another without `profiles.role` affecting authorization;
- users cannot read or mutate records in an unassigned workspace;
- pipeline stages and records remain independent between two workspaces in one company;
- workspace plugin configuration changes navigation without changing company entitlement;
- legacy company URLs resolve to the default workspace;
- company and workspace switching preserve tenant boundaries;
- signup, company creation, invite acceptance, and worker access still work;
- the full test suite, project-brain validation, production build, Supabase advisors, and deployed production smoke pass.

## Deliberate boundaries

The company remains the security and billing tenant. This change does not turn workspaces into separate subscriptions or separate Supabase projects. Messages, finance, forms, calendar, knowledge, price book, and company files remain company data in this first release even when their plugins are enabled only in selected workspaces. They can gain record-level workspace scoping later without changing the membership/plugin foundation delivered here.
