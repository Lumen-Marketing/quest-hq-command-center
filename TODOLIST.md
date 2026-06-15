# Quest HQ Engineering TODO

This file is the durable implementation checklist for the auth, permissions, people, team chart, clock, and structure work. Update it after each completed step so work can resume safely after context compaction.

## Foundation

- [x] Create this durable checklist.
- [x] Add a module registry as the source of truth for live/planned modules, sidebar items, valid routes, and legacy redirects.
- [x] Add a centralized role/permission helper (`can(permission, companyId)`) instead of scattering role assumptions.
- [x] Make planned modules consistently planned across sidebar and legacy URLs.

## People And Access

- [ ] Upgrade Users from a read-only list into a basic access surface with roles, approval state, and permission visibility.
- [x] Replace the Settings-only worker list with a real Team Chart route.
- [x] Add supervisor/reporting logic to team members without requiring Supabase Auth yet.

## Time And Clock

- [x] Replace task-only My Time with real local time entries and active timer state.
- [x] Add a Clock Dashboard route for active timers, today totals, and team workload.
- [x] Add clock-in/clock-out actions that persist locally in basic mode.

## Persistence And Sync

- [ ] Fix seeded local cache semantics so empty arrays stay empty after user deletion.
- [ ] Separate local demo data, local user changes, and Supabase live records.
- [ ] Stop destructive local deletes when Supabase delete fails.
- [ ] Keep derived finance/job totals consistent across reloads.

## Module Structure

- [ ] Extract app shell/router/state helpers out of `src/main.js`.
- [ ] Extract shared UI helpers.
- [ ] Extract feature modules one at a time: Jobs, Tasks, Files, Forms, CRM, Finance, Time, Approvals, Users, Settings.

## Verification

- [x] Run `node --check src/main.js`.
- [x] Run `npm run build`.
- [x] Run `npm run build:pages`.
- [x] Run `git diff --check`.
- [x] Commit, push, deploy to Vercel production.
- [x] Verify production routes after deployment.
