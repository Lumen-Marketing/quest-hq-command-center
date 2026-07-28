# Database overview

The live Supabase public catalog was captured 2026-07-28T22:31:54.000Z. The [machine-readable snapshot](snapshot.json) contains catalog metadata only; it has no production rows, auth-user records, storage object paths, or credentials.

## Catalog summary

- Public tables/views: 76
- Foreign-key column relationships: 194
- RLS policies: 224
- Public functions: 63
- Triggers: 91
- Storage buckets: 6
- Applied migration ledger entries: 85
- Latest live ledger entry: `20260728223037_record_history_workspace_fk_index`

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

`companies.appearance_prefs` carries a company default through the separately authorized
`update_company_appearance(text, jsonb)` RPC. A member's saved preference wins; otherwise the
company default is inherited.

## Recoverable business-record history

`record_history` is an append-only, workspace-scoped history ledger for Contacts, Quotes,
Jobs, and Tasks. Database triggers capture created, updated, deleted, and restored events
using a strict field allowlist that excludes phone, email, address, notes, and descriptions.
Signed-in users can only read history when they belong to the matching active workspace and
hold the module's view permission.

The existing 30-day Recycle Bin remains the durable recovery path. `recycle_undo_item(text)`
adds a narrower immediate Undo path that is limited to the deleting user, ten minutes,
the original tenant/workspace, and the source module's current permission check.

## Maps

- [Schema](schema.md)
- [Relationships](relationships.md)
- [Functions](functions.md)
- [Security](security.md)
- [Storage](storage.md)
- [Refresh queries](introspection.sql)
- [Machine snapshot](snapshot.json)
