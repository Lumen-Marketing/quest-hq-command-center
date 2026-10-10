import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "why calls module can't be installed in roofing company"
//
// The card said Available and offered a bright Activate button. Clicking it answered "This
// company account is not entitled to that plugin." Two pieces of code disagreed about what
// company entitlement means, and 'calls' was in no preset, so the disagreement was reachable by
// anyone creating a company and going to Settings -> Plugins.
//
// SCOPE: the browser half only. The database migration that backfills existing companies needs
// production access to apply and a refreshed .ai/database/snapshot.json to satisfy
// npm run tenancy:check, so it ships separately. Its assertions live in
// tests/calls-plugin-backfill-migration.test.mjs, which arrives with it.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const panel = readFileSync(join(root, 'src', 'settings', 'plugins-panel.js'), 'utf8');
const catalog = readFileSync(join(root, 'src', 'workspaces', 'plugin-catalog.js'), 'utf8');

const cardBody = panel.slice(
  panel.indexOf('function renderPluginCard('),
  panel.indexOf('return { renderPluginsSettings }'),
);

test('a card is not offered an Activate it will be refused', () => {
  // The handler's rule, verbatim: only 'installed' permits an install.
  const handler = main.slice(
    main.indexOf('async function setWorkspacePlugin('),
    main.indexOf('async function applyWorkspacePluginPreset('),
  );
  assert.match(
    handler,
    /nextStatus === 'installed' && companyPluginStatus\(workspace\.company_id, plugin\.id\) !== 'installed'/,
    'the handler refuses anything not already installed',
  );

  // The card has to agree. It used to check `entitlement === 'disabled'`, which left a MISSING
  // row looking like an open invitation.
  assert.match(cardBody, /const withheld = !entitled;/, 'withheld means not installed, not merely disabled');
  assert.doesNotMatch(cardBody, /const withheld = entitlement === 'disabled';/);
  assert.match(cardBody, /const available = status === 'available' && !withheld;/);
  assert.match(cardBody, /const unavailable = status === 'available' && withheld;/);
});

test('the two Withheld messages say which of the two situations this is', () => {
  // 'disabled' is a decision somebody made. A missing row is nobody having decided yet. Telling
  // a company to ask for something that was simply never enabled reads as a support ticket.
  assert.match(cardBody, /entitlement === 'disabled' \? 'Turned off for your company by Quest\.' : 'Not yet enabled for your company\./);
  assert.match(cardBody, /entitlement === 'disabled' \? 'Turned off by Quest' : 'Not enabled yet'/);
});

test('a workspace that switched its own plugin off can still turn it back on', () => {
  // `disabled` at the WORKSPACE level is a company switching its own module off, and the row
  // exists saying so. That must stay a working Re-enable, so the button is keyed on workspace
  // status as well as entitlement.
  assert.match(
    cardBody,
    /const available = status === 'available' && !withheld;[\s\S]*\$\{canManagePlugins && \(available \|\| disabled\) \? `<button[^>]*data-status="installed"/,
    'Re-enable is offered for a workspace-level disable',
  );
});

test('calls is in every preset, so a new company is entitled from the start', () => {
  // This is what made the case reachable. 'calls' reached the catalog and the database
  // allowlist without ever reaching a preset.
  const presets = catalog.slice(
    catalog.indexOf('export const WORKSPACE_PLUGIN_PRESETS'),
    catalog.indexOf('export const WORKSPACE_PLUGIN_PRESET_LABELS'),
  );
  for (const preset of ['roofing', 'construction']) {
    const line = presets.split('\n').find((l) => l.trim().startsWith(`${preset}:`));
    assert.ok(line, `${preset} preset should be there`);
    assert.match(line, /'calls'/, `${preset} preset should entitle calls`);
  }
  // The generic preset carries it too.
  assert.match(presets, /generic:.*'calls'/, 'the generic preset should entitle calls');
});

test('calls is already a legal plugin id, so this needs no allowlist change', () => {
  // Which is also why no migration is required for THIS change: the plugin is already known to
  // the database. Only the preset rows were missing, and those are written client-side above.
  const ringcentral = readFileSync(
    join(root, 'supabase', 'migrations', '202607231200_ringcentral_calls.sql'),
    'utf8',
  );
  assert.match(ringcentral, /add constraint company_plugins_known_plugin_check check \([\s\S]*'calls'/);
});

test('the catalog and the database allowlist agree on the plugin id', () => {
  // The client's preset and the database's allowlist have to name the same string, or a company
  // seeded by one side and read by the other silently disagrees about what it is entitled to.
  assert.match(catalog, /\{ id: 'calls', label: 'Calls'/);
  assert.match(catalog, /module_ids: \['calls'\]/);
});