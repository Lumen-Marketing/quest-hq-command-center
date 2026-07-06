import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

function actionBlock(action) {
  const marker = `if (action === '${action}')`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing action ${action}`);
  const next = source.indexOf("\n  if (action ===", start + marker.length);
  return source.slice(start, next === -1 ? start + 900 : next);
}

test('manual form save shows visible feedback instead of looking inert', () => {
  const saveBlock = actionBlock('save-form');
  assert.match(saveBlock, /saveFormsState\('Form saved',\s*\{\s*manual:\s*true\s*\}\)/);
  assert.doesNotMatch(saveBlock, /saveFormsState\('Form saved'\);\s*render\(\);/);
  assert.match(source, /function saveFormsState\(label = 'Forms saved', options = \{\}\)/);
  assert.match(source, /const manual = Boolean\(options\.manual\)/);
  assert.match(source, /showToast\(`\$\{label\} in Supabase\.`/);
  assert.match(source, /showToast\(`\$\{label\} locally\.`/);
  assert.match(source, /const formsSyncLabel = state\.sync\?\.label \|\|/);
  assert.match(source, /\$\{h\(formsSyncLabel\)\}<\/span>/);
});
