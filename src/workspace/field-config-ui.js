// The per-type configuration panel inside the App Builder field editor: the options list
// for a status or category, the rollup pickers, the relationship target chooser, the
// progress-bar stops, and so on.
//
// Fetched on demand. Reaching it takes a click on a field, and openWbFieldModal awaits
// this module BEFORE opening the dialog -- so the panel is never briefly missing, and the
// eleven main.js helpers it needs arrive as one context object rather than as eleven
// imports back into the monolith, which would reintroduce the circular dependency that
// sank the earlier big-bang split.
//
// The body is unchanged from where it lived in main.js. Everything it calls is
// destructured from `ctx` under the original names, so this is a move, not a rewrite.
import { acceptAttr } from '../security/upload-policy.js';
import {
  PULL_FAMILY, contactPullMap, contactSourceApp, effectivePull, matchedFields, pullTargets,
} from './relationship-pull.js';
import {
  BUTTON_OPS, buttonNotReady, buttonReady, planPush, planSet, pushableFields,
} from './button-field.js';
import { WB_ACTION_ICONS, WB_APP_ICONS } from './icon-sets.js';
import { sheetPreview } from '../sheet/sheet-model.js';
import { normalizeSheetFull } from '../sheet/sheet-format.js';
// Choice chips are drawn here and run from there. Re-exported so main.js, which already holds
// this module whenever a chip can be on screen, reaches the runtime without a second fetch.
import { wbChipHtml } from './chip-field.js';

export { createChipRuntime } from './chip-field.js';

// "Copy the data inputted on the other field so it will automatically input on it."
//
// Picking a linked record can fill fields on THIS record from it. The relationship still
// displays whatever Show field says -- this is a separate job: the link decides what is
// shown, the mapping decides what is copied.
//
// Only for a single link. With several linked records there is no answer to "which one's
// address?", and guessing would be worse than not offering it.
// `h` is passed in rather than closed over: this sits at module scope, and h is destructured
// from ctx inside renderFieldConfig. Reaching for it here threw a ReferenceError that took
// the whole relationship config panel down with it -- Show field, Identify by and Specific
// record all vanished, which looked like they had been removed.
function pullConfigUI(h, fd, app, targetApp, opts = {}) {
  // A contact picker copies unless told not to; a relationship copies only when asked. See
  // contactPullMap for why the two differ.
  const {
    heading = 'Copy from the linked record',
    noun = `a <b>${h(targetApp.name)}</b> record`,
    shared: sharedLabel = 'the fields both apps call the same thing',
    defaultOn = false,
  } = opts;
  const on = defaultOn ? fd.config.pullAll !== false : !!fd.config.pullAll;
  const rows = Array.isArray(fd.config.pull) ? fd.config.pull : [];
  const sources = (targetApp.fields || []).filter((f) => PULL_FAMILY[f.type]);
  if (!sources.length) return '';

  const row = (pair, index) => {
    const from = sources.find((f) => f.id === pair.from);
    // The destination list narrows to what the source can actually become: a date into a
    // money field is not a copy, it is a corruption.
    const targets = pullTargets(app, from, fd.id);
    return `
      <div class="wb-pull-row" data-wb-pull-row data-index="${index}">
        <select class="wb-input" data-wb-pull-from data-wb-rel-refresh>
          <option value="">— Field to copy —</option>
          ${sources.map((f) => `<option value="${h(f.id)}" ${pair.from === f.id ? 'selected' : ''}>${h(f.label)}</option>`).join('')}
        </select>
        <i class="ti ti-arrow-right" aria-hidden="true"></i>
        <select class="wb-input" data-wb-pull-to ${from ? '' : 'disabled'}>
          <option value="">${from ? '— Into which field —' : 'Pick a field to copy first'}</option>
          ${targets.map((f) => `<option value="${h(f.id)}" ${pair.to === f.id ? 'selected' : ''}>${h(f.label)}</option>`).join('')}
        </select>
        <button type="button" class="wb-icon-btn danger" data-wb-pull-del title="Remove" aria-label="Remove this mapping"><i class="ti ti-x"></i></button>
      </div>`;
  };

  // What "copy everything we share" would actually copy, named. A switch that silently does
  // twelve things is a switch nobody trusts.
  const shared = matchedFields(app, targetApp, fd.id);
  const sharedNote = shared.length
    ? `Copies <b>${shared.map((pair) => h(pair.label)).join('</b>, <b>')}</b> — ${sharedLabel}.`
    : `Nothing to copy automatically: no field on <b>${h(targetApp.name)}</b> shares a name with one here that could hold it.`;

  return `
    <div class="wb-field">
      <label>${heading} <span class="wb-opt">(optional)</span></label>
      <div class="wb-check-row">
        <label class="wb-switch"><input type="checkbox" id="wbRelPullAll" ${on ? 'checked' : ''}><span class="wb-slider"></span></label>
        <div><b>Copy every field they share</b><div class="wb-sub">${sharedNote}</div></div>
      </div>
      <div class="wb-pull-list">${rows.map(row).join('')}</div>
      <button class="btn btn-sm" type="button" data-wb-pull-add><i class="ti ti-plus"></i>Copy a field</button>
      <div class="wb-sub">When somebody picks ${noun}, these fields are filled in from it. A row here wins over the switch above, so name a field explicitly when the two sides call it different things. They stay editable afterwards — this fills a blank, it does not lock it, and a field the source has nothing for is left alone.</div>
    </div>`;
}

export function renderFieldConfig(fd, app, ctx) {
  const {
    h, state, canonicalCompanyId, companyName, wbOptRow, wbProgStopRow, wbProgressDisplayHtml,
    wbRelTargetApp, wbCompanyApps, wbTargetApp, wbRelLabel, companyContactFieldsFor,
    WB_PROGRESS_STOPS_DEFAULT, WB_FIELD_TYPES, WB_PROGRESS_DISPLAYS,
  } = ctx;
  const t = fd.type;
  if (t === 'category' || t === 'status' || t === 'tags') {
    // How the options are put in front of somebody filling in a record. A dropdown is typed
    // into and searched, which is the only thing that survives a long list; chips put every
    // option on screen, which is faster when there are three of them and the dropdown is a
    // click and a menu in the way. A status is usually a handful of stages, so chips suit it
    // for the same reason. Tags are excluded: they hold several values at once, and a row of
    // one-at-a-time chips would be the wrong control for that.
    const chips = t !== 'tags' && fd.config.display === 'chips';
    const displayRow = t !== 'tags' ? `<div class="wb-field"><label>Display style</label>
      <select class="wb-input" id="wbCatDisplay">
        <option value="dropdown" ${chips ? '' : 'selected'}>Dropdown — type to search</option>
        <option value="chips" ${chips ? 'selected' : ''}>Choice chips — every option on show</option>
      </select><div class="wb-sub">Chips suit a handful of options and pick in one click. A dropdown stays usable when there are many, and lets a new value be typed in.</div></div>` : '';
    return `<div class="wb-field"><label>Options</label><div class="wb-opt-list">${(fd.config.options || []).map((o) => wbOptRow(o)).join('')}</div><button class="btn btn-sm" data-wb-add-option><i class="ti ti-plus"></i>Add option</button>${t === 'tags' ? '<div class="wb-sub">Records can hold several of these at once.</div>' : ''}</div>${displayRow}`;
  }
  if (t === 'autonumber') {
    return `<div class="wb-field"><label>Prefix <span class="wb-opt">(optional)</span></label><input class="wb-input" id="wbAutoPrefix" value="${h(fd.config.prefix || '')}" placeholder="e.g. INV-" style="max-width:200px"></div>
      <div class="wb-field"><label>Minimum digits <span class="wb-opt">(zero-pad)</span></label><input type="number" min="0" max="10" class="wb-input" id="wbAutoPad" value="${h(String(fd.config.padding || 0))}" style="max-width:120px"><div class="wb-sub">e.g. 4 shows <b>${h(fd.config.prefix || '')}0007</b>. Numbers count up from the highest existing record.</div></div>`;
  }
  if (t === 'rollup') {
    const relFields = app.fields.filter((f) => f.type === 'relationship');
    const rel = relFields.find((f) => f.id === fd.config.relField);
    const ta = rel ? wbRelTargetApp(rel, canonicalCompanyId(state.builderModal.companyId)) : null;
    const numTargets = ta ? ta.fields.filter((f) => ['number', 'money', 'duration', 'progress', 'calculation', 'rating', 'rollup', 'date', 'created_time', 'updated_time'].includes(f.type)) : [];
    const AGGS = [['count', 'Count of records'], ['sum', 'Sum'], ['avg', 'Average'], ['min', 'Minimum'], ['max', 'Maximum'], ['earliest', 'Earliest date'], ['latest', 'Latest date']];
    const agg = fd.config.agg || 'count';
    if (!relFields.length) return '<div class="wb-field"><div class="wb-sub" style="color:var(--warning,#d97706)">Add a Relationship field first — a rollup summarizes the records it links to.</div></div>';
    return `<div class="wb-field"><label>Through relationship</label><select class="wb-input" id="wbRollRel" data-wb-rel-refresh><option value="">— Select a relationship —</option>${relFields.map((f) => `<option value="${h(f.id)}" ${fd.config.relField === f.id ? 'selected' : ''}>${h(f.label)}${(f.config.targetCompany && f.config.targetCompany !== canonicalCompanyId(state.builderModal.companyId)) ? ` (${h(companyName(f.config.targetCompany) || 'other workspace')})` : ''}</option>`).join('')}</select><div class="wb-sub">Summarize the records this relationship links to${ta ? ` in <b>${h(ta.name)}</b>` : ''}.</div></div>
      <div class="wb-field"><label>Summarize</label><select class="wb-input" id="wbRollAgg" data-wb-rel-refresh>${AGGS.map(([v, l]) => `<option value="${h(v)}" ${agg === v ? 'selected' : ''}>${h(l)}</option>`).join('')}</select></div>
      ${agg !== 'count' ? `<div class="wb-field"><label>Field to summarize</label><select class="wb-input" id="wbRollField"><option value="">— Select field —</option>${numTargets.map((f) => `<option value="${h(f.id)}" ${fd.config.targetField === f.id ? 'selected' : ''}>${h(f.label)}</option>`).join('')}</select>${ta && !numTargets.length ? '<div class="wb-sub" style="color:var(--warning,#d97706)">The linked app has no number or date fields to summarize.</div>' : ''}</div>` : ''}`;
  }
  if (t === 'file') {
    return `<div class="wb-check-row"><label class="wb-switch"><input type="checkbox" id="wbFileMulti" ${fd.config.multiple ? 'checked' : ''}><span class="wb-slider"></span></label>
      <div><b>Allow multiple files</b><div class="wb-sub">Attach several files to one record. Turning this off later keeps every file that is already attached — it only stops new ones being added.</div></div></div>`;
  }
  if (t === 'relationship') {
    const sourceCompany = canonicalCompanyId(state.builderModal.companyId);
    // Workspaces you can link to = the companies whose App Builder data your
    // account is allowed to load (workspace_builder_state RLS already gated this).
    const linkableCompanies = Object.keys(state.workspaceBuilderDocs || {})
      .map((cid) => ({ id: cid, name: cid === sourceCompany ? `${companyName(cid) || 'This workspace'} (this workspace)` : (companyName(cid) || cid) }))
      .sort((a, b) => (a.id === sourceCompany ? -1 : b.id === sourceCompany ? 1 : a.name.localeCompare(b.name)));
    const targetCompany = fd.config.targetCompany || sourceCompany;
    const apps = wbCompanyApps(targetCompany).map((e) => e.app);
    const targetApp = wbTargetApp(targetCompany, fd.config.targetApp);
    const displayFields = targetApp ? targetApp.fields : [];
    return `${linkableCompanies.length > 1 ? `<div class="wb-field"><label>Workspace <span class="wb-opt">(which workspace's app to link)</span></label><select class="wb-input" id="wbRelWorkspace" data-wb-rel-refresh>${linkableCompanies.map((c) => `<option value="${h(c.id)}" ${targetCompany === c.id ? 'selected' : ''}>${h(c.name)}</option>`).join('')}</select><div class="wb-sub">Pick a workspace you belong to. People who can't see that workspace will see “No access” here.</div></div>` : ''}
      <div class="wb-field"><label>Linked app</label><select class="wb-input" id="wbRelTarget" data-wb-rel-refresh><option value="">— Select app to link —</option>${apps.map((ap) => `<option value="${h(ap.id)}" ${fd.config.targetApp === ap.id ? 'selected' : ''}>${h(ap.name)}</option>`).join('')}</select><div class="wb-sub">Items in this app can reference — and pull a field from — items in the linked app.</div></div>
      ${targetApp ? `<div class="wb-field"><label>Show field <span class="wb-opt">(what to display from the linked item)</span></label><select class="wb-input" id="wbRelDisplay"><option value="">Item name (default)</option>${displayFields.map((f) => `<option value="${h(f.id)}" ${fd.config.displayField === f.id ? 'selected' : ''}>${h(f.label)}</option>`).join('')}</select><div class="wb-sub">Pick a field from <b>${h(targetApp.name)}</b> to show instead of the item's name.</div></div>` : ''}
      ${targetApp ? `<div class="wb-field"><label>Identify by <span class="wb-opt">(how records are labeled when choosing)</span></label><select class="wb-input" id="wbRelIdentify" data-wb-rel-refresh><option value="">Item name (default)</option>${displayFields.map((f) => `<option value="${h(f.id)}" ${fd.config.identifyField === f.id ? 'selected' : ''}>${h(f.label)}</option>`).join('')}</select><div class="wb-sub">Labels each <b>${h(targetApp.name)}</b> record in the pickers below so you can tell them apart — e.g. by <b>Project Name</b> instead of the shown field.</div></div>` : ''}
      ${targetApp ? `<div class="wb-field"><label>Specific record <span class="wb-opt">(optional — pin one record)</span></label><select class="wb-input" id="wbRelFixed" data-wb-rel-refresh><option value="">Let each item choose</option>${targetApp.items.map((it) => `<option value="${h(it.id)}" ${fd.config.fixedItem === it.id ? 'selected' : ''}>${h(wbRelLabel(targetApp, it, fd.config.identifyField))}</option>`).join('')}</select><div class="wb-sub">Pin every item to one <b>${h(targetApp.name)}</b> record. Leave unset to let each item choose.</div></div>` : ''}
      <div class="wb-check-row"><label class="wb-switch"><input type="checkbox" id="wbRelMulti" ${fd.config.multiple ? 'checked' : ''} ${fd.config.fixedItem ? 'disabled' : ''}><span class="wb-slider"></span></label><div><b>Allow multiple links</b>${fd.config.fixedItem ? '<div class="wb-sub">Disabled while a specific record is pinned.</div>' : ''}</div></div>
      ${targetApp && !fd.config.multiple ? pullConfigUI(h, fd, app, targetApp) : ''}`;
  }
  if (t === 'calculation') {
    const numFields = app.fields.filter((f) => ['number', 'money', 'calculation', 'duration', 'progress', 'checklist'].includes(f.type));
    return `<div class="wb-field"><label>Formula</label><input class="wb-input" id="wbCalcFormula" value="${h(fd.config.formula || '')}" placeholder="e.g. {Quantity} * {Unit Price}"><div class="wb-sub">Reference number, money, progress, or checklist fields by name in {curly braces} — a checklist contributes its % complete. Operators: + - * / ( )</div>${numFields.length ? `<div class="wb-calc-chips">${numFields.map((f) => `<button class="wb-tag wb-calc-chip" data-wb-insert="{${h(f.label)}}">${h(f.label)}</button>`).join('')}</div>` : '<div class="wb-sub" style="color:var(--warning,#d97706)">Add Number or Money fields first to reference them.</div>'}</div>`;
  }
  if (t === 'money') return `<div class="wb-field"><label>Currency symbol</label><input class="wb-input" id="wbCurSym" value="${h(fd.config.currency || '$')}" maxlength="3" style="max-width:120px"></div>`;
  if (t === 'number') return `<div class="wb-field"><label>Unit / suffix <span class="wb-opt">(optional)</span></label><input class="wb-input" id="wbNumUnit" value="${h(fd.config.unit || '')}" placeholder="e.g. sq ft, hrs" style="max-width:200px"></div>`;
  if (t === 'text' || t === 'textarea' || t === 'url') return `<div class="wb-field"><label>Placeholder <span class="wb-opt">(optional)</span></label><input class="wb-input" id="wbPhText" value="${h(fd.config.placeholder || '')}" placeholder="${t === 'url' ? 'https://…' : 'Hint shown in the input'}"></div>`;
  if (t === 'checklist') { const steps = Array.isArray(fd.config.steps) ? fd.config.steps.join('\n') : (fd.config.steps || ''); return `<div class="wb-field"><label>Default steps <span class="wb-opt">(optional, one per line)</span></label><textarea class="wb-input" id="wbClSteps" placeholder="Site inspection&#10;Material order&#10;Install&#10;Final walkthrough">${h(steps)}</textarea><div class="wb-sub">Every new item starts with these steps (all unchecked). Users can add or remove steps per item. Link its % complete into a Progress or Calculation field by referencing <code>{${h(fd.label || 'Checklist')}}</code>.</div></div>`; }
  if (t === 'progress') {
    const cfg = fd.config || {};
    const checklists = app.fields.filter((f) => f.type === 'checklist');
    // Sources on a linked record (progress or checklist reached via a relationship field).
    const linkOpts = [];
    app.fields.filter((f) => f.type === 'relationship' && f.config.targetApp).forEach((rf) => {
      const ta = wbRelTargetApp(rf, state.builderModal.companyId);
      if (!ta) return;
      ta.fields.filter((lf) => lf.type === 'checklist' || lf.type === 'progress').forEach((lf) => {
        linkOpts.push({ value: `link:${rf.id}:${lf.id}`, label: `${rf.label} → ${lf.label}` });
      });
    });
    const display = ['bar', 'ring', 'segments'].includes(cfg.display) ? cfg.display : 'bar';
    const mode = cfg.colorMode === 'scale' ? 'scale' : 'single';
    const stops = Array.isArray(cfg.stops) && cfg.stops.length ? cfg.stops : WB_PROGRESS_STOPS_DEFAULT;
    const previewPct = 65;
    const colorBlock = mode === 'single'
      ? `<div class="wb-field"><label>Bar color</label><input type="color" class="wb-stop-color" id="wbProgColor" value="${h(cfg.color || WB_FIELD_TYPES.progress.color)}"></div>`
      : `<div class="wb-field"><label>Color stops <span class="wb-opt">(value ≤ % uses that color)</span></label>
          <div class="wb-prog-stops" id="wbProgStops">${stops.map((s) => wbProgStopRow(s)).join('')}</div>
          <button class="btn btn-sm" data-wb-add-stop type="button"><i class="ti ti-plus"></i>Add color stop</button>
          <div class="wb-sub">The lowest stop whose % is ≥ the value wins. Example: 0→white, 20→red, 40→yellow, 80→orange, 100→green.</div></div>`;
    return `
      <div class="wb-field"><label>Fill from</label><select class="wb-input" id="wbProgSource">
        <option value="">Manual (drag the slider)</option>
        ${checklists.length ? `<optgroup label="This app">${checklists.map((f) => `<option value="${h(f.id)}" ${cfg.source === f.id ? 'selected' : ''}>Checklist: ${h(f.label)}</option>`).join('')}</optgroup>` : ''}
        ${linkOpts.length ? `<optgroup label="Linked record">${linkOpts.map((o) => `<option value="${h(o.value)}" ${cfg.source === o.value ? 'selected' : ''}>${h(o.label)}</option>`).join('')}</optgroup>` : ''}
      </select><div class="wb-sub">Auto-fill from a checklist in this app, or from a linked record's progress/checklist (via a Relationship field). Multiple links are averaged.</div></div>
      <div class="wb-field"><label>Display style</label><select class="wb-input" id="wbProgDisplay" data-wb-prog-refresh>${WB_PROGRESS_DISPLAYS.map(([v, l]) => `<option value="${v}" ${display === v ? 'selected' : ''}>${h(l)}</option>`).join('')}</select></div>
      <div class="wb-field"><label>Color</label><select class="wb-input" id="wbProgColorMode" data-wb-prog-refresh><option value="single" ${mode === 'single' ? 'selected' : ''}>Single color</option><option value="scale" ${mode === 'scale' ? 'selected' : ''}>Change by percentage</option></select></div>
      ${colorBlock}
      <div class="wb-field"><label>Preview <span class="wb-opt">at ${previewPct}%</span></label><div class="wb-prog-preview" id="wbProgPreview">${wbProgressDisplayHtml(fd, previewPct)}</div></div>`;
  }
  if (t === 'sheet') {
    const start = normalizeSheetFull(fd.config.sheet || {});
    const filled = Object.keys(start.cells).length;
    return `
      <div class="wb-field"><label>Starting sheet</label>
        <div class="wb-sub">Every new record begins from this. Lay it out once — headings, prices, the formulas that add it up — and each record gets its own copy to fill in.</div>
        <div class="wb-sheet-card" style="margin-top:10px">
          ${filled ? `<div class="wb-sub">${filled} cell${filled === 1 ? '' : 's'} across ${start.rows} × ${start.cols}.</div>` : '<div class="wb-sub">Empty — every record starts blank.</div>'}
          <input type="hidden" id="wbSheetDefault" data-f="wbSheetDefault" data-wb-sheet-title="Starting sheet" value="${h(JSON.stringify(start))}" />
          <button class="btn btn-sm" type="button" data-wb-sheet-open="wbSheetDefault"><i class="ti ti-table"></i>${filled ? 'Edit the starting sheet' : 'Build the starting sheet'}</button>
        </div>
      </div>
      <div class="wb-check-row">
        <label class="wb-switch"><input type="checkbox" id="wbSheetHeader" ${start.headerRow ? 'checked' : ''}><span class="wb-slider"></span></label>
        <div><b>First row is headings</b><div class="wb-sub">Draws row 1 as column headings, and keeps it as headings when the sheet is printed.</div></div>
      </div>`;
  }
  if (t === 'button') {
    const sourceCompany = canonicalCompanyId(state.builderModal.companyId);
    const companies = Object.keys(state.workspaceBuilderDocs || {})
      .map((cid) => ({ id: cid, name: cid === sourceCompany ? `${companyName(cid) || 'This workspace'} (this workspace)` : (companyName(cid) || cid) }))
      .sort((a, b) => (a.id === sourceCompany ? -1 : b.id === sourceCompany ? 1 : a.name.localeCompare(b.name)));
    const targetCompany = fd.config.targetCompany || sourceCompany;
    // Not this app: a button that files a record into the app it is already in is a loop
    // somebody has to notice for themselves.
    const apps = wbCompanyApps(targetCompany).map((entry) => entry.app).filter((item) => item.id !== app.id);
    const targetApp = wbTargetApp(targetCompany, fd.config.targetApp);
    const carryable = pushableFields(app, fd.id);
    const chosen = Array.isArray(fd.config.fields) ? fd.config.fields : [];
    // Whether the picker is open is its OWN setting, not "are any fields chosen". Inferring it
    // from the list made the switch impossible to turn off: flipping it collected a list that
    // was still empty, an empty list reads as "everything", and the panel drew the switch back
    // on. A button configured before this reads as picking whenever it named fields.
    const picking = fd.config.pickFields === undefined ? chosen.length > 0 : !!fd.config.pickFields;
    // An empty list means every field -- the same rule pushableFields applies -- so the boxes
    // start all ticked and you untick what you do not want, rather than facing an empty list
    // whose summary underneath says it carries everything.
    const ticked = chosen.length ? new Set(chosen) : null;
    const testable = (app.fields || []).filter((field) => field.id !== fd.id && field.type !== 'button');
    const rules = Array.isArray(fd.config.when) && fd.config.when.length ? fd.config.when : [{ field: '', op: 'eq', value: '' }];
    const plan = targetApp ? planPush(app, targetApp, fd) : null;
    const names = (list) => list.map((label) => h(label)).join('</b>, <b>');
    const action = ['set', 'move', 'link'].includes(fd.config.action) ? fd.config.action : 'push';
    // Fields this record already holds that a link can be built from. Text is included because
    // a company keeps a booking URL or a portal code in one often enough to matter; a rating or
    // a checklist is not something you can dial.
    const LINKABLE = ['phone', 'email', 'url', 'text'];
    const linkable = (app?.fields || []).filter((field) => field && LINKABLE.includes(field.type));
    // One press for the three anybody actually wants, wired to the first field of that kind.
    const linkQuick = [
      ['Call', 'ti-phone', 'tel:', 'phone'],
      ['Email', 'ti-mail', 'mailto:', 'email'],
      ['Open', 'ti-external-link', '', 'url'],
    ];
    // A contact cannot be "moved" -- it lives in the directory, not in the app it was sent to --
    // so the option is withheld where it has no meaning rather than offered and then refused.
    const allowMove = app?.allowMove !== false;
    // Fields this button could write to: everything the record actually stores.
    const settable = pushableFields(app, fd.id);
    const setRows = Array.isArray(fd.config.set) && fd.config.set.length ? fd.config.set : [{ field: '', value: '' }];
    const setRow = (row, index) => `
      <div class="wb-set-row" data-wb-set-row data-index="${index}">
        <select class="wb-input" data-wb-set-field>
          <option value="">— Pick a field —</option>
          ${settable.map((field) => `<option value="${h(field.id)}" ${row.field === field.id ? 'selected' : ''}>${h(field.label)}</option>`).join('')}
        </select>
        <input class="wb-input" data-wb-set-value value="${h(row.value ?? '')}" placeholder="Leave empty to clear" />
        <button type="button" class="wb-icon-btn danger" data-wb-set-del title="Remove" aria-label="Remove this change"><i class="ti ti-x"></i></button>
      </div>`;

    const ruleRow = (rule, index) => `
      <div class="wb-when-row" data-wb-when-row data-index="${index}">
        <select class="wb-input" data-wb-when-field data-wb-rel-refresh>
          <option value="">— Always enabled —</option>
          ${testable.map((field) => `<option value="${h(field.id)}" ${rule.field === field.id ? 'selected' : ''}>${h(field.label)}</option>`).join('')}
        </select>
        <select class="wb-input" data-wb-when-op data-wb-rel-refresh>
          ${BUTTON_OPS.map(([op, label]) => `<option value="${h(op)}" ${rule.op === op ? 'selected' : ''}>${h(label)}</option>`).join('')}
        </select>
        <input class="wb-input" data-wb-when-value value="${h(rule.value ?? '')}" placeholder="Value" ${['filled', 'empty'].includes(rule.op) ? 'disabled' : ''} />
        <button type="button" class="wb-icon-btn danger" data-wb-when-del title="Remove" aria-label="Remove this condition"><i class="ti ti-x"></i></button>
      </div>`;

    return `
      <div class="wb-field"><label>Button text <span class="wb-opt">(optional)</span></label>
        <input class="wb-input" id="wbBtnText" value="${h(fd.config.text || '')}" placeholder="Leave empty for no text" maxlength="40">
      </div>
      <div class="wb-field"><label>Icon <span class="wb-opt">(optional)</span></label>
        <div class="wb-icon-pick">
          <label class="wb-icon-opt ${fd.config.icon ? '' : 'on'}" title="No icon">
            <input type="radio" name="wbBtnIcon" value="" ${fd.config.icon ? '' : 'checked'}><i class="ti ti-ban"></i>
          </label>
          ${[...WB_ACTION_ICONS, ...WB_APP_ICONS.filter((icon) => !WB_ACTION_ICONS.includes(icon))].map((icon) => `<label class="wb-icon-opt ${fd.config.icon === icon ? 'on' : ''}" title="${h(icon.replace('ti-', '').replace(/-/g, ' '))}">
            <input type="radio" name="wbBtnIcon" value="${h(icon)}" ${fd.config.icon === icon ? 'checked' : ''}><i class="ti ${h(icon)}"></i>
          </label>`).join('')}
        </div>
        <div class="wb-sub">Text, an icon, or both. With neither, the button is blank — it still works, and screen readers still read the field's name.</div>
      </div>
      <div class="wb-field"><label>Enabled when <span class="wb-opt">(leave it on “Always enabled” for no condition)</span></label>
        <div class="wb-when-list">${rules.map(ruleRow).join('')}</div>
        <button class="btn btn-sm" type="button" data-wb-when-add><i class="ti ti-plus"></i>Add a condition</button>
        <div class="wb-sub">Every condition has to hold. A stage or category is matched on what it says, so type <b>Won</b> rather than an option id. The button follows the form as it is filled in — changing the stage lights it up without saving first.</div>
      </div>
      <div class="wb-field"><label>What the button does</label>
        <select class="wb-input" id="wbBtnAction" data-wb-rel-refresh>
          <option value="push" ${action === 'push' ? 'selected' : ''}>Send a copy to another app</option>
          ${allowMove ? `<option value="move" ${action === 'move' ? 'selected' : ''}>Send it and remove it from this app</option>` : ''}
          <option value="set" ${action === 'set' ? 'selected' : ''}>Change fields on this record</option>
          <option value="link" ${action === 'link' ? 'selected' : ''}>Open a link, call or email</option>
        </select>
      </div>
      ${action === 'link' ? `
        <div class="wb-field"><label>Where it goes</label>
          <input class="wb-input" type="text" id="wbBtnHref" value="${h(fd.config.href || '')}" placeholder="tel:{Phone}" />
          <div class="wb-sub">A web address, <b>tel:5551234567</b>, or <b>mailto:someone@example.com</b>. Only web, phone, SMS and email links are allowed.</div>
          ${linkable.length ? `
            <div class="wb-href-fields">
              <span class="wb-sub">Use this record's own data — click to insert:</span>
              <div class="wb-chip-pick">
                ${linkable.map((field) => `
                  <button type="button" class="wb-chip" data-wb-href-field="${h(field.label)}" title="Insert {${h(field.label)}}">
                    <i class="ti ${h(WB_FIELD_TYPES[field.type]?.icon || 'ti-square')}"></i>${h(field.label)}
                  </button>`).join('')}
              </div>
              <div class="wb-sub">A field in braces is filled in from the record the button is on, so one button works on every record — <b>tel:{Phone}</b> dials whoever you are looking at.</div>
            </div>`
    : '<div class="wb-sub">This app has no phone, email or link field yet — add one and it can be filled in from the record.</div>'}
          <div class="wb-href-quick">
            ${linkQuick.map(([label, icon, prefix, type]) => {
    const field = linkable.find((entry) => entry.type === type);
    if (!field) return '';
    return `<button type="button" class="btn btn-sm" data-wb-href-set="${h(`${prefix}{${field.label}}`)}"><i class="ti ${icon}"></i>${label}</button>`;
  }).join('')}
          </div>
        </div>` : ''}
      ${action === 'set' ? `
        <div class="wb-field"><label>Change these fields</label>
          <div class="wb-check-row">
            <label class="wb-switch"><input type="checkbox" id="wbBtnClearAll" ${fd.config.clearAll ? 'checked' : ''} data-wb-rel-refresh><span class="wb-slider"></span></label>
            <div><b>Clear every field</b><div class="wb-sub">Empties the whole record in one press. Automatic fields are left alone — a value written to a calculation or a created time vanishes on the next render.</div></div>
          </div>
          ${fd.config.clearAll ? '' : `
            <div class="wb-set-list">${setRows.map(setRow).join('')}</div>
            <button class="btn btn-sm" type="button" data-wb-set-add><i class="ti ti-plus"></i>Change a field</button>
            <div class="wb-sub">Leave the value empty to clear that field. A stage or category is set by what it says, so type <b>Won</b> — a word the field has never heard of is skipped rather than added to its list. Pressed in the list it saves the record; pressed on an open record it fills the boxes and leaves them for you to save.</div>`}
        </div>
      ` : action === 'link' ? '' : `
      <div class="wb-field"><label>Send the record to</label>
        ${companies.length > 1 ? `<select class="wb-input" id="wbBtnCompany" data-wb-rel-refresh>${companies.map((company) => `<option value="${h(company.id)}" ${targetCompany === company.id ? 'selected' : ''}>${h(company.name)}</option>`).join('')}</select>` : ''}
        <select class="wb-input" id="wbBtnApp" data-wb-rel-refresh><option value="">— Select an app —</option>${apps.map((item) => `<option value="${h(item.id)}" ${fd.config.targetApp === item.id ? 'selected' : ''}>${h(item.name)}</option>`).join('')}</select>
        <div class="wb-sub">Pressing it adds a record there carrying this one's values.</div>
      </div>
      <div class="wb-field wb-push-only"><label>What to send</label>
        <div class="wb-check-row">
          <label class="wb-switch"><input type="checkbox" id="wbBtnAll" ${picking ? '' : 'checked'} data-wb-rel-refresh><span class="wb-slider"></span></label>
          <div><b>Everything on the record</b><div class="wb-sub">Turn this off to pick particular fields.</div></div>
        </div>
        ${picking ? `<div class="wb-pick-list">${carryable.map((field) => `<label class="wb-pick"><input type="checkbox" data-wb-btn-field="${h(field.id)}" ${!ticked || ticked.has(field.id) ? 'checked' : ''}><span>${h(field.label)}</span></label>`).join('')}</div>${carryable.length ? '' : '<div class="wb-sub">Nothing on this record can be carried across, so there is nothing to pick.</div>'}` : ''}
      </div>
      `}
      ${action !== 'set' && action !== 'link' && plan ? `<div class="wb-field"><div class="wb-sub wb-plan">
        ${plan.carry.length ? `Carries <b>${names(plan.carry.map((pair) => pair.from.label))}</b>.` : 'Nothing on this record can be carried across yet.'}
        ${plan.create.length ? ` <b>${h(targetApp.name)}</b> has no <b>${names(plan.create.map((field) => field.label))}</b>, so ${plan.create.length === 1 ? 'it is added' : 'they are added'} there on the first send. Records already in that app keep every value they have and read blank in the new ${plan.create.length === 1 ? 'column' : 'columns'}.` : ''}
        ${plan.blocked.length ? ` <b>${names(plan.blocked)}</b> ${plan.blocked.length === 1 ? 'stays' : 'stay'} behind: an automatic field belongs to the app that filled it in.` : ''}
        ${plan.skipped.length ? ` ${plan.skipped.map((entry) => h(`${entry.field.label} is left behind — ${entry.why}`)).join('. ')}.` : ''}
        ${action === 'move' ? ` Then the record is <b>removed from ${h(app.name)}</b>. Its fields stay exactly as they are here — this app keeps its shape and every other record; only the one that was sent is gone.` : ''}
      </div></div>` : ''}`;
  }
  if (t === 'company_contact') {
    const contactFields = companyContactFieldsFor(canonicalCompanyId(state.builderModal.companyId));
    const source = contactSourceApp(contactFields);
    const panel = pullConfigUI(h, fd, app, source, {
      heading: 'Fill this record in from the contact',
      noun: 'a contact',
      shared: 'the fields this app and <b>Company Contacts</b> call the same thing',
      defaultOn: true,
    });
    return panel || `<div class="wb-sub">Add fields to <b>Company Contacts</b> and any that share a name with a field here will be filled in when a contact is picked.</div>`;
  }
  return '<div class="wb-sub">No extra configuration needed for this field type.</div>';
}

/**
 * The input control for one field on a record form -- text boxes, option pickers, user
 * pickers, checklists, ratings, progress bars and the rest.
 *
 * A factory rather than a plain export because the body calls itself for nested cases,
 * and closing over the context lets those recursive calls keep the original four-argument
 * shape. The body is otherwise unchanged from main.js.
 */
export function createFieldInput(ctx) {
  const {
    h, WB_FIELD_TYPES, companyContactOptions, wbMembers, wbRelTargetApp, wbDoc, wbRelLabel, wbProgressColor,
    wbProgressDisplayHtml, wbChecklistValue, wbChecklistBodyHtml, wbRatingStars, wbAutoNumberText,
    companyContactFieldsFor,
  } = ctx;
  // The app a field belongs to. A linked app is a pointer with no fields of its own, so it
  // cannot match and cannot be returned by mistake.
  function ownerAppOf(companyId, fieldId) {
    for (const workspace of wbDoc(companyId)?.workspaces || []) {
      for (const candidate of workspace.apps || []) {
        if ((candidate.fields || []).some((field) => field.id === fieldId)) return candidate;
      }
    }
    return null;
  }

  function wbRenderFieldInput(companyId, workspaceId, f, val) {
    const meta = WB_FIELD_TYPES[f.type];
    // The field's own name only. The type used to be printed beside it -- "Contact
    // Company Contact", "Type Category / Dropdown" -- which is builder vocabulary shown to
    // somebody filling in a record: it reads as part of the label, so the label looks wrong.
    // Whoever is typing can already see what the control is; whoever needs the type is in the
    // field editor, where it is on screen anyway.
    const lbl = `<label>${h(f.label)}${f.required ? '<span class="wb-req">*</span>' : ''}</label>`;
    let input = '';
    switch (f.type) {
      case 'text': input = `<input class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" placeholder="${h(f.config.placeholder || '')}">`; break;
      case 'textarea': input = `<textarea class="wb-input" data-f="${h(f.id)}" placeholder="${h(f.config.placeholder || '')}">${h(val || '')}</textarea>`; break;
      case 'email': input = `<input type="email" class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" placeholder="name@email.com">`; break;
      case 'url': input = `<input type="url" inputmode="url" class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" placeholder="${h(f.config.placeholder || 'https://…')}">`; break;
      case 'phone': input = `<input type="tel" class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" placeholder="555 123 4567" inputmode="tel" autocomplete="tel" data-phone-format>`; break;
      case 'number': input = `<div class="wb-inline"><input type="text" inputmode="numeric" class="wb-input" data-f="${h(f.id)}" data-digits-only value="${h(val ?? '')}" style="max-width:200px">${f.config.unit ? `<span class="wb-sub">${h(f.config.unit)}</span>` : ''}</div>`; break;
      case 'money': input = `<div class="wb-inline"><span class="wb-cur">${h(f.config.currency || '$')}</span><input type="number" step="0.01" class="wb-input" data-f="${h(f.id)}" value="${h(val ?? '')}" style="max-width:220px"></div>`; break;
      case 'date': input = `<input type="date" class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" style="max-width:220px">`; break;
      case 'checkbox': input = `<label class="wb-switch"><input type="checkbox" data-f="${h(f.id)}" ${val ? 'checked' : ''}><span class="wb-slider"></span></label>`; break;
      // A type-ahead over the app's own options, not a <select>. Blank until you click it,
      // filters as you type, and a value nobody has used before joins the list rather than
      // being refused -- the same control the contacts form uses.
      //
      // The <select>'s job is done by a hidden input carrying the option ID, so every read,
      // write, automation and submit that looks for [data-f] is unchanged. The visible input
      // holds the LABEL, because that is what somebody types.
      case 'category': case 'status': {
        const chosen = (f.config.options || []).find((o) => o.id === val);
        const labels = (f.config.options || []).map((o) => o.label);
        // Chips are the other half of the Category field's "Display style": every option on
        // screen, one click to pick, clicking the picked one again to clear. The chosen option
        // ID still lives in the same hidden [data-f] input the combobox writes to, so saving,
        // automations, the table and every filter read it without knowing which style drew it.
        // Only where there are options to draw -- an empty chip row is a dead end, so that
        // falls back to the combobox, which at least accepts a typed value.
        if (f.config.display === 'chips' && (f.config.options || []).length) {
          const noun = String(f.label || 'option').toLowerCase();
          input = `<div class="wb-chip-pick" data-wb-chip-pick role="group" aria-label="${h(f.label)}">
            <input type="hidden" data-f="${h(f.id)}" value="${h(val || '')}" />
            ${f.config.options.map((o) => wbChipHtml(h, o, o.id === val)).join('')}
            <button type="button" class="wb-chip wb-chip-other" data-wb-chip-other><i class="ti ti-plus"></i>Other</button>
            <span class="wb-chip-new" data-wb-chip-new hidden>
              <input class="wb-input" type="text" data-wb-chip-new-input autocomplete="off" placeholder="${h(`New ${noun}`)}" aria-label="${h(`New ${noun}`)}" />
              <button type="button" class="btn btn-sm btn-primary" data-wb-chip-add><i class="ti ti-check"></i>Done</button>
              <button type="button" class="wb-chip-new-x" data-wb-chip-cancel aria-label="Cancel">&times;</button>
            </span>
          </div>`;
          break;
        }
        input = `
          <div class="wb-option-combo job-type-combobox" data-wb-option-combo>
            <input type="hidden" data-f="${h(f.id)}" value="${h(val || '')}" />
            <input class="wb-input" type="text" value="${h(chosen ? chosen.label : '')}"
              data-job-type-input data-job-type-options="${h(JSON.stringify(labels))}"
              data-job-type-allow-custom="true" data-wb-option-input="${h(f.id)}"
              autocomplete="off" placeholder="${h(`Type or pick a ${String(f.label || 'value').toLowerCase()}`)}" />
            <button class="job-type-toggle" type="button" data-job-type-toggle aria-label="Show ${h(String(f.label || 'value').toLowerCase())} options"><i class="ti ti-chevron-down"></i></button>
            <div class="job-type-suggestions-menu" data-job-type-menu hidden></div>
          </div>`;
        break;
      }
      case 'user': {
        const members = wbMembers(companyId);
        input = members.length ? `<select class="wb-input" data-f="${h(f.id)}"><option value="">— Unassigned —</option>${members.map((m) => `<option value="${h(m.id)}" ${val === m.id ? 'selected' : ''}>${h(m.name)}</option>`).join('')}</select>` : '<div class="wb-sub" style="color:var(--warning,#d97706)">No company members to assign.</div>'; break;
      }
      // A datalist, not a <select>: a company directory runs to hundreds of people and the
      // only way to find one in a dropdown is to scroll. The visible input carries the name
      // and the hidden input carries the id, so a renamed contact does not break the link.
      // A control, not a value: it moves the record somewhere rather than storing anything, so
      // it carries no [data-f] and nothing reads it back on save. Its conditions ride on the
      // element and are judged against the FORM, so changing a stage lights it up immediately
      // rather than after a save and a reload.
      case 'button': {
        // Text, an icon, or both -- and with neither, a blank button, which is a deliberate
        // choice rather than a broken one. It keeps an aria-label either way: invisible to the
        // eye is fine, invisible to a screen reader is not.
        const text = String(f.config.text || '').trim();
        const icon = String(f.config.icon || '').trim();
        const rules = (Array.isArray(f.config.when) ? f.config.when : []).filter((rule) => rule && rule.field && rule.op);
        // What "ready" means depends on the action: a destination for one, something to change
        // for the other.
        const ready = buttonReady(f);
        return `<div class="wb-fieldbox wb-btnfield">${lbl}
          <button class="btn btn-primary wb-push-btn" type="button" data-wb-press="${h(f.id)}"
            data-wb-when="${h(JSON.stringify(rules))}" ${ready ? '' : 'disabled data-wb-no-target="1"'}
            aria-label="${h(text || f.label || 'Send')}"
            title="${h(ready ? '' : buttonNotReady(f))}">${icon ? `<i class="ti ${h(icon)}"></i>` : ''}${h(text)}</button>
          ${ready ? '' : `<div class="wb-sub">${h(buttonNotReady(f))} Open the field to set it up.</div>`}
        </div>`;
      }
      // A sheet is stored as JSON in a hidden input, so the form's existing read and save need
      // to know nothing about it. What is on the page is a preview and a way in.
      case 'sheet': {
        const stored = (() => { try { return typeof val === 'string' ? JSON.parse(val || '{}') : (val || {}); } catch { return {}; } })();
        const start = Object.keys(stored?.cells || {}).length ? stored : (f.config.sheet || {});
        const view = sheetPreview(start);
        const grid = view.filled
          ? `<table class="wb-sheet-mini">${view.rows.map((row) => `<tr>${row.map((cell) => `<td>${h(cell)}</td>`).join('')}</tr>`).join('')}</table>`
          : '<div class="wb-sub">Empty sheet.</div>';
        // The name is the sheet's own, and it is what every list, column, search result and
        // export shows -- so it is typed here rather than guessed from the field label. An
        // import fills it in from the file, which is usually the answer anyway.
        const sheetName = String(start?.title || '').trim();
        return `<div class="wb-fieldbox wb-sheetfield">${lbl}
          <input type="hidden" data-f="${h(f.id)}" data-wb-sheet-title="${h(f.label)}" value="${h(JSON.stringify(start))}" />
          <div class="wb-sheet-card">
            <label class="wb-sheet-name">
              <span>File name</span>
              <input class="wb-input" type="text" data-wb-sheet-name="${h(f.id)}" value="${h(sheetName)}" maxlength="120" placeholder="Spreadsheet" />
            </label>
            ${grid}
            <button class="btn btn-sm" type="button" data-wb-sheet-open="${h(f.id)}"><i class="ti ti-table"></i>${view.filled ? 'Open sheet' : 'Start the sheet'}</button>
          </div>
        </div>`;
      }
      case 'company_contact': {
        const options = companyContactOptions(companyId);
        const listId = `wbcr-${f.id}`;
        const current = options.find((option) => option.id === String(val || ''));
        // Which fields a chosen contact fills in, as [contactFieldId, thisAppFieldId]. Worked
        // out once for the picker rather than per contact: the values themselves are read off
        // the contact at the moment it is chosen, so a directory of five hundred people costs
        // the same markup as one.
        const pull = contactPullMap(ownerAppOf(companyId, f.id), companyContactFieldsFor(companyId), f);
        input = `
          <div class="wb-inline wb-cc-picker" data-wb-cc-picker ${pull.length ? `data-wb-cc-pull="${h(JSON.stringify(pull))}"` : ''}>
            <span class="wb-cur"><i class="ti ti-address-book"></i></span>
            <input class="wb-input" list="${h(listId)}" data-wb-cc-name value="${h(current ? current.name : '')}" placeholder="${options.length ? 'Search the company directory…' : 'No company contacts yet'}" autocomplete="off" />
            <input type="hidden" data-f="${h(f.id)}" data-wb-cc-id value="${h(current ? current.id : '')}" />
            <datalist id="${h(listId)}">${options.map((option) => `<option value="${h(option.name)}"${option.detail ? ` label="${h(option.detail)}"` : ''}></option>`).join('')}</datalist>
          </div>`;
        break;
      }
      case 'relationship': {
        const ta = wbRelTargetApp(f, companyId);
        if (!ta) { input = `<div class="wb-sub" style="color:var(--warning,#d97706)">${f.config.targetCompany && !wbDoc(f.config.targetCompany) ? 'Linked workspace not available to you.' : 'No linked app configured.'}</div>`; break; }
        // A pinned record: every item links to the same record — show it read-only.
        if (f.config.fixedItem) {
          const fixed = ta.items.find((it) => it.id === f.config.fixedItem);
          input = `<input type="hidden" data-f="${h(f.id)}" value="${h(f.config.fixedItem)}"><div class="wb-rel-fixed"><span class="wb-tag wb-rel"><i class="ti ti-pin"></i>${h(fixed ? wbRelLabel(ta, fixed, f.config.displayField) : 'Pinned record missing')}</span><span class="wb-sub">Pinned to <b>${h(ta.name)}</b></span></div>`;
          break;
        }
        const cur = Array.isArray(val) ? val : (val ? [val] : []);
        // Options are labeled by the "Identify by" field so records are easy to
        // pick apart; cells still display the "Show field" value.
        // A plain <select> is fine for five records and unusable for five hundred: the only
        // way to find one is to scroll. Single-select becomes a type-ahead -- start typing
        // and matching records appear, pick one. The <select> stays underneath as the value
        // holder, so everything that reads or writes this field is unchanged and it still
        // submits, sorts and validates exactly as before.
        //
        // Multi-select keeps the plain list: a combobox that has to show several chosen
        // records at once is a different control, and half-building it would be worse than
        // the list that already works.
        // Each option carries what picking it would copy, resolved here where both apps are
        // in hand. The picker then just writes values and needs to know nothing about apps.
        // Shared-by-name pairs plus the hand-written rows. wbRenderFieldInput is handed the
        // FIELD, not the app it belongs to, so the owner is found by looking for the app that
        // carries this field id -- cheap, and it works on the record page as well as the modal.
        const pulls = effectivePull(ownerAppOf(companyId, f.id), ta, f);
        const pullFor = (item) => {
          if (!pulls.length) return '';
          const out = {};
          pulls.forEach((pair) => {
            const src = (ta.fields || []).find((x) => x.id === pair.from);
            if (!src) return;
            const raw = item?.values?.[src.id];
            // Blanks travel too. Picking a different record refreshes the fields this copy
            // filled, and "the new record has nothing here" is an instruction to empty one --
            // without it, the first record's value would sit there, silently wrong.
            if (raw === undefined || raw === null || raw === '') { out[pair.to] = ''; return; }
            // A status/category stores an option id that means nothing in the other app, so
            // the LABEL travels and the destination matches its own option by text.
            if (src.type === 'status' || src.type === 'category') {
              const option = (src.config?.options || []).find((o) => o.id === raw);
              out[pair.to] = option ? String(option.label) : '';
              return;
            }
            // A file or a checklist is not a value that can be copied into another field; the
            // pair is dropped entirely rather than blanking a field it could never fill.
            if (typeof raw === 'object') return;
            out[pair.to] = String(raw);
          });
          return Object.keys(out).length ? JSON.stringify(out) : '';
        };
        // Two records can carry the same Identify-by value -- two leads for the same person --
        // and a list of identical rows is a coin toss. Each row also carries what the Show
        // field says, which is the thing that tells them apart.
        const options = ta.items.map((it) => {
          const label = wbRelLabel(ta, it, f.config.identifyField);
          const shown = f.config.displayField ? wbRelLabel(ta, it, f.config.displayField) : '';
          // Only when it adds something: with no Show field set both fall back to the item
          // title, and "Roman — Roman" is noise pretending to be a distinction.
          const detail = shown && shown !== label ? shown : '';
          return { id: it.id, label, detail, text: detail ? `${label} — ${detail}` : label, pull: pullFor(it) };
        });
        const selectMarkup = `<select class="wb-input" data-f="${h(f.id)}" ${f.config.multiple ? 'multiple style="min-height:96px"' : ''}>${f.config.multiple ? '' : '<option value="">— None —</option>'}${options.map((it) => `<option value="${h(it.id)}" ${cur.includes(it.id) ? 'selected' : ''}${it.pull ? ` data-pull="${h(it.pull)}"` : ''}${it.detail ? ` data-detail="${h(it.detail)}"` : ''}>${h(it.text)}</option>`).join('')}</select>`;
        if (f.config.multiple) {
          input = `${selectMarkup}<div class="wb-sub">Linked to <b>${h(ta.name)}</b> · hold Ctrl/Cmd to select multiple</div>`;
          break;
        }
        const chosen = options.find((it) => it.id === cur[0]);
        input = `
          <div class="wb-rel-pick" data-wb-rel-pick>
            <div class="wb-rel-pick-hidden">${selectMarkup}</div>
            <input class="wb-input wb-rel-search" type="text" role="combobox" autocomplete="off"
              aria-expanded="false" aria-autocomplete="list"
              placeholder="${h(`Search ${ta.name}…`)}" value="${h(chosen ? chosen.text : '')}"
              data-wb-rel-search />
            <button type="button" class="wb-rel-clear" data-wb-rel-clear title="Clear" aria-label="Clear"${chosen ? '' : ' hidden'}><i class="ti ti-x"></i></button>
            <div class="wb-rel-results" data-wb-rel-results role="listbox" hidden></div>
          </div>
          <div class="wb-sub">Linked to <b>${h(ta.name)}</b> · type to search ${h(String(options.length))} record${options.length === 1 ? '' : 's'}</div>`;
        break;
      }
      case 'file': input = `
        <div class="wb-file-field" data-wb-file ${f.config.multiple ? 'data-wb-file-multi' : ''}>
          <input type="hidden" data-f="${h(f.id)}" value="${h(typeof val === 'object' ? JSON.stringify(val) : (val || ''))}" />
          <input type="file" hidden accept="${acceptAttr('document')}" data-wb-file-input ${f.config.multiple ? 'multiple' : ''} />
          <button type="button" class="wb-file-drop" data-wb-file-open>
            <i class="ti ti-cloud-upload" data-wb-file-ico></i>
            <span class="wb-file-label" data-wb-file-label></span>
          </button>
          <!-- Multiple files get a list with a remove on each; a single file keeps the one
               row of actions it always had, because a list of one is just a row. -->
          ${f.config.multiple ? '<ul class="wb-file-list" data-wb-file-list></ul>' : `<div class="wb-file-actions" data-wb-file-actions hidden>
            <a class="btn btn-mini" data-wb-file-view target="_blank" rel="noreferrer"><i class="ti ti-eye"></i>View</a>
            <a class="btn btn-mini" data-wb-file-download><i class="ti ti-download"></i>Download</a>
            <button type="button" class="btn btn-mini danger" data-wb-file-remove><i class="ti ti-x"></i>Remove</button>
          </div>`}
          <div class="wb-file-progress" data-wb-file-progress hidden><div class="wb-file-bar" data-wb-file-bar></div></div>
        </div>`; break;
      // The formula is not printed under the box. On a record form it is noise -- nobody
      // filling in a case needs to read ({Material} + {Labor} + …) * ({Overhead %} + …) / 100
      // to understand a number they cannot edit -- and it pushed the fields that DO need
      // filling in off the screen. It stays as the box's tooltip, and in full in the field
      // editor, which is where a formula is actually worked on.
      case 'calculation': input = `<div class="wb-input wb-calc-display" data-calc="${h(f.id)}" title="${h(f.config.formula ? `Auto-calculated: ${f.config.formula}` : 'Auto-calculated')}">—</div>${f.config.formula ? '' : '<div class="wb-sub">No formula set yet.</div>'}`; break;
      // The pin is a button, not decoration: it opens the same map picker the CRM uses, so
      // an address can be dropped or found rather than typed from memory.
      case 'location': input = `<div class="wb-inline"><button class="wb-cur wb-pin-btn" type="button" data-action="wb-location-pin" data-wb-loc-for="${h(f.id)}" title="Pick this on a map" aria-label="Pick ${h(f.name || 'location')} on a map"><i class="ti ti-map-pin"></i></button><input class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" placeholder="Address, city, or place"></div>`; break;
      case 'duration': {
        const mins = Math.max(0, Math.round(Number(val) || 0));
        input = `<div class="wb-inline wb-duration" data-wb-duration>
          <input type="hidden" data-f="${h(f.id)}" value="${val === '' || val == null ? '' : h(String(mins))}">
          <input type="number" min="0" class="wb-input" data-wb-dur-h value="${val === '' || val == null ? '' : h(String(Math.floor(mins / 60)))}" placeholder="0" style="max-width:90px"><span class="wb-sub">hrs</span>
          <input type="number" min="0" max="59" class="wb-input" data-wb-dur-m value="${val === '' || val == null ? '' : h(String(mins % 60))}" placeholder="0" style="max-width:90px"><span class="wb-sub">mins</span>
        </div>`; break;
      }
      case 'progress': {
        const p = Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
        const pColor = wbProgressColor(f, p);
        if (f.config && f.config.source) {
          // Linked to a checklist — read-only styled bar that recompute() keeps in sync.
          input = `<div class="wb-inline wb-progress-linked" data-wb-progress-linked>
            <span data-wb-prog-display style="flex:1">${wbProgressDisplayHtml(f, p)}</span>
            <input type="hidden" data-f="${h(f.id)}" value="${p}">
            <span class="wb-sub" style="flex:none"><i class="ti ti-link"></i> from checklist</span>
          </div>`;
        } else {
          input = `<div class="wb-inline wb-progress-edit" data-wb-progress><input type="range" min="0" max="100" step="1" data-f="${h(f.id)}" value="${p}" aria-label="${h(f.label)} percent" style="flex:1;accent-color:${h(pColor)}"><output data-wb-prog-out class="wb-prog-num" style="min-width:48px;text-align:right">${p}%</output></div>`;
        }
        break;
      }
      case 'checklist': {
        const items = wbChecklistValue(val, f);
        input = `<div class="wb-checklist" data-wb-checklist data-color="${h(meta.color)}">
          <input type="hidden" data-f="${h(f.id)}" value="${h(JSON.stringify(items))}">
          <div class="wb-cl-body">${wbChecklistBodyHtml(items, meta.color)}</div>
          <div class="wb-cl-add">
            <input class="wb-input" data-wb-cl-input placeholder="Add a step and press Enter">
            <button type="button" class="btn wb-cl-addbtn" data-wb-cl-add><i class="ti ti-plus"></i>Add</button>
          </div>
        </div>`; break;
      }
      case 'image': input = `
        <div class="wb-file-field wb-image-field" data-wb-file data-wb-image>
          <input type="hidden" data-f="${h(f.id)}" value="${h(typeof val === 'object' ? JSON.stringify(val) : (val || ''))}" />
          <input type="file" hidden accept="${acceptAttr('image')}" data-wb-file-input />
          <button type="button" class="wb-image-drop" data-wb-file-open>
            <span class="wb-img-preview" data-wb-img-preview><i class="ti ti-photo" data-wb-file-ico></i></span>
            <span class="wb-file-label" data-wb-file-label></span>
          </button>
          <div class="wb-file-actions" data-wb-file-actions hidden>
            <a class="btn btn-mini" data-wb-file-view target="_blank" rel="noreferrer"><i class="ti ti-eye"></i>View</a>
            <button type="button" class="btn btn-mini danger" data-wb-file-remove><i class="ti ti-x"></i>Remove</button>
          </div>
          <div class="wb-file-progress" data-wb-file-progress hidden><div class="wb-file-bar" data-wb-file-bar></div></div>
        </div>`; break;
      case 'rating': input = wbRatingStars(val, true, f.id); break;
      case 'tags': {
        const cur = Array.isArray(val) ? val : (val ? [val] : []);
        const opts = f.config.options || [];
        input = opts.length
          ? `<select class="wb-input" data-f="${h(f.id)}" multiple style="min-height:110px">${opts.map((o) => `<option value="${h(o.id)}" ${cur.includes(o.id) ? 'selected' : ''}>${h(o.label)}</option>`).join('')}</select><div class="wb-sub">Hold Ctrl/Cmd (or drag) to pick several.</div>`
          : '<div class="wb-sub" style="color:var(--warning,#d97706)">Add options to this field in its settings first.</div>';
        break;
      }
      case 'autonumber': input = `<div class="wb-input wb-auto-readonly">${val ? h(wbAutoNumberText(f, val)) : '<span class="wb-sub">Assigned automatically when saved</span>'}</div>`; break;
      case 'created_time': input = `<div class="wb-input wb-auto-readonly"><span class="wb-sub">Recorded automatically when the record is created</span></div>`; break;
      case 'updated_time': input = `<div class="wb-input wb-auto-readonly"><span class="wb-sub">Updates automatically on every save</span></div>`; break;
      case 'rollup': input = `<div class="wb-input wb-auto-readonly"><i class="ti ti-sum"></i> <span class="wb-sub">Summarizes the linked records automatically</span></div>`; break;
      default: input = `<input class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}">`;
    }
    return `<div class="wb-field">${lbl}${input}</div>`;
  }

  return wbRenderFieldInput;
}

/**
 * Read a Button field's panel back into its config.
 *
 * Lives beside the panel that drew it: the ids and the row shapes are one thing, and splitting
 * them across two files is how the two halves drift apart. Mutates the draft in place, which is
 * what every other branch of the field editor does.
 */
/**
 * Read a field's panel back into its config.
 *
 * One door for every type that needs it, so main.js names none of them: the ids and the row
 * shapes belong to the panel that drew them, and every session that never opens one of these
 * fields would otherwise carry the lot.
 */
export function collectFieldConfig(type, config, fallbackCompany) {
  if (type === 'button') collectButtonConfig(config, fallbackCompany);
  // Dropdown or choice chips, for a category or a status. Anything but 'chips' reads as the
  // dropdown, so a field built before the choice existed keeps the control it already had.
  if (type === 'category' || type === 'status') config.display = document.getElementById('wbCatDisplay')?.value === 'chips' ? 'chips' : 'dropdown';
  if (type === 'sheet') {
    const start = document.getElementById('wbSheetDefault');
    if (start) { try { config.sheet = JSON.parse(start.value || '{}'); } catch { /* keep what was there */ } }
    config.sheet = { ...(config.sheet || {}), headerRow: !!document.getElementById('wbSheetHeader')?.checked };
  }
}

function collectButtonConfig(config, fallbackCompany) {
  const val = (id) => document.getElementById(id)?.value;
  const rows = (kind, keys) => [...document.querySelectorAll(`[data-wb-${kind}-row]`)]
    .map((row) => Object.fromEntries(keys.map((key) => [key, row.querySelector(`[data-wb-${kind}-${key}]`)?.value || ''])))
    .filter((row) => row.field);
  config.text = (val('wbBtnText') || '').trim();
  config.icon = document.querySelector('[name=wbBtnIcon]:checked')?.value || '';
  config.action = val('wbBtnAction') || 'push';
  // Read whenever the panel offered it. Kept even while another action is selected, so
  // switching to Change fields and back does not lose the link somebody already typed.
  if (document.getElementById('wbBtnHref')) config.href = (val('wbBtnHref') || '').trim();
  // The workspace picker is only drawn when there is more than one to choose from.
  config.targetCompany = val('wbBtnCompany') || fallbackCompany;
  const targetApp = val('wbBtnApp') || '';
  // A different destination invalidates the chosen field list, which named fields in the app
  // that is no longer the target.
  if (targetApp !== config.targetApp) config.fields = [];
  config.targetApp = targetApp;
  config.clearAll = !!document.getElementById('wbBtnClearAll')?.checked;
  config.set = rows('set', ['field', 'value']);
  config.when = rows('when', ['field', 'op', 'value']);
  // The switch is the mode; the boxes are only read while it is off. Recorded separately so
  // "picking, nothing ticked yet" is a state that survives the re-render -- deriving the mode
  // from the list is what made the switch impossible to turn off.
  const everything = !!document.getElementById('wbBtnAll')?.checked;
  config.pickFields = !everything;
  config.fields = everything
    ? []
    : [...document.querySelectorAll('[data-wb-btn-field]')].filter((box) => box.checked).map((box) => box.dataset.wbBtnField);
}
