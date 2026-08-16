// A record's short reference, and the one place that decides what it looks like.
//
// Its own module rather than a helper inside button-field.js, for the reason pull-rows.js states
// next door: main.js needs this SYNCHRONOUSLY, on every items render, to make a record findable
// by its reference -- and whatever main.js imports lands in the entry bundle. Importing three
// hundred lines of push-and-merge rules to reach a six-line function would drag the whole of
// button-field.js forward for every session that never presses a button.
//
// Both sides read it from here, so the reference printed on an arrival line and the reference
// the search box matches cannot drift into disagreeing.

/**
 * A short, readable reference for a record.
 *
 * An arrival used to be logged as "arrived from Company Contacts (a copy)", which says whether
 * it was copied or moved and nothing else -- send the same contact twice and you get two
 * identical lines with no way to tell which arrival is which record.
 *
 * Taken from the record's OWN id rather than a counter: a counter needs somewhere to live and
 * drifts the moment two people press at once, where an id is already unique and already stored.
 * The LAST six characters, because a uuid's tail varies where its head does not.
 *
 * Uppercased and stripped of punctuation so it reads as an identifier rather than as a fragment
 * of a uuid, and returns '' for nothing at all rather than a bare hash.
 */
export function arrivalRef(id) {
  const clean = String(id || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return clean ? `#${clean.slice(-6)}` : '';
}

/**
 * Does this search text look like somebody hunting for a reference?
 *
 * Used to decide nothing on its own -- the reference is simply added to every record's search
 * text -- but it is what lets a caller say "no record carries that reference" rather than the
 * generic "nothing matches", which is a different and more useful thing to be told.
 */
export function looksLikeRef(query) {
  return /^#?[a-z0-9]{4,6}$/i.test(String(query || '').trim());
}
