// Contact labels: the pure half.
//
// Replaces two lossy habits the bulk-contact actions had:
//
//   "Add to campaign" wrote the campaign name over the contact's `source`, destroying the
//   record of where that contact actually came from — the one field that answers "is this
//   channel worth the money". Membership is not provenance and must not overwrite it.
//
//   "Assign label" appended `Label: X` to the notes field. A label in prose cannot be
//   renamed, removed, counted or filtered on, and two people writing "VIP" and "vip"
//   produced two different things that look identical.
//
// Both are now rows in contact_labels / contact_label_assignments. This module holds the
// decisions that do not need a database — matching, diffing, and the shape of a write —
// so they can be tested directly rather than through the UI.

// Two labels are the same when their names match apart from case and surrounding space.
// The database enforces this with a unique index on (workspace_id, lower(name)); this
// mirrors it so the client can find an existing label before trying to create a duplicate.
export function labelKey(name) {
  return String(name || '').trim().toLowerCase();
}

export function isValidLabelName(name) {
  const trimmed = String(name || '').trim();
  return trimmed.length > 0 && trimmed.length <= 60;
}

/**
 * Find an existing label in this workspace, case-insensitively.
 * Returns null when there is none, which is the caller's signal to create one.
 */
export function findLabel(labels, workspaceId, name) {
  const key = labelKey(name);
  if (!key) return null;
  return (labels || []).find(
    (label) => label.workspace_id === workspaceId && labelKey(label.name) === key,
  ) || null;
}

/**
 * The labels attached to one contact, in a stable order.
 *
 * Assignments referencing a label that no longer exists are dropped rather than rendered
 * as blanks — the same treatment a dangling link gets in the App Builder.
 */
export function labelsForContact(labels, assignments, contactId) {
  const byId = new Map((labels || []).map((label) => [label.id, label]));
  return (assignments || [])
    .filter((a) => a.contact_id === contactId)
    .map((a) => byId.get(a.label_id))
    .filter(Boolean)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export function contactsWithLabel(assignments, labelId) {
  return [...new Set((assignments || []).filter((a) => a.label_id === labelId).map((a) => a.contact_id))];
}

/**
 * Which of these contacts still need this label.
 *
 * Assigning is idempotent — the table's primary key is (contact_id, label_id), so a repeat
 * would be a duplicate-key error rather than a no-op. Filtering first keeps a bulk action
 * over a partially-labelled selection from failing on the ones already done.
 */
export function assignmentsToCreate({ contactIds, labelId, assignments }) {
  const already = new Set(
    (assignments || []).filter((a) => a.label_id === labelId).map((a) => a.contact_id),
  );
  return [...new Set(contactIds || [])].filter((id) => id && !already.has(id));
}

/**
 * The row for one assignment. company_id and workspace_id are carried explicitly because
 * the row-level policies check them against the contact's own — a row that claims a
 * workspace its contact is not in is rejected, so these must be the contact's values and
 * not, say, whichever workspace happens to be on screen.
 */
export function assignmentRow({ contactId, labelId, workspaceId, companyId, profileId }) {
  return {
    contact_id: contactId,
    label_id: labelId,
    workspace_id: workspaceId,
    company_id: companyId,
    assigned_by: profileId || null,
  };
}

export function newLabelRow({ name, workspaceId, companyId, profileId, color }) {
  return {
    company_id: companyId,
    workspace_id: workspaceId,
    name: String(name).trim(),
    color: color || '#64748b',
    created_by: profileId || null,
  };
}

// A readable summary for the toast. "3 contacts" is less useful than naming the label,
// and a bulk action over a partly-labelled selection should say what it actually did.
export function describeAssignment({ requested, created, labelName }) {
  const already = requested - created;
  if (created === 0) {
    return `All ${requested} already had "${labelName}".`;
  }
  const noun = created === 1 ? 'contact' : 'contacts';
  if (already > 0) {
    return `Labelled ${created} ${noun} "${labelName}" — ${already} already had it.`;
  }
  return `Labelled ${created} ${noun} "${labelName}".`;
}
