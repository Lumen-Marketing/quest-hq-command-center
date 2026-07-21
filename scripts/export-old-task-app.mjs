#!/usr/bin/env node
/* Keepsake export from the STANDALONE task app's Supabase project.
 *
 * Locked decision 6 of the task-app absorption: fresh start, no data migration —
 * but export everything of substance before task.questroofing.com is retired.
 *
 * READ-ONLY. This script never writes to the source project. Run it against the
 * OLD project only (qqvmcsvdxhgjooirznrj), never against Command Center's.
 *
 * Usage:
 *   OLD_SUPABASE_URL=https://qqvmcsvdxhgjooirznrj.supabase.co \
 *   OLD_SUPABASE_SERVICE_KEY=<service_role key of the OLD project> \
 *   node scripts/export-old-task-app.mjs
 *
 * Writes CSVs to docs/keepsake/<date>-task-app-export/.
 * The service-role key is needed because RLS would otherwise hide rows; it is
 * read from the environment and never written to disk or logged.
 */

import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.env.OLD_SUPABASE_URL;
const key = process.env.OLD_SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Set OLD_SUPABASE_URL and OLD_SUPABASE_SERVICE_KEY (old project only).');
  process.exit(1);
}
if (url.includes('lpzotcznihwyyudxycmd')) {
  console.error('Refusing to run: that is Command Center\'s project, not the old task app.');
  process.exit(1);
}

// Tables worth keeping. Ordered most- to least-valuable if the run is cut short.
const TABLES = [
  'tasks',
  'time_entries',
  'team_members',
  'projects',
  'task_comments',
  'active_timers',
  'notifications',
];

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const raw = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Quote whenever the cell could break the row, and double any inner quotes.
  return /[",\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
};

const toCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvCell(row[h])).join(','));
  return `${lines.join('\n')}\n`;
};

const client = createClient(url, key, { auth: { persistSession: false } });
const stamp = new Date().toISOString().slice(0, 10);
const outDir = join('docs', 'keepsake', `${stamp}-task-app-export`);
mkdirSync(outDir, { recursive: true });

const summary = [];
let failed = false;

for (const table of TABLES) {
  // Page so a table larger than PostgREST's max-rows cap isn't silently truncated.
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) {
      console.error(`[${table}] FAILED: ${error.message}`);
      summary.push({ table, rows: 'ERROR', note: error.message });
      failed = true;
      break;
    }
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  if (summary.some((s) => s.table === table)) continue;

  writeFileSync(join(outDir, `${table}.csv`), toCsv(rows), 'utf8');
  console.log(`[${table}] ${rows.length} rows`);
  summary.push({ table, rows: rows.length, note: '' });
}

writeFileSync(
  join(outDir, 'MANIFEST.md'),
  [
    `# Keepsake export — standalone task app`,
    ``,
    `Exported ${stamp} from \`${url}\` (read-only).`,
    ``,
    `| Table | Rows |`,
    `| --- | --- |`,
    ...summary.map((s) => `| ${s.table} | ${s.rows}${s.note ? ` — ${s.note}` : ''} |`),
    ``,
    `This is an archive for reference only. Nothing here is imported into`,
    `Command Center (locked decision 6: fresh start). The CSVs contain staff`,
    `names and email addresses — keep this folder private.`,
    ``,
  ].join('\n'),
  'utf8',
);

console.log(`\nWrote ${outDir}/`);
process.exit(failed ? 1 : 0);
