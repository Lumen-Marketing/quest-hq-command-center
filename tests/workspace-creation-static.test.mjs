import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const tablerIconsCss = readFileSync(new URL('../taskmanagement/vendor/tabler-icons/tabler-icons.min.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202606251230_idempotent_workspace_creation.sql', import.meta.url), 'utf8');
const quotaMigrationUrl = new URL('../supabase/migrations/202606260900_workspace_quota_icons.sql', import.meta.url);
const quotaMigration = existsSync(quotaMigrationUrl) ? readFileSync(quotaMigrationUrl, 'utf8') : '';
const iconExpansionMigrationUrl = new URL('../supabase/migrations/202606261130_workspace_icon_expansion.sql', import.meta.url);
const iconExpansionMigration = existsSync(iconExpansionMigrationUrl) ? readFileSync(iconExpansionMigrationUrl, 'utf8') : '';

test('no-company workspace creation shows progress and errors', () => {
  assert.match(source, /const busy = \/creating\|joining\|opening\/i\.test\(state\.authMessage \|\| ''\);/);
  assert.match(source, /Creating workspace\.\.\./);
  assert.match(source, /state\.loginError \? `<div class="form-message error">/);
  assert.match(source, /createWorkspaceForCurrentUser\(event\.target\)\.catch/);
});

test('workspace creation applies optimistic active membership state', () => {
  assert.match(source, /function applyCreatedWorkspace\(workspaceId, requestedName = '', iconKey = 'home'\)/);
  assert.match(source, /state\.memberships = state\.memberships/);
  assert.match(source, /role: 'owner'/);
  assert.match(source, /status: 'active'/);
  assert.match(source, /state\.session = \{ \.\.\.activeSession\(\), profile \};/);
  assert.match(source, /writeJson\(SESSION_KEY, state\.session\);/);
});

test('supabase access survives noncritical full-data load fallback', () => {
  assert.match(source, /function safeSupabaseQuery\(query\)/);
  assert.match(source, /return Promise\.resolve\(query\)\.catch\(\(error\) => \(\{ error \}\)\);/);
  assert.match(source, /async function loadSupabaseBootstrapData\(\)/);
  assert.match(source, /safeSupabaseQuery\(client\.from\('company_memberships'\)\.select\('\*'\)\.eq\('profile_id', profile\.id\)\)/);
  assert.match(source, /safeSupabaseQuery\(client\.rpc\('is_platform_admin'\)\)/);
  assert.match(source, /safeSupabaseQuery\(client\.rpc\('list_platform_companies'\)\)/);
  assert.doesNotMatch(source, /client\.rpc\([^;\n]+\.catch\(\(error\) => \(\{ error \}\)\)/);
  assert.match(source, /const trustedProfileCompany = \(profile\.company_ids \|\| \[\]\)\.map\(canonicalCompanyId\)\.includes/);
  assert.match(source, /trustedProfileCompany && \['owner', 'admin', 'developer'\]\.includes/);
});

test('same-user supabase auth events do not force full workspace reloads', () => {
  assert.match(source, /function shouldReloadWorkspaceForSession\(previousSession, nextSession\)/);
  assert.match(source, /previousSession\?\.user\?\.id !== nextSession\?\.user\?\.id/);
  assert.match(source, /JSON\.stringify\(previousSession\?\.profile\?\.company_ids \|\| \[\]\) !== JSON\.stringify\(nextSession\?\.profile\?\.company_ids \|\| \[\]\)/);
  assert.match(source, /const shouldReloadWorkspace = shouldReloadWorkspaceForSession\(state\.session, nextSession\);/);
  assert.match(source, /if \(shouldReloadWorkspace\) \{\s*resetLiveWorkspaceData\(\);\s*state\.dataLoaded = false;\s*\}/);
  assert.doesNotMatch(source, /onAuthStateChange\(\(_event, session\) => \{\s*setSupabaseSession\(session \|\| null\)\.finally\(\(\) => \{\s*state\.dataLoaded = false;/);
});

test('workspace quota migration supersedes one-workspace idempotency', () => {
  assert.ok(quotaMigration, 'Expected workspace quota/icon migration');
  assert.match(quotaMigration, /drop function if exists public\.create_company_workspace\(text\);/);
  assert.match(quotaMigration, /drop function if exists public\.create_company_workspace\(text, text\);/);
  assert.doesNotMatch(quotaMigration, /if existing_company_id is not null then\s+return existing_company_id;/);
  assert.match(migration, /if existing_company_id is not null then\s+return existing_company_id;/);
});

test('workspace creation allows three self-owned workspaces and platform owner overrides', () => {
  assert.match(source, /const WORKSPACE_SELF_CREATE_LIMIT = 3;/);
  assert.match(source, /function ownedWorkspaceCount\(profileId = activeSession\(\)\.profile\.id\)/);
  assert.match(source, /function canCreateAnotherWorkspace\(\)/);
  assert.match(source, /isQuestDeveloper\(\) \|\| ownedWorkspaceCount\(\) < WORKSPACE_SELF_CREATE_LIMIT/);
  assert.match(source, /workspaceLimitMessage\(\)/);
  assert.match(source, /client\.rpc\('create_company_workspace', \{ company_name: companyName, preset_code: presetCode, icon_key: iconKey \}\)/);
  assert.match(source, /data-platform-workspace-create-form/);
  assert.match(source, /owner_email/);
  assert.match(source, /client\.rpc\('create_company_workspace', \{ company_name: companyName, preset_code: presetCode, icon_key: iconKey, owner_email: ownerEmail \}\)/);
  assert.ok(quotaMigration, 'Expected workspace quota/icon migration');
  assert.match(quotaMigration, /create or replace function public\.create_company_workspace\(\s*company_name text,\s*preset_code text default 'generic',\s*icon_key text default 'home',\s*owner_email text default null\s*\)/);
  assert.match(quotaMigration, /owned_workspace_count integer := 0;/);
  assert.match(quotaMigration, /if not creator_is_platform_admin and owned_workspace_count >= 3 then\s+raise exception 'Workspace limit reached'/);
  assert.match(quotaMigration, /if clean_owner_email <> '' and not creator_is_platform_admin then\s+raise exception 'Platform admin access required to create for another owner'/);
  assert.match(quotaMigration, /drop function if exists public\.create_company_workspace\(text, text\);/);
  assert.match(quotaMigration, /grant execute on function public\.create_company_workspace\(text, text, text, text\) to authenticated;/);
});

test('workspace settings can rename and change one of many filled icons', () => {
  const iconEntryCount = (source.match(/\{ key: '[^']+', icon: 'ti-[^']+', label: '[^']+' \}/g) || []).length;
  assert.ok(iconEntryCount >= 45, `expected at least 45 workspace icon choices, got ${iconEntryCount}`);
  assert.match(source, /const WORKSPACE_ICON_OPTIONS = \[/);
  assert.match(source, /icon: 'ti-home-filled'/);
  assert.match(source, /icon: 'ti-settings-filled'/);
  assert.match(source, /icon: 'ti-building-broadcast-tower-filled'/);
  const workspaceIconBlock = source.match(/const WORKSPACE_ICON_OPTIONS = \[[\s\S]*?\];/)?.[0] || '';
  const workspaceIconClasses = [...workspaceIconBlock.matchAll(/icon: '(ti-[^']+)'/g)].map((match) => match[1]);
  const missingIconClasses = workspaceIconClasses.filter((iconClass) => !tablerIconsCss.includes(`.${iconClass}:before`));
  assert.deepEqual(missingIconClasses, [], `workspace icons missing from bundled Tabler CSS: ${missingIconClasses.join(', ')}`);
  assert.match(source, /function workspaceIconOption\(key\)/);
  assert.match(source, /function workspaceIconMarkup\(companyOrId, className = ''\)/);
  assert.match(source, /icon_key: workspaceIconOption\(input\.icon_key\)\.key/);
  assert.match(source, /renderWorkspaceSettings\(companyId\)/);
  assert.match(source, /data-workspace-settings-form/);
  assert.match(source, /name="icon_key"/);
  assert.match(source, /data-workspace-icon-choice/);
  assert.match(source, /async function saveWorkspaceSettings\(formNode\)/);
  assert.match(source, /client\.rpc\('update_company_workspace'/);
  assert.match(styles, /\.workspace-icon i::before,\s*\.workspace-icon-choice i::before\s*\{/);
  assert.match(styles, /\.workspace-icon\s*\{[\s\S]*position: relative;/);
  assert.match(styles, /\.workspace-icon i\s*\{[\s\S]*position: absolute;[\s\S]*transform: translate\(-50%, -50%\);/);
  assert.match(styles, /\.workspace-menu-option\s*\{[\s\S]*grid-template-columns: 42px minmax\(0, 1fr\) 18px;/);
  assert.match(styles, /justify-content: center;/);
  assert.match(styles, /text-align: center;/);
  assert.ok(quotaMigration, 'Expected workspace quota/icon migration');
  assert.match(quotaMigration, /alter table public\.companies\s+add column if not exists icon_key text not null default 'home'/);
  assert.match(quotaMigration, /create or replace function public\.update_company_workspace/);
  assert.match(quotaMigration, /if not \(app_private\.is_company_admin\(clean_company_id\) or app_private\.is_quest_admin\(\)\) then/);
  assert.match(quotaMigration, /update public\.companies c\s+set name = clean_name,\s+short_name = clean_name,\s+label = clean_name,\s+icon_key = clean_icon/);
  assert.match(quotaMigration, /grant execute on function public\.update_company_workspace\(text, text, text\) to authenticated;/);
  assert.ok(iconExpansionMigration, 'Expected workspace icon expansion migration');
  assert.match(iconExpansionMigration, /create or replace function app_private\.workspace_icon_keys\(\)/);
  assert.match(iconExpansionMigration, /'warehouse'/);
  assert.match(iconExpansionMigration, /'headset'/);
  assert.match(iconExpansionMigration, /clean_icon text := app_private\.normalize_workspace_icon_key\(icon_key\);/);
});

test('workspace switcher lives in the sidebar workspace card, not the top nav', () => {
  assert.doesNotMatch(source, /topbar-company-indicator/);
  assert.match(source, /<div class="company-card">\s*\$\{renderCompanySwitch\(companyId, 'deck-company-select'\)\}/);
  assert.match(source, /function renderCompanySwitch\(companyId, extraClass = '', options = \{\}\)/);
  assert.match(source, /const interactive = options\.interactive !== false;/);
  assert.match(source, /if \(companies\.length <= 1 \|\| !interactive\)/);
  assert.match(source, /data-action="toggle-workspace-menu"/);
  assert.match(source, /data-action="select-workspace"/);
  assert.match(source, /workspace-menu-option/);
  assert.match(source, /workspaceIconMarkup\(company\)/);
  assert.doesNotMatch(source, /<select data-company-switch aria-label="Active company">\s*\$\{companies\.map\(.*deckMode/s);
});
