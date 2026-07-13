# Known issues and risks

Only confirmed, actionable items belong here.

## Main browser bundle remains large

Vite still emits a large-chunk advisory for the primary application bundle. The repository bundle-budget check passes, and Leaflet/PDF.js are lazy-loaded, but src/main.js remains a performance and maintainability risk. Measure production behavior before splitting and retain the budget guard.

## Browser code and styling are monolithic

Most product behavior is concentrated in src/main.js and most styling in src/styles.css. Broad edits can create cross-module regressions, so use focused changes and full checks until module boundaries are deliberately extracted.

## Migration identifiers differ between repository and live ledger

The latest repository migration is 202607111000_harden_file_upload_buckets.sql, while the latest live ledger entry is 20260711051011 harden_finance_attachments_bucket. This reflects applied/reconciled provider versions, including storage hardening. Always verify live objects and migration intent rather than comparing filenames alone.

## Planned navigation can look implemented

Tickets, Knowledge, Automations, Templates, and Team Workload are present in future navigation but route to planned-page behavior. Product or AI work must not report these as shipped without confirming implementation.

## Cron credential visibility is provider-scoped

The recycle-bin purge endpoint expects server-side authorization, but this folder intentionally cannot prove or expose the credential value. Confirm presence in Vercel environment configuration when changing the cron path or authorization behavior.

