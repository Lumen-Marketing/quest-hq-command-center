# Keepsake — standalone task app

Locked decision 6 of the task-app absorption: **fresh start**, no data migration
into Command Center — but nothing of substance is thrown away.

Two layers of safety:

1. **The old Supabase project stays alive and read-only.** `qqvmcsvdxhgjooirznrj`
   is not deleted at cutover. Revisit no sooner than a month after the redirect
   goes up.
2. **CSV export** via `scripts/export-old-task-app.mjs` (needs the OLD project's
   service-role key; see the script header). Output lands in
   `docs/keepsake/<date>-task-app-export/` with a MANIFEST.md of row counts.

## Verified contents (read-only check, 2026-07-22)

| Table | Rows |
| --- | --- |
| notifications | 499 |
| tasks | 77 |
| checkin_log | 69 |
| time_entries | 40 |
| team_members | 21 |
| task_types | 21 |
| task_comments | 16 |
| profiles | 16 |
| projects | 11 |
| task_labels | 9 |
| companies | 4 |
| others (statuses, reactions, counters, bug reports) | small |

The tasks table holds real operational history (job follow-ups, agreements,
supplier calls) across the roofing / drafting / lumen companies — worth the
export even though the project itself is being kept.

**Exported CSVs are private**: they contain staff names and email addresses.
