import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const sync = readFileSync(new URL('../scripts/sync-spa-assets.mjs', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const taskConfig = readFileSync(new URL('../taskmanagement/js/config.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Production shipped a Supabase publishable key with a trailing newline on it, pasted into
// the hosting dashboard where whitespace is invisible. REST survived it -- the header was
// cleaned up in transit -- but Realtime puts the key in the WebSocket query string, where it
// became a literal %0A and the server rejected it as unknown. So every request worked and
// only the live-update socket failed, with a 401 that pointed at nothing in the code.

test('the host trims its Supabase url and key', () => {
  assert.match(main, /supabaseUrl: String\(import\.meta\.env\.VITE_SUPABASE_URL \|\| '[^']+'\)\.trim\(\)/);
  assert.match(main, /supabaseKey: String\(import\.meta\.env\.VITE_SUPABASE_ANON_KEY \|\| '[^']+'\)\.trim\(\)/);
});

test('the generated task runtime env trims every value', () => {
  // env.json is written from the same variables at build time; an untrimmed one here would
  // put the newline back into the embedded app even after the host was fixed.
  assert.match(sync, /const env = \(name, fallback\) => String\(process\.env\[name\] \|\| fallback\)\.trim\(\);/);
  for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_SENTRY_DSN', 'VITE_TURNSTILE_SITE_KEY']) {
    assert.match(sync, new RegExp(`env\\('${key}'`), `${key} should go through the trimming helper`);
  }
  assert.ok(!/process\.env\.VITE_SUPABASE_ANON_KEY \|\|/.test(sync), 'no untrimmed read should remain');
});

test('the task app trims what it reads, whatever it is handed', () => {
  // Belt and braces: a stale env.json from an older build must not reintroduce it.
  assert.match(taskConfig, /env\.supabaseAnonKey\.trim\(\)/);
  assert.match(taskConfig, /env\.supabaseUrl\.trim\(\)/);
});

test('a service-role key still cannot be written into the task runtime', () => {
  // Unrelated to the newline, but this guard sits in the same block and must survive edits.
  assert.match(sync, /Refusing to write a service-role key into taskmanagement\/env\.json/);
  assert.match(sync, /\/\^sb_secret_\|service_role\/i\.test\(taskRuntimeEnv\.supabaseAnonKey\)/);
});
