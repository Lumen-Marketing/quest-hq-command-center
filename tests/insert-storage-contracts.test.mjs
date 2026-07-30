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

function decodeJavascriptEscape(char) {
  return {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
  }[char] ?? char;
}

function readJavascriptString(source, start, quote) {
  let index = start + 1;
  let value = '';
  while (index < source.length) {
    if (source[index] === '\\') {
      if (index + 1 < source.length) value += decodeJavascriptEscape(source[index + 1]);
      index += 2;
      continue;
    }
    if (source[index] === quote) return { end: index + 1, value };
    value += source[index];
    index += 1;
  }
  return { end: source.length, value };
}

function readJavascriptTemplate(source, start) {
  let index = start + 1;
  let value = '';
  let computed = false;
  while (index < source.length) {
    if (source[index] === '\\') {
      if (!computed && index + 1 < source.length) value += decodeJavascriptEscape(source[index + 1]);
      index += 2;
      continue;
    }
    if (source[index] === '`') return { end: index + 1, value: computed ? null : value };
    if (source[index] === '$' && source[index + 1] === '{') {
      computed = true;
      index += 2;
      let depth = 1;
      while (index < source.length && depth > 0) {
        if (source[index] === "'" || source[index] === '"') {
          index = readJavascriptString(source, index, source[index]).end;
          continue;
        }
        if (source[index] === '`') {
          index = readJavascriptTemplate(source, index).end;
          continue;
        }
        if (source[index] === '/' && source[index + 1] === '/') {
          index = source.indexOf('\n', index + 2);
          if (index === -1) return { end: source.length, value: null };
          continue;
        }
        if (source[index] === '/' && source[index + 1] === '*') {
          const end = source.indexOf('*/', index + 2);
          index = end === -1 ? source.length : end + 2;
          continue;
        }
        if (source[index] === '{') depth += 1;
        else if (source[index] === '}') depth -= 1;
        index += 1;
      }
      continue;
    }
    if (!computed) value += source[index];
    index += 1;
  }
  return { end: source.length, value: null };
}

function javascriptCanStartRegex(tokens) {
  const previous = tokens.at(-1);
  if (!previous) return true;
  if (previous.type === 'identifier') {
    return ['await', 'case', 'delete', 'in', 'instanceof', 'of', 'return', 'throw', 'typeof', 'void', 'yield']
      .includes(previous.value);
  }
  if (previous.type === 'string' || previous.type === 'computed-template' || previous.type === 'regex') return false;
  return ['(', '[', '{', ',', ';', ':', '=', '!', '?', '&', '|', '+', '-', '*', '%', '^', '~', '<', '>']
    .includes(previous.value);
}

function readJavascriptRegex(source, start) {
  let index = start + 1;
  let inCharacterClass = false;
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source[index] === '[') inCharacterClass = true;
    else if (source[index] === ']') inCharacterClass = false;
    else if (source[index] === '/' && !inCharacterClass) {
      index += 1;
      while (index < source.length && /[A-Za-z]/.test(source[index])) index += 1;
      return index;
    }
    index += 1;
  }
  return source.length;
}

function javascriptTokens(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === '/' && source[index + 1] === '/') {
      const end = source.indexOf('\n', index + 2);
      index = end === -1 ? source.length : end + 1;
      continue;
    }
    if (char === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    if (char === '/' && javascriptCanStartRegex(tokens)) {
      const end = readJavascriptRegex(source, index);
      tokens.push({ type: 'regex', value: null, start: index, end });
      index = end;
      continue;
    }
    if (char === "'" || char === '"') {
      const string = readJavascriptString(source, index, char);
      tokens.push({ type: 'string', value: string.value, start: index, end: string.end });
      index = string.end;
      continue;
    }
    if (char === '`') {
      const template = readJavascriptTemplate(source, index);
      tokens.push({
        type: template.value === null ? 'computed-template' : 'string',
        value: template.value,
        start: index,
        end: template.end,
      });
      index = template.end;
      continue;
    }
    if (/[A-Za-z_$]/.test(char)) {
      let end = index + 1;
      while (end < source.length && /[A-Za-z0-9_$]/.test(source[end])) end += 1;
      tokens.push({ type: 'identifier', value: source.slice(index, end), start: index, end });
      index = end;
      continue;
    }
    tokens.push({ type: 'punctuator', value: char, start: index, end: index + 1 });
    index += 1;
  }
  return tokens;
}

function closingParenthesis(tokens, openIndex) {
  let depth = 0;
  for (let index = openIndex; index < tokens.length; index += 1) {
    if (tokens[index].value === '(') depth += 1;
    else if (tokens[index].value === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function callArgument(tokens, openIndex, closeIndex, source) {
  const argumentTokens = tokens.slice(openIndex + 1, closeIndex);
  if (argumentTokens.length === 1 && argumentTokens[0].type === 'string') {
    return { value: argumentTokens[0].value, expression: source.slice(argumentTokens[0].start, argumentTokens[0].end) };
  }
  const start = argumentTokens[0]?.start ?? tokens[openIndex].end;
  return {
    value: null,
    expression: source.slice(start, tokens[closeIndex].start).trim(),
  };
}

function insertReturningChains(source) {
  const tokens = javascriptTokens(source);
  const chains = [];
  for (let index = 0; index < tokens.length - 2; index += 1) {
    if (tokens[index].value !== '.' || tokens[index + 1].value !== 'from' || tokens[index + 2].value !== '(') continue;
    const fromClose = closingParenthesis(tokens, index + 2);
    if (fromClose === -1
      || tokens[fromClose + 1]?.value !== '.'
      || tokens[fromClose + 2]?.value !== 'insert'
      || tokens[fromClose + 3]?.value !== '(') continue;
    const insertClose = closingParenthesis(tokens, fromClose + 3);
    if (insertClose === -1
      || tokens[insertClose + 1]?.value !== '.'
      || tokens[insertClose + 2]?.value !== 'select'
      || tokens[insertClose + 3]?.value !== '(') continue;
    const table = callArgument(tokens, index + 2, fromClose, source);
    chains.push({ table: table.value, tableExpression: table.expression, start: tokens[index].start });
  }
  return chains;
}

function nonTaskInsertReturningTables(source = taskStore) {
  return insertReturningChains(source)
    .map((chain) => chain.table)
    .filter((table) => table !== 'tasks')
    .sort((left, right) => String(left ?? '').localeCompare(String(right ?? '')));
}

function skipSqlSingleQuote(source, start) {
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === "'" && source[index + 1] === "'") {
      index += 2;
      continue;
    }
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source[index] === "'") return index + 1;
    index += 1;
  }
  return source.length;
}

function skipSqlDoubleQuote(source, start) {
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === '"' && source[index + 1] === '"') {
      index += 2;
      continue;
    }
    if (source[index] === '"') return index + 1;
    index += 1;
  }
  return source.length;
}

function sqlDollarTagAt(source, index) {
  return source.slice(index).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0] || '';
}

function splitSqlStatements(source) {
  const statements = [];
  let statementStart = 0;
  let index = 0;
  while (index < source.length) {
    if (source[index] === '-' && source[index + 1] === '-') {
      const end = source.indexOf('\n', index + 2);
      index = end === -1 ? source.length : end + 1;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '*') {
      let depth = 1;
      index += 2;
      while (index < source.length && depth > 0) {
        if (source[index] === '/' && source[index + 1] === '*') {
          depth += 1;
          index += 2;
        } else if (source[index] === '*' && source[index + 1] === '/') {
          depth -= 1;
          index += 2;
        } else {
          index += 1;
        }
      }
      continue;
    }
    if (source[index] === "'") {
      index = skipSqlSingleQuote(source, index);
      continue;
    }
    if (source[index] === '"') {
      index = skipSqlDoubleQuote(source, index);
      continue;
    }
    if (source[index] === '$') {
      const tag = sqlDollarTagAt(source, index);
      if (tag) {
        const end = source.indexOf(tag, index + tag.length);
        index = end === -1 ? source.length : end + tag.length;
        continue;
      }
    }
    if (source[index] === ';') {
      const statement = source.slice(statementStart, index + 1).trim();
      if (statement) statements.push(statement);
      statementStart = index + 1;
    }
    index += 1;
  }
  const tail = source.slice(statementStart).trim();
  if (tail) statements.push(tail);
  return statements;
}

function objectPolicyStatementsForBucket(sources, bucket) {
  const cleanBucket = String(bucket).toLowerCase();
  return sources
    .flatMap(splitSqlStatements)
    .filter((statement) => {
      const normalized = statement.toLowerCase().replaceAll('"', '');
      return /\bcreate\s+policy\b/.test(normalized)
        && /\bstorage\s*\.\s*objects\b/.test(normalized)
        && normalized.includes(cleanBucket);
    });
}

function browserStorageCalls(source) {
  const tokens = javascriptTokens(source);
  const calls = [];
  for (let index = 1; index < tokens.length - 2; index += 1) {
    if (tokens[index - 1].value !== 'storage'
      || tokens[index].value !== '.'
      || tokens[index + 1].value !== 'from'
      || tokens[index + 2].value !== '(') continue;
    const fromClose = closingParenthesis(tokens, index + 2);
    if (fromClose === -1) continue;
    const hasImmediateOperation = tokens[fromClose + 1]?.value === '.'
      && tokens[fromClose + 2]?.type === 'identifier'
      && tokens[fromClose + 3]?.value === '(';
    const bucket = callArgument(tokens, index + 2, fromClose, source);
    calls.push({
      bucket: bucket.value,
      bucketExpression: bucket.expression,
      operation: hasImmediateOperation ? tokens[fromClose + 2].value : null,
      start: tokens[index - 1].start,
    });
  }
  return calls;
}

function browserFormStorageViolations(sources, bucket) {
  const violations = [];
  for (const file of sources) {
    const tokens = javascriptTokens(file.source);
    if (tokens.some((token) => token.type === 'string' && token.value === bucket)) {
      violations.push({ path: file.path, reason: 'browser names the server-only bucket' });
      continue;
    }
    for (const call of browserStorageCalls(file.source)) {
      const expression = call.bucketExpression.replace(/\s+/g, '');
      const formDerivedBucket = expression === 'payload.bucket_id'
        || /(?:form|response).*bucket|bucket.*(?:form|response)/i.test(expression);
      const serverIssuedSignedUpload = expression === 'payload.bucket_id'
        && call.operation === 'uploadToSignedUrl';
      if (formDerivedBucket && !serverIssuedSignedUpload) {
        violations.push({
          path: file.path,
          reason: `${call.operation} uses a form-derived bucket expression`,
        });
      }
    }
  }
  return violations;
}

function browserJavascriptSources(directory, prefix) {
  const sources = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = `${prefix}/${entry.name}`;
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) sources.push(...browserJavascriptSources(url, path));
    else if (/\.[cm]?js$/i.test(entry.name)) sources.push({ path, source: readFileSync(url, 'utf8') });
  }
  return sources;
}

test('insert-returning inventory resolves every JavaScript string literal form, ignores source-like text, and fails closed on computed tables', () => {
  const fixture = `
    const TABLE_NAME = 'computed_table';
    db.from('alpha').insert(row).select();
    db.from("beta").insert(row).select();
    db.from(\`gamma\`).insert(row).select();
    db.from(TABLE_NAME).insert(row).select();
    "db.from('string_decoy').insert(row).select()";
    // db.from('line_comment_decoy').insert(row).select();
    /* db.from('block_comment_decoy').insert(row).select(); */
    const regexDecoy = /.from('regex_decoy').insert(row).select()/;
  `;

  assert.deepEqual(nonTaskInsertReturningTables(fixture), [
    null,
    'alpha',
    'beta',
    'gamma',
  ]);
});

test('SQL statement splitting keeps policy predicates after comment, quoted, and dollar-body semicolons', () => {
  const fixture = `
    create policy "form; file reads"
    -- server-only; temporary note
    on storage.objects for select
    using (
      bucket_id = 'quest-form-response-files'
      and app_private.allowed_path('folder;name')
      and app_private.policy_body($guard$begin; end$guard$)
    );
    select 'unrelated; statement';
  `;

  const statements = splitSqlStatements(fixture);
  assert.equal(statements.length, 2);
  assert.equal(objectPolicyStatementsForBucket([fixture], 'quest-form-response-files').length, 1);
  assert.match(objectPolicyStatementsForBucket([fixture], 'quest-form-response-files')[0], /bucket_id = 'quest-form-response-files'/);
});

test('browser form-file capability scan rejects direct target-bucket operations anywhere while allowing other buckets', () => {
  const allowed = [{
    path: 'allowed.js',
    source: `
      client.storage.from('quest-job-files').upload(path, file);
      client.storage.from("quest-message-attachments").list();
      client.storage.from(\`avatars\`).download(path);
      client.storage.from('quest-client-portal-documents').remove([path]);
      client.storage.from('quest-job-files').createSignedUrl(path);
      client.storage.from(payload.bucket_id).uploadToSignedUrl(payload.object_path, payload.token, file);
    `,
  }];
  assert.deepEqual(browserFormStorageViolations(allowed, 'quest-form-response-files'), []);

  for (const operation of ['upload', 'list', 'download', 'remove', 'createSignedUrl', 'createSignedUploadUrl']) {
    const violations = browserFormStorageViolations([{
      path: `unsafe-${operation}.js`,
      source: `client.storage.from('quest-form-response-files').${operation}(path);`,
    }], 'quest-form-response-files');
    assert.equal(violations.length, 1, `${operation} must not target the form-response bucket in browser code`);
  }

  const computedViolation = browserFormStorageViolations([{
    path: 'unsafe-server-payload.js',
    source: 'client.storage.from(payload.bucket_id).remove([payload.object_path]);',
  }], 'quest-form-response-files');
  assert.equal(computedViolation.length, 1);

  const detachedCapabilityViolation = browserFormStorageViolations([{
    path: 'unsafe-detached-capability.js',
    source: 'const formBucket = client.storage.from(payload.bucket_id); formBucket.remove([payload.object_path]);',
  }], 'quest-form-response-files');
  assert.equal(detachedCapabilityViolation.length, 1);

  const unverifiedSignedCapability = browserFormStorageViolations([{
    path: 'unsafe-unverified-signed-capability.js',
    source: 'client.storage.from(formResponseBucket).uploadToSignedUrl(path, token, file);',
  }], 'quest-form-response-files');
  assert.equal(unverifiedSignedCapability.length, 1);
});

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
  const browserSources = [
    ...browserJavascriptSources(new URL('../src/', import.meta.url), 'src'),
    ...browserJavascriptSources(new URL('../taskmanagement/js/', import.meta.url), 'taskmanagement/js'),
  ];
  const migrationSources = readdirSync(migrationDirectory, { encoding: 'utf8' })
    .filter((name) => name.endsWith('.sql'))
    .map((name) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  const matchingObjectPolicies = objectPolicyStatementsForBucket(migrationSources, 'quest-form-response-files');
  const serverPayloadStorageCalls = browserSources.flatMap((file) => (
    browserStorageCalls(file.source)
      .filter((call) => call.bucketExpression.replace(/\s+/g, '') === 'payload.bucket_id')
      .map((call) => ({
        path: file.path,
        bucketExpression: call.bucketExpression.replace(/\s+/g, ''),
        operation: call.operation,
      }))
  ));

  assert.match(uploadSource, /\.uploadToSignedUrl\(payload\.object_path, payload\.token, file/);
  assert.doesNotMatch(uploadSource, /\.(?:upload|list|download|remove|createSignedUrl)\(/);
  assert.deepEqual(browserFormStorageViolations(browserSources, 'quest-form-response-files'), []);
  assert.deepEqual(serverPayloadStorageCalls, [{
    path: 'src/main.js',
    bucketExpression: 'payload.bucket_id',
    operation: 'uploadToSignedUrl',
  }]);
  assert.match(uploadApi, /createStorageClient/);
  assert.match(uploadApi, /createSignedUploadUrl\(objectPath, \{ upsert: false \}\)/);
  assert.match(urlApi, /createStorageClient/);
  assert.match(urlApi, /createSignedUrl\(objectPath, 60 \* 60/);
  assert.match(hardeningMigration, /\('quest-form-response-files', 'quest-form-response-files', false, 15728640,[\s\S]*?array\['application\/pdf','image\/png','image\/jpeg','image\/webp','text\/plain','text\/csv'\]\)/);
  assert.deepEqual(matchingObjectPolicies, []);
});
