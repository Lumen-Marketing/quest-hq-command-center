// Boot the built bundle under a minimal DOM and fail if module init throws.
//
// A blank production page shipped this way once: a module-scope const was read from the
// `const state = {...}` initializer, so it was still in its temporal dead zone and the app
// threw before the first render. Every static check passed — syntax, tests, bundle budget —
// because none of them execute the bundle. This does.
import { readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve(process.argv[2] || 'dist');
const pkg = path.join(dist, 'package.json');
const createdPkg = !existsSync(pkg);
if (createdPkg) writeFileSync(pkg, '{"type":"module"}');

const noop = () => {};
const makeEl = () => ({
  style: { setProperty: noop, removeProperty: noop, cssText: '' },
  dataset: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop, getAttribute: () => null, removeAttribute: noop, hasAttribute: () => false,
  appendChild: noop, removeChild: noop, remove: noop, insertBefore: noop, replaceWith: noop,
  addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
  focus: noop, blur: noop, click: noop, closest: () => null, matches: () => false,
  querySelector: () => null, querySelectorAll: () => [],
  getContext: () => ({ fillRect: noop, drawImage: noop, clearRect: noop, fillText: noop, save: noop, restore: noop, translate: noop, scale: noop }),
  toDataURL: () => 'data:image/png;base64,', toBlob: (cb) => cb && cb({}),
  innerHTML: '', outerHTML: '', textContent: '', value: '', files: [], children: [], childNodes: [],
  scrollIntoView: noop, scrollBy: noop, scrollTo: noop,
  getBoundingClientRect: () => ({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
  insertAdjacentHTML: noop, cloneNode: () => makeEl(),
  clientWidth: 0, clientHeight: 0, scrollWidth: 0, scrollLeft: 0, offsetWidth: 0,
});
const store = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(), key: () => null, get length() { return m.size; } };
};

globalThis.document = {
  documentElement: makeEl(), body: makeEl(), head: makeEl(),
  createElement: makeEl, createElementNS: makeEl, createTextNode: makeEl, createDocumentFragment: makeEl,
  getElementById: () => makeEl(), querySelector: () => null, querySelectorAll: () => [],
  addEventListener: noop, removeEventListener: noop,
  title: '', cookie: '', readyState: 'complete', visibilityState: 'visible',
  getElementsByTagName: () => [],
};
globalThis.localStorage = store();
globalThis.sessionStorage = store();
// navigator is a getter-only global in modern Node; define it instead of assigning.
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', onLine: true, language: 'en-US', clipboard: {} }, configurable: true, writable: true });
globalThis.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop });
Object.defineProperty(globalThis, 'location', { value: new URL('https://www.questbase.io/'), configurable: true, writable: true });
globalThis.history = { pushState: noop, replaceState: noop, state: null, back: noop };
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.cancelAnimationFrame = noop;
globalThis.Image = class { set src(_v) {} addEventListener() {} };
globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
globalThis.MutationObserver = class { observe() {} disconnect() {} };
globalThis.scrollTo = noop;
globalThis.innerWidth = 1280;
globalThis.innerHeight = 900;
globalThis.addEventListener = noop;
globalThis.removeEventListener = noop;
globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.top = globalThis;
globalThis.parent = globalThis;

// Belt and braces: if module init blocks, fail loudly instead of hanging CI.
const watchdog = setTimeout(() => {
  console.error('Bundle failed to boot: module init did not finish within 60s.');
  process.exit(1);
}, 60000);
watchdog.unref();

const entry = readdirSync(path.join(dist, 'assets')).find((f) => /^index-.*\.js$/.test(f));
try {
  await import(pathToFileURL(path.join(dist, 'assets', entry)).href);
  console.log('Bundle boots: no top-level throw during module init.');
  // The app registers intervals and listeners on load, so nothing would ever release the
  // event loop. Exit explicitly or this check hangs the build forever.
  process.exit(0);
} catch (error) {
  console.log('BOOT THREW:', error?.name, '-', error?.message);
  console.log(String(error?.stack || '').split('\n').slice(0, 3).join('\n').slice(0, 600));
} finally {
  if (createdPkg) rmSync(pkg, { force: true });
}
