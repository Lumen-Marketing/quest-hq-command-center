// Records inside a record.
//
// An app declares COLLECTIONS — "Dailies", "Cost buckets" — each with its own fields. Every
// record of that app can then hold child records in them: one job, many dailies.
//
// Shaped deliberately as { parentId, collection, values } because that is exactly the shape
// of the wb_items table in .ai/plans/app-builder-records-as-rows.md. When records become
// rows, these migrate across as-is rather than being rewritten or thrown away.
//
// Pure and dependency-free: shapes and arithmetic only, no markup and no DOM.

/** A collection reuses the app's own field types; there is no second kind of field. */
let seq = 0;
const nextId = () => `c${(seq += 1)}${Math.abs(Date.now() % 100000)}`;

export function normalizeCollection(input, makeId = nextId) {
  const raw = input && typeof input === 'object' ? input : {};
  return {
    id: String(raw.id || makeId()),
    name: String(raw.name || '').trim() || 'Items',
    // What ONE of them is called, for the Add button. Falls back to the collection name so a
    // collection is usable the moment it is named.
    recordName: String(raw.recordName || '').trim(),
    fields: Array.isArray(raw.fields) ? raw.fields.map((f) => ({
      id: String(f?.id || makeId()),
      label: String(f?.label || 'Field').trim() || 'Field',
      type: String(f?.type || 'text'),
      config: f?.config && typeof f.config === 'object' ? { ...f.config } : {},
    })) : [],
  };
}

export const collectionsFor = (app) => (Array.isArray(app?.collections) ? app.collections.map((c) => normalizeCollection(c)) : []);
export const findCollection = (app, id) => collectionsFor(app).find((c) => c.id === id) || null;

export function addCollection(collections, name, makeId = nextId) {
  const clean = String(name || '').trim();
  if (!clean) return collections;
  return [...collections, normalizeCollection({ name: clean }, makeId)];
}

export const removeCollection = (collections, id) => collections.filter((c) => c.id !== id);

export function renameCollection(collections, id, name) {
  const clean = String(name || '').trim();
  if (!clean) return collections;
  return collections.map((c) => (c.id === id ? { ...c, name: clean } : c));
}

// ---- the children themselves ----------------------------------------------------------------

function normalizeChild(input, makeId = nextId) {
  const raw = input && typeof input === 'object' ? input : {};
  const createdAt = raw.createdAt || new Date().toISOString().slice(0, 10);
  return {
    id: String(raw.id || makeId()),
    collection: String(raw.collection || ''),
    values: raw.values && typeof raw.values === 'object' ? { ...raw.values } : {},
    createdAt,
    updatedAt: raw.updatedAt || createdAt,
    createdBy: String(raw.createdBy || ''),
  };
}

/**
 * A record's children in one collection, newest first.
 *
 * Stored as one flat list per item rather than a map keyed by collection: a flat list is what
 * a table of rows looks like, so the migration is a copy rather than a reshape, and deleting
 * a collection cannot orphan children into a key nothing reads.
 */
export function childrenOf(item, collectionId) {
  const all = Array.isArray(item?.children) ? item.children : [];
  return all
    .filter((c) => c && c.collection === collectionId)
    .map((c) => normalizeChild(c))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export const childCount = (item, collectionId) => childrenOf(item, collectionId).length;

export function addChild(item, collectionId, values, makeId = nextId) {
  const all = Array.isArray(item?.children) ? item.children : [];
  return [...all, normalizeChild({ collection: collectionId, values }, makeId)];
}

export function updateChild(item, childId, values) {
  const all = Array.isArray(item?.children) ? item.children : [];
  const now = new Date().toISOString().slice(0, 10);
  return all.map((c) => (c?.id === childId
    ? { ...normalizeChild(c), values: { ...values }, updatedAt: now }
    : c));
}

export const removeChild = (item, childId) => (Array.isArray(item?.children) ? item.children : []).filter((c) => c?.id !== childId);

/**
 * Children left behind by a deleted collection.
 *
 * Deleting a collection does NOT delete its children — that would throw away records nobody
 * asked to lose, from a screen about layout. They are reported instead, so the loss is a
 * decision rather than a side effect.
 */
export function orphanedChildren(app, item) {
  const live = new Set(collectionsFor(app).map((c) => c.id));
  return (Array.isArray(item?.children) ? item.children : []).filter((c) => c && !live.has(c.collection));
}
