// Link resolution for the App Builder document.
//
// An app can be installed into another workspace. What is stored there is a POINTER,
// never a copy:
//
//     { id, linked: true, linkedFromWs, linkedFromCompany?, installedAt }
//
// Both places therefore read the one app object, so its fields and its records are
// genuinely shared — an edit from either side is the same edit, not a sync that could
// drift. A copy would diverge the moment either side was touched.
//
// `linkedFromCompany` is absent for a link inside one company, which is what every link
// created before cross-company installs looked like. Absent means "this document", so old
// entries keep resolving unchanged.
//
// Extracted from main.js so it can be imported and tested directly. It previously lived
// only inside the monolith, which meant its tests had to reimplement the resolver — and a
// test that reimplements the thing it is testing passes just as happily when the real
// implementation breaks.
//
// Pure and dependency-free: every function is handed the documents it should read.

/**
 * Resolve one entry in a workspace's `apps` list to the app it refers to.
 *
 * `getDoc(companyId)` supplies another company's document, and is only consulted for a
 * cross-company link. Returns `{ app, linked, sourceWsId, sourceCompanyId }`; `app` is
 * null when the link cannot be followed — the source was deleted, or the reader no longer
 * has access to the company that owns it. Callers must treat null as "not present"
 * rather than assuming a link always resolves.
 */
export function resolveAppEntry(doc, entry, getDoc) {
  const missing = { app: null, linked: false, sourceWsId: null, sourceCompanyId: null };
  if (!entry) return missing;
  if (!entry.linked) return { app: entry, linked: false, sourceWsId: null, sourceCompanyId: null };

  const sourceCompanyId = entry.linkedFromCompany || null;
  // Losing access to the other company is a normal outcome, not an error: the link simply
  // stops resolving, and the app disappears from this workspace's list.
  const sourceDoc = sourceCompanyId
    ? (typeof getDoc === 'function' ? getDoc(sourceCompanyId) : null)
    : doc;

  const src = sourceDoc && Array.isArray(sourceDoc.workspaces)
    ? sourceDoc.workspaces.find((w) => w.id === entry.linkedFromWs)
    : null;
  // `&& !a.linked` guards against a link pointing at another link: only a real app is a
  // valid source, so a chain cannot form and resolution always terminates.
  const app = src ? src.apps.find((a) => a.id === entry.id && !a.linked) || null : null;
  return { app, linked: true, sourceWsId: entry.linkedFromWs, sourceCompanyId };
}

/**
 * Every app a workspace should display: its own, plus the ones installed from elsewhere,
 * each tagged so the interface can mark a linked app and say where it came from. Entries
 * whose source cannot be reached are dropped rather than rendered as blanks.
 */
export function workspaceApps(doc, ws, getDoc) {
  if (!ws) return [];
  return (ws.apps || []).map((entry) => {
    const r = resolveAppEntry(doc, entry, getDoc);
    return r.app
      ? { app: r.app, linked: r.linked, sourceWsId: r.sourceWsId, sourceCompanyId: r.sourceCompanyId }
      : null;
  }).filter(Boolean);
}

/**
 * The app a tile points at. Tiles store only an appId, and that id is identical for a
 * linked entry and its source, so matching on "not linked" cannot tell "a different app"
 * apart from "reach this one through the link" — the entry has to be resolved.
 */
export function tileTargetApp(doc, workspace, appId, getDoc) {
  if (!appId || !workspace) return null;
  const entry = (workspace.apps || []).find((x) => x.id === appId);
  if (!entry) return null;
  return resolveAppEntry(doc, entry, getDoc).app;
}

/**
 * Whether a workspace already holds this app, by id — true whether it owns the app or has
 * it linked. Stops a second install creating two entries with the same id, which the
 * resolver could not tell apart.
 */
export function workspaceHasApp(workspace, appId) {
  return !!(workspace && (workspace.apps || []).some((a) => a.id === appId));
}

/**
 * Apps that may be offered as a destination across one company.
 *
 * Builder workspaces live inside a JSON document and can outlive the operational workspace
 * that created them. Those orphan entries remain useful for recovery, but they must not show
 * up in a live target picker. When operational-workspace data exists, only active workspaces
 * the current user may enter are included. A legacy company-wide builder workspace follows
 * the allowed default workspace until it is adopted into its id-based entry.
 */
export function targetableCompanyApps(
  doc,
  companyId,
  operationalWorkspaces = [],
  allowedOperationalWorkspaces = [],
) {
  const cid = String(companyId || '');
  const companyOperational = (operationalWorkspaces || []).filter(
    (workspace) => String(workspace?.company_id || '') === cid,
  );
  let allowedBuilderIds = null;
  if (companyOperational.length) {
    const allowed = (allowedOperationalWorkspaces || []).filter((workspace) => (
      String(workspace?.company_id || '') === cid
      && String(workspace?.status || 'active').toLowerCase() === 'active'
    ));
    allowedBuilderIds = new Set(allowed.map((workspace) => `ws-${workspace.id}`));
    if (allowed.some((workspace) => workspace.is_default)) allowedBuilderIds.add(`ws-${cid}`);
  }

  const out = [];
  const seen = new Set();
  for (const workspace of (doc?.workspaces || [])) {
    if (allowedBuilderIds && !allowedBuilderIds.has(String(workspace?.id || ''))) continue;
    for (const app of (workspace?.apps || [])) {
      // A link is a second doorway to its source app, not another destination.
      if (!app || app.linked || seen.has(app.id)) continue;
      seen.add(app.id);
      out.push({ workspace, app });
    }
  }
  return out;
}

/**
 * Every company whose document may have been changed by editing inside `companyId`.
 *
 * This is the part that makes a cross-company link safe. A linked app's data lives in the
 * document of the company that OWNS it, so an edit made from the borrowing company
 * mutates the owner's document — and saving only the current company's row would drop
 * that edit silently, with the change visible on screen until the next reload.
 *
 * Returns the current company first, then each distinct company it links out to.
 */
export function companiesToSave(companyId, doc) {
  const out = [companyId];
  const seen = new Set(out);
  for (const ws of (doc && doc.workspaces) || []) {
    for (const entry of ws.apps || []) {
      if (!entry || !entry.linked || !entry.linkedFromCompany) continue;
      if (seen.has(entry.linkedFromCompany)) continue;
      seen.add(entry.linkedFromCompany);
      out.push(entry.linkedFromCompany);
    }
  }
  return out;
}
