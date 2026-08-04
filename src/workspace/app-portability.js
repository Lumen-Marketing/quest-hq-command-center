// What travels when an app is downloaded, shared to the market, or installed.
//
// An app used to be fields + records + automations, and the three transfer paths only ever
// carried those. It now also has a card layout, sub-item lists, a record layout, a dashboard
// and saved views -- and every one of them refers to fields BY ID.
//
// Installing remints every field id so two copies of an app cannot collide. So these
// structures cannot be copied across verbatim: a record layout carried over unchanged points
// at fields that no longer exist, and renders as an empty card on a brand new install. This
// module is the remapper.
//
// Pure: no DOM, no state, no ids of its own except through the makeId it is handed.

/** Everything portable that is not fields, items or automations. */
export const PORTABLE_KEYS = ['recordName', 'cardFields', 'collections', 'recordLayout', 'dashboard', 'views'];

const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
const isArray = Array.isArray;

/**
 * The portable extras of an app, for a download bundle.
 *
 * Only keys that are actually set are emitted, so an app that has never been arranged
 * produces the same bundle it always did rather than a pile of nulls.
 */
export function portableExtras(app) {
  const out = {};
  if (!app || typeof app !== 'object') return out;
  if (String(app.recordName || '').trim()) out.recordName = String(app.recordName).trim();
  if (isArray(app.cardFields) && app.cardFields.length) out.cardFields = clone(app.cardFields);
  if (isArray(app.collections) && app.collections.length) out.collections = clone(app.collections);
  if (isArray(app.recordLayout) && app.recordLayout.length) out.recordLayout = clone(app.recordLayout);
  if (isArray(app.dashboard) && app.dashboard.length) out.dashboard = clone(app.dashboard);
  if (isArray(app.views) && app.views.length) out.views = clone(app.views);
  return out;
}

/**
 * Config keys that hold a FIELD id, across every card and block type.
 *
 * Kept as one list rather than a branch per widget type: a new widget that reuses one of
 * these names is remapped without anybody remembering to come back here, and a widget that
 * invents a new name shows up in the test that walks the real modules.
 */
export const FIELD_ID_KEYS = ['fieldId', 'field', 'dateField', 'metricField', 'groupBy', 'splitBy'];
export const FIELD_ID_LIST_KEYS = ['fieldIds', 'fields'];

/**
 * Remap one config object's field references.
 *
 * A reference that does not resolve is DROPPED rather than carried through. A dangling id
 * renders as a blank card with no way to tell why; an absent one falls back to the card's
 * own default, which is at least a working screen.
 */
export function remapConfig(config, fieldIdMap) {
  const next = config && typeof config === 'object' ? { ...config } : {};
  FIELD_ID_KEYS.forEach((key) => {
    if (typeof next[key] !== 'string' || !next[key]) return;
    next[key] = fieldIdMap[next[key]] || '';
  });
  FIELD_ID_LIST_KEYS.forEach((key) => {
    if (!isArray(next[key])) return;
    // null means "every field", which stays true after a remap. An empty array does not:
    // it would mean "no fields", so a list whose every id was dropped becomes null.
    const mapped = next[key].map((id) => fieldIdMap[id]).filter(Boolean);
    next[key] = mapped.length ? mapped : null;
  });
  return next;
}

/**
 * Rebuild the portable extras against a freshly minted app.
 *
 * `fieldIdMap` maps the source app's field ids to the new ones. Sub-item collections get
 * their own fresh ids too -- both the list and every field inside it -- because a sub-item
 * field is as much a field as a top-level one and two installs must not share ids.
 */
export function remapExtras(src, fieldIdMap, makeId) {
  return remapApp(src, fieldIdMap, makeId).extras;
}

/**
 * The same, plus the id maps the caller needs for the records.
 *
 * A sub-item record carries its collection's id and stores values against that collection's
 * FIELD ids -- both of which are reminted here. Restoring a downloaded app without these maps
 * gives you the sub-item lists but no sub-items in them, which looks like data loss and is.
 */
export function remapApp(src, fieldIdMap, makeId) {
  const out = {};
  const collectionIdMap = {};
  const childFieldIdMap = {};
  if (!src || typeof src !== 'object') return { extras: out, collectionIdMap, childFieldIdMap };

  if (String(src.recordName || '').trim()) out.recordName = String(src.recordName).trim();

  if (isArray(src.cardFields) && src.cardFields.length) {
    const mapped = src.cardFields.map((id) => fieldIdMap[id]).filter(Boolean);
    // Every card field dropped means the layout said "show these" and none survived. Leaving
    // it off is right: the card falls back to showing the visible fields.
    if (mapped.length) out.cardFields = mapped;
  }

  // Collections first: the record layout points at them by id, so their new ids have to
  // exist before it is remapped.
  if (isArray(src.collections) && src.collections.length) {
    out.collections = src.collections.filter(Boolean).map((collection) => {
      const id = makeId();
      collectionIdMap[collection.id] = id;
      return {
        id,
        name: String(collection.name || 'Items'),
        recordName: String(collection.recordName || ''),
        fields: (isArray(collection.fields) ? collection.fields : []).filter(Boolean).map((f) => {
          const fieldId = makeId();
          childFieldIdMap[f.id] = fieldId;
          return { ...clone(f), id: fieldId };
        }),
      };
    });
  }

  if (isArray(src.recordLayout) && src.recordLayout.length) {
    out.recordLayout = src.recordLayout.filter(Boolean).map((block) => {
      const config = remapConfig(block.config, fieldIdMap);
      if (typeof config.collectionId === 'string' && config.collectionId) {
        config.collectionId = collectionIdMap[config.collectionId] || '';
      }
      return { ...clone(block), id: makeId(), config };
    })
      // A sub-items card whose list did not come across has nothing to show and no way to
      // say so. Dropping it beats installing a permanently empty card.
      .filter((block) => !(block.type === 'collection' && !block.config.collectionId));
  }

  if (isArray(src.dashboard) && src.dashboard.length) {
    out.dashboard = src.dashboard.filter(Boolean)
      .map((widget) => ({ ...clone(widget), id: makeId(), config: remapConfig(widget.config, fieldIdMap) }));
  }

  if (isArray(src.views) && src.views.length) {
    out.views = src.views.filter(Boolean).map((view) => ({
      ...clone(view),
      id: makeId(),
      // A view splits by a field. If that field did not survive, the view still works -- it
      // just becomes the plain list, which is what an empty fieldId already means.
      fieldId: view.fieldId ? (fieldIdMap[view.fieldId] || '') : '',
    }))
      // Private views live in one browser's storage, not on the app, so anything marked
      // private here came from a hand-edited bundle. Installing it as a team view would
      // publish somebody's private list to everyone in the target company.
      .filter((view) => view.scope !== 'private');
  }

  return { extras: out, collectionIdMap, childFieldIdMap };
}

/**
 * Sub-item records, pointed at the new collections and their new fields.
 *
 * A child whose collection did not survive is dropped: it would be a record belonging to a
 * list that does not exist, reachable from nothing and countable by nothing.
 */
export function remapChildren(children, collectionIdMap, childFieldIdMap, makeId) {
  if (!isArray(children)) return [];
  return children.filter(Boolean).reduce((out, child) => {
    const collection = collectionIdMap[child.collection];
    if (!collection) return out;
    const values = {};
    Object.keys(child.values || {}).forEach((oldId) => {
      const next = childFieldIdMap[oldId];
      if (next) values[next] = child.values[oldId];
    });
    out.push({
      id: makeId(),
      collection,
      values,
      createdAt: child.createdAt || '',
      updatedAt: child.updatedAt || child.createdAt || '',
    });
    return out;
  }, []);
}

/** What a bundle says it contains, for the toast and the library card. */
export function describeExtras(extras) {
  const parts = [];
  if (extras.collections?.length) parts.push(`${extras.collections.length} sub-item list${extras.collections.length === 1 ? '' : 's'}`);
  if (extras.views?.length) parts.push(`${extras.views.length} view${extras.views.length === 1 ? '' : 's'}`);
  if (extras.dashboard?.length) parts.push('a dashboard');
  if (extras.recordLayout?.length) parts.push('a record layout');
  return parts;
}
