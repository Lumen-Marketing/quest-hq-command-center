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
