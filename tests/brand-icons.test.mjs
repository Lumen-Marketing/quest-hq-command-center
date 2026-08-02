import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url));
const text = (p) => read(p).toString('utf8');
const size = (p) => statSync(new URL(`../${p}`, import.meta.url)).size;

// PNG header: width and height are big-endian 32-bit at byte 16 and 20.
const pngSize = (p) => {
  const b = read(p);
  assert.equal(b.subarray(1, 4).toString('ascii'), 'PNG', `${p} should be a PNG`);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

test('the signed-in shell uses the Questbase mark, not the old Quest HQ one', () => {
  const main = text('src/main.js');
  assert.match(main, /import questLogoMarkUrl from '\.\/assets\/questbase-mark\.png';/);
  assert.ok(
    !/quest-hq-logo-mark/.test(main),
    'the public landing page already used the modular Q; the shell should not keep the roofing mark',
  );
});

test('every icon is square and the size its filename claims', () => {
  const expected = [
    ['src/assets/questbase-mark.png', 512],
    ['public/icons/favicon-32.png', 32],
    ['public/icons/favicon-16.png', 16],
    ['public/icons/favicon-32-dark.png', 32],
    ['public/icons/favicon-16-dark.png', 16],
    ['public/apple-touch-icon.png', 180],
    ['public/icons/icon-192.png', 192],
    ['public/icons/icon-512.png', 512],
    ['public/icons/icon-maskable-512.png', 512],
  ];
  for (const [path, px] of expected) {
    const { w, h } = pngSize(path);
    assert.equal(w, px, `${path} width`);
    assert.equal(h, px, `${path} height`);
  }
});

test('the manifest points at icons that exist at the declared sizes', () => {
  const manifest = JSON.parse(text('public/manifest.webmanifest'));
  assert.ok(manifest.icons.length >= 3);
  for (const icon of manifest.icons) {
    const path = `public${icon.src}`;
    const { w, h } = pngSize(path);
    assert.equal(`${w}x${h}`, icon.sizes, `${icon.src} does not match its declared sizes`);
  }
  // A launcher crops a maskable icon to its own shape, so one must be declared.
  assert.ok(manifest.icons.some((i) => i.purpose === 'maskable'), 'a maskable icon is required');
});

test('the favicon carries the real artwork rather than a hand-traced copy', () => {
  for (const file of ['favicon.svg', 'favicon-dark.svg']) {
    const svg = text(file);
    assert.match(svg, /data:image\/png;base64,/);
    assert.match(svg, /viewBox="0 0 96 96"/);
    // The previous favicon was an orange square with a letter Q — a different mark.
    assert.ok(!/<path/.test(svg), `${file}: traced paths would only approximate the mark`);
    // Small enough that every page load is not paying for it.
    assert.ok(size(file) < 24 * 1024, `${file} is ${size(file)} bytes`);
  }
  assert.notEqual(text('favicon.svg'), text('favicon-dark.svg'), 'the dark variant must differ');
});

// The mark is orange plus near-black. On a transparent field the near-black vanishes into
// a dark tab bar, so "transparent" and "visible" are only compatible with two versions.
test('the tab icon is transparent, and stays visible on a dark tab bar', () => {
  const alphaAt = (p, x, y) => {
    const png = read(p);
    // Rather than decode the PNG, assert the colour type byte: 6 is RGBA, 2 is RGB.
    return png[25];
  };
  assert.equal(alphaAt('public/icons/favicon-32.png'), 6, 'the tab icon should carry alpha');
  assert.equal(alphaAt('src/assets/questbase-mark.png'), 6, 'the shell logo should carry alpha');

  // iOS composites onto black and a launcher fills a maskable icon's whole canvas, so
  // transparency actively hurts on both.
  assert.equal(alphaAt('public/apple-touch-icon.png'), 2, 'iOS ignores alpha and shows black');
  assert.equal(alphaAt('public/icons/icon-maskable-512.png'), 2, 'a maskable icon must fill its canvas');
});

test('both tab icons are offered, with the dark one behind a media query', () => {
  const html = text('index.html');
  assert.match(html, /href="%BASE_URL%favicon\.svg" type="image\/svg\+xml" \/>/);
  assert.match(html, /href="%BASE_URL%favicon-dark\.svg"[^>]*media="\(prefers-color-scheme: dark\)"/);
  assert.match(html, /href="%BASE_URL%icons\/favicon-32-dark\.png"[^>]*media="\(prefers-color-scheme: dark\)"/);
  // A browser that ignores `media` takes the first, which must be the light one.
  assert.ok(html.indexOf('favicon.svg') < html.indexOf('favicon-dark.svg'));
});

test('the dark favicon is actually shipped, not just referenced', () => {
  // index.html references it; if the build does not copy it, every dark-mode visitor 404s.
  const sync = text('scripts/sync-spa-assets.mjs');
  assert.match(sync, /favicon-dark\.svg/);
});

test('a PNG fallback is offered for browsers that ignore SVG favicons', () => {
  const html = text('index.html');
  assert.match(html, /rel="icon" href="%BASE_URL%favicon\.svg" type="image\/svg\+xml"/);
  assert.match(html, /rel="icon" href="%BASE_URL%icons\/favicon-32\.png" sizes="32x32"/);
  assert.match(html, /rel="apple-touch-icon" href="%BASE_URL%apple-touch-icon\.png"/);
});

test('the icons are generated, not hand-edited', () => {
  const script = text('scripts/build-brand-icons.py');
  // Trimming matters: the source has wide white margins, so an untrimmed favicon is
  // mostly empty space at exactly the size where a mark needs to fill its box. The trim
  // runs after the white field is cut to alpha, so getbbox() has something to find.
  assert.match(script, /src\.getbbox\(\)/);
  assert.match(script, /WHITE_CUTOFF/);
  // Threshold at full resolution, then downsample: LANCZOS regenerates smooth edges from
  // a hard mask, whereas thresholding after resizing produces jaggies.
  assert.match(script, /Image\.LANCZOS/);
  assert.match(script, /questbase-modular-logo\.png/);
  // Every shipped icon should come out of this script.
  for (const path of ['questbase-mark.png', 'favicon-32.png', 'favicon-32-dark.png',
    'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
    'favicon.svg', 'favicon-dark.svg']) {
    assert.ok(script.includes(path), `${path} should be generated by the script`);
  }
});
