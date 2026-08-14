// The takeoff card on the Underwriter page.
//
// Two modes on the same card. In pricing mode you type the eight measurements off the GAF
// report and read the priced job; in editing mode every line's name, formula and price opens
// up, so the built-in calculator can be turned into the company's own. Neither mode reloads
// the page: recalculating is arithmetic over what is already in the DOM, and re-rendering the
// whole route under somebody who is typing takes the caret with it.

import {
  TAKEOFF_FUNCTIONS,
  TAKEOFF_GROUPS,
  TAKEOFF_MEASUREMENTS,
  calculateTakeoff,
  defaultTakeoffConfig,
  normalizeMeasurements,
  normalizeTakeoffConfig,
} from './takeoff.js';

export function createTakeoffCard(ctx) {
  const {
    can, h, money, showToast, state, supabaseRow, supabaseWrite, activeCompanyId,
    activeWorkspaceId, isLiveSupabaseSession, render, setTakeoffHandler,
    // The card sits on two pages that answer to different permissions: the Underwriter tool,
    // and a quote record in the Sales workspace. Whoever builds it says which.
    takeoffPermission = 'underwriter.manage',
    // What "save these measurements" means depends on the record underneath. The Underwriter
    // page has none -- its measurements go with the decision -- so it passes nothing.
    saveTakeoffToRecord = null,
    saveRecordLabel = 'Save to this record',
  } = ctx;

  const CALCULATOR_COLS = ['id', 'company_id', 'workspace_id', 'name', 'config', 'position', 'created_by'];
  const canManageFor = (companyId) => can(takeoffPermission, companyId);
  const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
  const qty = (value) => (Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100));

  function calculatorsFor(companyId) {
    return (state.underwritingCalculators || [])
      .filter((item) => item.company_id === companyId)
      .map((item) => ({ ...item, config: normalizeTakeoffConfig(item.config) }))
      .sort((a, b) => (a.position - b.position) || String(a.created_at).localeCompare(String(b.created_at)));
  }

  // With nothing saved the card still works, on the calculator that ships with the app. That
  // is the whole point of the defaults: a company gets a working takeoff on day one and edits
  // it into their own, rather than being shown an empty page and asked to build one.
  function selectedCalculator(companyId) {
    const saved = calculatorsFor(companyId);
    const wanted = state.takeoffCalculatorId;
    return saved.find((item) => item.id === wanted)
      || saved[0]
      || { id: '', name: 'Underwriting calculator', config: defaultTakeoffConfig(), builtin: true };
  }

  // The draft is what is on screen. It survives a re-render of the route but is deliberately
  // not persisted anywhere until Save: an estimator trying numbers is not editing the
  // company's calculator until they say so.
  function draftFor(scope, companyId, calculator, savedMeasurements) {
    const draft = state.takeoffDraft;
    if (draft && draft.scope === scope && draft.companyId === companyId && draft.calculatorId === calculator.id) return draft;
    state.takeoffDraft = {
      scope,
      companyId,
      calculatorId: calculator.id,
      name: calculator.name,
      config: normalizeTakeoffConfig(calculator.config),
      measurements: normalizeMeasurements(savedMeasurements?.measurements ?? savedMeasurements),
      // Quantities typed over the ones the formulas worked out. Per job, like the
      // measurements -- not part of the company's calculator.
      overrides: { ...(savedMeasurements?.overrides || {}) },
      editing: false,
      dirty: false,
    };
    return state.takeoffDraft;
  }

  // Laid out like the sheet it came from: label, the figure off the report, its unit, and the
  // waste allowance worked out beside it.
  function measurementFields(draft, result) {
    return TAKEOFF_MEASUREMENTS.map((item, index) => `
      <label class="tk-measure">
        <span>${h(item.label)}</span>
        <input type="number" min="0" step="0.01" inputmode="decimal" value="${h(String(draft.measurements[item.key]))}"
          data-takeoff-measure="${h(item.key)}" aria-label="${h(item.label)} in ${h(item.unit)}" />
        <em>${h(item.unit)}</em>
        <b data-takeoff-waste="${h(item.key)}">${h(qty(result.measurements[index].withWaste))}</b>
      </label>
    `).join('');
  }

  // The quantity box, on every line whether a formula works it out or not.
  //
  // "Although some of it is auto calculated, still make it editable for further customizing."
  // A greyed-out box on a line the estimator can see is wrong is the calculator arguing with
  // the person using it. The formula fills it; typing replaces it; emptying it hands the line
  // back to the formula. The formula itself is not printed on the row -- it is a working, not
  // a fact about the job -- but it is on the box as a tooltip and on show under Edit formulas.
  function qtyCell(line) {
    const title = line.formula
      ? `${line.overridden ? 'Typed over' : 'Worked out by'} ${line.formula}`
      : 'Typed in';
    return `<input class="tk-qty ${line.overridden ? 'over' : ''}" type="number" step="0.01" inputmode="decimal"
      value="${h(qty(line.quantity))}" data-takeoff-qty="${h(line.id)}" title="${h(title)}" aria-label="Quantity for ${h(line.name)}" />`;
  }

  function lineRow(line, editing, canManage) {
    if (editing && canManage) {
      return `
        <div class="tk-row tk-row-edit" data-takeoff-line="${h(line.id)}">
          <input class="tk-name" type="text" value="${h(line.name)}" data-takeoff-field="name" aria-label="Line name" />
          <input class="tk-formula ${line.error ? 'bad' : ''}" type="text" value="${h(line.formula)}" data-takeoff-field="formula"
            placeholder="Typed quantity" aria-label="Formula for ${h(line.name)}" />
          <input class="tk-price" type="number" step="0.01" min="0" value="${h(String(line.price))}" data-takeoff-field="price" aria-label="Unit price" />
          <button class="tk-drop" type="button" data-takeoff-action="remove-line" data-takeoff-line-id="${h(line.id)}" title="Remove ${h(line.name)}" aria-label="Remove ${h(line.name)}"><i class="ti ti-trash"></i></button>
          <p class="tk-error" ${line.error ? '' : 'hidden'}>${h(line.error)}</p>
        </div>
      `;
    }
    return `
      <div class="tk-row" data-takeoff-line="${h(line.id)}">
        <span class="tk-name">${h(line.name)}${line.error ? '<i class="ti ti-alert-triangle"></i>' : ''}</span>
        ${qtyCell(line)}
        <span class="tk-price">${money(line.price)}</span>
        <span class="tk-total">${money(line.total)}</span>
        <p class="tk-error" ${line.error ? '' : 'hidden'}>${h(line.error)}</p>
      </div>
    `;
  }

  function groupSection(group, result, draft, canManage) {
    const lines = result.lines.filter((line) => line.group === group.key);
    const totals = {
      labor: [['Labor total', result.laborTotal, true]],
      material: [
        ['Material total', result.materialTotal, false],
        [`Material with tax (${qty(result.taxPercent)}%)`, result.materialWithTax, false],
        ['Total labor & material', result.costTotal, true],
      ],
      client: [['Total for client', result.clientTotal, true]],
    }[group.key];
    const editing = draft.editing && canManage;
    // The header sits on the row grid so a column label is over its own column. Editing swaps
    // the quantity column for the formula, which is what is being edited.
    const headCells = editing
      ? ['<span class="tk-h-formula">Formula</span>', '<span>Unit price</span>', '<span></span>']
      : ['<span>Qty</span>', '<span>Unit price</span>', '<span>Total</span>'];
    return `
      <section class="tk-group ${editing ? 'editing' : ''}" data-takeoff-group="${h(group.key)}">
        <header><h4>${h(group.label)}</h4>${headCells.join('')}</header>
        ${lines.map((line) => lineRow(line, draft.editing, canManage)).join('') || '<p class="tk-empty">No lines yet.</p>'}
        ${editing ? `<button class="btn btn-quiet tk-add" type="button" data-takeoff-action="add-line" data-takeoff-group-key="${h(group.key)}"><i class="ti ti-plus"></i>Add a line</button>` : ''}
        <div class="tk-totals" data-takeoff-totals="${h(group.key)}">
          ${totals.map(([label, value, strong]) => `<div class="${strong ? 'strong' : ''}"><span>${h(label)}</span><strong>${money(value)}</strong></div>`).join('')}
        </div>
      </section>
    `;
  }

  const groupOf = (key, result, draft, canManage) => groupSection(
    TAKEOFF_GROUPS.find((group) => group.key === key), result, draft, canManage,
  );

  // Two columns, arranged as the spreadsheet arranges them: the report and the labor it buys
  // down the left, the materials and the price to the client down the right. Material is the
  // long list, so it sits opposite the two short ones rather than pushing them off the screen.
  function renderBody(companyId, draft, canManage) {
    const result = calculateTakeoff(draft.config, draft.measurements, draft.overrides);
    const profitable = result.profit >= 0;
    return `
      <div class="tk-sheet">
        <div class="tk-col">
          <div class="tk-measures">
            <div class="tk-measures-head">
              <h4>GAF measurement</h4>
              ${draft.editing && canManage ? `
                <label class="tk-rate"><span>Waste</span><input type="number" min="0" step="0.5" value="${h(String(draft.config.waste_percent))}" data-takeoff-rate="waste_percent" /><b>%</b></label>
                <label class="tk-rate"><span>Tax</span><input type="number" min="0" step="0.25" value="${h(String(draft.config.tax_percent))}" data-takeoff-rate="tax_percent" /><b>%</b></label>
              ` : ''}
            </div>
            <div class="tk-measure-head"><span></span><span>Measurement</span><span></span><span data-takeoff-waste-head>${h(qty(result.wastePercent))}% waste</span></div>
            <div class="tk-measure-grid">${measurementFields(draft, result)}</div>
          </div>
          ${groupOf('labor', result, draft, canManage)}
        </div>
        <div class="tk-col">
          ${groupOf('material', result, draft, canManage)}
          ${groupOf('client', result, draft, canManage)}
        </div>
      </div>
      <div class="tk-outcome ${profitable ? '' : 'negative'}" data-takeoff-outcome>
        <div><span>Cost of the job</span><strong data-takeoff-figure="cost">${money(result.costTotal)}</strong></div>
        <div><span>Price to client</span><strong data-takeoff-figure="client">${money(result.clientTotal)}</strong></div>
        <div class="tk-profit"><span data-takeoff-figure="profit-label">${profitable ? 'Profit' : 'Loss'}</span><strong data-takeoff-figure="profit">${money(Math.abs(result.profit))}</strong></div>
        <div><span>Margin</span><strong data-takeoff-figure="margin">${h(result.marginPercent.toFixed(2))}%</strong></div>
        ${canManage ? (draft.scope === 'underwriter'
          ? '<button class="btn tk-push" type="button" data-takeoff-action="push"><i class="ti ti-arrow-up"></i>Use in the decision</button>'
          : `<button class="btn btn-primary tk-push" type="button" data-takeoff-action="save-record"><i class="ti ti-device-floppy"></i>${h(saveRecordLabel)}</button>`) : ''}
      </div>
      ${draft.editing && canManage ? `
        <p class="tk-help">A formula can use <code>${h(TAKEOFF_MEASUREMENTS.map((item) => `{${item.label}}`).join(' '))}</code>, the same names with <code>+ waste</code> for the allowance, any line's name for its quantity, and <code>${h(TAKEOFF_FUNCTIONS.join(' '))}</code>. Leave it blank to type the quantity yourself.</p>
      ` : ''}
    `;
  }

  function renderTakeoffCard(companyId, savedTakeoff, options = {}) {
    const scope = options.scope || 'underwriter';
    const canManage = canManageFor(companyId);
    const calculator = selectedCalculator(companyId);
    const draft = draftFor(scope, companyId, calculator, savedTakeoff);
    const saved = calculatorsFor(companyId);
    // Whichever page drew the card owns its events until another one draws it.
    setTakeoffHandler?.(onTakeoffEvent);
    return `
      <section class="panel takeoff-card" data-takeoff-root data-takeoff-company="${h(companyId)}">
        <div class="section-head">
          <div><h2>Takeoff calculator</h2><p>Enter the GAF report measurements and the job prices itself. Every price and formula is yours to change.</p></div>
          <div class="tk-actions">
            ${saved.length || !calculator.builtin ? `
              <select class="tk-pick" data-takeoff-action="pick" aria-label="Calculator">
                ${saved.map((item) => `<option value="${h(item.id)}" ${item.id === calculator.id ? 'selected' : ''}>${h(item.name)}</option>`).join('')}
                ${calculator.builtin ? `<option value="" selected>${h(calculator.name)} (built in)</option>` : ''}
              </select>` : ''}
            ${canManage ? `
              <button class="btn" type="button" data-takeoff-action="toggle-edit"><i class="ti ti-${draft.editing ? 'eye' : 'pencil'}"></i>${draft.editing ? 'Done editing' : 'Edit formulas'}</button>
              <button class="btn" type="button" data-takeoff-action="new"><i class="ti ti-plus"></i>New calculator</button>
              <button class="btn btn-primary" type="button" data-takeoff-action="save" ${draft.dirty ? '' : 'disabled'}><i class="ti ti-device-floppy"></i>Save calculator</button>
            ` : ''}
          </div>
        </div>
        ${draft.editing && canManage ? `<label class="tk-title"><span>Calculator name</span><input type="text" value="${h(draft.name)}" data-takeoff-name maxlength="80" /></label>` : ''}
        <div class="tk-body" data-takeoff-body>${renderBody(companyId, draft, canManage)}</div>
      </section>
    `;
  }

  // ---- events -----------------------------------------------------------------------------

  // Recalculating must never rebuild the field being typed into. Replacing the card body was
  // doing exactly that: every keystroke destroyed the input and built a new one, so the caret
  // jumped out and the number came back selected. Worse, the value was re-rendered from
  // Number(), so a half-typed "6." lost its decimal point before the next digit arrived.
  //
  // So the inputs are left strictly alone and only the figures they produce are rewritten.
  // A full rebuild happens only when the shape of the card really changes -- a line added or
  // removed -- and at that point nothing is mid-word.
  function repaint({ structure = false } = {}) {
    const root = document.querySelector('[data-takeoff-root]');
    const body = root?.querySelector('[data-takeoff-body]');
    const draft = state.takeoffDraft;
    if (!body || !draft) return;
    const canManage = canManageFor(draft.companyId);
    if (structure) body.innerHTML = renderBody(draft.companyId, draft, canManage);
    else patchFigures(body, draft, canManage);
    const save = root.querySelector('[data-takeoff-action="save"]');
    if (save) save.disabled = !draft.dirty;
  }

  const setText = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };

  function patchFigures(body, draft, canManage) {
    const result = calculateTakeoff(draft.config, draft.measurements, draft.overrides);
    const editing = draft.editing && canManage;
    const active = typeof document !== 'undefined' ? document.activeElement : null;

    result.measurements.forEach((item) => {
      setText(body.querySelector(`[data-takeoff-waste="${item.key}"]`), qty(item.withWaste));
    });
    setText(body.querySelector('[data-takeoff-waste-head]'), `${qty(result.wastePercent)}% waste`);

    // Looked up by dataset rather than by selector: an id restored from an older save is not
    // guaranteed to be selector-safe, and this needs no escaping to get right.
    const rows = new Map();
    body.querySelectorAll('[data-takeoff-line]').forEach((row) => rows.set(row.dataset.takeoffLine, row));

    result.lines.forEach((line) => {
      const row = rows.get(line.id);
      if (!row) return;
      setText(row.querySelector('.tk-total'), money(line.total));
      const error = row.querySelector('.tk-error');
      if (error) {
        setText(error, line.error);
        error.hidden = !line.error;
      }
      if (editing) {
        row.querySelector('.tk-formula')?.classList.toggle('bad', !!line.error);
        const typed = row.querySelector('.tk-qty');
        // A line that has just been given a formula stops accepting a typed quantity.
        if (typed && typed.disabled !== !!line.formula) typed.disabled = !!line.formula;
      } else {
        const cell = row.querySelector('.tk-qty');
        // The quantity is a box somebody may be typing in. A computed one follows the
        // measurements; the one under the caret keeps exactly what was typed -- but it still
        // gets the mark, so the line reads as overridden the moment it is.
        if (cell) {
          cell.classList.toggle('over', !!line.overridden);
          const next = qty(line.quantity);
          if (cell !== active && cell.value !== next) cell.value = next;
        }
        setText(row.querySelector('.tk-price'), money(line.price));
      }
    });

    TAKEOFF_GROUPS.forEach((group) => {
      const totals = body.querySelector(`[data-takeoff-totals="${group.key}"]`);
      if (!totals) return;
      const figures = {
        labor: [result.laborTotal],
        material: [result.materialTotal, result.materialWithTax, result.costTotal],
        client: [result.clientTotal],
      }[group.key];
      totals.querySelectorAll('strong').forEach((node, index) => setText(node, money(figures[index])));
      // The tax rate is editable, and it is named in the label beside the figure it applies to.
      const taxLabel = group.key === 'material' ? totals.querySelectorAll('span')[1] : null;
      setText(taxLabel, `Material with tax (${qty(result.taxPercent)}%)`);
    });

    const outcome = body.querySelector('[data-takeoff-outcome]');
    if (!outcome) return;
    const profitable = result.profit >= 0;
    outcome.classList.toggle('negative', !profitable);
    const figure = (key) => outcome.querySelector(`[data-takeoff-figure="${key}"]`);
    setText(figure('cost'), money(result.costTotal));
    setText(figure('client'), money(result.clientTotal));
    setText(figure('profit-label'), profitable ? 'Profit' : 'Loss');
    setText(figure('profit'), money(Math.abs(result.profit)));
    setText(figure('margin'), `${result.marginPercent.toFixed(2)}%`);
  }

  function handleTakeoffInput(target) {
    const draft = state.takeoffDraft;
    if (!draft) return;
    // Halfway through typing "65.5" the field holds "65.", which a number input reports as an
    // empty value with badInput set -- not as a cleared field. Reading that as 0 blinks every
    // total on the card to zero between the point and the next digit. Clearing the field for
    // real leaves badInput false, so it still means 0.
    if (target.validity?.badInput) return;
    if (target.matches('[data-takeoff-measure]')) {
      draft.measurements[target.dataset.takeoffMeasure] = Math.max(0, num(target.value));
      repaint();
      return;
    }
    if (target.matches('[data-takeoff-rate]')) {
      draft.config[target.dataset.takeoffRate] = Math.max(0, num(target.value));
      draft.dirty = true;
      repaint();
      return;
    }
    if (target.matches('[data-takeoff-qty]')) {
      const id = target.dataset.takeoffQty;
      // Emptying the box hands the line back to its formula rather than pinning it at zero.
      if (String(target.value).trim() === '') delete draft.overrides[id];
      else draft.overrides[id] = num(target.value);
      repaint();
      return;
    }
    if (target.matches('[data-takeoff-name]')) {
      draft.name = target.value;
      draft.dirty = true;
      return;
    }
    if (target.matches('[data-takeoff-field]')) {
      const id = target.closest('[data-takeoff-line]')?.dataset.takeoffLine;
      const line = draft.config.lines.find((item) => item.id === id);
      if (!line) return;
      const key = target.dataset.takeoffField;
      line[key] = key === 'name' || key === 'formula' ? target.value : num(target.value);
      draft.dirty = true;
      // Safe on every keystroke now: a formula is repriced as it is typed, and the field it
      // was typed into is not one of the things that gets rewritten.
      repaint();
    }
  }

  async function saveCalculator(companyId) {
    const draft = state.takeoffDraft;
    if (!draft) return;
    if (!canManageFor(companyId)) {
      showToast('Your role can use the calculator but cannot change it.', 'error', 'Underwriter');
      return;
    }
    const existing = (state.underwritingCalculators || []).find((item) => item.id === draft.calculatorId);
    const record = {
      id: draft.calculatorId || crypto.randomUUID(),
      company_id: companyId,
      workspace_id: existing?.workspace_id || activeWorkspaceId() || '',
      name: String(draft.name || '').trim() || 'Underwriting calculator',
      config: normalizeTakeoffConfig(draft.config),
      position: existing?.position ?? calculatorsFor(companyId).length,
      created_by: existing?.created_by || null,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.underwritingCalculators = [
      ...(state.underwritingCalculators || []).filter((item) => item.id !== record.id),
      record,
    ];
    state.takeoffCalculatorId = record.id;
    draft.calculatorId = record.id;
    draft.dirty = false;
    repaint();
    if (isLiveSupabaseSession()) {
      const result = await supabaseWrite('underwriting_calculators', supabaseRow(record, CALCULATOR_COLS));
      if (!result.ok) {
        draft.dirty = true;
        repaint();
        return;
      }
    }
    showToast(`Saved ${record.name}.`, 'success', 'Underwriter');
    render();
  }

  function handleTakeoffClick(target) {
    const action = target.closest('[data-takeoff-action]')?.dataset.takeoffAction;
    const draft = state.takeoffDraft;
    const companyId = draft?.companyId || activeCompanyId();
    if (!action || !draft) return;
    if (action === 'toggle-edit') {
      draft.editing = !draft.editing;
      render();
      return;
    }
    if (action === 'add-line') {
      draft.config.lines.push({
        id: `ln-${crypto.randomUUID().slice(0, 8)}`,
        group: target.closest('[data-takeoff-action]').dataset.takeoffGroupKey,
        name: 'New line',
        formula: '',
        qty: 0,
        price: 0,
      });
      draft.dirty = true;
      repaint({ structure: true });
      return;
    }
    if (action === 'remove-line') {
      const id = target.closest('[data-takeoff-action]').dataset.takeoffLineId;
      draft.config.lines = draft.config.lines.filter((line) => line.id !== id);
      draft.dirty = true;
      repaint({ structure: true });
      return;
    }
    if (action === 'new') {
      // A new calculator starts from the built-in one rather than from nothing: it is far
      // easier to delete the lines you do not buy than to type in the ones you do.
      state.takeoffCalculatorId = '';
      state.takeoffDraft = {
        companyId,
        calculatorId: '',
        name: 'New calculator',
        config: defaultTakeoffConfig(),
        measurements: draft.measurements,
        overrides: draft.overrides,
        editing: true,
        dirty: true,
      };
      render();
      return;
    }
    if (action === 'save-record') {
      // The measurements belong to the record the card is sitting on -- this quote's roof --
      // so they are stored there rather than on the company's calculator.
      const totals = takeoffTotals();
      if (totals) saveTakeoffToRecord?.(draft.scope, { calculator_id: draft.calculatorId || '', measurements: draft.measurements, overrides: draft.overrides }, totals);
      return;
    }
    if (action === 'push') {
      // The decision panel above already knows how to price a margin; it just needed the
      // numbers. Filling its inputs and letting it recalculate keeps one set of arithmetic.
      const totals = takeoffTotals();
      const form = document.querySelector('[data-underwriting-form]');
      if (!form || !totals) return;
      [['contractPrice', totals.contractPrice], ['materialCost', totals.materialCost], ['laborCost', totals.laborCost]]
        .forEach(([name, value]) => {
          const input = form.querySelector(`[name="${name}"]`);
          if (input) input.value = String(value);
        });
      form.querySelector('[name="contractPrice"]')?.dispatchEvent(new Event('input', { bubbles: true }));
      showToast('Takeoff totals moved into the decision. Save the decision to keep them.', 'success', 'Underwriter');
      return;
    }
    if (action === 'save') saveCalculator(companyId);
  }

  function handleTakeoffChange(target) {
    if (target.matches('[data-takeoff-action="pick"]')) {
      state.takeoffCalculatorId = target.value;
      state.takeoffDraft = null;
      render();
      return;
    }
    // Emptying a quantity hands the line back to its formula. The box is left blank while it
    // has the caret -- putting the number back mid-edit would fight somebody who cleared it in
    // order to type a different one -- so the formula's answer reappears when they leave it.
    if (target.matches?.('[data-takeoff-qty]') && String(target.value).trim() === '') {
      const draft = state.takeoffDraft;
      if (!draft) return;
      const line = calculateTakeoff(draft.config, draft.measurements, draft.overrides)
        .lines.find((item) => item.id === target.dataset.takeoffQty);
      if (line) target.value = qty(line.quantity);
      return;
    }
    // Nothing else to do on change: the figures already followed every keystroke.
  }

  function onTakeoffEvent(event, kind) {
    if (kind === 'input') handleTakeoffInput(event.target);
    else if (kind === 'click') handleTakeoffClick(event.target);
    else handleTakeoffChange(event.target);
  }

  // What the takeoff says the job costs, for the decision panel above it.
  function takeoffTotals() {
    const draft = state.takeoffDraft;
    if (!draft) return null;
    const result = calculateTakeoff(draft.config, draft.measurements, draft.overrides);
    return {
      materialCost: result.materialWithTax,
      laborCost: result.laborTotal,
      contractPrice: result.clientTotal,
      measurements: draft.measurements,
      overrides: draft.overrides,
      calculatorId: draft.calculatorId,
    };
  }

  return { renderTakeoffCard, onTakeoffEvent, takeoffTotals };
}
