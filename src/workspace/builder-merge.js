// Three-way merge for the shared App Builder document.
//
// One company's whole builder doc is a single JSONB row. Saving used to be a blind
// upsert, so two people editing at once meant the second save silently erased the
// first — no error, no warning, and the loser only found out when their app was
// missing. This module is the merge half of the fix; the conditional write that
// detects the collision lives in saveWorkspaceBuilderDoc.
//
// A three-way merge is possible here only because every entity in the document
// carries a stable id: workspaces, apps, fields, items, automations, feed posts and
// poll options. That means "the same thing" can be identified across two divergent
// copies, so edits to different apps — the overwhelmingly common case — combine with
// no user involvement at all.
//
// Where the two sides genuinely changed the SAME field, one has to win. The local
// edit wins and the collision is reported, on the reasoning that the local user is
// present and can see the result, while the remote user has already moved on. That
// is a deliberate bias, not a claim that either value is more correct.
//
// Pure and dependency-free so the rules can be tested directly.

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const isIdList = (value) => Array.isArray(value) && value.every((entry) => isPlainObject(entry) && typeof entry.id === 'string');

// Deep structural equality. Key order is irrelevant — the doc round-trips through
// JSONB, which does not preserve it, so comparing serialised forms would report
// spurious differences on every save.
export function deepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((entry, index) => deepEqual(entry, b[index]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) if (!deepEqual(a[key], b[key])) return false;
    return true;
  }
  return false;
}

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

function mergeIdLists(base, mine, theirs, path, conflicts) {
  const baseById = new Map((base || []).map((entry) => [entry.id, entry]));
  const mineById = new Map(mine.map((entry) => [entry.id, entry]));
  const theirsById = new Map(theirs.map((entry) => [entry.id, entry]));

  const merged = [];
  const emit = (entry) => { if (entry !== undefined) merged.push(entry); };

  // Walk local order first: the local user is looking at this list right now, so
  // their arrangement is the one that should survive a reorder.
  for (const entry of mine) {
    const id = entry.id;
    const baseEntry = baseById.get(id);
    const theirEntry = theirsById.get(id);
    const here = `${path}[${id}]`;

    if (theirEntry) { emit(mergeValue(baseEntry, entry, theirEntry, here, conflicts)); continue; }
    if (!baseEntry) { emit(clone(entry)); continue; }  // I added it; they never saw it.

    // They deleted it. Keeping edited work costs a stale row; dropping it destroys
    // edits the user cannot recover, so an edited entry is resurrected and reported.
    if (deepEqual(baseEntry, entry)) continue;
    conflicts.push({ path: here, kind: 'deleted-remotely-edited-locally' });
    emit(clone(entry));
  }

  // Their additions land after mine, in their own relative order.
  for (const entry of theirs) {
    if (mineById.has(entry.id) || baseById.has(entry.id)) continue;
    emit(clone(entry));
  }

  return merged;
}

function mergeObjects(base, mine, theirs, path, conflicts) {
  const out = {};
  const keys = new Set([...Object.keys(mine), ...Object.keys(theirs)]);
  for (const key of keys) {
    const merged = mergeValue(base?.[key], mine[key], theirs[key], path ? `${path}.${key}` : key, conflicts);
    if (merged !== undefined) out[key] = merged;
  }
  return out;
}

// The core rule, applied at every level: whichever side actually changed a value
// wins. Only when both changed it, differently, is there a real conflict.
function mergeValue(base, mine, theirs, path, conflicts) {
  if (deepEqual(mine, theirs)) return clone(mine);
  if (mine === undefined) return clone(theirs);          // only they have it
  if (theirs === undefined) return clone(mine);          // only I have it
  if (deepEqual(base, mine)) return clone(theirs);       // I did not touch it
  if (deepEqual(base, theirs)) return clone(mine);       // they did not touch it

  // Both sides changed it. Structured values can still merge internally; only
  // leaves and non-id arrays (members, likes, cardFields) are truly either/or.
  if (isIdList(mine) && isIdList(theirs)) {
    return mergeIdLists(isIdList(base) ? base : [], mine, theirs, path, conflicts);
  }
  if (isPlainObject(mine) && isPlainObject(theirs)) {
    return mergeObjects(isPlainObject(base) ? base : {}, mine, theirs, path, conflicts);
  }

  conflicts.push({ path, kind: 'both-edited', mine: clone(mine), theirs: clone(theirs) });
  return clone(mine);
}

/**
 * Merge the local document against the server's newer one.
 *
 * `base` is the document as it stood when this client last synced — the common
 * ancestor. Without it the merge cannot tell an addition from a deletion, so a
 * missing base degrades to a union that keeps everything from both sides.
 *
 * Returns the merged document plus the list of fields that could not be reconciled
 * automatically, so the caller can say what happened rather than resolving silently.
 */
export function mergeBuilderDocs(base, mine, theirs) {
  const conflicts = [];
  const safe = (doc) => (isPlainObject(doc) && Array.isArray(doc.workspaces) ? doc : { workspaces: [] });
  const doc = {
    workspaces: mergeIdLists(safe(base).workspaces, safe(mine).workspaces, safe(theirs).workspaces, 'workspaces', conflicts),
  };
  // The contact card's tile layout rides the same document. Merged rather than dropped: this
  // rebuilds the doc from named keys, so anything not mentioned here is silently lost on every
  // conflict retry -- and a retry is exactly when two people were both arranging the card.
  //
  // Its `tiles` entries are keyed `id`, so mergeValue routes them through mergeIdLists and two
  // people moving DIFFERENT tiles both keep their change, instead of one losing the lot.
  const contactCard = mergeValue(base?.contactCard, mine?.contactCard, theirs?.contactCard, 'contactCard', conflicts);
  if (contactCard !== undefined) doc.contactCard = contactCard;
  return { doc, conflicts };
}

// Human-readable summary for the toast. Names the affected apps rather than dumping
// JSON paths, because "Roof Inspections" is what the user will recognise.
export function describeConflicts(conflicts, doc) {
  if (!conflicts.length) return '';
  const labels = new Set();
  for (const conflict of conflicts) {
    const ids = [...conflict.path.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]);
    labels.add(labelFor(doc, ids) || 'a workspace');
  }
  const list = [...labels].slice(0, 3).join(', ');
  const extra = labels.size > 3 ? ` and ${labels.size - 3} more` : '';
  return `${list}${extra}`;
}

function labelFor(doc, ids) {
  const workspace = (doc?.workspaces || []).find((entry) => entry.id === ids[0]);
  if (!workspace) return '';
  const app = (workspace.apps || []).find((entry) => entry.id === ids[1]);
  return app ? `${workspace.name} / ${app.name || 'an app'}` : workspace.name;
}
