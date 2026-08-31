import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const main = read('../src/main.js');
const styles = read('../src/styles.css');
const settings = read('../src/settings/settings-surfaces.js');
const setupPanel = read('../src/onboarding/company-setup-panel.js');
const setupStyles = read('../src/onboarding/company-setup.css');
const jobEditor = read('../src/jobs/job-editor.js');
const clockPage = read('../src/ops/clock-dashboard-page.js');
const pluginBlockedPage = read('../src/plugins/plugin-blocked-page.js');

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const tail = source.slice(start + 1);
  const nextMatch = /\n(?:async\s+)?function\s+/.exec(tail);
  const end = nextMatch ? start + 1 + nextMatch.index : source.length;
  return source.slice(start, end);
}

test('role preview immediately repaints and removes the real platform-admin UI bypass', () => {
  assert.match(functionBody(main, 'isEffectiveQuestDeveloper'), /isQuestDeveloper\(\) && !rolePreviewForCompany\(companyId\)/);
  assert.match(functionBody(main, 'canViewAdminSurface'), /isDeveloper: isEffectiveQuestDeveloper\(companyId\)/);
  assert.match(main, /isQuestDeveloper: isEffectiveQuestDeveloper/);
  assert.match(main, /state\.rolePreview = \{ company_id: companyId, role_id: role\.id \};[\s\S]{0,180}?render\(\);/);
  assert.match(main, /state\.rolePreview = null;[\s\S]{0,160}?render\(\);/);
  assert.match(functionBody(main, 'reviewWorkspace'), /isEffectiveQuestDeveloper\(targetCompanyId\)/);
  assert.match(functionBody(main, 'managePlatformCompany'), /isEffectiveQuestDeveloper\(targetCompanyId\)/);
  assert.doesNotMatch(settings, /isDeveloper: isQuestDeveloper\(\)/);
  assert.match(settings, /isDeveloper: isQuestDeveloper\(companyId\)/);
  assert.match(settings, /isQuestDeveloper\(companyId\) \? renderWorkspaceApprovalConsole/);
});

test('rich activity text uses normal text flow rather than flexing every text node', () => {
  const rule = styles.slice(styles.indexOf('.wb-act-link {'), styles.indexOf('.wb-act-link:hover'));
  assert.match(rule, /display: block/);
  assert.doesNotMatch(rule, /inline-flex|display:\s*flex/);
});

test('setup review names every selected app and its data scope before the editor', () => {
  assert.match(setupPanel, /const selectedPlugins = ACTIVE_PLUGINS\.filter/);
  assert.match(setupPanel, /class="company-setup-selected-apps"/);
  assert.match(setupPanel, /pluginDataScopeDetails\(plugin\.dataScope\)/);
  assert.match(setupPanel, /Edit app selection/);
  assert.match(setupStyles, /\.company-setup-selected-apps/);
  assert.match(setupStyles, /\.quest-app:has\(\.company-setup-modal-overlay\) \.work-surface \{\s*overflow: hidden;/);
});

test('clock table keeps four flexible columns at constrained desktop widths', () => {
  const at = styles.indexOf('.clock-table .table-head,');
  const rule = styles.slice(at, styles.indexOf('}', at) + 1);
  assert.match(rule, /grid-template-columns:\s*minmax\(150px,[\s\S]*minmax\(76px,/);
  assert.equal((rule.match(/minmax\(/g) || []).length, 4);
});

test('clock data quality problems are visible and ordinary records are not rewritten', () => {
  assert.match(clockPage, /timeEntryQuality\(entry\)/);
  assert.match(clockPage, /clock-entry-needs-review/);
  assert.match(clockPage, /Unusually long shift/);
  assert.match(clockPage, /Your saved time records for this workspace/);
});

test('generic jobs do not silently become roofing jobs and creation uses Add job wording', () => {
  assert.match(functionBody(main, 'normalizeJob'), /job_type: String\(input\.job_type \|\| 'General'\)/);
  assert.match(functionBody(main, 'blankJob'), /job_type: 'General'/);
  assert.match(jobEditor, /edit\.job_type \|\| 'General'/);
  assert.match(jobEditor, /\$\{job \? 'Save job' : 'Add job'\}/);
});

test('a custom Jobs app is distinguished from packaged Quest CRM Jobs', () => {
  const body = functionBody(pluginBlockedPage, 'renderPluginBlockedPage');
  assert.match(body, /requestedModuleLabel = moduleMeta\?\.id === 'jobs' \? 'Quest CRM Jobs'/);
  assert.match(body, /Open Custom Jobs/);
  assert.match(body, /Custom Jobs and Quest CRM Jobs are separate/);
  assert.match(functionBody(main, 'renderBlockedPage'), /import\('\.\/plugins\/plugin-blocked-page\.js'\)/);
  assert.match(main, /if \(action === 'retry-blocked-pages'\)/);
});
