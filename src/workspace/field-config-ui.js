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

export function renderFieldConfig(fd, app, ctx) {
  const {
    h, state, canonicalCompanyId, companyName, wbOptRow, wbProgStopRow, wbProgressDisplayHtml,
    wbRelTargetApp, wbCompanyApps, wbTargetApp, wbRelLabel,
    WB_PROGRESS_STOPS_DEFAULT, WB_FIELD_TYPES, WB_PROGRESS_DISPLAYS,
  } = ctx;
  const t = fd.type;
  if (t === 'category' || t === 'status' || t === 'tags') {
    return `<div class="wb-field"><label>Options</label><div class="wb-opt-list">${(fd.config.options || []).map((o) => wbOptRow(o)).join('')}</div><button class="btn btn-sm" data-wb-add-option><i class="ti ti-plus"></i>Add option</button>${t === 'tags' ? '<div class="wb-sub">Records can hold several of these at once.</div>' : ''}</div>`;
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
      <div class="wb-check-row"><label class="wb-switch"><input type="checkbox" id="wbRelMulti" ${fd.config.multiple ? 'checked' : ''} ${fd.config.fixedItem ? 'disabled' : ''}><span class="wb-slider"></span></label><div><b>Allow multiple links</b>${fd.config.fixedItem ? '<div class="wb-sub">Disabled while a specific record is pinned.</div>' : ''}</div></div>`;
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
    h, WB_FIELD_TYPES, wbMembers, wbRelTargetApp, wbDoc, wbRelLabel, wbProgressColor,
    wbProgressDisplayHtml, wbChecklistValue, wbChecklistBodyHtml, wbRatingStars, wbAutoNumberText,
  } = ctx;
  function wbRenderFieldInput(companyId, workspaceId, f, val) {
    const meta = WB_FIELD_TYPES[f.type];
    const lbl = `<label>${h(f.label)}${f.required ? '<span class="wb-req">*</span>' : ''} <span class="wb-opt" style="text-transform:none">${h(meta.label)}</span></label>`;
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
      case 'category': case 'status': input = `<select class="wb-input" data-f="${h(f.id)}"><option value="">— Select —</option>${(f.config.options || []).map((o) => `<option value="${h(o.id)}" ${val === o.id ? 'selected' : ''}>${h(o.label)}</option>`).join('')}</select>`; break;
      case 'user': {
        const members = wbMembers(companyId);
        input = members.length ? `<select class="wb-input" data-f="${h(f.id)}"><option value="">— Unassigned —</option>${members.map((m) => `<option value="${h(m.id)}" ${val === m.id ? 'selected' : ''}>${h(m.name)}</option>`).join('')}</select>` : '<div class="wb-sub" style="color:var(--warning,#d97706)">No company members to assign.</div>'; break;
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
        input = `<select class="wb-input" data-f="${h(f.id)}" ${f.config.multiple ? 'multiple style="min-height:96px"' : ''}>${f.config.multiple ? '' : '<option value="">— None —</option>'}${ta.items.map((it) => `<option value="${h(it.id)}" ${cur.includes(it.id) ? 'selected' : ''}>${h(wbRelLabel(ta, it, f.config.identifyField))}</option>`).join('')}</select><div class="wb-sub">Linked to <b>${h(ta.name)}</b>${f.config.multiple ? ' · hold Ctrl/Cmd to select multiple' : ''}</div>`; break;
      }
      case 'file': input = `
        <div class="wb-file-field" data-wb-file>
          <input type="hidden" data-f="${h(f.id)}" value="${h(typeof val === 'object' ? JSON.stringify(val) : (val || ''))}" />
          <input type="file" hidden accept="${acceptAttr('document')}" data-wb-file-input />
          <button type="button" class="wb-file-drop" data-wb-file-open>
            <i class="ti ti-cloud-upload" data-wb-file-ico></i>
            <span class="wb-file-label" data-wb-file-label></span>
          </button>
          <div class="wb-file-actions" data-wb-file-actions hidden>
            <a class="btn btn-mini" data-wb-file-view target="_blank" rel="noreferrer"><i class="ti ti-eye"></i>View</a>
            <a class="btn btn-mini" data-wb-file-download><i class="ti ti-download"></i>Download</a>
            <button type="button" class="btn btn-mini danger" data-wb-file-remove><i class="ti ti-x"></i>Remove</button>
          </div>
          <div class="wb-file-progress" data-wb-file-progress hidden><div class="wb-file-bar" data-wb-file-bar></div></div>
        </div>`; break;
      case 'calculation': input = `<div class="wb-input wb-calc-display" data-calc="${h(f.id)}">—</div><div class="wb-sub">Auto-calculated: <code>${h(f.config.formula || '(no formula)')}</code></div>`; break;
      case 'location': input = `<div class="wb-inline"><span class="wb-cur"><i class="ti ti-map-pin"></i></span><input class="wb-input" data-f="${h(f.id)}" value="${h(val || '')}" placeholder="Address, city, or place"></div>`; break;
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
