# Current state

Captured through 2026-08-10T18:23:17.639Z. This is a point-in-time operational snapshot, not a substitute for live verification.

## Production

- Product: Questbase, formerly Quest HQ Command Center.
- Canonical public domains: https://questbase.io and https://www.questbase.io.
- Stable Vercel URL: https://quest-hq-command-center-gamma.vercel.app.
- Vercel project: `prj_0MxrYyGIo61QgLNW2M74fvTxlMRV`.
- Ready production deployment: `dpl_DYtyBPAMLDsDtkKGV4n8EXTNPrH1`.
- Deployed application revision: `7d430904d7070fc5a9a2f19ea31d025ed1ce956b` from `main`.
- Production smoke passed for the exact revision: 36 of 36 routes and 4 of 4 entry assets.
- Signed-in browser verification passed for the production Job form's local draft lifecycle: an unfinished edit autosaved, reopening offered Restore or Discard, Restore recovered the exact field value, Discard removed the temporary QA draft, no job record was created, and the browser reported no console errors.
- Signed-in browser verification passed for the production Job record-history entry point: History opened against the correct workspace and record, completed its live query, showed the expected empty pre-migration state for an older record, and produced no browser warnings or errors. The verification was read-only.
- Signed-in browser verification passed for the Dashboard account menu and Help & support dialog. The production dialog exposed the in-product guide, bug/problem/suggestion form, 2,000-character limit, enabled submit action, and support-email fallback with no browser-console errors. The verification did not submit a report.
- Signed-in browser verification also passed for the production Tasks route: the same-origin TaskManagement surface loaded as one embedded frame with no browser-console errors. Background realtime refreshes now update host state without rebuilding an already-mounted embedded Tasks frame, so they no longer discard the task user's active scroll, panels, or edit state.
- Production Guardian remains scheduled every six hours and available by manual dispatch.

## Repository health

- GitHub repository: `Lumen-Marketing/quest-hq-command-center`.
- Default branch at capture: `main` at `7d430904d7070fc5a9a2f19ea31d025ed1ce956b`.
- The deployed P0 release-hardening revision passes 764 tests, AI/project-state validation, the production build, and the bundle-budget gate. Its reviewed database migrations are live.
- `npm audit --audit-level=high` reports zero vulnerabilities after the locked PostCSS/Nanoid transitive dependency update.
- CI runs the same check on pushes and pull requests.
- The main application still emits a Vite advisory for a JavaScript chunk over 500 kB; the repository's explicit bundle budget passes.

## Supabase

- Project ref: `rqundirizvojpzhljtdn`.
- Status: `ACTIVE_HEALTHY`.
- Region: `us-west-1`.
- Postgres: `17.6.1.127`, engine 17.
- The metadata-only catalog snapshot was refreshed through the workspace-setup release hardening and contains 89 public tables/views, 229 foreign-key column relationships, 271 policies, 79 public functions, 103 trigger-event entries, 6 storage buckets, and 129 applied migration records.
- Latest repository migration: `20260813150000_workspace_display_order.sql`.
- The latest live provider ledger entry is `20260810182232_workspace_setup_revision_save_fix`. Repository filenames retain reviewed forward-order timestamps while Supabase records provider-generated ledger timestamps.
- Live verification confirmed the workspace-keyed setup table, SELECT-only authenticated table grant, company-admin RLS, and all three fixed-search-path administrator RPCs. A rollback-only test passed draft save, identical retry, manual-app preservation, sibling isolation, and questionnaire reset, then confirmed zero surviving probe rows.
- Live verification confirmed the quote request column and unique partial index, SECURITY INVOKER conversion RPC, authenticated-only execute grant, per-kind operational-workspace seeding logic, and zero missing contacts/deals/jobs pipeline kinds across active workspaces.
- Post-migration advisors reported no ERROR or CRITICAL findings. The operational-workspace RPC retains its previously documented authenticated SECURITY DEFINER warning because it performs its own company-admin authorization with a fixed search path.
- Also applied on 2026-07-30: `202607301200_eod_reports.sql` (EOD reports module) and `202607301300_company_admin_permissions.sql` (company Admins are elevated for feature permissions, matching `is_company_admin`).
- Live verification confirmed the workspace icon column and both validation constraints, the backward-compatible create/update RPC signatures, the atomic set-default RPC, exactly one active default per current company, and zero invalid stored icons. Supabase security and performance advisors returned no findings after the migration.
- Live verification confirmed the `record_history` table, SELECT-only authenticated grant, workspace/permission RLS, all four source triggers, fixed-search-path functions, and the workspace foreign-key index. A rollback-only database smoke test passed created, updated, deleted, and restored capture without leaving test data.
- The `send-company-invite` Edge Function is live and active as version 3. It manually validates the caller JWT, requires an active Owner, Admin, or Developer membership in the invite's company, and sends matching HTML and plain-text invite content.
- The `report-problem` Edge Function is live and active as version 7. It manually validates the caller JWT before accepting a report.
- Both functions use built-in Questbase production origins plus optional configured origins. Live preflight from `https://www.questbase.io` returned an exact matching allow-origin header; an unrelated origin received no allow-origin header.
- Live unauthenticated `send-company-invite` calls return 401.
- A rollback-only production proof accepted an intentionally elevated invite candidate and verified that no elevated membership or role assignment survived, the selected workspace membership was created, and the transaction left no data behind.
- Existing legacy pending invites with no selected workspace fall back to the company's default active workspace.
- Supabase security advisor reported no errors after the migration. Its remaining warnings are primarily existing generic `SECURITY DEFINER` notices; authenticated execution of `accept_company_invite` is intentional and protected by token, email, state, expiry, membership, role, and workspace checks.

Repository migration filenames and Supabase provider ledger versions can differ because some live migrations were applied or reconciled under provider-generated timestamps. Compare intent and live schema before replaying historical files.

## Tenancy and onboarding

The market customer and outer security boundary is a company. Each company owns configurable operational workspaces. Owners, Admins, and Developers inherit access to active workspaces; workers and other members require explicit active workspace memberships and can have a separate role in each workspace.

After an owner creates a company, Questbase creates its default Main workspace and opens that workspace's guided Setup as a required modal. The creation modal has no Cancel, X, backdrop exit, or Escape exit; the owner completes it by applying a setup or using Start from scratch. The owner can answer four short questions, search across more than forty work types, choose a ready-made setup, and review the selected workspace's apps, pipeline stages, and non-elevated role names before applying. Every later operational workspace is created blank and opens the same required survey for itself. Settings > Setup is now a launcher that reopens the same modal with Cancel available. Drafts and reset history follow each workspace across devices. Applying is one retry-safe database operation scoped to the selected workspace. Settings can reset that workspace's questionnaire without deleting or undoing its applied configuration, the company, members, sibling workspaces, customers, jobs, tasks, files, or messages.

The teammate flow now follows one bounded path:

1. A company manager selects a non-elevated role and one or more active workspaces.
2. Questbase creates a pending company invite.
3. The server-side Edge Function derives the recipient, company, role, workspace names, token, subject, and HTML from that invite.
4. The recipient signs in with the invited email and accepts the token.
5. The database creates the company membership, clears stale custom roles, inserts only a verified non-elevated role, and creates the selected workspace memberships.

Invites cannot grant Owner, Admin, or Developer. Existing active members cannot use another invite to change their access. Elevated promotion remains a separate owner-guarded action after onboarding.

Email delivery is observable and recoverable. Invite rows record `not_sent`, `sent`, or `failed`; a delivery failure does not invalidate the token, and managers can retry or copy the link manually.

Invited workers now land on the permission-neutral Dashboard after acceptance. Owners and other workspace managers see a state-derived first-run checklist until they have a workspace, at least one active app, a teammate, a customer, and a task. Completed companies and read-only demo sessions do not receive the checklist.

## Feature state

- Company and operational-workspace separation is production state.
- Guided workspace setup is implemented as one lazy-loaded modal with Guide me, ready-made, a searchable work-type catalog, and a direct Start from scratch path. Company and operational-workspace creation use the non-dismissible form; Settings > Setup launches the cancellable form. Its draft is stored per operational workspace and reset is explicitly non-destructive.
- EOD reports are a native Operations module backed by `public.eod_reports`, gated by the new `eod.view` / `eod.manage` permissions. The page and the admin-only platform master panel are both lazily loaded, which is what kept the entry bundle under its ceiling.
- Workspaces independently activate entitled plugins and preserve workspace identity through CRM, pipeline, underwriting, job, file, proposal, and task records.
- Operational-workspace defaults and uploaded icons now persist in Supabase and survive a reload; rejected writes no longer appear successful in the browser.
- "Search this company" now opens the command search and returns permission-scoped Contacts, Quotes, Jobs, Tasks, and Files across every operational workspace the user may enter, preserving the result's workspace when navigating.
- Pipeline stages are stored and replaced per operational workspace rather than hardcoded globally.
- The P0 candidate reconciles stale company/workspace URLs to an allowed tenant before rendering, rather than letting browser state and the URL disagree.
- Every workspace plugin declares and visibly explains whether its data is workspace-only, company-wide, or mixed.
- The P0 candidate replaces the live Contacts-to-Quotes browser write chain with one workspace-authorized, retry-safe transaction. A separate Create another Quote action intentionally uses a new request id.
- Contact SMS is fail-closed behind provider, tenant, storage, assigned-number, and complete-backend-contract checks. The complete workspace SMS routing contract is not implemented yet, so production remains disabled even if someone partially creates the tables.
- A dedicated, lazy-loaded Help Center now lives at the company-scoped `/help` route. The top-bar `?`, account menu, mobile More sheet, and command search can open it without leaving the active operational workspace. It searches a grounded Questbase guide catalog, supports categories and step-by-step articles, hides module guidance the signed-in role cannot open, and hands unresolved questions to the existing authenticated `report-problem` flow or support email.
- Pilot onboarding rehearsal, support response, and provider handoff procedures are documented under `docs/operations`.
- The compact Quest command rail, Modular Quest landing direction, IBM Plex typography, Technical Ledger underwriter, Contacts lifecycle, Dashboard, Workday, Jobs, Tasks, Messages, Files, Forms, Client Portals, Price Book, Calls, Automations, Analytics, Users, and Workspace App Builder are present.
- The embedded Tasks surface is protected from host-shell replacement during background realtime refreshes. Explicit host renders can still recreate the frame and remain tracked as a narrower follow-up risk.
- Shared CSV parsing now preserves empty columns and supports quoted commas, quotes, and newlines.
- Imported and persisted Workspace App Builder colors are constrained to CSS hex values before reaching style sinks.
- An injectable task write store (src/tasks/task-store.js, src/tasks/task-shape.js) with unit tests exists as the write engine for the flag-on native Tasks surface. It is not yet wired into src/main.js; the default embed surface is unaffected (see ADR-0001).
- Appearance (theme mode, accent, background preset, card styling) follows the signed-in user across devices via `profiles.appearance_prefs` and the `update_own_appearance` RPC. Owners/Admins can additionally save the current look as the company default (`companies.appearance_prefs`, `update_company_appearance`); members without their own saved appearance inherit it, and anyone who sets their own keeps it. A custom uploaded background image is excluded by design and stays browser-local. Both migrations are applied in production.
- Accent-tinted chrome derives from the `--orange` token throughout, so the accent picker recolours hovers, active rows, focus rings, and primary-button hover states. Guarded by tests/accent-theme-static.test.mjs.
- The live release keeps archived, rejected, and Stripe-canceled companies distinct through `terminal_status` while preserving legacy `status='canceled'` for old tabs. Current clients and lifecycle-v2 RPCs display the effective status; old clients remain safely inactive. All terminal states are inactive in normal company selectors and the task module, while the currently open company remains available to prevent stranding. Platform lists expose distinct Archived, Rejected, and Canceled filters with search and 25-per-page navigation. Supabase recorded and verified the migration as `20260730213315_additional_command_center_hardening`.
- Contacts, Jobs, Quotes, and Underwriter forms protect unfinished work with browser-local autosave, explicit Restore or Discard recovery, seven-day expiry, and profile/company/workspace/record scoping. Sensitive credential-like fields and files are excluded, drafts survive failed saves, successful saves clear them, and sign-out purges the departing profile's drafts. This recovery is browser-local by design and does not require a database migration.
- Saved Contacts, Quotes, Jobs, and Tasks now write created, updated, deleted, and restored events to a shared append-only, workspace-scoped history ledger. Contact, Quote, and Job forms expose history on demand; tracked values use a strict business-field allowlist that excludes contact details, addresses, notes, and descriptions. A single safe delete offers immediate same-actor Undo, while the existing 30-day Recycle Bin remains the durable restore path.

- Production > Jobs no longer has a Dashboard tab. Its sub-menu is pinned open and lists only Calendar, and the production figures moved to a "Jobs" card that each owner composes -- available both as a company home-dashboard widget (Add widget > Operations, with a settings cog in Customize layout) and as a workspace tile: Working today, Draws ready, Spent to date, Production health, and either list can be ticked on or off in the tile settings. `JOB_TABS` dropped `dashboard`, so an old `?tab=dashboard` bookmark falls through to the list. The markup lives in `src/jobs/dashboard-view.js` and the tickable part list in `src/jobs/dashboard-model.js`, imported by both settings dialogs so they cannot drift; neither is fetched until a card is drawn. Home-dashboard choices persist per company through the existing widget-config store.

- Plugins are installed per company rather than only by the platform. `set_workspace_plugin` now accepts a platform admin directly (they are not a member of most companies, so `has_workspace_permission` could never be true for them) and lets a company admin self-entitle a plugin that has no `company_plugins` row -- absence means nobody has decided, not no. An explicit `disabled` row is still a wall and reads as "Withheld for your company". `set_company_plugin` now cascades to that company's active workspaces, so the platform panel switch is the thing that takes effect; the panel also reads the company entitlement it writes instead of the workspace status it cannot set. Migration `202608071000_per_company_plugin_install.sql`.

- Chats show who is in them and who is online: the details dialog lists each named member with the same presence ring the message list uses, online first, above a "N of M online" count. It also carries a delete-for-me action backed by `leave_message_conversation`, which removes only the caller own access row -- never the conversation, its messages, or anyone else access. The DELETE policy on `message_conversation_access` requires a manager permission, so without the RPC a member could not leave a chat and a manager leaving would have been able to remove others too. Migration `202608071200_leave_message_conversation.sql`.
- Starting a direct message joins any create already in flight for the same pair, so repeated clicks open one chat instead of creating several. Notes-to-self shares the guard.

- Reading another person profile is decided by shared company membership, not by the legacy `profiles.role` field. `can_view_team()` checked that legacy per-account role, so a company OWNER whose legacy role was still `member` could read no teammate profile at all and the Users page rendered each one as `titleCase(profile_id)`. The policy now allows yourself, anyone you share an ACTIVE company with (via `app_private.shares_active_company`, SECURITY DEFINER so it cannot recurse through company_memberships RLS), and platform admins. This is also tighter than before: a legacy `admin` previously read every approved profile on the platform. Migration `202608071400_profiles_visible_to_company_peers.sql`.
- Contacts import reads CSV, TSV and .xlsx, sniffing comma/semicolon/tab off the header row; the .xlsx reader and JSZip are fetched on demand. Contacts export downloads the filtered list as Excel-safe CSV. The price book import shares the one parser.

- Every company records a main owner in \`companies.primary_owner_profile_id\`, backfilled from the earliest membership (verified as an active owner in all ten live companies) and claimed by a trigger for new companies. Any active owner may still change any other member INCLUDING another owner; nobody in the company may change the main owner role or status, and only a platform admin can. Assigning workspaces to the main owner is still allowed, because the membership itself does not change. \`update_company_member_access\` also stopped writing an audit event when nothing changed, which was one source of the duplicate notifications. Migration \`202608071600_company_primary_owner.sql\`.

- The clock is server state. `persistTimeState()` used to return early for every Supabase session and write nothing at all, so a signed-in person's running timer was never stored anywhere and a refresh -- which reloads state from the server -- cleared it. Running clocks live in `company_active_timers` (primary key `profile_id`, so the database enforces the one-clock-per-person rule `startClock` already followed) and closed shifts in `company_time_entries`. RLS is own-rows-only on both: the Clock dashboard stays personal and was NOT widened into a team view. The vendored task app's `public.time_entries` / `public.active_timers` are deliberately not reused -- they require a `task_id`, key to `team_members` rather than the auth identity, and have no `company_id`; both were empty. `time.track` was also granted to the standard named roles, which had it on two hand-made roles only. Migration `202608081000_company_time_clock.sql`.

- `public.clients` was the one tenant table whose write policy consulted nothing but membership: a single `ALL` policy with `is_company_member(company_id)` on both sides, so any active member could insert, edit and delete the company's client records. Now one policy per verb -- `jobs.view` to read, `jobs.manage` to write. Found by auditing policy expressions in `pg_policies`, not by clicking through the app: every QA pass so far ran as an Owner, who holds every permission by rank, and under that account a membership-only gate is indistinguishable from a correct one. The same audit clears every other tenant table. `notifications` INSERT remains membership-scoped on purpose -- a member may notify another ACTIVE member of the same company and nobody else. Migration `202608081200_clients_write_needs_jobs_manage.sql`.

- Deleting a chat and leaving a chat are separate actions. Both are marks on your own `message_conversation_access` row, never a delete: `cleared_at` removes the chat from the inbox along with everything said before it, and leaves you in the conversation still receiving -- the next message brings the thread back carrying only that message (a chat is hidden only when it has been cleared AND has nothing left to show, so a brand-new empty group is not hidden, and a search by name still finds it). An archived chat can be deleted too, and that one is final: you already left, so no message can arrive to bring it back and it stays out of the search as well; `left_at` stops the conversation at that instant and keeps the rest as a read-only archive under a new **Archived** filter. `app_private.chat_message_visible` bounds the `messages` and `message_attachments` SELECT policies; `app_private.chat_left_at` blocks INSERT on both, so an archive cannot be written to. Attachments are judged on their parent MESSAGE's timestamp, not their own. `leave_message_conversation` kept its name but changed meaning and return type (now `timestamptz`), and `clear_message_conversation` is new; both are SECURITY DEFINER and create the access row when your access came from an `all_company` row, a role, or from having created the chat -- the case the old delete-the-row leave silently did nothing for. Being re-added writes a fresh unmarked row, and `bool_or` over your rows is what restores the full view. Migration `202608081400_chat_clear_and_leave.sql`.

- Settings > Users > Access has **Suspend / Reactivate** and **Remove** alongside the role and status controls. Suspend is the existing `disabled` status, relabelled: the seat and every row stay exactly where they are, `is_company_member()` stops answering, and a suspended person who signs in lands on the no-access screen naming the company that suspended them rather than the "you are not a member yet" copy. Remove (`remove_company_member`, SECURITY DEFINER) deletes the `company_memberships` row, the `user_role_assignments` and the `workspace_memberships` for that company, and NOTHING else -- the profile and every authored row keep their attribution, and the same email can simply be invited again (only one *pending* invite per email per company is unique, so an accepted-then-removed address is free). It refuses the main owner, the last active Owner, an Owner/Developer unless the actor is an Owner, and removing yourself. **The auth account is deliberately not deleted**: a person can hold seats in several companies, and one company removing them must not sign them out of the others or orphan the records above. Suspension is enforced at the data layer, not at the auth provider -- the sign-in call still succeeds, and what is blocked is all access. Migration `202608081600_remove_company_member.sql`.

- Every company starts with **two** roles, not one. `create_company_workspace` seeded Owner (`*`) and stopped, so the first person invited to a new workspace had nothing to be assigned except Owner. `app_private.seed_company_default_roles` now seeds Owner and Member together, with Member's permissions taken verbatim from `ROLE_PRESETS.member` in src/main.js so the two cannot drift. It only grants defaults to a role it CREATED -- an earlier version topped up whatever Member it found and widened one company's hand-made `member` role by seven permissions; those were removed again by the backfill's own timestamp. All ten existing companies were backfilled.
- **`roles.manage` is enforced.** The interface checked it while the policies on `roles` and `role_permissions` checked membership rank, so granting it changed nothing and an admin could edit roles without it. Both policies consult `has_company_permission(company_id, 'roles.manage')` now, which still answers true for owner/admin/developer by rank, so nobody lost access. Two triggers close the escalation that opens: `app_private.guard_wildcard_permission` lets only an Owner grant `*`, and `app_private.guard_system_role` lets only an Owner alter an `is_system` role. Verified live, rolled back: wildcard refused, ordinary grant accepted, Owner role rename refused, ordinary role rename accepted. Migration `202608082000_default_roles_and_roles_manage.sql`.

- Guided setup's generated roles were reviewed and two defects fixed. The **Office and Finance** template granted `reporting.view`, a key this application defines nowhere -- Reporting's two modules gate on `team.view` (Team chart) and `jobs.view` (Analytics) -- so the role advertised as covering reporting could open none of it. Verified before changing: `reporting.view` appeared in zero `role_permissions` rows, so nothing needed backfilling. The templates also moved out of the 680-line `apply_company_setup` body into `app_private.company_setup_role_permissions(role_key)`; burying them inside it is why a wrong key survived. Second, apply refuses a generated role whose name collides with a built-in role and aborts the whole transaction, but named neither the role nor the reason -- and that path went from unreachable to plausible this week, because every company now has a built-in **Member** as well as Owner. The panel now blocks the collision (and a duplicate name between two generated roles, which the server silently *merges*) before Apply is reachable; the server message names the role as a backstop. Migration `202608082400_company_setup_role_fixes.sql`.
- Setup ownership moved from company-wide to operational-workspace-specific. One company can now run unrelated Roofing, Sales, Production, or other workspace setups without one questionnaire rewriting the others. The first Main workspace opens setup after company creation, each later workspace opens its own survey, and neither path installs a hidden generic preset before the owner chooses. Manual apps keep their configuration and are not claimed by setup; a manual CRM conflict blocks with an actionable message instead of activating both variants. Draft, apply, and reset use optimistic revisions so a stale tab cannot overwrite a newer decision. Migrations `20260810173743_workspace_setup_profiles.sql`, `20260811100000_workspace_setup_release_hardening.sql`, and `20260811103000_workspace_setup_revision_save_fix.sql`.
- `team.view` was missing from `PERMISSION_KEYS`, the only list the Roles editor reads. `can()` resolves it from `role_permissions` like any other key, so the permission worked and simply could not be granted by hand -- the one module gate in the product with no checkbox behind it. A test now asserts every `permission:` a module gates on appears in the catalog.

- The per-workspace setup's optimistic locking recovers on the client. `save/apply/reset_workspace_setup` each guard on `revision = expected` and raise `40001`; the panel kept its stale revision on refusal, so one conflict poisoned the surface -- every later call re-sent the same number, was refused identically, and the only escape was reloading the page by hand. A conflicted **draft** now re-reads the row and retries exactly once, transparently, because a draft is the user's own typing with nothing to review. **Apply** and **reset** refresh the revision so the next attempt can work but deliberately never resend: the plan was composed against a picture of the workspace that has since moved, and re-applying it is how somebody else's edit gets undone. Both say so.

- The clock reads as a clock. `formatDuration` stops at minutes, so a timer that had just started showed `0m` and stayed there. A running clock now shows seconds, ticks live in the rail (bottom of the sidebar, only while one is running, linking to the dashboard) and on the Clock dashboard's Today / Last 7 days / Elapsed. One `setInterval` drives every element carrying `data-live-clock`, writing `textContent` only -- re-rendering each second would discard scroll and the keyboard focus of anyone typing. Day totals carry `data-live-base` (the banked closed entries) so the running time is added by the ticker and not counted twice. `metricCard`/`contractRows` still escape by default; `markup()` is an explicit, greppable opt-in for the one value that is genuinely markup.
- Guided setup, second review pass. Every reason `apply` can throw is now surfaced at review instead of by pressing the button: the reserved role name, a duplicate name between two generated roles, and an app that cannot run beside one already installed by hand (derived from the registry's `exclusiveGroup`, so a future exclusive pair is covered without code). `plugin_unavailable` warnings name the app rather than printing `crm_2`. The stage editor says which pipelines its single list is written to -- a sales workspace applies it to both Contacts and Quotes, which was invisible. A pending draft is flushed on `visibilitychange`, so answering the last question and closing the tab no longer loses it inside the 700ms debounce.

## 2026-08-13 QA usability candidate

- Workspace creation now leaves owners in the workspace after **Start from scratch** instead of routing them into Settings. Applying a guided setup immediately refreshes both company and workspace plugin rows, so the installed apps appear together with the generated navigation.
- Jobs now link their client, trade, and current stage to the corresponding record or filtered view. Those CRM links remain company-scoped and permission-scoped. Pipeline stage management supports persisted up/down reordering.
- Job owner selection searches active company users. Estimate and invoice fields accept cents and display currency symbols plus thousands separators. Address lookup biases suggestions toward Vercel's visitor location instead of a fixed alphabetical/Phoenix-first result.
- Roof-specific contact fields appear only for roofing work or when a record already contains roof data. The platform company list marks every approved/active company in green, not only the currently selected company.
- This candidate is client/API-only and adds no database migration.

## 2026-08-13 location pin and workspace order

- An App Builder **location field's pin is now a control**, not decoration. It opens the map dialog the CRM already had — address search, drag-the-pin, and "Use my location" — rather than a second map. Only the address string comes back; a workspace field stores one value, so the coordinates have nowhere to live on it yet.
- That dialog cannot go through `state.modal`: `renderActiveModal` answers to `state.builderModal` first. It opens as a builder modal carrying the record as `returnTo`, and `wbCollectModalDraft()` runs before the swap, so every other field typed into the record survives the trip. Save writes into the record's draft, never to storage — the record's own Save still owns that. Cancel and the shell Close both restore the record.
- **The workspace rail reorders by drag**, company-wide. `workspaces.position` (`20260813150000_workspace_display_order.sql`, applied live) plus `reorder_operational_workspaces(text, uuid[])` — SECURITY DEFINER, fixed search path, company-admin only, and every id must belong to the named company so an admin cannot probe another company's ids. The whole order is sent, not the two rows that moved, so the server never reconciles a partial move.
- Backfilled to **default-first-then-name**, which is what the rail already rendered. Creation order was the obvious choice and was wrong: it would have reshuffled every company whose creation order differs from its display order.
- `position` outranks `is_default` in `workspaceSort`. The default used to be pinned first unconditionally, which would have left one row that refuses to move.
- Both features were paid for against the bundle budget by extracting `src/workspaces/rail-reorder.js` and `src/crm/location-picker-modal.js`. Entry JavaScript stayed under 360,448 gzip bytes.

## 2026-08-14 The activity feed and the tiles scroll separately — and a selector that matched nothing

- Side by side the feed and the tile column are two different lengths, and one scrollbar for both means reaching the end of the tiles by scrolling past the whole feed. The work surface stops being the scrollport and hands its height down, so each column is the same height with a scrollport of its own. Below 900px they stack and the surface takes its scroll back — two nested scrollports inside a page that also scrolls is a trap on a phone.
- **The first version did nothing at all.** The rule was `.work-surface:has(> .wb-dash-split)`, and the page renders as `.work-surface > section.tool-page.wb-page > .wb-dash-split` (`wbViewCompanyHome` is wrapped at main.js:13785). The direct-child combinator skipped the wrapper, so the selector matched no element and every rule under it was dead — while reading as obviously correct. The height has to be passed through `.wb-page` as well.
- **The test passed against the dead rule**, because it looked for the selector *text* in the stylesheet — which was there, since I had written it. A selector checked against itself proves nothing. `tests/workspace-activity-split-scroll.test.mjs` now derives the wrapper from main.js and fails if the CSS uses a chain that skips it; putting the old selector back fails two of its nine tests.
- The browser harness had the same flaw for the same reason: it built a DOM from memory, without the `.wb-page` wrapper, and so confirmed a layout the app never had. It is now asserted against the markup in main.js before it renders anything.
- `overflow-x` defaults to `visible`, which computes to `auto` the moment the other axis scrolls — so giving the panes a vertical scroll handed them a horizontal bar for free. Hidden on that axis, with the content wrapping instead; wrapping needs `min-width: 0` on the flex child or it refuses to go narrower than its longest word.
- **A sheet field was naming records.** It stores its whole grid as one JSON string and `sheet` was missing from the list of types that cannot be a name, so the feed announced `Added {"rows":39,"cols":24,"cells":{…` as the record's title — and that unbroken string was what dragged the column sideways. `button` had the same gap.
- The clock tile is half the side column wide and `10:38:47 PM` at a flat 34px ran out of it. Sized with a clamp on viewport units, not container units: nothing in this stylesheet declares a container, and a `cqw` without one silently measures the viewport.

## 2026-08-14 The Sheet field becomes a spreadsheet

- "Add this basic tool on the sheet field… I want it to inherit the formula, colour, the cell line, text colour, cell colour, and I can also multi-select, insert and delete rows and columns on the specific row or column, format width and height. It is like a working Microsoft Excel file, where I can also export it as an Excel file, or import a spreadsheet file format."
- **A ribbon**, Excel's Home tab cut to what a field-sized sheet needs: font and size, grow/shrink, B/I/U, cell lines, fill and text colour, clear formatting; top/middle/bottom and left/centre/right, wrap, merge & centre; number formats with more/fewer decimals; and Insert / Delete / Size for rows and columns. Ctrl+B/I/U and Ctrl+A work.
- **Multi-select**: drag across cells, shift-click, shift+arrow (which moves the corner away from the anchor, the one Excel drags), click a row or column header for the whole line, drag across headers for several, and the corner box for everything. The selection is a wash with the lead cell outlined — one box round forty cells says nothing about where typing would go. The status bar carries the count and the sum.
- **Insert and delete rewrite every formula on the sheet**, not just the ones on the moved rows. `=SUM(A1:A9)` becomes `=SUM(A2:A10)`; a reference whose row was deleted becomes `#REF!` rather than silently pointing at whatever moved into that cell. Quoted strings and function names are stepped over, so `="A1"` stays text and `MAX(` stays a function. Cells, styles, merges, widths and heights all move together.
- **Column widths and row heights** drag from the line between two headers, or are typed in from the Size menu. The grid is `table-layout: fixed` so the `<colgroup>` decides — with auto layout the content wins and a column dragged narrow springs back open.
- **Import inherits the formatting**: fills, text colour, cell lines, bold/italic/underline, font and size, alignment, wrapping, number formats, merges, widths, heights — read out of `styles.xml`'s indirection (cell → xf → font/fill/border/numFmt). `<color theme="N"/>` is resolved against the default Office palette, because a reader that ignores it imports a coloured workbook as black on white.
- **A formula the engine cannot work out is imported as the value Excel last calculated.** A workbook using VLOOKUP would otherwise come in as a grid of errors; this way the number on screen stays the number that was on screen.
- **Export writes a real .xlsx** on the JSZip already fetched for other imports — SheetJS would have done it in one call for several hundred kilobytes on a field most sessions never open. Distinct styles are collected into tables first, so a sheet where every cell is bold writes one font rather than 8,000. Formulas are written with their cached value, since Excel shows that until it recalculates.
- `sheet-format.js` is pure — ranges, styles, borders, merges, sizes, the formula rewriter — so a leap February and a year-boundary month step are checked without a browser. 24 tests there, 14 on the writer.
- **The editor shipped broken and all 2,973 tests passed.** `menuButton` was a `const` arrow called by `ribbon()` while `overlay.innerHTML` was being built, so it was still in its temporal dead zone: the grid threw the instant it opened. Nothing caught it because nothing CALLED it. `tests/sheet-editor-boots.test.mjs` now constructs the editor under a stub DOM, and putting the bug back fails three of its four tests. The same lesson as every other time this session: run the code.
- Verified in a browser end to end — drag-select, bold on three cells, fill, outer borders boxing the range and not its middle, currency formatting, insert-row with the formulas still adding up, merge and unmerge, header select, a 104→184px drag, delete column, and a write→read round trip that came back with every colour, border, merge, width and height intact.
- 26 new ribbon icons, subsetted from the local Tabler font and aliased into all four alternate packs where each has a true equivalent. Where one does not — Lucide's `rows-2` for "delete rows" says rows, not delete — it keeps its Tabler glyph rather than wearing a confidently wrong one.

## 2026-08-14 A contact card carries their history and their diary

- "Display the recent updates on a record where his contact is used all over the workspace so we can track it… it also has a calendar with the dates where his name is linked, with four views: year, month, week or day." Two panels under Notes on the Company Contacts card.
- **Recent updates** is the workspace activity feed read through one person. `contactUsage` already knows every record naming them; an entry is kept only when its `itemId` is one of those records. Entries naming no record — somebody renamed an app — are dropped: this is a feed about a person, not everything that happened nearby. Newest first, capped at 12, each row linking to the record and labelled with the app, who did it, and how long ago.
- **The calendar** shows fields somebody CHOSE a day in. Created and Last modified are excluded on purpose: a diary full of "this record was edited" is a diary nobody opens, and those already read better in the feed above.
- Four views, one shape — a title, a span and cells — so the grid draws a year the way it draws a day. A **year is twelve month cells**, not 365 squares: a year of squares is a heat map, and the question being asked of it is which months have anything. A **month is 42 cells**, whole weeks, so the grid is rectangular and the neighbouring days are marked `outside` rather than left blank. **Weeks run Monday to Sunday.** Month and year show a count; **week and day show the entries themselves**, since the cells are big enough to read and that is the point of looking at a day.
- `dayKey` is **local, not UTC**. A date field holds a day; reading it in UTC moves it across midnight for half the world, and a calendar that draws the wrong square is worse than no calendar.
- `src/company-contacts/timeline.js` is pure — dates in, cells out, no DOM and no state — so a leap February is checked without a browser. `tests/company-contact-timeline.test.mjs` runs the model rather than matching the source: 18 tests covering the exclusions, the Monday start, the year boundary a naive month step gets wrong, and February in 2026 and 2028.
- Verified rendered, not just green: the fixture's two entries on 20 Aug show as `2` in the month grid, roll up to `3` on August in the year grid, and list as titled rows in both week and day.

## 2026-08-14 Sales Pipeline and Jobs apps, from the reference flow

- **`docs/apps/Sales Pipeline.questapp.json`** — 27 fields, 6 calculated. The Closer's stage of Prospecting → Underwriting → **Sales** → Production, built from `The reference/The flow.jpg`: **Estimate sent → Negotiating → Contract sent → Waiting to sign → Won**, plus **Lost**, which the flow does not draw but a pipeline needs — a dead deal parked in Negotiating for ever makes the board meaningless.
- One deal **per trade per address**, grouped under a **Project**, exactly as the handoff from Prospecting specifies. Named the way the reference card names them — "58th Pl — Roofing" — and the Deal text field comes first so the contact card titles the row by it.
- Carries **Contract price and Cost** from the underwriting sheet so margin is live while the Closer negotiates, and the **draw schedule** (3 draws, their percentages, their amounts, and the total). "Draw schedule must total 100%" is shown, not enforced — the formula grammar has no conditional.
- **`docs/apps/Jobs.questapp.json`** — 32 fields, 5 calculated, 2 sub-item lists. Production: one job per trade arriving from Sales at signature with its draws armed, running **Unscheduled → Scheduled → In progress → Punch list → Complete → Invoiced → Paid / closed**, plus On hold.
- **Dailies and change orders are sub-item lists**, not fields: a job has one budget and many days. The change-order list carries the loop — Raised → Pricing → Sent → Accepted / Rejected — born in Production, priced back in Underwriting, out through Sales.
- No calculation fields inside a sub-item list: `wbCalcRaw` resolves `{Label}` against the APP's fields, not the list's, so a sub-item formula reads the wrong field or zero. There is no way to write a correct one, and the bundle test now rejects any attempt.
- Two things the app file cannot express, stated in its description instead: **"foremen see zero dollars"** is a role/permission setting on the workspace, not something a `.questapp.json` carries; and **"day 9"** on the contact card cannot be derived from the start date, because the formula grammar has no date arithmetic — it is a number the daily report advances.
- **`tests/app-bundles.test.mjs`** now checks EVERY app in `docs/apps` against the rules the importer really applies: unknown field types silently become text, private views are dropped, relationship and rollup targets are not remapped, a category with no options cannot be filled in, and a formula that references another calculation reads 0. The Underwriter test keeps only what is unique to it — that its arithmetic still agrees with `calculateUnderwriting`.

## 2026-08-14 The GAF takeoff calculator

- A second card on the Underwriter page, under the decision panel. Eight GAF report measurements in — Total SQ, rakes, valleys, drip edge, eaves, ridges, low slope, leak barrier — and a priced job out: labor lines, material lines with tax, and the price to the client, with profit and margin.
- **Defaults transcribed from `Underwriting_Calculator.xlsx`** and pinned to the sheet's own numbers in `tests/underwriting-takeoff.test.mjs`: labor 8,600, material 9,202, with tax 9,984.17, cost 18,584.17, client 29,250, profit 10,665.83, margin 36.46%.
- **They are defaults, not rules.** Every line's name, formula, quantity and price is editable, along with the waste and tax percentages, and the result saves as the company's own calculator. A company can keep several — the tile sheet prices nothing like a shingle tear-off.
- The spreadsheet addressed cells (`ROUNDUP(I5/10,0)`), which is meaningless without the grid. Formulas name what they refer to instead: `ROUNDUP({Total SQ + waste} / 10)`. A reference resolves to a measurement, the same measurement after waste, or any line's quantity — which is how `Cap sheet 1sq` stays twice the base sheet.
- **The formula language is parsed, never executed.** It is a text box any member with `underwriter.manage` can edit, so it is a tokenizer and a recursive-descent parser over `+ - * / ( )`, numbers, `{references}` and eight rounding functions. `constructor`, `window` and a stray `;` are all refused, and a broken formula reports against its own line and leaves its neighbours priced.
- `ROUNDUP(528 / 8)` is 66, not 67: 528/8 is 65.99999999999999 in binary floating point, and a naive `Math.ceil` buys an extra box of birdstop on every tile job. Values are nudged to 12 significant digits before rounding.
- **Storage**: `underwriting_calculators` holds the company's templates; the measurements ride on `underwriting_cases.takeoff`, because the calculator prices every roof and each roof has its own report. **Use in the decision** pushes the takeoff's totals into the margin panel above rather than duplicating the arithmetic.

## 2026-08-14 The contact copy never ran, and said nothing

- `loadRelationshipPicker()` resolves to whatever `createRelationshipPicker({ h })` RETURNS, not to the module namespace. `applyPullValues` was a module-level export only, so `mod.applyPullValues` was `undefined`, the call threw, and the `.catch` written to report a failed IMPORT swallowed it. The copy never ran once, in any session — and the console said "Contact copy failed to load", which points at the network rather than at the shape of the object.
- The factory hands `applyPullValues` back now, and the message distinguishes a module that could not load from one that loaded and could not do the job.
- **The test asserted the `.then((mod) => mod.applyPullValues(...))` line matched a regex. It did.** That is the fourth bug in this session that a source-text assertion waved through — after the dead Add-job button, the blank field panel, and the save loop that never terminated. `tests/lazy-module-surface.test.mjs` resolves the loader for real and asserts the object carries every method `main.js` calls on it, including the cached fast path beside the loader. Confirmed it fails when the export is taken back off.
- Diagnosis order that found it, after two wrong guesses: check the deployed bundle (feature present), check the live data (contact had values), run the mapping against the REAL app doc pulled from `workspace_builder_state` (8 correct pairs) — which left only the runtime call, and there it was.

## 2026-08-14 The takeoff card, laid out like the sheet it came from

- Two columns, as the spreadsheet has them: **GAF measurement** and **Labor** down the left, the long **Material** list and **Price to client** down the right. The measurements read as rows — label, figure, unit, waste — rather than as a wrapping grid of cards.
- **The formula is no longer printed on each row.** It is a working, not a fact about the job. It stays as the quantity box's tooltip and on show under Edit formulas.
- **Every quantity is an editable box**, including the ones a formula worked out — the lavender column of the sheet. A greyed-out box on a line the estimator can see is wrong is the calculator arguing with the person using it. The formula fills it, typing replaces it, emptying it hands the line back. An override is marked, and lines that refer to an overridden one follow it: override the base sheet and the cap sheet doubles, as it would on paper.
- Overrides belong to the **job**, not the company's calculator, so they ride with the measurements in `deals.takeoff` / `underwriting_cases.takeoff`. Zero is a real override; empty is not.
- The box keeps whatever was typed while it has the caret — `patchFigures` skips only the active element's VALUE, not its marker — and the formula's answer reappears on leaving an emptied box, rather than being restored mid-edit under somebody who cleared it in order to retype.

## 2026-08-17 The app's four actions moved into the tab row

- **Download app, Delete app, Share app, Save** now sit beside the tabs on the Settings tab, in that order, instead of at three different depths of the form.
- **Save was the reason.** It sat at the foot of the second card, so you renamed the app at the top, scrolled past the icon grid and the tab list, and only then found the button — and anyone who did not scroll that far concluded the rename had not taken. Up there it is on screen the whole time you are editing.
- The same actions, not new ones: the four `data-*` handlers were already bound document-wide for the workspaces section, so this is a move of markup. The body keeps the prose explaining what downloading and sharing DO, reworded to point at where the button now is.
- **Delete keeps its asked-for place but gets 6px of air on each side.** A destructive button flush against two harmless ones is a mis-click waiting to happen.
- **A linked app gets none of them.** Its name, icon and fields belong to the workspace it came from; its one real action, "Remove from this workspace", stays in the body beside its explanation.

## 2026-08-16 The workspace dashboard's stream can be read one half at a time

- A segmented control between the composer and the stream: **Both / Posts / Activity**, with counts on the buttons. Both stays the default — interleaving the two is the dashboard's whole idea — but posts and activity are different reading jobs, and a busy week of record edits buries every post under a hundred log lines.
- **Filtered before the sixty-row trim**, not after. The other order shows whichever handful of posts survived sixty rows of mostly activity, which is the problem one level down rather than a fix for it.
- **The empty state answers what was asked for.** "Nothing here yet" under a filter is wrong twice over: there may be plenty here, and it sends somebody off to write a post when all they had to do was press Both.
- **Sharing while reading only Activity widens the view to Both** rather than filing the post correctly and showing nothing, which reads as Share having failed. Widened rather than switched to Posts, so the ledger they were reading stays on screen.
- Kept in `WB_FEED_VIEW_KEY` and declared in `UI_PREF_SLOTS`, so it follows you to your other devices like the board/table choices. An unrecognised stored value falls back to Both instead of matching nothing.

## 2026-08-16 A button can send a record to Company Contacts

- **The directory is now a destination.** It appears in the button's app picker as "Company Contacts (directory)", alongside the workspace apps, because that is how somebody choosing one thinks of it. Pressing files the record as a contact.
- **It does not grow to fit, and that is the point.** Every other push target gains the columns it was missing. The directory must not: its field list belongs to the COMPANY and is shared by every contact, so one press adding a column would change the shape of the whole business's contacts. `planPush` honours a `fixedFields` flag on the target — unmatched fields land in `skipped` instead of `create`. A record carrying Name, Phone, Email and Location sends the first three; Location stays behind, and the config panel says so before anybody presses anything.
- **Name is a field there.** In storage it is the directory's own column, but to somebody looking at an app and the directory side by side it is a field called Name, and matching by label is the grammar the rest of the push already uses. No Name field on the source means the record's own title becomes the contact's name.
- **Values cross as words, not ids.** A category on a record stores an option id that means nothing in the directory's list, so each value is read the way a person reads it and matched against the contact field's own options — the same path a "change fields on this contact" button takes, which skips a word the field has never heard of rather than minting it.
- **An existing contact of the same name is filled in, not duplicated**, and filling in is additive: a field somebody has already typed into is left alone, because they knew more than a record being forwarded does.
- **No move.** "Send it and remove it" is withheld for this destination: a contact is a person, and the record that named them still has a job to do in the app it lives in.
- `wbContactsTargetApp` in `main.js` shapes the directory; `receiveContactFromApp` on the contacts page does the write. `button-push.js` hands over plain words keyed by contact field id and learns nothing about what a contact stores — the same boundary `contactButtonSeat` holds in the other direction.

## 2026-08-14 The Button field: a second action, its own look, and a searchable palette

- **A second action.** As well as sending the record to another app, a button can **change fields on the record it sits on** — set values, clear chosen fields, or clear every field with one switch. Automatic fields are refused for the same reason they are never pushed: a value written to a calculation vanishes on the next render.
- Where it acts differs by where it is pressed, deliberately: in the **list** there is no form, so it writes the record and saves; on a **form** there is one, so it fills the boxes and leaves them to be saved. Writing behind somebody halfway through typing is the more surprising of the two.
- A category is set by what it SAYS, matched against that field's own options. A word the field has never heard of writes nothing rather than inventing an option a single press would leave behind for ever.
- **Its own look**: text, an icon, or both — and with neither, a blank button, which is a choice rather than a fault. `:empty` gives it a body to hit without the renderer having to label the case. The icon picker is radio inputs, so the browser keeps the choice with no script, and it leads with arrows, a bin, a floppy and the rest of `WB_ACTION_ICONS`.
- **The palette is searchable.** Twenty-eight types is too many to scan — the first thing asked after shipping the Button was where to find it. The box that filters them replaced the sentence explaining how to drag, and the duplicate "Add field" button beside the tabs went with it, which is what paid for the filter.
- **Two budget lessons, both measured.** Collapsing the three repeatable-row handlers into one table-driven loop read better and gzipped **15 bytes worse**: near-identical blocks compress almost to nothing, template literals and a shape table do not. And reading a Button's panel back moved into the module that draws it — a dozen ids and three row kinds are its business, and every session that never opens one was carrying them.
- Deleting a row now reads the rows back off the DOM in all three cases. Collect drops half-filled rows, so the clicked index only lines up with what is on screen; the two newer kinds had the same off-by-one the mappings were fixed for.

## 2026-08-14 The Button field

- A 28th field type: a control on a record that carries it into another **company > workspace > app**, growing that app's field list to fit.
- **Config**: button text; the conditions it is live under (any number, all of which must hold, or none at all — the default is always enabled); the destination; and whether it sends everything or a chosen subset.
- **Conditions read the FORM, not the last save**, so changing a stage lights the button up immediately. A category is compared on its LABEL — somebody writing "enabled when the stage is Won" typed Won, and comparing that against `o1` would never once be true. A half-written rule is ignored rather than locking the button while it is being filled in.
- **The merge**: fields are matched by label, case and spacing ignored. Missing ones are CREATED in the target as clones with fresh ids (ids are per-app), carrying their options but none of the source's copy rules, and `required: false` so a field arriving mid-life cannot invalidate every record already there. Those records keep every value and read blank in the new columns.
- **Never carried**: the button itself and every automatic field — autonumber, created/updated time, calculation, rollup. They hold nothing the record owns. A **relationship** is carried where the target already has one of that name but never created, since it would point at an app that workspace may not see.
- Values are translated on the way: a category travels as its label and lands on the target's own option id, adding the option there when it has never seen it; into a plain text field it arrives as words. A file travels as its reference, so both records point at one stored object rather than duplicating it.
- `src/workspace/button-field.js` is pure — `conditionMet`, `planPush`, `translateValue` — so the config panel can state what pressing it would do before anybody presses anything. `button-push.js` does the writing and is fetched on the first press.
- Paid for by moving the press body out of `main.js` into that module: it first landed **13 bytes over** the budget, passing only on the 64-byte gzip tolerance, which is not spendable. It is 115 under now.

## 2026-08-14 Saving a record with a contact field froze the tab

- Every save of an App Builder record in an app with a **Company Contact field** re-submitted itself for ever. Two things combined: the guard asked `document.querySelector('[data-wb-cc-picker] [data-wb-cc-name]')`, which is true whenever the app HAS such a field rather than when a contact is still to be created; and `createMissingContacts` returns `true` whatever happens, on purpose, so a record whose contact could not be created still saves. `if (made) wbSubmitModal()` therefore always fired.
- Guarded on the pending NAMES now (`wbPendingContactNames()`), re-entered at most once per set of them via `m.contactPass`. It terminates either way: the names are gone on the second pass if the contact was made, and unchanged if it could not be — which saves with the link empty rather than trying again. A different name typed later is a different key, so it gets its own attempt.
- **Every test of this passed throughout**, including one asserting the exact `.then((made) => { if (made) wbSubmitModal(); })` line, with a comment claiming "the second pass finds nothing pending — which is what stops it looping". It never did. `tests/company-contact-save-loop.test.mjs` runs the loop and bounds the passes, and includes a test that the OLD guard does not terminate, so the harness is demonstrably sensitive to the bug it was written for.
- Also corrected in the same pass: reading `company_contacts` without `deleted_at is null` shows recycle-bin rows. It made one contact look like two duplicates and produced a warning to the user that was simply wrong.

## 2026-08-14 A Company Contact field fills the record in

- "When you select an item on it, it fetches all of the data of that contact with the same field to automatically fill other fields on this app." The copy-across the relationship field already did, sourced from the directory instead of another app.
- `contactSourceApp` presents Company Contacts shaped like an app so `matchedFields` can read it unchanged — matching on the LABEL, case and space ignored, and only where the value survives the trip. The contact's **name** is offered as a field called Name: it is the column the directory is built around rather than one of the company's configurable fields, but to somebody looking at both it is simply a field with that name.
- A field only one side has appears in no mapping at all, so it is left untouched rather than blanked, and the picker is never one of its own destinations.
- **On unless turned off**, which is the one way it differs from a relationship. A relationship exists to link two records and copying is an extra thing you might ask of it; a contact picker on a record already says "this record is about that person". The config panel — previously "No extra configuration needed for this field type" — now carries the same switch and manual rows, and names the fields it will copy.
- The picker carries the MAPPING, `[[contactFieldId, appFieldId], …]`, not the directory. Values are read off the contact at the moment it is chosen, so a company with five hundred contacts costs the same markup as one with three.

## 2026-08-14 The copy wrote a label where an option id belonged

- Found while verifying the above in a browser: the Company field showed its placeholder after a contact was picked, so the copy looked like it had failed.
- A category or status is a combobox — it SHOWS a label and STORES an option id in a hidden input beside the visible box. `applyPullValues` wrote straight to `[data-f]`, which put `Acme Roofing` where `p1` belonged and left the visible box empty. The value was wrong **and** it looked like nothing had happened.
- It fills the visible box now and lets the app's own commit resolve it, which also adds the option when this app has never seen that value. **This was live in the relationship copy too** — the combobox replaced a plain `<select>` when category fields gained type-ahead, and the copy was never revisited.
- `applyPull` split into `applyPullValues(from, values)` so both sources share one copy path; three tests in `tests/workspace-relationship-pull.test.mjs` follow the body to its new name rather than being deleted.

## 2026-08-14 Typing in the takeoff card threw the caret out

- "Every time I enter a number it exited my mouse in the edit field." Recalculating replaced the card body's innerHTML, so every keystroke destroyed the input being typed into and built a new one: focus was lost and the number came back selected.
- The card now patches only the figures it derives — the waste column, each line's quantity, price and total, the group totals and the outcome strip — and never touches an input. A full rebuild happens only when the shape changes, adding or removing a line, when nothing is mid-word. Error lines are always present and `hidden` when empty, because adding and removing them was itself a structural change.
- Freed from that, a formula is now repriced on every keystroke instead of waiting for the field to be left.
- **The browser probe that signed the feature off dispatched input events and read the totals — it never checked focus, which is the one thing the user was actually doing.** Verified this time by typing character by character through `execCommand('insertText')` and asserting `document.activeElement` after each: real insertion is also the only way to reach the browser's own value parsing. Programmatic `.value =` is rejected outright for a partial "80." and never sets `validity.badInput`, so it cannot reproduce what typing does.
- `tests/underwriting-takeoff-card.test.mjs` counts writes to the body's innerHTML: a keystroke must cause none, adding a line must cause one. Confirmed it fails against the old code.

## 2026-08-14 The takeoff card on a quote record

- The calculator was first put on the Underwriter tool page. That was the wrong page to stop at: the estimator prices a roof **on the quote**, at the Underwriting stage, where the guidance already asks "Is the takeoff / measurements done?". The same card now renders full width at the bottom of the quote record in `crm/deal-detail.js`.
- **One card, two hosts.** `createTakeoffCard` takes a `scope`, the permission it answers to (`underwriter.manage` on the tool page, `crm.manage` on a quote), and what saving means. The draft in `state.takeoffDraft` is keyed by scope, so opening a second quote does not show the first one's roof, and `takeoffStateForSave` refuses a draft whose scope is not `underwriter` — otherwise pricing a quote and then saving an unrelated decision would file that roof against the contact.
- **Save to this quote** stores the measurements on `deals.takeoff` and sets the quote's Est. Value to the client total, saying so in the toast. A takeoff that prices nothing leaves a hand-typed value alone.
- `main.js` names neither page: whichever module paints the card registers its handler through `setTakeoffHandler`, and one guard over input/change/click dispatches to it.
- The ctx guardrail in `tests/extracted-module-references.test.mjs` read `// comments` inside a destructure as identifiers and demanded `main.js` pass a key called `The`, and treated `key = 'default'` as a required argument. Both are now excluded — a default is a setting the builder supplies, which is exactly how one card serves two pages.

## 2026-08-14 Paying for the takeoff card

- The card cost 301 gzip bytes in the entry bundle against **zero** headroom. It was paid by moving the seven underwriting form helpers — the draft, the number field, the decision copy, the results panel, `syncUnderwritingForm` and `underwritingInputFromForm` — out of `main.js` into `crm/underwriter-page.js`, which is already fetched on demand, and dropping the static import of `underwriting/calculator.js` with them.
- All of it was used on one page and nowhere else, so every session that never opened Underwriter was carrying it. The entry bundle is now **1,104 bytes under** the 360,448 limit, genuinely under rather than inside the 64-byte gzip tolerance.
- `tests/qa-2026-08-07-failures.test.mjs` sliced two of those bodies out of `main.js` by name. It follows them to the module rather than being deleted: the regression is in the code, not in the file it sits in. This is the third time an extraction has broken a test that reads `main.js`.
- `tests/extracted-module-references.test.mjs` gained a third field on `FACTORY_MODULES` for a factory built by another module rather than by `main.js`. The takeoff card takes the underwriter page's own ctx, so its keys still have to be checked against what `main.js` passes — one hop further along.

## 2026-08-14 The relationship config panel went blank

- **A regression I introduced and then fixed.** `pullConfigUI` was added at module scope in `field-config-ui.js` and called `h(...)`, but `h` is destructured from `ctx` INSIDE `renderFieldConfig`. It threw a `ReferenceError`, which took the whole panel down: Workspace, Linked app, Show field, Identify by and Specific record all disappeared at once. Nothing had been removed — nothing rendered. `h` is passed in as the first argument now.
- Every test of that area matched **source text**, which a function that throws passes as happily as one that works, and the browser probe exercised `createFieldInput` rather than `renderFieldConfig`. `tests/workspace-field-config-renders.test.mjs` now CALLS the real function for **every field type** and asserts it returns a string — the guardrail that was missing.
- App tiles in the workspace topbar were 66px, too narrow for "Underwriter", and `word-break: break-word` split it between letters as "Underwrite" over "r". Tiles are 84px and wrap between words only; a name too long for two lines is clamped with an ellipsis rather than cut mid-word. The rule that actually won was a later one at the bottom of the file — the earlier declaration had no effect, which is worth checking before editing anything in this stylesheet.

## 2026-08-14 Two things that looked like dead buttons

- **Add job did nothing.** `renderSearchCombobox` takes `h` as its FIRST argument; job-editor's `ownerField` was not passing it, so `h` was the string `'Account owner'` and calling it threw. The exception escaped while the form was being built, so the modal rendered nothing — `renderJobEditor` only catches a failed *import*, not a failed render. A test now asserts every `renderSearchCombobox` call in that file passes `h` first.
- **Four of the six quote stages were unclickable.** The rail drew `pipelineStages('deals')`, which returns the **CRM 2** set for a company on that plugin (Underwriting → Estimate Sent → Negotiating → Contract Sent → Waiting to Sign → Won), while `resolveDealStage` validated against `dealStageNames()`, which read `DEAL_STAGES` — the **CRM 1** defaults that are what is actually in `pipeline_stages` (Prospect / Qualified / Proposal sent / Negotiation / Verbal commit / Won / Lost). A stage in only one list was written and immediately rewritten to the first stage, so the click looked inert. Won worked because it is in both; Underwriting looked fine only because it was already current, so the click returned early.
- Fixed at the seam: `jobStageNames` / `dealStageNames` / `jobStageColor` / `dealStageColor` now go through `pipelineStages`, which is the only function that knows about the plugin. That also fixed the jobs equivalent, where `setJobStage` hard-rejected any stage outside the global list.
- Routing those helpers through `pipelineStages` broke boot, and `check-bundle-boots` caught it: `const state = {...}` normalises its own seed rows, so `normalizeJob` / `normalizeDeal` reached `pipelineStages → activeCrmPluginId → isPluginInstalled → activeWorkspaceId → state` while `state` was still in its temporal dead zone. A `stageLookupReady` flag, false until the literal finishes, makes the plugin question wait; seed rows use the default lists and every server row is normalised again afterwards. The `= activeCompanyId()` parameter defaults had to go for the same reason — a default is evaluated before the body, so the guard inside could never have run.
- **Budget note:** the entry bundle is currently **15 bytes over 360,448**. `npm run check` passes because `check-bundle-budget` allows a 64-byte cross-environment gzip tolerance — that slack is for CI-vs-local zlib differences, not for features, so this should be paid down before the next change. The clean win is the demo seed data (`*Fallback`, ~25 KB raw, only read in local/demo mode).
- And an unrecognised stage is now **kept rather than rewritten**. Snapping it back to the first stage is what made a click on a stage the rail itself offered look like it had done nothing; a value that survives is visible and recoverable, one that is silently replaced is neither.

## 2026-08-14 The directory's columns are the company's, the card shows everything

- **Name, Active with us, Open balance and Last touch are this view's own** — no field of theirs produces them. Between them sits **one column per field they have not hidden**, in field order. It used to be exactly two, hard-picked as the first text field and the first category, which ignored everything else they had configured.
- **`hidden` is a column setting.** It takes a field out of the table; the card and the form keep it. A card that quietly omitted details would be a card you cannot trust, and hiding a date of birth from a shared table is not the same as hiding it from the record.
- The number under somebody's name is **not** a column, so its lookup no longer filters on `hidden`. Hiding Phone from the table — reasonable, since it already sits under the name — was silently blanking the line under every name too.
- The "a window, not a workbench" note is gone, replaced by a **Back to Company Contacts** button. The note explained the design once; a way out of a long record is wanted every time. The rule it described is asserted in the tests rather than printed on the page.
- The grid is built from the column count and passed in as **custom properties** (`--cc-cols`, `--cc-min`) rather than as `grid-template-columns` directly: an inline value would have beaten the narrow-screen rule that collapses the row. That rule now hides everything except the name, since "everything from the fourth column" stopped meaning anything once the count became dynamic.

## 2026-08-14 Categories you can type into, and contacts that create themselves

- **A category/status field is a type-ahead, not a `<select>`.** Blank until clicked, filters as you type, and a value nobody has used before **joins the list** rather than being refused. The field still STORES an option id — a hidden `[data-f]` input carries it, so every read, write, automation and submit is unchanged; the visible box holds the label, because that is what people type. Different spellings fold together, so "roofing" and "Roofing" do not become two chips, and somebody without `workspaces.manage` can type but cannot mint an option for the whole company.
- The resolution and minting live in `./ui/combobox-menu.js`, which is already fetched the moment a combobox appears — main.js keeps only the two call sites. `createComboboxMenu` now takes a ctx object instead of a bare `h`; the dual signature existed only for its tests, which is the tail wagging the dog.
- **A Company Contact field creates the contact it cannot find.** Type a customer who is not in the directory, press Save, and the record is created with just that name — every other field blank, to be filled in later. Save creates the missing ones, then re-enters `wbSubmitModal`; the form is untouched in between so nothing typed is lost, and the second pass finds nothing pending, which is what stops it looping. An existing contact of the same name is reused rather than duplicated, and a failed write leaves the link empty rather than pointing at something never stored.

## 2026-08-14 A relationship field can copy data across, and its picker tells records apart

- **Copy from the linked record**: a relationship field's config gains a mapping list — pick a field on the linked app, pick a field here, and choosing a record fills it in. The relationship still shows whatever **Show field** says; two separate jobs were being asked of one setting, so they are now two settings.
- **"Copy every field they share"** — a switch on the relationship field. Rather than mapping twelve fields by hand when both apps call them the same thing, picking a linked record fills every field the two apps have **in common by name**. Matched on the label, because that is what "the same field" means to somebody looking at two apps; ids are per-app and would match nothing.
- A match still has to be a value the destination can hold, so their Trade category lands in a Trade text field and their Budget **date** does not land in a Budget **money** field. A hand-written row beats the switch — explicit wins — so a field the two apps name differently is still mapped by hand, and one source per destination means no duplicate writes.
- The panel names what the switch would copy rather than being a black box, and the switch is cleared for a multi-link alongside the rows, since "which one's address?" has no answer there.
- `wbRenderFieldInput` is handed the FIELD, not the app it belongs to, so the owning app is found by looking for the app carrying that field id — which works on the record page as well as in the modal.
- Only fills a **blank** field. Somebody who typed an address and then linked a record did not ask for it to be replaced.
- Compatibility is by value family, not field type (`src/workspace/relationship-pull.js`): Phone → Text works, Date → Money does not, and nothing may be copied into a computed field (`calculation`, `rollup`, `autonumber`, `created_time`, `updated_time`) where the value would vanish on the next render.
- A status/category travels as its **label**, resolved at render time where both apps are in hand; the destination matches its own option by text. An option id means nothing in the other app.
- Offered only for a single link, and cleared when the linked app changes.
- **The picker shows both halves**: `Identify by` names the record, `Show field` sits under it, so two leads for the same person read as "ROMAN JUAN I GAMBOA EUGENIO / demo" and "… / roofing" instead of two identical rows. Search matches either half, and the chosen text keeps the distinction so picking one of two identical names is not the same coin toss one step later. No second line where there is no second thing to say.
- Paid for by extracting `src/workspace/relationship-picker.js` (the type-ahead plus the copy, fetched on the first record form that has a relationship field). `readPullRows` sits in its own `pull-rows.js` because main.js reads the rows synchronously — importing the compatibility table there would drag it into the entry bundle for one small helper.
- Two guardrail fixes fell out of it: `tests/extracted-module-references.test.mjs` never counted the **last** destructured ctx key (no trailing comma), so it was never checked against what main.js passes; and its ">3 ctx keys" floor now applies only to small modules — the rule exists to reject a wrapper invented to move bytes, and a self-contained 4 KB module is not that.

## 2026-08-14 The contact card's In flight rows say where the work has got to

- A row was just the record's title. It now carries the **stage** the owning app gave it (a `status` field, falling back to a `category`), its **duration** where the app has one, its **date fields** — typed ones two at most, plus **Created time** and **Last modified** whenever the app carries those field types, which report the builder's own stamps rather than a stored value — and **when it was last edited** — which is always answerable, because the App Builder stamps `createdAt`/`updatedAt` on every record. Every part is optional: an app with no status field contributes no stage rather than an empty slot.
- A record with no text field read as **"Case -ff7"**. `itemTitle` took the app's first TEXT field, and an Underwriter case has none — its Case #, Contact, Decision and Priced on are all filled and none of them is text — so it fell through to `recordName` plus the id's tail, which names nothing. It now tries text first (a Deals app that leads with Contract value still wants "58th Pl — Roofing"), then the first field carrying anything, in the app's own field order. The card is handed `wbNameValue`, the App Builder's own formatter, so a status reads as its label and a money as its amount rather than as a stored id. The id tail survives only for a record with nothing in it at all, and its leading separator is trimmed — "Case -ff7" read as a typo.
- In flight rows are ordered **newest first**, matching the workspace's own default. The Items table's sort is an in-memory view preference that is never persisted, so there is no "current sort" to read across — but its default is `created_desc`, which is what somebody is comparing against. `sortNewestFirst` mirrors `wbApplyPresetSort`'s `created_desc` including its fallback (a record with no `createdAt` orders by `updatedAt` rather than sinking to epoch zero), and a test lifts that comparator out of main.js and checks the two agree.
- The typed-date cap deliberately does not cover Created and Last modified: they are two facts an app asked for by name, and a shared limit let a third Start/End date evict the one that was requested. A stamp renders as "8m ago" and a typed date as "Aug 20, 2026"; an app with its own Last modified field suppresses the generic "Edited …", which would otherwise say the same thing twice.
- **The row never opened the record.** It linked with `ws` / `app` / `item`, and the router reads `workspace` / `app_id` / `item_id` — so every one of them landed on the workspaces section with no app and no record selected. A test asserted the broken names, which is what kept it invisible. Fixed, and the test now pins the names main.js actually parses.
- The builder keys a workspace as `ws-<operational id>`; `contactUsage` now also returns `workspaceRouteId`, the bare id, and an empty string for a builder-only workspace that has no route — those rows render as plain text instead of a link to nowhere.

## 2026-08-14 Converting a quote to a job, outside the default workspace

- **"Quote conversion failed — Linked account belongs to another workspace."** `convert_deal_to_job` never listed `workspace_id` in its INSERT. The column is NOT NULL with no default, so the BEFORE INSERT trigger `assign_default_workspace` filled it with the company's DEFAULT workspace; the job then carried `account_id`/`contact_id`/`site_id` copied from the quote, which live in the quote's workspace, and the constraint trigger `validate_workspace_record_links` correctly rejected the mismatch. A quote in Main converted fine and a quote in Sales could not convert at all — which is why it read as intermittent.
- Fixed by `20260814100000_convert_deal_to_job_workspace.sql` (applied live): the job takes the **quote's** workspace, not the caller's. Every record it links to belongs to the quote, so that is the only value the link validator can accept.
- `accept_public_proposal` had the same shape and is fixed in the same migration: it inserted its activity with no `workspace_id`, so an accepted proposal was logged into the default workspace where the team that sent it never sees it. It sets no FK links, so the validator never caught it.
- A linked record was labelled with a contact **id** — `cc-00cecde3-1e52-…` — wherever the target app's Show-field was a `company_contact`. `wbNameValue` had cases for user, status, category, money and number but none for `company_contact`, so it fell through to `String(raw).trim()` and printed the primary key; `wbSimpleTitle` had the same hole. `wbPlainVal` already resolved it, which is why search, sort and CSV read correctly and only the label was wrong. Both now resolve the name, and yield **empty** rather than the raw id when the contact is gone, so the caller falls back to the record's own title.
- The empty **Settings → Company Contacts** tab is gone. It was a leftover from the reverted Company Records work; nothing rendered under it, and Company Contacts is a My work page with its own Fields editor.
- **`docs/apps/Underwriter.questapp.json`** rebuilds the Underwriting calculator as an installable App Builder app: 26 fields, 9 of them calculated, verified against `calculateUnderwriting` by `tests/underwriter-app-bundle.test.mjs`. Every formula is **flattened to stored fields**, because `wbCalcRaw` substitutes `Number(values[id] || 0)` and a calculation's value is never written to `values` — so a formula referencing another calculation silently reads 0. Two behaviours the grammar cannot express are recorded in that test: no `Math.max` (max direct cost goes negative past a high target instead of clamping to 0) and no divide-by-zero guard (gross margin renders an em dash at a zero contract price instead of 0), and no conditional at all, so the Decision status is set by hand off the Margin gap.

## 2026-08-14 Company Contacts fields are the customer's

- The contact form was seven fixed columns. It is now a **field list the company owns**: add, rename, retype, reorder, mark required, delete. Migration `20260814060000_company_contact_fields.sql` (applied live, plus a follow-up renaming the value column) creates `company_contact_fields`, adds `company_contacts.field_values` jsonb, seeds every company with the six fields it already had, and copies the existing column data across keyed by the seeded field ids. 84 fields across 14 companies; the one contact with data migrated intact.
- The editor **is** the App Builder's field editor, not a lookalike: `wbFieldBuilderMarkup` gained a `types` filter and a `rowExtra` slot, so Company Contacts renders the same list, the same drag-to-reorder, and the same palette to drag a type in from — with a narrower palette and a config panel under the row instead of a second dialog stacked on the first. Nothing is written until Save; positions are renumbered from the order on screen.
- The **file field is the App Builder's uploader**, markup for markup: click or drop, a progress bar, View / Download / Remove, an optional multiple-files switch, and the upload mirrored into Company Drive. `wbMountFileFields` and `wbMirrorFileToDrive` now take the caller's scope, Drive folder names and empty-state hint off the zone's dataset — without that every contact attachment would have landed under "App / Workspace files / Attached files", because the mirror read `state.builderModal`, which is null outside the App Builder.
- Phone fields carry `data-phone-format`, the handler the rest of the app already used. `type="tel"` validates nothing; the browser accepted letters in it.
- The field config panel has **no type picker**, matching the App Builder: a type is chosen from the palette when the field is added, because changing it afterwards would reinterpret every value already stored under that id. Save moved into the modal header beside Close, and the footer Cancel went — Close already cancels, and a button below a scrolling list is a button nobody finds.
- The directory follows the design mockup: **Name** (with the phone under it), **Company**, **Type**, **Active with us**, **Open balance**, **Last touch**. The Workspace column is gone — "Active with us" already reads across every workspace, which is what that column was for. Every header is whatever the company called that field, so renaming "Company" renames the column.
- `hidden` (`20260814080000_company_contact_field_hidden.sql`, applied live) means what it means in an app: off the directory and the card, still on the form and still stored.
- Wiring it up surfaced a real App Builder bug: `data-wb-field-dropzone="${h(scope)}"` sat inside single quotes, so the scope was emitted literally and dragging a palette type onto an app's own field list added nothing. Dropping onto a row worked, which is why it read as fussy rather than broken. Fixed.
- Types are the App Builder basics — text, long text, number, money, phone, email, location, file, category, yes/no, date — each rendering the control it deserves rather than a labelled text box. The location type keeps the map pin, now keyed to the field rather than to a field named "location", so a company that renames it to "Job site" keeps the map.
- The old `company_contact_options` table is no longer read. A category field carries its options in its own config, which is what lets two category fields hold different vocabularies. The inline ✕ on the suggestion menu still prunes a list, but it now prunes that field's list and patches the DOM instead of re-rendering — a render() there discarded everything typed into the form underneath it.
- Legacy columns (`contact_type`, `organization`, `phone`, `email`, `location`, `notes`) are left in place and still copied, so a rollback is a code change rather than a data recovery. Drop them once this has settled.
- `field_values` is named that because VALUES is a reserved SQL word: every raw-SQL reference would need quoting, and one forgotten pair parses as something else entirely.

## 2026-08-15 Company Contacts gets the App Builder's palette, and a Settings gear

- **"Copy all of the available fields we have in the workspaces app, so I can fully connect the company contacts on the workspace app."** The palette went from 11 types to **26** — the whole App Builder list except three. `CC_PALETTE` is now literally `COMPANY_CONTACT_FIELD_TYPES`, so the palette and the normalizer cannot drift.
- **What is still missing, and why.** `relationship`, `rollup` and `button` each name an APP. An app lives inside one workspace; a contact belongs to the whole company, so "which app" has no answer from here. They are left off rather than offered and rendered as a warning.
- **Fifteen types arrived with no new markup.** The contact form draws them with `wbRenderFieldInput` and configures them with `renderFieldConfig` — the same functions the record form and field dialog use. The bridge is `wbNameContactFieldInputs`: every `[data-f]` input in the contact form is given the `field:<id>` **name** the contacts save path and the recovery draft (`form.elements`) both key off. The file field had done this by hand since Company Contacts shipped; now it is one line for all of them.
- The original eleven keep their own markup deliberately. Their stored shapes predate this — a category holds its **label** here and its option **id** in an app — and rewriting them would be a data migration for no visible gain.
- **Multi-select is the one exception**, drawn here as chips over a single hidden JSON input. A native `<select multiple>` cannot survive a form: FormData keeps only the last value and a restored draft keeps only one option.
- **Derived vs stored.** `created_time`, `updated_time` and `calculation` are never written to `field_values` — they read the contact's own timestamps or are computed on the way out. `autonumber` is the exception: stamped once on the save that creates the contact and carried untouched after, because renumbering somebody a quote already cites is worse than a gap. `wbNextContactAutoNumber` counts the company's contacts, soft-deleted ones included.
- `20260815120000_company_contact_field_types.sql` widens the `company_contact_fields` CHECK constraint to the same 26. **Written but NOT applied** — saving a field of a new type will fail against the live database until it is.
- **A Settings gear replaces the "Fields" button**, opening one dialog with two tabs and one Save. **Fields** is the editor that was already there; **Contact card** is new: which of the three shelves each field sits on (summary line / details / not on the card) and which Category or Status field badges the contact. Both are stored on the field's own `config` (`card`, `badge`) — there is no company-level settings row, and both answers are genuinely about one field. Switching tab banks the panel being left, or a rename typed on one tab is lost by visiting the other.
- `companyContactChipField` now honours `config.badge` and falls back to the first option-list field, so a company that never opens the panel looks exactly as it did. Card placement defaults the same way: long text to Details, everything else to the summary line.
- The card's detail rows now render through the directory's own `fieldCell`, so a rating is stars and a linked contact is a link in both places rather than "4" on one and stars on the other.

## 2026-08-15 The category dropdown stayed open after you picked from it

- **"When I use ABS and click the + use ABS it automatically save to the list of that category and the dropdown will hide since I already selected one."** Two bugs, one click.
- The menu stayed open because the handler called `closeJobTypeMenus(input)` — and that function **exempts** the menu belonging to the input it is passed. It is written for "close the others while I work in this one", which is the opposite of what is wanted once a choice has been made. It now closes every menu.
- The value only joined the list on save. A Company Contacts combobox stores the **label** and carries no `[data-wb-option-input]`, so it never reached `wbCommitOptionChoice`, which is what mints an option immediately for an app's category field — meaning a value you had just invented was still missing when you opened the next contact. `commitContactOptionChoice` now writes it on the click and patches the input's own option list in place, so the menu offers it without a `render()` that would discard the half-filled form underneath.

## 2026-08-16 Underwriting Sheet — guys × days, line items, and a margin tier

- **`docs/apps/Underwriting Sheet.questapp.json`** — 43 fields, 9 calculated, one sub-item list, and the first bundle in the repository to ship a **record layout**. The Estimating stage as a pipeline: **Scope & takeoff → Underwriting sheet → Quote built → Handed to the Closer**, plus On hold and Dropped.
- It is a **third** underwriting app, not a replacement, because the two already here answer different questions. **Underwriter** is the margin decision on a job that is *already priced* — its `Decision` status is Draft / Ready to price / Review the scope / Reprice, an approval state rather than a stage, and its Labor is one typed money field. **Underwriting Calculator** is one specific tile takeoff transcribed from `Underwriting_Calculator.xlsx`, with 26 lines flattened into 78 fixed fields. Neither has the described flow, a crew-based labor model, line items, or margin tiers.
- **Labor is derived, not typed.** `Man-hours = {Crew size} * {Days} * {Hours per day}` and Labor cost multiplies that by the rate — so changing the crew or the days moves every figure beneath it. This is the "guys × days" the field actually talks in, and the one thing the flat `Labor` money field on Underwriter cannot express.
- **Line items are a sub-item list**, not fixed fields — Category, Description, **Vendor**, Quantity, Unit, Unit price, Amount, Vendor quote on file. Vendor pricing sits on the line it prices. This is the shape the Calculator's 78 columns should have had; it costs the per-record total, which is typed (`Line items total`) because a calculation resolves `{Label}` against the app's fields and there is no per-record rollup over a collection.
- **The takeoff is the Sheet field**, laid out once as the eight GAF measurements with a waste column of real formulas (`=B2+B2*D2/100`), so every record starts from the grid rather than a blank one. Asserted against `normalizeSheetFull` so a cell the normalizer would drop or rewrite fails the build.
- **Margin tier is the policy, Target margin % is the arithmetic.** A category cannot drive a formula, so the tier names the deal (Insurance 40 / Standard 35 / Preferred 30 / Volume 25 / Custom) and the number is what `Margin vs target` and `Price at target margin` read. Picking Custom posts a notification that it needs sign-off.
- **Every formula multiplies its inputs out in full** — a calculation referencing another calculation reads 0, the rule this file has recorded twice before. Pinned numerically rather than by eye: 20,000 of line items at 8.6% tax with four guys × three days × eight hours at $45 gives 96 man-hours, $4,320 labor, $26,040 direct, $30,727.20 total at 18% burden, and at a $48,000 quote a live margin of **35.99%**, 0.98 under a 35% tier, against a price at target of **$47,272.62**. Both denominators that can legitimately be zero mid-sheet — no quote price, a 100% target — return `null` and render an em dash rather than a number that looks like an answer.
- **Eight mutations confirmed to fail**, including dropping tax out of direct cost, applying the burden twice, losing the hours from man-hours, and pointing Gross profit at `{Total cost}` instead of multiplying out.
- **A record layout, laid out the way the sheet is worked**: The job → Scope & takeoff → Labor (guys × days) → Materials & vendor pricing → the Line items card → What it costs to do → Price & margin → Handing it to the Closer → Trail → comments. 43 fields in nine groups is the difference between a form you read and a column you scroll. Verified by running the real `remapApp` over the bundle: all 43 arrive placed and live, and the Sub-items card follows the collection's reminted id rather than the bundle's.
- **A hand-off button that pushes rather than moves.** The sheet is Estimating's record of how the job was priced and stays with them; the Closer gets a deal. It ships without a destination, because a bundle cannot name an app id in a workspace it has never seen — pick the Sales Pipeline once after installing.
- **A `set_field` action was written and removed.** Moving to *Handed to the Closer* was going to stamp `Quote sent on`, but the automation runner does `item.values[fieldId] = ac.value` — a raw write — so `"today"` would have landed in a date field as the literal word. The bundle test allows `set_field` on a date and would have passed it; the value is not checked. Two notifications instead, and the date is typed.

## 2026-08-16 Proposals — the document the client signs, above the per-trade deals

- The Sales stage described ("client-facing proposal and securing the contract", Closer, lump sum ~90% or split per scope, draws to 100%, Estimate sent → Negotiating → Contract sent → Waiting to sign → Won) was **already Sales Pipeline**, stage for stage. What it could not express is the **proposal as a document**: `collections: 0`, one deal is one trade, so a lump sum wrapped across three trades had nowhere to live and a partial signing was inferred from which deals went Lost rather than recorded on the thing the client signed.
- **`docs/apps/Proposals.questapp.json`** — 29 fields, 6 calculated, one sub-item list. It sits above the deals rather than replacing them. **Scopes** is the trades it covers — Trade, What it covers, Amount, In the proposal, **Signed**, Status, Job — so a partial signing is a set of ticks on the document, and **Partially won** is a stage of its own. Contract price is the one number the client signs; on a lump sum the scope Amounts are left blank.
- **The Handoff at signature is a checklist**, not prose: contract filed, Signed ticked on each accepted scope, draws armed to 100%, buckets pre-loaded, a job per signed trade, unsigned scopes closed or re-quoted — with a progress bar over it.
- **No hand-off button, on purpose.** One press creates one record, and the handoff fans out to one job *per signed trade*. A single button would file one job carrying the proposal's values and no trade, which reads as working. The checklist carries the step instead.
- **Two limits stated rather than papered over**: the per-record sum of the scope Amounts cannot be derived — a calculation resolves `{Label}` against the app's fields, never a sub-item list, and there is no per-record rollup over a collection — so Contract price is typed. And "must total 100%" is shown by `Draw total %`, not enforced; the grammar has no conditional.

### Two more install traps, found building it

- **`collectionIds` is not remapped.** `remapApp` maps `config.collectionId` and only that, while `record-page.js:206` *prefers* `collectionIds` whenever it is a non-empty array. A bundle shipping the plural — which is what the editor writes — would install a Sub-items card naming the bundle's own ids, rendering empty while looking configured. Bundles ship the singular; the test refuses the plural.
- **A `col:<collectionId>:<fieldId>` dashboard total is wiped on install.** `remapConfig` puts `fieldId` through `fieldIdMap`, which holds no such key, so it becomes `''` and the card silently degrades to a count of records. That figure is only reachable by adding the widget after install. The test refuses it in a bundle.
- Verified by running `wbBuildInstalledApp`: the Scopes list and all seven of its fields get fresh ids, the layout card follows them rather than being dropped by the `!block.config.collectionId` filter, and the sub-item status options survive. **Six mutations of the new checks confirmed to fail.**

## 2026-08-17 The Form field, BUILT: a document builder that writes its own PDF

Shipped. The spec below is now history; this is what exists. 3,579 tests pass, `ai:check` and
`tenancy:check` are green, and the bundle gate passes with 84 bytes of headroom.

### Five files, and why they are five

| File | What it owns | Pure? |
| --- | --- | --- |
| `src/form/doc-model.js` | the page and what sits on it, in **millimetres** | yes, 33 tests |
| `src/form/doc-pdf.js` | writing the PDF file, by hand | yes, 30 tests |
| `src/form/host-values.js` | a record's field as **plain words** | yes, 16 tests |
| `src/form/doc-editor.js` | the modal: drags, inspector, exports | 20 tests, stub DOM |
| `src/form/form-model.js` | kept: named form fields + the `{Label}` calculator | yes, 17 tests |

The split is deliberate. `form-model.js` knows what a field is *worth*; `doc-model.js` knows where
things *sit*. A proposal is a layout whose words happen to come from a record, so the arithmetic
and the geometry have no business in one file. `form-model` is still live — `doc-model` takes
`PAGE_SIZES` and `normalizePage` from it — so its 17 tests still mean something.

### Millimetres, never pixels or percentages

Everything on the page is in mm: an element 20 mm from the top edge is 20 mm from the top of the
printout at any zoom, on any screen. The editor scales mm→px for display, the PDF writer scales
mm→pt, and neither ever writes a pixel back into the document. Percentages would move things when
the page size changed, which is exactly what somebody switching A4 to Letter does not want.

### The PDF is written by hand, and it is a real file

**The earlier note said "print-to-PDF, not a library". That was overtaken, and here is why.** Two
properties of a proposal make a hand-written generator small:

1. **The base fourteen fonts.** Every reader already has Helvetica, so a document asking for it
   embeds no font data — which is where the weight in a PDF library goes. `doc-pdf.js` carries the
   Adobe advance-width tables for Helvetica and Helvetica-Bold (95 numbers each; Oblique is a
   sheared upright and shares its metrics), which is all that is needed to wrap and centre text
   correctly. No `/FontFile` anywhere.
2. **JPEG passes straight through.** A `/DCTDecode` stream *is* the .jpg, byte for byte, so an
   image is embedded by copying it. No encoder, no zlib. The editor converts anything dropped on
   the page — PNG, an icon glyph — to JPEG on a canvas first, which browsers do natively.

Result: **selectable, searchable, copyable text** in a downloadable file, not a screenshot. Verified
by generating a proposal and opening it with `pdfjs-dist` (already a dependency, for reading):
1 page, 595×842 pt, `/Info` title, and the text extracts with the wrapping intact.

**What the tests pin, because a bad PDF fails in ways "it downloaded" cannot see:**
- **every cross-reference offset is read back and checked against the object it names.** A table one
  byte out makes a file some readers open and others refuse. Mutating `at` → `at + 1` is caught.
- the page is the right way up (the classic first PDF bug is one wrong subtraction);
- `/Info` is an *indirect object* — an inline dictionary in the trailer is invalid;
- a Huffman table (`0xC4`, in the middle of the SOFn range) is not mistaken for a frame header;
- a path with nothing to paint emits `n`, so the next element does not inherit it.

**Known limits, stated rather than papered over.** One page — the model holds one page, so a
document that overflows is clipped at the box rather than continuing. Opacity is drawn at full
strength (a transparency group per value is not worth it on white paper). Text outside Latin-1 is
folded to ASCII or `?`, because WinAnsiEncoding is what a non-embedded font can address.

### Email is honest about what a browser cannot do

**No browser lets a web page attach a file to a mail client.** So Email does the two halves it can:
downloads the PDF, then opens a `mailto:` draft prefilled with the subject and addressed to the
record's own email field. The status bar says so: *"… has been downloaded — attach it to the draft
that just opened."* A button that looked like it attached something and did not would be worse.

### The starting document is the Sheet field's trick

The field config is **two things**: a document name, and one button that opens the real builder on
`config.doc` — the *starting document*. A record whose own value is empty opens that instead of a
blank page, so **one layout serves the whole app** and a record that has diverged keeps its own.
Both directions are pinned, and both mutations (never use the template / always use the template)
are caught. This is exactly `sheet`'s starting-sheet arrangement, which is what "its like a sheet
field" asked for.

### Three states, not two: selected, dragging, typing

The first cut of the pointer handling had two bugs that only a person with a mouse would find, and
both are now tests:

- **`contenteditable` left on permanently swallows the pointer**, so a text element could only be
  dragged by its handles, never by its middle — which is how everybody moves things. It goes on
  only while that element is the one being typed into.
- **The first press must select *and* arm the drag.** Requiring a click to select and a second press
  to move is the most irritating thing an editor can ask for.

Also pinned: a press that does not move writes nothing (selecting must not save a document
identical to the stored one); a field element and a shape are never editable, whatever is
double-clicked; an empty text box being typed into shows nothing, not a placeholder to delete.

### A record field on the page reads live, and reads formatted

A `field` element holds `from` — the host field's id — and **stores no copy**, so a proposal laid
out in March shows today's address. Its label comes off the record too, so renaming the field
renames it on the document. `host-values.js` is why the words are right: a stage prints *Won*, not
`o2`; money prints `$42,500.00`, not `42500`; a rating prints `4 / 5` rather than star characters
the PDF has not got a font for. Three renderers — screen, PDF, PNG — all read that one function,
which is the only way they stay in agreement. `placeableFields` is deliberately **wider** than
`form-model`'s importable list: an element on a page is just text, so a rollup or a relationship
prints fine even though a *form field* could not hold one.

### The bundle: paid for by extraction, as instructed

`main.js` gained **six lines** — `wbOpenForm` and one click branch — and everything else is behind
`import('./form/doc-editor.js')`: a 12.9 KB gz chunk nobody who never opens a document pays for.

The gate was 99 bytes over before this started. Paid by moving `wbColorSwatches` and
`wbAppReportOptions` into `builder-modal.js`, which is already a lazy chunk and their only caller.
That is the distinction the ceiling comment insists on and it held: **only a dynamic import reduces
the entry chunk** — a statically imported module is bundled into the same one.

**Headroom is 84 bytes.** The queue behind the gate is unchanged and now one item shorter.

### Opened from a row, and a Save button beside Versions

Two follow-ups asked for the same afternoon:

- **The chip in a table row opens the document**, the same as the Sheet chip beside it. Both render
  through `wbFmtVal`, so the record PAGE got it for free. `data-wb-form-row` + `data-wb-form-ctx`
  carry the field and the seat; `openForRecord` in doc-editor.js finds the record itself, exactly as
  the sheet does, so main.js only gains the branch. A chip with no record behind it (a header, a
  preview) stays an inert span rather than a button that cannot work, and the branch
  `stopPropagation`s -- without it one press would open the document AND the record behind it.
- **A Save button in the header.** One press keeps a version, no prompt: it is pressed mid-edit and
  having to answer a dialog every time is why people stop pressing Save. The name is the date and
  time, which is what they would have typed. The Versions panel keeps its own NAMED save, because
  somebody looking at a list of versions is naming one among many.

**A row edit writes into the record immediately but calls `wbSave` and `render` once, on close.**
`wbSave` is a network round trip per company, and a drag end, a colour and a nudge are each a commit
-- persisting per commit would hammer the backend and repaint the app underneath the open modal. The
document is in memory the moment it changes, so nothing is lost. Closing an unchanged document saves
nothing. All four of those are mutation-tested.

### Paid for again, and three guard tests re-pointed

The row opener put the entry bundle 11 bytes over. Paid by moving the **icon picker** out: the grid
and its loader into `app-settings.js`, and `wbIconLabel` → `iconLabel` into `icon-sets.js`, beside
the names it reads. Both consumers -- the Settings tab and the builder modal -- were already lazy
chunks, and builder-modal already imported from `icon-sets.js`, so that half was free. **Headroom is
182 bytes.**

Three existing tests asserted that code was IN main.js and broke. They were re-pointed, not deleted:
what they guard is still worth guarding (a loader instead of an empty box; a spoken label instead of
`ti-building-store` read aloud), and one now also guards the extraction -- it refuses `wbAppIconGrid`
or `wbIconLabel` reappearing in main.js or in a ctx.

### Two tests exist because this field shipped wrong twice

`tests/form-document-field.test.mjs` and `tests/doc-editor-boots.test.mjs` are shaped by the two
failures, both of which passed every test that existed at the time:

- registered in `WB_FIELD_TYPES` but **not `WB_FIELD_ORDER`**, so the palette never drew it — the
  render tests called the renderers directly and never the palette;
- built as a **label/value form filler** when a document builder was asked for.

So: the palette membership is asserted against the real `WB_FIELD_ORDER`; the click delegation in
`main.js` is asserted, because *a card with a dead button is the same bug as a missing field*; the
old scaffolding's markers (`data-wb-form-row`, `Add a field to the form`) are asserted **absent**,
so a regression to a form filler fails; and the editor is opened and its buttons driven through the
listeners it really registers. **21 mutations of the new code were run and all 21 were caught.**

## Form field: the FINAL spec (supersedes the sections below)

Given 2026-08-17 in full. Where this disagrees with anything below, this wins.

### On the field itself, in the App Builder
Add the **Form** field, give it a **label**, and a **form title**. That is all the field config does
-- everything else is designed in the document builder, not in a settings panel.

### The document builder
Clicking the field's **file icon** on a record opens a modal, laid out like the Quote proposal
reference. Inside it:

- Type a **title** and free **text**.
- Place **fields from the record**.
- Place **images and icons**.
- Place **shapes**.
- **Every element** -- text, field, image, shape -- can be **resized, recoloured and repositioned**.
- Text can be **bold / italic / underlined** and **resized**.

**THE PREVIEW IS THE FORM.** This is the point that breaks the plan written earlier: it is direct,
WYSIWYG editing on the page itself, NOT a settings pane on the left driving a read-only preview on
the right. The proposal builder's split layout is the wrong model for the editing surface -- copy
its modal shell and its saved-versions list, not its settings-pane-drives-preview arrangement.

"Not just a form builder -- a DOCUMENT builder." The output is the artifact.

### Output
- Generate a **PDF or an image**.
- **Download** it, or **email it to the client**.
- **Or upload a PDF** and use that as the document instead of building one. So a form's document has
  two possible origins -- designed here, or supplied -- and the stored shape has to allow both from
  the start rather than being retrofitted.

### What already exists and is still correct
`src/form/form-model.js` -- the field definitions, the two sources (typed here / read LIVE off the
record), and the calculation engine, all tested. The record-side label/value rendering and the
row-based config panel are SCAFFOLDING and will be replaced by the builder above.

### Not built
The modal, the canvas and every element type on it, the styling controls, the saved-versions list,
PDF/image generation, download, email, and PDF upload.

## Form field: the interaction, confirmed

Clarified 2026-08-17 against the Quote proposal modal and the Quick Create > Proposal button:

- **Clicking the Form field on a record OPENS A MODAL.** It is not filled in inline. The field on
  the record is an entry point plus a summary -- what has been made, and a way in -- the same
  relationship the Sheet field has to its editor.
- **The modal is the Quote proposal builder's layout**, which is the reference implementation:
  - a **Saved list** at the top left -- "Reuse, edit, or export past versions" -- so one record can
    hold several documents, each with its own number and draft/final state,
  - **Template** and **Style** pickers,
  - a document number, issued / valid-through dates, and the client block,
  - a **live preview** filling the right-hand two thirds,
  - **Save** and **Close** in the header.
- Beyond the proposal builder: the preview has to be EDITABLE -- place fields, add free text and
  shapes, resize, recolour, change font size -- and export to a PDF or JPG file.

So the build order in the section below still holds, with one correction: step 1's shell is a MODAL
opened from the field, carrying a saved-versions list, not a panel embedded in the record.

## Form field: the target is a DOCUMENT MAKER, not a field list

Corrected 2026-08-17 after the first slice was built the wrong shape. "I want the form to be like
this" -- pointing at the **Quote proposal** modal -- "where I can customize it, add shapes, resize,
change colour, add text, place other fields, add calculation, resize text... a document maker or
PDF generator where I can generate a PDF file."

The slice that exists (label/value rows on the record) is the wrong shape and should be treated as
scaffolding: the model, the two field sources and the calculation engine are all still right, but
the record-side rendering is not the destination.

**Copy the proposal builder's SHELL.** `src/proposals/proposal-builder-modal.js` is the pattern:
a settings pane on the left, a live preview on the right, and Save / Close in the header. Note the
proposals modules are thin (64/62/51 lines) -- `PROPOSAL_TEMPLATES` and the preview renderer live
in main.js and arrive through ctx, which is the wrong side of the bundle line for a new feature and
should NOT be copied.

**What the Form field needs beyond it.** The proposal builder picks a FIXED template and style; this
has to be a free-form canvas: shapes, text boxes with their own size and colour, drag and resize,
and the form's fields placed onto it. That is a small design tool and the single biggest piece --
bigger than everything built for this field so far.

Suggested order, each independently useful:
1. The shell -- settings + live preview + Save / Open in new tab / Print, over the fields already
   definable today. No canvas yet; the preview is the document laid out down the page.
2. The canvas -- absolute-positioned blocks, drag, resize, z-order, colour, font size, shapes,
   free text, and the form's fields as placeable blocks.
3. Export -- print first, then PDF and JPG files. Both viable: the export code is lazily loaded, so
   a PDF library lands in the form's chunk rather than the entry bundle.

## 2026-08-17 The Form field, first working slice

Registered as the 29th field type and usable end to end for design + fill-in. Verified by
rendering both halves, not by reading them.

- `WB_FIELD_TYPES.form` -- "A document you design, fill in and print", `ti-file-text`.
- **Config panel** (`formConfigUI` in field-config-ui.js): document name, page size, landscape, and
  a repeatable row per form field -- name, type, and where the value comes from. The same row shape
  as the button's conditions and mappings.
- **Two sources, which is the point**: `Typed in on the form`, or `From this record: <field>`. Only
  host fields a document can show are offered, and a borrowed one reads the record LIVE.
- **Record side** (`createFieldInput` case `'form'`): the designed document rendered as title +
  label/value rows. Typed fields are inputs; borrowed fields and calculations render as text,
  because writing to either is a value that vanishes on the next render. All answers live in ONE
  JSON string in the hidden `[data-f]` input -- the sheet field's arrangement, so saving,
  automations and exports need to know nothing about forms.
- Verified: 4 rows in the panel, the borrow offered, the formula box appearing only for a
  calculation, and on the record 2 editable fields with `{Qty} * {Rate}` computing 375.
- Field ids are minted once and kept on the row, so an answer stays attached to its field across a
  rename or a reorder.

### Still to build

The fill-in MODAL and fullscreen route (the card is inline today), the layout designer over
`record-layout`'s blocks, and the export. PDF/JPG both confirmed viable: the export code is lazily
loaded, so a PDF library lands in the form's chunk rather than the entry bundle.

### The gate is over again, by ~95 bytes

Registering a field type costs `main.js` inherently: the type entry, the read-back branch, and the
row-add/remove handlers. The earlier extraction bought ~110 bytes and this spent more than that.
Collapsing the two handlers into one writer changed nothing measurable -- the third time that trick
has failed here. The next extraction candidates are listed above; nothing else should go into
`main.js` until one of them is done.

## 2026-08-17 The main.js extraction, and the Form field's model

- **The entry bundle is under its gate again.** `wbProgStopRow` and `wbOptRow` were markup helpers
  living in `main.js` and handed to lazily-fetched panels through ctx, so every session that never
  opened a field editor carried them. `progStopRow` moved into `field-config-ui.js`, its only
  reader. `wbOptRow` had TWO readers -- the App Builder field editor and the Company Contacts one
  -- so it became `src/workspace/option-row.js`, imported by both; since neither panel is in the
  entry chunk, a module they share is not either.
- **The earlier claim that this would not help was wrong.** `field-config-ui.js` is reached through
  `import()`, so it is its own chunk -- moving code into it does leave the entry bundle. Getting
  that right is what made the extraction work at all.
- Three tests asserted `wbOptRow` reaches the contacts page through ctx. Their intent -- "the
  editor is the App Builder one, not a copy of it" -- is unchanged and now enforced more strictly:
  one shared module rather than a helper duplicated per consumer.
- **`npm run check` is green end to end** for the first time in the session: 3412 tests, ai:check,
  tenancy:check, build, bundle budget, bundle boots. Headroom is real but thin -- bank it.

### The Form field: model first, deliberately not the Sheet field

`src/form/form-model.js`, pure and tested without a browser (17 tests). A sheet is a grid of
anonymous cells addressed A1..Z99; a form is a list of NAMED, TYPED fields with a layout of its
own. They share the container pattern -- one JSON value in a hidden `[data-f]` input, a large
modal, modules fetched on demand -- and nothing of the grid. A test asserts the shape carries no
`rows`/`cols`/`cells`/`merges`, so it cannot drift into being a worse spreadsheet.

- **Two sources per field**: `own` (typed here) or `record` (read LIVE off the record the form sits
  on, by host field id). A record-sourced field stores nothing, so it cannot go stale -- asserted.
  `importableFields` matches on TYPE rather than label, because the form's field is already named
  by whoever designed it, and marks the ones already claimed.
- **Calculations** reuse the App Builder's `{Label}` grammar and its refusals: a reference to
  another calculation reads 0 and is REPORTED rather than silently wrong, and the character
  whitelist runs before `Function()` is reached.
- **A mutation run caught a bad test of mine**: deleting the whitelist did not fail anything,
  because `constructor` throws on its own and the try/catch masked it. Now pinned with `0x10` and
  `(8).toFixed(0)` -- valid JavaScript returning a number, so only the whitelist can refuse them.
- **Export: PDF and JPG are both viable, and the reason matters.** The export code is lazily
  loaded, so a PDF library lands in the FORM's chunk, not the entry bundle just cleared. JPG needs
  no dependency (SVG `foreignObject` -> canvas -> `toBlob`). Still to build: the field-definition
  editor, the layout designer over `record-layout`'s blocks, the fill-in modal, the fullscreen
  route, and the export itself. The field type is deliberately NOT yet registered in
  `WB_FIELD_TYPES` -- a type in the palette with no editor renders as nothing.

## Next: the src/main.js extraction, with the groundwork done

The entry bundle sits at ~364662 against 364544 (+64 tolerance). Everything else is green. What
has already been measured, so none of it needs rediscovering:

- **Only a DYNAMIC import wins.** `activity-log.js`, `app-portability.js` and the other statically
  imported workspace modules are already in the entry chunk; moving code into one of them saves
  nothing. The gain comes from a module reached through `import()`, the way `field-config-ui.js`,
  `data-io.js`, `record-panel.js` and `button-push.js` are.
- **A top-level `const` in main.js measured ~100 gzip bytes.** Twice. Prefer hanging state off the
  existing `state` object over adding a module-level binding -- that alone paid for the record-page
  scroll pin.
- **Do not collapse near-identical blocks into a table.** Tried twice now, on the repeatable-row
  handlers and again on the five bulk-select handlers: **21 bytes worse** the second time. Repeated
  literal blocks compress almost to nothing; a shape table does not.
- **Measurements inside ~60 bytes of the ceiling are noise.** The same file failed and passed the
  gate several times this session. Aim for real headroom, not a passing measurement.
- **Candidates, by size** (lines to the next top-level function, so they include intervening
  constants -- treat as a rough ranking):
  `handleAction` @27749 (~2892, a dispatcher -- extract *branches*, not the whole thing),
  `onDocumentSubmit` @30693 (~606), `mountWorkspaceBuilder` @20106 (~571),
  `wbMountModal` @20789 (~371), `onDocumentInput` @34019 (~329), `onDocumentChange` @34402 (~273),
  `wbMountFileFields` @19123 (~150, four call sites all in main.js -- each must be able to await
  the module first, which is the work).
- Two features are already shipped OVER the gate and want paying for: the one-press checkbox flip
  and the record-page scroll pin. Both are small and both are in main.js.

## Queued: what is still behind the entry-bundle gate

The Form field is BUILT -- see the 2026-08-17 entry above. What was written here ("NOT started",
"PDF via the browser’s print-to-PDF, not a library") is superseded: it writes its own PDF.

### The queue behind the entry-bundle gate

Six items now wait on `main.js` having headroom. In priority order once it does: a dedicated
`arrived` automation trigger (arrivals currently reuse `created`); Button pin-first/pin-last
field ordering; and the per-record activity cap. Two more are already
shipped OVER the line and want paying for: the one-press checkbox flip and the record-page
scroll pin.

## 2026-08-17 One press flips a Yes/No, and merged fields land last

- **"I can't toggle the button."** The record's own history had the diagnosis: *Changed Something to bid — no → no*. A Yes/No went through the click-to-edit path, so the press was consumed OPENING an editor that then drew a switch also reading No. Nothing appeared to happen, and clicking away committed the value it already had. Opening the editor on a checkbox now flips it, because that press was the toggle gesture; pressing the switch again before leaving still changes it back. Scoped to `checkbox` — every other type opens untouched, which is what you want before typing over it.
- **A field the push has to CREATE in the target is now appended, not prepended.** The target app's own shape is the one its people know, and an arrival at the top silently reorders the form underneath everybody using it. Arrivals keep the order they had at home, after the fields already there. The same applies to the Contact field minted when pushing from a contact card — which the first mutation run showed was uncovered, so it now has a test.
- One existing assertion encoded the old order (`Name, Age, Address`) and was updated to the new one (`Address, Name, Age`) rather than deleted: it is guarding a deliberate decision either way.

### The entry bundle is over the gate again

- 364614 against 364544 (+64 tolerance) — 6 bytes past, from one line added to `main.js` for the checkbox flip. It has now failed and passed several times this session on the same file: **there is no headroom left and the measurement is inside gzip noise of the ceiling.**
- Everything else is green (3437 tests). The blocker is the one the budget file already names: extract slices of `src/main.js` into lazily-fetched modules. Nothing further should be added to `main.js` before that.

## 2026-08-17 History that survives the move, the import, and the contact it created

- **Activity was lost when a record moved between apps.** Two causes. The transfer **appended** the carried entries, and the log is newest-first truncated from the TAIL -- so a record's oldest history landed exactly where deletion starts. And the cap was **60 for the whole workspace**, which three apps sharing one workspace pass in a morning. Merged by timestamp now, and the store keeps 400. 60 was never a display limit: `wbFeedStream` sorts and slices its own 60, so the store was capped far tighter than any reader needed.
- **The right rule is per RECORD, not per workspace** -- so a busy app can never cost a quiet record its past. Written, measured, and **reverted**: it cost ~140 gzip bytes in the entry bundle, and the budget note says the next growth must be paid for by extraction rather than another bump. The wider flat cap is the same fix one number looser, and free. The per-record version is the follow-up.
- **Creating a contact is now an event on the record.** A text field converted to a Company Contact filed somebody in the directory and said nothing; the card simply appeared. The arriving record now reads "*Roman* was added to **Company Contacts** and linked as **contacts**", then the move -- logged before the arrival so it lands in the order it happened. Says "was already in" when an existing contact is reused rather than claiming a new one.
- **Imported records say where they came from.** The import logged one workspace-level line -- "Imported 11 items into 1" -- with no `itemId`, which means `recordFeed` showed it on **none** of the rows it described: every imported record read "Nothing yet". Each row now carries `Imported from <file>`, and the summary line names the file too.
- **The contact card can title a row by a Company Contact field.** It was excluded from the picker outright on the grounds that it would print the name of the person whose card you are on -- true only of the field pointing back at THEM, which `itemTitle` already drops because, unlike the picker, it can see the value. A second one (Site contact, Referred by) names somebody else and is the most useful thing on the row, so automatic now prefers it over the first text field.

### The entry bundle is on the ceiling

- Two builds this session failed the gate at 364613-364681 against 364544 (+64 tolerance), and the same `main.js` passes on others: it is **oscillating on gzip noise**, which means there is no real headroom left.
- Reclaiming it by collapsing the five bulk-select handlers into a lookup table measured **21 bytes worse** -- the lesson this file already records from the repeatable-row handlers: near-identical blocks compress almost to nothing, a shape table does not. Reverted.
- The budget file's own note is the instruction: raising the ceiling again is blocked, and the durable fix is extracting slices of `src/main.js` into lazily-fetched modules. Nothing further should be added to `main.js` until that is done.

## 2026-08-17 `await wbSave()` never waited, so a send took two or three presses

- "My setup was send to another app then save to Company Contacts, but it just saves to contacts, not sends to the app. It takes me 2-3 clicks before it appears."
- Not the fan-out: driven in isolation, app-then-contacts and contacts-then-app both land on the first press. The fault was one layer down. **`wbSave` was not async and returned nothing** — it started each `saveWorkspaceBuilderDoc` and dropped the promise on the floor with a `.catch`. So the four callers written as `await wbSave(...)` awaited `undefined` and carried straight on while the write was still in the air.
- The consequence matches the symptom exactly: a record pushed into an app, then a realtime refresh arriving before the write committed, reloads the doc from the server **without** it. Press again and the timing sometimes wins. `saveWorkspaceBuilderDoc` guards on a revision and retries on collision, which is why repeated presses eventually stick.
- The worse consequence is the one nobody had noticed: the MOVE's whole safety is the ordering — "the record is removed from here only after the target is saved, so a failure to write there cannot lose it from both". **That was never true.** The removal raced the write.
- `wbSave` now returns `Promise.all(...)` over its writes. Non-awaiting callers (64 of the 68) are unaffected — they ignored `undefined` and ignore this — and the per-write `.catch` stays so an ignored return can never surface as an unhandled rejection. The two remaining un-awaited calls in the push are now awaited too, including the one that persists the REMOVAL half of a move.
- Awaiting inside `applySet` meant making it async, which it was not — and `await` in a non-async function is a **syntax error that made the whole module un-importable**. The test written for this change reads `main.js` as text and passed anyway; the three push tests that actually import the module caught it. Confirmed by putting the error back: `button-to-contacts` fails, the text-based one does not. Reading source is not running it, again.

## 2026-08-17 The field mapping shipped broken — the row deleted itself as you filled it in

- Picking a field in the left select did nothing: the right one stayed on "Pick a field here first" for ever, so the control could never be completed.
- The left select carries `data-wb-rel-refresh`, so **choosing a field collects the panel and re-renders it from what was collected**. The readback filtered `row.from && row.to`, which threw away the half just chosen — the row came back blank, and the right select, which only fills once the left one resolves, never woke up. Every keystroke of progress deleted itself.
- `pull-rows.js` already had the answer, and the comment naming this exact trap: *"`keepPartial` is for a panel that is still open: a row is half-chosen for as long as it takes to choose the other half, and deleting it there would take the row away from the person filling it in."* The relationship copy has used `readPullRows(..., { keepPartial: true })` since it was written. The button's mapping hand-rolled its own readback and reinvented the bug the helper exists to prevent.
- Now reuses `readPullRows`, which also enforces one source per destination — a rule `planPush` was separately checking, so that is one rule in one place again. The extra-destination rows keep every row for the same reason: their company select re-renders too, and a row that vanished when touched could never be filled in.
- **The unit tests all passed while the feature was unusable.** They called `planPush` with a config object assembled in the test, which is the state AFTER a row is complete — the failure lived entirely in the round trip between the DOM and the draft, which nothing exercised. `tests/button-map-halfrow.test.mjs` drives the real sequence — render, choose, collect, render — and asserts the right select is no longer disabled. Both mutations (restoring the filter, and `keepPartial: false`) fail it.
- Fifth time this session that a feature was green in tests and broken in the browser, and the second where the fix was already written elsewhere in the codebase.

## 2026-08-17 Move into the directory is allowed again, and actually moves

- **"Why did you remove the mode option in the button action?"** It was not removed. Rendering the panel shows `push, move, set, link` for an app destination and `push, set, link` for **Company Contacts** — move was withheld only there, by a rule that predates this session (`allowMove = ... && !toContacts`). What changed two days ago was that the withholding became *visible*: a notice was added explaining the action had been rewritten to a copy, which is when it read as having been taken away.
- The original reasoning — a contact cannot be "moved" INTO the directory, because the directory holds the person while the record that named them still has a job where it is — is a fair default and a bad rule. **An intake app whose rows ARE people** has nothing left to do with the row once the person is filed, and forcing a copy left it sitting there to be deleted by hand.
- Move is now offered for the directory and **honoured**: `pushToContacts` removes the source record, logs it on the workspace rather than against the record (which no longer exists there), saves, and closes a form left open on it. Ordered **after** the contact is saved, never before — the same rule the app-to-app move follows, so a failure to file cannot lose the record from both places.
- The panel says what it will do rather than leaving it to be discovered, and the toast names it: "added to Company Contacts with 2 fields **and removed from this app**".
- The test that asserted move was withheld is flipped rather than deleted: the behaviour it guarded was a deliberate decision, and it is now guarding the opposite decision plus the ordering. Three mutations confirmed to fail — and **two more first reported as passing turned out to be mis-aimed**: `sourceApp.items = sourceApp.items.filter(...)` appears in both the app-to-app move and this one, and `replace(..., 1)` hit the first. Re-run scoped to `pushToContacts`, all three fail as they should.

## 2026-08-17 Naming the destination field, and sending to several apps at once

- **"Where is it? I want to set a specific field to copy or move the data to another field."** It did not exist. The "What to send" switch picked *which* fields travel; the destination was always the field with the same label, so two apps calling one thing by different names — Full name here, Client name there — could not be joined up at all short of renaming a field. The relationship field had the control; the button did not.
- **`config.map` is a list of `{ from, to }` field ids**, drawn as the same from → to rows the relationship copy uses. A row **beats the label match** for that field, and the destination list is narrowed by the same type rule the push applies, so an impossible pairing is never offered rather than offered and refused. Ids on both sides, so renaming either afterwards keeps the mapping — the opposite trade-off to the label match, and the right one for a pair somebody chose deliberately.
- Two ordering traps closed: a destination an explicit row claims is **worked out before the loop**, so a field that merely shares its name cannot reach it first by sitting higher in the list — otherwise which won depended on the order somebody dragged them. And **two sources aimed at one destination** is reported rather than silently last-wins, which would have looked like the first field never travelled. Changing the destination app clears the mappings, because they named ids on both sides.
- **`config.also` sends one record to several apps.** The extras go **first** and always as **copies**; the main destination goes last, because that is the one that may be a MOVE and a move deletes the record from here. Running it first would leave nothing to copy.
- **A failed extra stops the move.** Half a fan-out plus a deletion is the one outcome with no way back — the record gone from here and in only some of the places it was meant to reach. A thrown save counts as a refusal: the throw already unwound past the move, but only by accident, and catching it makes the guarantee the code's rather than the call order's.
- Duplicates are folded, the main destination repeated as an extra is ignored, and the source app is refused as a destination for the reason the picker never offers it — a record filed into the app it already lives in is a loop.
- The extras match on field names only; the mapping belongs to the main destination, whose field ids mean nothing in another app. The panel says so rather than leaving it to be discovered.
- 20 new tests across `button-push-types` and `button-push-multi`, the second pressing through `createButtonPush` against three real target apps. **Nine mutations confirmed to fail** — including sending the extras after the main destination, sending them with the button's own action, and letting a namesake steal a mapped destination. Two more "misses" on the first mutation run turned out to be mutation strings that never applied, which is why the runner now refuses to report a result it did not actually produce.

## 2026-08-17 The Button push learns types, and text can become a contact

- "Prospects has Name (text) and Age (number); Leads has Name (Company Contact) and Age (number). Sending should convert the text to a Company Contact, save it to Company Contacts, and carry Phone, Location and Email too — and string to int is prohibited while int to string is allowed."
- **The push ignored types entirely.** It matched on the label and carried the value whatever the two fields were, so "Age" as text landed in "Age" as a number and the target read `NaN`. It now asks `canPull` — **the rule the user described already existed**, as the relationship copy's `ACCEPTS` table: anything reads fine as text, only a number may land in a number. Reused rather than copied, so the two cannot drift, and a test asserts the push agrees with `canPull` across every type pair except the one addition below.
- A label match that cannot convert is now reported in **`plan.skipped` with the reason in words** — "Age is a number there and text here — text cannot become a number" — which the config panel already prints, so it is visible before anybody presses rather than after.
- **Text arriving at a Company Contact field is FILED, not written.** That field stores an id; writing the words would render as a broken chip. The person is put in the company directory first and the field is given their id. `CONTACT_MINT_FROM` limits it to the text family: `Age → Contact` is somebody having named two unrelated fields the same thing, not an instruction to create a person called 42.
- **The contact is built from the whole record, not from that one field**, which is what carries Phone, Email and Location across — the directory is matched by label with the same rules, and `fixedFields` stops it growing columns the whole company shares. An existing contact of that name is **reused, never duplicated**, and only their blank fields are filled: a button press is not permission to overwrite the company's record of a person.
- **`canPull` itself was deliberately NOT widened.** The relationship copy uses it and has no way to create anything, so allowing text there would write a name where an id belongs — the exact bug the option copy had on 2026-08-14. The mint is the push's own rule, because minting is the one thing a push can do that a copy cannot.
- One builder now serves both ways a record becomes a contact — a button pointed straight at the directory, and this conversion — so they cannot disagree about which fields travel. Refactoring that path left two references to a local that no longer existed; **the existing tests caught all four**, which is the first time in this file's history that a refactor was caught by the suite rather than by a user.
- A contact that cannot be filed (no permission, a failed write) reports and **the record still goes**: losing the link is bad, but a move that stopped there would leave the record nowhere at all.
- 22 new tests across `button-push-types` and `button-push-contact-mint`, the second pressing the button for real through `createButtonPush`. **Nine mutations confirmed to fail**, including writing the contact pair as raw text, never writing the id back, minting from a number, and widening the shared copy rule.

## 2026-08-16 Picking several contacts at once, and two record-layout bugs

- **Company Contacts gained a Select mode.** A **Select** button turns on a tick-box column; **Delete _n_** and **Clear selection** appear beside a live count once anything is ticked; **Cancel** leaves and forgets the ticks. Off by default — a directory is read far more often than pruned, and a checkbox on every row all the time makes the common case noisier for the rare one.
- While picking, **a row picks rather than opening**. Leaving it opening the contact would mean the same click on the same pixel does two different things depending on a mode invisible from the row, and every mis-click costs a page load.
- The header box selects **what is on screen**, so it respects the search and the type chip. A contact ticked and then filtered away keeps its tick rather than being silently dropped by a box that says "all".
- **The delete asks first, and counts how many of the selected are still named by records** — deleting a contact a record points at leaves that record showing a broken chip, and in a bulk delete nobody is looking at the cards one at a time to notice. It is the same soft delete (`deleted_at`) the single delete does, minus the navigation, which only made sense when you were looking at the card of the contact you just removed.
- **A partial failure keeps its rows ticked.** Every row is attempted rather than aborting on the first error, the ones that worked are removed, and the toast says "2 deleted, 1 could not be" with the failure still selected so a retry is one press.
- The tick-box column is added to the **shared track list**, so the head and the rows stay aligned. A cell added to the rows alone shunts every value one column left of its heading — markup that is individually correct and collectively wrong, which is why the test renders both and compares the counts. **Ten mutations confirmed to fail**, including that one, a hard delete, a dropped permission check and a missing confirmation.

### Resizing a record-layout card turned it into a field group

- `resizeBlock` is `resizeWidget` re-exported from the dashboard, and that function re-normalized through `normalizeWidget` — which only knows widget types. A block type it had never heard of became `'metric'`; `normalizeBlock` then read `'metric'` as unknown and rewrote it again to `'fields'`. **Comments, Details and Sub-items were all destroyed by a width click**; `note` survived because it is the one name in both tables, and `fields` survived by luck by round-tripping through the two fallbacks. Sub-items losing its list would have hit the Scopes and Line items cards on the apps added today.
- `record-layout.js` already claimed these four shared functions "only ever touch `id` and `size`". Three did. `resizeWidget` now does too — it clamps the size and copies the rest, consulting no type table. A non-number leaves the card as it was rather than snapping it to a default width belonging to a table it must not read.

### A draggable card swallowed every click inside it

- In layout-editing mode the whole card carries `draggable="true"`, so a press anywhere in it was a drag waiting to begin — and the browser eats the click the instant the pointer moves a pixel. On the record page every field value is also a click-to-edit control, so reordering and editing were competing for one gesture and reordering won: opening a Yes/No switch and actually flipping it was a coin toss, which reads as the toggle being dead.
- The drag now arms only while the pointer is down on the **grip**. Both grids already drew one captioned "Drag to reorder" with `cursor: grab`, so this is the behaviour the interface was already promising. Every press re-decides, so the flag cannot stick on.

### A note on line endings

- `core.autocrlf` is `true` here, and editing `src/main.js` rewrote all 47,000 lines as CRLF. Git's EOL filter does not normalize that file (it does normalize its neighbours), so the change surfaced as a whole-file diff and broke `sidebar-navigation-static.test.mjs`, whose regex spans a newline. **134 of the 247 source-reading tests do not normalize CRLF**, so any of them with a multi-line pattern is fragile on a Windows checkout. `main.js` was put back to LF; the wider fragility is untouched and worth a sweep.

## 2026-08-16 The directory was in the destination list all along, and unfindable

- "Add a choice here where I can send it to company contacts" — asked with the Button field's **company** dropdown open. The choice already existed, one control further down, and the report is still correct: a feature nobody can find is not shipped.
- **The placeholder was the whole bug.** The second select read **"— Select an app —"**, and Company Contacts is a directory rather than an app, so the one list holding it described itself as excluding it. Somebody hunting for a company-wide directory then reasonably tries the company dropdown, which lists companies. Now **"— Select a destination —"**, with the options under **Apps** and **Company-wide** optgroups so the directory is visibly a second kind of destination, and the label carries *(an app, or the company directory)*.
- The directory is **not** added to the company dropdown, which would be the literal request. `cc-<companyId>` is per company: that select answers *whose*, the destination select answers *what*. Putting it in the first one asks "which company's contacts?" twice and breaks the two-step.
- **The silent action rewrite is now spoken.** Picking the directory while the action is "Send it and remove it from this app" rewrites it to a copy (`action = rawAction === 'move' && toContacts ? 'push' : rawAction`) and drops move from the dropdown — correct, because the directory holds the person while the record that named them still has a job where it is, but previously the dropdown just quietly read something else. It says so when it happens, and only then.
- **The test that let this through greped for the label.** `assert.match(src, /Company Contacts \(directory\)/)` passed the whole time — the string was in the file, in a select that presented it as not belonging. A source-text assertion cannot see which control a label lands in. Replaced with five tests that call `renderFieldConfig` and read the rendered `<select>`: the directory is an option of `wbBtnApp`, the placeholder does not say "app", it follows the company picker, it comes back selected, a button on a contact card is not offered it, and move is withheld with the notice shown. **Six mutations confirmed to fail**, including putting the old placeholder back. This is the fifth source-text assertion in this file's history to wave a defect through.

## 2026-08-16 Prospects, Leads and Nurturing — the three apps before the pipeline

- "Prospect: drip working him, no money attached. Lead: the prospect progresses into a lead once they have got something to bid. Nurturing: warm, not ready yet." Three `.questapp.json` bundles filling the Prospecting stage that sits in front of the existing Sales Pipeline.
- **`docs/apps/Prospects.questapp.json`** — 24 fields, **no money field of any kind**, asserted by a test. "No money attached" is the definition of the stage, and a money box here invites a guess; a funnel total built from guesses is worse than no total. The drip is a **checklist** of six touches feeding a **progress** bar, beside Touches / Last touch / Next touch, and Next touch drives a **calendar** widget — the queue is the app's main screen. A **Something to bid** checkbox is the gate out.
- **`docs/apps/Leads.questapp.json`** — 32 fields, 2 calculated. Money attaches here and attaches as an **estimate**: Est. value / Est. cost / Est. gross profit / Est. margin %, deliberately not "Contract price", which belongs to Sales after a signature. **One lead per trade per address**, the same rule the Sales Pipeline runs on, so a Won lead becomes exactly one deal. It carries **both** `Trade interest` (tags, what they asked about, arriving from the prospect) and `Trade` (category, required, the one trade this lead bids) — so a two-trade prospect becomes two leads that each still remember the whole interest.
- **`docs/apps/Nurturing.questapp.json`** — 27 fields. **Revisit on is the only required date in the three apps**: a nurture list with no wake-up date is a graveyard, and the calendar over it is the app's main screen. A cooling Lead lands here with its estimate intact rather than being marked Lost. **Why not now** records what has to change; a **Buying signal** tick turns it Hot and says so.
- **The three hand records to each other with buttons**, and a test pins the shared spine — Contact, Company, Address, Trade interest, Source, Owner, Notes, same label and same type in all three, with Source and Trade interest offering identical option labels. A button matches fields **by label** and translates an option **by its label**, so a spine that disagrees on wording silently grows the destination a duplicate column on the first press.
- **A bundle cannot carry a button's destination.** `targetApp` names an app id in another workspace and is in the importer's un-remapped list, so each hand-off button installs disabled reading "This button has no destination set yet." Six dropdowns to pick after install; the button labels name where each one goes.

### What these are the first bundles to use, and the four traps found doing it

- They are the first `.questapp.json` files to ship a **record layout**, **automations**, a **progress source** and **buttons**, so none of that surface had test coverage. `tests/app-bundles.test.mjs` gained five generic per-bundle checks, and **all sixteen mutations of them were confirmed to fail** before being trusted — the repeated lesson in this file's history.
- **A record layout with explicit `fieldIds` hides what it omits.** `blockFields` honours the list exactly, so a field the author forgot to place is not out of order, it is invisible with nothing on screen to say why. The test requires every field in exactly one group.
- **Nothing inside a button's config is remapped** — not `when[].field`, not `set[].field`, not the chosen `fields` list. Field ids are reminted on install and `wbBuildInstalledApp` remaps exactly one field-config key, `progress.config.source`. A condition shipped in a bundle would compare a field that no longer exists, read as always-false and lock the button shut while looking configured. None are shipped, and the test refuses them.
- **A record button cannot run the `link` action.** The config panel offers "Open a link, call or email" for an app field, but `press()` in `button-push.js` has no link branch for a record seat — only the Company Contacts card implements it. A link button on a record would install *enabled* and do nothing. Left out, and the test refuses it. **This is a live gap in the Button field, not something these apps introduced.**
- **A sourced progress field is derived, not stored,** so `item.values` holds nothing for a numeric automation trigger to read and such a rule never fires. The automations trigger on statuses and checkboxes instead.
- **A pre-existing bug fell out of the new dashboard test**: `Underwriting Calculator.questapp.json` totalled "Total for client", a **calculation**, and a `sum` widget reads `item.values[fieldId]` — which is never written for a calculation. It showed **$0.00 however many roofs were priced**, and had done since the app was added. Fixed in `scripts/build-underwriting-app.mjs` rather than in the generated file, whose own header already warns about exactly this trap one section further up. No stored money field there could stand in — every figure in that app is a calculation, and the per-line `price` fields are unit costs that mean nothing added across records — so the card is now "added this week", which is a real number.
- Verified by **running the installer**, not only by reading the files: `wbBuildInstalledApp` over all three confirms every id reminted, each progress source landing on its checklist, all 24/31/27 fields placed on the record page, every widget/view/card field live, automations remapped with their option ids intact, buttons arriving with text, icon and action but no destination, colours surviving sanitisation, and a second install named "Leads (2)" sharing no ids with the first.

## 2026-08-15 The Views panel can be turned off

- **"In the settings, can you add an option where I can hide this card, so the items field expands and occupies its space."** App settings gained a **Views panel** tick box under Tabs: untick it and the Items tab drops the saved-views rail, and the list takes the column it was using. Stored as `app.hideViews` on the app, so it is the app's layout rather than one browser's — the same thing the Tabs setting above it is, and for the same reason: an app that never groups its records wants the width back permanently, not per visit.
- **Hiding the panel is not deleting the views.** They stay on the app (and in this browser, for private ones) and come back with the panel. The copy says so, because the rail is also where a view is deleted and the two must not read as the same action.
- The rail is **not fetched** when it is hidden. `wbViewsRail` is what pulls in the `saved-views.js` chunk, so `wbViewItems` asks `app.hideViews` before calling it rather than throwing the markup away afterwards.
- Absent means shown, which is what every app built before the setting existed wants. The doc normalizer rebuilds each app from a whitelist, so `hideViews` is named there or it would be dropped on the next save; it is written only when true, to keep a false flag out of every app in the document.
- A filter set from a view survives the panel going away: picking a view drives the same `chipFieldId`/`chipValue` the quick-filter chips use, and the chip bar sits above the list either way, so the way to clear it does not leave with the rail.
- Only somebody with `workspaces.manage` is offered the setting, and the save reads the box only when it is on screen — otherwise a role that cannot see it would blank the flag by saving the rest of the form.

## 2026-08-13 Company Contacts

- New company-wide contact directory, installed as the `company_contacts` plugin (COMPANY_SHARED scope) and auto-installed for all 14 existing companies. Nav item sits under Home / My tasks / Inbox in **My work**, because it belongs to no single workspace.
- Migration `20260813180000_company_contacts.sql`, applied live: `company_contacts` and a customer-editable `company_contact_types` (seeded Client / GC / Sub / Vendor per company), RLS, the `company_contacts.%` → plugin permission mapping, and a widened `company_plugins` plugin whitelist.
- App Builder gained a `company_contact` field type. It stores the contact id and shows the name, so renaming a contact does not break the link, and a stored id that no longer resolves renders as a visible broken chip rather than an empty cell.
- The directory shows Name · Workspace · Type · Active with us · Open balance · Last touch, all read live from the App Builder document. (The Type column and the form behind it became customer-defined on 2026-08-14 — see above.) Clicking a row opens the contact card, which lists every referencing record grouped by app and links out to it — a window, not a workbench.
- Paid for against the bundle budget by extracting `src/company-contacts/page.js`, moving the Company Contacts write path into it, and moving the whole map-pin runtime into `src/crm/location-picker-modal.js`.
- Verified against the real render in a headless browser: six cells match six grid tracks, the cross-workspace rollup reads `1 Deal · 2 Jobs` / `$35,000` from two workspaces, chip counts survive filtering, the wide table pans sideways, and every card row is a link with no nested controls.
- Known gap found and fixed during verification: record rows were labelled with the contact id because the headline took the first value on the item, and the contact link is usually written first. Titles now come from the app's first text field.

## 2026-08-17 `docs/apps` was emptied, and what came back

- The whole `docs/apps` folder was found **empty** at the start of this session — every `.questapp.json` gone, the directory itself still there. Four were tracked and came back from `git checkout`: **Jobs**, **Sales Pipeline**, **Underwriter**, **Underwriting Calculator**.
- **Five were never committed and are not recoverable from git**: Leads, Nurturing, Proposals, Prospects, and Underwriting Sheet. `tests/app-bundles.test.mjs` is itself uncommitted (+330 lines) and tests four of them, so the wipe left the suite red with the app files gone and their tests still present.
- **Underwriting Sheet was rebuilt** against those tests, which turned out to be a precise specification — the pinned arithmetic, the four stages, the sheet grid's `A1`/`E2`, the crew-based labor model and the Line items list all came back from what the test asserts rather than from memory.
- **Underwriting Calculator was regenerated** with `node scripts/build-underwriting-app.mjs` rather than left at its committed version. The script carries an uncommitted fix the bundle it emits needs: the dashboard used to total `Total for client`, a calculation, whose value is never stored — so the card read $0.00 however many roofs were priced. It is a count of records added instead. 108 fields, 26 lines.
- **All four remaining apps were rebuilt in the same session**: Prospects (24 fields), Leads (32), Nurturing (27) and Proposals (29 fields, 6 calculated, the Scopes list). `tests/app-bundles.test.mjs` is green at **121 of 121**, and the full suite passes.
- The three funnel apps came back from their tests, which pin the shared spine — Contact, Company, Address, Trade interest, Source, Owner, Notes, the same label and the same type in all three, with Source and Trade interest offering identical option labels — because a button matches by label and a spine that disagrees on wording grows the destination a duplicate column on the first press. Proposals had no test and was rebuilt from the design notes above.
- **Every bundle was run through the real `remapApp`, not just the static checks.** All five layout-carrying apps arrive with every field placed and live, both Sub-items cards follow their reminted collection ids, and each `progress.config.source` still points at its checklist. The four bundles with no layout are unchanged and still install clean.
- The lesson worth keeping: a hand-authored app bundle is source, and an uncommitted one is a file with no second copy. These are the only artefacts in the repository whose specification lives in a test while the artefact itself is untracked — which is what made the rebuild possible and is not a reason to leave them untracked.

## 2026-08-17 A client fills in a record without signing in

- "Add a button to generate a link to send to a client so they can fill it up without logging in — public, or private with a 6-character passcode."
- **A staging table, not a direct write, and that is the whole design.** `workspace_builder_state` is ONE row per company with every app, field and record in a single `doc jsonb`. There is no "insert one record" there: the only write is *replace the whole company document*. So no RLS policy can let an anonymous visitor add a record without also letting them overwrite every app in the company, and even server-side an append is the read-modify-write that `src/workspace/builder-merge.js` (148 lines of three-way merge) already exists to survive. A submission lands in `wb_intake_submissions`; a member with `workspaces.manage` presses **Add record** and it is written through the app's own save. That also buys a review step, which a public link appending straight into a live app does not have.
- **Migration `20260817120000_wb_intake_links.sql`.** Two tables. `wb_intake_links` carries the token, the visibility, the PBKDF2 hash and salt, an optional submission cap and expiry, and a failed-attempt counter. A check constraint makes the two visibilities honest — a private link cannot exist without a hash and a public one cannot keep a stale one. **Neither table is reachable by `anon`**, explicitly revoked: the public page reaches them only through two API routes under the service role. Submissions have **no INSERT policy at all**, on purpose — the route is the only writer, so a compromised member session cannot forge client submissions.
- **`/api/wb-intake-open`** returns metadata on GET and fields only after the passcode on POST. A private link returns **no field labels at all** before the gate: labels describe the business ("Adjuster", "Claim #"), so handing them out would leak the shape of the work to anybody who guessed a token. **`/api/wb-intake-submit`** re-checks the passcode rather than trusting that open was called, because a poster does not have to use our page.
- **PBKDF2, not scrypt, for one reason: the browser can compute it too.** A link is created by a signed-in member and its row is guarded by RLS (`workspaces.manage`). Had the hash needed the server, creating a link would need an authenticated endpoint, and that endpoint would have to re-decide who may create one — a second copy of an authorization rule the database already enforces, which is exactly how `public.clients` ended up writable by any member. The client derives the hash through SubtleCrypto and inserts the row itself, so RLS stays the only judge. `tests/wb-intake-passcode-parity.test.mjs` runs both implementations and fails if they ever disagree — nothing in the product could notice that drift, because a mismatch just reads as "that passcode is not right", for ever.
- **The passcode alphabet excludes 0, O, 1, I and L**, and is sampled by rejection rather than `% 31`, which would have made the first few letters ~13% more likely. Eight wrong tries lock the link for 15 minutes **in the database**, because the API's rate limiter is in-memory and per serverless instance and does not survive a cold start.
- **What a stranger may fill is a whitelist of 14 field types.** `company_contact` is excluded because it would let anonymous input mint rows in the COMPANY directory every workspace shares; `file`/`image` because uploads need an abuse story of their own; the automatic types because a value written to them is discarded on the next render. A category is matched against that field's own option ids, so one submission cannot mint an option the whole workspace is then stuck with.
- **Paid for by extracting the public FORM page**, which had been sitting in the entry chunk despite being reachable only at `/form/<id>` — a URL no signed-in session ever visits. `src/form/public-form-page.js` uses the same `createX(ctx)` factory as `src/portals/public-page.js`. Entry headroom went from **182 bytes to 501**, so this feature landed and left more room than it found.
- **Applied live** on 2026-08-17 as provider ledger `20260817131245_wb_intake_links` (repository filename `20260817120000_wb_intake_links.sql`; the timestamps differ as they do for other reconciled migrations). Both tables exist with RLS on, 5 indexes and 4 named check constraints.
- **Verified live, rollback-only, and the probe left zero rows.** `anon` cannot read a link row; `authenticated` cannot INSERT a submission *even though it holds the INSERT grant*, because there is deliberately no INSERT policy; and a private link with no passcode is refused by the check constraint. Supabase security advisors returned **no ERROR or CRITICAL** findings and name neither new table.
- **`authenticated` holds `TRUNCATE` on both tables, and on every other table in the schema.** That is Supabase's default `GRANT ALL`, not something this migration added — `clients`, `jobs`, `forms`, `company_contacts` and `workspace_builder_state` all read the same. It is worth knowing that **TRUNCATE is not subject to RLS**, so the grant is wider than the policies suggest; the practical exposure is small because PostgREST has no TRUNCATE verb, so it is unreachable from a browser session. Narrowing it is a schema-wide decision, not one to make inside a feature migration.
- **Still to do**: the config panel creates a link over *every* fillable field. `field_ids` is stored and honoured end to end, but nothing yet chooses the subset. Uploads are not offered. **The client half is not yet deployed** — the tables are live, the code is local and uncommitted.

## 2026-08-17 A day on the contact calendar opens what is on it

- "On the contact card date I want it to be clickable to view if there is an event set on that date — a modal with the records on that date and their label info, and clicking one redirects to that record."
- **A count is not something you can read.** Month and year cells showed only a number; pressing one now opens the records behind it, each row carrying the record's title, the FIELD LABEL that put it on that day ("Site visit", "Revisit on") and the app it lives in, and each row is a link to the record.
- **Only a cell showing a bare count is pressable.** Day and week already list their entries as links, so making the cell a button there would nest a link inside a button and put two different things to hit in the same place. It is a real `<button>`, so it is keyboard-reachable without a `tabindex`/`keydown` pair.
- **The dialog stores the KEY, not the entries**, and reads them back out of the same `byDay` map the grid was drawn from — so it can never show a list the cell behind it has stopped agreeing with. A day cell keys `YYYY-MM-DD`; a year cell is a whole month and keys `YYYY-MM`. The month lookup keeps the trailing dash, because `2026-1` would otherwise swallow October, November and December.
- **An open day belongs to the contact it was opened on** (`ccCalDayFor`). Without that, walking to another contact carries the dialog across, where the same key finds nothing and it reads as "nothing on this day" about a day nobody asked to see.
- **The row links do NOT go through the card's `bind` helper**, which calls `preventDefault()` on everything it binds — on a real link that is the difference between navigating and doing nothing at all. They get a plain listener that only banks the closed state on the way past.
- Rendered inside the card rather than through `state.modal`: the card is already a lazily-fetched chunk, and routing it through the shell would put it in an entry bundle with no room, for a panel most sessions never open. Entry JavaScript is unchanged at 504 bytes of headroom; the work lands in `page-*.js` (90 KB).
- `cellKey`, `entriesForKey` and `keyTitle` are pure and in `timeline.js`, so the month-boundary case is checked by running it rather than by matching source.
- **The wiring is clicked, not grepped.** `tests/company-contact-calendar-day.test.mjs` renders the card for real, builds the elements out of the markup that render actually produced, runs `mountCard` to bind the real handlers, and presses them — because a source-text assertion cannot tell a bound handler from one that throws, nor a link that navigates from one whose default was cancelled on the way out. Each of the four guards was confirmed by putting the bug back: routing the rows through `bind` fails the navigation test, dropping `ccCalDayFor` fails the contact test, focusing on every mount fails the focus test, and removing the backdrop identity check fails the backdrop test. Still **not clicked in a real browser** — the operating rules forbid a local server, so that waits for the deployed environment.

## 2026-08-17 The location pin works on the record page too

- "On this I want the button location to open the modal too to pick a location." The record page reuses the SAME field markup as the modal, so the pin had been drawn there all along — and did nothing at all, in any session, since the day it shipped.
- **One line explains it**: `wbOpenLocationPicker` began `if (!m || !fieldId) return;` where `m` is `state.builderModal`. A record page is a page, not a modal, so `m` was always null and the function returned before doing anything. Nothing threw and nothing was logged; pressing the pin was simply inert.
- **The two paths differ in what Save means, not in what the map is.** From the modal the address goes into `builderModal.draft` and the record's own Save owns it, because a pin dropped on a record somebody then cancels must not persist behind their back. From the page there is no draft and no Save button — every other field on that page commits on its own the moment you click away — so the pin writes to the record immediately. Same map, same picker markup, no second copy.
- **It writes through `wbCommitFieldValue`**, split out of `wbSaveInlineValue` for this. An address dropped on the map lands in the record's history and fires the same automations as one typed into the box; a second write path is a second place for those to be forgotten. A test now pins that both callers go through it.
- **The half-typed value wins over the saved one** when seeding the map, so pressing the pin beside a box somebody is part-way through does not throw away what is in it.
- **A refusal leaves the map open** rather than closing over the pin that was just dropped; an unchanged address says so instead of claiming a save.
- The record's identity travels on `wbInlineRecord`, set by `wbBindInlineEdits`: the ids are resolved by the section mount and are not in the DOM, and the pin's handler is the document-wide action dispatcher, so it has no other way to know which record it is on. A record or field that has gone since is checked before the map opens.
- `tests/workspace-location-pin.test.mjs` **runs the real functions** against a page-shaped state rather than matching source — 8 new cases, including that the modal path is unchanged by the addition. Entry headroom is down to **216 bytes**; nothing further should go into `main.js` before an extraction pays for it.

## 2026-08-18 The document builder: Save meant nothing, text could not be typed into, and there was no Undo

Reported from use: "this form field does not really save what I edited even the save button, also the
text I added is uneditable… when I close and open again it became blank."

- **Save kept a version and nothing else.** Pressing it stamped a snapshot into `versions[]` and said
  so, which reads as "saved" and was not: the document was still only in the hidden input it came
  from, and closing the field panel took it with it. Save now saves — `openDocEditor` takes an
  `onSave`, and the host decides what that means. From a row or the record page, `wbSave(companyId)`.
  From a field's panel, `saveHost` in `doc-editor.js` collects the panel and writes the field back to
  the app **without closing the dialog over it**; a field still being *added* has nowhere to go yet, so
  it says which button finishes the job rather than creating a field behind the user's back. The named
  version save stays where it belongs, inside the Versions panel. That logic sits in the **lazy chunk**
  and main.js gains three names in the ctx (`wbSave`, `wbCollectModalDraft`, `fieldTypeLabel`) — 35
  bytes gz, leaving **181 bytes** of entry headroom.
- **The hidden input was captured once and held.** `openFor` kept the node it found on open. The page
  under the builder repaints for all sorts of reasons — a toast alone does it — and a repaint replaces
  that input with a new one carrying the value from before the builder opened. Every later write then
  landed on a detached node and the next open read the stale replacement. **That is the blank page.**
  The input is now looked up again on every read and write.
- **No text element could ever be typed into.** The first click of a double-click selects, selecting
  repaints the page, and the node that click landed on no longer exists when the second arrives — so
  the browser fires `dblclick` at the nearest surviving common ancestor, the paper. `closest('[data-fd-el]')`
  found nothing and editing never started. Pointer capture made it worse: it was taken on the *overlay*
  at `pointerdown`, and a capture retargets the following click and dblclick to the capturing node.
  Both are fixed: the dblclick falls back to the selected element when it lands on the paper, and the
  capture is taken in `pointermove` — once it is definitely a drag — on the element itself, never on
  the overlay. `preventDefault` moved with it; `user-select: none` on `.fd-el` does the job it was
  doing without swallowing the click pair.
- **Undo and redo**, asked for in the same breath. Whole-document snapshots (60 deep) rather than an
  operation log, because every change already goes through `commit()`. A gesture *mark* coalesces a
  burst into one step: a typed name is one undo, not one per letter, and a drag goes back to where the
  pointer went down rather than to the last `pointermove`. Ctrl/Cmd+Z and Ctrl+Shift+Z / Ctrl+Y, live
  in the header beside Save, disabled when there is nothing to walk, and silent inside a text box —
  there the browser's own undo is the right one.
- **The margin slider repainted the rail it lives in**, replacing itself under the pointer after one
  step. It now repaints the page only and writes its own readout.
- `tests/doc-editor-boots.test.mjs` is 52 cases (was 28): the repaint-detaches-the-input case, the
  dblclick-on-paper case, Save reaching the field and refusing to create one early, and eleven on the
  history.

## 2026-08-18 The app strip follows you into a record

"I want the Activity and the apps to stay on top even when I'm inside the item record."

- A record is a page **inside** an app, but `wbWorkspaceHeader` was drawn on the app's own pages and
  on the workspace home and nowhere else. Opening a record took the switcher away, so the only route
  to the next app was back out to the list first. The record route now draws it too, with the record's
  own app marked active. Costs main.js one expression (~10 bytes gz; **171 bytes** of entry headroom
  left) and nothing else — `wbMountTopbar` already runs on every render in this section, so the
  measuring, the drag-scroll and the ‹ › arrows all came with it.
- **The strip was already sticky** (`position: sticky; top: 0; z-index: 30`, height measured into
  `--wb-strip-h`). What needed fixing was what sits under it. `.wb-record-top` — the way back, the
  record's name, the stepper and Customize — stuck at `top: -18px; margin-top: -18px`, which was
  right when it was the top of the page and wrong the moment something sat above it: at rest it
  pulled itself up *into* the strip, and on scroll it pinned underneath it (z-index 8 against 30) and
  vanished. It now stops at `top: var(--wb-strip-h, 0px)`, the same arrangement `.wb-tabs-row`
  already uses on the app pages.
- **`.wb-record` had to stop being a grid.** A grid item's containing block is its own grid area —
  one row, sized to the item — so `position: sticky` on the header had no room to move and had never
  actually stuck, on any screen, since the day it shipped. A flex item's containing block is the
  whole container, which is the length of the record. `display: flex; flex-direction: column` with
  the same 14px gap is otherwise identical for full-width block children.
- A record's panels cap themselves at `100vh - var(--wb-record-chrome)`. The strip is now subtracted
  as well, and deliberately **separately**: it is measured, not counted, so folding it into the
  constant would be wrong by however much a wrapped app name or a different font moved it, and
  erring small hides a panel's last row below the fold.
- Three cases in `tests/workspace-record-page-static.test.mjs`, and the existing panel-cap assertion
  re-pointed.

## 2026-08-18 A comment can carry a file, a photo or a clip — and Enter sends it

"Allow the user to attach a document like PDF, DOCS, SPREADSHEET, opened in a modal to view it,
with the option to view full size in another tab or download it; also a picture or video. So two
icons in the comment. Also when I hit enter it automatically comments, and Alt+Enter makes a new
line."

- **Two pickers, because they are two intentions.** A paperclip for the document being filed
  against the record (`document` policy: PDF, Word, Excel, PowerPoint, text, zip, 25 MB) and an
  image button for the photo or clip that IS the comment (new `media` policy: images plus MP4,
  WebM, MOV, M4V, 50 MB — a phone clip of a roof is tens of megabytes and refusing it would refuse
  the feature). A comment may now be nothing but files: requiring words beside a screenshot means
  captioning every one with "see attached".
- **No new viewer was written.** The record modal's file field already opened a preview dialog
  with an iframe/`<video>`/Office-viewer stage, **Open in new tab** and **Download**. Every
  attachment renders as the same `[data-wb-view-file]` button, so there is one dialog and one
  place "this cannot be previewed" is worded. What was missing was that its binding only existed
  inside the record modal — it is delegated from the document now, which is what makes an
  attachment on the record *page* openable at all.
- **Video is verified by its bytes**, not by its name: `isobmff` (`ftyp` at offset 4) and `ebml`
  signatures were added. MP4 and WebM are deliberately left OUT of the MIME allowlist even though
  they are now listed for signatures — a browser recording reports `audio/webm;codecs=opus`, which
  is not a member of any list anyone could write, so listing them would have refused every voice
  note. Their bytes are what a codec suffix cannot dress up.
- **Enter sends, Alt+Enter breaks the line** (Shift+Enter too). Alt+Enter has no default behaviour
  at all, so the break is inserted by hand at the caret and over any selection. Both @-mention
  guards from the feed's box apply: the `mentionHandled` flag and the "is the list open" check,
  because either listener can run first. IME composition is left alone — mid-word, Enter is
  choosing a character.
- **Paid for, twice over.** The feed's uploader moved out of main.js into
  `src/workspace/attachments.js` (lazy) so a comment and a post cannot drift apart about what
  "attached" means, and the five comment-thread bindings that existed in **two** copies — once on
  the record page, once on the record modal, differing only in whether they remembered the modal's
  scroll — collapsed into one delegated dispatcher. Entry headroom is **32 bytes** under the real
  ceiling, not borrowed from the 64-byte gzip-environment tolerance.
- **The composer is a column.** First cut put the two pickers and Comment beside the box, which
  took about two hundred pixels out of a panel that is already the narrow half of a record and
  left a comment box too small to see a sentence in. Box across the full width, buttons under it
  — pickers left, send right. The Enter/Alt+Enter line under it went with them: it wrapped in a
  narrow panel, and it lives in the send button's tooltip instead.
- `tests/comment-attachments.test.mjs` is 31 cases: the kind/size/markup helpers, the escaping of
  a filename in three positions, an upload that never embeds bytes on a live session, the
  two-policy split, the voice-note regression that the MIME decision above exists to prevent, and
  the Enter/Alt+Enter contract.

## 2026-08-17 The attach sheet goes dark, and the back button becomes one icon

- Two asks off one screenshot: **"fix its UI to be like this"** against a messaging-app attachment sheet, and **"the button to back to all record is just a single icon"**.
- **The attach menu was already the right shape** — a `+` opening Document / Photos & videos / Camera, each with its own colour, its own upload policy and its own accept list. What was asked for was the LOOK, so this is a restyle, not a rebuild: a near-black rounded sheet, light text, one line per entry, the glyph carrying its colour with no tinted tile behind it.
- **It was fixed at `#1f2023` in both themes, and that is now reverted.** The next instruction was explicit: "the uploading file make it themed with the system do not adapt the them on image i just want the idea." The sheet follows the page like every other menu — `var(--surface)`, `var(--border)`, `var(--text)`, hover on `var(--surface-2)` — and what is kept from the reference is the shape: one `+`, three named rows, each glyph in its own colour. The test that refused `var(--…)` inside the rule now requires it. The lesson is not about colour: a screenshot answers "what should this look like", and the reader has to decide which half of it is the idea and which half is that app.
- **The second line under each name is gone**, which is what the asked-for look does. The name already answers which takes the contract and which takes the photo; the detail ("PDF, Word, Excel…") stays as the row's tooltip. The test was rewritten to assert the `title` ATTRIBUTE rather than the bare string — the strings are still in the markup either way, so the old assertion would have passed with the tooltip missing entirely.
- **The back button keeps its name where it counts.** It used to read "All Prospect"; it is now the arrow alone, sized like the stepper arrows beside it. The app name moved to `title` and `aria-label` rather than being deleted: an unlabelled arrow is announced as "link" and answers nothing on hover, and naming the destination is why it reads the same as the deck row it came from.
- **A measurement worth not repeating**: the entry chunk read 21 bytes OVER the ceiling and was passing only on the 64-byte environment tolerance the budget file says is unspendable. **The 364144 recorded here as the "clean rebuild" was not one** — that build was made while `src/main.js` was temporarily reverted to `HEAD` during a parallel attribution experiment, so it is the entry WITHOUT the comment work in it. Re-measured with `dist` deleted first, one `index-*.js` present, and the file read through `.vite/manifest.json` exactly as `check-bundle-budget.mjs` reads it: **364509, 35 bytes under**. The lesson stands and gains a second half — measure on a fresh `dist`, and check nothing else is mid-edit while you do.
- **35 bytes is not a margin.** Two consecutive clean builds agree to within 2 bytes, so the figure is real rather than noisy — but it is smaller than the change any single edit to `main.js` makes. The next person to touch that file should expect to fail the gate, and should arrive with an extraction rather than a seventh raise, which the budget file already refuses.

## 2026-08-18 The comment box grows as you type, and the + is where attaching starts

- "on the comment can you make this? on attaching files? also I want the text field box to be auto expand when entering new line, so it expand downards. and a plus icon to attach files."
- **One `+` in place of two bare icons.** A paperclip and a picture could not say which took the contract and which took the photo, and the answer is not something an icon carries. The menu names them — Document, Photos & videos, Camera — and each keeps its own upload policy and accept list, which is the part that matters underneath: a 40 MB roof clip has no business going through the allowlist a contract PDF goes through.
- **Camera is offered only where there is one.** `capture` is ignored by desktop browsers, so the entry there would open the same dialog as Photos & videos and lie about what it does. A coarse pointer is the honest proxy.
- **The box grows downward and then stops.** `grownHeight` is pure — content plus the border `scrollHeight` leaves out on a border-box element, capped, with a flag for whether it has to scroll. Uncapped, a long comment pushes the thread it is replying to off the top of the panel. The drag handle came off with it: a height set by hand would be overwritten by the next keystroke.
- **Height is cleared to `auto` before measuring.** `scrollHeight` on a box that already has a height reports the height it HAS, not the height it needs — so a box that had grown could never shrink again. The test's fake textarea models that rule rather than returning a constant, because a constant reports the bug as working.
- **Typing survived attaching a file for the first time.** The panel is redrawn whole by any state change, and a redrawn textarea comes back empty — so uploading a photo threw away the sentence written to go with it, in every session there has ever been. The draft is banked on `state.wbCommentDraft` as it is typed, put back on mount, cleared when the comment sends and deliberately NOT cleared when the save fails: the files already come back on a failure, and returning the photos without the words is the wrong half to keep.
- **The draft and the file tray belong to the record they were filled on** (`state.wbComposerFor`). Stepping to the next record in the pager carried both along, and the next Comment would have filed somebody else's photos against the wrong job.
- **None of the wiring is in the entry bundle.** The panel mounts itself from a `queueMicrotask` inside its own render, and the two document listeners that close the menu live in the lazy chunk. Measured, not assumed: the four lines the host originally carried cost **66 gzip bytes** against **33 bytes of headroom**; moving them out leaves the entry at 364509, **35 under** — two bytes better than the feature found it. The whole feature is 125 gzip bytes of `record-panel.js`, which is fetched only when a record is opened.
- **The press is taken on the way up, Escape on the way down.** Closing during a click's capture phase re-renders the page under a press the host has not handled yet; Escape has to be answered before the host's next stop for that key, which is "dismiss the record" — a long way to go to shut a menu.
- `tests/comment-attach-menu.test.mjs` renders the composer and presses it: 26 cases over the menu, the pickers' accept/capture, the growing box, the draft, and the per-record claim. Four were confirmed by putting the bug back — measuring without clearing the height, never banking the draft, dropping the per-record claim, and offering Camera everywhere each fail exactly one test. **Not clicked in a browser**: the operating rules forbid a local server, so that waits for the deployed environment.

## 2026-08-17 Quick Create, and the entry bundle finally runs out

- A sixth record-layout card: **Quick Create**, offering Spreadsheet, Form, Image and File. Pressing one attaches the thing to the record you are looking at and opens its editor.
- **What "attach to this record" can mean here, and why.** The App Builder keys a record's values by field id and has no per-record attachment slot, so the only honest reading is: the app gains a field of that type, and THIS record's value of it is opened. The field is made once and **reused** — a second press on another record opens the same column rather than growing a second one — and it is matched on TYPE, so renaming "Spreadsheet" to "Takeoff" does not earn you a second spreadsheet. The consequence is stated rather than discovered: the column then exists on every record in the app, blank until used, which is what a Button push already does to the app it pushes into.
- **A made field is PLACED as well as made.** `blockFields` honours an explicit `fieldIds` list exactly, so a field in no group renders nowhere with nothing on screen to say why — Quick Create would have looked broken the first time it was pressed on a customised layout. `placeFieldInLayout` appends it to the last field group, and deliberately leaves a `fieldIds: null` layout alone rather than pinning that group to the fields that happen to exist today.
- **Image and File open the cell, not a modal of their own.** Those two are edited by the cell they live in; building a second picker would be a second thing to drift. Sheet and Form go to the editors that already exist, through the same four-id seat string those editors already understand.
- **It binds itself.** The card's listener lives in `record-page.js` — already fetched whenever a record is on screen — rather than as another case in main.js's action dispatcher, because there was no room for one. The seat rides on the card in a data attribute, since the listener outlives every render. The button is disabled while it works: making a field and then opening an editor is two awaits, and a second press in between makes a second field.
- **Proposal is declared in the model but not drawn.** `proposal_documents` already has the generic `related_type`/`related_id` pair, so it needs no migration — but creating one properly means the proposals module's numbering, draft shape and client block, and a half-right proposal row is worse than no button. **Task and Estimate need a migration**: `public.tasks` and `public.deals` link only to a contact, deal, job or project, with nothing generic to hang an App Builder record on.
- **The entry bundle is now at 2 bytes.** The six ctx keys this needed cost 33. That is passing, and it is not a margin — it is less than any single edit to `main.js` will cost. The extraction the budget file has been asking for is no longer optional: **`wbBindInlineEdits`, `wbSaveInlineValue`, `wbCommitFieldValue` and `wbResetInlineCell` are 10.8 KB of record-page-only code sitting in the entry chunk**, and `record-page.js` — already lazy, already carrying this feature's handler — is where they belong. Their ~20 ctx keys are exactly what `tests/extracted-module-references.test.mjs` FACTORY_MODULES checks, which is the failure mode that refactor has. Nothing else should touch `main.js` first.

## 2026-08-18 A record's cards reach the bottom of the surface

- "can you stretch the activity/comment card and the records a little? so it fills the gap on the bottom part."
- A short record ended halfway down the page with the dotted ground showing under two cards that had stopped wherever their content did. The page is now made at least as tall as the scrollport and the grid takes what is left over, so the cards fill it.
- **The height is handed down the whole chain.** A record renders as `.work-surface > section.tool-page.wb-page > .wb-record > [data-wb-rec-grid]`, and a rule that skips the `.wb-page` wrapper matches nothing while reading as perfectly correct — which is how the dashboard's split-scroll shipped dead once already. `tests/record-page-fills-surface.test.mjs` derives the chain out of `main.js` and `record-page.js` and builds the expected selector from it, so a rule that skips a step fails rather than passing against itself. Putting that bug back fails two of its nine cases.
- **The surface keeps its own scroll**, unlike the dashboard split which takes it away: this page's header is sticky AGAINST the surface, and a long record with nowhere to scroll would be a worse page than a short one with a gap.
- **`align-items: start` was what held each card at its content height.** The record grid stretches instead, scoped by `[data-wb-rec-grid]` because `.wb-dash-grid` is the company dashboard's grid too — which keeps its own behaviour, and has a test saying so.
- **The comments card fills the height it is given** rather than floating its composer in the middle of it: tabs at the top, the box at the bottom, the feed taking the slack. The scroll cap moved from the feed to the CARD (`min(74vh, 720px)`) — on the feed it was the thing stopping a busy thread from making the page enormous, and letting the feed stretch would have thrown that away. The panel drawn anywhere else, the record modal included, keeps the 52vh/460px cap it always had.
- Entry CSS 118160 of 122880. **Not clicked in a browser** — the operating rules forbid a local server, so the arithmetic above is reasoned and tested, not seen.

## 2026-08-17 The inline editor leaves the entry bundle

- The extraction the budget file has been asking for since the fifth raise. `wbBindInlineEdits`, `wbResetInlineCell`, `wbSaveInlineValue` and `wbCommitFieldValue` — **12.9 KB of source, reachable only from a record page** — moved out of `main.js` into `src/workspace/record-page.js`, which is already fetched whenever a record is on screen. Entry headroom went from **2 bytes to 790**.
- **Moved by script, not by hand.** 12.9 KB retyped is 12.9 KB of chances to change a character; the script asserts its own boundaries (that the block contains the binder and reaches the end of the writer) and refuses to run if either moved.
- **Two bindings could not travel.** `wbFieldUiModule` is a module-level `let` in `main.js` that says whether the field-UI chunk has been fetched — handed over as `wbFieldUiReady: () => !!wbFieldUiModule`, a getter rather than the value, because a value read once at construction would be the `null` it held before anything was fetched, for ever. `wbInlineRecord` is written by the binder and READ by the map pin, which stays in `main.js`; its assignment moved to the mount call site, which already has all four ids in hand, so no setter crosses the boundary.
- **`saveLocationPicker` now awaits the module** to reach `commitFieldValue`. That branch only runs for a pin opened from a record page, where the module is already loaded, so the await is belt and braces rather than a new fetch.
- **The safety net was tested, not assumed.** This refactor's failure mode is a ReferenceError on first use and nothing earlier — exactly what `tests/extracted-module-references.test.mjs` FACTORY_MODULES checks. Removing `actorName` from the ctx fails it with *"record-page.js destructures actorName but main.js never passes it"*; putting it back passes. 3,792 tests green.
- **A test helper was quietly lying, and was fixed on the way past.** `slice()` in `workspace-record-page-static.test.mjs` bounded a function by the first closing brace at its own indent — but a `.map((c) => {` callback inside a template literal closes at column 2 as well, so the body was cut off part-way and every assertion after that point passed on text it never saw. It is bounded by the next sibling `function` now.

## 2026-08-18 The record page stops wasting the screen, and the sheet stops leaving it

- "fix UI, cards too much gaps... pls fix it it over laps, maximize the srceen look there are so much white spaces."
- **The attach sheet ran off the side of the window.** It was anchored `left: 0` against a button that sits at the right of the right-hand card, so a 258px sheet opened straight past the viewport edge. It is anchored to the button's RIGHT edge now and grows back across the card it belongs to, with `max-width: min(288px, calc(100vw - 28px))` as the backstop for a narrow window.
- **A band above the record that had never been there was mine.** `.tool-page` sets `gap: 14px`; a block wrapper ignores it and a flex one does not, so turning `.wb-page` into a column to hand the height down added 14px silently. `gap: 0`, and a test that names where the 14px comes from.
- **The surface pads by exactly what the sticky header bleeds.** The header spans it with `margin: 0 -24px` against a 28px padding, so it had been stopping 4px short of each edge all along. 24px now, derived in the test from the header rule so changing one and not the other fails.
- Bottom padding 42px → 14px (the white band still showing under the cards after they stretched), the app strip's margin 20px → 10px on a record, the record column gap 14px → 10px, the sticky header 10/12px → 6/10px, and the grid's own 12px `padding-top` dropped since the column gap already spaces it. About 70px of vertical room and 8px of width, none of it taken from the cards themselves.
- A test that pinned `gap: 14px` inside the assertion for "the record is a column so its header can stick" was rewritten to assert the column. The gap is a look; the column is the rule, and hard-coding the look into a test about the rule is what made a spacing change look like a regression.
- **Not clicked in a browser** — the operating rules forbid a local server. Spacing that has only been reasoned about is exactly the kind of change worth looking at, and this one has not been.

## 2026-08-17 The cards were short because there was a number at all

- "Make the cards a little long" — twice. The cause was never the number: it was that a number existed.
- The panel cap was `100vh - chrome - strip - header`: a **tally of everything above the cards**, where each part had to be corrected whenever any of them moved. Collapsing the record header from two rows to one left it 56px out, so every card stopped short of the bottom with nothing on screen or in the stylesheet to say why. Measuring the header fixed that half and left the other half still guessed — which is why one nudge was not enough.
- **One measurement replaces all four.** `measureRecordGrid` publishes `--wb-record-grid-top` from the grid's own `getBoundingClientRect().top`, which already contains the window chrome, the topbar, the app strip and the record header, whatever any of them happen to be doing. `--wb-record-chrome` and the short-lived `--wb-record-head-h` are gone; what remains is the measured top and `--wb-record-foot`, the work surface's own bottom padding — the one thing genuinely below the cards.
- **A scrolled reading is discarded, not written.** The header is sticky, so once the surface scrolls the grid's top is smaller than its resting offset and the cap would grow past the screen. `scrolledAway()` refuses those; a zero is refused too, since writing it before layout would collapse every panel to nothing. The `ResizeObserver` is re-pointed on each render because the node is rebuilt every time.
- `100dvh`, not `100vh`: on a phone the address bar makes them differ and `vh` is the taller of the two, which is the direction that hides a card's last row.
- **It costs main.js nothing.** The measurement runs inside `bindInlineEdits`, which moved into `record-page.js` with the inline editor earlier the same day and already runs on every render of a record.
- Two stale things were corrected on the way past: a comment claiming the panel grid is `align-items:start` when the fill-to-bottom work had made it `stretch`, and an assertion matching `max-height: calc(100vh` unanchored — which reads the FIRST such rule in the stylesheet, a modal 23,000 lines away, not the panel cap it was written for.

## 2026-08-17 Move a record and you go with it

- "When I move the record to another app it's gone from my view — can you make it go together with me?" A move takes the record out of the app it was in, so somebody sitting on its record PAGE was left reading *"This record is gone"* — accurate, about a record they had just sent themselves, with the copy that does exist one app away and nothing pointing at it.
- The modal case was already handled (`state.builderModal = null` closes the form). The page was not: it has a URL, and that URL stopped resolving.
- **Only when the page being read is that record's own.** Pressed from a list row, or while reading a different record of the same app, the reader is not on it and moving them would be the button doing something it was not asked to. The route's `app_id` + `item_id` answer that — a deck row carries neither.
- **The id survives the move**, which is what makes the redirect a straight substitution: a move keeps the record's id, its comments and its history, because it went somewhere else rather than stopping and starting again. Only a copy mints a new one. So the link that was open stays valid and simply points into the new app.
- **A move into Company Contacts follows too**, to the card it just became. Filed without moving, the record is still there to read and the reader stays put.
- `tests/button-push-follow.test.mjs` presses the button and follows where the reader lands — six cases, four of which assert it must NOT move them. **Confirmed by mutation**: deleting the "am I reading this record" guard fails two of them. The first attempt at that mutation silently did not apply, because the file is CRLF and the patch was written with `
` — a green run that proved nothing, which is worth knowing before trusting the next one.
## 2026-08-18 Live QA regression hardening

- A Button on a brand-new, unsaved App Builder form can no longer create an orphaned `Untitled` record in another app. Send and move actions ask for one source save first; a Change-fields button still works inside the draft because it does not create a second record.
- Record deletion now waits for the recycle-bin write to finish before closing the confirmation or reporting success. A refused save restores the browser's in-memory record list instead of leaving the screen ahead of storage.
- Company Contact card-button edits made in Settings remain in the shared draft until Save, so later fields no longer overwrite the chosen label, icon, action, or destination with the generic Button defaults.
- Taking Location or another Company Contact field off the card remembers its prior card region. Adding it back restores that region instead of forcing it into Details.
- Cross-app destination lists now exclude apps stranded in deleted, inactive, or inaccessible operational workspaces. The Apps navigation badge counts the resolved apps visible in the selected workspace rather than the number of builder workspace containers.

## 2026-08-18 Quick Create makes a task for somebody

- "On Quick Create tiles add a Task, so we can add a task for someone to do that will be saved on the task on My Work."
- **A task is not a field on the record**, unlike the other four tiles. It is a row in `public.tasks`, and the Tasks module already owns making one: the assignee, the due date, `notifyTaskChange` telling them, `runTaskSaveHooks`, and the My Work listing. Pressing Task opens **that** form — the tasks section with `new=1`, which is what raises the New-task modal — pre-filled. A task writer inside Quick Create would have been a second one to keep in step with the first, and the first is the one with the permission check and the notification in it.
- **It writes nothing to the app.** The other tiles add a field and place it in the layout; a task must not, or every record in the app grows an empty Task box for ever.
- **What travels is what the form can already hold**: the record's NAME as the title, so the task says what it is about, and the record's contact — when it has one — as the linked contact, which is a real link rather than a sentence. A record with no contact sends none, rather than an empty one that would render as a link to nothing.
- **What does NOT travel is a pointer back to the record.** `public.tasks` links to a contact, a deal, a job or a project and has no generic pair like the `related_type` / `related_id` that `proposal_documents` carries, so nothing here pretends otherwise. Giving a task a real handle on an App Builder record needs a migration of its own; it is still outstanding, along with Estimate.
- The seeding is scoped to a NEW task (`task ? null : {…}`), so a stale `title` in the query cannot overwrite the title of a task somebody opened to edit.
- **And for its first day the tile was never drawn.** The card selected on `entry.field`, which is true of the four tiles that add a column to the app and false of a task — so Task was in the model, handled by `press()`, seeded into the form by `main.js`, covered by seven passing tests, and absent from the card. Every one of those tests exercised the press; none of them asked whether anything on screen could reach it.
- **What is drawn is now a fact of the model, not a guess by the card.** An entry carries `soon: true` when it is declared but unbuilt (Proposal), and the card draws everything without it. The default is therefore DRAWN: a new tile that nobody flags shows up, which is the failure worth having — a visible button with nothing behind it is reported in a minute, and an invisible one that works is not reported at all.
- `tests/quick-create-task.test.mjs` presses the tile, reads where it lands, and now also checks it is on the card — ten cases, **confirmed by mutation**: sending `contact_id` unconditionally fails the no-contact case, and putting the `entry.field` filter back fails the paint case. One test derives both sides of the invariant — the modules `press()` actually handles, read out of `press()`, against the flags in the model — so a tile that works and is not drawn fails, and so does a tile that is drawn and does nothing.
- The assignee is not asked for here. The Tasks form asks, from `companyTaskAssignees(companyId)`, and that field is what decides whose My Work it lands in.
- **It opens on the record now, not on another page.** "when creating a task in quick create it will open a modal to fill the task, then it will passed to My task so it is recorded there." Pressing Task raises `renderRecordTaskModal` over the record — title (pre-filled with the record's name), Assign to, Due date — and the reader keeps their page, their scroll and their place. The same modal shape as **New task from activity**, for the same reason: three fields is a form, not a page.
- **It is still not a second task model.** The write is `wbCreateTaskFromPost`, the shared one the workspace feed and the activity modal use: `tasks.manage` checked, the creator stamped, the single `normalizeTask`/`taskPayload` shape ADR-0001 requires, the insert into `public.tasks`, and `notifyTaskChange` telling the assignee. That is what puts it in My Tasks — nothing in Quick Create knows how a task is stored.
- The writer gained an optional `contactId`, so the record's contact rides across as a real link. Sent only when the record has one; `blankTask` already supplies `''`, and writing an empty string over it would be the same value with a worse name.
- Assign to is `wbMembers` — this company's people — and defaults to **Me**, which is the common case for a note somebody makes while reading a record. That field is what decides whose My Tasks the row lands in.
- **The earlier route into the Tasks page is gone, and so is the fork edit that served it.** The previous pass had forwarded the record title across the iframe boundary in four hops (host URL → `config.js` → `AppController` → `NewTaskPageView`) because the tile used to navigate. Nothing navigates now, so those hops were dead code inside the vendored app; they were reverted and `taskmanagement/` is byte-for-byte untouched again, which is what ADR-0001 asks for. `tests/task-prefill-across-the-frame.test.mjs` went with them.
- `tests/quick-create-task.test.mjs` presses the tile and reads what it opened — ten cases, **confirmed by mutation**: navigating away instead of opening the modal, dropping the contact on the way to the writer, writing a task row directly instead of through the shared writer, and taking the assignee select off the modal each fail their own case.
- **Still outstanding**: there is no column on `public.tasks` for an App Builder record, so the task carries the record's name as text and its contact as a link, but cannot link back to the record itself. That needs a migration.
## 2026-08-18 In flight is read by its icons

- "Can you add the icon of the apps here? so for easy to read." In flight lists every app that references the contact, and three or four of them is a column of names in identical type — the app is the thing being scanned for.
- **The icon is carried by the MODEL**, not fetched again by the panel. `contactUsage` already answers "which app is this"; `appIcon` and `appColor` join `appName` there, so anything else listing connected apps gets them without a second lookup that could disagree.
- **Both are validated where they are read, not where they are drawn.** The icon goes straight into `class="ti ${…}"` and the colour into a `style` attribute, so a value that is not a Tabler name or a hex colour is dropped in the model rather than escaped at the last moment. A test puts `ti-x" onload="alert(1)` through it, and a mutation that passes the icon through unchecked fails that test.
- **Drawn only when the app HAS an icon.** A default would be this panel claiming a mark the app does not have; a colourless app still gets a chip, in grey, because the shape is what makes the row scannable.
- Sized to the line it sits on (20px) rather than to the record page's larger tile: here it is a label, not a header.

## 2026-08-19 The Jobs rail stops repeating the Jobs page

- "can you removed this" — the eight pipeline stage rows under Production > Jobs (Unscheduled through On hold), each with its dot and its count.
- **They were a second copy of a control that already exists.** `pipelineToolbar` renders the same stages as chips on the Jobs page itself: same list, same counts, same `data-action="pipeline-stage"` handler. The rail was eight rows deep and mostly zeros, in the section people live in, and pressing one did exactly what the chip does. Nothing was taken away by removing them.
- `navItemPipeline` draws both Jobs and Deals. Only Jobs is excluded — it is the one pinned open (`alwaysOpen`), so its list is permanently in the way, while Deals sits behind a chevron. **Calendar and All jobs stay.**
- **Emptied at the source, not branched in the markup**: `showStages` decides whether `stages`/`counts` are fetched at all, and the template maps over an empty list. One shape for both kinds instead of two, and `pipelineStageCounts` — which walks every job in the company — no longer runs on a paint that happens on every route.
- Guarded in `tests/jobs-dashboard.test.mjs`, **confirmed by mutation**: turning `showStages` back on fails, and deleting the stage rows outright (which would take them from Deals as well) fails the test that says Deals keeps its list.

## 2026-08-18 An Image field can hold several photos

- "On the App Builder fields, allow field Image to upload multiple photos."
- **The machinery already existed.** The File field has had `config.multiple` for a while, and the uploader that mounts both reads one attribute on the zone (`data-wb-file-multi`) to decide list-or-single. So this is the Image field joining what is there rather than a second gallery: the toggle, `multiple` on the input, and the list the uploader paints into.
- **Three places still assumed exactly one photo**, and those were the work:
  - The config collector read the toggle only `if (t === 'file')`, so on an image it painted, flipped, and was forgotten on save.
  - The list row is an icon plus a filename — fine for a contract, wrong for a photograph. An image row is the picture itself; eight named rows are harder to read than the one picture they replaced, which is the opposite of the point.
  - **The read-only cell used `wbFileValue`, which reads ONE.** A field switched to multiple would have rendered the first photo and looked like the rest never uploaded. It reads `wbFileValues` now, and a mutation back to the single reader fails a test.
- **A single image is still a circular avatar**; a gallery is squares, because a row of circles crops faces and corners off pictures that were chosen for what is in them. In a table cell several photos overlap, so eight of them still read as one value rather than pushing every other column off the row.
- **Turning it off keeps what is already attached.** The uploader stores one file as an object and several as an array, so switching back only stops new ones being added — it does not rewrite the record.

## 2026-08-19 A file field asks how many, in words

- "in the app builder fields, lets Update the fields, so to set it up it has 2 option. single file upload, Or the Multiple file upload."
- **The capability was already there and had been for a while**: `config.multiple`, the `data-wb-file-multi` zone, `wbFileValues` reading both the single-object and array shapes, per-file removal, the multi-file cell. What was missing was the way it reads in setup — a switch labelled "Allow multiple files", which names what ON means and leaves OFF to be inferred.
- Now two named options: **Single — one file on this field** / **Multiple — several files on this field**, as a `<select>`. That is the shape the **Display style** control directly above it in the same panel already uses, so the panel reads one way rather than two. An Image field says photo/photos.
- **Fixing the wording turned up a real bug in the save.** `m.draft.config.multiple = !!checked('wbFileMulti')` read a missing element as `undefined` and stored `false` — so collecting the draft while the field-config chunk had not arrived silently reset a field that was set to multiple. The read now writes only when the control is actually on screen.
- Nothing changes for existing fields: no `config.multiple` still means single, and switching back to single keeps every file already attached — the uploader stores one file as one object and several as an array, and only stops new ones being added.
- Guarded in `tests/workspace-file-multiple.test.mjs` and `tests/image-field-multiple.test.mjs`, **confirmed by mutation**: collapsing the two options to one, dropping the save, putting the missing-control bug back, and taking `data-wb-file-multi` off the zone each fail their own case.

## 2026-08-18 Quick Create is rebuilt around what does not grow the app

- "Remove Spreadsheet, Form, Image and File. The new Quick Create is Task, New Field, Call and SMS."
- **The four field tiles are gone.** Each of them added a COLUMN TO THE APP the first time it was pressed, so a spreadsheet made for one job put an empty Spreadsheet box on every other record in that app for ever. That is what the App Builder's storage allows — values keyed by field id, no per-record attachment slot — and it is not what Quick Create is for. `quickCreateField` and `placeFieldInLayout` are kept and still tested, because **New Field** is the tile that replaces them and finding-or-making a field is what it will do; their tests were repointed at the helper rather than at a tile that has gone.
- **Paid for with an extraction, as the budget file asks.** `renderTaskForm` — 2.9 KB, the body of one modal, raised from the Tasks section and from Quick Create — moved into `src/tasks/task-form.js`. Entry headroom went from **−9 bytes to +185**, which is the first honest headroom since the image field landed. Added to FACTORY_MODULES, so the ctx-key check covers it.
- **`20260818090000_wb_record_events.sql`** is the home for a scheduled call or SMS. Not the record document: that is one row per company holding every app, so moving one reminder would rewrite the whole thing, and nothing outside a signed-in browser tab could read it — a reminder only a tab can see is not a reminder. Not the workspace activity log either: that records what HAS happened, and a future date sorts into it wrongly. The number is stored as scheduled rather than looked up later, because the record's phone field can change and a reminder must ring the number the person meant.
- **SMS will not have a Send button.** The brain already says it: contact SMS is fail-closed, and the workspace routing contract is not implemented, so production stays disabled even with the tables. Building Send now ships a button that does nothing on questbase.io. The tile gets phone-field detection, the picker for a record with several numbers, the message box and Schedule-for-later; Send waits for the backend.
- **Call Now needs nothing new.** A phone field already refuses to hand the browser a bare `tel:` link — it raises its own confirmation and logs the call on the record before dialling — and Quick Create reuses that.
- Still to build: the New Field, Call and SMS tiles themselves, and the activity card that reads `wb_record_events` as a Customize-able record-layout block. **The migration is written but NOT applied.** *(Both done on 2026-08-19 — see below. The migration is applied.)*

## 2026-08-19 The three Quick Create dialogs, and the task tile that was already right

"Task opens a modal to create a quick task that is saved in Tasks. In the call, call now or call
for later or follow-up with date and time; if multiple phone fields, it will just select one. Same
with SMS: create a title, select one phone or all of them, and it can be set for later. New Field
opens a modal to select the field, add the label, then select where to insert — before (field) or
after (field)."

- **Three dialogs, one shell.** New Field, Call and SMS all need something typed before anything
  can happen, so all three open the same modal over the record. State lives on `state.wbQuick`
  rather than in the DOM: the record page redraws for reasons of its own — a save, a toast, a
  background sync — and a half-written message has to survive that.
- **Task was already built, and building it again was the mistake.** The tile briefly grew its own
  dialog and its own writer, calling `saveTask` with a detached form. It was deleted the same day.
  `openRecordTaskModal` → `renderRecordTaskModal` → `wbCreateTaskFromPost` already raises a modal
  ON the record and writes through the one shared task path: `tasks.manage` checked, the creator
  stamped, the contact linked, `notifyTaskChange` telling the assignee. A second writer missing any
  of those is a task nobody hears about, which is worse than no task. `press()` calls
  `ctx.openRecordTask` and stops there.
- **New Field offers only the types it can finish.** `calculation` needs a formula, `rollup` and
  `relationship` need another app to point at, `button` needs a destination, and a sourced
  `progress` needs a checklist to fill from. None of those can be asked for here, and a field that
  renders but can never hold a value looks configured and is not — so they are not offered, and a
  choice field with no options is refused outright rather than shipped as an empty dropdown on
  every record for ever. Options are one per line and their colours are assigned: picking eight of
  them is not what somebody opening this dialog came to do.
- **One number picker, not a control per number.** A record with a mobile and an office line is
  asking WHICH, not asking for two ways to press. With one number there is nothing to choose, so it
  is stated. **All numbers** is offered for a message and never for a call — you cannot ring two at
  once — and a message to all of them writes ONE ROW PER NUMBER, so whatever sends them gets a list
  of messages rather than a field to parse.
- **Call now reuses `data-wb-call`.** That is the record page's existing confirm-then-log-then-dial
  path; a second dialler would skip the logging. It is bound by the pass that runs after every
  workspace paint, and a test now pins both the selector and that gate — "they drew fine and did
  nothing" is a failure this page has had before.
- **A scheduled call is a note of when, not an alarm**, and the dialog says so. There is no reminder
  job yet, so promising a ring would be a lie told by a placeholder.
- `20260818090000_wb_record_events.sql` **is applied.** Rows are written straight from the dialog,
  and the record layout gains a **Calls & messages** block the first time one is scheduled, so what
  was just saved is visible on the page that saved it.

- **Then every tile threw on its first press**, reported as *Cannot read properties of undefined
  (reading 'wbQuick')*. `wbViewItemPage` declared `const ctx = { companyId, workspace, app, values,
  item, canManage: false }` for `wbFmtVal` — and that name **shadowed the factory's own `ctx`** for
  the rest of the function, which is where `renderQuickModal(ctx)` is called from. The dialog was
  handed a formatting context with no `state` on it. It only ever showed on the FIRST press,
  because `quickModule` is null until then and the render is guarded on it, so the press that
  loaded the module was also the press that broke. Renamed to `valueCtx`.
- **Two guards, both mutation-checked against the real bug.** A static one forbidding any
  redeclaration of `ctx` in that file, and `tests/record-quick-create-renders.test.mjs`, which
  fires a real click at the real listener and reads the page that comes back — the first test here
  to render the record page rather than assert on its source. Its ctx is a Proxy answering unknown
  keys with a stub, so it does not become a forty-key list to keep in step with main.js; the
  ctx-key check already owns that. A dynamic import settles on a turn of the loop rather than a
  microtask, which is why it waits with `setTimeout` — awaiting promises alone let the assertion
  run before the module had loaded, and it failed for the wrong reason.
- The same shadow exists in `crm/bulk-modals.js` and `home/company-dashboard.js` and is harmless
  there: neither passes the factory ctx OBJECT onward from inside the shadowed scope. That is the
  condition that makes it a bug, not the shadow itself.

## 2026-08-19 New Field asks in a readable order, with a dropdown that can show an icon

"The quick create field: make the dropdown list with icon for easy read, and the insertion is like
this — first select after or before, then select which field, then the name of field."

- **A native `<select>` cannot draw an icon inside an `<option>`**, and twenty-six field types as
  bare words is a wall. So the type picker is a button showing the current choice, a list of
  buttons under it, and a **hidden input carrying the value** — the dialog still submits as one
  FormData rather than needing a reader of its own. `WB_FIELD_TYPES` already had `icon`, `color`
  and `desc` per type; none of that was new, it was just never shown here.
- **Open state is on `state.wbQuick.open`, not in the DOM.** The record page redraws for reasons of
  its own, and a list that shut on every repaint could not be used.
- **Where it goes became two questions.** The old control was one list of every combination —
  "Before Name", "After Name", "Before Trade", "After Trade" — so an app with twenty fields
  offered forty lines to read to make one choice. Now: Before / After / At the end as three
  buttons, then which field as a second picker, each row wearing its own type's icon so Address
  reads apart from Adjuster at a glance. `position` is **composed** from the two rather than
  chosen, so `insertFieldAt` still takes the one string it always did and its tests did not move.
- **It opens on After the last field**, which is where a new field goes unless somebody says
  otherwise — said in the words the dialog asks in rather than a separate "end".
- **One `data-wb-quick-set="key|value"` attribute for every control**, through one handler. The
  record page binds these once for the module's life, so each new pair would otherwise be another
  branch there reachable only from markup written in the module. The dead `change` listener for
  the old `<select>` was removed with it.
- **A field here has ONE name.** The request asked for a field name *and* a label; the App Builder
  field is `{ id, type, label, required, config }` and every surface — the table header, the record
  page, formulas, the move-mapping that matches by name — reads `label`. A second box would be
  stored and read by nothing, which is the same "looks configured and is not" this dialog already
  refuses for a dropdown with no options. One input, called Field name.

- **The dialog then ate what you typed.** "I typed a name in the name field, but when I make
  changes in the other option it clears the text box." Every picker press redraws, the dialog is
  drawn from `state.wbQuick`, and a plain input does not reach that state until Save — so the
  redraw put back the empty string it started with. The record page now reads the form BEFORE the
  redraw and hands the values over; `keepTyped` puts back only the boxes (`label`, `options`,
  `currency`, `unit`, and the call/SMS text), never `type`, `target` or the composed `position` —
  those are what the press is changing, and putting them back would undo it.
- **The old test for this passed the whole time.** It wrote the name into state itself and then
  changed the type, so it proved the redraw kept a value the product never put there. It goes
  through the real path now, and the end-to-end one stubs `FormData` to hand over what is in the
  boxes — both halves were removed in turn to watch them fail.

- **`invalid input syntax for type uuid: "ws-42959c90-…"`** — saving a scheduled call. The App
  Builder keys its workspaces as **`ws-<uuid>`**, and that uuid IS the row in `public.workspaces`
  (`builder-core.js` builds the same key from the other direction). Every write was sending the
  BUILDER key into a `uuid` column — which is two bugs at once, because that column is also what
  `app_private.has_workspace_permission` is handed to decide whether the row may be written.
- **Three sites, one convention.** `opsWorkspaceId()` now lives in `builder-core.js` — a leaf
  module with no imports, and already the place that knows the `ws-` convention. The scheduled
  call/SMS insert, the Calls & messages card that reads them back, and **`wb_intake_links`**, which
  had the identical bug and had therefore never once created a link, all go through it.
- **The schema was right; the writer was wrong.** No migration. Confirmed against production:
  `wb_record_events`, `wb_intake_links` and `wb_intake_submissions` all hold **0 rows**, which is
  the diagnosis — every insert had been failing — and means there is nothing to clean up.
- **A legacy document keys the company** (`ws-<companyId>`), which has no workspace row behind it.
  `opsWorkspaceId` returns `''` rather than a company id dressed as a workspace, and the dialog
  refuses in words instead of handing Postgres a value it can only reject.
- **The fixtures are why this shipped.** The harness used `ws-1` as a workspace id, so nothing in
  3,900 tests could notice a uuid column rejecting the key. They use a real `ws-<uuid>` now, and
  both the write and the read are pinned and were mutation-checked.

## 2026-08-19 Quick Create writes back to the record's Activity card

"Added: Quick Create also has an activity log on the activity card."

- **Everything Quick Create makes lives somewhere else** — a field on the app, a row in
  `wb_record_events`, a row in `public.tasks` — so the record it was all done FROM showed no sign
  of any of it. Four lines now, through the one `wbLogActivity`: the field added and its type, a
  scheduled call with the number and when, a scheduled message ("to 2 numbers" when it went to
  all of them), and the task with who it is for.
- **Every entry carries `itemId`**, because `recordFeed` selects on it. An entry without one is
  stored and invisible, which is the failure the tests are written against — they assert through
  `recordFeed`, the reader the card actually draws from, and dropping the id fails six of them.
- **Logged only once the thing is real.** A refused insert or a task the shared writer turned down
  leaves no line: saying it happened, for something that did not, is worse than saying nothing.
- **The entry bundle was already over, and the tolerance was hiding it.** Measuring the entry
  chunk properly — off `.vite/manifest.json`, the way `check-bundle-budget` does, not by globbing
  `index-*.js` — the session went **507 → 12 → 16 → −57** bytes. The last step was putting
  `opsWorkspaceId` in `builder-core.js`, which main.js imports STATICALLY, so a helper only three
  lazy modules call was riding in the chunk every session downloads. `check-bundle-budget` still
  said "passed" because −57 is inside `GZIP_ENVIRONMENT_TOLERANCE_BYTES`, which the budget note
  says is measurement noise and NOT spendable.
- **Paid for with an extraction, as the note asks.** `opsWorkspaceId` moved to its own
  `src/workspace/ops-workspace-id.js` (+32), and the New task modal —
  `openRecordTaskModal`, `renderRecordTaskModal`, `wbCreateTaskFromRecord` — moved out of main.js
  into `src/workspace/record-task.js`, reachable only from a record page. Headroom is **+147**
  bytes, a real number rather than one leaning on the tolerance, and it paid for the task's
  activity line as well.
- main.js keeps the loader and the two dispatch points. The modal is only ever reached after
  `openRecordTaskModal` has fetched the module, so the `questLoader` fallback is for the render
  that races the import, not for a modal nobody opened.

## 2026-08-19 A scheduled call on both calendars, and an alarm when its time comes

"Make the call reminder added on Quick Create also appear on the app calendar and on the contact
card calendar. It also alarms when the date and time comes."

- **One fetch, three readers.** `src/workspace/record-events.js` owns the rows: everything still
  scheduled for a company, which is a small set by definition. Per-surface fetches would be three
  queries saying nearly the same thing and three caches to disagree with each other.
- **The calendars read `state`, they do not fetch.** They draw during a render and cannot wait, so
  `heldEvents(state, companyId)` returns what has arrived and the heartbeat fills it. That is also
  what the entry budget could afford — see below.
- **The contact's calendar matches by RECORD, not by contact.** `wb_record_events` has no contact
  column and does not need one: the document already knows which records name a person, so a call
  on one of their records is one of theirs. A call on somebody else's record is not.
- **The alarm is a claim, not a read.** There is no server job, so whichever open session notices
  the moment has passed raises it — which means two tabs both notice. So noticing is an UPDATE
  setting `notified_at` only where it is still null; Postgres settles the race, and only the rows
  handed back are announced. Migration `20260819120000_wb_record_events_notified.sql`, applied.
- **It goes to whoever arranged it** (`created_by`), not the company. Everyone else being alarmed
  about a call they did not make is noise — and since noticing is a claim, the first of them to
  notice would have silenced it for the one person it was for.
- **Missed reminders are announced late rather than not at all.** Due means the moment has passed,
  so one that came and went while the app was shut goes off when it opens. Silence is not the
  honest answer to "you were supposed to ring them yesterday".
- **What it does NOT do: ring when nobody has the app open.** The heartbeat is a minute-resolution
  `setInterval` in a browser tab. A real background alarm needs a scheduled job on the server —
  pg_cron writing the notification rows — and that is the next step, not this one.
- **Entry budget, again, and this is the third time in one session.** Two ctx keys to pass a reader
  down to the two calendars cost more than the whole feature was worth: **−39**, then **−50**.
  Reading `state` directly instead (one `state,` on the app-views ctx, which the contacts page
  already had) brought it to **+18**. Measure the entry off `.vite/manifest.json`, never by
  globbing `index-*.js`.

## 2026-08-19 An image field on a document is a picture, not a filename

"When the user wants to use the image field on the form builder, do not import or display it as
text, make it imported as an image."

- `plainFieldText` printed `roof.jpg` for an Image field. That is the right answer for a list of
  attachments and the wrong one for the field somebody drags onto a proposal to show the house on.
  A new pure `fieldImageUrl(field, raw)` in `host-values.js` resolves the picture instead, through
  every shape the file field has ever written: an object, an array of them, a JSON string of
  either, or a bare URL.
- **A signed link is judged on its path.** Every Supabase URL ends in something like
  `...&token=eyJ.hbG.ci0`, so reading the extension off the whole string finds `.ci0` and decides
  nothing is ever a picture. The query and the fragment are cut first.
- **An Image field is a picture slot even when empty** — it ghosts as one so a proposal can be laid
  out against a record that has nothing on it yet. A **File** field is not: it usually holds a
  signed scope or a workbook, and only draws as a picture when what it is holding actually is one.
  A PDF on a file field still prints its name, which is all a page can say about a document.
- Drawn as a picture in all three renderers from one function: the page, the PDF and the exported
  PNG. The PDF took no new branch — `drawItem` keys on `kind`, so the field is handed over AS an
  image element and the writer does the rest.
- **CORS, which is what would have broken the export.** A record's image field holds a link to the
  bucket, not the bytes; reading a cross-origin picture back off a canvas taints it, and the taint
  throws at `toDataURL`/`toBlob`. Both loaders now ask for CORS up front, and both read-backs are
  wrapped — one picture that will not convert must not take the whole PDF with it.
- Placed picture-shaped (60x45mm) rather than in the 70x8 strip a line of text gets, and the
  inspector drops Size/Bold/Colour over an image, which were three controls that did nothing.

### Save, on the same pass

- **The name typed in the builder was being thrown away.** The document has a name box in the
  builder and another on the field panel behind it, and the panel's is what gets stored — so
  `wbCollectModalDraft` collected straight over a rename made in the box that is actually on
  screen. The builder's wins now, by being written into the panel's box before it is read back.
- **Save says so on the button**, not only in the status line at the foot of a full-screen modal,
  which is easy to press Save and never see -- and which sent people to the Versions panel to save
  it "properly".

## 2026-08-19 A photo is made to fit instead of being refused

- "lets change the 5mb limit on uploading images and files, lets make it max is 100mb, so if exceeds 100mb it will compress to make it below 100mb."
- **The cap moved from 5 MB to 100 MB, and stopped being a storage limit.** A phone camera produces 8-15 MB a shot, so 5 MB was refusing ordinary photos of a roof. A still photo is now re-encoded before anything is uploaded — `src/media/shrink-image.js`, fetched on demand — so what reaches the bucket is a few megabytes whatever the camera did. `image`, `workspaceicon` and `avatarimage` share one `DECODE_GUARD` constant, because all three re-encode and the number means the same thing in each: past this the browser is likelier to die decoding than to produce a picture.
- **A photo is judged as a photo whatever field it was dropped on.** A File field used the `document` policy, so a 30 MB photo attached to one was refused for being a document.
- The shrinker scales the longest edge to 2560px FIRST — pixels are what the file is made of, and dropping quality on an 8000px photo to hit a budget gives a large soft image where a smaller sharp one was wanted — then walks six WebP/JPEG rungs and stops at the first that fits 8 MB. A file already inside the budget is returned as the same object: re-encoding something small enough spends quality for nothing and renames a file nobody asked to rename.
- **A GIF is never re-encoded**: drawing an animated one to a canvas returns its first frame, so it stays bound by the cap rather than being silently flattened.
- **Only still photos can be made to fit, and that is the honest limit of the request.** A video cannot be transcoded in a browser without shipping a codec; a PDF, an Office file or a zip is already compressed and re-zipping it saves nothing. Those stand or fall on their cap.
- **The server is the smaller number, and it is 25 MB.** Live `storage.buckets` show `quest-job-files`, `quest-message-attachments`, `quest-client-portal-documents` and `quest-finance-attachments` at **26214400** (not the 52428800 the original migration set), `quest-form-response-files` at 15 MB and `avatars` at 2 MB. Nothing over 25 MB reaches storage today whatever the client allows — which the shrinker makes moot for photos and leaves standing for documents. **Raising it needs a migration and a check that the project plan allows the larger body.**
- **No bucket allows a video MIME type at all** — every one of them lists pdf/png/jpeg/webp/gif/txt/csv/office/zip. The `media` upload policy accepts mp4, webm, mov and m4v at 50 MB, so a video attached to a comment passes every client check and is refused by storage. Found while reading the live bucket rows; not fixed here.
- `tests/shrink-image.test.mjs` runs the ladder under a stub canvas rather than reading it — 13 cases, **confirmed by mutation**: removing the early-exit rung, dropping the downscale, removing the already-small short-circuit, treating a GIF as a still, importing the module statically, and putting the 5 MB cap back each fail their own case.
- **The entry bundle is at 2 bytes of headroom** (364,542 of 364,544). The shrinker itself is a separate chunk; what costs is the few lines in `main.js` that reach it. The next change of any size needs a slice extracted first — this is the point the budget comments have been warning about.

## 2026-08-18 Quick Create: Task, New Field, Call, SMS

- All four tiles are on the card and all four do something. The card draws every entry the model does not mark `soon`, so declaring one is what makes it appear.
- **New Field** adds a field to the app and says where it goes: a type from the palette in the palette's own order, a name, and `Before <field>` / `After <field>` / `At the end` built from the app's own field order. `insertFieldAt` is pure and tested, including the case that goes wrong quietly — a position naming a field that has since been deleted. `findIndex` returns −1 and `splice(-1)` inserts BEFORE the last item, so the careless version drops the new field second-to-last instead of at the end; a mutation removing that guard fails two tests. The field is placed in the record layout as well as made, or it would be invisible on the page with nothing to say why.
- **Call** is two halves. *Call now* renders one button per number the record actually holds, each carrying `data-wb-call` — the record page's existing confirm-then-log-then-dial path, reused rather than a second dialler that would skip the logging. *Later* takes a title, a date and time, and notes.
- **SMS** finds the phone fields that have a number in them, offers a dropdown only when there is more than one, and takes a message and a time. **There is no Send button**, and a test refuses one: contact SMS is fail-closed and the workspace routing contract is not implemented, so Send would do nothing in production.
- Both write to `wb_record_events`. **The migration is not applied yet**, so a scheduled call or message currently fails — and it fails LOUDLY: the database's own message is put in the dialog rather than swallowed, because a silent failure here looks exactly like a save that worked. A test pins that.
- A hidden phone field is not offered, and a phone field this record left blank is not a number to ring.
- Entry headroom is **2 bytes**. The `renderTaskForm` extraction bought 194 and the dialogs' ctx keys spent them. Still under the ceiling rather than on the tolerance, but the next change needs another extraction.
- Not built yet: the activity card that reads `wb_record_events` back onto the record as a Customize-able block.

## 2026-08-19 A Form field can start from a template instead of a blank page

"On the setup of form field, I can set up a default form that they will use when they use this
field, or start from blank."

- `src/form/doc-templates.js` (pure, 13 tests): **Proposal, Invoice, Work order, Letter**. A
  template is not a special kind of document -- it BUILDS an ordinary one, which is then dragged
  around and rewritten like any other. Nothing is locked, and Undo takes a template back.
- **The slots fill themselves in from the app.** A template cannot know an app's field ids, so it
  says what it WANTS -- a client, a date, a total -- and the app's own fields are matched at the
  moment it is used, three rules deep: a label match wins (an app with four text fields has
  exactly one called "Client"); then type priority in the template's order, not the order the app
  declared its fields in (an address wants a Location field before any old text box); and never a
  field already used, because the same words printed twice reads as a broken template. An app
  with nothing to bind still gets the whole layout, in words -- which is what makes these safe to
  offer on any app at all.
- **Where it is offered, and why not on the panel.** The picker is in the builder's rail: up front
  while the page is empty, behind a toggle once there is something to replace. The setup panel
  names the four templates under its button and sends you there. That is not the shape it would
  have had with room to spare -- a picker on the panel itself needs a click handler in main.js,
  and the entry bundle is at **0 bytes** of headroom, so this had to land entirely in the lazy
  chunk. The builder's own rail was the only place it could go without a raise.
- The blank page is deliberately not a button: it is what is already on screen.

## 2026-08-18 Scheduled calls and messages are live, and show on the record

- **`wb_record_events` is applied** to rqundirizvojpzhljtdn, so Call and SMS actually save. Verified rollback-only and left no rows: `anon` cannot read it, a `kind` outside call/sms is refused, and a row cannot claim a `completed_at` while it is still `scheduled`.
- **A "Calls & messages" card** reads them back onto the record — a block type like any other, so Customize can move, resize or remove it. It is added to the layout the first time something is scheduled, so what was just saved is visible without going to Customize to find out where it went; adding it again is a no-op, and a card taken off deliberately is not put back by the next save.
- **The rows are cached per record, not per render.** `undefined` means never asked and an array — even an empty one — means the answer is in, so a record with nothing scheduled does not re-fetch on every keystroke in the field beside it. A save drops that record's cache and only that record's, so the new row appears without reloading anything else.
- A failed read caches empty rather than retrying for ever: the card says nothing is there, which is wrong but quiet, and the next Quick Create refreshes it.
- **`ti-phone-calling` is not in the generated icon subset**, and the subset test catches exactly that — an icon referenced in source but absent from the font renders as a blank square. Swapped for `ti-calendar-event`, which is in it, rather than regenerating five font files for one glyph.
- `WB_FIELD_ORDER` came back out of the record-page ctx: the fallback already written in quick-create.js is the `WB_FIELD_TYPES` declaration order, which is that same order in practice, so the key bought nothing and the entry bundle had no room for it. Headroom is **11 bytes**, under the ceiling rather than on the tolerance.

## 2026-08-19 A placed field printed an id, and printed its own name back at you

Two reports on the same element: "why does it display an ID and not the name of the field", and
"when I'm importing data like Name, do not include the label on the data, like Name : data, just
the data."

- **`cc-91dffeeb-0787-49a8-...` on a proposal.** A `company_contact` value is an id from the
  COMPANY'S contact directory, and the document's `recordTitle` resolver only ever searched the
  host app's own items -- so the lookup missed and the raw id was printed. `plainFieldText` now
  takes a `contactName` helper and tries it first, falling back to `recordTitle` and then to the
  id itself, because a broken link is worth seeing and a blank line on a proposal is not.
- The directory is company-wide and is not part of the workspace document, so `contactNamer` reads
  it off `state.companyContacts`. `state` was already handed to the form path; the row and
  record-page path did not have it, and now does.
- **`withLabel` defaults to OFF.** A placed field prints "Acme Roofing", not "Client: Acme
  Roofing": a document says what it says in its own words, and whoever wanted a heading has
  already typed one above the box. The checkbox stays for the cases that read better with it, and
  a document that had explicitly stored `true` keeps its labels -- the flip changes what is
  placed next, never what somebody already laid out. Four assertions in `doc-model.test.mjs` were
  re-pointed to test the default from the other direction rather than deleted.
- **Paid for.** Handing `state` to the second entry point put the entry chunk 11 bytes over the
  real ceiling -- passing only on the 64-byte gzip-environment tolerance, which is there to
  absorb a zlib version difference and not to be spent as budget. The two openers named their
  contexts twice; they share one `wbDocEditorCtx()` now, which is a simplification worth having
  anyway and leaves **11 bytes** of honest headroom.

## 2026-08-18 New Field stops making fields that cannot work

- The tile made a field of any of the thirty types, with no config. Two ways that arrived broken, and both look configured:
- **Five types are no longer offered.** `calculation` needs a formula, `rollup` and `relationship` need another app to point at, `button` needs a destination in a workspace this dialog has no picker for, and a sourced `progress` needs a checklist to fill from. Made from here they render — a warning triangle, an empty picker — and can never hold a value. They are still made the way they always were, in the app's own field editor, which can ask for those things.
- **A choice field is refused without options.** A category with no options renders an empty dropdown on every record in the app for ever; the app-bundle test has said so since those bundles were written. Options are typed one per line, trimmed, de-duplicated case-insensitively — two options with the same label give two things nothing can tell apart, and a formula or button naming one by label would silently take the first — and coloured from a fixed palette by position, because picking eight colours is not what somebody opening this dialog came to do.
- Money asks for a currency (defaulting to `$` rather than blank), a number for an optional unit, a checklist for its steps. Everything else asks for nothing, so the dialog stays two fields for the common case.
- **Changing the type redraws the dialog and keeps the name already typed.** What a field needs depends on what it is, and asking for all of it at once is a form nobody reads.
- Confirmed by mutation: removing the options guard fails two tests. Entry headroom **17 bytes**.

## 2026-08-19 Crop a picture, fill a shape with one, and four colours you can name

"Add an option so I can crop the image; in shape, an option to fill it with colour or image;
preset colours, primary and secondary with black and white, for text and shape; and the image can
be imported or imported from the current record with an image field."

- **Crop is stored as FRACTIONS of the source** (`{x,y,w,h}`, whole picture = `0,0,1,1`), not as
  pixels -- so it survives the file being re-uploaded at another size, and the same four numbers
  mean the same thing on screen, in the PDF and in the exported PNG. There is no separate
  "cropped" flag to fall out of step with them; `isCropped()` reads the numbers.
- **One composition, three renderers.** `fitRect(fit, srcW, srcH, boxW, boxH)` places the source
  in the UNCROPPED area and the crop then windows it. On screen that is an oversized `<img>`
  behind `overflow: hidden`; in both exports it is the same arithmetic on a canvas. A preview
  that printed differently would be worse than no crop at all.
- **The crop is baked into the bytes**, which is why `doc-pdf.js` did not change at all: the
  cropped, shape-clipped picture is rasterised by `toJpeg` and the writer still just draws an
  image. A shape's picture is trimmed to its own outline on that canvas -- JPEG has no
  transparency, so an oval's corners come out WHITE, which on printed paper is the one place that
  is not a compromise.
- **A shape keeps its colour underneath the picture**, so a shape whose file has not loaded, or
  whose record field is empty, is still a shape rather than a hole. Both routes in are offered --
  a file to upload (`src`) and the record's own image field (`from`, read live) -- and "Remove the
  picture" clears both, because either could have been the one showing.
- **Four named presets before the colour wheel**, on every colour control there is. Primary and
  secondary are read from the app's own theme (`--accent`, `--ink-2`) so a re-themed company gets
  ITS colours; black and white are constants because they are what text and paper are. A custom
  property holding `color-mix()` or a colour name falls back rather than reaching a document that
  has to print it.
- 12 new cases in `doc-editor-boots.test.mjs` and 4 in `doc-model.test.mjs`. `npm run build:icons`
  was re-run for `ti-crop`.

**Entry bundle: 54 bytes OVER the ceiling at HEAD**, passing only on the 64-byte gzip-environment
tolerance. Nothing in this change touched main.js -- all of it is in the lazy doc-editor chunk --
so the overrun arrived with the commits that landed alongside it. The next change to main.js of
any size needs an extraction first.

## 2026-08-19 The basic geometry: polygons to ten sides, a circle, a trapezoid

"Add different types of shapes: the polygons 1-10, a circle, a trapezoid -- the basic geometrical
shapes."

- **Fifteen shapes, one drawing problem.** Everything with straight edges is a path through some
  corners, so each shape names its corners in `shapePoints(shape, sides)` and the three renderers
  all walk the same list: `clip-path: polygon()` on the page, a `m`/`l`/`h` path in the PDF, and
  `moveTo`/`lineTo` on the export canvas. A decagon costs the PDF writer nothing a triangle did
  not already cost.
- **A regular polygon is generated, not tabulated** -- one `polygon` kind with a `sides` number,
  so 3 to 10 is a slider rather than eight more entries. Inscribed in the box rather than kept
  regular, so a hexagon stretched into a wide box becomes a wide hexagon, which is what dragging
  a corner in a drawing tool has always meant. First corner at the top, so a triangle points up.
- **A circle is an ellipse in a square box**, which is what a circle IS. Giving it its own kind
  would be a second name for one shape and a second thing to keep in step -- so the palette
  button, and switching an existing shape to it, square the BOX instead.
- **The palette buttons are the shapes, drawn.** An icon font was the obvious thing and was the
  wrong thing: Tabler has no heptagon, nonagon, decagon or trapezoid, so four of them would have
  had to borrow a glyph that means something else. A 20x20 inline SVG from the same corner list
  costs nothing, adds no icon names for the four alternative packs to have to cover, and makes
  the button a picture of exactly what it puts on the page.
- A clipped shape takes its outline as a slightly larger copy of itself behind the fill: a CSS
  border on a `clip-path` element is cut in half by the clip, so it comes out the wrong width and
  open at the corners.
- 6 cases in `doc-model.test.mjs` and 10 in `doc-editor-boots.test.mjs`, including a pentagon and
  a decagon counted corner by corner in the real PDF output.

**Fill / Fit / Stretch did nothing on a record field**, reported the same day. `normalizeElement`
gave `fit` and `crop` only to image and shape elements, so on a field the button wrote the value
and normalising threw it straight back away -- a silent failure of the worst shape, where nothing
anywhere says no. Every kind that can DRAW a picture carries them now (image, shape, field) and a
kind that cannot still carries neither, so a text box does not grow two properties that mean
nothing to it. The regression test walks all three kinds rather than the one that was reported.

**And Stretch rendered as Fit.** `object-fit: stretch` is not a CSS value -- the keyword is
`fill` -- and an invalid value is DROPPED rather than falling back to the default, so the
stylesheet's own `.fd-img { object-fit: contain }` stayed in charge and the button did nothing
visible. The model keeps `stretch` as its word, because "Fill" is already the name of a shape's
colour, and `objectFitFor()` translates. The test asserts every member of `IMAGE_FITS` maps to a
keyword CSS actually has, so the next value added cannot repeat it. The canvas exports never had
the bug -- `fitRect` handles the model's own word -- and are now pinned so the two cannot drift.

## 2026-08-19 A photo on a record is something you can look at

- **The Image field opens a viewer.** Tapping any photo — in a table cell, on a card, on the
  record page, or on a thumbnail inside the field editor — opens a full-size dialog with
  **Download**, **Open in new tab** and **Close**. Several photos step one at a time with an
  arrow on each side of the picture (wrapping both ways, with a `3 of 8` counter), or switch to
  **All photos**, a contact sheet that marks where you are and drops back to a single view on
  whichever one you pick. Arrow keys and Escape work; on a phone the picture itself advances on
  tap and the stage takes a horizontal swipe.
- **A record LIST no longer paints every photo.** A row draws ONE thumbnail and carries the
  count for the rest as a `+3` BADGE on that thumbnail's bottom-right corner (`.wb-img-more`,
  absolutely positioned inside `.wb-img-cell.has-more`). Eight photos in a cell pushed the
  columns beside it off the row and still drew each one too small to identify. The badge first
  shipped as a chip standing beside the photo, which was a second circle the same size — in a
  narrow column it wrapped underneath and read as the second photo it was standing in for; on
  the corner it costs no width at all. The count is the honest summary; the viewer behind it is
  where the photos are actually read. Only the record page and the record view modal show the
  whole set — they pass `detail: true` on the context object `wbFmtVal` already receives, and
  in that mode every tile is drawn so the badge never appears.
- The photos travel to the viewer by KEY, through a per-render registry (`WB_IMG_SETS`), not in
  the markup: a signed URL is 200-odd characters, and writing the whole gallery into every row —
  so the one photo it draws can still step through the rest — is a table nobody can scroll. The
  registry is emptied at the top of each render, which is the same moment the markup holding its
  keys is replaced. Each thumbnail also carries its own url as a fallback, so markup that
  outlives its render still opens the photo that was clicked.
- Every thumbnail is a `<button>`. That is what keeps the two clicks around it — the row click
  that opens the record, the cell click that opens the inline editor — from firing as well:
  both already skip anything interactive. It also means a filled photo cell had nothing left to
  click to EDIT it, so the record page adds a **Change** chip beside the photos.
- `src/workspace/image-lightbox.js` is fetched on the click that opens it and draws onto
  `<body>`, outside `render()`. Stepping through a gallery is one small change repeated, and
  routing every arrow press through a full repaint would rebuild the page to move one picture —
  and throw away a half-typed inline edit sitting behind it. It puts the keydown listener, the
  scroll lock and the focus back on close.
- **Paid for by extracting the uploader.** The entry chunk had **18 bytes** of headroom, so the
  File / Image drop zone, thumbnail list, progress bar and upload path moved out of `main.js`
  into `src/workspace/file-field.js` (`createFileField(ctx)`, fetched on demand and prefetched
  alongside `field-config-ui.js`, which draws the markup it binds). Nothing that paints before a
  field EDITOR is open needs any of it. Entry JavaScript went from 364,526 to **363,613** gzip
  bytes — 931 under the 364,544 ceiling, which was not raised.
- `tests/extracted-module-references.test.mjs` covers the new module the same way it covers every
  other factory: each of the 15 names its ctx destructures must be passed by `main.js`. That is
  the failure mode of an extraction like this, and it is now checked rather than hoped for.
- **A tall photo ran through the footer.** The stage centred with `display: grid`, whose auto row
  is sized BY the image — so the image's own `max-height: 100%` resolved against a height the
  image was deciding, the browser dropped the circular constraint, and a 900x1600 phone photo
  rendered at full natural size, 936px past the bottom of the dialog. Landscape shots hid it
  entirely: `max-width` resolves against a definite width, so they were caught by that instead
  and looked right. The stage centres with flex now, which has a definite cross size, and clips as
  a backstop. On a phone the arrows moved back beside the picture — putting them under it had laid
  both of them across the photo — and the stage's horizontal padding reserves their lane.
- Browser-verified against the dev server: the viewer opens on the clicked photo, steps and wraps
  both ways, the grid marks and returns to a chosen photo, keys and both Close buttons work, a
  single photo gets no arrows and no toggle, and the extracted uploader still binds real field
  markup, paints its thumbnails, opens the viewer from one, and removes one on its own. No
  console errors.

## 2026-08-19 A field setup travels between apps on its own

- "on the form fields on the setup, can you make it import and export so i can reuse other layout
  i have from other apps." The Fields tab gained **Export fields** (any role — it only reads) and
  **Import fields** (`workspaces.manage`), beside the tabs where Export / Import / Print already
  sit on Items.
- **Why this is not the whole-app Download that already existed.** That one builds a BRAND NEW
  app, so reusing one form's shape inside an app you are already standing in meant installing the
  whole thing — records, automations, layouts — and then deleting what you did not want. Export
  writes `<App>.questfields.json`: field definitions only, no records, no automations, no
  arrangement.
- **Import ADDS and can never replace.** The fields land after whatever the target already had,
  so pressing it on an app with records in it cannot empty a column. Clearing the old shape out
  first is the Fields tab's own bulk delete, which at least shows what it is about to destroy.
- The file is read and then **asked about**: a dialog lists what is in it with a tick box each,
  so importing eight of twelve does not mean importing twelve and deleting four. A **whole
  `.questapp.json` is accepted too** — somebody holding last month's backup should not have to
  install the app to reuse its five fields.
- **What arrives ticked is what this app is MISSING.** A field the target already has under the
  same name starts unticked and is marked "Already here" — a second Amount landing beside the
  Amount already holding values is not reuse, it is a mess to clean up. Matching is on LABEL,
  case- and space-insensitively, which is `presentIn` in `field-portability.js` and is the same
  rule (and the same first-wins tie-break) `matchedFields` already uses to decide what a
  relationship copies across.
- **The row still ticks, though.** Where the labels match but the TYPES do not — an Amount that is
  text here and money there — the chip says "Already here **as Text**", because the two are
  indistinguishable in a list and that difference is the entire reason somebody would want it
  anyway. Ticking it lands the numbered field (`Amount 2`); the existing field is never written
  over, so there is no destructive branch in this flow at all.
- **`src/workspace/field-portability.js`** is the pure half, beside `app-portability.js` which
  does the same job for a whole app. Three things happen on the way in, and all three are what
  stops an import being a copy-paste: every field gets a **fresh id**; a label the target already
  uses is **numbered** ("Amount 2") so an import cannot silently merge with a field that only
  happens to share a name; and references BETWEEN the imported fields are re-pointed at the new
  ids, with anything that no longer resolves dropped rather than carried.
- **`OWN_FIELD_REFS` in that module is the list of what those references are**, and is the
  reason the remap is not guesswork: `progress.source` (including the `link:<relField>:<field>`
  form, where only the NEAR half is reminted), `rollup.relField`, `button.set[].field` /
  `when[].field` / `fields[]` / `map[].from`, and `pull[].to` on both `relationship` and
  `company_contact`. Everything else in a config names another app — `targetApp`,
  `displayField`, `targetField`, `pull[].from`, `map[].to` — and is left alone, because
  reused inside the same account those still resolve.
- **A calculation formula names its inputs by LABEL, not by id**, which is the trap this had to
  handle: an imported Total whose `{Amount}` survived a rename would have started reading the
  TARGET app's Amount — a sum quietly taken over the wrong column. Renamed labels are rewritten
  into the formulas that came with them.
- **Where the code lives was a budget decision.** The whole flow — picker, parse, dialog, apply —
  went into `src/workspace/data-io.js`, which is already fetched on demand and prefetched when an
  app view renders; the dialog markup went into `builder-modal.js`, likewise dynamic. `main.js`
  gained two buttons, two binds, three one-line wrappers and the modal's three handlers. Entry
  JavaScript 363,613 -> **363,992** gzip bytes: 379 bytes for the feature, **552 under** the
  364,544 ceiling, which was not raised.
- `tests/field-import-export.test.mjs` (20 tests) covers the bundle shape, the reader (whole-app
  files, unknown types dropped and counted, every empty case), every reference class in
  `OWN_FIELD_REFS`, the formula rewrite, double-import, and the wiring — including that nothing
  in `data-io.js` reassigns `app.fields`, which is the "adds, never replaces" promise.

## 2026-08-19 A Form field's page layout travels to another app

- "in the fields FORM i want to export the layout I made there ... If I can export this, I can
  import it too to other App with Form Field." The document builder's rail gained a **Reuse this
  layout** group: **Export layout** (a `.questlayout.json` of the page) and **Import layout**.
- **Not the toolbar.** PDF and Image up there export the finished DOCUMENT; this is the design.
  The rail is the part of the editor about where a page comes from, which is where **Start from a
  template** already lives — and importing a layout is the same act as picking a template.
- **The whole difficulty is one word: `from`.** A field element stores no value, it stores the
  HOST record's field id, and an id means nothing in the app a layout is carried to. So an export
  writes down the **name behind every id it uses** (`fields` in the bundle, built from
  `layoutFieldRefs`), and `adoptLayout` looks those names up where it lands — label, ignoring
  case and space, the same rule and the same first-wins tie-break as everywhere else. An Address
  box laid out over there finds the Address here with nobody re-picking it.
- **A picture-filled `shape` carries `from` exactly as a `field` element does**, so it is
  collected too. Missing it is how a logo band would arrive pointing at an app it had never heard
  of.
- **An unmatched box is NOT dropped.** It keeps its place, size and styling and arrives unbound,
  which `previewText` already draws as a grey "Pick a field" — so the page comes in whole and the
  three boxes that need a decision are the three that look like they do. Dropping them would leave
  holes nobody could explain. The status bar names them: *"2 boxes printed a field this app has
  not got — Site address, Photo."*
- **Import replaces the page, and Undo covers it** — the same line `buildTemplate` draws.
  Merging two layouts would stack one page on another. The document's own name, its saved
  versions and any uploaded PDF beside the design stay put: a layout is the arrangement, not the
  history, and never the record's values.
- Matching runs against **`fields`, not `hostFields`** — `placeableFields` has already dropped
  Button and Form, and a name matching one of those would bind a box to something it cannot draw.
- `src/form/doc-portability.js` is pure and sits beside `doc-model.js`/`doc-templates.js`.
  `doc-editor.js` is already behind a dynamic import, so it is bundled into the
  `doc-editor` chunk and **not the entry**: entry JavaScript is unchanged at ~364,000 gzip bytes,
  544 under the ceiling. `tests/doc-layout-portability.test.mjs` covers 12 cases including the
  round trip through the real `normalizeDoc`.

## 2026-08-20 A pass over the workspace apps, and eight things it found

Reported from use: "some button field not working, some are hanging, lagging and freeze", "some
apps didnt detect phone number", "I deleted all the records so why is this stays here", "why is it
in a different card", and the Activity feed printing raw JSON. All of it is in this batch.

- **Call said "This record has no phone number" over a record showing one.** `phoneChoices`
  filtered on `!field.hidden`. Hidden is a TABLE setting -- the builder's own tooltip reads "still
  editable on each record", and the record page draws hidden fields like any other -- so an app
  that had tidied Phone out of its table lost the ability to ring anybody. Per-app, which is why it
  struck some and not others. A test asserted the old behaviour ("a hidden line is not offered");
  it is replaced with the reasoning. Keeping a number out of Call is a real thing to want, but it
  needs its own switch, not the one that tidies a column.
- **The Call dialog could stick on "Saving..." for ever.** The insert was awaited bare -- no
  try/catch, no timeout -- and `record-page.js` called `saveQuick` with no `.catch`. Any throw
  became an unhandled rejection with `busy: true` still on state: nothing repainted, Save stayed
  disabled, and pressing again hit the `if (v.busy) return 'idle'` guard. Now caught, bounded by
  `SAVE_TIMEOUT_MS` (20s), and cancelled in a `finally` -- a timer left running holds the event
  loop open, which showed up as a test file taking 20 seconds instead of 235ms.
- **And it was waiting on the wrong thing.** The call is durable the moment its `wb_record_events`
  row lands. `wbSave` writes the BUILDER DOCUMENT -- every app and every record in the company,
  `JSON.stringify`d synchronously into localStorage before it is uploaded -- and the dialog held
  "Saving..." over all of it for two lines of bookkeeping. It fires in the background now. New
  Field still awaits its own, because there the document write IS the durable save.
- **A push or move inside one company wrote that document TWICE**, once for the arrival and once
  for the removal. Prospect to Leads in one workspace is the ordinary case, so the ordinary case
  paid double -- and it handed the optimistic-revision check a collision to resolve against a write
  the same function had just made, which is how a press returns "could not be saved while others
  are editing" with nobody else editing. One write now, and because both halves ride in it the move
  became atomic rather than merely well-ordered. Across companies the old ordering stands.
- **Buttons were not slower by accident.** `wbSave` began returning a real promise on 2026-08-17
  (`8bbbd0b`); before that `await wbSave(...)` awaited `undefined` and a press returned while the
  write was in the air. The old speed was a record that had not been saved yet.
- **The app calendar offered date fields nothing had a date in.** `calendarSources` answers "what
  COULD carry a date", which is right for the setup banner and wrong for the picker: six date
  fields offered six ways to look at the calendar, five of them empty. `datedSources` is the
  subset a record has actually filled in. Nothing is hidden -- an empty field plots nothing either
  way -- and the two empty calendars now say different things, because telling somebody with six
  empty date fields to add a seventh is wrong twice over.
- **A scheduled call outlived the record it was scheduled on.** The row is in `wb_record_events`
  and the record is a fragment of a JSON document, so there is nothing for a foreign key to cascade
  from. The calendar drew those calls for ever with no name and a link to nowhere, and the ALARM
  still rang for them. `eventsForItems` existed for exactly this and had never been wired up. The
  liveness check defaults to "yes" and only suppresses when it can prove the record is gone: a
  document this session has not loaded is not evidence, and suppressing an alarm is destructive.
  The rows are hidden, not deleted -- cleanup belongs at permanent delete, since trashing is
  restorable.
- **Two components were both called `wb-pick`.** The Button field's "which fields travel" grid and
  the New Field icon dropdown. The later rule won, so a grid of checkboxes inherited
  `position: absolute; left: 0; right: 0` from a dropdown panel, tore itself out of the dialog and
  landed as a full-width card across the bottom of the window. The grid is `wb-carry` now.
  `tests/css-class-collisions.test.mjs` walks every `class="..."` in `src/` and holds them apart.
- **The Activity feed printed file changes as raw JSON, signed URLs and access tokens included.**
  `wbFileValue` could not read a list: an array is an object, so the object branch answered null,
  and a JSON array stored as a string fell past it to "a bare string is a filename" -- so the whole
  array came back AS the name. Fixed on both sides. What gets WRITTEN is now every file's name and
  no URL (`wbPlainVal` reads `wbFileValues`), and what gets READ is passed through a new pure
  `readableValue` -- because entries already in the feed keep the string they were logged with, and
  the feed is the history. The same blind spot made `wbFieldIsEmpty` treat a required Photos field
  holding three pictures as empty.
- **Activity is draggable.** It sat outside the scrollable track, so the drag module never saw it.
  It is a tile in the strip now with its own `WB_ACTIVITY_TILE` id; `wbApplyAppOrder` takes that id
  out of the reported order and keeps it as `workspace.activityAt`. Three things would each have
  broken it quietly: the workspace normaliser drops what it does not name, the no-op guard compared
  only the app order (dragging Activity leaves the apps identical), and the index needs clamping
  when an app is deleted after a drag.

**Still open, and deliberately not in this batch.** Every workspace edit rewrites the whole company
document, sync-`stringify`d into localStorage first, so cost scales with everything you own rather
than with what you changed. That is the root of the lag reports; halving the push helped and did not
fix it. Per-record storage -- or at minimum keeping media out of the document -- is its own piece of
work. Also open: `syncButtons` calls `.closest()` on `document`, which has no such method, so its
"only inside a modal or record page" guard silently never applies.

## Remaining controlled launch configuration

- Payments remain intentionally out of this change set.
- Keep the lifecycle migration and client deployed together. Live catalog checks and rollback-only probes verified old-client, current-client, archive, reject, Stripe cancel/reactivate, manual-terminal preservation, and exact Stripe-event replay protection.
- Workspace-safe SMS send, inbound routing, persistence, and table migration remain a later coordinated change. Do not enable SMS from provider credentials or a partial schema alone.
- Before public onboarding, run one invite to a designated team-owned mailbox to prove the configured Resend API key, verified sender/domain, and inbox delivery. The code, authorization, database delivery ledger, retry path, and manual fallback are live, but no existing teammate was emailed during this rollout.
- Supabase Auth registration, verification, and recovery email use a separate channel. Confirm custom SMTP and branded Auth templates in the Supabase dashboard before public launch.
- Complete the documented two-user pilot rehearsal with a company owner and newly invited worker before opening public registration.
- Owner-side launch decisions still include the bank/payment provider, final prices and limits, legal text, refund rules, and the public billing/support contacts.

## Freshness

Exact capture metadata is in [manifest.json](manifest.json). Refresh live metadata whenever the database, production deployment, main revision, or product-module status materially changes.
