// Who a task row names, in the identifier the tasks table actually stores.
//
// A person signs in as a profile (auth uuid), but `tasks.assignee_id` / `creator_id` hold the
// ROSTER id -- `team_members.id`, carried on the profile as `profiles.member_id` (a slug of the
// email local part: "team", "admin", "info"). The foreign key only accepts roster ids, so every
// screen that lists people by profile id has to translate before it writes or counts.
//
// `assignees` is the shape main.js `companyTaskAssignees()` returns:
//   [{ id: <roster id>, profile_id, member_id, name, full_name, email }]
// Pure and dependency-free so the translation is testable with real-looking rows.

const lower = (value) => String(value || '').trim().toLowerCase();

/**
 * The roster id for any way of naming a person: roster id, profile id, name or email.
 * Returns '' when nothing matches -- never the input -- so a caller can tell "resolved"
 * from "unknown" and not write a profile uuid into a column that rejects it.
 */
export function resolveTaskAssigneeId(value, assignees = []) {
  const needle = lower(value);
  if (!needle) return '';
  // Most specific identifier first, across EVERY person, before falling back to looser ones: a
  // roster id that happens to equal somebody else's display name must resolve to its own row.
  for (const field of ['id', 'member_id', 'profile_id', 'email', 'full_name', 'name']) {
    const hit = assignees.find((member) => member?.[field] && lower(member[field]) === needle);
    if (hit?.id) return hit.id;
  }
  return '';
}

/**
 * One entry per roster id, for counting task rows.
 *
 * Several profiles can share a roster id today (three different logins all resolve to "info").
 * Work stored under that id cannot be credited to any one of them, so the group is marked
 * `shared` and named after the id, not after whichever account happens to be listed first.
 */
export function taskRosterPeople(assignees = []) {
  const byId = new Map();
  for (const member of assignees) {
    const id = String(member?.id || '');
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, { id, names: [], profileIds: new Set() });
    const entry = byId.get(id);
    const name = String(member.full_name || member.name || '').trim();
    if (name) entry.names.push(name);
    if (member.profile_id) entry.profileIds.add(String(member.profile_id));
  }
  return [...byId.values()].map(({ id, names, profileIds }) => {
    const shared = profileIds.size > 1;
    return {
      id,
      name: shared ? `Shared login "${id}" (${profileIds.size} accounts)` : (names[0] || id),
      shared,
      accounts: profileIds.size,
    };
  });
}
