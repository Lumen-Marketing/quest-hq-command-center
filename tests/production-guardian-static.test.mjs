import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('production guardian checks main and maintains one recoverable incident', () => {
  const source = readFileSync(
    new URL('../.github/workflows/production-guardian.yml', import.meta.url),
    'utf8',
  );

  assert.match(source, /^name:\s*Production Guardian$/m);
  assert.match(source, /cron:\s*['"]17 \*\/6 \* \* \*['"]/);
  assert.match(source, /^\s{2}workflow_dispatch:\s*$/m);

  const permissions = source.match(/^permissions:[\t ]*\r?\n((?: {2}[^\r\n]+\r?\n)+)/m)?.[1] ?? '';
  assert.deepEqual(
    permissions.trim().split('\n').map((line) => line.trim()),
    ['contents: read', 'issues: write'],
  );

  assert.match(
    source,
    /^concurrency:[\t ]*\r?\n {2}group:[\t ]*production-guardian[\t ]*\r?\n {2}queue:[\t ]*max[\t ]*\r?\n {2}cancel-in-progress:[\t ]*false$/m,
  );
  assert.match(source, /uses:\s*actions\/checkout@v4[\s\S]*?with:\s*\n\s+ref:\s*main/);
  assert.match(source, /uses:\s*actions\/setup-node@v4[\s\S]*?node-version:\s*22/);
  assert.match(source, /run:\s*npm ci\b/);
  assert.match(source, /id:\s*revision[\s\S]*?git rev-parse HEAD[\s\S]*?GITHUB_OUTPUT/);
  assert.match(source, /id:\s*smoke[\s\S]*?continue-on-error:\s*true/);
  assert.match(
    source,
    /npm run smoke:prod -- --base-url https:\/\/quest-hq-command-center-gamma\.vercel\.app --expect-sha "\$\{\{ steps\.revision\.outputs\.sha \}\}"/,
  );

  assert.equal(source.match(/uses:\s*actions\/github-script@v7/g)?.length, 2);
  assert.equal(
    source.match(/\[Production Guardian\] Quest HQ production smoke check failing/g)?.length,
    2,
  );
  assert.match(source, /if:\s*steps\.smoke\.outcome == 'failure'/);
  assert.match(source, /state:\s*'all'/);
  assert.match(source, /github\.rest\.issues\.create\(/);
  assert.match(source, /github\.rest\.issues\.update\([\s\S]*?state:\s*'open'/);
  assert.match(source, /github\.rest\.issues\.createComment\(/);
  assert.match(source, /if:\s*always\(\) && steps\.smoke\.outcome == 'success'/);
  assert.match(source, /github\.rest\.issues\.update\([\s\S]*?state:\s*'closed'/);
  assert.match(source, /if:\s*always\(\) && steps\.smoke\.outcome == 'failure'[\s\S]*?run:\s*exit 1/);

  assert.doesNotMatch(source, /secrets\./);
  assert.doesNotMatch(source, /npm run (?:dev|preview)/);
});
