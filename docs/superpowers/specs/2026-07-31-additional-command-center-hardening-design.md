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
- Company lifecycle adds `archived` and `rejected`. Existing `canceled` rows remain
  `canceled`, because old data does not reliably reveal whether a row came from billing,
  Archive, or Reject.
- Archive writes `archived`; the approval console's Reject action writes `rejected`;
  billing cancellation remains `canceled`. All three remain non-active states.
- Each audited `insert(...).select(...)` site must either have row visibility immediately
  after INSERT or stop requesting a returned row.
- `quest-form-response-files` remains private and has no browser Storage policy. Files are
  uploaded and signed only through server endpoints using the service-role client. Adding
  an anon/authenticated Storage policy would broaden access and is not required for this
  server-only route.

## Verification

- Focused lifecycle, permission, alias, insert-return, and file-storage contract tests.
- Full repository check, including build and existing regression suite.
- Live Supabase function, constraint, bucket, and policy checks.
- Production deployment and smoke test.
- A plain-language PDF checklist with status and evidence for every item.
