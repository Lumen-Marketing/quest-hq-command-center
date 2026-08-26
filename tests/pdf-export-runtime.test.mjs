import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('the self-hosted PDF runtime creates a real PDF document', async () => {
  const { createPdfDocument } = await import('../src/pdf/export-runtime.js');
  const pdf = createPdfDocument({ unit: 'pt', format: 'letter' });
  pdf.text('Questbase export check', 24, 24);
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), '%PDF-');
  assert.ok(bytes.length > 500, 'the generated document should contain a PDF body');
});

test('both export paths lazy-load the same-site runtime instead of injecting CDN scripts', () => {
  assert.match(main, /import\('\.\/pdf\/export-runtime\.js'\)/);
  assert.match(main, /saveProposalPdf/);
  assert.match(main, /saveClientPortalMarkedPdf/);
  assert.doesNotMatch(main, /cdnjs\.cloudflare\.com/);
  assert.doesNotMatch(main, /function loadExternalScript\(/);
  assert.doesNotMatch(main, /window\.jspdf/);
});
