# Job Record Command Center Design

## Brief

Bring Lumen Command Center Jobs up to the same record-detail standard as Contacts. The standalone contact record is the visual and interaction reference, and the existing Lumen app remains the design system.

## Scope

- Keep Jobs table and board views as the entry point.
- Replace the old Jobs `profile` panel with a Salesforce-style job record page.
- Reuse the existing `.sf-record` visual language already used by contact records.
- Keep all data local-first with existing Supabase write paths where practical.
- Do not redesign navigation, CRM, Contacts, Deals, Files, Forms, or Finance.

## Record Layout

The job record page opens when a user clicks a job or visits `/company/:companyId/jobs?tab=profile&job_id=:id`.

The page includes:

- Object tabs: Home, All Jobs, selected job.
- Record header: job icon, object label, job name, actions.
- Stage path: existing customizable job stages with current/done/future states.
- Guidance block: stage-specific production guidance.
- Three-column record body:
  - Details: client, contact, address, type, owner, priority.
  - Activity: note composer and unified activity feed for `related_type = job`.
  - Actions: quick create tiles, linked workspace buttons, open tasks.

## Behavior

- Clicking a stage updates the job stage and logs a stage-change activity.
- Mark current stage moves the job to the next stage.
- Header/quick actions support adding a task, logging a note/call, opening files/forms/analytics, and editing.
- Job fields use inline edits for lightweight updates.
- Existing edit modal remains available for full edits.
- Job list and board cards route to the record view.

## Verification

- Add a Node built-in test that statically verifies the job record renderer, stage actions, activity composer, quick actions, and job inline edit hooks exist.
- Run the new test before implementation to verify it fails.
- Run `npm run build`.
- Run a Playwright browser check against the local Vite app for the job record route on desktop and mobile.
