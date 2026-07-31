import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Installing an app into a second workspace stores a POINTER, never a copy. That is the
// whole basis of "one app, two workspaces, shared data" — a copy would diverge the moment
// either side was edited. These reproduce the resolver against the real document shape.
const resolve = (doc, entry) => {
  if (!entry) return null;
  if (!entry.linked) return entry;
  const src = doc.workspaces.find((w) => w.id === entry.linkedFromWs);
  return src ? src.apps.find((a) => a.id === entry.id && !a.linked) || null : null;
};

const makeDoc = () => ({
  workspaces: [
    {
      id: 'ws-sales',
      name: 'Sales',
      apps: [{
        id: 'app-1', name: 'Roof Inspections', icon: 'ti-home',
        fields: [{ id: 'f1', label: 'Address' }],
        items: [{ id: 'i1', values: { Address: '1 Main St' } }],
      }],
    },
    // Ops has no app of its own — only the linked install. This is the case that broke.
    { id: 'ws-ops', name: 'Ops', apps: [{ id: 'app-1', linked: true, linkedFromWs: 'ws-sales' }] },
  ],
});

test('the second workspace resolves to the very same app object, not a copy', () => {
  const doc = makeDoc();
  const source = doc.workspaces[0].apps[0];
  const viaLink = resolve(doc, doc.workspaces[1].apps[0]);
  assert.equal(viaLink, source, 'a copy would diverge on the first edit');
});

test('a record added from either workspace is visible in the other', () => {
  const doc = makeDoc();
  const fromOps = resolve(doc, doc.workspaces[1].apps[0]);
  fromOps.items.push({ id: 'i2', values: { Address: '2 Oak Ave' } });

  const fromSales = doc.workspaces[0].apps[0];
  assert.deepEqual(fromSales.items.map((i) => i.id), ['i1', 'i2']);

  // And the reverse direction.
  fromSales.items.push({ id: 'i3', values: { Address: '3 Elm Rd' } });
  assert.deepEqual(resolve(doc, doc.workspaces[1].apps[0]).items.map((i) => i.id), ['i1', 'i2', 'i3']);
});

test('a field added from either workspace applies to both', () => {
  const doc = makeDoc();
  resolve(doc, doc.workspaces[1].apps[0]).fields.push({ id: 'f2', label: 'Squares' });
  assert.deepEqual(doc.workspaces[0].apps[0].fields.map((f) => f.label), ['Address', 'Squares']);
});

test('removing the link leaves the source app and its records untouched', () => {
  const doc = makeDoc();
  doc.workspaces[1].apps = [];
  assert.equal(doc.workspaces[0].apps[0].items.length, 1);
  assert.equal(doc.workspaces[0].apps[0].name, 'Roof Inspections');
});

test('a dangling link resolves to nothing rather than throwing', () => {
  const doc = makeDoc();
  doc.workspaces[0].apps = [];
  assert.equal(resolve(doc, doc.workspaces[1].apps[0]), null);
});

// --- the regressions this test file was written for -------------------------------

test('the default sidebar counts a linked app, so a link-only workspace is not empty', () => {
  const fn = main.slice(main.indexOf('function wbSidebarTiles('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.ok(
    !/find\(\(a\) => !a\.linked\)/.test(body),
    'skipping linked entries left a workspace whose only app was installed from elsewhere with no app tile at all',
  );
  assert.match(body, /const firstApp = \(workspace\.apps \|\| \[\]\)\[0\]/);
});

test('tiles resolve through the link instead of matching on !linked', () => {
  const fn = main.slice(main.indexOf('function wbTileMeta('));
  const body = fn.slice(0, fn.indexOf('\n  }\n}'));
  assert.ok(!/!x\.linked/.test(body), 'a tile pointing at a linked app fell back to a generic empty "App"');
  assert.match(body, /wbTileTargetApp\(companyId, workspace, tile\.config\.appId\)/);

  const helper = main.slice(main.indexOf('function wbTileTargetApp('));
  assert.match(helper.slice(0, helper.indexOf('\n}\n')), /wbResolveAppEntry\(wbDoc\(companyId\), entry\)/);
});

test('the tile configurator offers linked apps as targets', () => {
  assert.ok(
    !main.includes("const apps = (workspace.apps || []).filter((a) => !a.linked);"),
    'excluding linked apps made one impossible to place on a tile',
  );
  assert.match(main, /const apps = wbWorkspaceApps\(wbDoc\(m\.companyId\), workspace\)\.map\(\(r\) => r\.app\);/);
});

test('installing writes a pointer carrying the source workspace, never a copied app', () => {
  const handler = main.slice(main.indexOf("bind('[data-wb-install-linked]'"));
  const body = handler.slice(0, handler.indexOf('\n    });'));
  assert.match(body, /target\.apps\.push\(\{ id: app\.id, linked: true, linkedFromWs: workspaceId/);
  assert.ok(!/JSON\.parse\(JSON\.stringify\(app\)\)|\{ \.\.\.app \}/.test(body), 'must not copy the app');
  // Installing the same app twice into one workspace would create two entries with the
  // same id, which the resolver cannot tell apart.
  assert.match(body, /already has/);
});

test('the app list and topbar both mark a linked app', () => {
  assert.match(main, /wb-linkmark/);
  assert.match(main, /wb-topbar-link/);
});
