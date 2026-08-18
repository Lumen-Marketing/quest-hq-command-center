import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createRecordPanel, grownHeight } from '../src/workspace/record-panel.js';

// The + on the comment box, the menu it opens, and the box that grows as it is typed into.
//
// "on the comment can you make this? on attaching files? also I want the text field box to be
// auto expand when entering new line, so it expand downards. and a plus icon to attach files"
//
// Rendered and pressed rather than grepped: the composer is redrawn whole by every state change
// in this panel, and what a source-text assertion cannot see is the draft that redraw throws
// away -- which is exactly the bug that was sitting in this path.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const panelSource = readFileSync(new URL('../src/workspace/record-panel.js', import.meta.url), 'utf8');

const ITEM = { id: 'i1', values: {}, comments: [] };

function build({ coarsePointer = false, item = ITEM } = {}) {
  const state = { wbRecordTab: 'comments' };
  const renders = [];
  const toasts = [];
  const picked = [];
  const listeners = [];
  globalThis.matchMedia = (query) => ({ matches: coarsePointer && query.includes('coarse') });
  // Every file input the picker makes, so a press can be followed to what it would open.
  globalThis.document = {
    createElement: () => {
      const node = {
        type: '', multiple: false, accept: '', capture: '', hidden: false, files: [],
        onchange: null, click() { picked.push({ ...node }); }, remove() {},
      };
      return node;
    },
    body: { appendChild() {} },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (name, handler, capture) => listeners.push({ name, handler, capture }),
  };

  const panel = createRecordPanel({
    h,
    state,
    wbAvatar: () => '<span class="av"></span>',
    wbDoc: () => ({ workspaces: [{ id: 'ws-1', apps: [{ id: 'app1', items: [item] }] }] }),
    wbMemberById: () => null,
    wbMembers: () => [],
    wbTimeAgo: () => '1m ago',
    activeProfileId: () => 'me',
    activeCompanyId: () => 'quest',
    render: () => { renders.push(1); },
    showToast: (message) => toasts.push(message),
    addComment: () => {},
    // What createAttachments needs. Nothing here reaches the network.
    guardUpload: async () => true,
    supabase: () => null,
    isLive: () => false,
    canonicalCompanyId: (id) => id,
    slugify: (name) => name,
    readDataUrl: async () => 'data:,x',
  });

  const draw = (canWrite = true) => panel.recordPanel({ companyId: 'quest', item, canWrite });
  /** Fire the document listener the module bound for itself. */
  const fire = (name, event = {}) => {
    const found = listeners.find((entry) => entry.name === name);
    assert.ok(found, `nothing is listening for ${name}`);
    found.handler({
      target: { closest: () => null }, preventDefault() {}, stopPropagation() {}, ...event,
    });
    return found;
  };
  return {
    panel, state, renders, toasts, picked, draw, listeners, fire,
  };
}

// ---- how tall the box should be ----------------------------------------------------------------

test('the box is sized to its content, plus the border scrollHeight leaves out', () => {
  // scrollHeight excludes the border on a border-box element, so a box sized straight from it
  // loses those pixels on every keystroke and creeps shut.
  assert.deepEqual(grownHeight(80, 2, 220), { height: 82, scrolls: false });
  assert.deepEqual(grownHeight(40, 0, 220), { height: 40, scrolls: false });
});

test('it stops growing at the cap and scrolls instead', () => {
  // Without a cap a long comment pushes the thread it is replying to off the top of the panel.
  assert.deepEqual(grownHeight(400, 2, 220), { height: 220, scrolls: true });
  // Exactly full is not overflowing.
  assert.deepEqual(grownHeight(218, 2, 220), { height: 220, scrolls: false });
});

test('no cap declared means no cap applied, not a box collapsed to nothing', () => {
  // getComputedStyle returns 'none' when max-height is unset, which parses to NaN.
  assert.deepEqual(grownHeight(300, 0, NaN), { height: 300, scrolls: false });
  assert.deepEqual(grownHeight(300, 0, 0), { height: 300, scrolls: false });
  assert.deepEqual(grownHeight(undefined, undefined, undefined), { height: 0, scrolls: false });
});

// ---- the + and its menu ------------------------------------------------------------------------

test('the composer offers one + rather than two unlabelled icons', () => {
  const { draw } = build();
  const html = draw();
  assert.match(html, /data-wb-att="menu"/);
  assert.match(html, /ti-plus/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-haspopup="menu"/);
  // Closed, so the menu is not in the markup at all -- not merely hidden by CSS.
  assert.ok(!/wb-attach-menu/.test(html));
  assert.ok(!/data-wb-att="pick:/.test(html), 'nothing is pickable until the menu is open');
});

test('opening it names what each choice takes', () => {
  const { panel, state, draw, renders } = build();
  draw();
  panel.attachAction('menu');
  assert.equal(state.wbCommentMenu, true);
  assert.equal(renders.length, 1, 'opening redraws the panel');

  const html = draw();
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /role="menu"/);
  assert.match(html, /data-wb-att="pick:file"/);
  assert.match(html, /data-wb-att="pick:media"/);
  assert.match(html, /Document/);
  assert.match(html, /Photos &amp; videos/);
  // One line per entry now, so the detail is the row's TOOLTIP rather than a second line under
  // every name. Asserted on the attribute, because the bare strings are still in the markup
  // either way and a looser check would pass without the tooltip being there at all.
  assert.match(html, /title="PDF, Word, Excel[^"]*"/);
  assert.match(html, /title="An image or a clip[^"]*"/);
  assert.ok(!/<small>/.test(html), 'the second line is gone from the row');
});

test('Camera is offered where there is one, and not where there is not', () => {
  // `capture` is ignored on a desktop, so the entry there would open the same dialog as Photos
  // and lie about what it does.
  const phone = build({ coarsePointer: true });
  phone.draw();
  phone.panel.attachAction('menu');
  const onPhone = phone.draw();
  assert.match(onPhone, /data-wb-att="pick:camera"/);
  assert.match(onPhone, /Camera/);

  const desk = build({ coarsePointer: false });
  desk.draw();
  desk.panel.attachAction('menu');
  const onDesk = desk.draw();
  assert.ok(!/pick:camera/.test(onDesk));
  assert.match(onDesk, /data-wb-att="pick:file"/, 'the other two are still there');
});

test('pressing the + again closes it', () => {
  const { panel, state } = build();
  panel.attachAction('menu');
  panel.attachAction('menu');
  assert.equal(state.wbCommentMenu, false);
});

test('a choice opens that picker, with the accept list and capture that belong to it', () => {
  const { panel, state, picked } = build({ coarsePointer: true });
  panel.attachAction('menu');

  panel.attachAction('pick:file');
  assert.equal(state.wbCommentMenu, false, 'the menu must not stand under the file dialog');
  assert.equal(picked.length, 1);
  assert.match(picked[0].accept, /\.pdf/);
  assert.equal(picked[0].capture, '', 'a document is not a photograph');
  assert.equal(picked[0].multiple, true);

  panel.attachAction('pick:camera');
  assert.equal(picked[1].accept, 'image/*');
  assert.equal(picked[1].capture, 'environment', 'this is what opens the camera on a phone');
});

test('an unknown choice falls back to the document picker rather than throwing', () => {
  const { panel, picked } = build();
  panel.attachAction('pick:nonsense');
  assert.equal(picked.length, 1);
  assert.match(picked[0].accept, /\.pdf/);
});

// ---- the box that grows -------------------------------------------------------------------------

/**
 * A textarea, as much of one as sizing it needs -- and measuring the way a real one does.
 *
 * `scrollHeight` is the height the box HAS whenever one is set on it, and the height the content
 * NEEDS only while height is auto. Modelled rather than stubbed as a constant, because a box
 * that is measured without being cleared first can grow and never shrink again, and a fixed
 * number would report that bug as working.
 */
function fakeBox({ id = 'wbCommentInput', value = '', needs = 90 } = {}) {
  return {
    id,
    value,
    /** What the text in it needs. The test moves this as it "types". */
    needs,
    style: {},
    oninput: null,
    selection: null,
    get clientHeight() {
      const set = parseFloat(this.style.height);
      return this.style.height === 'auto' || !Number.isFinite(set) ? this.needs : set;
    },
    // A 1px border top and bottom: the pixels scrollHeight leaves out on a border-box element.
    get offsetHeight() { return this.clientHeight + 2; },
    // The content, or the box, whichever is taller -- which is what a browser reports.
    get scrollHeight() { return Math.max(this.needs, this.clientHeight); },
    setSelectionRange(from, to) { this.selection = [from, to]; },
  };
}

function withBoxes(boxes, run) {
  globalThis.getComputedStyle = () => ({ maxHeight: '220px' });
  globalThis.document.querySelectorAll = () => boxes;
  return run();
}

test('the box is sized to its content the moment it is drawn', () => {
  const { panel } = build();
  const box = fakeBox({ needs: 90 });
  withBoxes([box], () => panel.mountComposer());
  // Cleared to auto first, or a box that has grown could never shrink back.
  assert.equal(box.style.height, '92px');
  assert.equal(box.style.overflowY, 'hidden');
});

test('typing a new line grows it downward, and deleting shrinks it back', () => {
  const { panel } = build();
  const box = fakeBox({ needs: 90 });
  withBoxes([box], () => panel.mountComposer());

  box.value = 'one\ntwo\nthree';
  box.needs = 140;
  box.oninput();
  assert.equal(box.style.height, '142px');

  box.value = 'one';
  box.needs = 62;
  box.oninput();
  assert.equal(box.style.height, '64px', 'it has to come back down as well');
});

test('past the cap it scrolls instead of growing', () => {
  const { panel } = build();
  const box = fakeBox({ needs: 600 });
  withBoxes([box], () => panel.mountComposer());
  assert.equal(box.style.height, '220px');
  assert.equal(box.style.overflowY, 'auto');
});

test('the box is bound once, however many times the panel is redrawn', () => {
  // This mounts after every paint; addEventListener would stack a copy per render.
  const { panel } = build();
  const box = fakeBox();
  withBoxes([box], () => { panel.mountComposer(); });
  const first = box.oninput;
  withBoxes([box], () => { panel.mountComposer(); });
  assert.equal(typeof box.oninput, 'function');
  assert.notEqual(box.oninput, undefined);
  assert.equal(typeof first, 'function');
});

// ---- what was typed survives attaching a file ----------------------------------------------------

test('the words typed before attaching a file are still there afterwards', () => {
  // Attaching re-renders the panel, and a re-rendered textarea comes back empty. Before the
  // draft was banked, uploading a photo threw away the sentence written to go with it.
  const { panel, state } = build();
  const box = fakeBox();
  withBoxes([box], () => panel.mountComposer());
  box.value = 'Roof looks fine from the ridge';
  box.oninput();
  assert.equal(state.wbCommentDraft, 'Roof looks fine from the ridge');

  // The redraw: a brand-new, empty box.
  const redrawn = fakeBox();
  withBoxes([redrawn], () => panel.mountComposer());
  assert.equal(redrawn.value, 'Roof looks fine from the ridge');
  assert.deepEqual(redrawn.selection, [30, 30], 'the caret goes to the end, not the start');
});

test('a draft is never pushed over something already typed', () => {
  const { panel, state } = build();
  state.wbCommentDraft = 'banked';
  const box = fakeBox({ value: 'newer' });
  withBoxes([box], () => panel.mountComposer());
  assert.equal(box.value, 'newer');
});

test('an edit box grows too, but never banks itself as the composer draft', () => {
  const { panel, state } = build();
  const box = fakeBox({ id: 'wbEditComment-c1', value: 'editing' });
  withBoxes([box], () => panel.mountComposer());
  box.oninput();
  assert.equal(box.style.height, '92px');
  assert.equal(state.wbCommentDraft, undefined, 'the composer draft is not the edit box');
});

test('the draft and the tray belong to the record they were filled on', () => {
  // Stepping to the next record in the pager would otherwise carry them along, and the next
  // Comment would file somebody else's photos against the wrong job.
  const { panel, state, draw } = build();
  draw();
  state.wbCommentDraft = 'half a sentence';
  state.wbCommentFiles = [{ name: 'roof.jpg', url: 'u' }];
  state.wbCommentMenu = true;

  draw();
  assert.equal(state.wbCommentDraft, 'half a sentence', 'the same record keeps it');

  panel.recordPanel({ companyId: 'quest', item: { id: 'i2', values: {}, comments: [] }, canWrite: true });
  assert.equal(state.wbCommentDraft, '');
  assert.deepEqual(state.wbCommentFiles, []);
  assert.equal(state.wbCommentMenu, false);
});

test('sending clears the draft, and a failed send does not', () => {
  const at = main.indexOf('async function wbAddItemComment');
  const body = main.slice(at, main.indexOf('\n}', main.indexOf('return true;', at)));
  const cleared = body.indexOf("state.wbCommentDraft = '';");
  const failure = body.indexOf('state.wbCommentFiles = files;');
  assert.ok(cleared > -1, 'a sent comment must not leave its words in the box');
  assert.ok(failure > -1);
  assert.ok(cleared > failure, 'clearing before the failure branch would lose the words on a retry');
});

// ---- the wiring the host owns --------------------------------------------------------------------

test('Escape closes the menu, and stops there', () => {
  const { state, fire } = build();
  state.wbCommentMenu = true;
  let stopped = false;
  fire('keydown', { key: 'Escape', stopPropagation() { stopped = true; } });
  assert.equal(state.wbCommentMenu, false);
  // The host's next stop for Escape is "dismiss the record". Shutting a menu must not shut the
  // record behind it, which is why this is taken in the capture phase and stopped there.
  assert.ok(stopped);
});

test('Escape with nothing open is left alone, so the record still closes on it', () => {
  const { state, fire } = build();
  let stopped = false;
  fire('keydown', { key: 'Escape', stopPropagation() { stopped = true; } });
  assert.ok(!stopped, 'the key must reach the record when there is no menu to shut');
  state.wbCommentMenu = true;
  fire('keydown', { key: 'a', stopPropagation() { stopped = true; } });
  assert.equal(state.wbCommentMenu, true, 'only Escape closes it');
  assert.ok(!stopped);
});

test('the menu is closed and the record modal is not, because of which phase each key is taken in', () => {
  const { listeners } = build();
  const key = listeners.find((entry) => entry.name === 'keydown');
  const click = listeners.find((entry) => entry.name === 'click');
  assert.equal(key.capture, true, 'Escape has to be answered before the host dismisses the record');
  // The press is taken on the way UP: closing during capture would re-render the page under a
  // click the host has not handled yet.
  assert.equal(click.capture, false);
});

test('a press on anything that is not an attach control closes the menu', () => {
  const { state, fire, renders } = build();
  state.wbCommentMenu = true;
  const before = renders.length;
  // The + and every row of the menu carry [data-wb-att], and the host acts on those already.
  fire('click', { target: { closest: (selector) => (selector === '[data-wb-att]' ? {} : null) } });
  assert.equal(state.wbCommentMenu, true, 'the menu must not close itself out from under a choice');
  fire('click');
  assert.equal(state.wbCommentMenu, false);
  assert.equal(renders.length, before + 1, 'closing redraws once, and only when it closed something');
});

test('none of the closing lives in the entry bundle', () => {
  // It had 33 gzip bytes of headroom left. A branch there for a menu most sessions never open is
  // the wrong place to spend them, and this belongs to the panel anyway.
  assert.ok(!/state\.wbCommentMenu/.test(main), 'the host should not know the menu exists');
  assert.match(panelSource, /listen\('keydown'/);
  assert.match(panelSource, /listen\('click'/);
});

test('sending closes the menu, so it is not left over the comment just posted', () => {
  const { panel, state } = build();
  state.wbCommentMenu = true;
  panel.commentKey({
    key: 'Enter',
    target: { matches: (selector) => selector === '[data-wb-send-on-enter]', closest: () => null },
    preventDefault() {},
  });
  assert.equal(state.wbCommentMenu, false);
});

test('the panel mounts itself, on the record page and in the record modal alike', async () => {
  // Asking the host to make the call meant a line in the entry bundle and a second place to
  // forget it: the same composer is drawn on the record page and inside the record modal.
  const { draw } = build();
  const box = fakeBox({ needs: 90 });
  globalThis.getComputedStyle = () => ({ maxHeight: '220px' });
  globalThis.document.querySelectorAll = () => [box];

  draw();
  assert.equal(box.style.height, undefined, 'the markup is still a string at this point');
  await Promise.resolve();
  assert.equal(box.style.height, '92px', 'and sized once the host has put it in the page');
});

test('the styles cover the menu and the box that grows', () => {
  assert.match(styles, /\.wb-attach-menu \{/);
  assert.match(styles, /\.wb-attach \{[^}]*position: relative/);
  // Upward: the composer is the last thing in the panel, so anything below it is off the bottom.
  // The exact gap is a look, not a rule -- the direction is the rule.
  assert.match(styles, /\.wb-attach-menu \{[^}]*bottom: calc\(100% \+ \d+px\)/);
  assert.match(styles, /\.wb-attach-ic \{/);
  assert.match(styles, /\.wb-attach-menu button:focus-visible \{/);
  // Themed, not the reference screenshot palette: "make it themed with the system, do not
  // adapt the theme on image, i just want the idea". A menu that stays dark while the app is
  // light is the only dark surface in the product and a second theme to maintain.
  const menu = styles.match(/\.wb-attach-menu \{[^}]*\}/)[0];
  assert.match(menu, /background: var\(--surface\)/);
  assert.match(menu, /border: 1px solid var\(--border\)/);
  assert.ok(!/#1f2023|#f3f3f4/.test(styles), 'the hard-coded sheet colours are gone');
  const row = styles.match(/\.wb-attach-menu button \{[^}]*\}/)[0];
  assert.match(row, /color: var\(--text\)/, 'the rows read as page ink, like every other menu');
  // And it cannot leave the window: the composer sits at the right of the right-hand card, so
  // a sheet anchored at left: 0 grew straight past the viewport edge.
  assert.match(menu, /right: 0/);
  assert.match(menu, /left: auto/);
  assert.match(menu, /max-width: min\(288px, calc\(100vw - 28px\)\)/);
  // The glyph keeps its own colour -- the part of the reference worth taking.
  assert.ok(!/background:/.test(styles.match(/\.wb-attach-ic \{[^}]*\}/)[0]));
  const box = styles.match(/\.wb-rec-panel \.wb-comment-add textarea \{[^}]*\}/)[0];
  assert.match(box, /resize: none/, 'a height set by hand would be overwritten by the next keystroke');
  assert.match(box, /max-height: 220px/);
  assert.match(box, /min-height: 62px/);
});
