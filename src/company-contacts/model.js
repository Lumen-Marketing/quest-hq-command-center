// What a company contact has in flight, read across every workspace app.
//
// Pure: it takes the App Builder document and answers questions about it. No DOM, no state,
// no Supabase -- which is the only reason a cross-workspace rollup is cheap here. The whole
// company's apps, fields and items already live in one `workspace_builder_state` row, so
// this is an in-memory scan rather than a query per workspace.

export const COMPANY_CONTACT_FIELD = 'company_contact';

// What a Company Contact field is allowed to nominate as its balance. A calculation field
// stores its computed result alongside the rest, so it reads the same way as the other two.
export const BALANCE_FIELD_TYPES = ['money', 'number', 'calculation'];

const numberish = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function companyContactFieldsOf(app) {
  return (app?.fields || []).filter((field) => field?.type === COMPANY_CONTACT_FIELD);
}

/** Apps that could ever mention a contact, so callers can skip the rest cheaply. */
export function appsWithContactFields(doc) {
  const found = [];
  for (const workspace of doc?.workspaces || []) {
    for (const app of workspace?.apps || []) {
      // A linked app is a pointer at another workspace's app, not a copy. Counting it would
      // report the same job twice -- once at home and once wherever it was installed.
      if (!app || app.linked) continue;
      if (companyContactFieldsOf(app).length) found.push({ workspace, app });
    }
  }
  return found;
}

// The balance a single app contributes. The field config names which field holds the money,
// chosen when the Company Contact field is added: an app can easily carry Contract Price,
// Collected and Change Order Total, and summing all three produces a number that means
// nothing. Only the first Company Contact field that nominates one is used, so two contact
// fields on one app (Client and GC, say) cannot count the same money twice.
export function appBalanceFor(app, items) {
  const fields = companyContactFieldsOf(app);
  const naming = fields.find((field) => field?.config?.balanceFieldId);
  if (!naming) return 0;
  const target = (app.fields || []).find((field) => field.id === naming.config.balanceFieldId);
  if (!target || !BALANCE_FIELD_TYPES.includes(target.type)) return 0;
  return items.reduce((sum, item) => sum + numberish(item?.values?.[target.id]), 0);
}

// How a record is named on the contact's card.
//
// A text field if the app has one, wherever it sits; otherwise the first field carrying
// anything, in the order the app arranges them.
//
// Text first because it is what people write names into: a Deals app that leads with Contract
// value still wants its records called "58th Pl - Roofing". Falling through to the rest is what
// an Underwriter case needs -- its Case #, Contact, Decision and Priced on are all filled and
// none of them is text, so it used to end up called "Case -ff7", which names nothing.
//
// One field is skipped either way: the link back to the person whose card this is. Every row
// would read as their own name, which is the one thing the reader already knows.
const TITLE_TEXT_TYPES = ['text', 'textarea'];
const TITLE_FALLBACK_TYPES = ['text', 'textarea', 'email', 'phone', 'url', 'location', 'number', 'money', 'date'];

// Used when no resolver is supplied. Only the types whose stored value IS its display value --
// a status stores an option id and a user stores a member id, and printing either is a key.
function plainValue(field, item) {
  if (!TITLE_FALLBACK_TYPES.includes(field?.type)) return '';
  const raw = item?.values?.[field.id];
  if (raw === undefined || raw === null || typeof raw === 'object') return '';
  return String(raw).trim();
}

/**
 * @param {object} options.nameValue  How to render one field's value, when the caller has the
 *   app's own formatter to hand. Without it only self-describing fields are considered, so the
 *   model stays pure and testable on its own.
 * @param {string} options.contactId  The contact whose card this is, so the link to them can
 *   be skipped.
 */
export function itemTitle(app, item, { nameValue = null, contactId = '' } = {}) {
  const usable = (app?.fields || []).filter((field) => field
    && !(field.type === COMPANY_CONTACT_FIELD
      && String(item?.values?.[field.id] ?? '') === String(contactId)));
  const read = (field) => String((nameValue ? nameValue(app, field, item) : plainValue(field, item)) ?? '').trim();

  // A person first. On a card that lists other people's records -- a job whose Site contact is
  // somebody else, a lead someone Referred -- the name of that person is what tells one row from
  // another, where "Re-roof" repeated eight times does not. The field pointing back at the
  // contact whose card this is was already dropped above, so this can only name somebody else.
  for (const field of usable) {
    if (field.type !== COMPANY_CONTACT_FIELD) continue;
    const value = read(field);
    if (value) return value;
  }
  for (const field of usable) {
    if (!TITLE_TEXT_TYPES.includes(field.type)) continue;
    const value = read(field);
    if (value) return value;
  }
  for (const field of usable) {
    const value = read(field);
    if (value) return value;
  }
  // Nothing filled in at all. The id tail is the only thing that tells two empty records apart.
  // The leading separator is trimmed off it -- "Case -ff7" reads as a typo, not a name.
  const tail = String(item?.id || '').slice(-4).replace(/^[^A-Za-z0-9]+/, '');
  return `${app?.recordName || app?.name || 'Record'} ${tail}`.trim();
}

// What a record says about itself, read off whichever fields the app happens to have.
//
// A contact's card is a WINDOW onto work owned elsewhere, so the point of a row is to answer
// "where has this got to?" without opening it. Nothing here is required: an app with no status
// field simply contributes no status, rather than the row rendering an empty slot.

// Stage first, then category. A status field IS the stage in an App Builder app; a category is
// the next best thing when somebody modelled their stages as one.
const STAGE_FIELD_TYPES = ['status', 'category'];

function optionOf(field, value) {
  const option = (field?.config?.options || []).find((item) => item.id === value);
  if (!option) return null;
  return { label: String(option.label || ''), color: String(option.color || '') };
}

/** The record's current stage, as the label and colour the app gave it. */
export function itemStage(app, item) {
  for (const type of STAGE_FIELD_TYPES) {
    for (const field of (app?.fields || []).filter((f) => f?.type === type)) {
      const stage = optionOf(field, item?.values?.[field.id]);
      if (stage && stage.label) return stage;
    }
  }
  return null;
}

/** Minutes, the unit a duration field stores. Null when the app has no duration field. */
export function itemDuration(app, item) {
  const field = (app?.fields || []).find((f) => f?.type === 'duration');
  if (!field) return null;
  const raw = item?.values?.[field.id];
  if (raw === undefined || raw === null || raw === '') return null;
  const minutes = Number(raw);
  return Number.isFinite(minutes) ? minutes : null;
}

// Three kinds of date an app can carry: one somebody types (a start date, an inspection date),
// and the two the builder stamps for itself. All three belong on the row when the app has them
// -- "if the start date and the latest updated date fields are available on the workspace app
// display it here also".
//
// Created and modified read as a moment ago rather than a calendar date, which is how a stamp
// is useful: "edited 8m ago" answers a question "edited Aug 14" does not.
const DATE_FIELD_TYPES = ['date', 'created_time', 'updated_time'];
const STAMP_FIELD_TYPES = ['created_time', 'updated_time'];

// Two TYPED dates at most -- a row is a summary, and an app with six date fields is a record
// to open rather than a line to read. Taken in field order, so the app's own arrangement
// decides which two.
//
// The cap does not apply to Created and Last modified. They are two specific facts an app
// asked for by name, and a shared limit meant a third typed date could push Last modified off
// the row -- losing the one thing that was requested.
const MAX_TYPED_DATES = 2;

// A created/modified field stores nothing -- it reports the stamp the builder keeps on every
// record, which is why it can be shown even for a record nobody has filled in.
function dateValue(field, item) {
  if (field.type === 'created_time') return String(item?.createdAt || '');
  if (field.type === 'updated_time') return String(item?.updatedAt || item?.createdAt || '');
  return String(item?.values?.[field.id] ?? '').trim();
}

/** The date fields that have something to say, labelled the way the app labels them. */
export function itemDates(app, item) {
  const fields = (app?.fields || []).filter((f) => DATE_FIELD_TYPES.includes(f?.type));
  const dates = [];
  let typed = 0;
  for (const field of fields) {
    const stamp = STAMP_FIELD_TYPES.includes(field.type);
    if (!stamp && typed >= MAX_TYPED_DATES) continue;
    const value = dateValue(field, item);
    if (!value) continue;
    if (!stamp) typed += 1;
    dates.push({
      label: String(field.label || 'Date'),
      value,
      // The renderer needs to know which are stamps, because they read as "8m ago" and a
      // typed date reads as "Aug 20, 2026".
      relative: stamp,
    });
  }
  return dates;
}

/** Everything a row shows, gathered once so the renderer does no digging. */
export function itemFacts(app, item) {
  const dates = itemDates(app, item);
  // An app with its own Last modified field has already said this, under whatever name it gave
  // the field. Adding a second "Edited …" beside it is the same fact twice.
  const saysItself = dates.some((date) => date.relative && /modif|updat|edit/i.test(date.label));
  return {
    stage: itemStage(app, item),
    duration: itemDuration(app, item),
    dates,
    // The App Builder stamps both on every record, so "last edited" is always answerable even
    // when the app carries no date field at all.
    updatedAt: saysItself ? '' : String(item?.updatedAt || item?.createdAt || ''),
  };
}

// Newest first, the way the workspace lists them.
//
// The Items table's sort is an in-memory view preference that is not persisted, so there is no
// "current sort" to read across from -- but its DEFAULT is created_desc, which is what somebody
// is looking at when they compare the two screens. This mirrors wbApplyPresetSort's created_desc
// exactly, including the fallback: a record saved before createdAt existed still orders by
// whatever timestamp it does have, rather than sinking to the bottom as epoch zero.
function createdAtMs(item) {
  return new Date(item?.createdAt || item?.updatedAt || 0).getTime();
}

export function sortNewestFirst(items) {
  return [...items].sort((a, b) => createdAtMs(b) - createdAtMs(a));
}

/**
 * Every record, anywhere in the company, pointing at this contact.
 *
 * Returns one entry per app that mentions them, carrying the matching items so a caller can
 * link straight through to the record rather than re-scanning.
 */
export function contactUsage(doc, contactId, { nameValue = null } = {}) {
  const wanted = String(contactId || '');
  if (!wanted) return [];
  const uses = [];
  for (const { workspace, app } of appsWithContactFields(doc)) {
    const fields = companyContactFieldsOf(app);
    const matched = (app.items || []).filter((item) => fields
      .some((field) => String(item?.values?.[field.id] ?? '') === wanted))
      .map((item) => ({
        ...item,
        title: itemTitle(app, item, { nameValue, contactId: wanted }),
        facts: itemFacts(app, item),
      }));
    const items = sortNewestFirst(matched);
    if (!items.length) continue;
    uses.push({
      workspaceId: workspace.id,
      // The builder keys a workspace as `ws-<operational id>`; the router wants the bare id.
      // A builder-only workspace has no operational counterpart and so no route -- it gets an
      // empty string, and the caller renders plain text instead of a link to nowhere.
      workspaceRouteId: /^ws-/.test(String(workspace.id || '')) ? String(workspace.id).slice(3) : '',
      workspaceName: workspace.name,
      appId: app.id,
      appName: app.name,
      recordName: app.recordName || '',
      count: items.length,
      balance: appBalanceFor(app, items),
      items,
    });
  }
  return uses;
}

// "3 Jobs" -- the app's own record name where it has one, because "3 Job Trackers" is not
// what anybody calls them. Already-plural names are left alone rather than made "Jobss".
function countLabel(use) {
  const noun = (use.recordName || use.appName || 'record').trim();
  const plural = use.count === 1 || /s$/i.test(noun) ? noun : `${noun}s`;
  return `${use.count} ${plural}`;
}

/**
 * The directory's "Active with us" cell.
 *
 * The app is what carries meaning, not the workspace -- until two workspaces both have a
 * "Jobs" app, at which point the app name alone is ambiguous and the workspace is added to
 * tell them apart.
 */
export function usageSummary(uses) {
  if (!uses.length) return '';
  const nameCounts = new Map();
  uses.forEach((use) => {
    const key = (use.recordName || use.appName || '').toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  });
  return uses.map((use) => {
    const key = (use.recordName || use.appName || '').toLowerCase();
    const label = countLabel(use);
    return nameCounts.get(key) > 1 ? `${label} (${use.workspaceName})` : label;
  }).join(' · ');
}

export function usageBalance(uses) {
  return uses.reduce((sum, use) => sum + use.balance, 0);
}

/** Every contact id mentioned anywhere, so the directory can mark the unused ones. */
export function referencedContactIds(doc) {
  const ids = new Set();
  for (const { app } of appsWithContactFields(doc)) {
    const fields = companyContactFieldsOf(app);
    for (const item of app.items || []) {
      for (const field of fields) {
        const value = String(item?.values?.[field.id] ?? '');
        if (value) ids.add(value);
      }
    }
  }
  return ids;
}
