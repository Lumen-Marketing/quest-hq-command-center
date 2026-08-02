import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const boots = readFileSync(new URL('../scripts/check-bundle-boots.mjs', import.meta.url), 'utf8');

// main.js builds its initial `state` object at module scope, and that initializer calls
// normalizeCompany over the fallback companies. Anything normalizeCompany reads must
// therefore be initialized ABOVE that point — a `const` declared lower down is still in
// its temporal dead zone, and the app dies before its first render with a blank page and
// a minified identifier in the console. This shipped twice.
const lineOf = (needle) => {
  const at = main.indexOf(needle);
  assert.notEqual(at, -1, `expected to find: ${needle}`);
  return main.slice(0, at).split('\n').length;
};

const stateInit = lineOf('companies: mergeCompanies(companiesFallback.map(normalizeCompany))');

test('everything normalizeCompany reads is declared before state is built', () => {
  for (const decl of [
    'const WORKSPACE_ICON_OPTIONS = [',
    'const ICON_COLOR_DEFAULT =',
    'const WORKSPACE_ICON_PACKS = [',
    'const WORKSPACE_ICON_PACK_DEFAULT =',
  ]) {
    const at = lineOf(decl);
    assert.ok(at < stateInit, `${decl.trim()} is at line ${at}, after state is built at ${stateInit} — temporal dead zone`);
  }
});

test('the normaliser still reads exactly those tables, so this test stays honest', () => {
  // If normalizeCompany stops calling one of these, the assertion above silently becomes
  // vacuous. If it starts calling something new, this is the reminder to add it.
  const at = main.indexOf('function normalizeCompany(');
  const body = main.slice(at, main.indexOf('\n}\n', at));
  assert.match(body, /workspaceIconOption\(/);
  assert.match(body, /normalizeIconColor\(/);
  assert.match(body, /workspaceIconPack\(/);
});

test('a boot failure fails the build instead of merely printing', () => {
  // The check caught the dead-zone error on the first try and exited 0 anyway, so
  // `npm run check` reported success while shipping a blank page. Detection without a
  // non-zero exit is decoration.
  assert.match(boots, /console\.error\('Bundle failed to boot:'/);
  const at = boots.indexOf("console.error('Bundle failed to boot:'");
  assert.match(boots.slice(at, at + 400), /process\.exit\(1\)/, 'the catch must exit non-zero');
});
