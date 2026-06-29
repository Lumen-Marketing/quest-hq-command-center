# Quest HQ Build Prompt

Build an all-in-one operations platform called **Quest HQ**.

## Existing TaskManagement Repo

https://github.com/ShanIngrid1207/TaskManagementQuest/tree/main

The existing repo already contains the TaskManagement system. Review it first before building.

Do **not** recreate task lists, task filters, kanban, timeline, clock-in/out, notifications, user roles, team hierarchy, or approvals that already exist in the repo.

Instead, build Quest HQ around the existing TaskManagement app as the **Work Execution** module.

## Goal

Create a monday.com-style all-in-one app for managing:

- Jobs
- Clients
- CRM
- Forms
- Surveys
- Tickets
- Files
- Finance
- Knowledge Base
- Automations
- Dashboards
- Admin tools

## Core Architecture

Quest HQ:

- Command Center
- Jobs
- Existing TaskManagement
- CRM
- Forms & Surveys
- Tickets
- Files
- Finance
- Knowledge Base
- Automations
- Dashboards
- Admin

## Important Integration Rule

A **Job** is the parent/container.

A **Task** belongs to a Job.

Use this relationship:

```text
job.id → task.project_id
```

## Job Center Responsibilities

Job Center should manage job-level information only:

- Client
- Site / property
- Scope
- Job stage
- Job owner
- Files
- Photos
- Estimates
- Invoices
- Related tasks
- Related time
- Activity timeline

## TaskManagement Responsibilities

TaskManagement should continue to manage:

- Tasks
- Assignees
- Priorities
- Statuses
- Kanban/table/timeline views
- Clock-in/out
- Time entries
- Notifications
- Roles
- Team hierarchy
- User approvals

## Build Direction

Build the new system so each module can work independently now, but connect to TaskManagement later through shared IDs, routes, and database relationships.

Use simple, clean UI.

Avoid rebuilding existing task features.

Focus on business objects and workflows around the tasks.
