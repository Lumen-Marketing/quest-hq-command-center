import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import handler from '../api/client-error.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const performanceReporter = readFileSync(new URL('../src/telemetry/performance-reporter.js', import.meta.url), 'utf8');

function mockRes() {
  const res = {
    statusCode: 0, headers: {}, ended: false,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    getHeader(k) { return this.headers[k.toLowerCase()]; },
    status(code) { this.statusCode = code; return this; },
    end() { this.ended = true; return this; },
  };
  return res;
}
const post = (body, headers = {}) => ({ method: 'POST', body, headers: { 'x-forwarded-for': '203.0.113.9', ...headers }, socket: { remoteAddress: '203.0.113.9' } });

function captureLog(run) {
  const original = console.error;
  const lines = [];
  console.error = (...args) => lines.push(args.map(String).join(' '));
  return Promise.resolve(run()).finally(() => { console.error = original; }).then(() => lines.join('\n'));
}

function captureWarning(run) {
  const original = console.warn;
  const lines = [];
  console.warn = (...args) => lines.push(args.map(String).join(' '));
  return Promise.resolve(run()).finally(() => { console.warn = original; }).then(() => lines.join('\n'));
}

test('a well-formed report is accepted and logged', async () => {
  const res = mockRes();
  const logged = await captureLog(() => handler(post({
    kind: 'error', message: 'Boom', stack: 'Error: Boom\n at x', url: 'https://www.questbase.io/company/acme/jobs',
    route: 'company/jobs', revision: 'abc123', company_id: 'acme', workspace_id: 'ws-1', profile_id: 'p-1',
  }), res));
  assert.equal(res.statusCode, 204);
  assert.match(logged, /\[client-error\]/);
  const entry = JSON.parse(logged.slice(logged.indexOf('{')));
  assert.equal(entry.message, 'Boom');
  assert.equal(entry.company, 'acme');
  assert.equal(entry.revision, 'abc123');
});

test('slow-operation telemetry is kept separate from actual browser errors', async () => {
  const res = mockRes();
  const logged = await captureWarning(() => handler(post({
    kind: 'performance', message: 'Slow data request', duration_ms: 5234,
    url: 'https://www.questbase.io/company/acme/jobs?secret=nope', route: 'Jobs', company_id: 'acme',
  }), res));
  assert.equal(res.statusCode, 204);
  assert.match(logged, /\[client-performance\]/);
  assert.doesNotMatch(logged, /secret=nope/);
  const entry = JSON.parse(logged.slice(logged.indexOf('{')));
  assert.equal(entry.duration_ms, 5234);
  assert.equal(entry.kind, 'performance');
});

// Invite and password-recovery links carry secrets in the query string and fragment.
// Logging them would put working credentials into the log.
test('query strings and fragments are stripped from urls', async () => {
  const res = mockRes();
  const logged = await captureLog(() => handler(post({
    message: 'x',
    url: 'https://www.questbase.io/accept?token=SUPERSECRET#access_token=ALSOSECRET',
  }), res));
  assert.doesNotMatch(logged, /SUPERSECRET/);
  assert.doesNotMatch(logged, /ALSOSECRET/);
  assert.match(logged, /questbase\.io\/accept/);
});

test('urls embedded in a stack are scrubbed too', async () => {
  const res = mockRes();
  const logged = await captureLog(() => handler(post({
    message: 'x',
    stack: 'at f (https://www.questbase.io/app.js?token=LEAKED:1:2)',
  }), res));
  assert.doesNotMatch(logged, /LEAKED/);
});

test('only known fields are logged, so no caller can smuggle extra data in', async () => {
  const res = mockRes();
  const logged = await captureLog(() => handler(post({
    message: 'x', email: 'someone@example.com', password: 'hunter2', answers: { secret: 'value' },
  }), res));
  assert.doesNotMatch(logged, /someone@example\.com/);
  assert.doesNotMatch(logged, /hunter2/);
  assert.doesNotMatch(logged, /secret/);
});

test('oversized fields are truncated rather than logged whole', async () => {
  const res = mockRes();
  const logged = await captureLog(() => handler(post({ message: 'A'.repeat(5000), stack: 'B'.repeat(9000) }), res));
  const entry = JSON.parse(logged.slice(logged.indexOf('{')));
  assert.equal(entry.message.length, 500);
  assert.ok(entry.stack.length <= 2000);
});

test('malformed and hostile input never errors the endpoint', async () => {
  for (const body of ['not json at all', '', null, '{"message":']) {
    const res = mockRes();
    await captureLog(() => handler(post(body), res));
    assert.equal(res.statusCode, 204, `expected 204 for ${JSON.stringify(body)}`);
  }
});

test('non-POST methods are rejected', async () => {
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const res = mockRes();
    await handler({ method, headers: {}, socket: {} }, res);
    assert.equal(res.statusCode, 405);
  }
  const preflight = mockRes();
  await handler({ method: 'OPTIONS', headers: {}, socket: {} }, preflight);
  assert.equal(preflight.statusCode, 204);
});

test('a render loop cannot flood the log: the client caps and dedupes', () => {
  assert.match(main, /const REPORT_LIMIT = 5;/);
  assert.match(main, /if \(sent >= REPORT_LIMIT\) return;/);
  assert.match(main, /if \(seen\.has\(key\)\) return;/);
});

test('slow route and data timing is bounded and carries structural context only', () => {
  assert.match(main, /finishTimedOperation\('Route render'/);
  assert.match(main, /finishTimedOperation\('Initial workspace data'/);
  assert.match(main, /finishTimedOperation\('Deferred data load'/);
  assert.match(main, /import\('\.\/telemetry\/performance-reporter\.js'\)/);
  assert.match(performanceReporter, /reportCount >= 8/);
  assert.doesNotMatch(performanceReporter, /email|contact_name|field values/i);
});

test('the reporter cannot become the error it reports', () => {
  // Every path is inside try/catch and the fetch fallback swallows rejections, or a
  // broken page becomes a broken page plus a loop inside the handler.
  const block = main.slice(main.indexOf('const REPORT_LIMIT'), main.indexOf("window.addEventListener('error'"));
  assert.match(block, /\} catch \{/);
  assert.match(block, /\.catch\(\(\) => \{\}\)/);
});

test('reporting only runs in production builds', () => {
  assert.match(main, /if \(import\.meta\.env\.PROD\) \{\s*\n\s*const REPORT_LIMIT/);
});
