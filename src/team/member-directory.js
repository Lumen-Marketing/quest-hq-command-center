// Finding one person in a member list.
//
// Member access rendered every user, always, in one order nobody chose. That is fine at six
// people and unusable at sixty: no way to see just the workers, no way to find somebody by
// name, and assigning the same role to eight people meant eight separate saves.
//
// Pure on purpose. Everything here is a function of its arguments, so the filtering, the
// ordering and the "which of these may I actually act on" rule are testable without a DOM,
// a session, or a company.

export const MEMBER_VIEWS = ['list', 'cards', 'tags'];
export const MEMBER_SORTS = ['name', 'role', 'status'];

const clean = (value) => String(value ?? '').trim();
const lower = (value) => clean(value).toLowerCase();

/** The role filter's options, built from who is actually here rather than every role defined. */
export function memberRoleOptions(users = []) {
  const seen = new Map();
  for (const user of users) {
    const label = clean(user.role_label) || clean(user.role);
    if (!label) continue;
    const key = lower(label);
    seen.set(key, { key, label, count: (seen.get(key)?.count || 0) + 1 });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Search, filter and order in one pass.
 *
 * Search covers name, email and role together: people look for "josh", "gmail" and "owner"
 * in the same box and should not have to know which field they are searching.
 */
export function filterSortMembers({ users = [], query = '', role = '', sort = 'name', status = '' } = {}) {
  const needle = lower(query);
  const wantedRole = lower(role);
  const wantedStatus = lower(status);

  const matched = users.filter((user) => {
    if (wantedRole && lower(user.role_label || user.role) !== wantedRole) return false;
    if (wantedStatus && lower(user.status || 'active') !== wantedStatus) return false;
    if (!needle) return true;
    return [user.name, user.email, user.role_label, user.role]
      .some((value) => lower(value).includes(needle));
  });

  const by = {
    // Ties broken by name in every case, so the order never depends on array position and
    // two renders of the same data cannot disagree.
    name: (a, b) => lower(a.name).localeCompare(lower(b.name)),
    role: (a, b) => lower(a.role_label || a.role).localeCompare(lower(b.role_label || b.role))
      || lower(a.name).localeCompare(lower(b.name)),
    status: (a, b) => lower(a.status || 'active').localeCompare(lower(b.status || 'active'))
      || lower(a.name).localeCompare(lower(b.name)),
  };
  return matched.slice().sort(by[sort] || by.name);
}

/**
 * Which of the selected people a bulk role change may actually touch.
 *
 * The main owner is refused for the same reason the single-user form refuses them, and
 * anyone no longer on screen is dropped: a selection made before a filter was applied must
 * not quietly act on people the person can no longer see.
 */
export function assignableSelection({ selected = [], visible = [], isProtected = () => false }) {
  const onScreen = new Map(visible
    .filter((user) => clean(user.profile_id))
    .map((user) => [clean(user.profile_id), user]));
  const eligible = [];
  const blocked = [];
  for (const id of new Set([...selected].map(clean).filter(Boolean))) {
    const user = onScreen.get(id);
    if (!user) continue;
    if (isProtected(user)) blocked.push(user);
    else eligible.push(user);
  }
  return { eligible, blocked };
}
