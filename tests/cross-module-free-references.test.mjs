import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The other guard compares each factory's ctx destructure against what main.js passes. It
// only sees names the module asks for. This is the other direction, and the one that has bit
// hardest: a name the module uses *without* asking for it at all.
//
// It is spelled correctly, it is defined -- in main.js -- and nothing static complains. The
// module throws a ReferenceError the first time that line runs, and because these modules are
// fetched lazily behind a "Loading" placeholder, the symptom is a screen that loads forever
// rather than an obvious crash.
//
// Shipped three times before this test existed:
//   builder-modal.js      -> appViewsModule            (dashboard card settings did nothing)
//   knowledge-page.js     -> knowledgeLoadedCompanies  (Knowledge Base loaded endlessly)
//   underwriter-page.js   -> renderUnderwriterQueueRow (the underwriter queue)

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const main = readFileSync(join(srcDir, 'main.js'), 'utf8');

// Top-level declarations only -- column zero, so nothing nested in a function counts. These
// are the names that exist in main.js's module scope and nowhere else.
const mainNames = new Set();
for (const m of main.matchAll(/^(?:async )?function ([A-Za-z_$][\w$]*)/gm)) mainNames.add(m[1]);
for (const m of main.matchAll(/^(?:const|let|var) ([A-Za-z_$][\w$]*)/gm)) mainNames.add(m[1]);

/**
 * Reduce a module to the parts a JS engine would treat as code: comments, string literals,
 * regex literals and the *text* of template literals all go, while `${...}` expressions stay.
 * Without this the check drowns in false hits from CSS class names and prose.
 */
function codeOnly(text) {
  let out = '';
  let i = 0;
  // A stack of open contexts. An 'expr' (`${ ... }`) counts its own braces, because an
  // object literal inside an interpolation would otherwise close the interpolation early
  // and let the rest of the template's markup leak out as if it were code.
  const depth = [];
  const top = () => depth[depth.length - 1];
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    const ch = text[i];

    // Template TEXT is checked before anything else. Handling quotes first meant an
    // apostrophe or an HTML attribute inside a template -- class="wb-field" -- was read as
    // the start of a string literal, which threw the scanner out of step and let the rest of
    // the markup through as if it were code.
    if (top()?.kind === 'tpl') {
      if (ch === '\\') { i += 2; continue; }
      if (two === '${') { depth.push({ kind: 'expr', braces: 0 }); i += 2; out += ' '; continue; }
      if (ch === '`') { depth.pop(); i += 1; out += ' '; continue; }
      i += 1;
      continue;
    }

    if (two === '//') { while (i < text.length && text[i] !== '\n') i += 1; continue; }
    if (two === '/*') { const end = text.indexOf('*/', i); i = end === -1 ? text.length : end + 2; continue; }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      i += 1;
      while (i < text.length && text[i] !== quote) i += text[i] === '\\' ? 2 : 1;
      i += 1;
      out += '""';
      continue;
    }
    if (ch === '`') { depth.push({ kind: 'tpl' }); i += 1; out += ' '; continue; }
    if (top()?.kind === 'expr') {
      if (ch === '{') { top().braces += 1; } else if (ch === '}') {
        if (top().braces === 0) { depth.pop(); i += 1; out += ' '; continue; }
        top().braces -= 1;
      }
    }
    // A regex literal, distinguished from division by what precedes it.
    if (ch === '/') {
      const before = out.replace(/\s+$/, '').slice(-1);
      if (!before || '(,=:[!&|?{};+-*%~^'.includes(before)) {
        i += 1;
        let inClass = false;
        while (i < text.length) {
          if (text[i] === '\\') { i += 2; continue; }
          if (text[i] === '[') inClass = true;
          else if (text[i] === ']') inClass = false;
          else if (text[i] === '/' && !inClass) { i += 1; break; }
          else if (text[i] === '\n') break;
          i += 1;
        }
        while (i < text.length && /[dgimsuvy]/.test(text[i])) i += 1;
        out += ' RE ';
        continue;
      }
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** Every name the module binds for itself: declared, imported, destructured or a parameter. */
function ownBindings(raw) {
  const own = new Set();
  const add = (chunk) => { for (const m of chunk.matchAll(/([A-Za-z_$][\w$]*)/g)) own.add(m[1]); };
  for (const m of raw.matchAll(/(?:function|class)\s+([A-Za-z_$][\w$]*)/g)) own.add(m[1]);
  for (const m of raw.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) own.add(m[1]);
  for (const m of raw.matchAll(/import[\s\S]*?from\s*['"][^'"]*['"]/g)) add(m[0]);
  for (const m of raw.matchAll(/catch\s*\(([^)]*)\)/g)) add(m[1]);
  // Destructuring patterns only -- a `{ ... } =` on the left of a declaration or assignment.
  //
  // This deliberately does NOT match `{ ... })` or `{ ... },`. An object literal passed as an
  // argument looks identical to a destructuring pattern, but its shorthand properties are
  // REFERENCES, not bindings: `render({ h, metricCard })` uses h, it does not declare it.
  // Treating those as bindings is what let ops/eod-page.js ship reaching for four names it
  // never received, leaving the EOD screen stuck on its loading placeholder. Function
  // parameters -- the other place a pattern legitimately appears -- are collected below.
  for (const m of raw.matchAll(/\{([^{}]*)\}\s*=[^=>]/g)) add(m[1]);
  // Parameter lists of every function shape in use.
  for (const m of raw.matchAll(/function\s*[\w$]*\s*\(([\s\S]*?)\)\s*\{/g)) add(m[1]);
  for (const m of raw.matchAll(/\(([^()]*)\)\s*=>/g)) add(m[1]);
  for (const m of raw.matchAll(/(?:^|[^\w$.])([A-Za-z_$][\w$]*)\s*=>/gm)) own.add(m[1]);
  return own;
}

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(join(srcDir, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) { walk(rel); continue; }
    if (entry.name.endsWith('.js') && rel !== 'main.js') files.push(rel);
  }
}(''));

test('the walk found the modules it is supposed to be checking', () => {
  assert.ok(files.length > 40, `expected the extracted modules, found ${files.length}`);
  for (const known of ['knowledge/knowledge-page.js', 'crm/underwriter-page.js', 'workspace/builder-modal.js']) {
    assert.ok(files.includes(known), `missing ${known}`);
  }
});

for (const rel of files) {
  test(`${rel}: uses no name that only exists inside main.js`, () => {
    const raw = readFileSync(join(srcDir, rel), 'utf8');
    const code = codeOnly(raw);
    const own = ownBindings(raw);
    const reached = [...mainNames]
      .filter((name) => !own.has(name))
      // Not a property access, and not a property KEY: in `{ companyLabel: x }` the name is
      // being defined, not read. Shorthand (`{ h, metricCard }`) has no colon and still counts.
      .filter((name) => new RegExp(`(?<![.\\w$])${name}(?![\\w$])(?!\\s*:)`).test(code));
    assert.deepEqual(
      reached,
      [],
      `src/${rel} reaches for ${reached.join(', ')}, which live in main.js's module scope. `
      + 'Hand them in through the factory context -- as written this throws a ReferenceError '
      + 'the first time the code runs, and a lazily-fetched screen just loads forever.',
    );
  });
}
