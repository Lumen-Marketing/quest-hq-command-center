# Additional Command Center hardening

## Goal

Close the five release checks supplied by the team without widening tenant access:

1. Keep browser permission decisions aligned with `app_private.has_company_permission`.
2. Preserve real company IDs before applying legacy company aliases.
3. Give Archive and Reject distinct lifecycle states.
4. Audit browser-side `insert(...).select(...)` calls for matching SELECT visibility.
5. Decide whether `quest-form-response-files` needs Storage object policies.

## Decisions

- Permission parity and real-company alias precedence already exist on `main`. This change
  adds verification evidence instead of replacing working code.
- Company lifecycle uses an expand/contract projection. The legacy `status` column keeps
  terminal rows as `canceled`; nullable `terminal_status` carries `archived`, `rejected`, or
  Stripe `canceled`. Old RPCs remain safe for already-open clients, while lifecycle-v2 RPCs
  and current direct-row normalizers expose the effective value.
- Archive/Delete/Cancel platform actions set terminal `archived`; approval-console Reject
  (including a legacy `canceled` request) sets terminal `rejected`; Stripe cancellation sets
  terminal `canceled`. A later live Stripe event clears only a Stripe cancellation and
  preserves a manual archive/rejection until explicit platform reactivation.
- The backfill classifies audit-proven platform archive/delete/cancel or rejected review
  events only when the audit is at least as recent as the last Stripe event. Other legacy
  canceled rows remain effectively canceled. Every terminal state blocks subscription
  access even if a stale grace date remains.
- Each audited `insert(...).select(...)` site must either have row visibility immediately
  after INSERT or stop requesting a returned row.
- `quest-form-response-files` remains private and has no browser Storage policy. Files are
  uploaded and signed only through server endpoints using the service-role client. Adding
  an anon/authenticated Storage policy would broaden access and is not required for this
  server-only route.

## Verification

- Focused lifecycle transition/old-client, permission, alias, insert-return, and file-storage contract tests.
- Full repository check, including build and existing regression suite.
- Live Supabase function, constraint, bucket, and policy checks.
- Production deployment and smoke test.
- A plain-language PDF checklist with status and evidence for every item.
