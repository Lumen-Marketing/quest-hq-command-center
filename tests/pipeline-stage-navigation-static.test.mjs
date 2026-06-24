import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('pipeline stage sidebar clicks leave detail records for filtered pipeline lists', () => {
  assert.match(source, /function pipelineStageRouteParams\s*\(/);
  assert.match(source, /function isPipelineDetailRoute\s*\(/);
  assert.match(source, /route\.params\.has\('contact_id'\)/);
  assert.match(source, /route\.params\.has\('deal_id'\)/);
  assert.match(source, /route\.params\.has\('job_id'\)/);
  assert.match(source, /isPipelineDetailRoute\(route,\s*kind\)/);
  assert.match(source, /navigate\(companyPath\(kind,\s*pipelineStageRouteParams\(nextStage\),\s*activeCompanyId\(\)\)\)/);
});
