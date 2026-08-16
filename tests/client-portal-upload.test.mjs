import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

// "can you fix the client portal i cant upload any file" — every plan-set upload came back
// "Upload failed — no documents were saved."
//
// The cause was one key. `client_portal_documents.scale_unit` is NOT NULL DEFAULT 'ft' in the
// database, and the browser sent an explicit `scale_unit: null` on a new document. A column
// default applies to an ABSENT key, never to a present-and-null one, so every insert died on
// the not-null constraint -- and because the code removes the uploaded object again when the
// record fails, it left no trace in storage either.
//
// These are source assertions rather than a round trip: the failure was a single literal in a
// payload builder, and that is exactly the shape of thing that silently comes back.

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const fn = (name) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return source.slice(at, source.indexOf('\n}', at) + 2);
};

test('a document payload never sends a null scale_unit', () => {
  const body = fn('clientPortalDocumentPayload');
  assert.match(
    body,
    /scale_unit: \['ft', 'in', 'cm'\]\.includes\(doc\.scale_unit\) \? doc\.scale_unit : 'ft'/,
    'scale_unit must fall back to a real unit, not null — the column is NOT NULL',
  );
  assert.doesNotMatch(body, /scale_unit:[^,\n]*:\s*null/, 'scale_unit must never resolve to null');
  // `scale` genuinely is nullable, so it keeps its null — the two must not be "fixed" together.
  assert.match(body, /scale: Number\(doc\.scale\) > 0 \? Number\(doc\.scale\) : null/);
});

test('the update path does not blank scale_unit back to null', () => {
  const body = fn('persistClientPortalDocument');
  const emptied = /emptyToNull\([\s\S]*?\[([^\]]*)\]\)/.exec(body)?.[1] || '';
  assert.ok(emptied.includes("'scale'"), 'scale is nullable and may still be emptied');
  assert.ok(
    !emptied.includes("'scale_unit'"),
    'scale_unit is NOT NULL — emptying it to null is the bug this test exists for',
  );
});

test('every NOT NULL document column receives a value, not a null', () => {
  const body = fn('clientPortalDocumentPayload');
  // Mirrors the live table: these columns are NOT NULL, so each needs a fallback in the payload.
  [
    ['version_group_id', /version_group_id: doc\.version_group_id \|\| doc\.id/],
    ['version_number', /version_number: doc\.version_number \|\| 1/],
    ['is_current', /is_current: doc\.is_current !== false/],
    ['review_status', /review_status: doc\.review_status \|\| 'pending'/],
  ].forEach(([column, pattern]) => {
    assert.match(body, pattern, `${column} is NOT NULL and needs a fallback`);
  });
});

test('a migration reconciles scale_unit with the shape production actually has', () => {
  const dir = new URL('../supabase/migrations/', import.meta.url);
  const sql = readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'))
    .join('\n');
  assert.match(sql, /alter column scale_unit set not null/, 'the NOT NULL must be recorded as a migration');
  assert.match(sql, /alter column scale_unit set default 'ft'/);
  // Backfilled first, or the NOT NULL cannot be taken on a table that already holds nulls.
  assert.match(sql, /set scale_unit = 'ft'\s*\n\s*where scale_unit is null/);
});
