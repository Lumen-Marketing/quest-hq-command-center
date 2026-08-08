# Questbase Company Setup Survey Design

## Outcome

After an owner creates a company, Questbase opens a short setup survey that turns plain-language answers into a reviewable workspace plan. The owner can use guided setup, choose a ready-made setup, or start from scratch. Applying the plan configures operational workspaces, workspace apps, pipeline stages, and non-owner role templates without deleting business records.

The same setup experience is available later under Settings > Setup. A safe reset reopens the survey and clears only the saved setup answers and setup status. It never deletes the company, people, workspaces, customers, quotes, jobs, tasks, messages, files, or other live data.

## Product Rules

- A company remains the billing and security boundary. Operational workspaces remain children of that company.
- New companies receive one active default workspace named `Main` before the survey is completed.
- Company creation no longer asks the owner to understand a technical preset dropdown.
- The survey offers `Guided setup`, `Ready-made setup`, and a persistent `Start from scratch` option.
- No database configuration is changed until the owner reaches Review and selects `Apply setup`.
- Generated roles are custom, non-system roles. The survey never creates another owner or grants elevated owner/admin/developer access.
- Applying the same plan again is idempotent. It updates survey-managed records instead of making duplicates.
- A changed plan may archive an unused survey-managed workspace, but it never hard-deletes a workspace or its records.
- Existing pipeline stages are replaced only when the workspace has no contacts, quotes, or jobs. Otherwise they are preserved and the owner sees a warning.
- Deactivating an app removes it from a workspace navigation/configuration but preserves its stored records.
- A failed application keeps the owner on Review with a retry action and a readable error.

## Survey Flow

### Entry

The first screen explains that Questbase can create a practical starting structure and that every choice can be changed later. It shows:

1. `Guide me` — ask the full survey.
2. `Use a ready-made setup` — choose a blueprint and review it.
3. `Start from scratch` — create only the default Main workspace, activate no optional workspace apps, and create no generated roles.

### Guided Questions

1. **What do you mainly need Questbase to organize?** CRM and sales; Sales through completed jobs; Jobs and project delivery; Internal or custom work.
2. **What kind of company is this?** Roofing; General construction; Home service or trade; Sales or agency; Other or mixed.
3. **How should the work be separated?** One workspace; Sales and Operations; Sales, Estimating, and Production; Custom based on selected teams.
4. **Which teams use Questbase?** Cold calling or lead generation; Sales; Estimating; Production or projects; Field crew or technicians; Finance or office.
5. **Which tools are needed first?** CRM and quotes; Tasks and files; Messages and calendar; Underwriter and price book; Forms and approvals; Finance and reporting; Time clock.

### Ready-Made Setups

- Roofing company
- CRM and sales
- Construction operations
- Home services
- Internal operations
- Quick starter
- Blank

Each blueprint produces answers through the same planning model as guided setup, so there is only one source of truth.

### Review

The Review screen shows:

- workspace names and which one is the default;
- active apps grouped by workspace;
- generated role names and their plain-language purpose;
- pipeline stage names;
- scope labels for company-wide, workspace-specific, and hybrid apps;
- warnings for unavailable entitlements or protected existing data.

The owner can edit workspace names, app selections, role labels, and stage names before applying.

## Generated Structures

### Workspace Layouts

- `one`: Main
- `sales_ops`: Sales, Operations
- `sales_est_prod`: Sales, Estimating, Production
- `custom`: workspaces derived from selected teams, deduplicated and capped at six

The default Main workspace is reused as the first planned workspace and renamed when appropriate. Other workspaces receive stable setup keys stored in the applied plan so later retries update the same records.

### Role Templates

- Cold Caller: CRM view/manage, task view/manage, message view/send, files view
- Sales Representative: CRM view/manage, task view/manage, calendar view/manage, messages view/send, files view
- Estimator: CRM view, underwriter view/manage, price book view, files view/manage, forms view/manage, approvals view
- Production Coordinator: jobs view/manage, tasks view/manage, calendar view/manage/view team, files view/manage, forms view/manage, approvals view/manage
- Field Crew: jobs view, tasks view/manage, files view/manage, forms view/manage, time track, messages view/send
- Office and Finance: finance view/manage, reporting view, approvals view/manage, files view/manage, calendar view

The server owns the allowed permission map. Client-submitted permissions are ignored, preventing the survey from manufacturing elevated roles.

### Pipeline Profiles

- Roofing: Prospect, Qualified, Inspection, Estimate sent, Negotiating, Contracted, Production, Won, Lost
- Sales: Prospect, Contacted, Qualified, Proposal sent, Negotiating, Won, Lost
- Projects: New, Scheduled, In progress, Quality check, Complete, Cancelled
- Home services: New lead, Scheduled, Dispatched, In progress, Follow-up, Complete, Cancelled
- Blank: the existing baseline stages remain dormant and are not rewritten

## Data and Security

`company_setup_profiles` stores one row per company with the latest answers, draft plan, applied plan, status, version, timestamps, reset count, and the profile that last changed it. It is loaded only when the Setup panel is opened, so it does not enlarge normal boot queries.

Authenticated company admins may read their company setup profile through row-level security. Writes happen through two security-definer RPCs with a fixed search path:

- `apply_company_setup(target_company_id text, answers jsonb, plan jsonb) returns jsonb`
- `reset_company_setup(target_company_id text) returns jsonb`

Both RPCs verify that the caller is an active owner/admin/developer for the target company. The apply RPC validates JSON size, keys, counts, plugin IDs, role templates, stage names, and workspace names before making changes in one transaction. The reset RPC changes only the setup-profile row.

An insert trigger guarantees that every new company receives a default Main workspace and baseline stages. The migration safely backfills only companies that currently lack an active default workspace.

## Interface Boundaries

- `company-setup-model.js` is pure. It normalizes answers, expands blueprints, creates a plan, and validates editable client plans.
- `company-setup-panel.js` owns lazy loading, local survey state, rendering, persistence calls, apply/retry/reset actions, and readable errors.
- `company-setup.css` contains only namespaced responsive styles and is dynamically imported with the panel.
- `main.js` adds the Settings tab, the post-company redirect, a small lazy-loader, and action delegation. It does not contain survey business logic.
- The migration owns authorization, idempotency, record-preservation guarantees, and the server-side permission allowlist.

## Reset Experience

Settings > Setup includes `Reset setup answers`. Selecting it opens an inline confirmation that explicitly states what is and is not changed.

Reset clears saved answers, review draft, applied-plan status, and survey completion status, then reopens the entry screen. It does not roll back the last applied structure. The owner can build and apply a new plan, which safely updates survey-managed configuration while preserving business records.

## Verification and Release

- Unit tests cover blueprint expansion, guided branching, role safety, plugin exclusivity, workspace deduplication, validation, and blank setup.
- Migration contract tests cover grants, RLS, fixed search paths, admin checks, default-workspace creation, idempotency, guarded pipeline replacement, and non-destructive reset.
- Static integration tests cover lazy loading, Settings navigation, post-company routing, reset wording, and removal of the company-type question from account creation.
- Full repository checks must pass: `npm.cmd test`, `npm.cmd run ai:check`, `npm.cmd run tenancy:check`, and `npm.cmd run build`.
- The database migration is applied before the frontend deployment because the UI depends on the new table and RPCs.
- Production verification covers creating a synthetic company, opening the survey, applying a setup, refreshing, reopening Settings > Setup, resetting answers, and confirming the company and configured data remain.

