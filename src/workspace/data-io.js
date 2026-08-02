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

export function createDataIO(ctx) {
  const {
    h, showToast, render, companyName,
    wbFind, wbPlainVal, wbSave, wbUid, wbLogActivity, wbMembers,
    wbReportContext, wbLoadReports, wbAssignAutoNumbers,
  } = ctx;

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
    const body = `${wbPrintTitleBlock(companyId, app, subtitle)}<table class="wb-print-table"><thead>${thead}</thead><tbody>${rows}</tbody></table>`;
    wbOpenPrintWindow(`${app.name} — ${onlyIds ? 'selected' : 'data'}`, body);
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
    if (wbReportsModule) { print(wbReportsModule); return; }
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
      wbImportCsvText(companyId, workspaceId, appId, text);
    };
    input.click();
  }
  function wbImportCsvText(companyId, workspaceId, appId, text) {
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
      app.items.unshift({ id: wbUid(), values, createdAt: today, createdBy: activeSession().profile?.id || '', updatedAt: today, lastActivityAt: today });
      added++;
    });
    if (!added) { showToast('No rows could be imported — check that values line up with the headers.', 'local', 'Workspaces'); return; }
    const skipped = headers.length - matched;
    wbLogActivity(workspace, { icon: 'ti-file-import', color: '#16a34a', text: `Imported <b>${added}</b> item${added === 1 ? '' : 's'} into ${h(app.name)} from CSV` });
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
      },
    };
    const safeName = (app.name || 'app').replace(/[^\w.-]+/g, '_');
    downloadText(`${safeName}.questapp.json`, JSON.stringify(bundle, null, 2), 'application/json');
    showToast(`Downloaded "${app.name}" (${app.fields.length} fields · ${app.items.length} records · ${app.automations.length} automations).`, 'local', 'Workspaces');
  }

  return {
    wbOpenPrintWindow, wbPrintTitleBlock, wbPrintData, wbPrintReports,
    wbExportCsv, wbImportCsvPrompt, wbImportCsvText, wbDownloadApp,
  };
}
