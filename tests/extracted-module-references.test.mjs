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

// Line comments go FIRST. A `//` comment mentioning a path like /api/* contains the two
// characters `/*`, which opened a fake block comment that ran to the next real `*/` and hid
// ninety thousand characters of main.js from every check below -- including the declarations
// this file exists to find, which is how it came to report a function as missing that was
// sitting in plain sight.
const stripComments = (text) => text.replace(/^\s*\/\/[^\n]*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

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
  // …or straight into a function parameter, which is how the support controller takes its
  // context: `export function createSupportController({ state, CONFIG, … })`.
  for (const m of code.matchAll(/function\s+[A-Za-z_$][\w$]*\s*\(\s*\{([^}]+)\}/g)) addAll(m[1]);
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

test('no extracted module uses a binding nobody handed it', () => {
  // How the signed-out landing page broke: it was moved into its own factory still
  // referencing `questbaseInteriorJobsUrl`, an image import that stayed behind in main.js
  // and was never added to the ctx. Nothing failed at build time -- the module only threw
  // when it ran, part-way through painting, leaving the loading spinner on screen with the
  // error swallowed. Anyone signed out got a permanent spinner.
  //
  // Scoped to names main.js imports or declares as top-level constants, because those are
  // exactly what a lifted function keeps reaching for after the lift.
  const mainImports = importedInto(main);
  const mainConsts = new Set([...stripComments(main).matchAll(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map((m) => m[1]));
  // Module-level `let`s too. These are the lazy-module holders -- appViewsModule,
  // savedViewsModule, memoRuntime -- and they are exactly what a lifted function keeps
  // reaching for. builder-modal.js referenced main.js's `appViewsModule` directly: spelled
  // correctly, looked defined, threw a ReferenceError the moment anyone opened a dashboard
  // card's settings, and this check walked straight past it because the name is lowercase.
  const mainLets = new Set([...stripComments(main).matchAll(/^let\s+([a-zA-Z_$][\w$]*)\s*=/gm)].map((m) => m[1]));
  const candidates = new Set([...mainImports, ...mainConsts, ...mainLets]);

  const orphans = [];
  for (const file of moduleFiles) {
    const text = readFileSync(file, 'utf8');
    const rel = file.slice(srcDir.length).replace(/\\/g, '/');
    const code = stripComments(text);
    const own = new Set([...declaredIn(text), ...importedInto(text)]);
    const used = new Set([...code.matchAll(/(?:^|[^\w$.'"`])([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
    for (const name of used) {
      if (!candidates.has(name) || own.has(name)) continue;
      orphans.push(`${rel} uses ${name}, which main.js owns but never passes it`);
    }
  }
  assert.deepEqual(orphans, [], orphans.join('\n'));
});

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

// A module that takes a context object is the other half of the same problem: main.js can
// omit a key the module destructures, and nothing static notices because every name is
// spelled correctly and looks defined. It throws the first time a user clicks the thing.
//
// This shipped twice — the Master panel (state, filteredPlatformBackupCopies,
// renderPlatformBackupCopyRow) and the print/CSV module (clone, downloadText, guardUpload,
// activeSession). Both context lists were written by hand from the code being moved.
//
// This compares every factory's destructure against what main.js actually passes.

const FACTORY_MODULES = [
  ['src/platform/master-panel.js', 'createPlatformPanel'],
  ['src/workspace/data-io.js', 'createDataIO'],
  ['src/workspace/field-config-ui.js', 'renderFieldConfig'],
  ['src/ui/appearance-panel.js', 'createAppearancePanel'],
  ['src/workspace/automations-ui.js', 'createAutomationsUI'],
  ['src/messaging/chat-modals.js', 'createChatModals'],
  ['src/messaging/dock-fields.js', 'createDockFields'],
  ['src/crm/job-record.js', 'createJobRecord'],
  ['src/jobs/dashboard-view.js', 'createJobsDashboard'],
  ['src/crm/deal-board.js', 'createDealBoard'],
  ['src/crm/contacts-io.js', 'createContactsIo'],
  ['src/crm/contact-editor.js', 'createContactEditor'],
  ['src/jobs/job-file.js', 'createJobFile'],
  ['src/jobs/job-list.js', 'createJobList'],
  ['src/jobs/job-calendar.js', 'createJobCalendar'],
  ['src/jobs/change-order-wizard.js', 'createChangeOrderWizard'],
  ['src/workspace/memo-runtime.js', 'createMemoRuntime'],
  ['src/jobs/voice-note.js', 'createJobWalk'],
  ['src/jobs/job-expense.js', 'createJobExpense'],
  ['src/crm/deal-detail.js', 'createDealDetail'],
  ['src/crm/underwriter-page.js', 'createUnderwriterPage'],
  ['src/knowledge/knowledge-page.js', 'createKnowledgePage'],
  ['src/settings/backups-panel.js', 'createBackupsPanel'],
  ['src/settings/plugins-panel.js', 'createPluginsPanel'],
  ['src/settings/workspace-settings.js', 'createWorkspaceSettings'],
  ['src/portals/client-portals-page.js', 'createClientPortalsPage'],
  ['src/forms/forms-page.js', 'createFormsPage'],
  ['src/ops/price-book-page.js', 'createPriceBookPage'],
  ['src/team/access-row.js', 'createAccessRow'],
  ['src/team/workload-page.js', 'createTeamWorkloadPage'],
  ['src/ops/eod-page.js', 'createEodPage'],
  ['src/ops/calls-page.js', 'createCallsPage'],
  ['src/workspace/app-views.js', 'createAppViews'],
  ['src/ops/workday-page.js', 'createWorkdayPage'],
  ['src/proposals/public-page.js', 'createProposalPublicPage'],
  ['src/portals/public-page.js', 'createClientPortalPublicPage'],
  ['src/crm/contact-table.js', 'createContactTable'],
  ['src/home/widget-registry.js', 'createWidgetRegistry'],
  ['src/workspace/record-page.js', 'createRecordPage'],
  ['src/workspace/builder-modal.js', 'createBuilderModal'],
  ['src/ui/landing-page.js', 'createLandingPage'],
  ['src/ui/auth-form.js', 'createAuthForm'],
];

test('the list above covers every factory module there is', () => {
  // Hand-maintained lists rot. This is the check that the rot gets noticed: any module
  // exporting a create*/render* factory that takes a ctx has to be in FACTORY_MODULES.
  const listed = new Set(FACTORY_MODULES.map(([file]) => file));
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(srcDir, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) { walk(rel); continue; }
      if (!entry.name.endsWith('.js')) continue;
      const text = readFileSync(join(srcDir, rel), 'utf8');
      if (/export function \w+\(ctx\)[\s\S]{0,200}const \{/.test(text)) found.push(`src/${rel}`);
    }
  };
  walk('');
  for (const file of found) assert.ok(listed.has(file), `${file} takes a ctx but is not in FACTORY_MODULES`);
});

for (const [file, factory] of FACTORY_MODULES) {
  test(`${file.split('/').pop()}: main.js passes every key it destructures`, () => {
    const module = readFileSync(join(srcDir, file.replace(/^src\//, '')), 'utf8').replace(/\r\n/g, '\n');
    const at = module.indexOf(`function ${factory}`);
    assert.notEqual(at, -1, `${factory} should exist in ${file}`);
    const open = module.indexOf('const {', at);
    const close = module.indexOf('} = ctx;', open);
    assert.ok(open !== -1 && close !== -1, `${factory} should destructure from ctx`);

    const wanted = [...module.slice(open, close).matchAll(/([A-Za-z_$][\w$]*)\s*,/g)].map((m) => m[1]);
    assert.ok(wanted.length > 3, `expected a context list, parsed ${wanted.length}`);

    // The call site in main.js. The context is not always the first argument —
    // renderFieldConfig takes (fd, app, ctx) — so this finds the call, then the object
    // literal inside it, and reads to that object's closing brace.
    const callAt = main.indexOf(`${factory}(`);
    assert.notEqual(callAt, -1, `main.js should call ${factory}`);
    const objectAt = main.indexOf('{', callAt);
    assert.notEqual(objectAt, -1, `${factory} should be passed an object`);
    let depth = 0;
    let end = objectAt;
    for (; end < main.length; end += 1) {
      if (main[end] === '{') depth += 1;
      else if (main[end] === '}' && (depth -= 1) === 0) break;
    }
    const passed = main.slice(objectAt, end + 1);

    const missing = wanted.filter((key) => !new RegExp(`\\b${key}\\b`).test(passed));
    assert.deepEqual(
      missing,
      [],
      `${file} destructures ${missing.join(', ')} but main.js never passes ${missing.length === 1 ? 'it' : 'them'} — `
      + 'these throw a ReferenceError the first time the feature is used',
    );
  });
}

test('the dashboard card dialogs are handed in, not reached across modules', () => {
  // builder-modal.js read main.js's `appViewsModule` directly. The name is spelled correctly
  // and looks defined, so nothing static caught it -- but it is a different module, so
  // opening a dashboard card's settings threw a ReferenceError and the dialog never appeared.
  const modal = readFileSync(join(srcDir, 'workspace', 'builder-modal.js'), 'utf8');
  assert.ok(!/appViewsModule/.test(modal), 'it must not reach for main.js internals');
  assert.match(modal, /return renderDashModal\(m\);/);
  assert.match(main, /wbWorkspaceApps, renderDashModal, state,/, 'and main.js must pass it');
});

test('lazily-loaded module holders are reached through a getter, not captured', () => {
  // The holder is null until its fetch resolves, so handing over the value would capture null
  // for the life of the app. eod-page.js and data-io.js both take a function.
  assert.match(main, /eodBody: \(\) => eodPageModule,/);
  assert.match(main, /loadedReports: \(\) => wbReportsModule,/);
  const eod = readFileSync(join(srcDir, 'ops', 'eod-page.js'), 'utf8');
  const io = readFileSync(join(srcDir, 'workspace', 'data-io.js'), 'utf8');
  assert.ok(!/eodPageModule/.test(eod), 'eod-page must not reach across');
  assert.ok(!/wbReportsModule/.test(io), 'data-io must not reach across');
});
