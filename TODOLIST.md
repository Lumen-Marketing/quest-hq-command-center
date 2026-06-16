# Quest HQ Engineering TODO

This file is the durable implementation checklist for the auth, permissions, people, team chart, clock, and structure work. Update it after each completed step so work can resume safely after context compaction.

## Foundation

- [x] Create this durable checklist.
- [x] Add a module registry as the source of truth for live/planned modules, sidebar items, valid routes, and legacy redirects.
- [x] Add a centralized role/permission helper (`can(permission, companyId)`) instead of scattering role assumptions.
- [x] Make planned modules consistently planned across sidebar and legacy URLs.

## People And Access

- [ ] Upgrade Users from a read-only list into a basic access surface with roles, approval state, and permission visibility.
  - [x] Add Supabase-backed tenant tables for memberships, roles, role permissions, role assignments, invites, join requests, ACL, field permissions, audit events.
  - [x] Add Settings tabs for billing, roles, access, and workers.
  - [x] Add Users page actions for role assignment, approval/disable, and join request approval/rejection workflow.
  - [x] Add invite-user code/link workflow with invite modal, copy code/link, revoke, and accept path.
  - [ ] Add transactional invite email delivery after Resend/SMTP is configured.
  - [ ] Verify user role changes against Supabase RLS on production.
- [x] Replace the Settings-only worker list with a real Team Chart route.
- [x] Add supervisor/reporting logic to team members without requiring Supabase Auth yet.

## Time And Clock

- [x] Replace task-only My Time with real local time entries and active timer state.
- [x] Add a Clock Dashboard route for active timers, today totals, and team workload.
- [x] Add clock-in/clock-out actions that persist locally in basic mode.

## Notifications And Messages

- [ ] Design and build a persistent notification system after auth/RLS hardening.
  - [x] Record the notification system design in this durable checklist.
  - [ ] Add a topbar bell, compact inbox popover, unread count, mark-all-read, and click-through notification links.
  - [ ] Add local/demo seeded notifications without mixing them into Supabase live workspaces.
  - [ ] Add Supabase notification persistence only after RLS permission tests pass.
  - [ ] Keep toasts separate from notifications; toasts are temporary UI feedback only.
- [ ] Future notification records should be company-scoped and user-targeted.
  - Minimum record fields: `id`, `company_id`, `recipient_profile_id`, `type`, `title`, `body`, `href`, `source_type`, `source_id`, `read_at`, `created_at`.
  - Event sources: task assignment, task status/priority changes, approvals, files/forms, invites/access, finance, subscription/billing, and future messages.
  - Security rule: users can only read/update their own notification rows; admins do not get broad access to private inbox rows unless explicitly redesigned.
- [ ] Build Messages as a future company communication module.
  - [x] Add Messages as a disabled planned sidebar module.
  - [ ] Admins/Owners can create company group chats.
  - [ ] Group chats can target roles, individual users, or all company members.
  - [ ] Messages must be company-scoped and permission-gated with future `messages.view` and `messages.manage` permissions.
  - [ ] Do not add chat storage, live routes, or realtime behavior until the module is explicitly implemented.

## Persistence And Sync

- [ ] Fix seeded local cache semantics so empty arrays stay empty after user deletion.
- [x] Separate local demo data, local user changes, and Supabase live records.
  - [x] Add visible Demo Mode button.
  - [x] Demo Mode is local-only and uses seeded data.
  - [x] Supabase workspaces no longer merge placeholder seed data.
  - [x] Supabase sessions no longer persist live/empty data into demo localStorage caches.
- [ ] Stop destructive local deletes when Supabase delete fails.
- [ ] Keep derived finance/job totals consistent across reloads.

## Module Structure

- [ ] Extract app shell/router/state helpers out of `src/main.js`.
- [ ] Extract shared UI helpers.
- [ ] Extract feature modules one at a time: Jobs, Tasks, Files, Forms, CRM, Finance, Time, Approvals, Users, Settings.

## Verification

- [x] Run `node --check src/main.js`.
- [x] Run `node --check api/create-checkout-session.js` when API files are touched.
- [x] Run `node --check api/stripe-webhook.js` when API files are touched.
- [x] Run `npm run build`.
- [x] Run `npm run build:pages`.
- [x] Run `git diff --check`.
- [x] Commit, push, deploy to Vercel production.
- [x] Verify production routes after deployment.
