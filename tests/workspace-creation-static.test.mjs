import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

  // Workspace settings is fetched on demand now; same surface, two files.
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/settings/workspace-settings.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const tablerIconsCss = readFileSync(new URL('../taskmanagement/vendor/tabler-icons/tabler-icons.min.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202606251230_idempotent_workspace_creation.sql', import.meta.url), 'utf8');
const quotaMigrationUrl = new URL('../supabase/migrations/202606260900_workspace_quota_icons.sql', import.meta.url);
const quotaMigration = existsSync(quotaMigrationUrl) ? readFileSync(quotaMigrationUrl, 'utf8') : '';
const iconExpansionMigrationUrl = new URL('../supabase/migrations/202606261130_workspace_icon_expansion.sql', import.meta.url);
const iconExpansionMigration = existsSync(iconExpansionMigrationUrl) ? readFileSync(iconExpansionMigrationUrl, 'utf8') : '';
const iconUploadMigrationUrl = new URL('../supabase/migrations/202606271030_workspace_icon_uploads.sql', import.meta.url);
const iconUploadMigration = existsSync(iconUploadMigrationUrl) ? readFileSync(iconUploadMigrationUrl, 'utf8') : '';

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

test('supabase access survives noncritical full-data load fallback without trusting mutable profile company ids', () => {
  assert.match(source, /function safeSupabaseQuery\(query\)/);
  assert.match(source, /return Promise\.resolve\(query\)\.catch\(\(error\) => \(\{ error \}\)\);/);
  assert.match(source, /async function loadSupabaseBootstrapData\(\)/);
  assert.match(source, /safeSupabaseQuery\(client\.from\('company_memberships'\)\.select\('\*'\)\.eq\('profile_id', profile\.id\)\)/);
  assert.match(source, /safeSupabaseQuery\(client\.rpc\('is_platform_admin'\)\)/);
  assert.match(source, /safeSupabaseQuery\(client\.rpc\('list_platform_companies_v2'\)\)/);
  assert.doesNotMatch(source, /client\.rpc\([^;\n]+\.catch\(\(error\) => \(\{ error \}\)\)/);
  assert.match(source, /const companyIds = compactUnique\(state\.memberships[\s\S]*item\.profile_id === activeSession\(\)\.profile\.id && item\.status === 'active'/);
  assert.match(source, /if \(state\.session\?\.auth === 'supabase'\) \{[\s\S]*const membershipIds = state\.memberships[\s\S]*return compactUnique\(membershipIds\)/);
  assert.doesNotMatch(source, /trustedProfileCompany/);
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

test('workspace settings can rename and change one of many icons', () => {
  // The library used to be ~48 entries carrying one `icon: 'ti-…'` each, drawn as inline
  // SVG. It is now a larger table of line/solid glyph names rendered with the bundled
  // font — the SVG paths cost entry-chunk bytes per icon, which capped how many there
  // could be. This still checks the two things that matter: there are plenty, and every
  // name resolves to a real glyph.
  const workspaceIconBlock = source.match(/const WORKSPACE_ICON_OPTIONS = \[[\s\S]*?\n\];/)?.[0] || '';
  const iconEntryCount = (workspaceIconBlock.match(/\{ key: '[^']+'/g) || []).length;
  assert.ok(iconEntryCount >= 100, `expected at least 100 workspace icon choices, got ${iconEntryCount}`);
  assert.match(source, /const WORKSPACE_ICON_OPTIONS = \[/);

  const glyphs = [...workspaceIconBlock.matchAll(/\b(?:line|solid): '([a-z0-9-]+)'/g)].map((m) => m[1]);
  const missingIconClasses = glyphs.filter((name) => !tablerIconsCss.includes(`.ti-${name}:before`));
  assert.deepEqual(missingIconClasses, [], `workspace icons missing from bundled Tabler CSS: ${missingIconClasses.join(', ')}`);

  // Every entry needs a line glyph; solid is optional because Tabler only ships filled
  // variants for some, and the pack falls back rather than showing a gap.
  const entries = workspaceIconBlock.split('{ key:').slice(1);
  const withoutLine = entries.filter((e) => !/\bline: '/.test(e));
  assert.equal(withoutLine.length, 0, 'every icon needs a line glyph');

  // Keys are stored on company rows, so they must be unique or two icons collide.
  const keys = [...workspaceIconBlock.matchAll(/key: '([^']+)'/g)].map((m) => m[1]);
  assert.equal(new Set(keys).size, keys.length, 'duplicate icon keys would collide on saved companies');

  assert.match(source, /function workspaceIconOption\(key\)/);
  assert.match(source, /function workspaceIconGlyph\(option, pack\)/);
  assert.match(source, /function workspaceIconSvgMarkup\(iconOption, pack\)/);
  assert.match(source, /function workspaceIconMarkup\(companyOrId, className = ''\)/);
  assert.match(source, /<i class="ti ti-\$\{h\(workspaceIconGlyph\(iconOption, pack\)\)\}"/);
  assert.match(source, /icon_key: workspaceIconOption\(input\.icon_key\)\.key/);
  assert.match(source, /renderWorkspaceSettings\(companyId\)/);
  assert.match(source, /data-workspace-settings-form/);
  assert.match(source, /name="icon_key"/);
  assert.match(source, /name="icon_image"/);
  assert.match(source, /data-action="open-workspace-icon-modal"/);
  assert.match(source, /function renderWorkspaceIconModal\(companyId\)/);
  assert.match(source, /data-action="select-workspace-icon"/);
  assert.match(source, /data-workspace-icon-upload/);
  assert.match(source, /async function prepareWorkspaceIconUpload\(file\)/);
  assert.match(source, /function sanitizeWorkspaceIconImage\(value\)/);
  // Icon uploads compress rather than reject: no hard byte cap in the icon path,
  // a decode that streams from the File, and a quality ladder down to the budget.
  assert.match(source, /validateUpload\(file, 'workspaceicon'\)/);
  assert.doesNotMatch(source, /Workspace icon uploads must be 2 MB or smaller/);
  assert.match(source, /createImageBitmap\(file, \{ imageOrientation: 'from-image' \}\)/);
  assert.match(source, /function compressWorkspaceIconCanvas\(canvas\)/);
  // The quality ladder is shared with avatar compression; the icon path supplies its
  // own budget rather than hardcoding the comparison.
  assert.match(source, /compressCanvasToBudget\(canvas, WORKSPACE_ICON_UPLOAD_MAX_BYTES\)/);
  assert.match(source, /if \(output\.length <= budget\) return output;/);
  assert.match(source, /async function saveWorkspaceSettings\(formNode\)/);
  // Five arguments now: the colour joined the call when migration 202608021000 added the
  // column and a five-argument overload. The four-argument function is still granted, so
  // an older client mid-rollout keeps working and simply leaves the colour unchanged.
  assert.match(source, /client\.rpc\('update_company_workspace', \{ target_company_id: companyId, workspace_name: workspaceName, icon_key: iconKey, icon_image: iconImage, p_icon_color: iconColor \}\)/);
  assert.match(styles, /\.workspace-icon i::before,\s*\.workspace-icon-choice i::before\s*\{/);
  assert.match(styles, /\.workspace-icon-current\s*\{/);
  assert.match(styles, /\.workspace-icon-modal\s*\{/);
  assert.match(styles, /\.workspace-icon-upload-card\s*\{/);
  assert.match(styles, /\.workspace-icon-svg\s*\{[\s\S]*width: 26px;[\s\S]*height: 26px;[\s\S]*fill: currentColor;/);
  assert.match(styles, /\.workspace-menu-option \.workspace-icon-svg\s*\{[\s\S]*width: 27px;[\s\S]*height: 27px;/);
  assert.match(styles, /\.workspace-menu-option \.workspace-icon\s*\{[\s\S]*display: grid;[\s\S]*place-items: center;/);
  assert.match(styles, /\.workspace-menu-option span:not\(\.workspace-icon\),/);
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
  assert.ok(iconUploadMigration, 'Expected workspace icon upload migration');
  assert.match(iconUploadMigration, /add column if not exists icon_image text not null default ''/);
  assert.match(iconUploadMigration, /create or replace function public\.update_company_workspace\(\s*target_company_id text,\s*workspace_name text,\s*icon_key text,\s*icon_image text default null/);
  assert.match(iconUploadMigration, /grant execute on function public\.update_company_workspace\(text, text, text, text\) to authenticated;/);
});

test('workspace switcher lives in the sidebar workspace card, not the top nav', () => {
  assert.doesNotMatch(source, /topbar-company-indicator/);
  assert.match(source, /<div class="company-card">\s*\$\{renderCompanySwitch\(companyId, 'deck-company-select'\)\}/);
  assert.match(source, /function renderCompanySwitch\(companyId, extraClass = '', options = \{\}\)/);
  assert.match(source, /const interactive = options\.interactive !== false;/);
  assert.match(source, /if \(companies\.length <= 1 \|\| !interactive\)/);
  assert.match(source, /data-action="toggle-workspace-menu"/);
  assert.match(source, /data-action="select-workspace"/);
  assert.match(source, /workspace-rail-item/);
  assert.match(source, /workspaceIconMarkup\(current, 'company-account-icon'\)/);
  assert.match(source, /workspaceIconMarkup\(workspace\)/);
  assert.doesNotMatch(source, /<select data-company-switch aria-label="Active company">\s*\$\{companies\.map\(.*deckMode/s);
});

test('sidebar preserves scroll position and active state during navigation', () => {
  assert.match(source, /const SIDEBAR_SCROLL_KEY = 'quest-hq-sidebar-scroll';/);
  assert.match(source, /function rememberSidebarScroll\(\)/);
  assert.match(source, /document\.querySelector\('\.deck-scroll'\)\?\.scrollTop/);
  assert.match(source, /sessionStorage\.setItem\(SIDEBAR_SCROLL_KEY, String\(scrollTop\)\)/);
  assert.match(source, /function restoreSidebarScroll\(\)/);
  assert.match(source, /queueMicrotask\(restoreSidebarScroll\)/);
  assert.match(source, /rememberSidebarScroll\(\);\s*const href =/);
  assert.match(source, /aria-current="\$\{active \? 'page' : 'false'\}"/);
  assert.match(source, /side-sub-link \$\{onSection && filter === 'all' \? 'active' : ''\}"[^>]*aria-current="\$\{onSection && filter === 'all' \? 'page' : 'false'\}"/);
});

test('technical data connection status lives in settings, not the topbar', () => {
  const shellTemplateBlock = source.match(/function shellTemplate\(route, workspace\) \{[\s\S]*?function renderDeck/)?.[0] || '';
  assert.ok(shellTemplateBlock, 'Expected shellTemplate block');
  assert.doesNotMatch(shellTemplateBlock, /data-sync-state/);
  assert.match(source, /<article class="panel settings-connection-card">/);
  assert.match(source, /<h2>Data connection<\/h2>/);
  assert.match(source, /const connectionLabel = connectionMode === 'live' \? 'Live database'/);
  assert.match(source, /<span class="sync-pill \$\{h\(connectionMode\)\}" data-sync-state><i class="ti ti-database"><\/i>\$\{h\(connectionLabel\)\}<\/span>/);
  assert.match(styles, /\.settings-connection-card\s*\{/);
  assert.match(styles, /\.settings-connection-status\s*\{/);
});

test('workspace data summary rows keep a readable horizontal inset', () => {
  // The whole module is the settings page now. Slicing it out of `source` would match the
  // loader shim main.js keeps, whose body fetches rather than renders.
  const settingsBlock = readFileSync(new URL('../src/settings/workspace-settings.js', import.meta.url), 'utf8');
  assert.ok(settingsBlock, 'Expected workspace settings block');
  assert.match(settingsBlock, /<article class="panel settings-workspace-data-card">/);

  const rule = styles.match(/\.settings-workspace-data-card \.contract-rows div\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(rule, /padding-inline:\s*12px\s*;/);
});
