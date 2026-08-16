// Pressing a Button field: carry this record into another app, growing that app's field list
// to fit if it has to.
//
// Fetched on the first press. The plan and the merge rules are in ./button-field.js and are
// pure; this is the part that writes -- into the target doc, which may belong to another
// company, so every step checks it is allowed before it changes anything.

import {
  buttonNotReady, buttonReady, conditionMet, fieldToCreate,
  planPush, planSet, setValueFor, translateValue,
} from './button-field.js';
import { arrivalRef } from './record-ref.js';

export function createButtonPush(ctx) {
  const {
    h, can, wbDoc, wbSave, wbUid, showToast, render, canonicalCompanyId, activeSession,
    state, wbFind, wbReadFieldInput, activeCompanyId, wbLogActivity, wbItemTitle,
    contactSeat,
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
  async function pressButton(sourceCompanyId, sourceApp, buttonField, item, sourceWorkspace, from = null) {
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

    // 1. Grow the target's field list, with what arrived FIRST and in the order it had at
    //    home: App 1 (text, number) landing in App 2 (location) reads text, number, location,
    //    which is the record as the person sending it thinks of it. It is only a starting
    //    order -- the field list is draggable afterwards like any other.
    //
    //    Existing records are untouched: a field they have never had simply reads blank, which
    //    is what an empty cell already means everywhere else.
    const made = new Map();
    const fresh = plan.create.map((field) => {
      const clone = fieldToCreate(field, wbUid);
      made.set(field.id, clone);
      return clone;
    });
    target.app.fields.unshift(...fresh);

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

    // 2b. The link back to the contact, when this was pushed FROM one.
    //
    // Without it the arrival never appears on the card that produced it: contactUsage only
    // finds a record through a Company Contact field holding the contact's id, so the button
    // would look like it had silently done nothing. The field is minted where the target has
    // none, which is the same "grow the app to fit" rule the rest of the push follows.
    if (from?.contactId) {
      let link = (target.app.fields || []).find((field) => field?.type === 'company_contact');
      if (!link) {
        link = fieldToCreate({ type: 'company_contact', label: 'Contact', config: {} }, wbUid);
        target.app.fields.unshift(link);
      }
      values[link.id] = from.contactId;
    }

    // 3. Add the record.
    const now = new Date().toISOString();
    if (!Array.isArray(target.app.items)) target.app.items = [];
    const moving = buttonField.config?.action === 'move';

    // A MOVE keeps the record. Same id, its comments, and the history it built up -- the record
    // did not stop existing and start again somewhere else, it went somewhere else. A copy is
    // the other thing, and gets a new id because it genuinely is a second record.
    //
    // The id is only kept when the target does not already hold one -- two records sharing an id
    // in one app would make every lookup ambiguous, and every lookup here is by id.
    const idIsFree = !(target.app.items || []).some((row) => row.id === item.id);
    const keepId = moving && idIsFree;
    const arrivedId = keepId ? item.id : wbUid();
    target.app.items.unshift({
      id: arrivedId,
      values,
      // A move carries the record's beginning with it; a copy begins now, because it does.
      createdAt: moving && item.createdAt ? item.createdAt : now,
      createdBy: moving && item.createdBy ? item.createdBy : (activeSession()?.profile?.id || ''),
      updatedAt: now,
      lastActivityAt: now,
      ...(moving && Array.isArray(item.comments) && item.comments.length
        ? { comments: item.comments.map((entry) => ({ ...entry })) }
        : {}),
      ...(moving && Array.isArray(item.children) && item.children.length
        ? { children: item.children.map((child) => ({ ...child })) }
        : {}),
      // Where it came from, so a record that arrived by button can be told from one typed in.
      // A contact is tagged as such: `cc-<companyId>` is not an app id, and anything reading
      // provenance has to be able to tell the two apart.
      pushedFrom: from?.contactId
        ? { companyId: canonicalCompanyId(sourceCompanyId), kind: 'contact', contactId: from.contactId }
        : { companyId: canonicalCompanyId(sourceCompanyId), appId: sourceApp.id, itemId: item.id },
    });

    const grew = plan.create.length
      ? ` ${plan.create.length} field${plan.create.length === 1 ? '' : 's'} added to fit.`
      : '';
    // A contact's title is its name, which is a real column rather than a field -- wbItemTitle
    // reads item.values against app.fields and would call every contact "Untitled".
    const title = from?.contactName || wbItemTitle(sourceApp, item);

    // A move takes the record's HISTORY with it. Activity lives on the workspace, keyed by app
    // and item, so the entries belonging to this record are carried across and re-pointed at
    // the app they now live in. Without this the record arrives with an empty Activity tab and
    // everything that ever happened to it is stranded in an app it is no longer in.
    if (moving && sourceWorkspace && Array.isArray(sourceWorkspace.activity)) {
      const mine = sourceWorkspace.activity.filter((entry) => entry
        && entry.appId === sourceApp.id && entry.itemId === item.id);
      if (mine.length) {
        sourceWorkspace.activity = sourceWorkspace.activity.filter((entry) => !mine.includes(entry));
        if (!Array.isArray(target.workspace.activity)) target.workspace.activity = [];
        target.workspace.activity.push(...mine.map((entry) => ({
          ...entry, appId: target.app.id, itemId: arrivedId,
        })));
      }
    }

    // The arrival, on the RECEIVING side. Without it the record opens on an empty Activity tab
    // reading "Nothing yet" -- wrong twice over: something did happen, and the one thing worth
    // knowing about this record is that nobody here typed it. A pipeline is a sequence of apps
    // handing work along, so "it landed, from there, sent by them" is the entry the next person
    // along actually needs. Logged as `created`, because for this app it IS the record's
    // beginning -- it has no earlier history here to be an update to.
    //
    // Named as the record, not as its fields: the title is what the arrival is about, and it
    // reads as the sentence somebody would say -- "Kevin Henderson arrived from Lead Gen".
    wbLogActivity(target.workspace, {
      // A move is not this record's beginning -- it has a history, and it just came with it.
      kind: moving ? 'updated' : 'created',
      // Covered by every icon pack, unlike the arrow-into-a-bar that says this more literally
      // and falls back to Tabler in all three.
      icon: moving ? 'ti-arrow-right' : 'ti-package-import',
      color: '#e0552d',
      appId: target.app.id,
      itemId: arrivedId,
      // The reference, not "(a copy)". Two sends of the same contact used to produce two
      // identical lines with no way to tell which arrival was which record; this one names it.
      text: moving
        ? `<b>${h(title)}</b> moved from <b>${h(sourceApp.name)}</b> to <b>${h(target.app.name)}</b> <span class="wb-act-ref">${h(arrivalRef(arrivedId))}</span>${grew}`
        : `<b>${h(title)}</b> arrived from <b>${h(sourceApp.name)}</b> <span class="wb-act-ref">${h(arrivalRef(arrivedId))}</span>${grew}`,
    });

    // The doc resolveTarget handed back IS the one in state, so the merge above already
    // landed; this persists it, for the target's company rather than for the one we are in.
    await wbSave(target.companyId);
    // 4. "Send it and take it off this app." The record moves on rather than being copied:
    //    its FIELDS stay exactly as they are here -- this app keeps its shape and its other
    //    records -- and only the one that was sent is gone. Done after the target is saved, so
    //    a failure to write there cannot lose the record from both.
    const moved = moving && (sourceApp.items || []).some((row) => row.id === item.id);
    if (moved) {
      sourceApp.items = sourceApp.items.filter((row) => row.id !== item.id);
      if (sourceWorkspace) {
        // No appId/itemId: the record is not here any more, so an entry keyed to it would sit
        // in this app's feed pointing at something nobody here can open. This is a note about
        // the APP -- one of its records left -- and belongs in the workspace's own history.
        wbLogActivity(sourceWorkspace, {
          icon: 'ti-arrow-right', color: '#dc2626',
          text: `<b>${h(title)}</b> moved from <b>${h(sourceApp.name)}</b> to <b>${h(target.app.name)}</b> <span class="wb-act-ref">${h(arrivalRef(arrivedId))}</span>`,
        });
      }
      wbSave(canonicalCompanyId(sourceCompanyId));
      // The record it was open on no longer exists, so the form cannot stay on it.
      if (state.builderModal?.editId === item.id) state.builderModal = null;
    }

    showToast(`${moved ? 'Moved' : 'Sent'} to ${target.app.name}.${grew}`, 'local', 'Workspaces');
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
    // A record being ADDED has not been saved, so there is nothing to send, change or link from.
    // Pressing a push button here would file a record the app does not have yet, and pressing a
    // "change fields" one would write into boxes that are about to be replaced by the save. So
    // every button on a new-record form is held until the record exists.
    const adding = !!state.builderModal && !state.builderModal.editId
      && root.closest?.('.wb-modal, .wb-record-page') !== null;
    root.querySelectorAll('[data-wb-press]').forEach((button) => {
      if (adding && !button.dataset.wbPressCtx) {
        button.disabled = true;
        button.title = 'Save this record first — there is nothing to send yet.';
        return;
      }
      // A button with no destination stays disabled whatever the record says.
      if (button.dataset.wbNoTarget === '1') return;
      // A button on a CONTACT CARD is judged against the contact's stored values. Checked
      // before seatOf, because a card has no form and no record row: without this the DOM-rules
      // path below finds no scope, reads every rule as '', and leaves every conditional button
      // permanently dead while every unconditional one is live regardless of its rules.
      const cc = String(button.dataset.wbPressCtx || '').startsWith('cc|')
        ? contactSeat?.(button.dataset.wbPressCtx)
        : null;
      if (cc) {
        const card = cc.button(button.dataset.wbPress);
        if (!card) return;
        const asField = { id: card.id, type: 'button', label: card.label, config: card };
        const ready = buttonReady(asField);
        button.disabled = !(ready && conditionMet(asField, cc.item, cc.sourceApp));
        button.title = ready ? '' : buttonNotReady(asField);
        return;
      }
      // A button in the LIST is judged against its own record's stored values, and reads its
      // rules straight off the field. One on a FORM is judged against the form, so changing a
      // stage lights it up before anything is saved.
      const row = seatOf(button.dataset.wbPressCtx);
      if (row) {
        const field = (row.app.fields || []).find((item) => item.id === button.dataset.wbPress);
        const ready = buttonReady(field);
        button.disabled = !(ready && conditionMet(field, row.item, row.app));
        button.title = ready ? '' : buttonNotReady(field);
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
    const { app, workspace } = wbFind(canonicalCompanyId(companyId), workspaceId, appId);
    const item = (app?.items || []).find((row) => row.id === itemId);
    return app && item ? { companyId: canonicalCompanyId(companyId), app, workspace, item } : null;
  }

  /**
   * Press a button, from a row in the list or from the open record.
   *
   * A row carries its own seat, because the list shows many records and the button has to act
   * on the one it is sitting in rather than on whatever happens to be open.
   */
  /**
   * A button pressed on a contact card.
   *
   * The seat is `cc|<companyId>|<contactId>` -- three parts, deliberately not four, so seatOf's
   * own split can never mistake one for a record seat. Everything about what a contact STORES
   * lives behind contactSeat, in the contacts page; this only decides which action runs.
   */
  async function pressContactButton(buttonId, seat) {
    const cc = contactSeat?.(seat);
    if (!cc) { showToast('That contact is no longer open.', 'local', 'Company Contacts'); return false; }
    const button = cc.button(buttonId);
    if (!button) return false;

    // The card button carries its own configuration rather than a field's, so the shared rules
    // are asked against a field-shaped view of it. conditionMet and planPush read `config`.
    const asField = { id: button.id, type: 'button', label: button.label, config: button };
    if (!conditionMet(asField, cc.item, cc.sourceApp)) {
      showToast('This button is not available on this contact yet.', 'local', 'Company Contacts');
      return false;
    }

    if (button.action === 'link') return cc.openLink(button);
    if (button.action === 'set') {
      const touched = await cc.applySet(button);
      showToast(touched
        ? `${touched} field${touched === 1 ? '' : 's'} changed.`
        : 'Nothing on this contact could be changed.', 'local', 'Company Contacts');
      render();
      return touched > 0;
    }
    return pressButton(cc.companyId, cc.sourceApp, asField, cc.item, null, {
      contactId: cc.contact.id,
      contactName: cc.contact.name,
    });
  }

  function press(fieldId, seat) {
    if (String(seat || '').startsWith('cc|')) return pressContactButton(fieldId, seat);
    const row = seatOf(seat);
    if (!row) return pressFromForm(fieldId);
    const field = (row.app.fields || []).find((item) => item.id === fieldId);
    if (!field) return false;
    return field.config?.action === 'set'
      ? applySet(row.companyId, row.app, field, row.item, true)
      : pressButton(row.companyId, row.app, field, row.item, row.workspace);
  }

  function pressFromForm(fieldId) {
    const modal = state.builderModal;
    const companyId = canonicalCompanyId(modal?.companyId || activeCompanyId());
    const { app, workspace } = wbFind(companyId, modal?.workspaceId, modal?.appId);
    const field = (app?.fields || []).find((item) => item.id === fieldId);
    if (!app || !field) return false;
    const values = { ...(modal?.draft?.values || {}) };
    app.fields.forEach((item) => {
      const read = wbReadFieldInput(item);
      if (read !== undefined) values[item.id] = read;
    });
    if (field.config?.action === 'set') return applySet(companyId, app, field, { values }, false);
    return pressButton(companyId, app, field, { id: modal?.editId || wbUid(), values }, workspace);
  }

  return {
    press, pressButton, pressFromForm, resolveTarget, syncButtons,
  };
}
