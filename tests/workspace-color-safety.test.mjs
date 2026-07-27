import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { safeHexColor, sanitizeColorConfig } from '../src/security/color.js';

const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('safeHexColor accepts CSS hex colors and rejects injected style text', () => {
  assert.equal(safeHexColor('#f0b23b', '#64748b'), '#f0b23b');
  assert.equal(safeHexColor('#ABC', '#64748b'), '#ABC');
  assert.equal(safeHexColor('red; background:url(javascript:alert(1))', '#64748b'), '#64748b');
  assert.equal(safeHexColor('url(https://attacker.invalid/pixel)', '#64748b'), '#64748b');
});

test('sanitizeColorConfig removes unsafe nested colors without mutating the input', () => {
  const config = {
    color: 'expression(alert(1))',
    options: [
      { id: 'safe', label: 'Safe', color: '#16a34a' },
      { id: 'unsafe', label: 'Unsafe', color: 'red;--x:url(https://attacker.invalid)' },
    ],
    stops: [{ value: 10, color: '#0ea5e9' }, { value: 20, color: 'var(--stolen)' }],
  };

  const cleaned = sanitizeColorConfig(config, '#64748b');

  assert.equal(cleaned.color, '#64748b');
  assert.equal(cleaned.options[0].color, '#16a34a');
  assert.equal(cleaned.options[1].color, '#64748b');
  assert.equal(cleaned.stops[0].color, '#0ea5e9');
  assert.equal(cleaned.stops[1].color, '#64748b');
  assert.equal(config.options[1].color, 'red;--x:url(https://attacker.invalid)');
});

test('workspace documents and imported apps pass persisted colors through the sanitizer', () => {
  assert.match(mainSource, /import\s+\{\s*safeHexColor,\s*sanitizeColorConfig\s*\}\s+from\s+'\.\/security\/color\.js'/);
  assert.match(mainSource, /color:\s*safeHexColor\(ws\.color/);
  assert.match(mainSource, /color:\s*safeHexColor\(app\.color/);
  assert.match(mainSource, /config:\s*sanitizeColorConfig\(/);
  assert.match(mainSource, /color:\s*safeHexColor\(src\.color/);
});
