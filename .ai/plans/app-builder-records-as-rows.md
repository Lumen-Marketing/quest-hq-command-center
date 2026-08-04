# Plan — App Builder records become rows

Status: **approved, not started**. Written 2026-08-04. No code or migration applied yet.

## Why

Every App Builder app, field, record and comment for a company lives in a single JSON value:
`public.workspace_builder_state` is one row per company with one `doc jsonb` column.

That single fact causes all four limits that stop an App Builder app reaching the depth of
the native Jobs module:

1. **No child records.** An item is a flat bag of values. One job → many dailies, buckets,
   draws, change orders has nowhere to live.
2. **No enforceable rules.** "One daily per crew per day", "exactly one current plan",
   "end cannot precede start" are database constraints on the native tables. A JSON blob
   cannot express them, so nothing stops a second foreman double-reporting the same day.
3. **No aggregation.** Projected net counts an *open* bucket at `max(expected, spent)` and a
   *final* one at `spent`. The calculation field does arithmetic within one record; there is
   no child collection to sum over.
4. **It does not scale.** The whole document is read and rewritten on every edit. Twenty
   active jobs reporting daily for a year is ~7,000 rows inside one JSON value, resaved
   whenever anybody changes anything.

**The codebase already shows the strain**, which is the strongest evidence the diagnosis is
right rather than theoretical:

- `wb_add_item_comment` and `wb_modify_item_comment` are dedicated server RPCs that exist
  *only* so posting a comment does not rewrite the whole document. The hot collection was
  already moved server-side once, by hand.
- `src/workspace/builder-merge.js` is a 148-line three-way merge with 13 call sites in
  `main.js`. It exists only because the unit of change is the entire company's workspace.
  Two people editing *different apps* conflict today.

## The move

Records become rows. One table carries records and their children:

```sql
create table public.wb_items (
  id           uuid primary key default gen_random_uuid(),
  company_id   text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  app_id       text not null,
  -- Child collections. A daily belongs to a job: parent_id points at it, collection names
  -- which list it is in ('dailies', 'cost_buckets', 'draws').
  parent_id    uuid references public.wb_items(id) on delete cascade,
  collection   text not null default '',
  -- Whatever the app's uniqueness rule computes to, filled by the writer. One index serves
  -- every app's rule, so no index is created at runtime.
  unique_key   text,
  values       jsonb not null default '{}'::jsonb,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index wb_items_unique_key
  on public.wb_items (app_id, collection, unique_key) where unique_key is not null;
create index wb_items_by_app    on public.wb_items (company_id, app_id, collection);
create index wb_items_by_parent on public.wb_items (parent_id) where parent_id is not null;
```

`parent_id` + `collection` **is** child collections. `unique_key` plus one partial unique
index gives every app its own uniqueness rule without runtime DDL. Aggregation becomes
possible because children are finally queryable per record.

What stays in the doc: apps, fields, automations, tiles, workspace config. Those are small,
change rarely, and are edited by one owner at a time — the doc is a reasonable home for them.
Only **items** move. That also shrinks the merge module's job to config, where conflicts are
rare and a three-way merge is genuinely the right tool.

## Phases

Each phase is separately shippable and separately revertible.

### 1. Foundation — rows, nothing visible changes

The whole risk of the project is here.

- Migration: table, indexes, RLS scoped through `app_private.is_workspace_member` and
  `has_workspace_permission`, matching the existing workspace-owned tables.
- **Dual-write**: every item write goes to both the doc and `wb_items`. Reads still come from
  the doc, so a bug in the new path cannot break anybody.
- Backfill: copy existing `doc.workspaces[].apps[].items[]` into rows, idempotently, keyed on
  the item's existing id so re-running is safe.
- Verification: a reconciliation check that counts and compares both sides per app and
  reports drift. Runs against production before the next step, not after.
- **Then** flip reads to rows, keeping dual-write for one release as the rollback.
- Finally stop writing items into the doc, and drop them from it.

Exit condition: reads come from rows, the reconciliation reports zero drift for a week.

### 2. Child collections

- App settings gain "collections": a named child list with its own fields.
- The record page grows a tab per collection, listing that record's children.
- The existing record form is reused for a child, with `parent_id` and `collection` set.

Exit condition: a Jobs app can hold dailies under a job.

### 3. Constraints

- Per-collection uniqueness: pick the fields that must be unique together; the writer
  computes `unique_key` from them, the index enforces it.
- Required fields enforced on write, not just marked in the UI.
- Ordered date pairs (start/end) as a field-level rule.

Exit condition: a second daily for the same crew and day is rejected by the database.

### 4. Rollups

- A new field type: aggregate over a child collection — count, sum, min, max, and
  "sum where field is X", which is what the open-vs-final bucket rule needs.
- Computed on read from the children, not stored, so it cannot go stale.

Exit condition: an app can reproduce projected net.

### 5. Per-app permissions (optional, decide later)

Today everything in App Builder shares one `workspaces.view` / `workspaces.manage` pair, so a
foreman who should only submit dailies gets edit rights to every app in the workspace. Native
Jobs splits `jobs.view` from `jobs.manage`. Worth doing only if customers ask.

## Risks, and what is done about each

| Risk | Mitigation |
| --- | --- |
| Backfill loses or duplicates records | Idempotent on existing item id; reconciliation before the read flip; doc still holds items through phase 1 |
| New read path is wrong | Dual-write means the doc is a live fallback for a full release |
| RLS gap exposes another company's records | Policies copied from the existing workspace-owned tables, plus a tenancy test — `npm run tenancy:check` already exists |
| Realtime and offline paths miss the new table | Add `wb_items` to the realtime publication in the same migration as the read flip |
| Migration cannot be undone | Phase 1 adds a table and changes no existing column; reverting is dropping the table and one code flag |

## Sequencing note

Phase 1 delivers nothing a user can see. That is the point — it is the only phase that
touches live data, and it should be boring. Phases 2–4 are comparatively quick once records
are rows, and each one is visible.

## Open questions for the team

- Does anyone rely on exporting or hand-editing the raw workspace document? That is the one
  workflow this breaks.
- How large is the biggest `doc` today? It sets how long the backfill runs and whether it
  needs batching. Needs a production query; not yet checked.
