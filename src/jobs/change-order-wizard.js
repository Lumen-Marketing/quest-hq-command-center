// The change-order wizard: capture it, price it, send it.
//
// Three steps, because that is the order the work actually happens in and because each step
// is a place the money leaks. Capturing without pricing loses the charge; pricing without
// recording how it was sent loses the argument about whether the client agreed.
//
// Fetched on demand -- it only opens from a button on one tab of one screen.
//
// The arithmetic is all in ./change-order-model.js. This file decides how it looks and what
// the buttons do; it computes nothing itself.

import {
  ASK_METHODS, EXECUTE_WHEN, LABOR_MODES, LINE_KINDS, SEND_METHODS,
  groupLines, lineAmount, methodLabel, pricingSummary,
} from './change-order-model.js';

export function createChangeOrderWizard(ctx) {
  const { h, money, state, render, renderModalShell, showToast, uid } = ctx;

  const draft = () => state.coWizard;

  // ---- markup helpers -------------------------------------------------------------------

  /** A row of mutually exclusive chips. The selected one carries the value we store. */
  function chipRow(field, options, current) {
    return `<div class="cow-chips" role="radiogroup">${options.map((opt) => `
      <button type="button" class="cow-chip ${opt === current ? 'on' : ''}" role="radio"
              aria-checked="${opt === current ? 'true' : 'false'}"
              data-action="co-wizard-set" data-field="${h(field)}" data-value="${h(opt)}">${h(methodLabel(opt))}</button>`).join('')}</div>`;
  }

  function stepDots(at) {
    return `<div class="cow-steps">${[1, 2, 3].map((n) => `
      <span class="cow-step ${n < at ? 'done' : n === at ? 'now' : ''}">${n}</span>`).join('')}</div>`;
  }

  // ---- step 1: capture ------------------------------------------------------------------

  function stepCapture(d, job) {
    return `
      <p class="cow-eyebrow">Change order · step 1 of 3 — capture it</p>
      <p class="cow-job"><b>${h(job.name)}</b></p>
      ${stepDots(1)}
      <label class="cow-field">What does the client want changed?
        <textarea class="wb-input" rows="3" name="what" data-co-field="what"
                  placeholder="Move both laundry walls 12&quot; · frame 4 new windows south wall">${h(d.what)}</textarea>
      </label>
      <label class="cow-field">Who asked for this?
        <input class="wb-input" name="requestedBy" data-co-field="requestedBy"
               value="${h(d.requestedBy)}" placeholder="${h(job.client_name || 'Client name')}" />
      </label>
      <p class="cow-label">How was this asked?</p>
      ${chipRow('askedVia', ASK_METHODS, d.askedVia)}
      <p class="cow-label">Does this trigger a change-order amount?</p>
      <div class="cow-actions">
        <button class="btn btn-primary" type="button" data-action="co-wizard-step" data-step="2">Yes — price it</button>
        <button class="btn" type="button" data-action="co-wizard-document">No — just document it</button>
      </div>
      <p class="jf-sub">Documenting still records who asked and how. The crew is expected to acknowledge it either way.</p>`;
  }

  // ---- step 2: price --------------------------------------------------------------------

  function lineRow(line, index) {
    const labour = line.kind === 'labor';
    return `
      <div class="cow-line" data-line-index="${index}">
        <input class="wb-input cow-line-label" data-co-line="label" data-index="${index}"
               value="${h(line.label)}" placeholder="${labour ? 'e.g. 2 guys' : 'e.g. 2x6x16 DF'}" aria-label="Description" />
        <input class="wb-input cow-line-num" type="number" min="0" step="0.01" data-co-line="qty" data-index="${index}"
               value="${h(line.qty)}" aria-label="${labour ? 'People' : 'Quantity'}" />
        ${labour ? `<input class="wb-input cow-line-num" type="number" min="0" step="0.25" data-co-line="days" data-index="${index}"
               value="${h(line.days)}" aria-label="Days" />` : ''}
        <input class="wb-input cow-line-num" type="number" min="0" step="0.01" data-co-line="unitCost" data-index="${index}"
               value="${h(line.unitCost)}" aria-label="${labour ? 'Day rate' : 'Unit cost'}" />
        <b class="cow-line-amt">${h(money(lineAmount(line)))}</b>
        <button class="wb-w-btn danger" type="button" data-action="co-wizard-line-del" data-index="${index}"
                title="Remove line" aria-label="Remove line"><i class="ti ti-trash"></i></button>
      </div>`;
  }

  function lineGroup(d, kind) {
    const indexed = d.lines.map((line, index) => ({ line, index })).filter((x) => x.line.kind === kind);
    const labour = kind === 'labor';
    return `
      <section class="cow-group">
        <div class="cow-group-head">
          <p class="cow-label">${h(methodLabel(kind))}</p>
          ${indexed.length ? `<span class="cow-group-cost">${h(money(indexed.reduce((t, x) => t + lineAmount(x.line), 0)))}</span>` : ''}
        </div>
        ${labour ? `<div class="cow-line cow-line-head" aria-hidden="true">
          <span>Description</span><span>People</span><span>Days</span><span>Day rate</span><span>Amount</span><span></span>
        </div>` : indexed.length ? `<div class="cow-line cow-line-head cow-line-3" aria-hidden="true">
          <span>Description</span><span>Qty</span><span>Unit cost</span><span>Amount</span><span></span>
        </div>` : ''}
        ${indexed.map(({ line, index }) => lineRow(line, index)).join('')}
        <button class="cow-add" type="button" data-action="co-wizard-line-add" data-kind="${h(kind)}">
          <i class="ti ti-plus"></i>Add ${h(methodLabel(kind).toLowerCase())} line
        </button>
      </section>`;
  }

  function stepPrice(d, job) {
    const sum = pricingSummary(d.lines, d.marginPct, d.flatPrice, d.method);
    return `
      <p class="cow-eyebrow">Change order · step 2 of 3 — price it your way</p>
      <p class="cow-job"><b>${h(job.name)}</b></p>
      ${stepDots(2)}
      <p class="cow-label">Labor — how are we costing it?</p>
      ${chipRow('laborMode', LABOR_MODES, d.laborMode)}
      ${LINE_KINDS.map((kind) => lineGroup(d, kind)).join('')}

      <div class="cow-price">
        <div class="cow-price-method">
          ${chipRow('method', ['lines', 'flat'], d.method)}
        </div>
        ${d.method === 'lines' ? `
          <label class="cow-field cow-margin">Margin
            <span class="cow-margin-row">
              <input class="wb-input" type="number" min="0" max="99" step="1" data-co-field="marginPct" value="${h(d.marginPct)}" />
              <span>%</span>
            </span>
          </label>`
    : `<label class="cow-field cow-margin">Price
            <input class="wb-input" type="number" min="0" step="0.01" data-co-field="flatPrice" value="${h(d.flatPrice)}" />
          </label>`}
        <div class="cow-total">
          <span class="cow-label">Cost → price</span>
          <p class="jf-sub">Cost <b>${h(money(sum.cost))}</b> · margin <b>${sum.margin.toFixed(1)}%</b></p>
          <strong class="${sum.underwater ? 'cow-bad' : 'cow-good'}">${h(money(sum.price))}</strong>
          ${sum.underwater ? '<p class="jf-warn">This prices at or below what it costs you.</p>' : ''}
        </div>
      </div>

      <div class="cow-actions">
        <button class="btn" type="button" data-action="co-wizard-step" data-step="1">Back</button>
        <button class="btn btn-primary" type="button" data-action="co-wizard-step" data-step="3">Continue — how do we send it?</button>
      </div>`;
  }

  // ---- step 3: send ---------------------------------------------------------------------

  function stepSend(d, job) {
    const sum = pricingSummary(d.lines, d.marginPct, d.flatPrice, d.method);
    return `
      <p class="cow-eyebrow">Change order · step 3 of 3 — send &amp; execute</p>
      <p class="cow-job"><b>${h(job.name)}</b> · <b>${h(money(sum.price))}</b></p>
      ${stepDots(3)}
      <p class="cow-label">How do we send it?</p>
      ${chipRow('sentVia', SEND_METHODS, d.sentVia)}
      <p class="cow-label">When do we execute the work?</p>
      ${chipRow('executeWhen', EXECUTE_WHEN, d.executeWhen)}
      <p class="jf-sub">Whether a reply is binding depends on your contract. Whatever comes back should be
        attached to this change order, so the record of the agreement sits with the work.</p>
      <div class="cow-actions">
        <button class="btn" type="button" data-action="co-wizard-step" data-step="2">Back</button>
        <button class="btn btn-primary" type="button" data-action="co-wizard-save">Send change order — ${h(money(sum.price))}</button>
      </div>`;
  }

  // ---- shell ----------------------------------------------------------------------------

  function renderChangeOrderWizard(job) {
    const d = draft();
    if (!d || !job) return renderModalShell('Jobs', 'Change order', '<p class="jf-sub">That job is no longer available.</p>', 'wb-modal-sm');
    const body = d.step === 2 ? stepPrice(d, job) : d.step === 3 ? stepSend(d, job) : stepCapture(d, job);
    return renderModalShell('Jobs', 'Change order', `
      <div class="cow">
        ${d.error ? `<div class="wb-modal-error" role="alert">${h(d.error)}</div>` : ''}
        ${body}
      </div>`, d.step === 2 ? 'wb-modal-wide' : 'wb-modal-sm');
  }

  // ---- behaviour ------------------------------------------------------------------------

  const blankLine = (kind) => ({
    id: uid(), kind, label: '', qty: 1, days: kind === 'labor' ? 1 : 1, unitCost: 0, materialId: '',
  });

  /** Read the free-text inputs back before any re-render, or typing is lost on every chip. */
  function collect(root) {
    const d = draft();
    if (!d || !root) return;
    root.querySelectorAll('[data-co-field]').forEach((el) => {
      const key = el.dataset.coField;
      d[key] = el.type === 'number' ? Number(el.value || 0) : el.value;
    });
    root.querySelectorAll('[data-co-line]').forEach((el) => {
      const line = d.lines[Number(el.dataset.index)];
      if (!line) return;
      const key = el.dataset.coLine;
      line[key] = key === 'label' ? el.value : Math.max(0, Number(el.value || 0));
    });
  }

  function handleWizardAction(action, el, root) {
    const d = draft();
    if (!d) return false;
    if (action === 'co-wizard-set') {
      collect(root);
      d[el.dataset.field] = el.dataset.value;
      render();
      return true;
    }
    if (action === 'co-wizard-step') {
      collect(root);
      const next = Number(el.dataset.step);
      // Step 1 is the only one with a required field. Blocking here rather than at save keeps
      // the message next to the box it is about.
      if (next > 1 && !String(d.what || '').trim()) {
        d.error = 'Say what the client wants changed first.';
        render();
        return true;
      }
      d.error = '';
      d.step = next;
      render();
      return true;
    }
    if (action === 'co-wizard-line-add') {
      collect(root);
      d.lines = [...d.lines, blankLine(el.dataset.kind)];
      render();
      return true;
    }
    if (action === 'co-wizard-line-del') {
      collect(root);
      d.lines = d.lines.filter((_, i) => i !== Number(el.dataset.index));
      render();
      return true;
    }
    if (action === 'co-wizard-document') {
      collect(root);
      // Documented, not charged: no lines, no price, and it stays at "requested" so it still
      // shows up as something the crew has to acknowledge.
      d.method = 'flat';
      d.flatPrice = 0;
      d.lines = [];
      ctx.saveWizard(d, { documentOnly: true });
      return true;
    }
    if (action === 'co-wizard-save') {
      collect(root);
      ctx.saveWizard(d, { documentOnly: false });
      return true;
    }
    return false;
  }

  /** What gets written: the change order, then its lines. Shaped for the tables, not the UI. */
  function wizardPayload(d, job, documentOnly) {
    const sum = pricingSummary(d.lines, d.marginPct, d.flatPrice, d.method);
    return {
      changeOrder: {
        company_id: job.company_id,
        job_id: job.id,
        title: String(d.what || '').trim().slice(0, 140),
        description: String(d.what || '').trim(),
        price: documentOnly ? 0 : Number(sum.price.toFixed(2)),
        cost: documentOnly ? 0 : Number(sum.cost.toFixed(2)),
        // Documented-only stays at requested; a priced one has genuinely been priced.
        step: documentOnly ? 'requested' : 'sent',
        requested_by: String(d.requestedBy || '').trim(),
        asked_via: d.askedVia || '',
        sent_via: documentOnly ? '' : (d.sentVia || ''),
        execute_when: d.executeWhen || 'on_acceptance',
        pricing_method: d.method === 'flat' ? 'flat' : 'lines',
        margin_pct: documentOnly ? 0 : Number(sum.margin.toFixed(2)),
      },
      lines: documentOnly ? [] : d.lines
        .filter((line) => String(line.label || '').trim() || lineAmount(line) > 0)
        .map((line, index) => ({
          company_id: job.company_id,
          job_id: job.id,
          kind: line.kind,
          label: String(line.label || '').trim() || methodLabel(line.kind),
          qty: line.qty,
          days: line.days,
          unit_cost: line.unitCost,
          material_id: line.materialId || null,
          sort_order: index,
        })),
    };
  }

  return { renderChangeOrderWizard, handleWizardAction, wizardPayload, groupLines, blankLine };
}
