// The icon packs this app can build.
//
// Adding a pack is a table plus an entry here — no new build script. Each pack declares
// where its font and glyph map live, how to read that map, and how a Tabler name resolves
// to one of its glyphs.
//
// Licences, since every one of these ships inside the product:
//   Tabler   MIT              (the default; already the app's own icon set)
//   Lucide   ISC              lucide-static
//   Phosphor MIT              @phosphor-icons/web
//   Remix    Apache-2.0       remixicon
//
// Deliberately NOT included, and why:
//   Hugeicons Pro     a paid commercial licence. Not vendorable without buying it.
//   Font Awesome Free CC-BY-4.0 on the icons — usable, but it obliges us to carry an
//                     attribution notice in the product. That is a product decision, not
//                     a build one.
//   Lineicons         the npm package is stale (1.3.2 against a current 5.x) and the free
//                     set's terms differ from the package licence. Not worth the risk.
//   OpenIconLibrary   an archive of mixed-licence SVGs, not a webfont. There is no
//                     coherent set to subset, and licences vary per icon.

import { readFileSync } from 'node:fs';
import { LUCIDE_ALIASES } from './lucide-aliases.mjs';
import { PHOSPHOR_ALIASES } from './aliases/phosphor.mjs';
import { REMIX_ALIASES } from './aliases/remix.mjs';

const json = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** A Tabler `-filled` name has no meaning in a single-weight outline set. */
const base = (name) => name.replace(/-filled$/, '');

export const ICON_PACKS = [
  {
    id: 'lucide',
    label: 'Lucide',
    ttf: 'node_modules/lucide-static/font/lucide.ttf',
    outFont: 'src/assets/fonts/lucide-subset.woff2',
    outCss: 'src/lucide-icons.css',
    fontFamily: 'lucide-icons',
    aliases: LUCIDE_ALIASES,
    glyphs: () => json('node_modules/lucide-static/font/codepoints.json'),
    // Lucide's map is already { name: codepoint }.
    lookup: (glyphs, name) => (name in glyphs ? glyphs[name] : null),
  },
  {
    id: 'phosphor',
    label: 'Phosphor',
    ttf: 'node_modules/@phosphor-icons/web/src/regular/Phosphor.ttf',
    outFont: 'src/assets/fonts/phosphor-subset.woff2',
    outCss: 'src/phosphor-icons.css',
    fontFamily: 'phosphor-icons',
    aliases: PHOSPHOR_ALIASES,
    glyphs: () => {
      // IcoMoon selection file: one entry per icon, each with several aliases.
      const sel = json('node_modules/@phosphor-icons/web/src/regular/selection.json');
      const map = {};
      for (const icon of sel.icons) {
        for (const alias of icon.properties.name.split(',')) map[alias.trim()] = icon.properties.code;
      }
      return map;
    },
    lookup: (glyphs, name) => (name in glyphs ? glyphs[name] : null),
  },
  {
    id: 'remix',
    label: 'Remix',
    ttf: 'node_modules/remixicon/fonts/remixicon.ttf',
    outFont: 'src/assets/fonts/remix-subset.woff2',
    outCss: 'src/remix-icons.css',
    fontFamily: 'remix-icons',
    aliases: REMIX_ALIASES,
    glyphs: () => json('node_modules/remixicon/fonts/remixicon.glyph.json'),
    // Remix names carry a style suffix. Prefer the outline weight so the pack reads as one
    // set; fall back to fill only for the few glyphs Remix draws solid-only.
    //
    // Its map holds a whole glyph record per name, not a codepoint — the character is in
    // `unicode` as an HTML entity, e.g. "&#xEA4E;".
    lookup: (glyphs, name) => {
      for (const candidate of [`${name}-line`, `${name}-fill`, name]) {
        const entry = glyphs[candidate];
        if (!entry) continue;
        const match = /&#x([0-9a-f]+);/i.exec(entry.unicode || '');
        if (match) return parseInt(match[1], 16);
      }
      return null;
    },
  },
];

/**
 * The glyph a Tabler name should render as in this pack, or null to keep Tabler.
 *
 * Order matters: an explicit alias always wins, then the name itself, and only then the
 * Lucide translation — Lucide sits in the middle because its names are close to both
 * Phosphor's and Remix's, so it resolves a lot for free without overriding a deliberate
 * choice. An alias set to '' means "no good equivalent", and stops the search.
 */
export function resolveGlyph(pack, glyphs, tablerName) {
  const stem = base(tablerName);
  for (const key of [tablerName, stem]) {
    if (key in pack.aliases) {
      const target = pack.aliases[key];
      return target ? pack.lookup(glyphs, target) : null;
    }
  }
  const direct = pack.lookup(glyphs, stem);
  if (direct) return direct;
  const viaLucide = LUCIDE_ALIASES[tablerName] || LUCIDE_ALIASES[stem];
  return viaLucide ? pack.lookup(glyphs, viaLucide) : null;
}
