import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "can you stretch the activity/comment card and the records a little? so it fills the gap on the
// bottom part."
//
// The chain is DERIVED from the markup rather than typed into the assertion. A stylesheet test
// that looks for the selector it is checking proves only that somebody wrote it: the dashboard's
// split-scroll shipped with `:has(> .wb-dash-split)` against a page that renders
// .work-surface > .tool-page.wb-page > .wb-dash-split, so the rule matched nothing, every
// declaration under it was dead, and nine tests passed anyway.

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const styles = read('../src/styles.css');
const main = read('../src/main.js');
const recordPage = read('../src/workspace/record-page.js');
const layout = read('../src/workspace/record-layout.js');

/** The elements a record actually renders inside, read out of the source that renders them. */
function chain() {
  // The surface holds the rendered section and nothing else, so the page wrapper is its child.
  assert.match(main, /<main class="work-surface" id="workspace" tabindex="-1">\s*\$\{workspace\}/);
  const wrapper = main.match(/return `<section class="([^"]+)">\$\{wbWorkspaceHeader\([^)]*\)\}\$\{item/);
  assert.ok(wrapper, 'the record route no longer renders the page wrapper this test was derived from');
  const page = wrapper[1].trim().split(/\s+/).map((name) => `.${name}`);
  const root = recordPage.match(/<div class="(wb-record)" data-item=/);
  assert.ok(root, 'the record root is no longer .wb-record');
  return { page, record: `.${root[1]}` };
}

test('the height is handed down every step of the chain, with none skipped', () => {
  const { page, record } = chain();
  // Any of the wrapper's classes identifies it; the rule has to name one of them, and a rule
  // that jumps straight from the surface to the record matches no element at all.
  const written = page.some((step) => styles.includes(`.work-surface:has(> ${step} > ${record}) > ${step} {`));
  assert.ok(
    written,
    `no rule hands the surface's height to ${record} through ${page.join('')} — a step is missing`,
  );
});

test('the page is made as tall as the scrollport, and the record takes the slack', () => {
  const { record } = chain();
  const rule = styles.match(/\.work-surface:has\(> \.wb-page > \.wb-record\) > \.wb-page \{([^}]*)\}/);
  assert.ok(rule);
  assert.match(rule[1], /min-height: 100%/, 'without this the page ends where its content does');
  assert.match(rule[1], /display: flex/);
  assert.match(rule[1], /flex-direction: column/);

  const inner = styles.match(new RegExp(`\\.wb-page > \\${record} \\{([^}]*)\\}`));
  assert.ok(inner);
  assert.match(inner[1], /flex: 1 1 auto/);
  assert.match(inner[1], /min-height: 0/);
});

test('the surface keeps its own scroll, unlike the dashboard split', () => {
  // The record header is sticky AGAINST the surface. Taking the scroll away from it -- which is
  // what the split does -- would strand a long record with nowhere to go.
  const rules = [...styles.matchAll(/\.work-surface:has\([^)]*wb-record[^)]*\)[^{]*\{([^}]*)\}/g)];
  assert.ok(rules.length, 'the record rule is gone');
  rules.forEach(([, body]) => {
    assert.doesNotMatch(body, /overflow[^:]*:\s*hidden/, 'a long record would have nowhere to scroll');
  });
  assert.match(styles, /\.work-surface:has\(\.wb-dash-split\) \{[^}]*overflow: hidden/, 'the split still does');
});

test('the grid is a child of the record, not of its sticky header', () => {
  // `.wb-record > [data-wb-rec-grid]` is a direct-child selector, so if the grid ever moved
  // inside .wb-record-top the rule would match nothing and read as correct — the same shape of
  // bug the chain test above exists for. Counted rather than eyeballed: the slice starts at the
  // header's own opening tag, so a balanced count means that tag was closed before the grid was
  // emitted. Inside it, the header would still be open and the opens would run one ahead.
  const from = recordPage.indexOf('<div class="wb-record-top">');
  const to = recordPage.indexOf('${body}', from);
  assert.ok(from > -1 && to > from, 'the record template no longer has the shape this was derived from');
  const between = recordPage.slice(from, to);
  const opens = (between.match(/<div\b/g) || []).length;
  const closes = (between.match(/<\/div>/g) || []).length;
  assert.ok(
    closes >= opens,
    `the grid is emitted inside the sticky header, where the rule cannot reach it (${opens} open, ${closes} closed)`,
  );
});

test('the cards stretch to their row instead of stopping at their content', () => {
  const grid = recordPage.match(/<div class="wb-dash-grid" (data-wb-rec-grid)>/);
  assert.ok(grid, 'the record grid no longer carries the attribute this is scoped by');
  const rule = styles.match(new RegExp(`\\.wb-record > \\[${grid[1]}\\] \\{([^}]*)\\}`));
  assert.ok(rule, 'nothing stretches the record grid');
  assert.match(rule[1], /align-items: stretch/, 'align-items: start is what held them at content height');
  assert.match(rule[1], /flex: 1 1 auto/);
});

test('the company dashboard keeps its own grid untouched', () => {
  // .wb-dash-grid is the dashboard's grid too, which is why the record rule is scoped by the
  // attribute only the record page renders.
  const shared = styles.match(/\n\.wb-dash-grid \{([^}]*)\}/);
  assert.ok(shared);
  assert.match(shared[1], /align-items: start/, 'the dashboard cards still size to their content');
});

test('the comments card fills the height it is given', () => {
  // The section is `wb-w wb-w-${block.type}` and the layout calls this block 'comments'.
  assert.match(recordPage, /class="wb-w wb-w-\$\{h\(block\.type\)\}/);
  assert.match(layout, /\{ type: 'comments',/);
  assert.match(recordPage, /block\.type === 'comments'\) return wbItemCommentsHtml/);

  const card = styles.match(/\.wb-w-comments \{([^}]*)\}/);
  assert.ok(card, 'the comments card is not laid out to fill');
  assert.match(card[1], /display: flex/);
  assert.match(card[1], /flex-direction: column/);

  const panel = styles.match(/\.wb-w-comments > \.wb-rec-panel \{([^}]*)\}/);
  assert.ok(panel);
  assert.match(panel[1], /flex: 1 1 auto/);
  assert.match(panel[1], /min-height: 0/, 'without this the feed cannot shrink and overflows the card');
});

test('the feed takes the slack, so the composer is not left floating in the middle', () => {
  const body = styles.match(/\.wb-w-comments \.wb-rec-body \{([^}]*)\}/);
  assert.ok(body);
  assert.match(body[1], /flex: 1 1 auto/);
  assert.match(body[1], /max-height: none/);
});

test('the cap moved to the card rather than being dropped', () => {
  // On the feed it was what stopped a busy thread from making the page enormous. Letting the
  // feed stretch takes that away, so the card carries it now.
  const card = styles.match(/\.wb-w-comments \{([^}]*)\}/)[1];
  assert.match(card, /max-height: min\(74vh, 720px\)/);
  // And the panel drawn anywhere else -- the record modal -- keeps the cap it always had.
  const base = styles.match(/\n\.wb-rec-body \{([^}]*)\}/);
  assert.ok(base);
  assert.match(base[1], /max-height: min\(52vh, 460px\)/);
  assert.match(base[1], /overflow-y: auto/);
});

// ---- the space the page was wasting -------------------------------------------------------

test('turning the page into a column did not add a band above the record', () => {
  // .tool-page sets gap: 14px. A block wrapper ignores it and a flex one does not, so making
  // this a column to hand the height down silently added 14px above the record that had never
  // been there. The strip own margin is the spacing between them.
  const rule = styles.match(/\.work-surface:has\(> \.wb-page > \.wb-record\) > \.wb-page \{([^}]*)\}/);
  assert.ok(rule);
  assert.match(rule[1], /gap: 0/, 'the wrapper gap has to be turned off explicitly');
  assert.match(styles, /\.tool-page \{[^}]*gap: 14px/, 'which is where it comes from');
});

test('the surface is padded by exactly what the sticky header bleeds', () => {
  // The header spans the surface with a negative margin. If the two numbers disagree it stops
  // short of the edge, which is what a 28px padding against a -24px bleed was doing. Derived
  // from the header rule, so changing one and not the other fails here.
  const head = styles.match(/\.wb-record-top \{([^}]*)\}/);
  assert.ok(head);
  const bleed = head[1].match(/margin: 0 -(\d+)px/);
  assert.ok(bleed, 'the header no longer bleeds by a margin this can be derived from');
  const surface = styles.match(/\.work-surface:has\(> \.wb-page > \.wb-record\) \{([^}]*)\}/);
  assert.ok(surface, 'the record page has no padding rule of its own');
  const pad = surface[1].match(/padding: (\d+)px (\d+)px (\d+)px/);
  assert.ok(pad);
  assert.equal(pad[2], bleed[1], `the header bleeds ${bleed[1]}px but the surface pads ${pad[2]}px`);
  // And the band under the cards: 42px of it was left showing even after they stretched.
  assert.ok(Number(pad[3]) <= 16, `${pad[3]}px under the cards is the gap that was complained about`);
});

test('the grid does not pad on top of the gap it already has', () => {
  const rule = styles.match(/\.wb-record > \[data-wb-rec-grid\] \{([^}]*)\}/);
  assert.match(rule[1], /padding-top: 0/);
  assert.match(styles, /\n\.wb-dash-grid \{[^}]*padding-top: 12px/, 'the dashboard keeps its own');
});

// ---- how tall a card is allowed to get ----------------------------------------------------------
//
// "make the cards a little long", twice. The cause was never the number: it was that there WAS a
// number. The cap was `100vh - chrome - strip - header`, a tally of everything above the cards,
// and every one of those had to be corrected whenever any of them moved. Collapsing the record
// header from two rows to one left it 56px out; fixing that half left the other half still
// guessed. One measurement of where the grid actually starts contains all four by construction.

test('the cap is one measured number, not a tally of what is above it', () => {
  const rule = styles.match(/\.wb-record \.wb-dash-grid > \.wb-w:not\(\.editing\) \{[^}]*\}/);
  assert.ok(rule, 'the panel cap rule is gone');
  const cap = rule[0].match(/max-height: calc\([^;]*\);/);
  assert.ok(cap, 'the panel cap is gone');
  assert.match(cap[0], /var\(--wb-record-grid-top, 300px\)/);
  assert.match(cap[0], /var\(--wb-record-foot\)/, "the surface's own bottom padding");
  // The three guessed pieces are gone, not merely unused.
  assert.ok(!/--wb-record-chrome/.test(styles), 'the tallied constant must not survive');
  assert.ok(!/--wb-record-head-h/.test(styles), 'nor the half-measure that replaced part of it');
  // dvh, not vh: on a phone the address bar makes them differ, and vh is the taller of the two.
  assert.match(cap[0], /100dvh/);
});

test('the grid publishes its own top, and refuses a reading it cannot trust', () => {
  assert.match(recordPage, /function measureRecordGrid\(scope\)/);
  assert.match(recordPage, /setProperty\('--wb-record-grid-top', `\$\{top\}px`\)/);
  assert.match(recordPage, /new ResizeObserver\(measure\)/, 'a one-off read misses a wrapped name');
  // Scrolled, `top` is smaller than the resting offset and the cap would grow past the screen.
  assert.match(recordPage, /!scrolledAway\(grid\)/);
  assert.match(recordPage, /scrollTop \|\| 0\) > 0/);
  // Zero means it is not laid out yet; writing it would collapse every panel to nothing.
  assert.match(recordPage, /if \(top > 0 &&/);
  // The node is rebuilt by every render, so the previous observer watches a dead element.
  assert.match(recordPage, /gridSizer\?\.disconnect\(\);/);
});

test('the measurement runs on the record page, without main.js learning about it', () => {
  // bindInlineEdits is the record page's own mount and already runs on every render of it. The
  // entry bundle has no room for another call site and does not need one.
  assert.match(recordPage, /measureRecordGrid\(scope === document \? document : \(scope\.ownerDocument \|\| document\)\)/);
  assert.ok(!/wb-record-grid-top/.test(main), 'main.js must not own this measurement');
});
