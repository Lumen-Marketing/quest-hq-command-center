# Database overview

The live Supabase public catalog was captured 2026-07-27T19:13:43.004Z. The [machine-readable snapshot](snapshot.json) contains catalog metadata only; it has no production rows, auth-user records, storage object paths, or credentials.

## Catalog summary

- Public tables/views: 75
- Foreign-key column relationships: 191
- RLS policies: 223
- Public functions: 60
- Triggers: 83
- Storage buckets: 6
- Applied migration ledger entries: 81
- Latest live ledger entry: `20260727190835_company_invite_launch_hardening`

## Launch-critical onboarding state

`company_invites` records selected operational workspace ids and email delivery state. `accept_company_invite` validates the invite recipient, refuses to mutate an already-active member, folds Owner/Admin/Developer invites down to Member, clears prior custom assignments, inserts only a verified non-elevated role, and creates active `workspace_memberships`. Empty legacy workspace selections fall back to the company default workspace.

The active `send-company-invite` Edge Function accepts only an invite id, derives recipient/content server-side, checks the caller's active Owner/Admin/Developer membership, and records sent/failed delivery status without invalidating the invite. Browser CORS is restricted to the production Vercel origin and Questbase domains.

## User preference state

`profiles.appearance_prefs` (jsonb, default `{}`) carries the signed-in user's theme mode,
accent, background preset and card styling so appearance follows them between devices. It is
written only through `update_own_appearance(jsonb)` — SECURITY DEFINER, `search_path = ''`,
keyed on `auth.uid()` — which whitelists and coerces every field, so a tampered client
payload cannot store arbitrary data. A `pg_column_size(appearance_prefs) <= 2048` check
constraint keeps the column from being used as a blob store; uploaded background images are
deliberately not stored here. Added in `202607291200_profile_appearance_sync.sql`.

## Maps

- [Schema](schema.md)
- [Relationships](relationships.md)
- [Functions](functions.md)
- [Security](security.md)
- [Storage](storage.md)
- [Refresh queries](introspection.sql)
- [Machine snapshot](snapshot.json)
