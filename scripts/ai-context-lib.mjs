import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

export const AI_BRAIN_FILES = [
  '.ai/README.md',
  '.ai/context.md',
  '.ai/architecture.md',
  '.ai/current-state.md',
  '.ai/operations.md',
  '.ai/decisions.md',
  '.ai/known-issues.md',
  '.ai/manifest.json',
  '.ai/database/overview.md',
  '.ai/database/schema.md',
  '.ai/database/relationships.md',
  '.ai/database/functions.md',
  '.ai/database/security.md',
  '.ai/database/storage.md',
  '.ai/database/snapshot.json',
  '.ai/database/introspection.sql',
];

export const ADAPTER_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
];

export const REQUIRED_FILES = [...AI_BRAIN_FILES, ...ADAPTER_FILES, 'package.json'];

const MAX_CONTEXT_AGE_MS = 45 * 24 * 60 * 60 * 1000;
const FUTURE_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

function isTimestamp(value) {
  return typeof value === 'string'
    && value.length > 0
    && !Number.isNaN(Date.parse(value));
}

function validateFreshTimestamp(value, label, errors) {
  if (!isTimestamp(value)) {
    errors.push(label + ' must be an ISO timestamp');
    return;
  }
  const age = Date.now() - Date.parse(value);
  if (age < -FUTURE_TIMESTAMP_TOLERANCE_MS) errors.push(label + ' cannot be in the future');
  if (age > MAX_CONTEXT_AGE_MS) errors.push(label + ' is stale; refresh live project context');
}

function toRepoPath(value) {
  return value.split(path.sep).join('/');
}

function readRepoFile(repoRoot, relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function listFilesRecursively(root, relativeRoot) {
  const absoluteRoot = path.join(root, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  const results = [];
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const relativePath = path.join(relativeRoot, entry.name);
    if (entry.isDirectory()) results.push(...listFilesRecursively(root, relativePath));
    else if (entry.isFile()) results.push(toRepoPath(relativePath));
  }
  return results;
}

export function latestMigrationFilename(names) {
  return names
    .filter((name) => /^\d{12,14}_.+\.sql$/.test(name))
    .sort((a, b) => a.localeCompare(b))
    .at(-1) || '';
}

// How far main may move past the manifest's capture before it is worth saying so out loud.
// Not zero, and it cannot be: a manifest is written before the commit that carries it, so its
// capture always names an earlier commit than HEAD. One or two is that lag; several is drift.
export const BRAIN_DRIFT_COMMIT_THRESHOLD = 3;

// Paths whose movement makes the brain's live picture doubtful. A QA spreadsheet or a docs edit
// does not; a migration, an endpoint, the build or the deployment config does.
export const BRAIN_MATERIAL_PATHS = Object.freeze([
  'src', 'api', 'supabase/migrations', 'scripts', 'vercel.json', 'index.html', 'package.json',
]);

/**
 * A WARNING, never an error, and deliberately so.
 *
 * The 2026-09-17 audit found this manifest naming a commit ten behind; two days later it was six
 * behind again. Nothing in this validator could catch either, because it checks that timestamps
 * parse and are under 45 days old -- not that they describe the commit anybody is actually running.
 *
 * It stays a warning because clearing it means re-verifying live Supabase and Vercel state, which
 * needs network and credentials that a test run legitimately may not have. Failing the build would
 * mean a laptop without database access could not commit a typo fix.
 */
export function describeBrainDrift(materialCommitCount, threshold = BRAIN_DRIFT_COMMIT_THRESHOLD) {
  if (!Number.isSafeInteger(materialCommitCount) || materialCommitCount <= threshold) return null;
  return 'the manifest was captured ' + materialCommitCount
    + ' material commits ago; re-verify live state and refresh .ai/manifest.json';
}

export function validateManifest(manifest, latestMigration) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
  if (manifest.schema_version !== 1) errors.push('manifest schema_version must be 1');
  validateFreshTimestamp(manifest.generated_at, 'manifest generated_at', errors);
  if (typeof manifest.generated_from_commit !== 'string'
      || !/^[0-9a-f]{7,40}$/i.test(manifest.generated_from_commit)) {
    errors.push('manifest generated_from_commit must be a Git commit hash');
  }
  if (!manifest.repository || typeof manifest.repository !== 'object') {
    errors.push('manifest repository source is required');
  } else if (manifest.repository.latest_migration !== latestMigration) {
    errors.push('manifest latest migration does not match the repository');
  }
  for (const field of ['supabase_verified_at', 'vercel_verified_at', 'github_verified_at']) {
    validateFreshTimestamp(manifest.live?.[field], 'manifest live.' + field, errors);
  }
  return errors;
}

export function validateAdapterSources(adapters) {
  const errors = [];
  for (const adapter of ADAPTER_FILES) {
    const content = adapters?.[adapter];
    if (typeof content !== 'string' || !content.includes('.ai/README.md')) {
      errors.push(adapter + ' must direct agents to .ai/README.md');
    }
  }
  return errors;
}

export function findBrokenMarkdownLinks(markdown, sourceFile, repoRoot) {
  const broken = new Set();
  const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(markdown)) !== null) {
    let target = match[1].trim();
    const angleTarget = target.match(/^<([^>]+)>(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?$/);
    const titledTarget = target.match(/^(\S+)\s+(?:"[^"]*"|'[^']*'|\([^)]*\))$/);
    if (angleTarget) target = angleTarget[1];
    else if (titledTarget) target = titledTarget[1];
    if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    target = target.split('#')[0].split('?')[0];
    if (!target) continue;
    let decodedTarget = target;
    try {
      decodedTarget = decodeURIComponent(target);
    } catch {
      // Let the filesystem check report malformed encoded links as missing.
    }
    const absoluteTarget = path.resolve(path.dirname(sourceFile), decodedTarget);
    if (!existsSync(absoluteTarget)) {
      broken.add(toRepoPath(path.relative(repoRoot, absoluteTarget)));
    }
  }
  return [...broken].sort();
}

const SENSITIVE_PATTERNS = [
  {
    label: 'private key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    label: 'Stripe secret key',
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{12,}\b/g,
  },
  {
    label: 'Supabase secret key',
    pattern: /\bsb_secret_[A-Za-z0-9_-]{12,}\b/g,
  },
  {
    label: 'GitHub access token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
  },
  {
    label: 'Vercel access token',
    pattern: /\bVERCEL_TOKEN\s*[:=]\s*["']?[^\s"'`]{16,}/g,
  },
  {
    label: 'JWT-like credential',
    pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    label: 'assigned server credential such as STRIPE_SECRET_KEY',
    pattern: /\b(?:STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ACCESS_TOKEN|CRON_SECRET|DATABASE_URL|GITHUB_TOKEN|GH_TOKEN|VERCEL_TOKEN|OPENAI_API_KEY)\s*[:=]\s*["']?[^\s"'`]{8,}/g,
  },
];

export function findSensitiveContent(files) {
  const errors = [];
  for (const file of files) {
    for (const { label, pattern } of SENSITIVE_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(file.content)) errors.push(file.path + ': possible ' + label);
    }
  }
  return errors;
}

function collectForbiddenSnapshotKeys(value, currentPath = '$', results = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenSnapshotKeys(item, currentPath + '[' + index + ']', results));
    return results;
  }
  if (!value || typeof value !== 'object') return results;
  const forbidden = new Set(['rows', 'records', 'row_data', 'row_payload', 'row_payloads', 'payloads', 'row_count']);
  for (const [key, child] of Object.entries(value)) {
    const childPath = currentPath + '.' + key;
    if (forbidden.has(key.toLowerCase())) results.push(childPath);
    collectForbiddenSnapshotKeys(child, childPath, results);
  }
  return results;
}

function validateCatalogObjectKeys(items, allowedKeys, section, errors) {
  if (!Array.isArray(items)) return;
  const allowed = new Set(allowedKeys);
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push('database snapshot ' + section + '[' + index + '] must be a catalog object');
      return;
    }
    const unexpected = Object.keys(item).filter((key) => !allowed.has(key));
    if (unexpected.length) {
      errors.push(
        'database snapshot ' + section + '[' + index + '] contains unexpected catalog field: '
          + unexpected.join(', '),
      );
    }
  });
}

export function validateDatabaseSnapshot(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== 'object') return ['database snapshot must be an object'];
  const allowedRootKeys = new Set([
    'schema_version',
    'captured_at',
    'scope',
    'source',
    'tables',
    'relationships',
    'policies',
    'functions',
    'triggers',
    'buckets',
    'extensions',
    'cron_jobs',
    'migrations',
  ]);
  const unexpectedRootKeys = Object.keys(snapshot).filter((key) => !allowedRootKeys.has(key));
  if (unexpectedRootKeys.length) {
    errors.push('database snapshot contains unexpected catalog field: ' + unexpectedRootKeys.join(', '));
  }
  if (snapshot.source && typeof snapshot.source === 'object' && !Array.isArray(snapshot.source)) {
    const allowedSourceKeys = new Set([
      'project_ref',
      'region',
      'status',
      'postgres_version',
      'postgres_engine',
      'release_channel',
    ]);
    const unexpectedSourceKeys = Object.keys(snapshot.source).filter((key) => !allowedSourceKeys.has(key));
    if (unexpectedSourceKeys.length) {
      errors.push('database snapshot source contains unexpected catalog field: ' + unexpectedSourceKeys.join(', '));
    }
  }
  if (snapshot.schema_version !== 1) errors.push('database snapshot schema_version must be 1');
  if (!isTimestamp(snapshot.captured_at)) errors.push('database snapshot captured_at must be an ISO timestamp');
  if (!snapshot.source?.project_ref || !snapshot.source?.postgres_version) {
    errors.push('database snapshot source metadata is incomplete');
  }
  const arrayFields = [
    'tables',
    'relationships',
    'policies',
    'functions',
    'triggers',
    'buckets',
    'extensions',
    'cron_jobs',
    'migrations',
  ];
  for (const field of arrayFields) {
    if (!Array.isArray(snapshot[field])) errors.push('database snapshot ' + field + ' must be an array');
  }
  validateCatalogObjectKeys(
    snapshot.tables,
    ['schema', 'name', 'rls_enabled', 'columns', 'primary_key'],
    'tables',
    errors,
  );
  if (Array.isArray(snapshot.tables)) {
    snapshot.tables.forEach((table, index) => {
      validateCatalogObjectKeys(
        table?.columns,
        ['name', 'position', 'data_type', 'udt_name', 'nullable', 'default'],
        'tables[' + index + '].columns',
        errors,
      );
    });
  }
  validateCatalogObjectKeys(
    snapshot.relationships,
    ['name', 'from_table', 'from_column', 'to_table', 'to_column', 'update_rule', 'delete_rule'],
    'relationships',
    errors,
  );
  validateCatalogObjectKeys(
    snapshot.policies,
    ['table', 'name', 'permissive', 'roles', 'command'],
    'policies',
    errors,
  );
  validateCatalogObjectKeys(
    snapshot.functions,
    [
      'name',
      'arguments',
      'returns',
      'security_definer',
      'volatility',
      'anon_execute',
      'authenticated_execute',
      'service_role_execute',
    ],
    'functions',
    errors,
  );
  validateCatalogObjectKeys(
    snapshot.triggers,
    ['table', 'name', 'event', 'timing', 'orientation'],
    'triggers',
    errors,
  );
  validateCatalogObjectKeys(
    snapshot.buckets,
    ['id', 'name', 'public', 'file_size_limit', 'allowed_mime_types'],
    'buckets',
    errors,
  );
  validateCatalogObjectKeys(snapshot.extensions, ['name', 'version'], 'extensions', errors);
  validateCatalogObjectKeys(snapshot.cron_jobs, ['name', 'schedule', 'active', 'database'], 'cron_jobs', errors);
  validateCatalogObjectKeys(snapshot.migrations, ['version', 'name'], 'migrations', errors);
  const forbiddenPaths = collectForbiddenSnapshotKeys(snapshot);
  if (forbiddenPaths.length) {
    errors.push('database snapshot contains row payload fields: ' + forbiddenPaths.join(', '));
  }
  if (Array.isArray(snapshot.tables)
      && snapshot.tables.some((table) => table?.schema === 'auth' && table?.name === 'users')) {
    errors.push('database snapshot must not catalog auth.users');
  }
  return errors;
}

function parseJsonFile(files, relativePath, errors) {
  try {
    return JSON.parse(files.get(relativePath));
  } catch (error) {
    errors.push(relativePath + ' is not valid JSON: ' + error.message);
    return null;
  }
}

export function validateProjectBrain(repoRoot) {
  const errors = [];
  const files = new Map();
  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      errors.push('missing required project-brain file: ' + relativePath);
      continue;
    }
    files.set(relativePath, readRepoFile(repoRoot, relativePath));
  }

  const migrationDir = path.join(repoRoot, 'supabase', 'migrations');
  const migrationNames = existsSync(migrationDir)
    ? readdirSync(migrationDir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name)
    : [];
  const latestMigration = latestMigrationFilename(migrationNames);

  if (files.has('.ai/manifest.json')) {
    const manifest = parseJsonFile(files, '.ai/manifest.json', errors);
    if (manifest) errors.push(...validateManifest(manifest, latestMigration));
  }
  if (files.has('.ai/database/snapshot.json')) {
    const snapshot = parseJsonFile(files, '.ai/database/snapshot.json', errors);
    if (snapshot) errors.push(...validateDatabaseSnapshot(snapshot));
  }

  const adapters = Object.fromEntries(
    ADAPTER_FILES.filter((name) => files.has(name)).map((name) => [name, files.get(name)]),
  );
  errors.push(...validateAdapterSources(adapters));

  for (const markdownPath of listFilesRecursively(repoRoot, '.ai').filter((name) => name.endsWith('.md'))) {
    const content = readRepoFile(repoRoot, markdownPath);
    files.set(markdownPath, content);
    const broken = findBrokenMarkdownLinks(content, path.join(repoRoot, markdownPath), repoRoot);
    for (const target of broken) errors.push(markdownPath + ' links to missing target: ' + target);
  }

  const securityFiles = [
    ...listFilesRecursively(repoRoot, '.ai'),
    ...ADAPTER_FILES,
  ]
    .filter((name) => existsSync(path.join(repoRoot, name)))
    .map((name) => ({ path: name, content: readRepoFile(repoRoot, name) }));
  errors.push(...findSensitiveContent(securityFiles));

  if (files.has('package.json')) {
    const packageJson = parseJsonFile(files, 'package.json', errors);
    if (packageJson) {
      if (packageJson.scripts?.['ai:check'] !== 'node scripts/check-ai-context.mjs') {
        errors.push('package.json must define the canonical ai:check command');
      }
      if (!packageJson.scripts?.check?.includes('npm run ai:check')) {
        errors.push('package.json check must run ai:check');
      }
    }
  }

  return {
    errors: [...new Set(errors)].sort(),
    summary: {
      required_files: REQUIRED_FILES.length,
      markdown_files: [...files.keys()].filter((name) => name.endsWith('.md')).length,
      latest_migration: latestMigration,
    },
    files,
  };
}
