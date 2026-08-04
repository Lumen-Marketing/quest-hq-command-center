// Turning an app's name into the name of one record in it.
//
// An app is named for the collection — Jobs, Safety Incidents — but every button that
// creates one is talking about a single record. "Add item" made every app read like the
// generic database it is built on rather than the thing the user made.
//
// Pure and dependency-free so it can be tested directly, and so the reports view can import
// it without reaching back into main.js.

/**
 * The singular of an app name, for buttons and headings.
 *
 * English plurals are irregular enough that a general solution needs a dictionary, so this
 * covers the endings that actually turn up in app names and leaves everything else alone.
 * Returning the name unchanged is always safe -- "Add Equipment Log" reads fine -- while a
 * wrong guess ("Add Clas") looks broken, so every rule here errs toward doing nothing.
 */
export function singularize(name) {
  const value = String(name || '').trim();
  if (value.length < 3) return value;

  // Companies -> Company, Properties -> Property, Activities -> Activity.
  //
  // This one cannot be got right by rule: -ies is the plural of -y (Company) and also just
  // an -s on a word ending in -ie (Movie). It favours -y because that is what app names
  // actually look like, and "Movies" -> "Movy" is what the record-name setting is for.
  if (/[^aeiou]ies$/i.test(value)) return `${value.slice(0, -3)}y`;

  // Addresses -> Address, Boxes -> Box, Batches -> Batch. These need the whole -es.
  if (/(ss|x|z|ch|sh)es$/i.test(value)) return value.slice(0, -2);

  // Class, Address, Progress: already singular. Stripping the s is the classic bug.
  if (/ss$/i.test(value)) return value;

  // Status, Campus, Bus: the s belongs to the word. Real -us plurals are rare enough in an
  // app name that mangling these is the worse trade.
  if (/us$/i.test(value)) return value;

  if (/s$/i.test(value)) return value.slice(0, -1);
  return value;
}

/**
 * What one record in this app is called.
 *
 * The app's own setting wins. No rule gets People -> Person or Equipment -> Piece of
 * equipment, so deriving it is a good default rather than an answer, and the setting is the
 * way out for the names a rule cannot reach.
 */
export function recordName(app) {
  const explicit = String(app?.recordName || '').trim();
  return explicit || singularize(app?.name);
}

/** "Add Job" for an app called Jobs. */
export function addRecordLabel(app) {
  const one = recordName(app);
  return one ? `Add ${one}` : 'Add item';
}

/** "New Job" for the record form's heading. */
export function newRecordLabel(app) {
  const one = recordName(app);
  return one ? `New ${one}` : 'New item';
}
