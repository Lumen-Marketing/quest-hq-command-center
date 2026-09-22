# Repo Governance — Prevention Layer

Working rule, effective 2026-09-22: **`main` is protected. Fixes go through named branches and PRs. Every task gets an owner.**

This is a prevention layer, not a slowdown — it exists so active fixes don't collide with or break production.

## Temporary stewardship

Alexia (alexiavalen304@gmail.com) temporarily owns repo governance as of 2026-09-22, until the repo is workable, cleaned up, and safe to hand off. This covers:
- Branch protection configuration
- Active work coordination (issue #15 and successors)
- Branch cleanup decisions (including the cleanup-candidate list below)
- PR flow and merge decisions on governance-related changes
- `CODEOWNERS` placeholder maintenance
- Ownership intake from the team

Permanent ownership will be assigned once the team confirms where they are currently assigned or where they'd like to be assigned. Until then, `CODEOWNERS` entries stay `TBD` and are not to be filled in from inference — only from an owner's explicit confirmation.

## Branch protection on `main` (active)
- Pull request required before merging (no direct pushes)
- 1 approving review required
- Required status check: `test-and-build` (from `.github/workflows/ci.yml`)
- Force pushes and branch deletion blocked
- Applies to admins too (`enforce_admins: true`) — no silent bypass

## Do-not-touch-yet boundaries
- No deleting unmerged branches without owner confirmation
- No major architecture refactors
- No bypassing CI
- No direct pushes to `main`
- No production environment variable changes
- No Supabase schema changes without a migration/checkpoint plan

## Branch status (as of 2026-09-22)

**Unmerged work — needs an owner + PR:**
| branch | owner | unique commits vs main |
|---|---|---|
| `feat/task-setup-back-button` | Lumen Marketing | 1 |
| `quest-hq-command-center-for-deployment` | abethecloser | 3 |
| `docs/code-review-d050fd9` | AsianDoesCodin | 1 (already open as PR #1) |

**Cleanup candidates — fully contained in `main`, pending owner sign-off before deletion (not deleted yet):**
`agent/ai-project-brain`, `agent/compact-underwriter-summary`, `agent/fix-deep-link-render-crash`, `agent/quest-navbar-redesign`, `agent/whats-next-all-views`, `codex/job-record-command-center`, `feat/modular-quest-landing`, `feat/ringcentral-calls`, `feat/sms-messaging`, `feat/task-app-absorption`, `feat/task-gantt-foundation`, `feature/dashboard-widgets-calendar-quickadd`, `fix/additional-command-center-hardening`, `fix/p0-release-hardening`, `fix/priority-findings-20260827`, `perf/optimization-pass-20260825`, `preview/deploy-integration-check`, `project-quest-hq-clone-for-demo`, `qa/release-17-25-aug`

## Ownership
`CODEOWNERS` exists at repo root as a placeholder — all paths marked TBD. Do not fill it in from git-log authorship guesses; update only once an owner explicitly confirms their area.
