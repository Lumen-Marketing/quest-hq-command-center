import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

// Regression guard for the embedded task module reload loop.
//
// The task module at /taskmanagement/ builds its OWN Supabase client against the
// same storage key on the same origin. Each time its iframe boots it re-announces
// the stored session, and GoTrue echoes that back to the host as an auth event.
// render() rebuilds app.innerHTML wholesale, which destroys and recreates the
// iframe, which re-announces again: an endless ~1.4/sec reload loop that left the
// module stuck on its loading splash and fired ~11k requests in under two minutes.

test('auth state changes only re-render when the session materially changed', () => {
  const handler = source.slice(
    source.indexOf('client.auth.onAuthStateChange('),
    source.indexOf('async function setSupabaseSession'),
  );
  assert.ok(handler, 'onAuthStateChange handler not found');

  // The no-op echo must bail out BEFORE reaching render().
  assert.match(handler, /const signature = supabaseSessionSignature\(session \|\| null\);/);
  assert.match(handler, /if \(signature === lastAuthSignature\) return;/);

  const guardIndex = handler.indexOf('if (signature === lastAuthSignature) return;');
  const renderIndex = handler.indexOf('render();', guardIndex);
  assert.ok(renderIndex > guardIndex, 'render() must be gated behind the signature guard');

  // The baseline must come from the initial getSession, otherwise the very first
  // echo still slips through and restarts the loop.
  assert.match(
    source,
    /let lastAuthSignature = supabaseSessionSignature\(data\?\.session \|\| null\);/,
  );
});

test('session signature distinguishes real token changes from repeat announcements', async () => {
  const start = source.indexOf('function supabaseSessionSignature(session)');
  assert.ok(start > -1, 'supabaseSessionSignature not found');
  const body = source.slice(start, source.indexOf('async function setSupabaseSession'));
  const { default: signature } = await import(
    `data:text/javascript,${encodeURIComponent(`${body}\nexport default supabaseSessionSignature;`)}`
  );

  const session = { user: { id: 'u1' }, access_token: 'tok-a' };

  // Same session announced twice by the iframe's client -> identical -> no render.
  assert.equal(signature(session), signature({ user: { id: 'u1' }, access_token: 'tok-a' }));

  // A genuine token refresh must still be treated as a change.
  assert.notEqual(signature(session), signature({ user: { id: 'u1' }, access_token: 'tok-b' }));

  // Switching user, and signing out, must still be treated as changes.
  assert.notEqual(signature(session), signature({ user: { id: 'u2' }, access_token: 'tok-a' }));
  assert.equal(signature(null), '');
  assert.notEqual(signature(session), signature(null));
});
