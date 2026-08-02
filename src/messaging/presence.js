// Who is currently in Questbase.
//
// The app had no notion of this. The only "presence" was RingCentral phone-agent status —
// call-centre availability, admin-only, and meaningless unless that integration is
// connected. Nothing answered "is this colleague at their desk right now".
//
// Built on Supabase Realtime Presence rather than a last_seen_at column, because presence
// is genuinely ephemeral: it is true only while a socket is open. A timestamp column means
// every client writing to the database every few seconds forever, a policy allowing it,
// and a staleness window where someone who closed their laptop still looks online. A
// presence channel needs no table, no migration and no writes, and a dropped connection
// removes the person automatically.
//
// This module holds the parts that do not need a socket, so they can be tested directly.

// How long a presence entry stays trusted after its heartbeat. Realtime removes entries on
// disconnect, but a laptop that sleeps can leave one behind until the server times the
// socket out, and "online" that is wrong is worse than "offline" that is stale.
export const PRESENCE_STALE_MS = 90_000;

/**
 * Flatten Supabase's presenceState() into the set of profile ids that are online.
 *
 * The shape is { [presenceKey]: [{ ...tracked }, ...] } — a list per key, because one
 * person can have several tabs open. Everything is deduplicated by profile id, so three
 * tabs are one person.
 */
export function onlineProfileIds(presenceState, now = Date.now()) {
  const online = new Set();
  for (const entries of Object.values(presenceState || {})) {
    for (const entry of entries || []) {
      const id = entry && entry.profile_id;
      if (!id) continue;
      const at = Number(entry.at);
      // A missing or unparseable timestamp is treated as current rather than discarded:
      // the entry exists, which means a socket is open.
      if (Number.isFinite(at) && now - at > PRESENCE_STALE_MS) continue;
      online.add(String(id));
    }
  }
  return online;
}

/**
 * What this client publishes about itself. Deliberately minimal — a presence channel is
 * readable by anyone who joins it, so it carries an id and a timestamp and nothing else.
 * No name, no email, no company.
 */
export function selfPresence(profileId, now = Date.now()) {
  return { profile_id: String(profileId), at: now };
}

/**
 * Channel name for a company. Presence is scoped per company so you only ever see
 * colleagues, and switching company means leaving one channel and joining another.
 */
export function presenceChannelName(companyId) {
  return `quest-presence-${String(companyId || 'none')}`;
}

/**
 * Whether an id should render as online.
 *
 * Your own id always counts: you are demonstrably here, and waiting for the round trip
 * makes your own avatar flicker grey on first paint.
 */
export function isOnline(onlineIds, profileId, selfId) {
  if (!profileId) return false;
  const id = String(profileId);
  if (selfId && id === String(selfId)) return true;
  return !!(onlineIds && onlineIds.has(id));
}

/**
 * The status ring for an avatar: which class, and what a screen reader should say.
 * Colour alone cannot carry this — the label is what makes it readable.
 */
export function presenceRing(online) {
  return {
    className: online ? 'is-online' : 'is-offline',
    label: online ? 'Online' : 'Offline',
  };
}
