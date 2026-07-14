// Shared icon-usage extraction, used by both the subset build and its guard test.
//
// The app references Tabler icons two ways:
//   1. literally            -> class="ti ti-home", 'ti-rocket', icon: 'ti-mail'
//   2. inside a template    -> `ti-${done ? 'circle-check-filled' : 'circle'}`
//
// Form 2 is the trap: the icon name appears WITHOUT the `ti-` prefix, so a naive
// /ti-[a-z-]+/ scan silently misses it and the glyph gets dropped from the subset.
// We pull every quoted literal out of the `${...}` expression instead, then keep
// whatever the real font actually defines.

import { readFileSync } from 'node:fs';

export const ICON_SOURCE_FILES = ['src/main.js', 'src/styles.css', 'index.html'];
export const TABLER_CSS = 'taskmanagement/vendor/tabler-icons/tabler-icons.min.css';

/** Parse `.ti-name:before{content:"\e123"}` into name -> codepoint. */
export function parseIconFont(cssText) {
  const map = new Map();
  const rule = /\.ti-([a-z0-9-]+):before\{content:"\\([0-9a-f]+)"\}/g;
  let m;
  while ((m = rule.exec(cssText))) map.set(m[1], parseInt(m[2], 16));
  return map;
}

const NAME_CHAR = /[a-z0-9-]/;
const MAX_VARIANTS = 64; // guard against a pathological cartesian blowup

/** Values a `${...}` expression can contribute to an icon name. */
function branchValues(expr) {
  const vals = new Set();
  for (const lit of expr.matchAll(/(['"`])([a-z0-9-]*)\1/g)) vals.add(lit[2]);
  // No usable literal (e.g. a bare variable) => we cannot know the name statically.
  return vals.size ? vals : null;
}

/**
 * Collect candidate icon names from source text.
 *
 * Handles a name as a sequence of literal chunks and `${...}` interpolations in
 * ANY position, then expands the cartesian product:
 *
 *   ti-heart${liked ? '-filled' : ''}   -> heart, heart-filled
 *   ti-chevron-${open ? 'up' : 'down'}  -> chevron-up, chevron-down
 *   ti-${done ? 'circle-check' : 'x'}   -> circle-check, x
 *
 * Returns bare names (no `ti-` prefix). Callers intersect with the font map, so
 * over-collecting is safe; under-collecting silently breaks an icon.
 * `dynamic` records sites whose name could NOT be resolved statically.
 */
export function collectCandidates(source, dynamic = new Set()) {
  const found = new Set();

  for (const m of source.matchAll(/\bti-/g)) {
    let i = m.index + 3;
    let variants = [''];
    let resolvable = true;

    while (i < source.length) {
      const c = source[i];

      if (NAME_CHAR.test(c)) {
        let j = i;
        while (j < source.length && NAME_CHAR.test(source[j])) j++;
        const chunk = source.slice(i, j);
        variants = variants.map((v) => v + chunk);
        i = j;
        continue;
      }

      if (c === '$' && source[i + 1] === '{') {
        let depth = 0;
        let end = -1;
        for (let j = i + 1; j < source.length; j++) {
          if (source[j] === '{') depth++;
          else if (source[j] === '}' && --depth === 0) { end = j; break; }
        }
        if (end === -1) break;

        const vals = branchValues(source.slice(i + 2, end));
        if (!vals) {
          // Name depends on a runtime value we cannot see — flag it rather than
          // quietly shipping a subset that might be missing the glyph.
          resolvable = false;
          break;
        }
        const next = [];
        for (const v of variants) for (const val of vals) next.push(v + val);
        if (next.length > MAX_VARIANTS) { resolvable = false; break; }
        variants = next;
        i = end + 1;
        continue;
      }

      break; // end of the name token
    }

    if (!resolvable) {
      dynamic.add(source.slice(m.index, Math.min(m.index + 60, source.length)).split('\n')[0]);
      continue;
    }
    for (const v of variants) if (v) found.add(v);
  }

  return found;
}

/**
 * Resolve the icons the app actually uses.
 * `unknown` = names referenced in code that the font does not define — these are
 * already-broken icon references, worth surfacing rather than silently dropping.
 */
export function resolveUsedIcons(sources, fontMap) {
  const candidates = new Set();
  const dynamic = new Set();
  for (const text of sources) for (const n of collectCandidates(text, dynamic)) candidates.add(n);

  const used = new Map();
  const unknown = new Set();
  for (const name of candidates) {
    if (fontMap.has(name)) used.set(name, fontMap.get(name));
    else unknown.add(name);
  }
  return { used, unknown, dynamic };
}

export function loadUsedIcons() {
  const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  const fontMap = parseIconFont(read(TABLER_CSS));
  const sources = ICON_SOURCE_FILES.map(read);
  return { fontMap, ...resolveUsedIcons(sources, fontMap) };
}
