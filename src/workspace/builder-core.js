// Link resolution for the App Builder document.
//
// An app can be installed into a second workspace of the same company. What is stored
// there is a POINTER, never a copy:
//
//     { id, linked: true, linkedFromWs, installedAt }
//
// Both workspaces therefore read the one app object, so its fields and its records are
// genuinely shared — an edit made from either side is the same edit, not a sync that
// could drift. A copy would diverge the moment either workspace was touched.
//
// Extracted from main.js so it can be imported and tested directly. It previously lived
// only inside the monolith, which meant its tests had to reimplement the resolver — and
// a test that reimplements the thing it is testing passes just as happily when the real
// implementation breaks.
//
// Pure and dependency-free: every function takes the document it should read.

/**
 * Resolve one entry in a workspace's `apps` list to the app it refers to.
 *
 * Returns `{ app, linked, sourceWsId }`. `app` is null when the entry is a link whose
 * source has since been deleted — callers must treat that as "not present" rather than
 * assuming a link always resolves.
 */
export function resolveAppEntry(doc, entry) {
  if (!entry) return { app: null, linked: false, sourceWsId: null };
  if (!entry.linked) return { app: entry, linked: false, sourceWsId: null };
  const src = doc ? doc.workspaces.find((w) => w.id === entry.linkedFromWs) : null;
  // `&& !a.linked` guards against a link pointing at another link: only a real app is a
  // valid source, so a chain cannot form and resolution always terminates.
  const app = src ? src.apps.find((a) => a.id === entry.id && !a.linked) || null : null;
  return { app, linked: true, sourceWsId: entry.linkedFromWs };
}

/**
 * Every app a workspace should display: its own, plus the ones installed from elsewhere,
 * each tagged so the interface can mark a linked app. Entries whose source has been
 * deleted are dropped rather than rendered as blanks.
 */
export function workspaceApps(doc, ws) {
  if (!ws) return [];
  return (ws.apps || []).map((entry) => {
    const r = resolveAppEntry(doc, entry);
    return r.app ? { app: r.app, linked: r.linked, sourceWsId: r.sourceWsId } : null;
  }).filter(Boolean);
}

/**
 * The app a tile points at. Tiles store only an appId, and that id is identical for a
 * linked entry and its source, so matching on "not linked" cannot tell "a different app"
 * apart from "reach this one through the link" — the entry has to be resolved.
 */
export function tileTargetApp(doc, workspace, appId) {
  if (!appId || !workspace) return null;
  const entry = (workspace.apps || []).find((x) => x.id === appId);
  if (!entry) return null;
  return resolveAppEntry(doc, entry).app;
}

/**
 * Whether a workspace already holds this app, by id — true whether it owns the app or
 * has it linked. Used to stop a second install creating two entries with the same id,
 * which the resolver could not distinguish.
 */
export function workspaceHasApp(workspace, appId) {
  return !!(workspace && (workspace.apps || []).some((a) => a.id === appId));
}
