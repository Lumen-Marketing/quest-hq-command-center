// Import & export: every time records left this app or arrived in it.
//
// Its own tab rather than a line in the workspace feed. The feed lives on the workspace home
// and the buttons that produce these rows are inside the app -- somebody who has just pressed
// Export and wants to know it was recorded should not have to leave the app to find out. That
// was the first version, and "where is the log" was the reaction to it.
//
// Reads public.wb_data_transfers. Browser roles cannot UPDATE or DELETE its rows; a manager's
// server-prepared, atomic clear RPC is the sole exception and leaves a tombstone per app.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

const FORMATS = {
  csv: 'CSV file',
  questapp: 'App file (.questapp.json)',
  print: 'Printed',
};

export function createTransferLog(ctx) {
  const { h, can, state, wbMemberById, wbTimeAgo } = ctx;

  /** This app's transfer rows. state.wbTransfers arrives newest-first from the query. */
  const wbAppTransfers = (appId) => (state.wbTransfers || [])
    .filter((row) => String(row.app_id) === String(appId));

  function wbViewTransfers(companyId, workspace, app) {
    // The table's own SELECT policy asks for the same thing, so this is the paint matching the
    // gate rather than a second rule.
    if (!can('workspaces.records.view', companyId)) {
      return `<div class="wb-empty"><i class="ti ti-lock"></i><h3>Not your log to read</h3>
        <p>Seeing when records left or arrived needs permission to view this app's records.</p></div>`;
    }

    const rows = wbAppTransfers(app.id);
    if (!rows.length) {
      return `<div class="wb-empty"><i class="ti ti-history"></i><h3>Nothing has moved yet</h3>
        <p>Every Export, Print, Download app and Import of <b>${h(app.name)}</b> is recorded here — who did it, when, and how many records.</p></div>`;
    }

    const line = (row) => {
      // Resolved from the id so a later rename shows on every past entry. Somebody who has left
      // is said in words rather than left blank: a row with no author reads like a bug.
      const member = row.created_by ? wbMemberById(companyId, row.created_by) : null;
      const who = member && member.name && member.name !== 'Unknown' ? member.name : 'Somebody no longer here';
      const count = Number(row.record_count) || 0;

      // A tombstone: the rows above it were cleared by a workspace manager, and this says how
      // many went. `record_count` is a row count here rather than a record count, so it is
      // labelled differently -- reading "12 records" under a clear would claim records were
      // removed from the app, which is a much more alarming thing than what happened.
      if (row.direction === 'cleared') {
        return `<tr class="wb-tx-row cleared">
          <td><span class="wb-tx-dir cleared"><i class="ti ti-eraser"></i>Cleared</span></td>
          <td>${count} ${count === 1 ? 'entry' : 'entries'}</td>
          <td colspan="2">Earlier import &amp; export history was cleared</td>
          <td>${h(who)}</td>
          <td>${h(wbTimeAgo(row.created_at))}</td>
        </tr>`;
      }

      const out = row.direction === 'export';
      return `<tr class="wb-tx-row">
        <td><span class="wb-tx-dir ${out ? 'out' : 'in'}"><i class="ti ${out ? 'ti-file-export' : 'ti-file-import'}"></i>${out ? 'Export' : 'Import'}</span></td>
        <td>${count} record${count === 1 ? '' : 's'}</td>
        <td>${h(FORMATS[row.format] || row.format || '—')}</td>
        <td>${row.file_name ? h(row.file_name) : '<span class="muted-dash">—</span>'}</td>
        <td>${h(who)}</td>
        <td>${h(wbTimeAgo(row.created_at))}</td>
      </tr>`;
    };

    return `<div class="wb-tx">
      <p class="wb-sub wb-tx-note">Every time records left this app or arrived in it. Entries cannot be edited. A workspace manager can clear them from Configure workspace, which leaves a line here saying how many went.</p>
      <div class="wb-tx-scroll"><table class="wb-tx-table">
        <thead><tr><th>Direction</th><th>Records</th><th>How</th><th>File</th><th>Who</th><th>When</th></tr></thead>
        <tbody>${rows.map(line).join('')}</tbody>
      </table></div>
    </div>`;
  }

  return { wbViewTransfers };
}
