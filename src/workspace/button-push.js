// Pressing a Button field: carry this record into another app, growing that app's field list
// to fit if it has to.
//
// Fetched on the first press. The plan and the merge rules are in ./button-field.js and are
// pure; this is the part that writes -- into the target doc, which may belong to another
// company, so every step checks it is allowed before it changes anything.

import {
  buttonNotReady, buttonReady, conditionMet, fieldToCreate, isContactsTarget,
  planPush, planSet, readable, setValueFor, translateValue,
} from './button-field.js';
import { arrivalRef } from './record-ref.js';

export function createButtonPush(ctx) {
  const {
    h, can, wbDoc, wbSave, wbUid, showToast, render, canonicalCompanyId, activeSession,
    state, wbFind, wbReadFieldInput, activeCompanyId, wbLogActivity, wbItemTitle, wbRunAutomations,
    contactSeat, contactsApp, contactIntake,
    // A move takes the record out of this app; these are how the reader goes with it.
    navigate, companyPath,
  } = ctx;

  /**
   * The record, shaped as a contact: a name plus every field the DIRECTORY also has.
   *
   * Used by both ways a contact can be created from a record -- a button pointed straight at
   * Company Contacts, and a text field landing on a Company Contact field in an ordinary app.
   * One builder, so the two cannot disagree about which fields travel.
   *
   * `planPush` against the directory does the matching, which means the same label rule and the
   * same type rule as everywhere else, and `fixedFields` keeps it from inventing columns on a
   * list the whole company shares.
   */
  function contactPayloadFrom(sourceApp, item, buttonField, companyId, nameOverride = '') {
    const directory = contactsApp?.(companyId);
    if (!directory) return null;
    const plan = planPush(sourceApp, directory, buttonField);
    let name = String(nameOverride || '').trim();
    const plain = {};
    plan.carry.forEach(({ from: source, to }) => {
      const text = readable(source, item?.values?.[source.id]).trim();
      // The synthetic Name field of the directory. When the caller already knows the name --
      // it came from the very field being converted -- that wins over the heuristic.
      if (to.id === 'name') { if (!name) name = text; return; }
      if (text) plain[to.id] = text;
    });

    // Then by TYPE, for the details a contact card is made of.
    //
    // Matching on the label alone is too strict here. An app calling its phone field "no." and
    // a directory calling its own "Phone" mean the same thing, and the person filing the
    // contact expects the number to travel -- there is exactly one place a phone number can go
    // on a contact. Only where the directory has ONE field of that type, and only into one
    // nothing has already claimed: two Phone fields is a real choice and guessing between them
    // would be worse than leaving it.
    const CONTACT_DETAIL = ['phone', 'email', 'location', 'url'];
    CONTACT_DETAIL.forEach((type) => {
      const homes = (directory.fields || []).filter((field) => field.type === type);
      if (homes.length !== 1 || plain[homes[0].id]) return;
      const sources = (sourceApp?.fields || []).filter((field) => field.type === type
        && String(item?.values?.[field.id] ?? '').trim());
      if (sources.length !== 1) return;
      plain[homes[0].id] = readable(sources[0], item.values[sources[0].id]).trim();
    });

    return name ? { name, plain } : null;
  }

  /** The target app, wherever it lives, or null with the reason it cannot be reached. */
  function resolveTarget(config) {
    const companyId = canonicalCompanyId(config?.targetCompany || '');
    if (!companyId || !config?.targetApp) return { error: 'This button has no destination set yet.' };
    // The directory is not in any builder doc, so it is resolved before one is looked for.
    // It carries no workspace either: a contact belongs to the company, not to a workspace.
    if (isContactsTarget(config.targetApp)) {
      const app = contactsApp?.(companyId);
      return app ? { companyId, doc: null, workspace: null, app, contacts: true }
        : { error: 'Company Contacts is not available here.' };
    }
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
  /**
   * Every destination this button sends to: the main one, then any extras.
   *
   * Deduplicated, because the same app named twice would file the record twice with no way to
   * tell the two arrivals apart, and the source app is refused for the same reason the picker
   * never offers it -- a button that files a record into the app it already lives in is a loop.
   */
  function extraTargets(sourceApp, config) {
    const primary = `${canonicalCompanyId(config?.targetCompany || '')}|${config?.targetApp || ''}`;
    const seen = new Set([primary]);
    return (Array.isArray(config?.also) ? config.also : []).reduce((out, row) => {
      const company = canonicalCompanyId(row?.company || config?.targetCompany || '');
      const app = String(row?.app || '');
      const key2 = `${company}|${app}`;
      if (!app || app === sourceApp?.id || seen.has(key2)) return out;
      seen.add(key2);
      out.push({ company, app });
      return out;
    }, []);
  }

  /**
   * One press, one or many destinations.
   *
   * "I want it to send records to multiple apps." The extras are sent FIRST and always as
   * copies, and the main destination goes last -- because that is the one that may be a MOVE,
   * and a move deletes the record from here. Running it first would leave nothing to copy.
   *
   * If any extra fails, the move does not happen. Half a fan-out plus a deletion is the one
   * outcome with no way back: the record would be gone from here and in only some of the places
   * it was meant to reach.
   */
  async function pressButton(sourceCompanyId, sourceApp, buttonField, item, sourceWorkspace, from = null) {
    const extras = extraTargets(sourceApp, buttonField?.config);
    if (!extras.length) return pressOne(sourceCompanyId, sourceApp, buttonField, item, sourceWorkspace, from);

    for (const extra of extras) {
      // A copy, whatever the button's own action is, and with the extras stripped so this
      // cannot recurse. The field mapping is left behind too: it names field ids in the MAIN
      // destination, which mean nothing in this one.
      const asCopy = {
        ...buttonField,
        config: {
          ...buttonField.config, action: 'push', targetCompany: extra.company, targetApp: extra.app, also: [], map: [],
        },
      };
      // A refusal and a thrown save are the same event here -- that app did not take it. The
      // throw already stopped the move by unwinding past it, but only by accident; catching it
      // makes the guarantee the code's rather than the call order's, and says so in words
      // instead of surfacing a raw error.
      // eslint-disable-next-line no-await-in-loop
      const sent = await pressOne(sourceCompanyId, sourceApp, asCopy, item, sourceWorkspace, from)
        .catch(() => false);
      if (!sent) {
        showToast('Stopped: one of the other apps could not take it, so nothing was removed from here.', 'error', 'Workspaces');
        return false;
      }
    }

    const primary = { ...buttonField, config: { ...buttonField.config, also: [] } };
    return pressOne(sourceCompanyId, sourceApp, primary, item, sourceWorkspace, from);
  }

  async function pressOne(sourceCompanyId, sourceApp, buttonField, item, sourceWorkspace, from = null) {
    const target = resolveTarget(buttonField.config);
    if (target.error) { showToast(target.error, 'local', 'Workspaces'); return false; }
    if (target.contacts) {
      return pushToContacts(sourceCompanyId, sourceApp, buttonField, item, sourceWorkspace, target);
    }
    if (!can('workspaces.manage', target.companyId)) {
      showToast(`Your role cannot add records in ${target.app.name}.`, 'error', 'Workspaces');
      return false;
    }

    const plan = planPush(sourceApp, target.app, buttonField);
    if (!plan.carry.length) {
      showToast('There is nothing on this record that can be carried across.', 'local', 'Workspaces');
      return false;
    }

    // 1. Grow the target's field list, appending what arrived in the order it had at home.
    //    They go LAST, after the fields the target already had: that app's own shape is the
    //    one its people know, and putting an arrival at the top reorders a form underneath
    //    everybody who uses it. It is only a starting order -- the list is draggable like any
    //    other.
    //
    //    Existing records are untouched: a field they have never had simply reads blank, which
    //    is what an empty cell already means everywhere else.
    const made = new Map();
    const fresh = plan.create.map((field) => {
      const clone = fieldToCreate(field, wbUid);
      made.set(field.id, clone);
      return clone;
    });
    target.app.fields.push(...fresh);

    // 2. Translate the values into the target's own ids.
    const values = {};
    plan.carry.forEach(({ from, to, made: isNew, kind }) => {
      // Filed as a contact below, not written as words. A Company Contact field stores an id.
      if (kind === 'contact') return;
      const destination = isNew ? made.get(from.id) : to;
      if (!destination) return;
      const raw = item?.values?.[from.id];
      const { value, options } = translateValue(from, destination, raw, wbUid);
      // A category that gained an option had to gain it on the DESTINATION field, or the value
      // would point at an option only the source app has.
      if (options) destination.config = { ...(destination.config || {}), options };
      values[destination.id] = value;
    });

    // 2a. Text arriving at a Company Contact field becomes a CONTACT.
    //
    // "Prospects has Name as a text field; Leads has Name as a Company Contact field." Writing
    // the words into it would store a name where an id belongs and render as a broken chip. So
    // the person is filed in the company directory first and the field is given their id --
    // and because the directory is filled from the whole record rather than from that one
    // field, their Phone, Email and Location travel with them wherever the two agree on a name.
    //
    // An existing contact of that name is REUSED, never duplicated, and only blank fields on
    // them are filled: the directory is the company's record of a person, and a button press
    // is not permission to overwrite it.
    const contactPairs = plan.carry.filter((pair) => pair.kind === 'contact');
    // What the conversion actually DID, kept so it can be written into the arriving record's
    // history below -- "a contact was created" is a real event, and until now the only trace of
    // it was a contact card appearing in the directory with nothing saying where it came from.
    // Logged after the record exists, because an entry has to be keyed to a record to show on it.
    const minted = [];
    if (contactPairs.length) {
      const failures = [];
      for (const pair of contactPairs) {
        const name = readable(pair.from, item?.values?.[pair.from.id]).trim();
        // No name is not a failure: the record simply had nothing there, and an empty contact
        // field is the honest result.
        if (!name) continue;
        const payload = contactPayloadFrom(sourceApp, item, buttonField, target.companyId, name);
        if (!payload) { failures.push(pair.to.label); continue; }
        // Sequential, like createMissingContacts: two fields naming the same person must not
        // race each other into two rows.
        // eslint-disable-next-line no-await-in-loop
        const filed = await contactIntake?.(target.companyId, payload);
        if (filed?.ok && filed.contact?.id) {
          values[pair.to.id] = filed.contact.id;
          minted.push({ field: pair.to.label, name, reused: !!filed.reused });
        } else failures.push({ label: pair.to.label, reason: filed?.error || '' });
      }
      if (failures.length) {
        // The record still goes. Losing the link is worse than losing the record, but a move
        // that stopped here would leave the record nowhere at all.
        //
        // The REASON travels with it. The intake knows exactly why it refused -- a role that
        // cannot add contacts, a name it could not read, a save that failed -- and reporting
        // only that it "could not be filed" turned a one-line permission answer into a
        // support question, because all three refusals read identically.
        const labels = failures.map((failure) => failure.label).join(', ');
        const reasons = [...new Set(failures.map((failure) => failure.reason).filter(Boolean))];
        showToast(
          `Sent, but ${labels} could not be filed in Company Contacts.${reasons.length ? ` ${reasons.join(' ')}` : ''}`,
          'error',
          'Workspaces',
        );
      }
    }

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
        target.app.fields.push(link);
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
        // Merged by time, not appended. The log is newest-first and it is capped from the tail,
        // so pushing a record's history onto the end put the oldest thing it owns exactly where
        // the truncation starts -- carried across on one press and deleted on the next.
        target.workspace.activity = [...target.workspace.activity, ...mine.map((entry) => ({
          ...entry, appId: target.app.id, itemId: arrivedId,
        }))].sort((a, b) => String(b?.ts || '').localeCompare(String(a?.ts || '')));
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
    // Logged BEFORE the arrival, so it reads in the order it happened: the person was filed,
    // then the record landed here. The log is newest-first, so the earlier event goes on first.
    minted.forEach((entry) => wbLogActivity(target.workspace, {
      kind: 'created',
      icon: 'ti-address-book',
      color: '#e0552d',
      appId: target.app.id,
      itemId: arrivedId,
      text: `<b>${h(entry.name)}</b> ${entry.reused ? 'was already in' : 'was added to'} <b>Company Contacts</b>`
        + ` and linked as <b>${h(entry.field)}</b>`,
    }));

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

    // A record that ARRIVES is new to this app, so this app's automations run on it.
    //
    // Nothing fired here at all before: a pushed or moved record landed silently, so an app
    // whose rule is "when an item is created, notify me" was never told about the ones that
    // did not come from its own Add button -- which is most of them in a pipeline. Fired as
    // `created` for a move as well as a copy: the record has a history and it brought it with
    // it, but as far as THIS app is concerned it begins here, and that is what its rules are
    // written against.
    //
    // After the arrival is logged, so an automation that logs its own line reads under it, and
    // before the save, so anything it changes is persisted by the same write.
    wbRunAutomations?.(target.companyId, target.workspace, target.app, target.app.items[0], 'created', null);

    // 4. Persist, and "send it and take it off this app" where that was asked for.
    //
    // Source and target are usually the SAME document. Prospect to Leads inside one workspace is
    // the ordinary case, and there is exactly one company row behind both -- so saving the target
    // and then saving the source was serialising and uploading the WHOLE company document twice
    // for one press. That is what made a button feel slow: not the push, the second write of
    // everything the company owns. It also handed the optimistic-revision check a collision to
    // resolve against a write this same function had just made, which is how a press could come
    // back "could not be saved while others are editing" with nobody else editing.
    //
    // One document also retires the careful ordering below. That ordering exists so a failure to
    // write the target cannot leave the record removed from the source and landed nowhere -- but
    // when both live in one row, the arrival and the removal ARE one write. They land together or
    // not at all, which is the guarantee the ordering was approximating.
    //
    // Across companies there really are two documents, and then the order still matters: target
    // first, source only once the target has taken it.
    const sourceCompany = canonicalCompanyId(sourceCompanyId);
    const oneDocument = sourceCompany === target.companyId;
    const moved = moving && (sourceApp.items || []).some((row) => row.id === item.id);

    const takeOffSource = () => {
      sourceApp.items = sourceApp.items.filter((row) => row.id !== item.id);
      if (!sourceWorkspace) return;
      // No appId/itemId: the record is not here any more, so an entry keyed to it would sit
      // in this app's feed pointing at something nobody here can open. This is a note about
      // the APP -- one of its records left -- and belongs in the workspace's own history.
      wbLogActivity(sourceWorkspace, {
        icon: 'ti-arrow-right', color: '#dc2626',
        text: `<b>${h(title)}</b> moved from <b>${h(sourceApp.name)}</b> to <b>${h(target.app.name)}</b> <span class="wb-act-ref">${h(arrivalRef(arrivedId))}</span>`,
      });
    };

    if (oneDocument) {
      // Both halves of the move, then one write. Removing BEFORE the save also sidesteps a
      // hazard the two-write order had: a save that merges a newer server copy can replace the
      // document objects in state, leaving `sourceApp` a reference into the one that was thrown
      // away -- and a removal written to a discarded object is a record that comes back.
      if (moved) takeOffSource();
      await wbSave(target.companyId);
    } else {
      await wbSave(target.companyId);
      if (moved) {
        takeOffSource();
        // Awaited: this is the write that REMOVES the record from here. Returning before it
        // lands means the next reload can bring it back, so the same record sits in two apps.
        await wbSave(sourceCompany);
      }
    }
    // The record it was open on no longer exists, so the form cannot stay on it.
    if (moved && state.builderModal?.editId === item.id) state.builderModal = null;

    showToast(`${moved ? 'Moved' : 'Sent'} to ${target.app.name}.${grew}`, 'local', 'Workspaces');
    // Reading the record when it left: go with it.
    //
    // A move takes the record out of this app, so somebody sitting on its page was left looking
    // at "This record is gone" -- an accurate message about a record they had just sent
    // themselves, with the copy that DOES exist one app away and nothing pointing at it.
    //
    // Only when the page being read is this record's own. Pressed from a list row, or from the
    // modal, the reader is not on it and taking them somewhere else would be the button doing
    // something it was not asked to.
    const follow = moved && !target.contacts && target.workspace
      && state.route?.params?.get('item_id') === item.id
      && state.route?.params?.get('app_id') === sourceApp.id;
    if (follow) {
      navigate(companyPath('workspaces', {
        workspace: target.workspace.id, app_id: target.app.id, tab: 'items', item_id: arrivedId,
      }, target.companyId));
      return true;
    }
    render();
    return true;
  }

  /**
   * The same press, aimed at Company Contacts.
   *
   * Separate from the app push rather than a branch inside it, because almost nothing it does
   * applies: there is no builder doc to merge fields into, no workspace to log activity on, no
   * item row to unshift, and the directory has its own table and its own storage shapes.
   *
   * What the two DO share is the plan. planPush already decides which of this record's fields
   * the directory has a home for, matching by label, and -- because the directory is marked
   * fixedFields -- reports the rest as left behind instead of proposing to create them. That is
   * the whole of "only the fields that the Company Contacts has": a record carrying Name, Phone,
   * Email and Location sends the first three and drops Location, because there is nowhere for it
   * to go and inventing one would change the shape of every contact in the business.
   *
   * Values cross as WORDS, not as ids. A category on a record stores an option id that means
   * nothing in the directory's own list, so each value is read the way a person reads it and
   * matched against the contact field's options on the other side -- the same path a "change
   * fields on this contact" button already takes, which skips a word the field has never heard
   * of rather than minting it.
   */
  async function pushToContacts(sourceCompanyId, sourceApp, buttonField, item, sourceWorkspace, target) {
    if (!contactIntake) {
      showToast('Company Contacts could not be reached.', 'local', 'Company Contacts');
      return false;
    }
    const plan = planPush(sourceApp, target.app, buttonField);
    if (!plan.carry.length) {
      showToast('Company Contacts has no field in common with this record, so there is nothing to send.', 'local', 'Company Contacts');
      return false;
    }

    // The contact's name. A field labelled Name wins, because somebody who named a field that
    // meant it; otherwise the record's own title, which is what it is called everywhere else.
    const payload = contactPayloadFrom(sourceApp, item, buttonField, target.companyId)
      || { name: String(wbItemTitle(sourceApp, item) || '').trim(), plain: {} };
    if (!payload.name) {
      showToast('That record has nothing that could be used as a contact name.', 'local', 'Company Contacts');
      return false;
    }

    const result = await contactIntake(target.companyId, payload);
    if (!result?.ok) {
      showToast(result?.error || 'Could not add that contact.', 'local', 'Company Contacts');
      return false;
    }

    // Said on the SENDING side, because the directory has no per-contact feed of its own and
    // this app's history is where somebody would look to find out where the record went. The
    // dropped fields are named rather than counted: "Location was left behind" is actionable --
    // add the field to the directory -- and "1 field left behind" is not.
    const left = plan.skipped.map((entry) => entry.field.label);
    if (sourceWorkspace) {
      wbLogActivity(sourceWorkspace, {
        kind: 'updated',
        icon: 'ti-address-book',
        color: '#e0552d',
        appId: sourceApp.id,
        itemId: item.id,
        text: `<b>${h(payload.name)}</b> ${result.reused ? 'was already in' : 'was added to'} <b>Company Contacts</b>`
          + `${left.length ? ` — <b>${h(left.join(', '))}</b> stayed behind, the directory has no field for ${left.length === 1 ? 'it' : 'them'}` : ''}`,
      });
      await wbSave(canonicalCompanyId(sourceCompanyId));
    }

    // "Send it and remove it from this app", pointed at the directory. The person is now filed,
    // so on an intake list the row has done its job. Done AFTER the contact is saved, never
    // before: a failure to file must not lose the record from both places -- the same ordering
    // the app-to-app move uses, and for the same reason.
    const moving = buttonField.config?.action === 'move'
      && (sourceApp.items || []).some((row) => row.id === item.id);
    if (moving) {
      sourceApp.items = sourceApp.items.filter((row) => row.id !== item.id);
      if (sourceWorkspace) {
        // No appId/itemId: the record is not here any more, so an entry keyed to it would point
        // at something nobody in this app can open. It is a note about the APP.
        wbLogActivity(sourceWorkspace, {
          icon: 'ti-arrow-right',
          color: '#dc2626',
          text: `<b>${h(payload.name)}</b> was filed in <b>Company Contacts</b> and removed from <b>${h(sourceApp.name)}</b>`,
        });
      }
      await wbSave(canonicalCompanyId(sourceCompanyId));
      // The form cannot stay open on a record that no longer exists.
      if (state?.builderModal?.editId === item.id) state.builderModal = null;
    }

    const where = moving ? ' and removed from this app' : '';
    showToast(result.reused
      ? `${payload.name} is already in Company Contacts — ${result.landed} field${result.landed === 1 ? '' : 's'} updated${where}.`
      : `${payload.name} added to Company Contacts with ${result.landed} field${result.landed === 1 ? '' : 's'}${where}.`, 'local', 'Company Contacts');
    // Same rule as the app-to-app move: if the page being read IS this record, follow it to the
    // card it just became. Filed without moving, the record is still here and worth staying on.
    if (moving && result.contact?.id
      && state?.route?.params?.get('item_id') === item.id
      && state?.route?.params?.get('app_id') === sourceApp.id) {
      navigate(companyPath('company-contacts', { contact_id: result.contact.id },
        canonicalCompanyId(result.contact.company_id || sourceCompanyId)));
      return true;
    }
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
    // every button on the new-record form is held until the record exists.
    //
    // ON THE FORM, which has to be asked of each BUTTON. It used to be asked of the root, as
    // `root.closest?.(...) !== null` -- and the root is `document` on every workspace render,
    // which has no `closest` at all. `undefined !== null` is true, so the guard passed for
    // everything: opening any add dialog disabled every seatless button on the page, including
    // the ones on the record behind it, each re-labelled "Save this record first". The optional
    // call is what made it silent; without it the missing method would have thrown on day one.
    const addingRecord = !!state.builderModal && !state.builderModal.editId;
    root.querySelectorAll('[data-wb-press]').forEach((button) => {
      // The add form is the open dialog. A record page is a record that already exists, so its
      // buttons are pressable whatever is open in front of them.
      if (addingRecord && !button.dataset.wbPressCtx && button.closest('.wb-modal')) {
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
  // async because the seated branch persists the record, and the caller must be able to wait
  // for that write the same way every other press can.
  async function applySet(companyId, app, buttonField, item, seated) {
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
        await wbSave(companyId);
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
    if (field.config?.action === 'set') return applySet(companyId, app, field, { values: {} }, false);
    // A new-record modal has no durable source record yet. Minting an id here used to let the
    // button create an orphaned "Untitled" arrival in the target even though the source form
    // was never saved. Keep form buttons available on existing records, but require the new
    // record to be saved once before it can be sent anywhere.
    if (!modal?.editId) {
      showToast('Save this record before sending it to another app.', 'local', 'Workspaces');
      return false;
    }
    const values = { ...(modal?.draft?.values || {}) };
    app.fields.forEach((item) => {
      const read = wbReadFieldInput(item);
      if (read !== undefined) values[item.id] = read;
    });
    return pressButton(companyId, app, field, { id: modal.editId, values }, workspace);
  }

  return {
    press, pressButton, pressFromForm, resolveTarget, syncButtons,
  };
}
