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
// The app's first TEXT field, chosen from the field list rather than by taking the first
// value on the item: values are keyed by field id in whatever order they were written, and
// the first one is very often the contact link itself -- which would label every row with
// the contact id of the person whose card you are already looking at.
const TITLE_FIELD_TYPES = ['text', 'textarea'];

export function itemTitle(app, item) {
  const titleField = (app?.fields || [])
    .filter((field) => TITLE_FIELD_TYPES.includes(field?.type))
    .find((field) => String(item?.values?.[field.id] ?? '').trim());
  if (titleField) return String(item.values[titleField.id]).trim();
  return `${app?.recordName || app?.name || 'Record'} ${String(item?.id || '').slice(-4)}`.trim();
}

/**
 * Every record, anywhere in the company, pointing at this contact.
 *
 * Returns one entry per app that mentions them, carrying the matching items so a caller can
 * link straight through to the record rather than re-scanning.
 */
export function contactUsage(doc, contactId) {
  const wanted = String(contactId || '');
  if (!wanted) return [];
  const uses = [];
  for (const { workspace, app } of appsWithContactFields(doc)) {
    const fields = companyContactFieldsOf(app);
    const items = (app.items || []).filter((item) => fields
      .some((field) => String(item?.values?.[field.id] ?? '') === wanted))
      .map((item) => ({ ...item, title: itemTitle(app, item) }));
    if (!items.length) continue;
    uses.push({
      workspaceId: workspace.id,
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
