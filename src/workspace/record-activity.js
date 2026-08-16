// What happened to one record, and who was talking about it.
//
// "In the item card there are two sections, Activity and Comments. Activity shows who created
// the record, who updated it and what fields changed, what checklist is checked, who opened the
// spreadsheet, who edited it, with the time log on it, who commented on it, and the latest
// thread comments. Comments shows pure comments only."
//
// Pure: entries in, entries out. No DOM, no state, no storage -- the card draws what this
// returns, and a test can check that renaming a field reads as a rename without a browser.

/** The kinds of thing that land in a record's history, and how each one is drawn. */
export const ACTIVITY_KINDS = {
  created: { icon: 'ti-plus', color: '#16a34a' },
  updated: { icon: 'ti-pencil', color: '#2563eb' },
  checklist: { icon: 'ti-checkbox', color: '#16a34a' },
  sheet: { icon: 'ti-table', color: '#d97706' },
  comment: { icon: 'ti-message-circle', color: '#7c3aed' },
  automation: { icon: 'ti-bolt', color: '#7c3aed' },
  other: { icon: 'ti-point', color: '#6b7280' },
};

const text = (value) => (value === null || value === undefined ? '' : String(value));

/**
 * What actually changed between two versions of a record.
 *
 * Compared field by field against the app's own definition rather than by diffing two blobs:
 * the answer wanted is "Stage went from To Do to Done", not "one key differs". A field nobody
 * touched is not mentioned, which is the whole point -- an update that says "updated" and
 * nothing else is the thing this replaces.
 */
export function describeChanges(app, before, next, label = (field, value) => text(value)) {
  const was = before || {};
  const now = next || {};
  const out = [];
  (app?.fields || []).forEach((field) => {
    // Automatic fields change on every save by definition, and saying so every time buries the
    // edit somebody actually made.
    if (['created_time', 'updated_time', 'autonumber', 'calculation', 'rollup', 'button'].includes(field.type)) return;
    const from = was[field.id];
    const to = now[field.id];
    if (JSON.stringify(from ?? '') === JSON.stringify(to ?? '')) return;
    out.push({
      fieldId: field.id,
      label: String(field.label || 'Field'),
      type: field.type,
      from: label(field, from),
      to: label(field, to),
    });
  });
  return out;
}

/**
 * A checklist toggle, as a sentence.
 *
 * The values are lists of ticked item ids, so what changed is a set difference. Ticking and
 * unticking in one save is possible and reads as both.
 */
export function describeChecklist(field, before, next) {
  const was = new Set(Array.isArray(before) ? before : []);
  const now = new Set(Array.isArray(next) ? next : []);
  const items = field?.config?.items || [];
  const name = (id) => String(items.find((entry) => (entry.id || entry) === id)?.label || id);
  const ticked = [...now].filter((id) => !was.has(id)).map(name);
  const cleared = [...was].filter((id) => !now.has(id)).map(name);
  return { ticked, cleared };
}

/**
 * A logged checklist value, read back as the steps that are ticked.
 *
 * An activity entry stores a checklist as the flat form wbPlainVal produces:
 *
 *     6/6 (100%): [x] Received Blueprint; [x] Waiting Permit; [ ] Called
 *
 * That form is right for search, sort and CSV export -- it is one cell of text and it says
 * everything. On an activity row it is a wall: the counts, the percentage and every unticked
 * step, when the only thing being reported is what somebody just ticked.
 *
 * So it is parsed back HERE rather than logged differently. Two reasons: the write path feeds
 * three other consumers that want the flat form, and parsing fixes every entry ALREADY in the
 * history rather than only the ones logged from now on.
 *
 * Returns null when the text is not that shape, so the caller falls back to printing it whole --
 * a checklist logged by some older build still reads, it just reads plainly.
 */
export function checklistDone(text) {
  const raw = String(text || '');
  const at = raw.indexOf(':');
  if (at < 0) return null;
  // The prefix has to be the counts, or this is some other string that happens to hold a colon.
  if (!/^\s*\d+\/\d+\s*\(\d+%\)\s*$/.test(raw.slice(0, at))) return null;
  const steps = raw.slice(at + 1).split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const mark = /^\[( |x)\]\s*/i.exec(part);
      if (!mark) return null;
      return { done: mark[1].toLowerCase() === 'x', label: part.slice(mark[0].length).trim() };
    });
  // One unparseable step means the whole thing is a guess -- a label containing "; " would do
  // it -- so the raw text is printed instead of a list that quietly dropped something.
  if (!steps.length || steps.some((step) => step === null)) return null;
  return {
    done: steps.filter((step) => step.done).map((step) => step.label).filter(Boolean),
    total: steps.length,
  };
}

// ---- who was talked about ---------------------------------------------------------------------

/**
 * The names mentioned in a comment.
 *
 * "@" then a name, which may contain spaces -- so the text is matched against the people who
 * actually exist rather than guessed at with a word boundary. Longest name first, or "@Ann"
 * would match inside "@Ann Marie" and the wrong person would be told.
 */
const quote = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const byLongestName = (list) => [...(list || [])]
  .filter((member) => member && member.name)
  .sort((a, b) => b.name.length - a.name.length);

/**
 * One pass, with every name in one alternation, longest first.
 *
 * A pass per member does not work: "@Ann" still matches inside "@Ann Marie" because the word
 * boundary falls at the space, so mentioning Ann Marie would also notify Ann. A single regex
 * consumes each mention exactly once, and an alternation prefers whichever branch matches at
 * that position first -- which is why the longest name has to come first in it.
 */
function mentionScanner(members, prefix) {
  const list = byLongestName(members);
  if (!list.length) return null;
  const names = list.map((member) => quote(member.name)).join('|');
  return { list, re: new RegExp(`${prefix}@(${names})\\b`, 'gi') };
}

const memberNamed = (list, name) => list.find((member) => member.name.toLowerCase() === String(name).toLowerCase());

export function mentionedMembers(body, members) {
  const source = text(body);
  if (!source.includes('@')) return [];
  // Only where the @ starts a word: an email address is not a mention.
  const scan = mentionScanner(members, '(?:^|[^\\w@])');
  if (!scan) return [];
  const found = new Map();
  let hit = scan.re.exec(source);
  while (hit) {
    const member = memberNamed(scan.list, hit[1]);
    if (member && !found.has(member.id)) found.set(member.id, { id: member.id, name: member.name });
    hit = scan.re.exec(source);
  }
  return [...found.values()];
}

/**
 * The comment text with every mention wrapped, for display.
 *
 * The same single pass, for the same reason -- and with nothing standing in for the match while
 * the other names are checked. A placeholder written into the text has to survive being parsed
 * as HTML, and the obvious sentinels do not: a NUL is stripped outright.
 */
export function markMentions(body, members, wrap) {
  const source = text(body);
  const scan = mentionScanner(members, '');
  if (!scan) return source;
  return source.replace(scan.re, (hit, name) => {
    const member = memberNamed(scan.list, name);
    return member ? wrap(hit, member) : hit;
  });
}

// ---- the two tabs -----------------------------------------------------------------------------

export const RECORD_TABS = ['activity', 'comments'];

/**
 * Everything that has happened to this record, oldest first.
 *
 * The workspace log and the record's own comments are two separate stores, and the Activity tab
 * is the one place they are read together -- a history that omits the conversation is not a
 * history of the record.
 *
 * Downwards, like the conversation it contains: the newest line sits directly above the box you
 * type the next one into, which is where you are already looking.
 */
export function recordFeed(workspace, appId, itemId, comments = []) {
  const out = [];
  (workspace?.activity || []).forEach((entry) => {
    if (!entry || entry.itemId !== itemId) return;
    if (appId && entry.appId && entry.appId !== appId) return;
    // The workspace feed carries a line saying somebody commented. Here the comment itself is
    // already in the list, so keeping both would show the same event twice. The text test is for
    // history: entries written before this had a kind was added carry none, and they are still
    // in every workspace that has been used.
    if (entry.kind === 'comment-log') return;
    if (!entry.kind && entry.icon === 'ti-message-circle' && /^Commented on /.test(entry.text || '')) return;
    out.push({
      kind: entry.kind || 'other',
      id: entry.id,
      at: entry.ts,
      html: entry.text || '',
      icon: entry.icon || ACTIVITY_KINDS[entry.kind || 'other'].icon,
      color: entry.color || ACTIVITY_KINDS[entry.kind || 'other'].color,
      actor: entry.actor || '',
      actorId: entry.actorId || '',
      changes: entry.changes || null,
    });
  });
  (comments || []).forEach((entry) => {
    if (!entry) return;
    out.push({
      kind: 'comment',
      id: entry.id,
      at: entry.ts,
      body: entry.text || '',
      icon: ACTIVITY_KINDS.comment.icon,
      color: ACTIVITY_KINDS.comment.color,
      actor: entry.author || '',
      actorId: entry.authorId || '',
      editedAt: entry.editedAt || '',
    });
  });
  return out.sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
}

/** The comments alone, newest last -- the same order, for the same reason. */
export function commentThread(comments = []) {
  return [...(comments || [])]
    .filter(Boolean)
    .sort((a, b) => String(a.ts || '').localeCompare(String(b.ts || '')));
}

/** Which tab to draw, given whatever the state happens to hold. */
export const recordTab = (value) => (RECORD_TABS.includes(value) ? value : 'activity');
