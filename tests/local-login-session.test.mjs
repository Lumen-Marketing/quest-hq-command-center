import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The local-login form gates on VITE_LOCAL_LOGIN_USERNAME/PASSWORD, refuses wrong ones with
// "Invalid temporary credentials.", and then -- until 2026-09-10 -- called startDemoMode() anyway.
// So the correct credentials bought exactly what the "Open read-only demo" button beside them gives
// anyone with none: a demo-readonly visitor that cannot write. buildLocalSession(), the developer
// session the form exists to hand out, was unreachable from the UI entirely.
//
// Found while trying to run the Admin QA pass: every local sign-in path ended in a read-only
// session, so no write case could be executed at all.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};
const loginHandler = () => {
  const at = main.indexOf("if (event.target.matches('[data-login-form]')) {");
  assert.notEqual(at, -1, 'the local login submit handler should exist');
  return main.slice(at, main.indexOf('\n  }\n', at));
};

test('valid local credentials open the local session, not the read-only demo', () => {
  const body = loginHandler();
  assert.match(body, /startLocalSession\(form\.return_url/);
  assert.doesNotMatch(body, /startDemoMode\(/, 'the credential gate must not hand out the anonymous demo');
});

test('the credential gate still guards it, and still fails closed', () => {
  const body = loginHandler();
  assert.match(body, /CONFIG\.localLoginEnabled/);
  assert.match(body, /CONFIG\.localUsername && CONFIG\.localPassword/, 'unconfigured credentials must never authenticate');
  assert.match(body, /state\.loginError = 'Invalid temporary credentials\.'/);
  assert.ok(
    body.indexOf('Invalid temporary credentials') < body.indexOf('startLocalSession'),
    'the refusal must gate the session, not follow it',
  );
});

test('the local session is a writable developer, which is the whole point', () => {
  const body = fn('buildLocalSession');
  assert.match(body, /auth: 'local-basic'/);
  assert.match(body, /role: 'developer'/);
  // isReadOnlyDemo() is demo-readonly only, so local-basic writes and persists.
  const readOnly = fn('isReadOnlyDemo');
  assert.match(readOnly, /demo-readonly/);
  assert.doesNotMatch(readOnly, /local-basic/, 'local-basic must not be treated as read-only');
});

test('startLocalSession persists exactly what startDemoMode persists', () => {
  // A session that is not written to storage does not survive the navigate() on the next line.
  const local = fn('startLocalSession');
  for (const step of [/state\.session = buildLocalSession\(\)/, /resetDemoWorkspaceData\(\)/,
    /localStorage\.setItem\(COMPANY_KEY/, /writeJson\(SESSION_KEY, state\.session\)/, /navigate\(safeReturnUrl\(/]) {
    assert.match(local, step);
  }
  assert.match(fn('startDemoMode'), /state\.session = buildDemoSession\(\)/, 'the demo path is unchanged');
});

test('it cannot reach production however the environment is set', () => {
  // import.meta.env.DEV is statically false in a build, so this whole branch is dead code there.
  assert.match(main, /localLoginEnabled: import\.meta\.env\.DEV && import\.meta\.env\.VITE_LOCAL_LOGIN_ENABLED === 'true'/);
});
