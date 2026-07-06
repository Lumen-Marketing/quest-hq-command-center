import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('forms public links open a customer-safe form route and submit through public APIs', () => {
  assert.match(source, /path\.startsWith\('\/form\/'\)/);
  assert.match(source, /name: 'form-public'/);
  assert.match(source, /if \(state\.route\.name === 'form-public'\)/);
  assert.match(source, /function renderPublicFormPage\(route\)/);
  assert.match(source, /function ensurePublicFormOpen\(formId\)/);
  assert.match(source, /function submitPublicFormResponse\(formEl\)/);
  assert.match(source, /fetch\('\/api\/public-form-open/);
  assert.match(source, /fetch\('\/api\/public-form-submit'/);
  assert.match(source, /data-public-form-response/);
  assert.match(source, /function formPublicLink\(form\)/);
  assert.match(source, /copyFormPublicLink/);
  assert.match(source, /\/form\/\$\{encodeURIComponent\(formId\)\}/);
  assert.ok(existsSync(new URL('../api/public-form-open.js', import.meta.url)));
  assert.ok(existsSync(new URL('../api/public-form-submit.js', import.meta.url)));
});

test('form response inbox supports selecting any response and acting on it', () => {
  assert.match(source, /selectedFormResponseId/);
  assert.match(source, /function selectedFormResponse\(responses\)/);
  assert.match(source, /data-action="select-form-response"/);
  assert.match(source, /data-response-id="\$\{h\(response\.id\)\}"/);
  assert.match(source, /class="response-card \$\{selected\?\.id === response\.id \? 'active' : ''\}"/);
  assert.match(source, /function selectFormResponse\(id\)/);
  assert.match(source, /function renderResponseActions\(response\)/);
  assert.match(source, /data-action="response-create-contact"/);
  assert.match(source, /data-action="response-create-job"/);
  assert.match(source, /data-action="response-create-task"/);
  assert.match(source, /async function createContactFromFormResponse\(responseId\)/);
  assert.match(source, /async function createJobFromFormResponse\(responseId\)/);
  assert.match(source, /async function createTaskFromFormResponse\(responseId\)/);
});

test('file answers keep usable file metadata instead of only a bare filename', () => {
  assert.match(source, /function formFileAnswerMeta\(file\)/);
  assert.match(source, /name: file\.name/);
  assert.match(source, /size: file\.size/);
  assert.match(source, /type: file\.type/);
  assert.match(source, /lastModified: file\.lastModified/);
  assert.match(source, /function renderFormAnswerValue\(value\)/);
  assert.match(source, /form-file-answer/);
  assert.match(source, /formatBytes\(value\.size\)/);
  assert.match(styles, /\.response-card\.active/);
  assert.match(styles, /\.response-actions/);
  assert.match(styles, /\.form-file-answer/);
});
