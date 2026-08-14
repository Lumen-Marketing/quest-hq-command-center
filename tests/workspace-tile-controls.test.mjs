import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "Since the tiles can drag to change position, you may remove the arrows so I can click the X.
// I can't reach the button to remove because of the UI."
//
// Four controls in a tile header this narrow pushed Remove clean outside it -- there was nothing
// left to click. wbRenderTile is RUN here rather than read, so what is asserted is the markup
// that actually reaches the page.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const at = main.indexOf('function wbRenderTile(');
assert.notEqual(at, -1, 'wbRenderTile not found');
const body = main.slice(at, main.indexOf('\n}\n', at) + 3);
const h = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const wbRenderTile = new Function('h', 'wbTileMeta', 'wbTileHeadExtra', 'wbTileBody', `${body}; return wbRenderTile;`)(
  h,
  (companyId, workspace, tile) => ({ title: tile.name, icon: 'ti-checkbox', config: tile.config !== false }),
  () => '<span class="wb-tile-head-acts">extra</span>',
  () => '<div class="wb-tile-rows"></div>',
);

const render = (options = {}) => wbRenderTile(
  'c1', 'ws', { id: 't1', name: options.name || 'Members', config: options.config }, options.i ?? 1, options.total ?? 6, options.manage ?? true,
);

test('the arrows are gone', () => {
  // They were spending the row twice: the tiles are dragged to reorder anyway.
  const html = render();
  assert.ok(!/data-wb-tile-up/.test(html));
  assert.ok(!/data-wb-tile-down/.test(html));
  assert.ok(!/data-wb-tile-up|data-wb-tile-down/.test(main), 'and nothing is left listening for them');
});

test('what remains is Configure and Remove, and only those', () => {
  const html = render();
  assert.equal((html.match(/class="wb-tile-mbtn/g) || []).length, 2);
  assert.match(html, /data-wb-tile-config="t1"/);
  assert.match(html, /data-wb-tile-remove="t1"/);
});

test('a tile with nothing to configure shows only Remove', () => {
  const html = render({ config: false });
  assert.ok(!/data-wb-tile-config/.test(html));
  assert.match(html, /data-wb-tile-remove/);
});

test('the handle reorders from the keyboard, which is what the arrows used to do', () => {
  // Dragging cannot be done from a keyboard. Dropping the arrows without this would have left
  // reordering to pointer users only.
  const html = render();
  assert.match(html, /<button class="wb-tile-grip"[^>]*data-wb-tile-grip="t1"/);
  assert.match(html, /aria-label="Reorder Members, 2 of 6\. Press the up or down arrow to move it\."/);
  // And the handler is wired to the same mover the arrows called.
  assert.match(main, /\[data-wb-tile-grip\]/);
  assert.match(main, /wbMoveTile\(companyId, id, dir\)/);
  assert.match(main, /ArrowUp: 'up'.*ArrowDown: 'down'/);
});

test('grabbing the handle drags the tile, not the button', () => {
  // A button inside a draggable section can swallow the drag start; the app tabs carry the same
  // attribute for the same reason.
  assert.match(render(), /<button class="wb-tile-grip" type="button" draggable="false"/);
  assert.match(render(), /<section class="wb-tile wb-tile-draggable"[^>]*draggable="true"/);
});

test('the name is its own element, so it can be shortened', () => {
  // As a bare text node beside the icon it is an anonymous flex item, and text-overflow has
  // nothing to apply to -- it clipped mid-letter instead of ellipsising.
  const html = render({ name: 'Prospecting pipeline overview' });
  assert.match(html, /<span class="wb-tile-name" title="Prospecting pipeline overview">Prospecting pipeline overview<\/span>/);
  assert.match(styles, /\.wb-tile-name \{[^}]*text-overflow: ellipsis/);
  // And the container has to allow the shrink, or the name never gives way and the controls
  // are pushed out instead.
  assert.match(styles, /\.wb-tile-head > span \{[^}]*min-width: 0/);
  assert.match(styles, /\.wb-tile-mng \{ flex: none; \}/);
});

test('while rearranging, the handle stands in for the type icon', () => {
  // Both would leave a 215px tile no room for its own name, and the name is what you read to
  // decide which tile to move.
  const managed = render({ manage: true });
  assert.ok(!/ti-checkbox/.test(managed), 'no type icon while rearranging');
  assert.match(managed, /wb-tile-grip/);

  const normal = render({ manage: false });
  assert.match(normal, /<i class="ti ti-checkbox"/, 'but it is back the rest of the time');
  assert.ok(!/wb-tile-grip/.test(normal), 'and the handle is not');
  assert.ok(!/wb-tile-mbtn/.test(normal), 'nor are the manage controls');
});
