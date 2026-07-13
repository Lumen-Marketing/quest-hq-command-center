# Production Guardian Design

## Objective

Continuously verify the deployed Quest HQ production application without relying on a person to remember or run checks. The guardian must detect a broken or stale deployment, preserve a durable incident record in GitHub, and close that record automatically after production recovers.

## Selected approach

Add a dedicated GitHub Actions workflow that runs every six hours and can also be triggered manually. It checks out `main`, installs the locked dependencies, captures the checked-out commit SHA, and runs the existing production smoke suite against the canonical Vercel production domain. This reuses the already-tested 36-route application-shell and asset checks rather than creating a second monitoring implementation.

Two alternatives were considered:

- An in-app health screen would be visible but could report healthy while the application itself was unavailable.
- A new server-side health endpoint could inspect more services, but it would add a public production surface and require privileged database configuration.

The GitHub workflow is the safest first update because it is external to the application, needs no new secret, and detects both route failures and a deployment that does not contain the current `main` commit.

## Workflow behavior

- Run at minute 17 every six hours to avoid common top-of-hour scheduling congestion.
- Support `workflow_dispatch` for an immediate operator check.
- Always check out `main`, even if a manual run is launched from another branch.
- Use Node.js 22 and `npm ci` to match the existing CI workflow.
- Run `npm run smoke:prod` against `https://quest-hq-command-center-gamma.vercel.app` with the checked-out SHA as `--expect-sha`.
- Allow the smoke step to complete with a captured outcome so incident tracking runs before the job is marked failed.
- On failure, create one GitHub issue titled `[Production Guardian] Quest HQ production smoke check failing`. If that issue already exists, reopen it when necessary and append a new run link instead of creating duplicates.
- On recovery, comment on and close the open guardian issue.
- End the workflow with a failing status when the smoke check failed, preserving normal GitHub notification and status behavior.

## Security and operational boundaries

- Grant only `contents: read` and `issues: write` to the workflow token.
- Do not read Supabase, Vercel, Stripe, or application secrets.
- Do not start a local server; the workflow checks only the directly deployed production URL.
- Use a single concurrency group without cancellation so a newer invocation cannot hide the result of a running production check.

## Verification

A static Node test will assert the schedule, manual trigger, least-privilege permissions, forced `main` checkout, production URL, commit verification, incident lifecycle, and final failure propagation. The full repository test and build check must pass before the branch is published.
