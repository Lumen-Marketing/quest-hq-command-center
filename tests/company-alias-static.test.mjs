import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

// Rebuild canonicalCompanyId in isolation so the alias rule can be exercised directly.
const from = source.indexOf('const LEGACY_COMPANY_ALIASES');
const at = source.indexOf('\nfunction canonicalCompanyId(id) {');
const code = source.slice(from, source.indexOf('\n}', at) + 2);
const canonical = new Function('state', 'id', `${code}\nreturn canonicalCompanyId(id);`);

// Naming a company "Quest Roofing" slugs it to `quest-roofing`. A blanket alias rewrote
// every reference to the seeded demo `roofing` company, so the real workspace silently
// vanished — which is why it had to be created as `quest-roofing-az` as a workaround.
test('a real company keeps its own id even when it matches a legacy alias', () => {
  assert.equal(canonical({ companies: [{ id: 'quest-roofing' }] }, 'quest-roofing'), 'quest-roofing');
});

test('the alias still resolves old links when no real company owns the id', () => {
  assert.equal(canonical({ companies: [{ id: 'roofing' }] }, 'quest-roofing'), 'roofing');
  assert.equal(canonical({ companies: [] }, 'quest-drafting'), 'drafting');
});

test('ids with no alias pass through untouched', () => {
  assert.equal(canonical({ companies: [{ id: 'lumen' }] }, 'lumen'), 'lumen');
  assert.equal(canonical({ companies: [] }, 'quest-roofing-az'), 'quest-roofing-az');
  assert.equal(canonical({ companies: [] }, '  spaced  '), 'spaced');
  assert.equal(canonical({ companies: [] }, ''), '');
});

test('it survives being called before state exists', () => {
  // The module-load seed calls this from inside the `const state = {...}` initializer, so
  // `state` is in its temporal dead zone; even `state?.` would throw there.
  const duringTdz = new Function(`${code}\nconst result = canonicalCompanyId('quest-roofing');\nconst state = { companies: [] };\nreturn result;`);
  assert.equal(duringTdz(), 'roofing');
  assert.match(code, /try \{ companies = Array\.isArray\(state\.companies\)/);
});
