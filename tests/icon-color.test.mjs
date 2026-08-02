import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

test('the default is Quest orange, not the company tint', () => {
  assert.match(main, /const ICON_COLOR_DEFAULT = '#e0552d';/);
  assert.match(fn('normalizeIconColor'), /: ICON_COLOR_DEFAULT/);
});

test('only a real hex reaches the style attribute', () => {
  // This value is interpolated into style="", so anything else is an injection point as
  // well as a rendering bug.
  const body = fn('normalizeIconColor');
  assert.match(body, /\^#\(\?:\[0-9a-f\]\{3\}\|\[0-9a-f\]\{6\}\)\$/i);
  for (const bad of ['red', 'url(x)', '#12345', 'expression(alert(1))', '']) {
    assert.ok(!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(bad), `${bad} must not be treated as a colour`);
  }
});

test('a stored colour survives, and a missing one becomes the default', () => {
  // Rows loaded before the column exists have no icon_color at all.
  assert.match(fn('normalizeCompany'), /icon_color: normalizeIconColor\(input\.icon_color\)/);
  assert.match(main, /icon_color: normalizeIconColor\(draft\.icon_color \?\? company\.icon_color\)/);
  assert.match(main, /icon_color: normalizeIconColor\(patch\.icon_color \?\? current\.icon_color\)/);
});

test('the glyph is drawn in the icon colour, the tile keeps the accent', () => {
  const body = fn('workspaceIconMarkup');
  assert.match(body, /--icon-color:\$\{h\(normalizeIconColor\(company\?\.icon_color\)\)\}/);
  // The uploaded-image branch is untouched: an image carries its own colours.
  const upload = body.slice(body.indexOf('if (iconImage)'), body.indexOf('const icon ='));
  assert.ok(!/--icon-color/.test(upload));
  assert.match(css, /\.workspace-icon:not\(\.has-upload\) \{[^}]*color: var\(--icon-color, var\(--orange\)\)/s);
});

test('the picker is hidden when an image is uploaded, since it would do nothing', () => {
  const modal = fn('renderWorkspaceIconModal');
  assert.match(modal, /\$\{draft\.icon_image \? '' : `/);
  assert.match(modal, /data-action="set-workspace-icon-color"/);
  assert.match(modal, /data-workspace-icon-color/);
});

test('a preset click and a custom colour both write the same draft field', () => {
  assert.match(main, /setWorkspaceIconDraft\(activeCompanyId\(\), \{ icon_color: node\.dataset\.iconColor \}\)/);
  assert.match(main, /setWorkspaceIconDraft\(activeCompanyId\(\), \{ icon_color: value \}\)/);
  // The action has to be on the allowlist or the click is ignored.
  assert.match(main, /'set-workspace-icon-color',/);
});

test('dragging the custom picker repaints without a re-render', () => {
  // A render() mid-drag tears down the open native colour popup.
  const at = main.indexOf("[data-workspace-icon-color]");
  const body = main.slice(at, at + 420);
  assert.match(body, /el\.style\.setProperty\('--icon-color', value\)/);
  assert.ok(!/\brender\(\)/.test(body), 'must not re-render while the picker is open');
});

test('the choice reaches the save, and its storage limit is stated', () => {
  assert.match(main, /const iconColor = normalizeIconColor\(form\.icon_color\);/);
  assert.match(main, /<input type="hidden" name="icon_color"/);
  assert.match(main, /icon_color: iconColor,/);
  // The gap is recorded where someone would hit it, not left to be discovered, and it
  // names the migration that closes it.
  assert.match(main, /supabase\/migrations\/202608021000_company_icon_color\.sql/);
  assert.match(main, /add `p_icon_color: iconColor` to that/);
});

test('the active swatch is marked without putting a glyph on an unknown colour', () => {
  assert.match(css, /\.icon-color-swatch\.active \{[^}]*box-shadow:/s);
  // The native input stays keyboard-reachable rather than being display:none.
  assert.match(css, /\.icon-color-custom input\[type="color"\] \{[^}]*opacity: 0;/s);
  assert.match(css, /\.icon-color-custom:focus-within \{[^}]*outline:/s);
});
