// Clearing a workspace's activity log.
//
// What this touches, and what it deliberately does not:
//
//   workspace.activity   CLEARED — the workspace's own action log ("Rom added a field",
//                        "Jesus deleted a record"), capped at 60 entries.
//   workspace.feed       KEPT — posts, files and links people wrote. That is content, not
//                        a log, and deleting someone's post is not what "clear logs" means.
//   audit_events         KEPT — the company-level security trail, which exists precisely so
//                        that actions cannot be made to disappear. A workspace admin must
//                        not be able to erase it from a settings screen.
//   record history       KEPT — per-record change history belongs to the record.
//
// Clearing always leaves ONE entry behind, naming who cleared it and how many entries went.
// A log that can be emptied without trace is worth less than no log at all: the first thing
// anyone covering their tracks would do is exactly this, and the absence of evidence would
// look identical to a quiet week.

/**
 * Find the App Builder workspace that a sidebar ("operational") workspace stands for.
 *
 * These are two separate records that people read as one thing: the sidebar rail lists
 * operational workspaces, the activity log belongs to the App Builder workspace, and no id
 * links them. Name is the only bridge there is.
 *
 * Deliberately strict. An ambiguous match returns null and the caller offers nothing, because
 * the alternative is clearing the log of a workspace nobody pointed at.
 */
export function matchBuilderWorkspace(workspaces, name) {
  const wanted = String(name || '').trim().toLowerCase();
  if (!wanted || !Array.isArray(workspaces)) return null;
  const hits = workspaces.filter((w) => String(w?.name || '').trim().toLowerCase() === wanted);
  return hits.length === 1 ? hits[0] : null;
}

/** How many entries a clear would remove. Shown before the action, not after. */
export function clearableCount(workspace) {
  return Array.isArray(workspace?.activity) ? workspace.activity.length : 0;
}

/**
 * Replace the activity log with a single record of the clearing.
 *
 * Returns the new array rather than mutating, so the caller decides when it is saved and
 * a failed save cannot leave the log half-erased.
 */
export function clearedActivity(workspace, { actorName, at, id }) {
  const removed = clearableCount(workspace);
  return [{
    id,
    ts: at,
    kind: 'log-cleared',
    // Phrased for whoever reads it later, who will want to know that entries existed.
    text: `${actorName} cleared the activity log (${removed} ${removed === 1 ? 'entry' : 'entries'} removed).`,
    removed,
  }];
}
