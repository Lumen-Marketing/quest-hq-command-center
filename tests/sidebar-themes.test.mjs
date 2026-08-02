import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The settings picker lives in its own lazily-fetched module; the model that decides the
// colours stays in main.js because applyAppearance needs it at boot.
const panel = readFileSync(new URL('../src/ui/appearance-panel.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// Panel functions sit one level in, inside the factory, so their closing brace is
// indented; main.js functions close at column 0.
// Just the side-menu section, bounded by the next top-level section comment. Slicing to
// the end of the file instead swept in whatever was appended after it, which made this
// fail on unrelated CSS that had nothing to do with the side menu.
const sideMenuBlock = () => {
  const start = css.indexOf('/* ---- Side menu themes');
  assert.notEqual(start, -1, 'the side menu section should exist');
  const next = css.indexOf('/* ---- ', start + 10);
  return css.slice(start, next === -1 ? css.length : next);
};

const fn = (name) => {
  for (const [src, close] of [[main, '\n}\n'], [panel, '\n  }\n']]) {
    const at = src.indexOf(`function ${name}(`);
    if (at !== -1) return src.slice(at, src.indexOf(close, at));
  }
  throw new Error(`${name} should exist in main.js or the appearance panel`);
};

// Read the preset table out of the source so the tests check the shipped values.
const presets = (() => {
  const at = main.indexOf('const SIDEBAR_THEMES = [');
  const block = main.slice(at, main.indexOf('\n];', at));
  return [...block.matchAll(/\['([a-z]+)', '([^']+)', (null|\{[^}]*\})\]/g)].map(([, id, label, body]) => ({
    id, label, vars: body === 'null' ? null : body,
  }));
})();

test('the presets asked for are all there, with Default first', () => {
  const ids = presets.map((p) => p.id);
  assert.equal(ids[0], 'default');
  for (const wanted of ['light', 'dark', 'midnight', 'hot', 'coffee']) {
    assert.ok(ids.includes(wanted), `missing preset: ${wanted}`);
  }
});

test('Default carries no values, so the shipped look cannot drift', () => {
  // If Default were a copy of the current colours, editing this table would silently
  // change what "Default" means. It applies no overrides at all instead.
  assert.equal(presets[0].vars, null);
  assert.match(fn('sidebarThemeVars'), /if \(!id \|\| id === 'default'\) return null;/);
});

test('every non-default preset is complete — a missing colour is an unreadable menu', () => {
  for (const p of presets.filter((x) => x.vars)) {
    for (const key of ['bg', 'text', 'strong', 'label', 'activeBg', 'activeText', 'dark']) {
      assert.match(p.vars, new RegExp(`\\b${key}:`), `${p.id} is missing ${key}`);
    }
  }
});

test('exactly one preset is a light surface, and it says so', () => {
  const light = presets.filter((p) => p.vars && /dark: false/.test(p.vars));
  assert.deepEqual(light.map((p) => p.id), ['light']);
  // The rest must claim to be dark rather than leaving it unset.
  for (const p of presets.filter((x) => x.vars && x.id !== 'light')) {
    assert.match(p.vars, /dark: true/, `${p.id} should declare its surface`);
  }
});

// --- custom colours -------------------------------------------------------------

test('text on a custom colour follows the background, rather than being guessed', () => {
  const body = fn('readableOn');
  // Relative luminance, not a naive average: #0000ff and #ffff00 have the same mean
  // channel value and opposite readability.
  assert.match(body, /0\.2126 \*/);
  assert.match(body, /0\.7152 \*/);
  assert.match(body, /0\.0722 \*/);
  assert.match(body, /\*\* 2\.4/, 'channels must be linearised first');
});

test('a custom menu derives every colour, so no field can be left unreadable', () => {
  const body = fn('sidebarThemeVars');
  assert.match(body, /const dark = readableOn\(settings\.sidebarBg\)/);
  assert.match(body, /activeBg: hexToRgba\(settings\.sidebarAccent/);
  assert.match(body, /activeText: settings\.sidebarAccent/);
  assert.match(body, /strong: dark \? '#ffffff' : '#17130f'/);
});

test('an unknown saved theme falls back instead of leaving a dead attribute', () => {
  // A value written by a newer build, or edited in storage by hand.
  assert.match(fn('getAppearance'), /!SIDEBAR_THEME_IDS\.includes\(merged\.sidebarTheme\)\) merged\.sidebarTheme = 'default'/);
  assert.match(main, /const sidebarTheme = \(picked === 'custom' \|\| SIDEBAR_THEME_IDS\.includes\(picked\)\) \? picked : 'default'/);
});

// --- applying -------------------------------------------------------------------

test('choosing Default clears the variables rather than writing colours back', () => {
  const body = fn('applyAppearance');
  assert.match(body, /delete root\.dataset\.sidebarTheme;/);
  assert.match(body, /SIDE_VARS\.forEach\(\(name\) => style\.removeProperty\(name\)\)/);
});

test('light-vs-dark travels separately from the preset name', () => {
  // So hairlines and hover can flip without the stylesheet listing every preset.
  assert.match(fn('applyAppearance'), /root\.dataset\.sidebarSurface = side\.dark \? 'dark' : 'light'/);
  assert.match(css, /\[data-sidebar-surface="light"\] \{/);
});

test('the choice rides the existing sync, so it follows you between devices', () => {
  // appearanceSyncPayload spreads the whole appearance record; these keys need no
  // special casing, but a future refactor to an allow-list would silently drop them.
  const payload = fn('appearanceSyncPayload');
  assert.match(payload, /\.\.\.shareable/);
  assert.match(main, /sidebarTheme: '[a-z]+'/, 'must be part of APPEARANCE_DEFAULTS to sync');
});

// --- stylesheet -----------------------------------------------------------------

test('every themed rule is scoped, so an untouched menu matches none of them', () => {
  const block = sideMenuBlock();
  const rules = block.split('\n').filter((l) => /^\[?[.[]/.test(l.trim()) && l.includes('{'));
  assert.ok(rules.length > 5, 'expected the themed rules to be present');
  for (const rule of rules) {
    if (rule.includes('.appearance-')) continue; // the settings picker, not the menu itself
    assert.match(rule, /\[data-sidebar-(theme|surface)/, `unscoped rule would hit the default menu: ${rule.trim()}`);
  }
});

test('the quiet text a light surface would erase is themed too', () => {
  const block = sideMenuBlock();
  // Section headings, counts and icons are the first things to vanish when a dark
  // surface becomes a light one.
  for (const sel of ['.side-label', '.side-item b', '.symbol-icon', '.side-sub-link', '.workspace-rail-open']) {
    assert.ok(block.includes(sel), `${sel} needs a themed colour`);
  }
});

test('the active row takes its colour from the theme, not the global orange', () => {
  const block = sideMenuBlock();
  assert.match(block, /\.side-item\.active[\s\S]{0,400}background: var\(--deck-active-bg\)/);
  assert.match(block, /color: var\(--deck-active-text\)/);
});

test('the picker previews a menu, not a paint chip', () => {
  // The question being asked is whether the highlight reads against the background,
  // which a flat swatch cannot answer.
  const swatch = fn('sidebarThemeSwatch');
  assert.match(swatch, /appearance-side-mini/);
  assert.match(swatch, /class="on"/, 'one row must show the active state');
  assert.match(swatch, /box-shadow:inset 2px 0 \$\{h\(v\.activeText\)\}/);
  // Default has no variables to preview, so its colours are named for the swatch only.
  assert.match(swatch, /const v = vars \|\| \{/);
});

test('the custom colour pickers update live without re-rendering', () => {
  // A re-render mid-drag tears down the open colour popup.
  const at = main.indexOf("[data-appearance-sidebar-bg]");
  const body = main.slice(at, at + 220);
  assert.match(body, /setAppearance\(\{ sidebarBg: event\.target\.value \}\)/);
  assert.ok(!/render\(\)/.test(body), 'must not re-render while the picker is open');
});

// --- the readability regression -------------------------------------------------

test('headline text is themed, including the elements that carry their own colour', () => {
  // The Midnight preset shipped with the product name and company name still near-black
  // on navy: `strong` and `small` take colours from the base stylesheet, so theming the
  // container above them changed nothing.
  const block = sideMenuBlock();
  for (const sel of ['.deck-brand strong', '.deck-brand small', '.company-account-copy strong', '.company-account-copy small']) {
    assert.ok(block.includes(sel), `${sel} keeps its own colour unless themed explicitly`);
  }
});

test('every themed text rule resolves to a variable, never a fixed colour', () => {
  // A literal here would be readable on some presets and not others, which is the exact
  // failure this section exists to prevent.
  const block = sideMenuBlock();
  const colours = [...block.matchAll(/(?:^|\n)\s*color:\s*([^;]+);/g)].map((m) => m[1].trim());
  assert.ok(colours.length > 3, 'expected themed colour rules');
  for (const value of colours) {
    assert.match(value, /^var\(--deck-/, `fixed colour in a themed rule: ${value}`);
  }
});

// --- an explicit text colour ----------------------------------------------------

test('text colour is optional, and empty means "let the preset decide"', () => {
  assert.match(main, /sidebarText: '',/);
  // Cleared back to empty rather than to a colour that merely looks like the default:
  // the two diverge the moment the preset changes.
  assert.match(main, /setAppearance\(\{ sidebarText: '' \}\)/);
});

test('an explicit colour overrides the preset in three weights', () => {
  // One flat colour everywhere would erase the distinction between a heading, a row and
  // a section label.
  const body = fn('applyAppearance');
  assert.match(body, /style\.setProperty\('--deck-strong', ink\)/);
  assert.match(body, /style\.setProperty\('--deck-text', hexToRgba\(ink, 0\.82\)\)/);
  assert.match(body, /style\.setProperty\('--deck-label', hexToRgba\(ink, 0\.6\)\)/);
});

test('only a real hex is written, since it lands in a style property', () => {
  const body = fn('applyAppearance');
  assert.match(body, /\^#\(\?:\[0-9a-f\]\{3\}\|\[0-9a-f\]\{6\}\)\$/i);
});

test('the control is offered wherever it can take effect', () => {
  // Default deliberately applies no variables, so there is nothing for a text colour to
  // override there — offering it would be a control that silently does nothing.
  assert.match(panel, /a\.sidebarTheme !== 'default' \? `/);
  assert.match(panel, /data-appearance-sidebar-text/);
  assert.match(panel, /data-action="clear-sidebar-text"/);
});

test('dragging the text picker repaints without a re-render', () => {
  const at = main.indexOf('[data-appearance-sidebar-text]');
  const body = main.slice(at, at + 200);
  assert.match(body, /setAppearance\(\{ sidebarText: event\.target\.value \}\)/);
  assert.ok(!/render\(\)/.test(body));
});

// --- whose settings these are ---------------------------------------------------

test('appearance is per account, and sharing it is a separate deliberate act', () => {
  // "If I change the look of my account it only saves on my account." Personal prefs are
  // written by explicit user action and always win; the company default is a different
  // button, and only applies to members who never chose for themselves.
  const resolved = fn('resolvedAppearancePrefs');
  assert.match(resolved, /const personal = activeSession\(\)\?\.profile\?\.appearance_prefs;/);
  assert.match(resolved, /if \(hasPrefs\(personal\)\) return personal;/);
  // Saving the company default is its own action, not a side effect of changing a theme.
  assert.match(main, /action === 'save-company-appearance'/);
  const save = fn('saveCompanyAppearanceDefault');
  assert.match(save, /canManageCompanyAppearance\(companyId\)/, 'and it is permission-gated');
});

// --- what ships out of the box ------------------------------------------------

test('the light menu is the shipped default', () => {
  // Chosen so the brand mark appears in its full-colour form rather than the lightened
  // variant, which is what the dark menu requires.
  assert.match(main, /sidebarTheme: 'light',/);
  assert.ok(presets.some((p) => p.id === 'light'), 'the default must be a real preset');
});

test('the no-overrides preset is labelled for how it looks, not for being the default', () => {
  // It is no longer the default, so calling it "Default" would be a lie in the picker.
  const entry = presets.find((p) => p.id === 'default');
  assert.equal(entry.label, 'Charcoal');
  assert.equal(entry.vars, null, 'it must still apply no overrides');
});

test('an account that already chose a theme is not moved to the new default', () => {
  // getAppearance merges saved values over the defaults, so a stored choice wins. Only
  // an account that never picked anything follows the shipped default.
  const fn = main.slice(main.indexOf('function getAppearance()'));
  assert.match(fn.slice(0, fn.indexOf('\n}\n')), /\{ \.\.\.APPEARANCE_DEFAULTS, \.\.\.\(saved/);
});

