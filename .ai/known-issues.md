# Known issues and risks

Only confirmed, actionable items belong here.

## Main browser bundle remains large

Vite still emits a large-chunk advisory for the primary application bundle. The repository bundle-budget check passes, and Leaflet/PDF.js are lazy-loaded, but src/main.js remains a performance and maintainability risk. Measure production behavior before splitting and retain the budget guard.

## Browser code and styling are monolithic

Most product behavior is concentrated in src/main.js and most styling in src/styles.css. Broad edits can create cross-module regressions, so use focused changes and full checks until module boundaries are deliberately extracted.

## Migration identifiers differ between repository and live ledger

Supabase records provider-generated applied versions, so the repository filenames `202607211200_company_operational_workspaces.sql` and `202607211230_workspace_tenancy_advisor_hardening.sql` appear live as versions `20260721002147` and `20260721002417`. Always verify live objects and migration intent rather than comparing filename timestamps alone.

## Supabase flags intentional authenticated security-definer RPCs

The security advisor reports its generic warning for authenticated `SECURITY DEFINER` routines, including the operational-workspace management RPCs. Those reviewed routines require authenticated app access, use fixed search paths, revoke public/anonymous execution, and perform server-side company/workspace permission checks. Treat a change to those grants or checks as a security-sensitive migration; do not silence the advisor by removing the app's required authenticated execution.

## Planned navigation can look implemented

Tickets and Templates remain future navigation entries. Product or AI work must not report them as shipped without confirming implementation.

## Cron credential visibility is provider-scoped

The recycle-bin purge endpoint expects server-side authorization, but this folder intentionally cannot prove or expose the credential value. Confirm presence in Vercel environment configuration when changing the cron path or authorization behavior.

