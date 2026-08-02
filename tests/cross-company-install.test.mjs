import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { companiesToSave, resolveAppEntry, tileTargetApp, workspaceApps } from '../src/workspace/builder-core.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Two companies the same person owns. The app lives in acme; beta links it in.
const makeWorld = () => {
  const acme = {
    workspaces: [{
      id: 'ws-sales',
      name: 'Sales',
      apps: [{
        id: 'app-1',
        name: 'Roof Inspections',
        fields: [{ id: 'f1', label: 'Address' }],
        items: [{ id: 'i1', values: { Address: '1 Main St' } }],
      }],
    }],
  };
  const beta = {
    workspaces: [{
      id: 'ws-ops',
      name: 'Ops',
      apps: [{ id: 'app-1', linked: true, linkedFromWs: 'ws-sales', linkedFromCompany: 'acme' }],
    }],
  };
  const docs = { acme, beta };
  return { acme, beta, getDoc: (id) => docs[id] || null };
};

test('a cross-company link resolves to the owning company\'s app object', () => {
  const { acme, beta, getDoc } = makeWorld();
  const resolved = resolveAppEntry(beta, beta.workspaces[0].apps[0], getDoc);
  assert.equal(resolved.app, acme.workspaces[0].apps[0], 'a copy would diverge on the first edit');
  assert.equal(resolved.sourceCompanyId, 'acme');
});

test('records are shared across the company boundary, both directions', () => {
  const { acme, beta, getDoc } = makeWorld();
  const fromBeta = resolveAppEntry(beta, beta.workspaces[0].apps[0], getDoc).app;
  fromBeta.items.push({ id: 'i2', values: { Address: '2 Oak Ave' } });
  assert.deepEqual(acme.workspaces[0].apps[0].items.map((i) => i.id), ['i1', 'i2']);

  acme.workspaces[0].apps[0].items.push({ id: 'i3', values: {} });
  const again = resolveAppEntry(beta, beta.workspaces[0].apps[0], getDoc).app;
  assert.deepEqual(again.items.map((i) => i.id), ['i1', 'i2', 'i3']);
});

// Links made before this feature have no linkedFromCompany. Absent must keep meaning
// "this document", or every existing link breaks the moment this ships.
test('a same-company link still resolves without a getter', () => {
  const doc = {
    workspaces: [
      { id: 'ws-a', name: 'A', apps: [{ id: 'app-1', name: 'App' }] },
      { id: 'ws-b', name: 'B', apps: [{ id: 'app-1', linked: true, linkedFromWs: 'ws-a' }] },
    ],
  };
  assert.equal(resolveAppEntry(doc, doc.workspaces[1].apps[0]).app, doc.workspaces[0].apps[0]);
  assert.equal(resolveAppEntry(doc, doc.workspaces[1].apps[0]).sourceCompanyId, null);
});

test('losing access to the other company drops the app rather than throwing', () => {
  const { beta } = makeWorld();
  // getDoc returns null for a company this person can no longer read.
  const resolved = resolveAppEntry(beta, beta.workspaces[0].apps[0], () => null);
  assert.equal(resolved.app, null);
  assert.deepEqual(workspaceApps(beta, beta.workspaces[0], () => null), []);
  // And with no getter at all, rather than falling back to the wrong document.
  assert.equal(resolveAppEntry(beta, beta.workspaces[0].apps[0]).app, null);
});

test('a tile in the borrowing company resolves across the boundary too', () => {
  const { acme, beta, getDoc } = makeWorld();
  assert.equal(tileTargetApp(beta, beta.workspaces[0], 'app-1', getDoc), acme.workspaces[0].apps[0]);
});

// This is the part that makes the feature safe rather than a silent data-loss bug.
test('saving from the borrowing company also writes the owner\'s document', () => {
  const { beta } = makeWorld();
  // Editing a linked app from beta mutates acme's document, because that is where the app
  // object lives. Saving only beta would leave the edit on screen until the next reload
  // threw it away.
  assert.deepEqual(companiesToSave('beta', beta), ['beta', 'acme']);
});

test('a company with no outbound links saves only itself', () => {
  const { acme } = makeWorld();
  assert.deepEqual(companiesToSave('acme', acme), ['acme']);
  assert.deepEqual(companiesToSave('solo', null), ['solo']);
});

test('several links to the same company do not queue duplicate writes', () => {
  const doc = {
    workspaces: [{
      id: 'ws-1',
      apps: [
        { id: 'a', linked: true, linkedFromWs: 'ws-x', linkedFromCompany: 'acme' },
        { id: 'b', linked: true, linkedFromWs: 'ws-y', linkedFromCompany: 'acme' },
        { id: 'c', linked: true, linkedFromWs: 'ws-z', linkedFromCompany: 'other' },
      ],
    }],
  };
  assert.deepEqual(companiesToSave('beta', doc), ['beta', 'acme', 'other']);
});

// --- wiring --------------------------------------------------------------------

test('the normaliser keeps linkedFromCompany, or the link dies on reload', () => {
  // The document is normalised on every load. Dropping the field there would write the
  // link correctly and then erase it moments later, with no error to explain it.
  assert.match(main, /\.\.\.\(app\.linkedFromCompany \? \{ linkedFromCompany: String\(app\.linkedFromCompany\) \} : \{\}\)/);
});

test('the field is written only when the companies actually differ', () => {
  // Same-company links stay byte-identical to every link made before this existed.
  const handler = main.slice(main.indexOf('function wbInstallLinkedApp('));
  const body = handler.slice(0, handler.indexOf('\n}\n'));
  assert.match(body, /if \(targetCompany !== sourceCompany\) entry\.linkedFromCompany = sourceCompany;/);
});

test('permission is re-checked against the destination company', () => {
  // The select was rendered from state that may since have changed, and this crosses a
  // company boundary — the one place worth checking twice.
  const handler = main.slice(main.indexOf('function wbInstallLinkedApp('));
  const body = handler.slice(0, handler.indexOf('\n}\n'));
  assert.match(body, /if \(!canManageOperationalWorkspaces\(targetCompany\)\)/);
  assert.match(body, /Workspace admin access is required in that company/);
});

test('wbSave writes every company the current one links out to', () => {
  const fn = main.slice(main.indexOf('function wbSave(companyId) {'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /companiesToSave\(canonicalCompanyId\(companyId\), wbDoc\(companyId\)\)/);
  assert.match(body, /saveWorkspaceBuilderDoc\(target\)/);
});

test('the destination is chosen company-first, and the crossing is spelled out', () => {
  const fn = main.slice(main.indexOf('function wbInstallToWorkspaceField('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /data-wb-install-company/);
  // Only companies this person can administer are offered.
  assert.match(body, /filter\(\(c\) => canManageOperationalWorkspaces\(c\.id\)\)/);

  // The workspace picker and the warning depend on the chosen company, so they live in
  // their own block that can be swapped without re-rendering the page.
  const dep = main.slice(main.indexOf('function wbInstallTargetBody('));
  const depBody = dep.slice(0, dep.indexOf('\n}\n'));
  assert.match(depBody, /data-wb-install-target/);
  // Sharing records into another company is worth stating before it happens.
  assert.match(depBody, /deleting a record from either side deletes it for both/);
});

test('choosing a company swaps one block instead of re-rendering the page', () => {
  // A full render() rebuilt the settings page and returned the reader to the top of it,
  // a long way from the control they had just used.
  const handler = main.slice(main.indexOf("bind('[data-wb-install-company]'"));
  const body = handler.slice(0, handler.indexOf("}, 'onchange');"));
  assert.match(body, /host\.innerHTML = wbInstallTargetBody\(/);
  assert.match(body, /wbBindInstallTargets\(host, companyId, workspaceId, appId\)/, 'replaced controls need their handlers back');
  // render() survives only as the fallback when the block cannot be found.
  assert.match(body, /if \(!host \|\| !workspace \|\| !app\) \{ render\(\); return; \}/);
});

test('both entry points install through one function', () => {
  // The first render binds it, and the in-place swap rebinds it. Two copies of the
  // install logic would drift the moment either was touched.
  assert.match(main, /bind\('\[data-wb-install-linked\]', \(el\) => wbInstallLinkedApp\(el, companyId, workspaceId, appId\)\)/);
  const rebind = main.slice(main.indexOf('function wbBindInstallTargets('));
  assert.match(rebind.slice(0, rebind.indexOf('\n}\n')), /wbInstallLinkedApp\(btn, companyId, workspaceId, appId\)/);
});
