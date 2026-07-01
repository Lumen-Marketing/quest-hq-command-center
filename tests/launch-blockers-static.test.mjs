import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('job save blocks blank names before normalizeJob can create Untitled Job', () => {
  assert.match(source, /function validateJobForm\s*\(/);
  assert.match(source, /const rawName = String\(formData\.name \|\| ''\)\.trim\(\);/);
  assert.match(source, /if \(!rawName\) \{/);
  assert.match(source, /Workspace name is required\./);
  assert.match(source, /const validation = validateJobForm\(form\);[\s\S]*if \(!validation\.ok\) return;/);
});

test('client portal PDF viewer has a customer-visible fallback instead of a blank canvas', () => {
  assert.match(source, /id="client-portal-pdf-fallback"/);
  assert.match(source, /function setClientPortalPdfFallback\s*\(/);
  assert.match(source, /function showClientPortalPdfFallback\s*\(/);
  assert.match(source, /showClientPortalPdfFallback\(fallbackUrl\);/);
  assert.match(source, /if \(document\.querySelector\('\.client-portal-canvas-wrap\.fallback-visible'\)\) return;/);
  assert.match(source, /if \(zoomLabel\) zoomLabel\.textContent = 'PDF';/);
  assert.match(source, /The plan preview did not render in this browser/);
  assert.doesNotMatch(source, /looksBlankClientPortalCanvas/);
  assert.match(styles, /\.client-portal-pdf-fallback/);
});

test('company routes wait for live workspace data instead of rendering local fallback data', () => {
  assert.match(source, /function shouldHoldCompanyRouteForLiveData\s*\(/);
  assert.match(source, /renderWorkspaceLoading\(state\.route\)/);
  assert.match(source, /state\.session\?\.auth === 'supabase' && !state\.dataLoaded/);
});

test('launch mode hides future modules and unfinished dashboard widgets from normal users', () => {
  assert.match(source, /const LAUNCH_HIDE_FUTURE_MODULES = true;/);
  assert.match(source, /const LAUNCH_HIDE_UNREADY_DASHBOARD_WIDGETS = true;/);
  assert.match(source, /if \(LAUNCH_HIDE_FUTURE_MODULES && plugin\.status === 'coming_soon'\) return '';/);
  assert.match(source, /if \(LAUNCH_HIDE_UNREADY_DASHBOARD_WIDGETS && widget\.locked\) return '';/);
});

test('new form modal shows clear validation for blank/default titles', () => {
  assert.match(source, /function validateNewFormModal\s*\(/);
  assert.match(source, /Form title is required\./);
  assert.match(source, /const validation = validateNewFormModal\(formEl, template\);[\s\S]*if \(!validation\.ok\) return;/);
});

test('invite modal explains link-code invite flow without implying email delivery', () => {
  assert.match(source, /Copy this invite link or code and send it to the teammate yourself\./);
  assert.doesNotMatch(source, /Automatic invite email delivery is not active in v1\./);
});

test('dashboard nav badge helpers do not read underwriter stages before initialization', () => {
  const stagesIndex = source.indexOf('const CRM2_UNDERWRITER_STAGES = [');
  const initIndex = source.indexOf('init();');
  const badgeIndex = source.indexOf('function moduleBadgeCount(');
  assert.ok(stagesIndex > -1, 'underwriter stages are defined');
  assert.ok(initIndex > -1, 'app init is called');
  assert.ok(badgeIndex > -1, 'module badge helper is defined');
  assert.ok(stagesIndex < initIndex, 'underwriter stages must initialize before the app first renders');
  assert.ok(stagesIndex < badgeIndex, 'underwriter stages must be initialized before badge counts render');
});

test('dashboard rep filter hides internal placeholder account ids', () => {
  assert.match(source, /function dashboardRepDisplayName\s*\(/);
  assert.match(source, /function isInternalDashboardRepName\s*\(/);
  assert.match(source, /function personOwnerDisplayName\s*\(/);
  assert.match(source, /key === 'basic-quest-user'/);
  assert.match(source, /\.map\(\(user\) => dashboardRepDisplayName\(user\)\)/);
  assert.match(source, /dashboardOwnerKey\(clean\) === dashboardOwnerKey\(companyName\(companyId\)\)/);
  assert.match(source, /return personOwnerLabel\(item\?\.owner_name/);
});

test('contact filters hide junk values and company names from launch filter menus', () => {
  assert.match(source, /function cleanContactFilterOption\s*\(/);
  assert.match(source, /if \(kind === 'owner_name'\) return personOwnerDisplayName\(clean, companyId\);/);
  assert.match(source, /if \(clean\.length < 2\) return '';/);
  assert.match(source, /if \(!\/\[a-z\]\/i\.test\(clean\)\) return '';/);
  assert.match(source, /contacts\.map\(contactFilterJobType\)\.map\(\(value\) => cleanContactFilterOption\(value, 'job_type', companyId\)\)/);
  assert.match(source, /contacts\.map\(\(contact\) => cleanContactFilterOption\(contact\.owner_name, 'owner_name', companyId\)\)/);
});

test('contact save blocks blank names instead of creating Untitled contact records', () => {
  assert.match(source, /function validateContactForm\s*\(/);
  assert.match(source, /const rawName = String\(formData\.name \|\| ''\)\.trim\(\);/);
  assert.match(source, /Contact name is required\./);
  assert.match(source, /const validation = validateContactForm\(form\);[\s\S]*if \(!validation\.ok\) return;/);
  assert.match(source, /contact\.name = '';/);
});
