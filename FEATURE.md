# FEATURE.md

# Quest HQ Feature Checklist

## Related Repository

Existing TaskManagement app:

https://github.com/ShanIngrid1207/TaskManagementQuest/tree/main

This repo should be reused as the Work Execution module.

Do not duplicate existing TaskManagement features. Build Quest HQ as the all-in-one operations layer around it.

Quest HQ repository:

https://github.com/AsianDoesCodin/quest-hq-command-center

First presentation deployment:

https://asiandoescodin.github.io/quest-hq-command-center/

---

# Product Goal

Build **Quest HQ**, an all-in-one operations platform inspired by monday.com.

Quest HQ should connect jobs, clients, tasks, forms, surveys, files, finance, dashboards, automations, and admin tools into one system.

The existing TaskManagement app remains the work execution layer.

---

# Core Structure

- [x] Command Center
- [x] Jobs
- [x] Existing TaskManagement integration
- [x] CRM
- [x] Forms & Surveys
- [x] Tickets / Requests
- [x] Files / Documents
- [x] Finance
- [x] Knowledge Base
- [x] Automations
- [x] Dashboards
- [x] Admin

---

# 1. Command Center

Central home dashboard for the whole app.

## Features

- [x] Home dashboard
- [x] My Work summary
- [x] Recent Jobs
- [x] Recent Clients
- [x] Alerts
- [x] Activity Feed
- [x] Quick Actions
- [x] Company switcher
- [x] Navigation to all modules

## Quick Actions

- [x] Create Job
- [x] Create Lead
- [x] Create Form
- [x] Create Ticket
- [x] Open TaskManagement
- [x] Upload File

---

# 2. Jobs Module

Jobs are parent containers for work.

A job can contain tasks, files, forms, estimates, invoices, surveys, notes, and time records.

## Job List

- [x] View all jobs
- [x] Search jobs
- [x] Filter by company
- [x] Filter by job stage
- [x] Filter by job owner
- [x] Filter by client
- [x] Filter by date
- [x] Sort jobs
- [x] Job status badges

## Create Job

- [x] Job name
- [x] Company
- [x] Client
- [x] Contact person
- [x] Site / property address
- [x] Job type
- [x] Job stage
- [x] Priority
- [x] Owner / project manager
- [x] Scope summary
- [x] Estimated start date
- [x] Estimated end date
- [x] Notes

## Job Profile

- [x] Job overview
- [x] Client information
- [x] Site / property information
- [x] Scope
- [x] Job stage
- [x] Job owner
- [x] Related tasks
- [x] Related time
- [x] Files / photos
- [x] Forms / inspections
- [x] Estimates
- [x] Invoices
- [x] Activity timeline
- [x] Open in TaskManagement button

## TaskManagement Integration

- [x] Link job to tasks using `job.id -> task.project_id`
- [x] Show related tasks on Job Profile
- [x] Show task count
- [x] Show completed task count
- [x] Show overdue task count
- [x] Show related time entries
- [x] Button to open TaskManagement filtered by job
- [x] Button to return from TaskManagement to Job Profile

---

# 3. CRM Module

Manage leads, clients, contacts, and opportunities.

## Leads

- [x] Lead list
- [x] Create lead
- [x] Lead source
- [x] Lead status
- [x] Assigned sales rep
- [x] Follow-up date
- [x] Convert lead to client
- [x] Convert lead to job

## Clients

- [x] Client list
- [x] Client profile
- [x] Client contact info
- [x] Client company info
- [x] Related jobs
- [x] Related files
- [x] Related invoices
- [x] Communication notes

## Contacts

- [x] Contact list
- [x] Contact profile
- [x] Email
- [x] Phone
- [x] Role / relationship
- [x] Related client
- [x] Related jobs

## Pipeline

- [x] Lead pipeline
- [x] Opportunity stages
- [x] Deal value
- [x] Estimate status
- [x] Follow-up reminders

---

# 4. Forms & Surveys

Forms and surveys collect structured data.

## Form Builder

- [x] Create form
- [x] Edit form
- [x] Duplicate form
- [x] Delete form
- [x] Form title
- [x] Form description
- [x] Public form link
- [x] Internal-only form option

## Question Types

- [x] Short text
- [x] Long text
- [x] Multiple choice
- [x] Checkbox
- [x] Dropdown
- [x] Rating
- [x] Yes / No
- [x] Date
- [x] Number
- [x] File upload
- [x] Signature

## Form Responses

- [x] View responses
- [x] Search responses
- [x] Filter responses
- [x] Attach response to job
- [x] Attach response to client
- [x] Convert response to lead
- [x] Convert response to job
- [x] Convert response to task
- [x] Convert response to ticket

## Survey System

- [x] Customer satisfaction survey
- [x] Employee feedback survey
- [x] Job completion survey
- [x] Client approval form
- [x] Internal request form
- [x] Inspection form
- [x] Survey analytics
- [x] Average rating
- [x] Response count

## Inspection Checklists

- [x] Roof inspection checklist
- [x] Site visit checklist
- [x] Drafting QA checklist
- [x] Job completion checklist
- [x] Safety checklist
- [x] Final walkthrough checklist

---

# 5. Tickets / Requests

Tickets are incoming issues or requests.

## Ticket Features

- [x] Ticket list
- [x] Create ticket
- [x] Ticket type
- [x] Ticket status
- [x] Ticket priority
- [x] Requester
- [x] Assigned person
- [x] Related job
- [x] Related client
- [x] Internal notes
- [x] Attach files
- [x] Convert ticket to task
- [x] Convert ticket to job

## Ticket Types

- [x] Client request
- [x] Internal request
- [x] Admin request
- [x] IT issue
- [x] Repair request
- [x] Change request
- [x] Bug report
- [x] Payroll question

---

# 6. Files / Documents

Central file system connected to jobs, clients, tasks, tickets, and forms.

## Features

- [x] Upload files
- [x] Upload photos
- [x] File list
- [x] File preview
- [x] File tags
- [x] File categories
- [x] Attach file to job
- [x] Attach file to client
- [x] Attach file to task
- [x] Attach file to ticket
- [x] Attach file to form response

## File Categories

- [x] Job photos
- [x] Client documents
- [x] Permits
- [x] Contracts
- [x] Estimates
- [x] Invoices
- [x] Drawings
- [x] Drafting files
- [x] Marketing assets
- [x] Internal documents

---

# 7. Finance

Manage estimates, invoices, payments, and AR.

## Estimates

- [x] Estimate list
- [x] Create estimate
- [x] Estimate builder
- [x] Line items
- [x] Taxes / fees
- [x] Discounts
- [x] Attach estimate to job
- [x] Send estimate
- [x] Client approval status
- [x] Convert estimate to invoice

## Invoices

- [x] Invoice list
- [x] Create invoice
- [x] Attach invoice to job
- [x] Invoice status
- [x] Due date
- [x] Payment status
- [x] Overdue flag
- [x] Send invoice

## Payments / AR

- [x] Payment records
- [x] Accounts receivable dashboard
- [x] Overdue invoices
- [x] Revenue by company
- [x] Revenue by job
- [x] Job profitability

---

# 8. Knowledge Base

Internal SOP and documentation system.

## Features

- [x] Article list
- [x] Create article
- [x] Edit article
- [x] Categories
- [x] Search articles
- [x] Attach SOP to task
- [x] Attach SOP to job
- [x] Training materials
- [x] Templates

## Categories

- [x] Company SOPs
- [x] Roofing procedures
- [x] Drafting guidelines
- [x] Admin guides
- [x] Lumen Marketing processes
- [x] Training
- [x] FAQs

---

# 9. Automations

Automation builder for workflow rules.

## Automation Structure

- [x] Trigger
- [x] Condition
- [x] Action
- [x] Enable / disable automation
- [x] Automation log

## Triggers

- [x] New job created
- [x] Job stage changed
- [x] New form submitted
- [x] New survey submitted
- [x] Ticket created
- [x] Task completed
- [x] Due date reached
- [x] File uploaded
- [x] Invoice overdue
- [x] Estimate approved

## Conditions

- [x] Company is Roofing
- [x] Company is Drafting
- [x] Company is Lumen
- [x] Priority is urgent
- [x] Job stage is approved
- [x] Assigned user is empty
- [x] Invoice is overdue
- [x] Survey rating is low

## Actions

- [x] Create task
- [x] Create job
- [x] Create ticket
- [x] Assign user
- [x] Send notification
- [x] Send email
- [x] Move job stage
- [x] Request approval
- [x] Attach template
- [x] Add checklist

## Example Automations

- [x] When a new roofing job is created, create default inspection tasks
- [x] When an estimate is approved, create scheduling task
- [x] When a survey rating is low, create follow-up ticket
- [x] When a job is completed, send customer satisfaction survey
- [x] When invoice is overdue, notify admin
- [x] When all job tasks are done, move job to completed

---

# 10. Dashboards

Dashboards provide high-level visibility.

## Dashboard Types

- [x] Company overview
- [x] Job pipeline
- [x] My work
- [x] Team workload
- [x] Stuck jobs
- [x] Time by job
- [x] Finance / AR
- [x] Survey results
- [x] Tickets
- [x] Client activity

## Widgets

- [x] Active jobs
- [x] Completed jobs
- [x] Overdue tasks
- [x] Stuck tasks
- [x] Open tickets
- [x] New leads
- [x] Revenue
- [x] Outstanding invoices
- [x] Time tracked
- [x] Survey average score
- [x] Job stage breakdown
- [x] Workload by user

---

# 11. Admin

Admin controls the system.

## Users

- [x] User list
- [x] User profile
- [x] Roles
- [x] Permissions
- [x] Company access
- [x] Approval status

## Companies

- [x] Roofing
- [x] Drafting
- [x] Lumen
- [x] Add future companies

## Settings

- [x] Job types
- [x] Job stages
- [x] Lead statuses
- [x] Ticket statuses
- [x] Form templates
- [x] Survey templates
- [x] Estimate templates
- [x] Automation templates
- [x] Notification settings

---

# 12. Templates

Reusable templates across the platform.

## Template Types

- [x] Job templates
- [x] Task templates
- [x] Form templates
- [x] Survey templates
- [x] Inspection templates
- [x] Estimate templates
- [x] Email templates
- [x] SOP templates
- [x] Automation templates

## Example Job Templates

- [x] Roofing repair job
- [x] Roof replacement job
- [x] Drafting project
- [x] Lumen marketing project
- [x] Internal admin project

---

# Existing TaskManagement Features To Reuse

Do not rebuild these inside the new modules.

- [x] Existing task creation
- [x] Existing task assignment
- [x] Existing task statuses
- [x] Existing task priorities
- [x] Existing task filters
- [x] Existing table view
- [x] Existing kanban view
- [x] Existing timeline view
- [x] Existing clock-in/out
- [x] Existing time entries
- [x] Existing notifications
- [x] Existing roles
- [x] Existing user approvals
- [x] Existing team hierarchy
- [x] Existing company access

---

# Integration Rules

- [x] Job is the parent object
- [x] Task belongs to job using `task.project_id`
- [x] Client can have many jobs
- [x] Job can have many tasks
- [x] Job can have many files
- [x] Job can have many form responses
- [x] Job can have many estimates
- [x] Job can have many invoices
- [x] Ticket can become task
- [x] Form response can become lead
- [x] Form response can become job
- [x] Survey response can create follow-up ticket
- [x] Estimate approval can create tasks
- [x] Completed job can trigger survey

---

# Suggested MVP Build Order

## Phase 1: Foundation

- [x] App shell / sidebar
- [x] Command Center
- [x] Jobs module
- [x] Job Profile
- [x] Connect Job to existing TaskManagement
- [x] Related Tasks section
- [x] Open in TaskManagement button

## Phase 2: CRM + Forms

- [x] Leads
- [x] Clients
- [x] Contacts
- [x] Form Builder
- [x] Form Responses
- [x] Convert form response to lead/job/task

## Phase 3: Files + Surveys + Tickets

- [x] File uploads
- [x] Attach files to jobs
- [x] Customer surveys
- [x] Inspection checklists
- [x] Ticket system

## Phase 4: Finance + Templates

- [x] Estimates
- [x] Invoices
- [x] Payments
- [x] Job templates
- [x] Form templates
- [x] Inspection templates

## Phase 5: Automations + Dashboards

- [x] Automation builder
- [x] Job dashboards
- [x] Task dashboards
- [x] Time dashboards
- [x] Finance dashboards
- [x] Survey dashboards

---

# Production Delivery: GitHub + Vercel

Quest HQ will be hosted from a GitHub repository and deployed on Vercel.

Vercel is the target production deployment platform.

## GitHub Readiness

- [x] Create / connect GitHub repository
- [x] Commit Quest HQ source code
- [x] Keep build artifacts out of source control unless intentionally needed
- [x] Add GitHub Pages static `/docs` build target for first presentation
- [x] Enable GitHub Pages from `main` / `/docs`
- [x] Verify live GitHub Pages URL
- [x] Add README with local setup, scripts, and deployment notes
- [x] Document TaskManagement integration expectations
- [x] Document required environment variables
- [x] Add `.gitignore` for Node, Vite, logs, local env files, and generated artifacts
- [ ] Use clear branch / PR workflow for future features

## Vercel Readiness

- [ ] Configure Vercel project
- [x] Set framework preset to Vite
- [x] Set build command to `npm run build`
- [x] Set output directory to `dist`
- [ ] Add production environment variables
- [ ] Add preview environment variables
- [ ] Configure `VITE_TASK_MANAGEMENT_URL` for deployed environment
- [ ] Verify production build on Vercel
- [ ] Verify preview deployments on PRs
- [ ] Verify client-side routing and deep links
- [ ] Verify Job Profile return link from TaskManagement
- [ ] Verify TaskManagement filtered handoff URL in deployed environment

## Deployment Architecture

- [ ] Decide whether TaskManagement deploys as a separate Vercel project or as a routed sibling app
- [x] Preserve `job.id -> task.project_id` relationship across deployments
- [x] Avoid duplicating TaskManagement execution screens inside Quest HQ
- [x] Plan shared auth / session behavior between Quest HQ and TaskManagement
- [x] Plan shared database / Supabase environment strategy
- [ ] Add production-safe fallback when TaskManagement URL is not configured

---

# Main Principle

Build around the existing TaskManagement app.

Do not duplicate task execution features.

Quest HQ should become the all-in-one business operations layer around the existing work execution system.
