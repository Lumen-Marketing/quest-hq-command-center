// The App Builder's Automations tab and the rule editor inside it.
//
// Fetched on demand. Both are behind a click — the Automations tab, and the New/Edit
// automation dialog — so nothing here is needed to paint the app.
//
// A factory, so the three renderers keep calling each other by name with the main.js
// helpers closed over once. The pipeline helpers are imported directly rather than passed:
// they are pure, live in their own module already, and importing them here does not create
// a cycle back into main.js.
//
// The bodies are unchanged from where they lived in main.js.

import { pipelineField, pipelineFields, stagesOf } from './pipeline-core.js';

export function createAutomationsUI(ctx) {
  const {
    h, can, state, WB_TRIG_OPS,
    wbTriggerText, wbActionText, wbMembers, wbRelTargetApp, wbRelLabel,
  } = ctx;

  function wbViewAutomations(companyId, workspace, app) {
    const canManage = can('workspaces.manage', companyId);
    const list = app.automations || [];
    const banner = '<div class="wb-auto-banner"><i class="ti ti-bolt"></i>Automations run rules automatically when items are created, updated, or reach a status — no code required.</div>';
    if (!list.length) return banner + `<div class="wb-empty"><i class="ti ti-bolt"></i><h3>No automations yet</h3><p>Create rules like "When Stage is Won, assign the Account Manager and post to the activity feed."</p>${canManage ? '<button class="btn btn-primary" data-add-auto><i class="ti ti-plus"></i>Create your first automation</button>' : ''}</div>`;
    const rows = list.map((au) => `<div class="wb-auto-row ${au.enabled ? '' : 'off'}">
      <div class="wb-ai"><i class="ti ti-bolt"></i></div>
      <div class="wb-am"><b>${h(au.name)}</b><div class="wb-rule">When ${wbTriggerText(companyId, app, au.trigger)} <i class="ti ti-arrow-right wb-rule-arrow"></i> ${au.actions.map((ac) => wbActionText(companyId, app, ac)).join(' ')}</div></div>
      ${canManage ? `<label class="wb-switch" title="Enable/disable"><input type="checkbox" ${au.enabled ? 'checked' : ''} data-toggle-auto="${h(au.id)}"><span class="wb-slider"></span></label>
      <button class="wb-icon-btn" data-dupe-auto="${h(au.id)}" title="Duplicate"><i class="ti ti-copy"></i></button>
      <button class="wb-icon-btn" data-edit-auto="${h(au.id)}" title="Configure"><i class="ti ti-adjustments"></i></button>
      <button class="wb-icon-btn danger" data-del-auto="${h(au.id)}" title="Delete"><i class="ti ti-trash"></i></button>` : `<span class="wb-sub">${au.enabled ? 'Enabled' : 'Disabled'}</span>`}
    </div>`).join('');
    return banner + `<div class="wb-auto-list">${rows}</div>`;
  }

  function wbTrigCfgUI(draft, app) {
    if (draft.trigger.event === 'stage_moves') {
      const fields = pipelineFields(app);
      if (!fields.length) return '<div class="wb-sub" style="color:var(--warning,#d97706)">This app has no pipeline yet — add a Status field, or use <b>Manage stages</b> on the board.</div>';
      const field = pipelineField(app, draft.trigger.fieldId);
      draft.trigger.fieldId = field.id;
      const stages = stagesOf(field);
      // "Any" on both sides is the useful default: it fires on every stage change, which is
      // what someone reaches for first, and narrowing is a second thought.
      const pick = (attr, chosen, anyLabel) => `<select class="wb-input" data-wb-trig-${attr}><option value="">${h(anyLabel)}</option>${stages.map((s) => `<option value="${h(s.id)}" ${chosen === s.id ? 'selected' : ''}>${h(s.label)}</option>`).join('')}</select>`;
      const fieldSelect = fields.length > 1
        ? `<div class="wb-field"><label>Pipeline</label><select class="wb-input" data-wb-trig-field>${fields.map((f) => `<option value="${h(f.id)}" ${f.id === field.id ? 'selected' : ''}>${h(f.label)}</option>`).join('')}</select></div>`
        : '';
      return `${fieldSelect}
        <div class="wb-trig-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="wb-sub">from</span>${pick('from', draft.trigger.from, 'Any stage')}
          <span class="wb-sub">to</span>${pick('to', draft.trigger.to, 'Any stage')}
        </div>
        <div class="wb-sub" style="margin-top:6px">Fires only when the stage actually changes — saving a record without moving it does nothing.</div>`;
    }
    if (draft.trigger.event !== 'field_is') return '';
    // Any field can trigger this, except file/image uploads (no comparable "value").
    const fields = app.fields.filter((f) => !['file', 'image'].includes(f.type));
    if (!fields.length) return '<div class="wb-sub" style="color:var(--warning,#d97706)">Add a field to use this trigger.</div>';
    const fid = fields.some((f) => f.id === draft.trigger.fieldId) ? draft.trigger.fieldId : fields[0].id;
    draft.trigger.fieldId = fid;
    const field = app.fields.find((f) => f.id === fid);
    const val = draft.trigger.value == null ? '' : String(draft.trigger.value);
    const opt = (value, label) => `<option value="${h(value)}" ${val === String(value) ? 'selected' : ''}>${h(label)}</option>`;
    const fieldSelect = `<select class="wb-input" data-wb-trig-field>${fields.map((x) => `<option value="${h(x.id)}" ${x.id === fid ? 'selected' : ''}>${h(x.label)}</option>`).join('')}</select>`;
    // The value control adapts to the chosen field's type.
    let valueControl;
    if (field.type === 'status' || field.type === 'category') {
      valueControl = `<select class="wb-input" data-wb-trig-val><option value="">— value —</option>${(field.config.options || []).map((o) => opt(o.id, o.label)).join('')}</select>`;
    } else if (field.type === 'checkbox') {
      valueControl = `<select class="wb-input" data-wb-trig-val><option value="">— value —</option>${opt('true', 'Yes (checked)')}${opt('false', 'No (unchecked)')}</select>`;
    } else if (field.type === 'user') {
      valueControl = `<select class="wb-input" data-wb-trig-val><option value="">— value —</option>${wbMembers(state.builderModal?.companyId).map((mem) => opt(mem.id, mem.name)).join('')}</select>`;
    } else if (field.type === 'relationship') {
      const ta = wbRelTargetApp(field, state.builderModal?.companyId);
      valueControl = `<select class="wb-input" data-wb-trig-val><option value="">— value —</option>${(ta?.items || []).map((it) => opt(it.id, wbRelLabel(ta, it, field.config.identifyField || field.config.displayField))).join('')}</select>`;
    } else if (['number', 'money', 'calculation', 'duration', 'progress'].includes(field.type)) {
      // Numeric fields (including calculation results, durations in minutes, and
      // progress %) compare by operator so the rule can fire on a range,
      // not just an exact match (e.g. Manhour >= 40, Progress >= 100).
      const op = WB_TRIG_OPS.some(([v]) => v === draft.trigger.op) ? draft.trigger.op : '==';
      draft.trigger.op = op;
      const opSelect = `<select class="wb-input" data-wb-trig-op style="flex:0 0 128px">${WB_TRIG_OPS.map(([v, l]) => `<option value="${h(v)}" ${op === v ? 'selected' : ''}>${h(l)}</option>`).join('')}</select>`;
      valueControl = `<div style="display:flex;gap:8px">${opSelect}<input class="wb-input" data-wb-trig-val type="number" step="any" value="${h(val)}" placeholder="Value" style="flex:1;min-width:0"></div>`;
    } else {
      const inputType = field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text';
      valueControl = `<input class="wb-input" data-wb-trig-val type="${inputType}" value="${h(val)}" placeholder="Exact value to match">`;
    }
    return `<div class="wb-row2">${fieldSelect}${valueControl}</div>`;
  }

  function wbActionCardsUI(companyId, draft, app) {
    return draft.actions.map((ac, i) => {
      let cfg = '';
      if (ac.type === 'set_field') {
        const setable = app.fields.filter((f) => ['text', 'textarea', 'status', 'category', 'date', 'number', 'money', 'email', 'phone', 'checkbox', 'location', 'duration', 'progress'].includes(f.type));
        const fid = ac.fieldId || (setable[0] && setable[0].id);
        const field = app.fields.find((f) => f.id === fid);
        let valInput = '';
        if (field && (field.type === 'status' || field.type === 'category')) valInput = `<select class="wb-input" data-wb-acval="${i}"><option value="">— value —</option>${(field.config.options || []).map((o) => `<option value="${h(o.id)}" ${ac.value === o.id ? 'selected' : ''}>${h(o.label)}</option>`).join('')}</select>`;
        else if (field && field.type === 'checkbox') valInput = `<select class="wb-input" data-wb-acval="${i}"><option value="true" ${ac.value === true ? 'selected' : ''}>Yes</option><option value="false" ${ac.value === false ? 'selected' : ''}>No</option></select>`;
        else valInput = `<input class="wb-input" data-wb-acval="${i}" value="${h(ac.value ?? '')}" placeholder="Value to set">`;
        const numericHint = field && ['number', 'money', 'duration', 'progress'].includes(field.type) ? '<div class="wb-sub" style="margin-top:4px">Tip: start with <b>+ − × ÷</b> to do math on the current value — e.g. <code>-10%</code>, <code>+20</code>, <code>*2</code>. A plain number sets it exactly.</div>' : '';
        cfg = `<select class="wb-input" data-wb-acfield="${i}">${setable.map((x) => `<option value="${h(x.id)}" ${x.id === fid ? 'selected' : ''}>${h(x.label)}</option>`).join('')}</select>${valInput}${numericHint}`;
      } else if (ac.type === 'assign') {
        const userFields = app.fields.filter((f) => f.type === 'user');
        const members = wbMembers(companyId);
        cfg = `<select class="wb-input" data-wb-acfield="${i}">${userFields.length ? userFields.map((x) => `<option value="${h(x.id)}" ${x.id === ac.fieldId ? 'selected' : ''}>${h(x.label)}</option>`).join('') : '<option value="">(add a User field)</option>'}</select><select class="wb-input" data-wb-acval="${i}"><option value="">— member —</option>${members.map((member) => `<option value="${h(member.id)}" ${ac.value === member.id ? 'selected' : ''}>${h(member.name)}</option>`).join('')}</select>`;
      } else {
        cfg = `<input class="wb-input" data-wb-acmsg="${i}" value="${h(ac.message || '')}" placeholder="Message for the activity feed">`;
      }
      return `<div class="wb-action-card"><div class="wb-acgrow"><select class="wb-input" data-wb-actype="${i}"><option value="notify" ${ac.type === 'notify' ? 'selected' : ''}>Post a notification</option><option value="set_field" ${ac.type === 'set_field' ? 'selected' : ''}>Set a field value</option><option value="assign" ${ac.type === 'assign' ? 'selected' : ''}>Assign a member</option></select>${cfg}</div><button class="wb-icon-btn danger" data-wb-acdel="${i}" type="button" aria-label="Delete automation"><i class="ti ti-x"></i></button></div>`;
    }).join('');
  }

  return { wbViewAutomations, wbTrigCfgUI, wbActionCardsUI };
}
