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

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const panel = readFileSync(join(root, 'src', 'settings', 'plugins-panel.js'), 'utf8');
const catalog = readFileSync(join(root, 'src', 'workspaces', 'plugin-catalog.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '20261002120000_calls_plugin_preset_and_backfill.sql'),
  'utf8',
);

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
    /const available = status === 'available' && !withheld;[\s\S]*\$\{available \|\| disabled \? `<button[^>]*data-status="installed"/,
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
  // 'blank' stays empty on purpose: it is somebody having chosen nothing.
  const migrationPresets = migration.slice(
    migration.indexOf('create or replace function app_private.plugin_ids_for_preset'),
  );
  assert.match(migrationPresets, /when 'blank' then array\[\]::text\[\]/, 'blank stays blank');
});

test('the backfill never overwrites a decision somebody already made', () => {
  // A 'disabled' row is the whole reason the status column exists. A blanket insert would
  // silently re-enable a module Quest deliberately turned off.
  const inserts = migration.slice(
    migration.indexOf('insert into public.company_plugins'),
    migration.lastIndexOf('-- Companies already carrying a deliberate row'),
  );
  assert.match(inserts, /not exists \([\s\S]*existing\.plugin_id = 'calls'/, 'never clobbers an existing row');
  assert.match(inserts, /having count\(\*\) = 3;/, 'roofing needs all three siblings');
  assert.match(inserts, /having count\(\*\) = 6;/, 'construction needs all six siblings');
  assert.doesNotMatch(inserts, /on conflict[\s\S]*do update/i, 'no upsert: insert only where absent');
});

test('the preset function is reproduced from the deployed definition, not an earlier one', () => {
  // Nine migrations have replaced this function. Copying an early literal one would silently roll
  // the definition back -- which is how a stale-copy insert once broke every Office upload.
  const latest = readFileSync(
    join(root, 'supabase', 'migrations', '20260812140000_baseline_workspace_builder_plugin.sql'),
    'utf8',
  );
  const deployed = latest.slice(
    latest.indexOf('create or replace function app_private.plugin_ids_for_preset'),
    latest.indexOf('-- create_operational_workspace installs the intersection'),
  );
  const mine = migration.slice(
    migration.indexOf('create or replace function app_private.plugin_ids_for_preset'),
    migration.indexOf('-- 2. Existing companies'),
  );
  // Baseline composition and the search_path hardening must survive.
  assert.match(mine, /app_private\.baseline_plugin_ids\(\) \|\|/);
  assert.match(mine, /set search_path to ''/, 'the hardened search_path survives');
  assert.match(deployed, /app_private\.baseline_plugin_ids\(\) \|\|/, 'the deployed copy composes a baseline too');
  // The only difference is the added 'calls' entries.
  const strip = (s) => s.replace(/'calls', ?/g, '').replace(/, 'calls'/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(strip(mine), strip(deployed), 'identical to the deployed copy once calls is removed');
});

test('calls is already a legal plugin id, so this needs no allowlist change', () => {
  const ringcentral = readFileSync(
    join(root, 'supabase', 'migrations', '202607231200_ringcentral_calls.sql'),
    'utf8',
  );
  assert.match(ringcentral, /add constraint company_plugins_known_plugin_check check \([\s\S]*'calls'/);
});
