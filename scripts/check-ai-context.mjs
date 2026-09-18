#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BRAIN_MATERIAL_PATHS, describeBrainDrift, validateProjectBrain } from './ai-context-lib.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = validateProjectBrain(repoRoot);

// How far main has moved since the manifest was captured. Git lives out here rather than in the
// library so the validation itself stays pure and testable; every failure mode here is a reason to
// say nothing at all -- no repository, a shallow CI clone, or a capture commit this checkout has
// never fetched. A missing warning is the right outcome then, not a manufactured one.
function materialCommitsSinceCapture() {
  try {
    const manifest = JSON.parse(readFileSync(path.join(repoRoot, '.ai', 'manifest.json'), 'utf8'));
    const capture = String(manifest?.repository?.main_commit_at_capture || '');
    if (!/^[0-9a-f]{7,40}$/i.test(capture)) return null;
    const run = (args) => execFileSync('git', args, { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    run(['cat-file', '-e', capture + '^{commit}']);
    return Number(run(['rev-list', '--count', capture + '..HEAD', '--', ...BRAIN_MATERIAL_PATHS]));
  } catch {
    return null;
  }
}

if (result.errors.length) {
  console.error('AI project brain validation failed:');
  for (const error of result.errors) console.error('- ' + error);
  process.exitCode = 1;
} else {
  console.log(
    'AI project brain valid: '
      + result.summary.required_files
      + ' required files, '
      + result.summary.markdown_files
      + ' Markdown files, latest migration '
      + result.summary.latest_migration,
  );
  const drift = describeBrainDrift(materialCommitsSinceCapture());
  if (drift) console.warn('AI project brain notice: ' + drift);
}
