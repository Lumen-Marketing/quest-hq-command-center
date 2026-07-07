# Workday Manager Visibility Design

## Purpose

Manager Visibility adds a manager-facing mode to the existing Workday page. Reps still use Workday as their daily action queue. Managers can switch to Manager View to see where the team needs help today: who is working records, who has overdue follow-ups, and which contacts, quotes, jobs, or form responses are at risk.

## User Experience

Workday gets a simple two-option control:

- `My Queue`: the current rep-focused Workday queue.
- `Manager View`: a team visibility screen.

Manager View shows three parts:

- `Team Pulse`: shift-level totals for calls, emails, notes, completed tasks, overdue tasks, records with no next step, and new form responses.
- `Rep Visibility`: one row per active workspace member, showing calls today, touches today, open tasks, overdue tasks, no-next-step records, last activity, and a status label.
- `Needs Attention`: a clickable list of risky items such as hot leads with no follow-up, overdue tasks, quotes untouched for several days, jobs with no next step, and unhandled form responses.

Clicking a rep opens a side panel for that rep's exact workload. Clicking an alert opens the related contact, quote, job, task, or form response. The screen should feel like a dispatch board, not a leaderboard.

## Data Rules

The first pass uses existing data only:

- `state.activities`
- `state.tasks`
- `state.contacts`
- `state.deals`
- `state.jobs`
- `state.formResponses`
- live workspace members from `companyMembers(companyId)`

No new Supabase tables are required for this pass. No destructive database work is allowed.

Manager numbers are derived in-browser from the current live workspace data. If a record has no owner or assignee, it appears under `Unassigned` so managers can clean it up.

## Visibility And Permissions

This feature lives inside the existing `workday` module and uses the existing `crm.view` permission. It does not add a private admin-only route. If later we need role-gated manager-only access, we can add `workday.manage` or a manager role check, but launch should keep this visible to owners/admins without creating new permission complexity.

## Alerts

Manager alerts are grouped by practical problem:

- `Overdue`: open task is past due.
- `No next step`: contact, quote, or job has no open follow-up task.
- `Untouched`: contact or quote has not had recent activity.
- `New response`: form response has not been turned into a CRM action.

Each alert includes the owner, reason, record type, record name, age, and an action button.

## Non Goals

- No gamified rep rankings.
- No payroll or time-clock calculations.
- No new database schema.
- No AI scoring.
- No manager-only settings page.

## Testing

Static tests must prove:

- Workday has a `My Queue | Manager View` mode control.
- `workdayRepVisibilityRows(companyId)` exists and derives rep rows.
- `workdayManagerAlertItems(companyId)` exists and derives manager alerts.
- Manager View renders Team Pulse, Rep Visibility, and Needs Attention sections.
- Manager alerts and rep rows have click actions.
- CSS includes responsive manager tables/cards.
- Production smoke still covers `/company/lumen/workday`.
