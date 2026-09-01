// App Builder data in and out: print windows, CSV export/import, and downloading an app
// as a portable file.
//
// Fetched on demand. Every entry point is a button — Print, Export, Import, Download — so
// none of this is needed to paint the app.
//
// main.js prefetches it as soon as an app view renders, which matters more than speed
// here: window.open must run in the same task as the click or the browser treats the new
// window as an unsolicited pop-up. With the module already in hand the click path is
// fully synchronous, and the async branch only runs if that prefetch failed.
//
// A factory so the functions can keep calling each other by name, with the main.js
// helpers closed over once. The bodies are unchanged from where they lived in main.js.

import { parseCsvRows } from '../data/csv.js';
import { describeExtras, portableExtras } from './app-portability.js';
import { adoptFields, buildFieldSet, presentIn, readFieldSet } from './field-portability.js';

// Imported here rather than passed in from main.js: ops-workspace-id.js exists to stay OUT
// of the entry chunk, and main.js IS the entry chunk. This module is already lazily loaded.
import { opsWorkspaceId } from './ops-workspace-id.js';
import { createSummaryBar } from './summary-bar.js';

export function createDataIO(ctx) {
  const {
    h, showToast, render, companyName,
    wbFind, wbPlainVal, wbSave, wbUid, wbLogActivity, wbMembers,
    wbReportContext, wbLoadReports, wbAssignAutoNumbers, loadedReports,
    clone, downloadText, guardUpload, activeSession,
    createSupabaseClient, isLiveSupabaseSession,
    WB_FIELD_TYPES, WB_PALETTE, openWbModal, closeWbModal, safeHexColor, sanitizeColorConfig,
  } = ctx;

  /**
   * Record that data crossed the boundary of the product.
   *
   * Its own table rather than the workspace activity feed, for a reason that decides the whole
   * design: `wbLogActivity` appends to the builder document, and persisting that needs
   * `workspaces.manage`. A role that may export and nothing else could not write its own log
   * line -- so the log would be missing exactly for the people it most needs to cover.
   *
   * Deliberately fire-and-forget. An export is a thing that has already happened by the time
   * this runs; failing the download because the note about it did not save would be the wrong
   * trade. A refused insert means the row is not there, and the button that produced it was
   * gated by the same permission the insert policy checks, so a refusal here means something
   * changed mid-session rather than that somebody slipped through.
   */
  function logTransfer(companyId, workspaceId, appId, { direction, format, recordCount = 0, fileName = '' }) {
    const supabase = createSupabaseClient?.();
    const workspace = opsWorkspaceId?.(workspaceId) || '';
    // A legacy `ws-<companyId>` document has no workspace row to point at, and the column is a
    // uuid; there is nothing to write against.
    if (!supabase || !isLiveSupabaseSession?.() || !workspace) return;
    const actor = activeSession?.()?.profile?.id || null;
    supabase.from('wb_data_transfers').insert({
      company_id: companyId,
      workspace_id: workspace,
      app_id: appId,
      direction,
      format,
      record_count: Number(recordCount) || 0,
      file_name: String(fileName || '').slice(0, 240),
      ...(actor ? { created_by: actor } : {}),
    }).then(null, () => {});
  }

  const { summaryPrintTable } = createSummaryBar({ h, wbPlainVal });

  // Open a print-ready window carrying the app's own stylesheets (so report cards
  // and tables look identical), then auto-invoke the browser print dialog.
  function wbOpenPrintWindow(title, bodyHTML) {
    const win = window.open('', '_blank', 'width=1100,height=800');
    if (!win) { showToast('Allow pop-ups for this site to print.', 'local', 'Workspaces'); return; }
    // Absolute hrefs so root-relative /assets/*.css resolve in the blank window;
    // inline <style> tags (Vite dev) are copied verbatim.
    const heads = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.tagName === 'LINK' ? `<link rel="stylesheet" href="${n.href}">` : n.outerHTML).join('\n');
    win.document.open();
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${h(title)}</title>${heads}<style>
      @page { margin: 14mm; }
      body { background:#fff !important; padding:22px; color:#111; }
      .wb-print-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; border-bottom:2px solid #333; padding-bottom:12px; }
      .wb-print-head h1 { font-size:20px; margin:0 0 4px; }
      .wb-print-meta { color:#666; font-size:12px; }
      .wb-print-table { width:100%; border-collapse:collapse; font-size:12px; }
      .wb-print-table th, .wb-print-table td { border:1px solid #ccc; padding:6px 9px; text-align:left; vertical-align:top; }
      .wb-print-table thead th { background:#f1f1f1; font-weight:700; white-space:nowrap; }
      .wb-print-table tbody tr:nth-child(even) { background:#fafafa; }
      @media print { .wb-report-grid { display:block; } .wb-chart-card { break-inside:avoid; page-break-inside:avoid; margin-bottom:14px; } }
    </style></head><body>${bodyHTML}<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>`);
    win.document.close();
  }
  function wbPrintTitleBlock(companyId, app, subtitle) {
    const when = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return `<div class="wb-print-head">
      <div><h1>${h(app.name)}${subtitle ? ` — ${h(subtitle)}` : ''}</h1><div class="wb-print-meta">${app.items.length} item${app.items.length === 1 ? '' : 's'} · ${app.fields.length} field${app.fields.length === 1 ? '' : 's'}</div></div>
      <div class="wb-print-meta">${h(companyName(companyId) || 'Questbase')}<br>Printed ${h(when)}</div>
    </div>`;
  }
  // Print items in the app (all fields). With `onlyIds` (a Set), prints just those
  // records; otherwise every item (ignores search/filter — a full export).
  function wbPrintData(companyId, workspaceId, appId, onlyIds) {
    const { workspace, app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    const items = onlyIds ? app.items.filter((it) => onlyIds.has(it.id)) : app.items;
    if (!app.fields.length || !items.length) { showToast('Nothing to print yet — add fields and items first.', 'local', 'Workspaces'); return; }
    const cols = app.fields;
    const thead = `<tr><th>#</th>${cols.map((f) => `<th>${h(f.label)}</th>`).join('')}</tr>`;
    const rows = items.map((it, i) => `<tr><td>${i + 1}</td>${cols.map((f) => `<td>${h(wbPlainVal(companyId, workspace, app, f, it.values[f.id], it.values))}</td>`).join('')}</tr>`).join('');
    const subtitle = onlyIds ? `${items.length} selected record${items.length === 1 ? '' : 's'}` : 'Data';
    // The calculations print as a table of their own, after the data. Paper has no scroll: the
    // on-screen strip is a row that runs off the side of the page, while one row per calculation
    // reads down. Its caption is what the Hide-when-printing tick removes.
    const totals = summaryPrintTable(companyId, workspace, app, items, { sel: onlyIds || new Set() });
    const body = `${wbPrintTitleBlock(companyId, app, subtitle)}<table class="wb-print-table"><thead>${thead}</thead><tbody>${rows}</tbody></table>${totals}`;
    wbOpenPrintWindow(`${app.name} — ${onlyIds ? 'selected' : 'data'}`, body);
    logTransfer(companyId, workspaceId, appId, {
      direction: 'export',
      format: 'print',
      recordCount: onlyIds ? onlyIds.length : ((wbFind(companyId, workspaceId, appId).app?.items) || []).length,
    });
  }
  // Print the Reports tab (KPIs + charts) using the live report markup.
  //
  // The chart module has to be in hand before printing, or the printout would be a loading
  // spinner. In practice it always is: this button only exists on the Reports tab, so the
  // tab has already rendered and fetched it. That matters beyond speed -- window.open must
  // run in the same task as the click, and an await, even one that resolves immediately,
  // hands browsers a reason to treat the window as an unsolicited pop-up.
  function wbPrintReports(companyId, workspaceId, appId) {
    const { workspace, app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    if (!app.fields.length || !app.items.length) { showToast('No report data yet — add items first.', 'local', 'Workspaces'); return; }
    const print = (charts) => {
      const reports = charts.renderReports(app, wbReportContext(companyId));
      wbOpenPrintWindow(`${app.name} — reports`, `${wbPrintTitleBlock(companyId, app, 'Reports')}<section class="tool-page wb-page">${reports}</section>`);
    };
    const charts = loadedReports();
    if (charts) { print(charts); return; }
    // Only reachable if the fetch failed while the tab was open. Retry, and accept that the
    // pop-up may need allowing, rather than printing nothing.
    wbLoadReports().then(print).catch(() => showToast('Could not load the report charts — check your connection and try again.', 'local', 'Workspaces'));
  }

  /* ---- Workspace import / export (CSV) --------------------------------------- */
  function wbCsvEscape(v) {
    let s = String(v ?? '');
    // Neutralize spreadsheet formula injection: a cell starting with = + - @ (or tab/CR) is
    // prefixed with an apostrophe so Excel/Sheets treat it as text, not a live formula.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  // Export every item to a CSV using field labels as headers (human-friendly text).
  function wbExportCsv(companyId, workspaceId, appId) {
    const { workspace, app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    if (!app.fields.length) { showToast('Add fields before exporting.', 'local', 'Workspaces'); return; }
    const cols = app.fields;
    const header = cols.map((f) => wbCsvEscape(f.label)).join(',');
    const lines = app.items.map((it) => cols.map((f) => wbCsvEscape(wbPlainVal(companyId, workspace, app, f, it.values[f.id], it.values))).join(','));
    const csv = `﻿${[header, ...lines].join('\r\n')}`; // BOM so Excel reads UTF-8
    const safeName = (app.name || 'app').replace(/[^\w.-]+/g, '_');
    downloadText(`${safeName}.csv`, csv, 'text/csv;charset=utf-8;');
    logTransfer(companyId, workspaceId, appId, {
      direction: 'export', format: 'csv', recordCount: app.items.length, fileName: `${safeName}.csv`,
    });
    showToast(`Exported ${app.items.length} item${app.items.length === 1 ? '' : 's'} to CSV.`, 'local', 'Workspaces');
  }
  // RFC-4180-ish parser: handles quoted fields with embedded commas/newlines and "" escapes.
  function wbParseCsv(text) {
    return parseCsvRows(text);
  }
  function wbParseDurationCell(s) {
    const t = String(s).trim();
    const hm = t.match(/(\d+)\s*h/i); const mm = t.match(/(\d+)\s*m/i);
    if (hm || mm) return (hm ? +hm[1] : 0) * 60 + (mm ? +mm[1] : 0);
    const n = Number(t.replace(/[^0-9.]/g, '')); return Number.isNaN(n) ? '' : Math.round(n);
  }
  function wbParseDateCell(s) {
    const t = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const d = new Date(t); return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }
  // Coerce a raw CSV cell into the stored value for a given field type.
  function wbCoerceImport(companyId, app, field, cell) {
    const s = String(cell ?? '').trim();
    if (s === '') return '';
    switch (field.type) {
      case 'number': case 'money': case 'progress': { const n = Number(s.replace(/[^0-9.\-]/g, '')); return Number.isNaN(n) ? '' : n; }
      case 'duration': return wbParseDurationCell(s);
      case 'checkbox': return /^(y|yes|true|1|on|✓)$/i.test(s);
      case 'date': return wbParseDateCell(s);
      case 'status': case 'category': { const o = (field.config.options || []).find((x) => x.label.toLowerCase() === s.toLowerCase() || x.id === s); return o ? o.id : ''; }
      case 'user': { const m = wbMembers(companyId).find((x) => x.name.toLowerCase() === s.toLowerCase() || x.id === s); return m ? m.id : ''; }
      case 'calculation': return undefined; // computed — never imported
      case 'relationship': case 'file': case 'image': return ''; // not supported via CSV
      default: return s; // text, textarea, email, phone, location
    }
  }
  function wbImportCsvPrompt(companyId, workspaceId, appId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv,text/plain';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!(await guardUpload(file, 'csv', 'Workspaces'))) return;
      let text = '';
      try { text = await file.text(); } catch { showToast('Could not read that file.', 'local', 'Workspaces'); return; }
      wbImportCsvText(companyId, workspaceId, appId, text, file.name);
    };
    input.click();
  }
  function wbImportCsvText(companyId, workspaceId, appId, text, fileName = '') {
    const { workspace, app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    const rows = wbParseCsv(text).filter((r) => r.some((c) => String(c).trim() !== ''));
    if (rows.length < 2) { showToast('That CSV has no data rows. Row 1 must be column headers.', 'local', 'Workspaces'); return; }
    const headers = rows[0].map((hd) => String(hd).trim().toLowerCase());
    const fieldForCol = headers.map((hd) => app.fields.find((f) => f.label.toLowerCase() === hd));
    const matched = fieldForCol.filter(Boolean).length;
    if (!matched) { showToast('No column headers matched this app\'s field names. Export a CSV first to see the expected headers.', 'local', 'Workspaces'); return; }
    let added = 0;
    const today = new Date().toISOString().slice(0, 10);
    rows.slice(1).forEach((cells) => {
      const values = {};
      fieldForCol.forEach((f, i) => { if (!f) return; const v = wbCoerceImport(companyId, app, f, cells[i]); if (v !== undefined && v !== '') values[f.id] = v; });
      if (!Object.keys(values).length) return;
      wbAssignAutoNumbers(app, values);
      const id = wbUid();
      app.items.unshift({ id, values, createdAt: today, createdBy: activeSession().profile?.id || '', updatedAt: today, lastActivityAt: today });
      // On the RECORD, not only on the workspace. The import already logged one line saying how
      // many arrived, which is the right thing for the feed and useless on a record: opening any
      // of them showed "Nothing yet", as though somebody had typed it in by hand. Where a row
      // came from is the first thing you want to know about a row you did not create.
      wbLogActivity(workspace, {
        kind: 'created',
        icon: 'ti-file-import',
        color: '#16a34a',
        appId: app.id,
        itemId: id,
        text: fileName
          ? `Imported from <b>${h(fileName)}</b>`
          : 'Imported from a CSV file',
      });
      added++;
    });
    if (!added) { showToast('No rows could be imported — check that values line up with the headers.', 'local', 'Workspaces'); return; }
    const skipped = headers.length - matched;
    // The workspace-level summary line used to be written here as well. It is not any more:
    // the transfer row below says the same thing, and says it from a table a role with import
    // and nothing else can actually write -- the document needs workspaces.manage. Two sources
    // for one fact also meant the feed showed the import twice.
    //
    // The PER-RECORD line above stays. "Imported from Prospect.csv" on the record itself is
    // provenance you want when you open a row you did not type, and it is not duplicated here.
    logTransfer(companyId, workspaceId, appId, {
      direction: 'import', format: 'csv', recordCount: added, fileName,
    });
    wbSave(companyId);
    showToast(`Imported ${added} item${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} unmatched column${skipped === 1 ? '' : 's'} skipped` : ''}.`, 'local', 'Workspaces');
    render();
  }

  /* ---- Whole-app download / install (portable .questapp.json) ----------------- */
  // Serialize a full app — its fields, records and automations — to a portable file.
  function wbDownloadApp(companyId, workspaceId, appId) {
    const { app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    const bundle = {
      format: 'quest-hq-app',
      version: 1,
      exported_at: new Date().toISOString(),
      app: {
        name: app.name,
        description: app.description || '',
        type: app.type || '',
        icon: app.icon,
        color: app.color,
        fields: clone(app.fields || []),
        items: clone(app.items || []),
        automations: clone(app.automations || []),
        // The arrangement travels too: card layout, sub-item lists, record layout, dashboard
        // and saved views. Without these a downloaded app reinstalls as a bare field list,
        // which is what it used to do.
        ...portableExtras(app),
        // Memos are content, like records -- a backup that silently dropped them would lose
        // work. They ride with items, so the structure-only market share never carries them.
        ...(Array.isArray(app.memos) && app.memos.length ? { memos: clone(app.memos) } : {}),
      },
    };
    const safeName = (app.name || 'app').replace(/[^\w.-]+/g, '_');
    downloadText(`${safeName}.questapp.json`, JSON.stringify(bundle, null, 2), 'application/json');
    logTransfer(companyId, workspaceId, appId, {
      direction: 'export', format: 'questapp', recordCount: (app.items || []).length, fileName: `${safeName}.questapp.json`,
    });
    const extras = describeExtras(bundle.app);
    const summary = [`${app.fields.length} fields`, `${app.items.length} records`, `${app.automations.length} automations`, ...extras].join(' · ');
    showToast(`Downloaded "${app.name}" (${summary}).`, 'local', 'Workspaces');
  }

  /* ---- Field setup out and in (portable .questfields.json) ------------------- */
  //
  // "can you make it import and export so i can reuse other layout i have from other apps."
  //
  // Deliberately NOT the whole-app download above. That one builds a brand new app, so reusing
  // one form's shape in an app you are already standing in meant installing the whole thing --
  // records, automations and all -- and then deleting what you did not want. This carries the
  // field list on its own and adds it to the app you are in.
  function wbExportFields(companyId, workspaceId, appId) {
    const { workspace, app } = wbFind(companyId, workspaceId, appId);
    if (!app) return;
    if (!app.fields.length) { showToast('This app has no fields to export yet.', 'local', 'Workspaces'); return; }
    const bundle = buildFieldSet(app, app.fields, {
      workspaceName: workspace?.name || '',
      exportedAt: new Date().toISOString(),
    });
    const safeName = (app.name || 'app').replace(/[^\w.-]+/g, '_');
    downloadText(`${safeName}.questfields.json`, JSON.stringify(bundle, null, 2), 'application/json');
    showToast(`Exported ${app.fields.length} field${app.fields.length === 1 ? '' : 's'} from "${app.name}" — import it from any app's Fields tab.`, 'local', 'Workspaces');
  }

  // Read the file, then ASK. Dropping twelve fields into somebody's app the instant they picked
  // a file is not an import, it is an accident: the list is another app's, so which of it you
  // actually want is a question only the person importing can answer.
  function wbImportFieldsPrompt(companyId, workspaceId, appId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.questfields.json,.questapp.json,application/json';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      // JSON carries no magic bytes to check, so the guard is the size, the parse, and the
      // shape test in readFieldSet -- the same three the whole-app install relies on.
      if (file.size > 8 * 1024 * 1024) { showToast('That file is far too large to be a field export.', 'local', 'Workspaces'); return; }
      let text = '';
      try { text = await file.text(); } catch { showToast('Could not read that file.', 'local', 'Workspaces'); return; }
      let parsed;
      try { parsed = JSON.parse(text); } catch { showToast("That file isn't valid JSON.", 'local', 'Workspaces'); return; }
      const read = readFieldSet(parsed, (type) => !!WB_FIELD_TYPES[type]);
      if (!read.ok) { showToast(read.error, 'local', 'Workspaces'); return; }
      const { app } = wbFind(companyId, workspaceId, appId);
      if (!app) return;
      const present = presentIn(read.fields, app.fields);
      openWbModal({
        kind: 'field-import',
        companyId,
        workspaceId,
        appId,
        source: read.source,
        dropped: read.dropped,
        fields: read.fields,
        present,
        // Ticked = the fields this app is MISSING. One it already has under the same name is
        // left alone rather than arriving as a second copy, but the row stays tickable: the
        // same label over a different TYPE is a call only the person importing can make, and
        // ticking it lands a numbered field rather than writing over anything.
        //
        // By INDEX, not by id: the ids in the file are the source app's, and a hand-edited
        // bundle is free to repeat one or leave it blank.
        picks: read.fields.map((_, i) => i).filter((i) => !present[i]),
      });
    };
    input.click();
  }

  /** Add the ticked fields to the app the dialog was opened from. */
  function wbApplyFieldImport(modal) {
    const m = modal;
    if (!m || m.kind !== 'field-import') return;
    const { workspace, app } = wbFind(m.companyId, m.workspaceId, m.appId);
    if (!app) return;
    const picked = m.fields.filter((_, i) => m.picks.includes(i));
    if (!picked.length) { showToast('Tick at least one field to bring across.', 'local', 'Workspaces'); return; }
    const { fields, renamed } = adoptFields(picked, app.fields, {
      makeId: wbUid,
      sanitizeConfig: (config) => sanitizeColorConfig(config, safeHexColor(app.color, WB_PALETTE[1])),
    });
    app.fields.push(...fields);
    wbSave(m.companyId);
    if (workspace) {
      wbLogActivity(workspace, {
        icon: 'ti-file-import',
        color: '#0891b2',
        text: `Imported ${fields.length} field${fields.length === 1 ? '' : 's'} into <b>${h(app.name)}</b>${m.source.app ? ` from <b>${h(m.source.app)}</b>` : ''}`,
      });
    }
    closeWbModal();
    // The renames are named rather than counted: "Amount came in as Amount 2" is what somebody
    // needs to hear to go and look at it, and a bare "2 renamed" is not.
    const note = renamed.length ? ` ${renamed.map((r) => `"${r.from}" came in as "${r.to}"`).join('; ')}.` : '';
    showToast(`Added ${fields.length} field${fields.length === 1 ? '' : 's'} to "${app.name}".${note}`, 'local', 'Workspaces');
  }

  return {
    wbOpenPrintWindow, wbPrintTitleBlock, wbPrintData, wbPrintReports,
    wbExportCsv, wbImportCsvPrompt, wbImportCsvText, wbDownloadApp,
    wbExportFields, wbImportFieldsPrompt, wbApplyFieldImport,
  };
}
