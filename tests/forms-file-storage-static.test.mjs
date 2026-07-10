import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const uploadApiPath = new URL('../api/public-form-file-upload.js', import.meta.url);
const urlApiPath = new URL('../api/public-form-file-url.js', import.meta.url);

test('public form file answers upload to storage before the response is submitted', () => {
  assert.ok(existsSync(uploadApiPath), 'public form upload signing API should exist');
  const uploadApi = readFileSync(uploadApiPath, 'utf8');
  assert.match(uploadApi, /FORM_FILE_BUCKET/);
  assert.match(uploadApi, /createSignedUploadUrl/);
  assert.match(uploadApi, /ensureFormFileBucket/);
  assert.match(uploadApi, /forms\?/);
  assert.match(uploadApi, /status=eq\.Published/);

  assert.match(source, /async function uploadPublicFormFile\(form, question, file\)/);
  assert.match(source, /uploadToSignedUrl/);
  assert.match(source, /collectFormAnswers\(form, data, \{ publicUpload: true \}\)/);
  assert.match(source, /bucket_id/);
  assert.match(source, /object_path/);
});

test('stored form files render as previews or downloadable links in response detail', () => {
  assert.ok(existsSync(urlApiPath), 'public form file signed URL API should exist');
  const urlApi = readFileSync(urlApiPath, 'utf8');
  assert.match(urlApi, /createSignedUrl/);
  assert.match(urlApi, /form_responses/);
  assert.match(urlApi, /containsObjectPath/);
  assert.match(urlApi, /supabaseGetAsUser\([^,]+,\s*token\)/);
  assert.match(urlApi, /Authorization:\s*`Bearer \$\{token\}`/);
  assert.doesNotMatch(urlApi, /from\('company_memberships'\)/);

  assert.match(source, /function ensureFormResponseFileUrls\(response\)/);
  assert.match(source, /\/api\/public-form-file-url/);
  assert.match(source, /value\.signed_url \|\| value\.public_url \|\| value\.data_url/);
  assert.match(source, /form-file-answer-preview/);
  assert.match(source, /renderFormAnswerValue\(value, response\)/);
  assert.match(styles, /\.form-file-answer-preview/);
});
