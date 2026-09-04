import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n');

const main = read('src/main.js');
const initialQueries = read('src/data/initial-data-queries.js');
const snapshot = JSON.parse(read('.ai/database/snapshot.json'));

const migrationsDir = join(new URL('supabase/migrations/', root).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '.');
const migration = (needle) => {
  const name = readdirSync(migrationsDir).find((n) => n.includes(needle));
  assert.ok(name, `no migration matching ${needle}`);
  return readFileSync(join(migrationsDir, name), 'utf8').replace(/\r\n/g, '\n');
};

const mergeContacts = (() => {
  const start = main.indexOf('async function mergeContacts(');
  assert.ok(start > -1, 'mergeContacts not found');
  return main.slice(start, main.indexOf('\nfunction renderContactBulkModal', start));
})();

// QB-CR-04. A merge that half-worked used to archive the duplicate anyway, and three of
// the tables involved cascade -- so the leftovers were deleted for real once the recycle
// window closed, not merely left pointing at an archived contact.
test('contact merge moves references before it recycles anything', () => {
  const rpcAt = mergeContacts.indexOf("rpc('merge_contact_references'");
  const recycleAt = mergeContacts.indexOf('recycleDeleteRecord(');
  assert.ok(rpcAt > -1, 'the merge must go through the transactional routine');
  assert.ok(recycleAt > rpcAt, 'nothing may be recycled before the references have moved');

  const guard = mergeContacts.slice(rpcAt, recycleAt);
  assert.match(guard, /moved\?\.error/, 'the result of the move has to be read');
  assert.match(guard, /return;/, 'a failed move must abort the merge, not fall through to the recycle');
});

test('the merge routine covers every table that references a contact', () => {
  const sql = migration('merge_contact_references');
  // Columns, not just declared foreign keys: tasks.contact_id and
  // proposal_documents.contact_id point at a contact without a constraint, and those are
  // exactly the ones a foreign-key-only check would miss.
  const holders = snapshot.tables
    .filter((t) => t.name !== 'contacts')
    .map((t) => ({ name: t.name, cols: (t.columns || []).map((c) => c.name).filter((c) => c === 'contact_id' || c === 'primary_contact_id') }))
    .filter((t) => t.cols.length);
  assert.ok(holders.length >= 8, `expected at least 8 tables carrying a contact column, saw ${holders.length}`);

  for (const table of holders) {
    assert.ok(
      sql.includes(`public.${table.name}`),
      `${table.name}.${table.cols.join('/')} points at a contact but the merge never moves it`,
    );
  }

  // activities carries the contact twice, and only the generic pair used to be moved.
  assert.match(sql, /update public\.activities set contact_id/, 'activities.contact_id is its own column');
  assert.match(sql, /update public\.activities set related_id/, 'activities.related_id still needs moving');

  // (contact_id, label_id) is the primary key, so a plain update collides.
  assert.match(sql, /on conflict \(contact_id, label_id\) do nothing/, 'label moves must tolerate a label the survivor already has');

  assert.match(sql, /has_workspace_permission\(v_workspace, 'crm\.manage'\)/, 'a SECURITY DEFINER routine must re-check the caller');
  assert.match(sql, /same company and workspace/, 'a merge must not move records across a tenant boundary');
});

// QB-CR-09. Ascending order plus a cap returned the FIRST 500 rows a workspace ever
// wrote, so a busy account could never load a new message again.
test('chat loads the newest messages, not the oldest', () => {
  for (const source of [initialQueries, main]) {
    for (const table of ['messages', 'message_attachments']) {
      const pattern = new RegExp(`from\\('${table}'\\)[^\\n]*order\\('created_at', \\{ ascending: (true|false) \\}\\)[^\\n]*limit\\(`);
      const found = source.match(pattern);
      if (!found) continue;
      assert.equal(found[1], 'false', `${table} must take the newest rows when it is capped`);
    }
  }
  // and the window is put back in reading order before anything renders it
  assert.ok(
    main.includes('(messagesResult.data || []).slice().reverse()'),
    'the newest-first window has to be reversed back to ascending for display',
  );
});

// QB-CR-12. The partial-failure banner already carried a Retry. A total failure never
// reached the code that populates it, so the workspace just looked empty.
test('a total data-load failure raises the retry banner', () => {
  const start = main.indexOf('function ensureDataLoad() {');
  const body = main.slice(start, main.indexOf('\nfunction ', start + 30));
  assert.match(body, /state\.initialLoadFailures = \['Workspace data'\]/, 'a total failure must surface, not fall back silently');

  const banner = main.slice(main.indexOf('function renderInitialLoadFailureBanner()'));
  assert.match(banner.slice(0, 600), /data-action="refresh-data"/, 'the banner is what carries the Retry');
});

// QB-CR-08. Uploads land in storage before the form is submitted, so an abandoned form
// left the object behind with nothing referencing it and nothing removing it.
test('abandoned public form uploads get swept', () => {
  const sql = migration('purge_abandoned_form_uploads');
  assert.match(sql, /service role required/, 'the sweep must not be callable by a signed-in user');
  assert.match(sql, /jsonb_path_query\(fr\.answers, '\$\.\*\*\.object_path'\)/, 'a referenced file may sit at any depth in the answers');
  assert.match(sql, /not exists \(select 1 from referenced/, 'only unreferenced objects may be swept');

  const endpoint = read('api/form-upload-purge.js');
  assert.match(endpoint, /storage\.from\(FORM_FILE_BUCKET\)\.remove\(paths\)/, 'delete through the storage API, or the object outlives its row');
  assert.match(endpoint, /if \(!authorized\(request\)\)/, 'the sweep endpoint needs the cron secret');

  const vercel = JSON.parse(read('vercel.json'));
  assert.ok(
    (vercel.crons || []).some((c) => c.path === '/api/form-upload-purge'),
    'the sweep only helps if something runs it',
  );
});
