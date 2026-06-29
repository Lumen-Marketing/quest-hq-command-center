# Quest HQ Project Handoff

Last updated: 2026-06-24

## Current Project

The active app is `Lumen Command Center`, deployed as **Quest HQ Operations Command**.

- Repo: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center`
- GitHub: `AsianDoesCodin/quest-hq-command-center`
- Production: https://quest-hq-command-center-gamma.vercel.app
- Framework: vanilla Vite SPA, no React
- Main source: `src/main.js`, `src/styles.css`
- Vercel output: `dist/`
- Documentation: `docs/`

## Non-Negotiables

- Do **not** touch or mutate the original TaskManagement Supabase project.
- Original TaskManagement Supabase project id/reference to avoid: `qqvmcsvdxhgjooirznrj`.
- Quest HQ target Supabase project: `rqundirizvojpzhljtdn`.
- Do not run a local dev server unless Joshua explicitly allows it.
- Deployment flow is GitHub push plus Vercel deploy.
- Supabase Auth is now the default app path. Local demo login only works when `VITE_LOCAL_LOGIN_ENABLED=true`.
- Public onboarding is split into **Business account**, **Worker invite**, and **read-only demo** lanes:
  - Business owners can create a company workspace, but new workspaces start as `pending_review` until Quest approval/billing activation.
  - Workers cannot freely create workplace access; they join through an Owner/Admin invite code or link.
  - One person account can belong to multiple companies through separate memberships and invites.
- The public demo stays visible before signup, but it is read-only and disconnected from production tenant data.
- `info@lumenmarketingusa.com` is the Lumen platform Owner after signup.
- Tenant isolation now has live Supabase migrations for memberships, subscriptions, roles, role permissions, ACLs, field permissions, invites, join requests, and hardened RLS leftovers.
- Billing is Manual approval for launch week. Do not show Stripe checkout as active until Stripe/server env vars are configured.
- Do not claim full paid-production readiness until leaked-password protection is enabled and end-to-end multi-tenant tests pass.

## Product Direction

Quest HQ should become a monday.com-style multi-company operations workspace, not a task-only app.

The active company is the top-level workspace context. Each company should have its own jobs, tasks, users, workers, files, forms, settings, and dashboards. Users assigned to one company should only see that company once real auth/RLS is enabled.

The platform keeps multi-company architecture, but normal single-company users should not see a company dropdown. Multi-company switching appears only when a real account has more than one active company membership.

The desired flow is:

`Login -> Quest HQ Operations Command -> Company Workspace`

TaskManagement should no longer feel like an app inside an app. Its task execution ideas can be reused, but Quest HQ owns the shell, company switching, avatar/profile, users, roles, files, forms, approvals, and settings.

## Current Architecture Direction

- Single Vite SPA.
- Company-scoped routes:
  - `/company/:companyId/jobs`
  - `/company/:companyId/tasks`
  - `/company/:companyId/files`
  - `/company/:companyId/forms`
  - `/company/:companyId/analytics`
  - `/company/:companyId/users`
  - `/company/:companyId/settings`
- Old URLs should keep redirecting into company-scoped routes where possible.
- `/taskmanagement/app.html` may remain only as hidden recovery/debug access, not as the normal product UI.

## UI Direction

The TaskManagement visual system became the base design language, but the final app should feel like a unified Quest HQ workspace.

Important UI expectations:

- No duplicate app shells.
- No iframe-like embedded TaskManagement experience in normal flows.
- No second sidebar inside tasks/files/forms.
- No global `New task` in the topbar.
- Topbar should stay focused on company switcher, search, sync/refresh, and profile/avatar.
- Sidebar should show live modules and grayed planned modules.
- Planned modules should be visible roadmap markers, not functional pages.
- Avoid title-page-style empty screens.
- Use compact headers, tabs, modals, drawers, and file explorer/table surfaces.
- Avoid overcrowding. Move create/edit/detail flows into modals or drawers.

Live modules:

- Jobs
- Tasks
- Files
- Forms
- Analytics
- CRM
- Finance
- Users
- Settings
- My time
- Approvals

Planned gray modules:

- Tickets
- Knowledge Base
- Automations
- Templates
- Team workload
- Team chart
- Clock dashboard

## Files / Company Drive Direction

The Files module should behave more like Windows File Explorer / SFTP / Google Drive, not like a dashboard or card-heavy title page.

Current direction:

- Company Drive is scoped by active `company_id`.
- Users should be able to create folders.
- Files should support folder-like browsing.
- Basic file types should be visually recognizable:
  - folders
  - PDF
  - TXT/text
  - Word
  - Excel/CSV
  - PowerPoint
  - ZIP/archive
  - images
  - generic files
- Opening files should eventually preview common formats:
  - images directly
  - PDFs in-frame
  - text files in-frame
  - Office docs through Office viewer where possible
- Current latest work specifically improved the details/list view icons so folders and file types do not look like beige category blocks.

Recent file explorer commits:

- `9bf064f` Make drive behave like folder explorer
- `1436714` Tighten drive explorer items
- `96602f6` Make drive a details file explorer
- `1ff8fb3` Improve drive explorer icons
- `62e7f79` Improve drive file type icons

## Forms Direction

Forms should feel closer to Google Forms.

Expected direction:

- Forms page should not expose Builder/Templates as permanent top tabs.
- Main page should focus on the form library and responses.
- `New form` should open a modal.
- The new form modal should include:
  - blank builder flow
  - templates as tabs/options inside the modal
- Recent forms should be compact and expandable, not fully expanded by default.
- Form cards should show who created them.
- Avoid crowding the page with always-visible builder controls.

## Jobs / Tasks Direction

Quest HQ is not only task management. Tasks are one module among many.

Expected direction:

- Jobs should have Pipeline/List/Profile tabs.
- Add/Edit Job should use a modal, not a permanent editor tab.
- Tasks should keep `New task` inside the Tasks module only.
- Task create/edit/detail should use modal/drawer patterns.
- Job-scoped tasks should write `project_id = jobs.id`.
- All tasks should carry `company_id`.
- TaskManagement standalone should not be the normal UI.

## Data Model Direction

Long-term tenant model:

- `company_memberships` is the canonical membership table:
  - `company_id`
  - `profile_id`
  - `role`
  - `status`
  - timestamps
- Keep compatibility/backfill fields for now:
  - `profiles.company_ids`
  - `team_members.company_ids`
- Main records should carry `company_id`:
  - jobs
  - tasks
  - files
  - forms
  - users/team members
  - settings
- Files:
  - `company_id` required
  - `job_id` optional
  - job files can live inside job folders
  - shared company files should not need a job

Supabase Auth and RLS are now the intended privacy boundary. The app also has UI guards, but the database policies are the real security layer. Finance still has local/demo records and should not be treated as the real accounting system until moved behind RLS-backed tables.

## Deployment / Verification Flow

Do not use a local dev server by default.

Recommended checks before commit/deploy:

```powershell
node --check src/main.js
npm run build
git diff --check
```

Commit and push:

```powershell
git add -A
git commit -m "Short useful message"
git push
```

Deploy:

```powershell
npx vercel --prod --yes
```

Browser verification should target production or the Vercel deployment URL.

Production QA checklist:

- Reusable checklist file: `docs/qa/production-checklist.md`
- Verify `/login` shows Supabase access and a read-only demo.
- Verify single-company accounts see a static company badge, not a dropdown.
- Verify every enabled module route loads for the active company.
- Verify CRM customer modals and Finance invoice/payment/expense/vendor/report modals open and close without stale query params.
- Verify mobile widths do not show broken horizontal overflow or crowded modal actions.

Useful routes:

- `/login`
- `/company/lumen/files`
- `/company/lumen/forms`
- `/company/lumen/jobs`
- `/company/lumen/tasks`
- `/company/lumen/crm`
- `/company/lumen/finance`
- `/company/roofing/files`
- `/company/drafting/tasks`
- `/crm.html`
- `/finance.html`

## What To Watch For

Common mistakes to avoid:

- Reintroducing big title pages.
- Making Tasks look like the entire app.
- Adding duplicate Quest HQ brand blocks.
- Adding a second sidebar inside a module.
- Adding global `New task`.
- Making Files a card dashboard instead of explorer/file-manager.
- Putting Builder/Templates back as permanent Forms tabs.
- Claiming auth/company isolation is secure while auth is disabled.
- Accidentally using or calling the original TaskManagement Supabase project.

## Current State At Handoff

- CRM is live at `/company/:companyId/crm` and uses existing jobs grouped by customer/client name.
- Finance is live at `/company/:companyId/finance` and uses local/demo-only finance caches while auth/RLS remain basic mode.
- Company switcher dedupes legacy Supabase company ids like `quest-roofing` and `quest-drafting` into canonical `roofing` and `drafting`.
- Production was deployed and aliased to `https://quest-hq-command-center.vercel.app`.
- Live Files route was verified after latest deploy:
  - `/company/lumen/files`
  - title rendered: `Files | Lumen | Quest HQ`
  - folder icons rendered as folder shapes
  - file rows rendered icon plus extension/type label
  - no console/request errors
  - no horizontal overflow

## Near-Term Next Priorities

1. Stabilize current live modules before adding new features:
   - production smoke test all enabled company routes
   - fix broken routing, stale modal query params, mobile overflow, and bad local cache states
   - deploy every meaningful fix to Vercel production
2. Continue polishing Files into a true Explorer/SFTP-like manager:
   - folder open/create flows
   - clearer breadcrumb
   - file preview polish
   - right-click/context menu style actions if useful
3. Polish Forms into a Google Forms-like library:
   - clean library page
   - new form modal with blank/template tabs
   - compact expandable form rows/cards
   - creator metadata
4. Continue decluttering modules:
   - use tabs, modals, drawers
   - keep topbar generic
   - keep module-specific actions inside modules
5. Later, re-enable real Supabase Auth and RLS only after UI foundation is stable.
