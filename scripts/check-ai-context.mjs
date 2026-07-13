#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateProjectBrain } from './ai-context-lib.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = validateProjectBrain(repoRoot);

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
}
