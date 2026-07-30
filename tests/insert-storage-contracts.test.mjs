import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const taskStore = readFileSync(new URL('../taskmanagement/js/services/SupabaseDataStore.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migrationDirectory = new URL('../supabase/migrations/', import.meta.url);

function functionSource(name, nextName) {
  const asyncPrefix = `async function ${name}(`;
  const plainPrefix = `function ${name}(`;
  const start = appSource.indexOf(asyncPrefix) !== -1 ? appSource.indexOf(asyncPrefix) : appSource.indexOf(plainPrefix);
  const nextAsyncPrefix = `\nasync function ${nextName}(`;
  const nextPlainPrefix = `\nfunction ${nextName}(`;
  const end = appSource.indexOf(nextAsyncPrefix, start) !== -1
    ? appSource.indexOf(nextAsyncPrefix, start)
    : appSource.indexOf(nextPlainPrefix, start);
  assert.ok(start !== -1 && end !== -1, `Expected ${name} source`);
  return appSource.slice(start, end);
}

function nonTaskInsertReturningTables() {
  const tables = [];
  for (const match of taskStore.matchAll(/\.from\('([^']+)'\)/g)) {
    if (!match || match[1] === 'tasks') continue;
    const queryEnd = taskStore.indexOf(';', match.index);
    const query = taskStore.slice(match.index, queryEnd + 1);
    if (/\.insert\([\s\S]*?\.select\(/.test(query)) tables.push(match[1]);
  }
  return tables.sort();
}

test('TaskManagement insert-returning audit permits only the six live, SELECT-visible tables and retires the seventh dead SOP site', () => {
  // This list is the completed seven-site audit: task_label_sops is deliberately
  // absent because it has no table or callers, so its mutators must stay retired.
  assert.deepEqual(nonTaskInsertReturningTables(), [
    'comment_reactions',
    'projects',
    'task_comments',
    'task_labels',
    'task_type_statuses',
    'task_types',
  ]);
  assert.doesNotMatch(taskStore, /async (?:create|update|delete)SopStep\(/);
  assert.doesNotMatch(taskStore, /\.from\('task_label_sops'\)\.(?:insert|update|delete)/);
});

test('multi-recipient notifications insert without RETURNING, return every created row, and only merge the signed-in recipient into this inbox', async () => {
  const notifyEventSource = functionSource('notifyEvent', 'mergeNotifications');
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const runNotifyEvent = new AsyncFunction(
    'state', 'input', 'canonicalCompanyId', 'activeCompanyId', 'notificationRecipientIds', 'normalizeNotification',
    'isLiveSupabaseSession', 'createSupabaseClient', 'notificationPayload', 'mergeNotifications', 'render', 'activeSession', 'crypto',
    `${notifyEventSource}\nreturn notifyEvent(input);`,
  );

  let insertedRows = [];
  const mergedRows = [];
  const client = {
    from(table) {
      assert.equal(table, 'notifications');
      return {
        insert(rows) {
          insertedRows = rows;
          return { error: null };
        },
      };
    },
  };
  const state = { session: { auth: 'supabase', profile: { id: 'profile-me' } } };
  const created = await runNotifyEvent(
    state,
    { companyId: 'company-1', title: 'Task updated', recipients: ['profile-me', 'profile-other'] },
    (value) => value,
    () => 'company-1',
    () => ['profile-me', 'profile-other'],
    (value) => value,
    () => true,
    () => client,
    (value) => value,
    (rows) => mergedRows.push(rows),
    () => {},
    () => state.session,
    { randomUUID: (() => { let index = 0; return () => `notification-${++index}`; })() },
  );

  assert.equal(created.length, 2);
  assert.deepEqual(insertedRows, created);
  assert.deepEqual(mergedRows, [[created[0]]]);
});

test('form-response files remain a private, signed-only Storage route with no browser object operations or object policies', () => {
  const uploadSource = functionSource('uploadPublicFormFile', 'collectFormAnswers');
  const uploadApi = readFileSync(new URL('../api/public-form-file-upload.js', import.meta.url), 'utf8');
  const urlApi = readFileSync(new URL('../api/public-form-file-url.js', import.meta.url), 'utf8');
  const hardeningMigration = readFileSync(new URL('../supabase/migrations/202607111000_harden_file_upload_buckets.sql', import.meta.url), 'utf8');
  const migrationSources = readdirSync(migrationDirectory, { encoding: 'utf8' })
    .filter((name) => name.endsWith('.sql'))
    .map((name) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  const matchingObjectPolicies = migrationSources
    .flatMap((migration) => migration.match(/create policy[\s\S]*?;/gi) || [])
    .filter((policy) => policy.includes('quest-form-response-files'));

  assert.match(uploadSource, /\.uploadToSignedUrl\(payload\.object_path, payload\.token, file/);
  assert.doesNotMatch(uploadSource, /\.(?:upload|list|download|remove|createSignedUrl)\(/);
  assert.match(uploadApi, /createStorageClient/);
  assert.match(uploadApi, /createSignedUploadUrl\(objectPath, \{ upsert: false \}\)/);
  assert.match(urlApi, /createStorageClient/);
  assert.match(urlApi, /createSignedUrl\(objectPath, 60 \* 60/);
  assert.match(hardeningMigration, /\('quest-form-response-files', 'quest-form-response-files', false, 15728640,[\s\S]*?array\['application\/pdf','image\/png','image\/jpeg','image\/webp','text\/plain','text\/csv'\]\)/);
  assert.deepEqual(matchingObjectPolicies, []);
});
