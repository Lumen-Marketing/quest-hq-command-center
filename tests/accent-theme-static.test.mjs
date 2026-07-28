import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

// The accent theme works by swapping ONE variable: [data-accent] blocks reassign
// --orange, and everything tinted is expected to derive from it. A literal orange
// anywhere in that chain silently pins the component to Quest orange while the rest
// of the app turns blue/green/slate — the class of bug these tests exist to catch.
const LITERAL_ACCENT = /#e66a1f|#ed4e0d|#ED4E0D|#d8480b|#dc3f09|#d94309|#c23a06|#fdecd8|#fff7ed|#fff3e6|rgba\(\s*23[07],\s*(78|106)|rgba\(\s*244,\s*93/;

function ruleFor(selector) {
  const at = styles.indexOf(selector);
  assert.notEqual(at, -1, `expected to find the rule "${selector}"`);
  const open = styles.indexOf('{', at);
  return styles.slice(open, styles.indexOf('}', open) + 1);
}

// `var(--accent, #ED4E0D)` is a fallback for a token that is always defined — it
// never paints, so it is not a pinned colour. Only literals that actually render
// count as violations.
function withoutVarFallbacks(rule) {
  return rule.replace(/var\(\s*--[\w-]+\s*,[^()]*\)/g, 'var(--token)');
}

test('the accent-soft tokens derive from --orange rather than a literal', () => {
  // Defined twice: the base :root and a later "fidelity" :root that used to win the
  // cascade with a hardcoded rgba, freezing every accent-soft surface at orange.
  const declarations = [...styles.matchAll(/--accent-soft(-border)?:\s*([^;]+);/g)].map((m) => m[2]);
  assert.ok(declarations.length >= 2, 'expected --accent-soft to be declared');
  for (const value of declarations) {
    assert.match(value, /var\(--orange\)/, `--accent-soft must follow --orange, got: ${value}`);
  }
});

test('the focus ring follows the accent', () => {
  const ring = styles.match(/--ring:\s*([^;]+);/)[1];
  assert.match(ring, /var\(--orange\)/, `--ring must follow --orange, got: ${ring}`);
});

test('global input focus rules tint from a token, not a literal', () => {
  // A hardcoded halo here painted orange inside every accent-coloured control —
  // most visibly as a second ring nested in the company search box.
  const rules = [...styles.matchAll(/input:focus,\s*\n\s*select:focus,\s*\n\s*textarea:focus\s*\{[^}]*\}/g)]
    .map((match) => match[0]);
  assert.ok(rules.length >= 2, `expected the global input:focus rules, found ${rules.length}`);
  for (const rule of rules) {
    assert.doesNotMatch(withoutVarFallbacks(rule), LITERAL_ACCENT, `global input focus must not hardcode an accent colour: ${rule}`);
    assert.match(rule, /var\(--(ring|orange|amber|accent)\)|color-mix/, `global input focus must tint from a token: ${rule}`);
  }
});

test('primary buttons keep the accent on hover', () => {
  // The base colour already used var(--orange); only the :hover shade was a literal,
  // so a green primary button turned orange the instant the pointer touched it.
  for (const selector of ['.btn.btn-primary:hover', '.btn-primary:hover,']) {
    const rule = withoutVarFallbacks(ruleFor(selector));
    assert.doesNotMatch(rule, LITERAL_ACCENT, `${selector} must not hardcode an accent colour: ${rule}`);
    assert.match(rule, /var\(--orange\)/, `${selector} must derive its hover shade from --orange`);
  }
});

test('workspace rail, directory and switcher highlights follow the accent', () => {
  const selectors = [
    '.workspace-rail-item.active',
    '.workspace-rail-check',
    '.workspace-menu-option:hover,',
    '.operational-workspace-row:hover,',
    '.operational-workspace-row .ows-tag.default',
  ];
  for (const selector of selectors) {
    const rule = withoutVarFallbacks(ruleFor(selector));
    assert.doesNotMatch(rule, LITERAL_ACCENT, `${selector} must not hardcode an accent colour: ${rule}`);
  }
});

test('scoped accent tokens in the messaging, chat and quote-builder subsystems follow --orange', () => {
  for (const token of ['--msg-accent', '--chat-orange', '--qb-orange']) {
    const value = styles.match(new RegExp(`${token}:\\s*([^;]+);`))[1];
    assert.match(value, /var\(--orange\)/, `${token} must follow --orange, got: ${value}`);
  }
});
