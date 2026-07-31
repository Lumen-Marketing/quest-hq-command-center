import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const bootstrap = (() => {
  const start = main.indexOf('async function loadSupabaseData() {');
  return main.slice(start, main.indexOf('\n  state.platformAdmin =', start));
})();

const DEFERRED_TABLES = [
  'finance_invoices', 'finance_payments', 'finance_expenses', 'finance_vendors',
  'forms', 'form_responses',
  'pricebook_vendors', 'pricebook_materials', 'pricebook_vendor_prices',
  'client_portals', 'client_portal_documents', 'client_portal_annotations', 'client_portal_events',
  'recycle_bin_items',
];

test('deferred tables are not fetched before first paint', () => {
  const fetched = [...bootstrap.matchAll(/client\.(?:from|rpc)\('([a-z_]+)'\)/g)].map((m) => m[1]);
  const leaked = DEFERRED_TABLES.filter((t) => fetched.includes(t));
  assert.deepEqual(leaked, [], 'a deferred table crept back into the bootstrap batch');
});

// The destructuring and the Promise.all array are positional. Removing a query without
// removing its name (or vice versa) shifts every later pair, so each result would bind
// to the wrong table -- silently, with no error anywhere.
test('every bootstrap result binds to the query it came from', () => {
  const m = bootstrap.match(/const \[([\s\S]*?)\] = await Promise\.all\(\[([\s\S]*?)\n {2}\]\);/);
  assert.ok(m, 'could not find the bootstrap batch');
  const names = m[1].split(',').map((x) => x.trim()).filter(Boolean);
  const sources = m[2].split('\n')
    .filter((l) => /client\.(from|rpc)\(/.test(l))
    .map((l) => l.match(/client\.(?:from|rpc)\('([a-z_]+)'\)/)[1]);

  assert.equal(names.length, sources.length, 'destructured names and queries are different lengths');

  const norm = (x) => x.toLowerCase().replace(/result$/, '').replace(/[^a-z]/g, '');
  for (let i = 0; i < names.length; i += 1) {
    const n = norm(names[i]);
    const q = norm(sources[i]);
    assert.ok(
      n.includes(q.slice(0, 6)) || q.includes(n.slice(0, 6)),
      `position ${i}: "${names[i]}" does not correspond to "${sources[i]}"`,
    );
  }
});

test('every deferred domain has a loader to defer to', () => {
  const list = main.match(/const DEFERRED_DOMAINS = \[([^\]]*)\]/);
  assert.ok(list, 'DEFERRED_DOMAINS should exist');
  const domains = [...list[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  assert.deepEqual(domains, ['finance', 'forms', 'pricebook', 'portals', 'recycle']);
  for (const domain of domains) {
    assert.ok(
      new RegExp(`domain === '${domain}'`).test(main),
      `no loader branch handles the '${domain}' domain, so deferring it would leave it empty forever`,
    );
  }
});

// Route-based triggering is how this change produces blank screens: a widget on some
// unrelated page reads the data, nobody lists that route, and it renders empty with no
// error. Hooking the accessor cannot miss a caller.
test('every read of a deferred dataset goes through a hooked accessor', () => {
  const FIELDS = {
    finance: ['financeInvoices', 'financePayments', 'financeExpenses', 'financeVendors'],
    forms: ['forms', 'formResponses'],
    pricebook: ['pricebookVendors', 'pricebookMaterials', 'pricebookPrices'],
    portals: ['clientPortals', 'clientPortalDocuments', 'clientPortalAnnotations', 'clientPortalEvents'],
    recycle: ['recycleBinItems'],
  };
  // Functions allowed to touch the raw state without triggering a load:
  //
  //  - the loaders themselves, and the reset paths that clear it;
  //  - backup build/restore, which operates on whatever is in memory by definition;
  //  - persistAll, which returns early on `auth === 'supabase'`. Deferral only applies
  //    to live Supabase sessions (ensureDomainLoaded short-circuits otherwise), so
  //    persistAll can never observe a half-loaded state and cannot cache an empty array
  //    over a good one. Checked, not assumed: isLiveSupabaseSession() is
  //    `auth === 'supabase' && !isReadOnlyDemo()`.
  const ALLOWED = /^(loadSupabaseData|loadRealtimeDomain|loadSecondaryRealtimeDomain|loadIdentityRealtimeDomain|applyWorkspaceBackupPayload|persistWorkspaceBackupPayloadToSupabase|buildWorkspaceBackupPayload|resetLiveWorkspaceData|resetDemoWorkspaceData|ensureDomainLoaded|persistAll|pricebookPersistLocal|saveFormsState)$/;

  const fns = [...main.matchAll(/^(?:async )?function ([\w$]+)/gm)].map((m) => ({ at: m.index, name: m[1] }));
  const owner = (idx) => {
    let lo = 0; let hi = fns.length - 1; let best = '(top level)';
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fns[mid].at <= idx) { best = fns[mid].name; lo = mid + 1; } else hi = mid - 1;
    }
    return best;
  };

  const bodyOf = (name) => {
    const i = fns.findIndex((f) => f.name === name);
    if (i === -1) return '';
    return main.slice(fns[i].at, i + 1 < fns.length ? fns[i + 1].at : main.length);
  };

  const offenders = [];
  for (const [domain, fields] of Object.entries(FIELDS)) {
    for (const field of fields) {
      for (const use of main.matchAll(new RegExp(`state\\.${field}\\b`, 'g'))) {
        const fn = owner(use.index);
        if (ALLOWED.test(fn)) continue;
        const body = bodyOf(fn);
        // Either this function triggers the load itself, or it is a mutation helper --
        // a write implies the section was already open, so the data is present.
        const triggers = body.includes(`ensureDomainLoaded('${domain}')`);
        // Mutation helpers are reachable only from a screen that already rendered the
        // data, which means it already went through a hooked accessor.
        //
        // The recycle-bin writers are the one case that can fire from anywhere, since
        // deleting any record anywhere appends to the bin. They are safe unhooked:
        // upsertRecycleBinItemLocal prepends to whatever list is in memory, which is
        // correct against an empty one, and a later load replaces the array wholesale
        // from the server. Hooking them would refetch the whole bin on every delete --
        // exactly the eager loading this change removes.
        const isWrite = /^(upsert|save|create|delete|update|duplicate|import|commit|stamp|mark|soft|cp[A-Z]|select|insert|undo|restore|permanently)/.test(fn);
        if (!triggers && !isWrite) offenders.push(`${fn} reads state.${field}`);
      }
    }
  }
  assert.deepEqual([...new Set(offenders)], [], 'these read deferred data without triggering its load');
});

// The bug this replaced: the realtime reload had its own copy of the apply logic that
// skipped the concurrency bookkeeping, leaving wbDocVersions/wbDocBase describing a
// revision that was no longer current.
test('workspace builder rows are applied through one shared function', () => {
  assert.equal((main.match(/function applyWorkspaceBuilderRows\(/g) || []).length, 1);
  assert.equal((main.match(/applyWorkspaceBuilderRows\(/g) || []).length, 3, 'one definition, two call sites');
  const apply = main.slice(main.indexOf('function applyWorkspaceBuilderRows('));
  const body = apply.slice(0, apply.indexOf('\n}\n'));
  assert.match(body, /state\.wbDocVersions\[companyId\]/, 'the version token must be refreshed');
  assert.match(body, /state\.wbDocBase\[companyId\]/, 'the merge ancestor must be refreshed');
  assert.match(body, /holdLocalWb/, 'in-flight local edits must still be held');
});

test('a failed deferred load can be retried rather than sticking empty', () => {
  const fn = main.slice(main.indexOf('function ensureDomainLoaded('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /state\.loadedDomains\[domain\] = ''/, 'a failure must clear the marker');
  assert.match(body, /'loading'/, 'concurrent calls must not stack up duplicate fetches');
  assert.match(body, /isLiveSupabaseSession\(\)/, 'demo sessions have nothing to fetch');
});

test('deferred markers are cleared on sign-out', () => {
  assert.match(main, /state\.loadedDomains = \{\};/);
});
