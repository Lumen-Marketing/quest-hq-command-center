// Scheduled calls and messages, for everything that reads them.
//
// Three surfaces want the same rows: the app's calendar, a contact's calendar, and the reminder
// that announces one when its time comes. Fetching per surface would be three queries saying
// nearly the same thing and three caches to disagree with each other, so there is ONE query per
// company -- everything still scheduled, which is a small set by definition -- and every reader
// filters it in memory.
//
// The selectors are pure and take rows, so a calendar can be tested without a database and the
// reminder without a clock.

/** A row's day, as the calendars key their maps: YYYY-MM-DD, local. */
export function eventDay(row) {
  const at = new Date(row?.scheduled_for || '');
  if (Number.isNaN(at.getTime())) return '';
  // Local, not the ISO string's UTC date. A call at 8pm on the 1st is on the 1st for the person
  // who scheduled it, and slicing the ISO would file it on the 2nd for half the world.
  const pad = (n) => String(n).padStart(2, '0');
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

/** The time to show beside it, or '' when it will not parse. */
export function eventTime(row) {
  const at = new Date(row?.scheduled_for || '');
  if (Number.isNaN(at.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(at.getHours())}:${pad(at.getMinutes())}`;
}

/** What it is called on a calendar: the title it was given, or what kind of thing it is. */
export function eventTitle(row) {
  return String(row?.title || '').trim() || (row?.kind === 'sms' ? 'Message' : 'Call');
}

/** Scheduled things grouped by the day they fall on. */
export function eventsByDay(rows) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const day = eventDay(row);
    if (!day) return;
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(row);
  });
  // Earliest first inside a day, so a calendar cell reads down the morning.
  map.forEach((list) => list.sort((a, b) => String(a.scheduled_for).localeCompare(String(b.scheduled_for))));
  return map;
}

/**
 * The rows already held for a company, without asking for any.
 *
 * The calendars draw during a render and cannot wait for a fetch, and they already have `state`.
 * So they read what is there; the heartbeat is what puts it there, and calls render when it
 * lands. Passing a reader down through two more ctx objects cost more entry-bundle bytes than
 * the whole feature was worth.
 */
export const heldEvents = (state, companyId) => state?.wbEvents?.[companyId] || [];

/** Only the ones on these records. */
export function eventsForItems(rows, itemIds) {
  const want = itemIds instanceof Set ? itemIds : new Set(itemIds || []);
  return (rows || []).filter((row) => want.has(row?.item_id));
}

/**
 * Which reminders are due, for this person.
 *
 * Due means the moment has PASSED, so one whose time has not come is left alone and one missed
 * while the app was shut is still announced when it opens -- late is the honest answer, and
 * silence is not.
 *
 * Only the person who scheduled it: they are who the reminder is for. Everyone else in the
 * company getting an alarm for a call they did not arrange is noise, and it would also mean the
 * first of them to notice claimed it and the rest never heard.
 */
export function dueEvents(rows, nowIso, profileId) {
  const now = new Date(nowIso || Date.now()).getTime();
  return (rows || []).filter((row) => {
    if (!row || row.status !== 'scheduled' || row.notified_at) return false;
    if (profileId && row.created_by && row.created_by !== profileId) return false;
    const at = new Date(row.scheduled_for || '').getTime();
    return !Number.isNaN(at) && at <= now;
  });
}

/** What the alarm says. */
export function reminderText(row) {
  const kind = row?.kind === 'sms' ? 'Message' : 'Call';
  const to = String(row?.to_number || '').trim();
  return {
    title: `${kind}: ${eventTitle(row)}`,
    body: to ? `Due now — ${to}` : 'Due now',
  };
}

/**
 * Fetching them, and announcing the ones whose time has come.
 *
 * The fetch is per company and cached on state, because three surfaces read the same small set --
 * everything still scheduled. The announcement is a CLAIM: the update sets notified_at only where
 * it is still null, so with two tabs open Postgres decides which one announces and the other is
 * handed nothing back and stays quiet.
 */
export function createRecordEvents(ctx) {
  const {
    activeProfileId, appHref, companyPath, createSupabaseClient, isLiveSupabaseSession,
    notifyLocalEvent, render, state,
    // Whether the record a reminder was scheduled ON is still there. Supplied rather than worked
    // out here: this module knows about rows, and only the caller can read the documents.
    //
    // Defaults to "yes" on purpose. Suppressing an alarm is destructive -- the reminder is gone
    // and nobody is told -- so the absence of a check must never silence one.
    recordIsLive = () => true,
    // Same guard the presence channel and realtime-domain refresh already use: a render rebuilds
    // the page from state, and a half-typed field lives only in the DOM, so a poll landing mid-type
    // must not render out from under it. Defaults to "never interrupts" so existing callers/tests
    // that do not pass it keep today's behavior.
    renderWouldInterrupt = () => false,
  } = ctx;

  const inFlight = new Set();

  /** Render now, or -- same terms as the presence/realtime-refresh guard -- shortly after. */
  function renderWhenSafe() {
    if (renderWouldInterrupt()) {
      setTimeout(renderWhenSafe, 1500);
      return;
    }
    render();
  }

  /** The rows held for a company, and a fetch started if there are none yet. */
  function companyEvents(companyId) {
    const held = state.wbEvents?.[companyId];
    if (held === undefined) loadCompanyEvents(companyId);
    return held || [];
  }

  function loadCompanyEvents(companyId) {
    if (!companyId || inFlight.has(companyId)) return Promise.resolve([]);
    const supabase = createSupabaseClient?.();
    if (!supabase || !isLiveSupabaseSession?.()) {
      // Cached as empty rather than left undefined, or every render starts another fetch that
      // cannot succeed.
      state.wbEvents = { ...(state.wbEvents || {}), [companyId]: [] };
      return Promise.resolve([]);
    }
    inFlight.add(companyId);
    return supabase.from('wb_record_events')
      .select('id, workspace_id, app_id, item_id, kind, title, body, to_number, scheduled_for, status, notified_at, created_by')
      .eq('company_id', companyId)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })
      .then(({ data }) => {
        const rows = data || [];
        state.wbEvents = { ...(state.wbEvents || {}), [companyId]: rows };
        inFlight.delete(companyId);
        renderWhenSafe();
        return rows;
      }, () => {
        state.wbEvents = { ...(state.wbEvents || {}), [companyId]: [] };
        inFlight.delete(companyId);
        return [];
      });
  }

  /** Throw the held rows away, so the next read fetches them again. */
  function forgetCompanyEvents(companyId) {
    if (state.wbEvents) delete state.wbEvents[companyId];
  }

  /** Where the alarm takes you: the record it was scheduled on. */
  function eventHref(companyId, row) {
    return appHref(companyPath('workspaces', {
      // The route wants the document's key for the workspace, which is the row's uuid with the
      // prefix the App Builder gives it.
      workspace: `ws-${row.workspace_id}`,
      app_id: row.app_id,
      tab: 'items',
      item_id: row.item_id,
    }, companyId));
  }

  /**
   * Announce whatever is due, once.
   *
   * Returns the rows announced, so a caller can be tested on what it raised rather than on
   * whether it happened to call something.
   */
  async function checkReminders(companyId) {
    if (!companyId) return [];
    const supabase = createSupabaseClient?.();
    if (!supabase || !isLiveSupabaseSession?.()) return [];
    const me = activeProfileId?.() || '';
    const rows = await loadCompanyEvents(companyId);
    // An alarm for a record that no longer exists is worse than a missed one: it goes off,
    // names a call, and takes you to a page that says the record is gone.
    const due = dueEvents(rows, new Date().toISOString(), me)
      .filter((row) => recordIsLive(companyId, row));
    if (!due.length) return [];

    const stamp = new Date().toISOString();
    const { data, error } = await supabase.from('wb_record_events')
      .update({ notified_at: stamp })
      .in('id', due.map((row) => row.id))
      .is('notified_at', null)
      .select('id');
    // Nothing claimed, or the claim failed: say nothing. An alarm raised on a row this session
    // did not win is the duplicate the claim exists to prevent.
    if (error || !data?.length) return [];

    const won = new Set(data.map((one) => one.id));
    const announced = due.filter((row) => won.has(row.id));
    announced.forEach((row) => {
      const { title, body } = reminderText(row);
      notifyLocalEvent(
        'workspace.reminder', title, body, eventHref(companyId, row),
        'workspace_item', row.item_id, companyId, me ? [me] : null,
      );
    });
    // The held rows are stale the moment one is claimed: it must not go off again on the next
    // pass, and the calendars stop showing it as waiting.
    forgetCompanyEvents(companyId);
    renderWhenSafe();
    return announced;
  }

  return {
    companyEvents, loadCompanyEvents, forgetCompanyEvents, checkReminders, eventHref,
  };
}
