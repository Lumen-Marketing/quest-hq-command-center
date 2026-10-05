import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The CI workflow ran the whole suite TWICE for every pull request, because it triggered on both
// `push: branches: ['**']` and `pull_request`. Both runs were against the same commit SHA.
//
// Branch protection counts every check run reported against the head SHA, and `test-and-build` is
// a required check, so both copies had to pass. Two consequences, both hit in practice:
//
//   - A merge could be held up by one of two identical runs, which is a coin flip rather than a
//     signal.
//   - Cancelling a stuck run turned its twin into a CANCELLED check, and GitHub refuses to
//     override a cancelled required check even with admin rights. That is what closed PR #30.
//
// This pins the trigger shape so the duplication cannot come back unnoticed.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ci = readFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'utf8');

// A small reader for just the parts of the workflow we care about, so the assertions describe
// behaviour rather than whitespace.
const triggers = () => {
  const on = ci.slice(ci.indexOf('\non:'), ci.indexOf('\npermissions:'));
  const pushBranches = on.match(/push:\s*\n\s*branches:\s*\[([^\]]*)\]/);
  return {
    on,
    pushBranches: pushBranches ? pushBranches[1].replace(/['"\s]/g, '') : null,
    hasPullRequest: /pull_request:/.test(on),
  };
};

test('push runs for main only, not every branch', () => {
  const { pushBranches } = triggers();
  assert.equal(pushBranches, 'main');
  // The old value was '**', which fired a second identical run for every PR branch push.
  assert.notEqual(pushBranches, '**');
  assert.doesNotMatch(triggers().on, /branches:\s*\[\s*['"]\*\*['"]\s*\]/);
});

test('pull requests still run CI', () => {
  // Restricting push must not take the PR run with it, or nothing verifies a PR at all.
  assert.ok(triggers().hasPullRequest, 'pull_request trigger must stay');
});

test('one required check, not two', () => {
  // A single job name is what makes one check context. Two runs of the same job against one SHA
  // are what produced the duplicate required check.
  const jobNames = [...ci.matchAll(/^\s{2}\w[\w-]*:\s*\n\s+name:\s*(\S+)/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(jobNames)], ['test-and-build']);
});

test('concurrency is keyed per pull request so the twins cancel instead of queueing', () => {
  // Keyed on github.ref, the push run and the pull_request run land in different groups and sit
  // side by side. Keyed on the PR number they share one group, so a newer push supersedes both.
  const group = ci.match(/group:\s*(.+)/)[1].trim();
  assert.match(group, /github\.event\.pull_request\.number/,
    'a PR number keeps the push and pull_request runs in one group');
});

test('the workflow keeps verifying main after a merge', () => {
  // main keeps its own push run, so a merge commit is still checked in its own right.
  assert.match(triggers().on, /push:\s*\n\s*branches:\s*\[\s*main\s*\]/);
});

test('the job is still the same check and the same command', () => {
  // Changing the check name would silently detach branch protection from this workflow, because
  // the required context is the job name.
  assert.match(ci, /name:\s*test-and-build/);
  assert.match(ci, /run:\s*npm run check/);
  assert.match(ci, /runs-on:\s*ubuntu-latest/);
});