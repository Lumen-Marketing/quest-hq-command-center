import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

// Extracting code out of main.js has one failure mode that neither the build nor the rest
// of the suite catches: a function moves into a module, but something in main.js still
// calls it by its bare name. The bundler is happy — the name simply resolves to nothing —
// and the app throws at render, which is a stuck loading screen with no failing test.
//
// That happened with renderAccountThemeControls, which the account popover renders on
// first paint. It shipped an endless "Loading workspace data…".
//
// The general "undefined identifier" lint is far too noisy on a 41,000-line file full of
// template literals (`rgba(`, `translate(`, prose). This checks the precise thing instead:
// a name DEFINED in one of our modules and CALLED in main.js must also be defined in
// main.js, or be reached through the module object.

const srcDir = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const main = readFileSync(join(srcDir, 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const full = join(dir, entry);
  if (statSync(full).isDirectory()) return walk(full);
  return full.endsWith('.js') ? [full] : [];
});

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*$/gm, '');

const declaredIn = (text) => {
  const names = new Set();
  const code = stripComments(text);
  for (const m of code.matchAll(/(?:^|\n)\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of code.matchAll(/(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  // Functions nested inside a factory, which is how the extracted panels are shaped.
  for (const m of code.matchAll(/\n\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  // Destructured bindings, which is how a dynamically imported module gets unpacked —
  // either into a declaration:
  //   const { mergeBuilderDocs, describeConflicts } = await import('./…')
  // or straight into a callback parameter:
  //   import('./…').then(({ createDraftStore, createFormDraftManager }) => …)
  const addAll = (list) => {
    for (const part of list.split(',')) {
      const name = part.trim().split(':').pop().trim().replace(/\s*=.*$/, '');
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  };
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]+)\}\s*=/g)) addAll(m[1]);
  for (const m of code.matchAll(/\(\s*\{([^}]+)\}\s*\)\s*=>/g)) addAll(m[1]);
  return names;
};

// A statically imported name is defined for main.js's purposes — that is the whole point
// of an import, and most of src/ is reached that way.
const importedInto = (text) => {
  const names = new Set();
  for (const m of text.matchAll(/import\s*\{([^}]+)\}\s*from/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    }
  }
  for (const m of text.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from/g)) names.add(m[1]);
  return names;
};

const moduleFiles = walk(srcDir).filter((f) => !f.endsWith(`${'main'}.js`));
const mainDeclares = new Set([...declaredIn(main), ...importedInto(main)]);

test('every module function called from main.js is also defined there', () => {
  // Names main.js calls directly: `foo(` not preceded by a dot.
  const called = new Set([...stripComments(main).matchAll(/(?:^|[^\w$.])([a-zA-Z_$][\w$]*)\s*\(/g)].map((m) => m[1]));

  const orphans = [];
  for (const file of moduleFiles) {
    const rel = file.slice(srcDir.length).replace(/\\/g, '/');
    for (const name of declaredIn(readFileSync(file, 'utf8'))) {
      // Only interesting for names main.js actually calls and no longer declares.
      if (!called.has(name) || mainDeclares.has(name)) continue;
      orphans.push(`${name}() is defined in ${rel} but called in main.js, which no longer defines it`);
    }
  }
  assert.deepEqual(orphans, [], orphans.join('\n'));
});

test('the delegators that stand in for lazily-loaded code all exist', () => {
  // Each of these is the eager stub main.js keeps after moving a body into a chunk.
  // Losing one is the same bug in a different disguise.
  for (const name of ['wbFieldConfigUI', 'wbRenderFieldInput', 'renderAppearanceControls', 'wbViewReports', 'wbRenderItemsBoard']) {
    assert.match(main, new RegExp(`function ${name}\\(`), `${name} needs a delegator in main.js`);
  }
});

test('what the account popover paints stays out of the settings-only chunk', () => {
  // The popover is part of the app chrome, so anything it renders has to be eager.
  assert.match(main, /function renderAccountThemeControls\(\)/);
  const panel = readFileSync(join(srcDir, 'ui', 'appearance-panel.js'), 'utf8');
  assert.ok(!/function renderAccountThemeControls\(/.test(panel), 'it must not move back into the chunk');
  // The panel embeds it, so it is handed in rather than imported back from main.js.
  assert.match(panel, /renderAccountThemeControls,/);
});
