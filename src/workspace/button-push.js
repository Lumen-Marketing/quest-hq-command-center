// Pressing a Button field: carry this record into another app, growing that app's field list
// to fit if it has to.
//
// Fetched on the first press. The plan and the merge rules are in ./button-field.js and are
// pure; this is the part that writes -- into the target doc, which may belong to another
// company, so every step checks it is allowed before it changes anything.

import {
  conditionMet, fieldToCreate, planPush, planSet, setValueFor, translateValue,
} from './button-field.js';

export function createButtonPush(ctx) {
  const {
    can, wbDoc, wbSave, wbUid, showToast, render, canonicalCompanyId, activeSession,
    state, wbFind, wbReadFieldInput, activeCompanyId,
  } = ctx;

  /** The target app, wherever it lives, or null with the reason it cannot be reached. */
  function resolveTarget(config) {
    const companyId = canonicalCompanyId(config?.targetCompany || '');
    if (!companyId || !config?.targetApp) return { error: 'This button has no destination set yet.' };
    const doc = wbDoc(companyId);
    // The builder docs a session holds are the ones its RLS let it load, so an unreachable
    // company is simply absent rather than something to test for separately.
    if (!doc) return { error: 'You do not have access to that workspace.' };
    for (const workspace of doc.workspaces || []) {
      const app = (workspace.apps || []).find((item) => item.id === config.targetApp);
      if (app) return { companyId, doc, workspace, app };
    }
    return { error: 'That app has been deleted or moved.' };
  }

  /**
   * Carry `item` from `sourceApp` into wherever the button points.
   *
   * The target app gains any field it was missing, then a new record is added holding what
   * came across. A field the source has nothing for is left blank on the new record -- which
   * is the whole reason the merge is safe: nothing in the target is overwritten, and the
   * records already there keep every value they had, with the new columns empty.
   */
  async function pressButton(sourceCompanyId, sourceApp, buttonField, item) {
    const target = resolveTarget(buttonField.config);
    if (target.error) { showToast(target.error, 'local', 'Workspaces'); return false; }
    if (!can('workspaces.manage', target.companyId)) {
      showToast(`Your role cannot add records in ${target.app.name}.`, 'error', 'Workspaces');
      return false;
    }

    const plan = planPush(sourceApp, target.app, buttonField);
    if (!plan.carry.length) {
      showToast('There is nothing on this record that can be carried across.', 'local', 'Workspaces');
      return false;
    }

    // 1. Grow the target's field list. Existing records are untouched: a field they have never
    //    had simply reads blank, which is what an empty cell already means everywhere else.
    const made = new Map();
    plan.create.forEach((field) => {
      const fresh = fieldToCreate(field, wbUid);
      target.app.fields.push(fresh);
      made.set(field.id, fresh);
    });

    // 2. Translate the values into the target's own ids.
    const values = {};
    plan.carry.forEach(({ from, to, made: isNew }) => {
      const destination = isNew ? made.get(from.id) : to;
      if (!destination) return;
      const raw = item?.values?.[from.id];
      const { value, options } = translateValue(from, destination, raw, wbUid);
      // A category that gained an option had to gain it on the DESTINATION field, or the value
      // would point at an option only the source app has.
      if (options) destination.config = { ...(destination.config || {}), options };
      values[destination.id] = value;
    });

    // 3. Add the record.
    const now = new Date().toISOString();
    if (!Array.isArray(target.app.items)) target.app.items = [];
    target.app.items.unshift({
      id: wbUid(),
      values,
      createdAt: now,
      createdBy: activeSession()?.profile?.id || '',
      updatedAt: now,
      lastActivityAt: now,
      // Where it came from, so a record that arrived by button can be told from one typed in.
      pushedFrom: { companyId: canonicalCompanyId(sourceCompanyId), appId: sourceApp.id, itemId: item.id },
    });

    // The doc resolveTarget handed back IS the one in state, so the merge above already
    // landed; this persists it, for the target's company rather than for the one we are in.
    await wbSave(target.companyId);
    const grew = plan.create.length
      ? ` ${plan.create.length} field${plan.create.length === 1 ? '' : 's'} added to fit.`
      : '';
    showToast(`Sent to ${target.app.name}.${grew}`, 'local', 'Workspaces');
    render();
    return true;
  }

  // ---- whether the button is live, judged against the form ---------------------------------
  //
  // Against the FORM rather than the saved record, so changing a stage lights the button up
  // straight away. Waiting for a save and a reload to find out whether a button works is how
  // people conclude it does not.

  /** A field's value as a person reads it, read back out of the form. */
  function readFromDom(scope, fieldId) {
    const node = scope.querySelector(`[data-f="${cssEscape(fieldId)}"]`);
    if (!node) return '';
    // A category shows its label in a box beside the hidden id, and the label is what a
    // condition is written against.
    const combo = node.type === 'hidden' ? node.closest('[data-wb-option-combo]') : null;
    if (combo) return String(combo.querySelector('[data-wb-option-input]')?.value || '').trim();
    if (node.type === 'checkbox') return node.checked ? 'yes' : 'no';
    if (node.tagName === 'SELECT') return String(node.options[node.selectedIndex]?.textContent || '').trim();
    return String(node.value || '').trim();
  }

  const cssEscape = (value) => (typeof CSS !== 'undefined' && CSS.escape
    ? CSS.escape(value)
    : String(value).replace(/["\\]/g, '\\$&'));

  const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

  function ruleHoldsInDom(scope, rule) {
    const value = readFromDom(scope, rule.field);
    switch (rule.op) {
      case 'filled': return value !== '' && value !== 'no';
      case 'empty': return value === '' || value === 'no';
      case 'neq': return !same(value, rule.value);
      case 'gt': return Number(value) > Number(rule.value);
      case 'lt': return Number(value) < Number(rule.value);
      default: return same(value, rule.value);
    }
  }

  /** Enable or disable every button in `root` against what the form currently holds. */
  function syncButtons(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[data-wb-press]').forEach((button) => {
      // A button with no destination stays disabled whatever the record says.
      if (button.dataset.wbNoTarget === '1') return;
      // A button in the LIST is judged against its own record's stored values, and reads its
      // rules straight off the field. One on a FORM is judged against the form, so changing a
      // stage lights it up before anything is saved.
      const row = seatOf(button.dataset.wbPressCtx);
      if (row) {
        const field = (row.app.fields || []).find((item) => item.id === button.dataset.wbPress);
        const ready = !!field?.config?.targetApp;
        button.disabled = !(ready && conditionMet(field, row.item, row.app));
        button.title = ready ? '' : 'This button has no destination set yet.';
        return;
      }
      let rules = [];
      try { rules = JSON.parse(button.dataset.wbWhen || '[]'); } catch { rules = []; }
      const scope = button.closest('form, .wb-modal, .wb-record-page') || root;
      const live = rules.every((rule) => ruleHoldsInDom(scope, rule));
      button.disabled = !live;
      button.title = live ? '' : 'Not available on this record yet.';
    });
  }

  /**
   * Press the button on the record form that is open.
   *
   * Reads the FORM rather than the last save, so pressing it on a record somebody has just
   * edited carries what they can actually see. Everything here needs the open modal, the app
   * and the field reader, so it lives beside the push rather than in main.js, which would pay
   * for it in every session that never presses a button.
   */
  /**
   * The second action: change fields on the record the button is sitting on.
   *
   * Where it acts differs by where it is pressed, and deliberately. In the LIST there is no
   * form, so it writes the record and saves. On a FORM there is one, so it writes the boxes and
   * leaves them for the person to look at and save -- writing behind their back while they are
   * halfway through typing is the more surprising of the two.
   */
  function applySet(companyId, app, buttonField, item, seated) {
    const sets = planSet(app, buttonField);
    if (!sets.length) {
      showToast('This button has no fields to change yet.', 'local', 'Workspaces');
      return false;
    }
    let touched = 0;
    if (seated) {
      sets.forEach(({ field, value }) => {
        const next = setValueFor(field, value);
        // null means the value could not be expressed in that field -- an option it has never
        // heard of, or letters in a number. Skipped rather than written as nonsense.
        if (next === null) return;
        item.values[field.id] = next;
        touched += 1;
      });
      if (touched) {
        item.updatedAt = new Date().toISOString();
        item.lastActivityAt = item.updatedAt;
        wbSave(companyId);
      }
    } else {
      const scope = document.querySelector('.wb-modal, .wb-record-page') || document;
      sets.forEach(({ field, value }) => {
        if (writeIntoForm(scope, field, value)) touched += 1;
      });
    }
    showToast(touched
      ? `${touched} field${touched === 1 ? '' : 's'} changed.`
      : 'Nothing on this record could be changed.', 'local', 'Workspaces');
    render();
    return touched > 0;
  }

  /** Write one value into the form, overwriting: a button asked to set a field means it. */
  function writeIntoForm(scope, field, value) {
    const node = scope.querySelector(`[data-f="${cssEscape(field.id)}"]`);
    if (!node) return false;
    const combo = node.type === 'hidden' ? node.closest('[data-wb-option-combo]') : null;
    const box = combo ? combo.querySelector('[data-wb-option-input]') : node;
    if (!box) return false;
    if (!combo && box.type === 'checkbox') box.checked = /^(yes|true|1|on)$/i.test(String(value));
    else if (!combo && box.tagName === 'SELECT') {
      const match = [...box.options].find((option) => option.textContent.trim().toLowerCase() === String(value).trim().toLowerCase());
      box.value = match ? match.value : '';
    } else box.value = value;
    box.dispatchEvent(new Event('input', { bubbles: true }));
    box.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  /** The row a table button belongs to: "companyId|workspaceId|appId|itemId". */
  function seatOf(seat) {
    const [companyId, workspaceId, appId, itemId] = String(seat || '').split('|');
    if (!itemId) return null;
    const { app } = wbFind(canonicalCompanyId(companyId), workspaceId, appId);
    const item = (app?.items || []).find((row) => row.id === itemId);
    return app && item ? { companyId: canonicalCompanyId(companyId), app, item } : null;
  }

  /**
   * Press a button, from a row in the list or from the open record.
   *
   * A row carries its own seat, because the list shows many records and the button has to act
   * on the one it is sitting in rather than on whatever happens to be open.
   */
  function press(fieldId, seat) {
    const row = seatOf(seat);
    if (!row) return pressFromForm(fieldId);
    const field = (row.app.fields || []).find((item) => item.id === fieldId);
    if (!field) return false;
    return field.config?.action === 'set'
      ? applySet(row.companyId, row.app, field, row.item, true)
      : pressButton(row.companyId, row.app, field, row.item);
  }

  function pressFromForm(fieldId) {
    const modal = state.builderModal;
    const companyId = canonicalCompanyId(modal?.companyId || activeCompanyId());
    const { app } = wbFind(companyId, modal?.workspaceId, modal?.appId);
    const field = (app?.fields || []).find((item) => item.id === fieldId);
    if (!app || !field) return false;
    const values = { ...(modal?.draft?.values || {}) };
    app.fields.forEach((item) => {
      const read = wbReadFieldInput(item);
      if (read !== undefined) values[item.id] = read;
    });
    if (field.config?.action === 'set') return applySet(companyId, app, field, { values }, false);
    return pressButton(companyId, app, field, { id: modal?.editId || wbUid(), values });
  }

  return {
    press, pressButton, pressFromForm, resolveTarget, syncButtons,
  };
}
