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
  const gateSource = source.match(/function renderClientPortalPasswordGate\(token, portal\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(source, /function shouldAutoOpenClientPortal\(token\)/);
  assert.match(source, /ensureClientPortalPublicOpen\(state\.route\.token\)/);
  assert.match(source, /function renderClientPortalPasswordGate\(token, portal\)/);
  assert.match(source, /payload\.password_required === true/);
  assert.match(source, /state\.clientPortalPublic = \{ token, loading: true \}/);
  assert.match(source, /body: JSON\.stringify\(\{ token, guest_name: CLIENT_PORTAL_GUEST_NAME, password: password \|\| '' \}\)/);
  assert.match(source, /<input type="hidden" name="token" value="\$\{h\(token\)\}" \/>/);
  assert.match(source, /<label><span>Portal password<\/span><input name="password" type="password"/);
  assert.doesNotMatch(gateSource, /name="guest_name"/);
  assert.doesNotMatch(gateSource, /Your name/);
});

test('staff portal workspace supports create, upload, copy, revoke, and annotation review', () => {
  assert.match(source, /function renderClientPortalsPage\(route, companyId\)/);
  assert.match(source, /data-action="open-client-portal-form"/);
  assert.match(source, /data-client-portal-form/);
  assert.match(source, /data-client-portal-document-form/);
  assert.match(source, /copy-client-portal-link/);
  assert.match(source, /regenerate-client-portal-link/);
  assert.match(source, /revoke-client-portal/);
  assert.match(source, /ensureClientPortalAnnotateState\('owner', portalId, state\.route\.params\.get\('document_id'\) \|\| ''\)/);
  assert.match(source, /<div class="cp-fullscreen">\$\{renderClientPortalAnnotate\('owner'\)\}<\/div>/);
  assert.match(source, /function renderClientPortalAnnotate\(mode\)/);
  assert.match(source, /annotate: '1', fs: '1'/);
  assert.match(source, /<div class="cp-ch"><h3>Review<\/h3>/);
  assert.match(source, /clientPortalAnnotationsForPortal/);
});

test('staff portal lists use readable action controls and markup cards', () => {
  assert.match(source, /class="cp-row-main"/);
  assert.match(source, /class="cp-row-actions"/);
  assert.match(source, /function renderClientPortalMarkCard\(annotation\)/);
  assert.match(source, /class="cp-mark-card"/);
  assert.match(source, /class="cp-mark-ico"/);
  assert.match(styles, /\.cp-row-main\s*\{/);
  assert.match(styles, /\.cp-row-actions button\s*\{/);
  assert.match(styles, /\.client-portal-row:hover \.cp-row-actions/);
  assert.match(styles, /\.cp-mark-card\s*\{/);
  assert.match(styles, /\.cp-mark-meta span\s*\{/);
});

test('public portal viewer exposes plan markup tools and persistent annotations', () => {
  assert.match(source, /fetchClientPortalDocumentFile/);
  assert.match(source, /cpResolveBase/);
  // pdf.js is lazy-loaded (dynamic import) so it stays out of the initial bundle.
  assert.match(source, /import pdfWorkerUrl from 'pdfjs-dist\/build\/pdf\.worker\.mjs\?url';/);
  assert.match(source, /pdfjsLibPromise = import\('pdfjs-dist\/build\/pdf\.mjs'\)/);
  assert.match(source, /pdfjsLib\.GlobalWorkerOptions\.workerSrc = pdfWorkerUrl/);
  assert.match(source, /const pdfjsLib = await loadPdfjs\(\);/);
  assert.match(source, /const cpBaseCache = new Map\(\);/);
  assert.match(source, /function cpWithTimeout\(promise, ms, label\)/);
  assert.match(source, /cpWithTimeout\(cpReloadPortalAnnotations\(portalId\), 5000, 'Markup refresh'\)/);
  assert.match(source, /cpWithTimeout\(client\.storage\.from\(bucket\)\.createSignedUrl\(doc\.object_path, 900\), 8000, 'Document URL'\)/);
  assert.match(source, /function cpDocumentSourceUrl\(doc\)/);
  assert.match(source, /const response = await cpWithTimeout\(fetch\(url\), 15000, 'Document download'\)/);
  assert.match(source, /const data = new Uint8Array\(await cpWithTimeout\(response\.arrayBuffer\(\), 15000, 'Document download'\)\)/);
  assert.match(source, /pdfjsLib\.getDocument\(\{ data, disableWorker: true \}\)\.promise/);
  assert.match(source, /cpWithTimeout\(pageObj\.render\(\{ canvasContext: canvas\.getContext\('2d'\), viewport \}\)\.promise, 15000, 'PDF render'\)/);
  assert.match(source, /data-cp-annotate/);
  assert.match(source, /data-cp-frame/);
  assert.match(source, /id: 'freehand'[\s\S]*tip: 'Pen'/);
  assert.match(source, /id: 'measure'[\s\S]*tip: 'Measure'/);
  assert.match(source, /id: 'comment'[\s\S]*tip: 'Comment pin'/);
  assert.match(source, /data-action="cp-tool"/);
  assert.match(source, /data-action="cp-color"/);
  assert.match(source, /data-cp-stroke-input/);
  assert.match(source, /data-action="cp-zoom"/);
  assert.match(source, /data-action="cp-undo"/);
  assert.match(source, /data-action="cp-redo"/);
  assert.match(source, /data-cp-comment-form/);
  assert.match(source, /data-cp-reply-form/);
  assert.match(source, /data-action="cp-save"/);
  assert.match(source, /data-action="cp-export"/);
  assert.match(source, /payload\.markerStatus/);
  assert.match(source, /payload\.text/);
  assert.match(source, /icon: 'ti-pencil'/);
  assert.match(source, /loadClientPortalAnnotations/);
  assert.match(source, /cpSaveAnnotation/);
  assert.match(source, /cpGuestPersist/);
  assert.match(source, /cpSetDocStatus/);
  assert.match(source, /client\.storage\.from\(doc\.bucket_id\)\.createSignedUrl/);
  assert.match(source, /client\.from\('client_portal_annotations'\)\.upsert/);
  assert.match(styles, /\.client-portal-public/);
  assert.match(styles, /\.cp-annotate/);
  assert.match(styles, /\.cp-stage/);
  assert.match(styles, /\.cp-fullscreen/);
});

test('client portal tool selection does not remount the PDF viewer', () => {
  assert.match(source, /function updateClientPortalAnnotateTool\(toolId\)/);
  assert.match(source, /button\.classList\.toggle\('active', active\)/);
  assert.match(source, /button\.setAttribute\('aria-pressed', active \? 'true' : 'false'\)/);
  const block = source.slice(source.indexOf("if (action === 'cp-tool')"), source.indexOf("if (action === 'cp-color')"));
  assert.match(block, /updateClientPortalAnnotateTool\(node\.dataset\.tool \|\| 'select'\)/);
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
  for (const name of ['client-portal-open.js', 'client-portal-document-url.js', 'client-portal-document-file.js', 'client-portal-annotations.js', 'client-portal-document-status.js', 'client-portal-export-event.js']) {
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
  const openApi = readFileSync(new URL('client-portal-open.js', apiDir), 'utf8');
  assert.match(openApi, /is_current=eq\.true/);
  assert.match(openApi, /version_group_id,version_number,is_current,review_status,scale,scale_unit/);
  const annotationsApi = readFileSync(new URL('client-portal-annotations.js', apiDir), 'utf8');
  assert.match(annotationsApi, /body\.action === 'delete'/);
  assert.match(annotationsApi, /body\.annotation && typeof body\.annotation === 'object'/);
  assert.match(annotationsApi, /on_conflict=id/);
  const statusApi = readFileSync(new URL('client-portal-document-status.js', apiDir), 'utf8');
  assert.match(statusApi, /REVIEW_STATUSES = \['pending', 'approved', 'revision', 'rejected'\]/);
  assert.match(statusApi, /portal_id=eq\.\$\{encodeURIComponent\(session\.portal_id\)\}/);
  const documentUrlApi = readFileSync(new URL('client-portal-document-url.js', apiDir), 'utf8');
  assert.match(documentUrlApi, /function absoluteStorageUrl\s*\(/);
  assert.match(documentUrlApi, /\$\{baseUrl\(\)\}\/storage\/v1\$\{cleanPath\}/);
});

test('client portal document review and scale fields are tracked in migrations', () => {
  const migration = migrationFiles
    .map((name) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'))
    .find((sql) => /client_portal_documents[\s\S]*version_group_id[\s\S]*review_status[\s\S]*scale_unit/.test(sql)) || '';
  assert.match(migration, /add column if not exists version_group_id uuid/);
  assert.match(migration, /add column if not exists review_status text not null default 'pending'/);
  assert.match(migration, /add column if not exists scale numeric/);
  assert.match(migration, /add column if not exists scale_unit text/);
  assert.match(migration, /add column if not exists author_profile_id uuid/);
});

test('staff portal annotation and document persistence helpers are wired', () => {
  assert.match(source, /async function persistClientPortalAnnotation\(annotation\)/);
  assert.match(source, /function clientPortalAnnotationPayload\(annotation\)/);
  assert.match(source, /function upsertClientPortalAnnotationLocal\(annotation\)/);
  assert.match(source, /async function deleteClientPortalAnnotationRow\(id\)/);
  assert.match(source, /async function persistClientPortalDocument\(doc\)/);
  assert.match(source, /client\.from\('client_portal_annotations'\)\.upsert/);
  assert.match(source, /client\.from\('client_portal_annotations'\)\.delete\(\)\.eq\('id', id\)/);
  assert.match(source, /client\.from\('client_portal_documents'\)\.update/);
});
