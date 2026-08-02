import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The Appearance panel markup now lives in its own lazily-fetched module. These read
// both files as one source: the assertions are about what the app renders, not about
// which file happens to hold it.
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/ui/appearance-panel.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('account menu exposes fast theme and accent controls', () => {
  assert.match(source, /const THEME_OPTIONS = \[/);
  assert.match(source, /const ACCENT_OPTIONS = \[/);
  assert.match(source, /function getThemeMode\(\)/);
  assert.match(source, /function resolveThemeMode\(mode = getThemeMode\(\)\)/);
  assert.match(source, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)\.matches/);
  assert.match(source, /document\.documentElement\.dataset\.themeMode = mode/);
  assert.match(source, /document\.documentElement\.dataset\.accent = accent/);
  assert.match(source, /function renderAccountThemeControls\(\)/);
  assert.match(source, /account-theme-panel/);
  assert.match(source, /\['system', 'System', 'ti-device-desktop'\]/);
  assert.match(source, /data-action="set-theme"[\s\S]*data-theme="\$\{h\(id\)\}"/);
  assert.match(source, /data-action="set-accent"/);
  assert.match(source, /setAccent\(node\.dataset\.accent \|\| 'quest'\)/);
  assert.match(styles, /\.account-theme-panel/);
  assert.match(styles, /\.account-theme-options/);
  assert.match(styles, /\.account-accent-swatch/);
});
