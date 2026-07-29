import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import {
  checkBundleBudget,
  DEFAULT_BUNDLE_LIMITS,
  GZIP_ENVIRONMENT_TOLERANCE_BYTES,
} from './bundle-budget-lib.mjs';

const outputDir = resolve(process.argv[2] || 'dist');
const manifest = JSON.parse(readFileSync(join(outputDir, '.vite', 'manifest.json'), 'utf8'));
const gzipSizes = {};
for (const item of Object.values(manifest)) {
  for (const file of [item.file, ...(item.css || [])].filter(Boolean)) {
    if (!(file in gzipSizes)) gzipSizes[file] = gzipSync(readFileSync(join(outputDir, file)), { level: 9 }).length;
  }
}
const failures = checkBundleBudget({
  manifest,
  gzipSizes,
  limits: DEFAULT_BUNDLE_LIMITS,
  toleranceBytes: GZIP_ENVIRONMENT_TOLERANCE_BYTES,
});
if (failures.length) {
  failures.forEach((message) => console.error(`Bundle budget: ${message}`));
  process.exitCode = 1;
} else {
  console.log('Bundle budget passed.');
}
