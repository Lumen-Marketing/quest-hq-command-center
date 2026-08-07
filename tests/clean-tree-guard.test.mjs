import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Production was deployed with uncommitted changes in it. A local `vercel --prod` uploads
// the working tree rather than a commit, so that build reports a SHA it is not, and rolling
// back to that SHA gives you different software than the one serving traffic.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'scripts', 'check-clean-tree.mjs');

function runIn(cwd) {
  try {
    const stdout = execFileSync(process.execPath, [script], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out: stdout };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

function scratchRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'quest-clean-tree-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  writeFileSync(join(dir, 'app.js'), 'export const a = 1;\n');
  git('add', '-A');
  git('commit', '-qm', 'first');
  return { dir, git };
}

test('a clean tree passes and names the commit being shipped', () => {
  const { dir } = scratchRepo();
  try {
    const result = runIn(dir);
    assert.equal(result.code, 0, result.out);
    assert.match(result.out, /Clean tree: \S+ at [0-9a-f]{40}/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a tracked modification stops the deploy and says which file', () => {
  const { dir } = scratchRepo();
  try {
    writeFileSync(join(dir, 'app.js'), 'export const a = 2;\n');
    const result = runIn(dir);
    assert.equal(result.code, 1);
    assert.match(result.out, /Refusing to build for production/);
    assert.match(result.out, /app\.js/, 'naming the file is the whole point of the message');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an untracked scratch file is not treated as a code change', () => {
  // vercel honours .gitignore, and a stray report or a scratch script does not ship. Failing
  // on those would train people to pass the flag that skips the check.
  const { dir } = scratchRepo();
  try {
    writeFileSync(join(dir, 'notes.txt'), 'scratch\n');
    const result = runIn(dir);
    assert.equal(result.code, 0, result.out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the production deploy script runs the guard before anything else', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['clean:check'], 'node scripts/check-clean-tree.mjs');
  const deploy = pkg.scripts['deploy:prod'];
  assert.match(deploy, /^npm run clean:check &&/, 'a guard that runs after the build has already wasted the build');
  assert.match(deploy, /npm run check/);
  assert.match(deploy, /vercel --prod --yes/);
});
