import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migrationDir = new URL('../supabase/migrations/', import.meta.url);
const migrationFiles = readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
const portalMigrationName = migrationFiles.find((name) => {
  const sql = readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
  return /client_portals/.test(sql) && /quest-client-portal-documents/.test(sql);
});
const portalMigration = portalMigrationName ? readFileSync(new URL(`../supabase/migrations/${portalMigrationName}`, import.meta.url), 'utf8') : '';

test('client portal plugin is registered, gated, and permissioned', () => {
  assert.match(source, /id: 'client_portal'[\s\S]*module_ids: \['client-portals'\]/);
  assert.match(source, /\['client_portals\.view', 'View client portals'\]/);
  assert.match(source, /\['client_portals\.manage', 'Manage client portals'\]/);
  assert.match(source, /\{ id: 'client-portals'[\s\S]*label: 'Client portals'[\s\S]*permission: 'client_portals\.view'/);
  assert.match(source, /if \(route\.section === 'client-portals'\) return renderClientPortalsPage\(route, companyId\);/);
  assert.match(source, /if \(clean\.startsWith\('client_portals\.'\)\) return \['client_portal'\];/);
});

test('public portal route bypasses workspace auth and renders client shell', () => {
  assert.match(source, /const CLIENT_PORTAL_SESSION_KEY = 'quest-client-portal-session-v1';/);
  assert.match(source, /if \(path\.startsWith\('\/portal\/'\)\) return \{ name: 'client-portal'/);
  assert.match(source, /if \(state\.route\.name === 'client-portal'\) \{/);
  assert.match(source, /renderClientPortalPublicPage\(state\.route\)/);
  assert.match(source, /class="client-portal-public"/);
});

test('public portal auto-opens and only asks for a password when required', () => {
  assert.match(source, /function shouldAutoOpenClientPortal\(token\)/);
  assert.match(source, /ensureClientPortalPublicOpen\(state\.route\.token\)/);
  assert.match(source, /function renderClientPortalPasswordGate\(token, portal\)/);
  assert.match(source, /payload\.password_required === true/);
  assert.match(source, /state\.clientPortalPublic = \{ token, loading: true \}/);
  assert.match(source, /body: JSON\.stringify\(\{ token, guest_name: CLIENT_PORTAL_GUEST_NAME, password: password \|\| '' \}\)/);
  assert.match(source, /<input type="hidden" name="token" value="\$\{h\(token\)\}" \/>/);
  assert.match(source, /<label><span>Portal password<\/span><input name="password" type="password"/);
  assert.doesNotMatch(source, /name="guest_name"/);
  assert.doesNotMatch(source, /Your name/);
});

test('staff portal workspace supports create, upload, copy, revoke, and annotation review', () => {
  assert.match(source, /function renderClientPortalsPage\(route, companyId\)/);
  assert.match(source, /data-action="open-client-portal-form"/);
  assert.match(source, /data-client-portal-form/);
  assert.match(source, /data-client-portal-document-form/);
  assert.match(source, /copy-client-portal-link/);
  assert.match(source, /regenerate-client-portal-link/);
  assert.match(source, /revoke-client-portal/);
  assert.match(source, /clientPortalAnnotationsForPortal/);
});

test('public portal viewer exposes plan markup tools and persistent annotations', () => {
  assert.match(source, /fetchClientPortalDocumentFile/);
  assert.match(source, /pdfjsLib\.getDocument\(\{ data: pdfData \}\)/);
  assert.match(source, /client-portal-tool/);
  assert.match(source, /id: 'pen', label: 'Pen'/);
  assert.match(source, /id: 'measure', label: 'Measure'/);
  assert.match(source, /id: 'comment', label: 'Add note'/);
  assert.match(source, /data-portal-tool="\$\{tool\.id\}"/);
  assert.match(source, /data-action="client-portal-comment-submit"/);
  assert.match(source, /data-action="client-portal-swatch"/);
  assert.match(source, /data-action="client-portal-stroke"/);
  assert.match(source, /data-action="client-portal-zoom-in"/);
  assert.match(source, /data-action="client-portal-fit"/);
  assert.match(source, /data-action="client-portal-undo"/);
  assert.match(source, /payload\.status \|\| 'open'/);
  assert.match(source, /h\(annotation\.payload\?\.text/);
  assert.match(source, /icon: 'ti-pencil'/);
  assert.match(source, /aria-label="\$\{h\(tool\.label\)\}"/);
  assert.match(source, /aria-pressed="\$\{state\.clientPortalTool === tool\.id \? 'true' : 'false'\}"/);
  assert.match(source, /data-action="client-portal-save-annotations"/);
  assert.match(source, /data-action="client-portal-export"/);
  assert.match(source, /loadClientPortalAnnotations/);
  assert.match(source, /saveClientPortalAnnotations/);
  assert.match(styles, /\.client-portal-public/);
  assert.match(styles, /\.client-portal-stage/);
});

test('client portal tool selection does not remount the PDF viewer', () => {
  assert.match(source, /function updateClientPortalToolSelection\(toolId\)/);
  assert.match(source, /button\.classList\.toggle\('active', active\)/);
  assert.match(source, /button\.setAttribute\('aria-pressed', active \? 'true' : 'false'\)/);
  const block = source.slice(source.indexOf("if (action === 'client-portal-tool')"), source.indexOf("if (action === 'client-portal-color')"));
  assert.match(block, /updateClientPortalToolSelection\(node\.dataset\.portalTool \|\| 'pan'\)/);
  assert.doesNotMatch(block, /render\(\)/);
});

test('client portal migration creates tables, RLS, bucket, grants, and plugin allowlist updates', () => {
  assert.ok(portalMigrationName, 'Expected client portal migration');
  assert.match(portalMigration, /create table if not exists public\.client_portals/);
  assert.match(portalMigration, /create table if not exists public\.client_portal_documents/);
  assert.match(portalMigration, /create table if not exists public\.client_portal_annotations/);
  assert.match(portalMigration, /create table if not exists public\.client_portal_events/);
  assert.match(portalMigration, /insert into storage\.buckets[\s\S]*quest-client-portal-documents/);
  assert.match(portalMigration, /alter table public\.client_portals enable row level security;/);
  assert.match(portalMigration, /app_private\.has_company_permission\(company_id, 'client_portals\.view'\)/);
  assert.match(portalMigration, /app_private\.has_company_permission\(company_id, 'client_portals\.manage'\)/);
  assert.match(portalMigration, /plugin_id in \('crm', 'crm_2', 'underwriter'[\s\S]*'client_portal'/);
  assert.match(portalMigration, /when permission like 'client_portals\.%' then array\['client_portal'\]/);
  assert.match(portalMigration, /grant select, insert, update on public\.client_portals/);
});

test('client portal Vercel APIs exist and do not expose raw token or password fields', () => {
  const apiDir = new URL('../api/', import.meta.url);
  for (const name of ['client-portal-open.js', 'client-portal-document-url.js', 'client-portal-document-file.js', 'client-portal-annotations.js', 'client-portal-export-event.js']) {
    assert.ok(existsSync(new URL(name, apiDir)), `${name} should exist`);
    const api = readFileSync(new URL(name, apiDir), 'utf8');
    assert.match(api, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(api, /function isSupabaseSecretKey/);
    assert.match(api, /function supabaseHeaders/);
    assert.match(api, /isSupabaseSecretKey\(\) \? \{\} : \{ Authorization: `Bearer \$\{serviceKey\(\)\}` \}/);
    assert.match(api, /sha256/);
    assert.doesNotMatch(api, /select=token/);
    assert.doesNotMatch(api, /select=password/);
  }
});
