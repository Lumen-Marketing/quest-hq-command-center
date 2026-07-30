import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

function openingParenthesis(tokens, closeIndex) {
  let depth = 0;
  for (let index = closeIndex; index >= 0; index -= 1) {
    if (tokens[index].value === ')') depth += 1;
    else if (tokens[index].value === '(') {
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

function simpleBuilderAssignment(tokens, declarationIndex, source) {
  const nameToken = tokens[declarationIndex + 1];
  if (!nameToken
    || nameToken.type !== 'identifier'
    || tokens[declarationIndex + 2]?.value !== '=') return null;

  const expressionStart = declarationIndex + 3;
  let statementEnd = expressionStart;
  while (statementEnd < tokens.length && tokens[statementEnd].value !== ';') statementEnd += 1;
  const expressionEnd = statementEnd;
  for (let index = expressionStart; index < expressionEnd - 2; index += 1) {
    if (tokens[index].value !== '.'
      || tokens[index + 1]?.value !== 'from'
      || tokens[index + 2]?.value !== '(') continue;
    const fromClose = closingParenthesis(tokens, index + 2);
    if (fromClose === -1 || fromClose !== expressionEnd - 1) return { name: nameToken.value, table: null };

    const receiver = tokens.slice(expressionStart, index);
    const simpleReceiver = receiver.length > 0
      && receiver.every((token, receiverIndex) => (
        receiverIndex % 2 === 0 ? token.type === 'identifier' : token.value === '.'
      ));
    if (!simpleReceiver) return { name: nameToken.value, table: null };
    return {
      name: nameToken.value,
      table: callArgument(tokens, index + 2, fromClose, source).value,
    };
  }
  return { name: nameToken.value, table: null };
}

function insertReturningChains(source) {
  const tokens = javascriptTokens(source);
  const chains = [];
  const builderTables = new Map();
  for (let index = 0; index < tokens.length - 2; index += 1) {
    if (['const', 'let', 'var'].includes(tokens[index].value)) {
      const assignment = simpleBuilderAssignment(tokens, index, source);
      if (assignment) {
        builderTables.set(
          assignment.name,
          builderTables.has(assignment.name) ? null : assignment.table,
        );
      }
    } else if (tokens[index].type === 'identifier'
      && tokens[index + 1]?.value === '='
      && tokens[index + 2]?.value !== '='
      && !['const', 'let', 'var'].includes(tokens[index - 1]?.value)
      && builderTables.has(tokens[index].value)) {
      builderTables.set(tokens[index].value, null);
    }

    if (tokens[index].value !== '.'
      || tokens[index + 1]?.value !== 'insert'
      || tokens[index + 2]?.value !== '(') continue;
    const insertClose = closingParenthesis(tokens, index + 2);
    if (insertClose === -1
      || tokens[insertClose + 1]?.value !== '.'
      || tokens[insertClose + 2]?.value !== 'select'
      || tokens[insertClose + 3]?.value !== '(') continue;

    let table = null;
    let tableExpression = '';
    const receiver = tokens[index - 1];
    if (receiver?.type === 'identifier') {
      table = builderTables.has(receiver.value) ? builderTables.get(receiver.value) : null;
      tableExpression = receiver.value;
    } else if (receiver?.value === ')') {
      const fromOpen = openingParenthesis(tokens, index - 1);
      if (fromOpen !== -1
        && tokens[fromOpen - 1]?.value === 'from'
        && tokens[fromOpen - 2]?.value === '.') {
        const argument = callArgument(tokens, fromOpen, index - 1, source);
        table = argument.value;
        tableExpression = argument.expression;
      }
    }
    chains.push({ table, tableExpression, start: tokens[index].start });
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

function stripSqlComments(source) {
  let output = '';
  let index = 0;
  while (index < source.length) {
    if (source[index] === '-' && source[index + 1] === '-') {
      const end = source.indexOf('\n', index + 2);
      const commentEnd = end === -1 ? source.length : end;
      output += ' '.repeat(commentEnd - index);
      index = commentEnd;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '*') {
      const start = index;
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
      output += source.slice(start, index).replace(/[^\r\n]/g, ' ');
      continue;
    }
    if (source[index] === "'") {
      const end = skipSqlSingleQuote(source, index);
      output += source.slice(index, end);
      index = end;
      continue;
    }
    if (source[index] === '"') {
      const end = skipSqlDoubleQuote(source, index);
      output += source.slice(index, end);
      index = end;
      continue;
    }
    if (source[index] === '$') {
      const tag = sqlDollarTagAt(source, index);
      if (tag) {
        const closingIndex = source.indexOf(tag, index + tag.length);
        const end = closingIndex === -1 ? source.length : closingIndex + tag.length;
        output += source.slice(index, end);
        index = end;
        continue;
      }
    }
    output += source[index];
    index += 1;
  }
  return output;
}

function objectPolicyStatementsForBucket(sources, bucket) {
  const cleanBucket = String(bucket).toLowerCase();
  return sources
    .flatMap(splitSqlStatements)
    .filter((statement) => {
      const normalized = stripSqlComments(statement).toLowerCase().replaceAll('"', '');
      return /\bcreate\s+policy\b/.test(normalized)
        && normalized.includes(cleanBucket);
    });
}

function concatenatedJavascriptStringValues(source) {
  const tokens = javascriptTokens(source);
  const values = [];
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].type !== 'string') continue;
    let value = tokens[index].value;
    let cursor = index + 1;
    while (tokens[cursor]?.value === '+' && tokens[cursor + 1]?.type === 'string') {
      value += tokens[cursor + 1].value;
      cursor += 2;
    }
    values.push(value);
    index = cursor - 1;
  }
  return values;
}

function browserSourcesNamingBucket(sources, bucket) {
  return sources
    .filter((file) => concatenatedJavascriptStringValues(file.source).includes(bucket))
    .map((file) => file.path)
    .sort();
}

function browserCapabilitySourcePaths(sources) {
  const capabilityValues = new Set(['/api/public-form-file-upload', 'uploadToSignedUrl']);
  return sources
    .filter((file) => javascriptTokens(file.source).some((token) => capabilityValues.has(token.value)))
    .map((file) => file.path)
    .sort();
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

test('insert-returning inventory resolves detached builders and fails closed on unknown receivers', () => {
  const fixture = `
    const checkinQuery = this.supabase.from('checkin_settings');
    await checkinQuery.insert(row).select();
    await unknownBuilder.insert(row).select();
    let reassignedQuery = this.supabase.from('tasks');
    reassignedQuery = this.supabase.from('checkin_settings');
    await reassignedQuery.insert(row).select();
  `;

  assert.deepEqual(nonTaskInsertReturningTables(fixture), [
    null,
    null,
    'checkin_settings',
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

test('policy inventory catches search-path targets and ignores bucket names mentioned only in comments', () => {
  const unqualifiedPolicy = `
    set search_path = storage, public;
    create policy form_file_reads on objects
      for select using (bucket_id = 'quest-form-response-files');
  `;
  const commentOnly = `
    -- Never create policy on storage.objects for quest-form-response-files.
    select 1;
  `;

  assert.equal(objectPolicyStatementsForBucket([unqualifiedPolicy], 'quest-form-response-files').length, 1);
  assert.deepEqual(objectPolicyStatementsForBucket([commentOnly], 'quest-form-response-files'), []);
});

test('public form upload capability is isolated and returns metadata without leaking the signing token', async () => {
  const uploadModuleUrl = new URL('../src/forms/public-form-file-upload.js', import.meta.url);
  assert.ok(existsSync(uploadModuleUrl), 'the isolated public form upload capability module should exist');

  const { uploadPublicFormFile } = await import(uploadModuleUrl.href);
  const bytes = new TextEncoder().encode('%PDF-1.7\n');
  const file = {
    name: 'proof.pdf',
    size: bytes.byteLength,
    type: 'application/pdf',
    lastModified: 123,
    slice(start, end) {
      const chunk = bytes.slice(start, end);
      return {
        async arrayBuffer() {
          return chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
        },
      };
    },
  };
  const requests = [];
  const uploads = [];
  const result = await uploadPublicFormFile({
    form: { id: 'form-1' },
    question: { id: 'question-1' },
    file,
    fetchImpl: async (...args) => {
      requests.push(args);
      return {
        ok: true,
        async json() {
          return {
            bucket_id: 'server-issued-bucket',
            object_path: 'company/form/question/proof.pdf',
            token: 'server-issued-secret',
          };
        },
      };
    },
    createSupabaseClient: () => ({
      storage: {
        from(bucket) {
          return {
            async uploadToSignedUrl(path, token, uploadedFile, options) {
              uploads.push({ bucket, path, token, uploadedFile, options });
              return { error: null };
            },
          };
        },
      },
    }),
    now: () => '2026-07-31T00:00:00.000Z',
  });

  assert.equal(requests[0][0], '/api/public-form-file-upload');
  assert.deepEqual(JSON.parse(requests[0][1].body), {
    form_id: 'form-1',
    question_id: 'question-1',
    file_name: 'proof.pdf',
    file_type: 'application/pdf',
    file_size: bytes.byteLength,
  });
  assert.deepEqual(uploads, [{
    bucket: 'server-issued-bucket',
    path: 'company/form/question/proof.pdf',
    token: 'server-issued-secret',
    uploadedFile: file,
    options: { contentType: 'application/pdf' },
  }]);
  assert.deepEqual(result, {
    kind: 'file',
    name: 'proof.pdf',
    size: bytes.byteLength,
    type: 'application/pdf',
    lastModified: 123,
    data_url: '',
    bucket_id: 'server-issued-bucket',
    object_path: 'company/form/question/proof.pdf',
    uploaded_at: '2026-07-31T00:00:00.000Z',
  });
  assert.equal('token' in result, false);
});

test('browser capability boundary catches concatenated private-bucket literals and permits unrelated buckets', () => {
  const sources = [{
    path: 'safe.js',
    source: `
      client.storage.from('quest-job-files').upload(path, file);
      client.storage.from('quest-message-attachments').list();
    `,
  }, {
    path: 'unsafe.js',
    source: "client.storage.from('quest-form-' + /* hidden */ 'response-files').upload(path, file);",
  }];

  assert.deepEqual(browserSourcesNamingBucket(sources, 'quest-form-response-files'), ['unsafe.js']);
  assert.deepEqual(browserSourcesNamingBucket([sources[0]], 'quest-form-response-files'), []);
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

test('form-response files remain a private, signed-only route behind one browser capability module and no object policies', () => {
  const uploadSource = functionSource('uploadPublicFormFile', 'collectFormAnswers');
  const uploadModule = readFileSync(new URL('../src/forms/public-form-file-upload.js', import.meta.url), 'utf8');
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

  assert.match(uploadSource, /import\('\.\/forms\/public-form-file-upload\.js'\)/);
  assert.match(uploadSource, /return uploadModule\.uploadPublicFormFile\(\{/);
  assert.doesNotMatch(uploadSource, /payload\.(?:bucket_id|object_path|token)|uploadToSignedUrl|\/api\/public-form-file-upload/);
  assert.match(uploadModule, /fetchImpl\('\/api\/public-form-file-upload'/);
  assert.match(uploadModule, /\.uploadToSignedUrl\(payload\.object_path, payload\.token, file/);
  assert.deepEqual(browserCapabilitySourcePaths(browserSources), ['src/forms/public-form-file-upload.js']);
  assert.deepEqual(browserSourcesNamingBucket(browserSources, 'quest-form-response-files'), []);
  assert.match(uploadApi, /createStorageClient/);
  assert.match(uploadApi, /createSignedUploadUrl\(objectPath, \{ upsert: false \}\)/);
  assert.match(urlApi, /createStorageClient/);
  assert.match(urlApi, /createSignedUrl\(objectPath, 60 \* 60/);
  assert.match(hardeningMigration, /\('quest-form-response-files', 'quest-form-response-files', false, 15728640,[\s\S]*?array\['application\/pdf','image\/png','image\/jpeg','image\/webp','text\/plain','text\/csv'\]\)/);
  assert.deepEqual(matchingObjectPolicies, []);
});
