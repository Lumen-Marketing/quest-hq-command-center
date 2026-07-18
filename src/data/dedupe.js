// Pure duplicate-contact detection. No DOM, no app state -- takes plain contacts
// and returns groups of likely duplicates, so it's unit-testable and reusable.
//
// Two contacts are linked when they share a strong identifier -- the same email,
// the same phone (by digits), or the same normalized name. Links are transitive:
// A~B and B~C put all three in one group (union-find). Email and phone are high
// confidence; a name-only match is weaker and flagged as such so the UI can warn
// before merging.

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Compare phones by their last 10 digits, so "(602) 555-0198", "602-555-0198",
// and "+1 6025550198" all match. Fewer than 10 digits is too weak to match on.
export function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
}

// Lowercase, strip punctuation, collapse whitespace. Single-token names (just a
// first name) are too weak to match on, so they return '' and never link.
export function normalizeName(name) {
  const clean = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean || clean.length < 3) return '';
  if (clean.split(' ').length < 2) return ''; // one word (first name only) is not enough
  return clean;
}

class UnionFind {
  constructor() { this.parent = new Map(); }
  find(x) {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root);
    let cur = x;
    while (this.parent.get(cur) !== root) { const next = this.parent.get(cur); this.parent.set(cur, root); cur = next; }
    return root;
  }
  union(a, b) { this.parent.set(this.find(a), this.find(b)); }
}

/**
 * Group likely-duplicate contacts.
 * @param {Array<{id,name,email,phone}>} contacts
 * @returns {Array<{ ids: string[], contacts: object[], reasons: string[], strong: boolean }>}
 *   One entry per group of 2+; reasons ∈ 'email'|'phone'|'name'; strong = matched
 *   on email or phone (name-only groups are strong=false).
 */
export function findDuplicateGroups(contacts) {
  const list = (Array.isArray(contacts) ? contacts : []).filter((c) => c && c.id != null);
  const uf = new UnionFind();
  const byEmail = new Map();
  const byPhone = new Map();
  const byName = new Map();
  // Track which signal linked each contact so we can report reasons per group.
  const reasonOf = new Map(); // id -> Set(reason)

  const link = (map, key, contact, reason) => {
    if (!key) return;
    if (map.has(key)) {
      uf.union(map.get(key), contact.id);
      addReason(reasonOf, map.get(key), reason);
      addReason(reasonOf, contact.id, reason);
    } else {
      map.set(key, contact.id);
    }
  };

  for (const c of list) {
    uf.find(c.id); // ensure present
    link(byEmail, normalizeEmail(c.email), c, 'email');
    link(byPhone, normalizePhone(c.phone), c, 'phone');
    link(byName, normalizeName(c.name), c, 'name');
  }

  const groups = new Map(); // root -> [contacts]
  for (const c of list) {
    const root = uf.find(c.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(c);
  }

  const out = [];
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const reasons = new Set();
    for (const m of members) for (const r of reasonOf.get(m.id) || []) reasons.add(r);
    const reasonList = [...reasons];
    out.push({
      ids: members.map((m) => m.id),
      contacts: members,
      reasons: reasonList,
      strong: reasonList.includes('email') || reasonList.includes('phone'),
    });
  }
  // Strong groups first, then larger groups.
  out.sort((a, b) => (b.strong - a.strong) || (b.contacts.length - a.contacts.length));
  return out;
}

function addReason(map, id, reason) {
  if (!map.has(id)) map.set(id, new Set());
  map.get(id).add(reason);
}

/**
 * Split incoming rows (e.g. from a CSV) into ones to import versus ones already
 * present, matching existing contacts by email or phone. Also dedupes within the
 * incoming batch, so a file that lists the same person twice imports them once.
 * Keeps import from re-creating the duplicates the finder would then clean up.
 * @returns {{ toImport: object[], duplicates: object[] }}
 */
export function partitionImport(incoming, existing) {
  const emails = new Set();
  const phones = new Set();
  for (const c of Array.isArray(existing) ? existing : []) {
    const e = normalizeEmail(c && c.email); if (e) emails.add(e);
    const p = normalizePhone(c && c.phone); if (p) phones.add(p);
  }
  const toImport = [];
  const duplicates = [];
  for (const row of Array.isArray(incoming) ? incoming : []) {
    const e = normalizeEmail(row && row.email);
    const p = normalizePhone(row && row.phone);
    if ((e && emails.has(e)) || (p && phones.has(p))) {
      duplicates.push(row);
    } else {
      toImport.push(row);
      if (e) emails.add(e); // guard against repeats later in the same file
      if (p) phones.add(p);
    }
  }
  return { toImport, duplicates };
}

/**
 * Merge duplicate records into a survivor: keep the survivor's values, fill only
 * its BLANK fields from the others (first non-empty wins). Pure -- returns the
 * merged field object; the caller persists it and reassigns foreign links.
 */
export function mergeContactFields(survivor, others, fields) {
  const merged = { ...survivor };
  const keys = fields || Object.keys(survivor);
  for (const key of keys) {
    if (key === 'id') continue;
    const cur = merged[key];
    if (cur !== undefined && cur !== null && String(cur).trim() !== '') continue;
    for (const other of others) {
      const val = other ? other[key] : undefined;
      if (val !== undefined && val !== null && String(val).trim() !== '') { merged[key] = val; break; }
    }
  }
  return merged;
}
