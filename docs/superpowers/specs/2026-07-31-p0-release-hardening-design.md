# Questbase P0 Release Hardening - Batch 1

**Date:** 2026-07-31  
**Status:** Approved by the instruction to proceed with the release-readiness PDF  
**Source of truth:** `output/pdf/questbase-release-readiness-todo-list.pdf`

## Revalidation

This work applies to the Questbase product in the `quest-hq-command-center` repository. The repository name and some internal labels still use the historical Quest HQ name, while `.ai/context.md` defines the customer-facing product as Questbase.

The July 30 PDF was checked again against `origin/main` at `91796a5` and the live Supabase project:

- the workspace plugin catalog still does not declare whether each plugin's records are workspace-private, company-shared, or hybrid;
- the contact Messages tab still queries `sms_messages`, while production has no `sms_numbers` or `sms_messages` tables;
- the committed SMS migration and APIs still use the older company-only model;
- contact-to-quote still performs separate browser writes and creates a fresh quote on every click;
- an authenticated stale company URL is still allowed to disagree with the active company selected in browser state.

The standalone TaskManagement product is not part of this batch. Questbase's existing vendored Tasks integration remains in scope only at its Questbase boundary: tenant context, workspace access, and route handoff.

## Outcome

This first batch closes four concrete P0 gaps without pretending the complete release-readiness PDF is finished:

1. Gate SMS behind a real backend-readiness response so customers never see a broken composer.
2. Canonicalize stale company and workspace URLs before rendering tenant data.
3. Declare and display the data scope of every workspace plugin.
4. Replace contact-to-quote browser inserts with one authorized, idempotent database operation.

The remaining PDF work - the full workspace-aware SMS model, two-identity production exercises, eager-load reduction, monitoring, CRM repair review, and later P1/P2 work - stays open after this batch.

## SMS readiness gate

Add an authenticated `GET /api/sms-readiness?contact_id=...` endpoint. It returns a stable readiness object rather than throwing generic setup failures.

The endpoint is ready only when:

- the provider key exists;
- the user is an active company member;
- the contact has a workspace;
- the workspace-aware `sms_numbers` backend exists; and
- an active number is assigned to the contact's workspace.

The contact surface initially treats SMS as unavailable. It checks readiness only when a contact record is open, caches the result for that contact, and rerenders the Messages tab. A missing table, old company-only table, missing key, or missing workspace number produces a disabled setup state and never queries `sms_messages` or calls the send API.

This gate is deliberately compatible with the future workspace-scoped SMS migration. It does not enable the old company-only schema.

## Canonical tenant routes

Add a pure route resolver that receives the requested company/workspace and the user's allowed tenant context. It returns:

- the requested route when both identifiers are allowed;
- the first allowed company when the requested company is stale or inaccessible;
- that company's allowed/default workspace when the workspace is missing or inaccessible; and
- no route when the user has no company access.

The browser uses the resolver before rendering. URL, active company state, active workspace state, sidebar, and content therefore agree on one tenant. Query parameters unrelated to workspace selection are preserved.

## Plugin data-scope contract

Every plugin declares one of:

- `workspace-private`: records are isolated to the active workspace;
- `company-shared`: enabling the plugin controls navigation, but its records are shared across the company; or
- `hybrid`: the plugin contains both workspace-scoped and company-shared records.

The settings card displays the label and a short explanation. This is a truth-in-product contract, not a claim that every plugin is already workspace-private. The initial declarations follow the approved tenancy design and the current live schema.

## Atomic contact-to-quote handoff

Add an authenticated Postgres function that:

- verifies active workspace membership and CRM permission;
- locks and validates the source contact;
- reuses the same open handoff quote when the user repeats `Graduate to quote`;
- creates or reuses a compatible primary site;
- validates company/workspace consistency across contact, account, site, and quote links; and
- returns the complete saved quote.

The browser calls the RPC in live mode and keeps the existing local-only behavior for the read-only demo. A future explicit `Create another quote` action may request a new quote; the default graduation action remains idempotent.

No existing pilot records are automatically repaired in this batch.

## Release safety

- All behavior changes start with a failing test.
- Database work is additive and forward-only.
- New public database objects ship with explicit grants and RLS/authorization checks.
- The complete repository test, project-brain check, production build, deployment revision check, and production smoke test must pass before the batch is called complete.

