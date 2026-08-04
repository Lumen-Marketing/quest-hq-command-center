import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// The helper is a pure function of the location, so it is re-created here from the source
// rather than imported (main.js cannot be loaded outside a browser).
const fn = main.match(/function authOrigin\(\) \{[\s\S]*?\n\}/)[0];
const CANON = 'https://www.questbase.io';
const authOrigin = (origin, hostname) => {
  // eslint-disable-next-line no-new-func
  const build = new Function('window', 'CANONICAL_ORIGIN', `${fn}; return authOrigin();`);
  return build({ location: { origin, hostname } }, CANON);
};

test('a Vercel deployment host sends auth to the canonical site', () => {
  // This is the reported bug: every deployment also answers on its own *.vercel.app name,
  // which is a different origin. Sign in there and the session is stored against a host
  // nobody uses, so on the real site you still look signed out.
  assert.equal(
    authOrigin('https://quest-hq-command-center-abc123-abetheclosers-projects.vercel.app', 'quest-hq-command-center-abc123-abetheclosers-projects.vercel.app'),
    CANON,
  );
  assert.equal(authOrigin('https://anything.vercel.app', 'anything.vercel.app'), CANON);
});

test('the real site returns to itself, not to a rewritten copy of itself', () => {
  assert.equal(authOrigin('https://www.questbase.io', 'www.questbase.io'), 'https://www.questbase.io');
  // A custom domain is already the real thing, whoever it belongs to.
  assert.equal(authOrigin('https://app.example.com', 'app.example.com'), 'https://app.example.com');
});

test('local development still signs in locally', () => {
  // Forcing production here would make local sign-in impossible.
  assert.equal(authOrigin('http://localhost:5173', 'localhost'), 'http://localhost:5173');
  assert.equal(authOrigin('http://127.0.0.1:4173', '127.0.0.1'), 'http://127.0.0.1:4173');
});

test('a host merely CONTAINING vercel.app is not treated as one', () => {
  // "vercel.app.evil.com" must not be matched, or the check is an open redirect waiting to
  // be pointed somewhere. The pattern is anchored to the end of the hostname.
  assert.equal(authOrigin('https://vercel.app.evil.com', 'vercel.app.evil.com'), 'https://vercel.app.evil.com');
  // Requiring the leading dot matters in both directions: "notvercel.app" is somebody else's
  // domain entirely, and sending their sign-in to questbase.io would be the same bug pointed
  // the other way.
  assert.equal(authOrigin('https://notvercel.app', 'notvercel.app'), 'https://notvercel.app');
});

test('both auth round trips use it, and neither uses the raw origin', () => {
  // A password-reset link is the worse one: it arrives by email and outlives the tab that
  // asked for it.
  assert.match(main, /const redirectTo = `\$\{authOrigin\(\)\}\$\{BASE_PATH \|\| ''\}\//);
  assert.match(main, /const redirectTo = `\$\{authOrigin\(\)\}\$\{appHref\('\/\?auth=recovery'\)\}`;/);
  assert.ok(!/redirectTo = `\$\{window\.location\.origin\}/.test(main), 'no auth redirect may use the raw origin');
});

test('the canonical host is overridable without a code change', () => {
  assert.match(main, /import\.meta\.env\.VITE_CANONICAL_ORIGIN \|\| 'https:\/\/www\.questbase\.io'/);
  // A trailing slash in the env var would produce a double slash in every redirect.
  const decl = main.slice(main.indexOf('const CANONICAL_ORIGIN'));
  assert.ok(decl.slice(0, 200).includes('.replace('), 'the trailing slash must be stripped');
});

test('the comment says where the other half of the fix lives', () => {
  // Supabase ignores a redirectTo that is not allowlisted and silently uses its Site URL, so
  // the app-side fix alone does not close this.
  assert.match(main, /Supabase ignores a redirectTo that is not in its/);
});

test('the sign-up confirmation email points at the canonical site', () => {
  // With no emailRedirectTo, Supabase has nowhere to send a confirmation except the project's
  // Site URL -- and that was a deployment host, so confirming an account landed people on a
  // *.vercel.app copy of the app.
  assert.match(main, /emailRedirectTo: `\$\{authOrigin\(\)\}\$\{BASE_PATH \|\| ''\}\//);
});

test('an invitation survives the confirmation round trip', () => {
  // The email outlives the tab, so anything not on the URL is gone by the time it is clicked.
  const at = main.indexOf('emailRedirectTo:');
  assert.match(main.slice(at, at + 200), /inviteToken \? `\?invite=\$\{encodeURIComponent\(inviteToken\)\}` : ''/);
});

test('password sign-in has no redirect to get wrong', () => {
  // signInWithPassword is a plain API call: it cannot move you between hosts, which is what
  // rules it out when someone reports landing on the wrong domain after "logging in".
  const at = main.indexOf('const result = await client.auth.signInWithPassword({');
  assert.ok(!/redirectTo/.test(main.slice(at, at + 300)), 'no redirect option belongs here');
});
