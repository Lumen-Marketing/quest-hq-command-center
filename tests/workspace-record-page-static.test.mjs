import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Opening a record from an app's list navigates to a page rather than raising a modal, so
// the record has a URL, can be linked or bookmarked, and browser-back returns to the list.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
// The record page is its own fetched-on-demand module now, so slicing `main` for it would
// match the loader shim, whose body fetches rather than renders.
const recordPage = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The Activity / Comments card moved out of main.js into its own fetched module too.
const panel = readFileSync(new URL('../src/workspace/record-panel.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The record page owns its own code now -- the page, and the inline editor that was lifted out
// of main.js with it. Looked for there first and in main.js second, so a function moving between
// the two does not need every assertion about it rewritten.
// Closed on the brace at the function's OWN indent. The record page's functions live inside a
// factory, so they close on `\n  }` -- a pattern anchored to a bare `\n}` runs on to the end of
// the factory and quietly makes every assertion about one function true of all of them.
// Bounded by the NEXT function at the same indent, not by the first closing brace at that
// indent: a `.map((c) => {` callback inside a template literal closes at column 2 as well, so
// brace-matching by indent cuts the body off part-way and every assertion after that point
// silently passes on text it never saw.
const slice = (name) => {
  for (const src of [recordPage, main]) {
    const at = src.match(new RegExp(`(^|\\n)([ \\t]*)(?:async )?function ${name}\\(`));
    if (!at) continue;
    const start = at.index + (at[1] ? 1 : 0);
    const next = src.indexOf(`\n${at[2]}function `, start + 1);
    return next < 0 ? src.slice(start) : src.slice(start, next);
  }
  return '';
};

test('clicking a row navigates instead of opening a modal', () => {
  const source = main.match(/el\.addEventListener\('click', \(e\) => \{[\s\S]*?\n {6}\}\);/)?.[0] || '';
  assert.match(source, /navigate\(companyPath\('workspaces', \{/);
  assert.match(source, /item_id: el\.dataset\.item/);
  assert.ok(!/openWbItemModal\(companyId, workspaceId, appId, el\.dataset\.item\)/.test(source));
});

test('the record route renders a page, not the app list', () => {
  assert.match(main, /const itemId = route\.params\.get\('item_id'\) \|\| '';/);
  assert.match(main, /wbViewItemPage\(route, companyId, workspace, app, item\)/);
});

test('the header is one row: who, where in the deck, what you can do', () => {
  // It used to be two stacked rows -- a bar with the back link and the counter, and a second
  // row underneath with the icon and the name. That spent a whole line of a STICKY header on a
  // back arrow and a page count.
  const page = slice('wbViewItemPage');
  assert.ok(!/wb-record-head/.test(page), 'the second row is gone');
  assert.match(page, /<div class="wb-record-lead">[\s\S]*?wb-record-back[\s\S]*?wb-record-ic[\s\S]*?wb-record-title[\s\S]*?<\/div>/,
    'back, icon and name are one group on the left');
  // Order inside the row: the lead, then the stepper, then the controls.
  assert.ok(page.indexOf('wb-record-lead') < page.indexOf('${stepper}'));
  assert.ok(page.indexOf('${stepper}') < page.indexOf('wb-dash-controls'));
});

test('the counter is centred against the header, not against what is left of it', () => {
  // A flex row with auto margins centres the counter in the LEFTOVER space, so a long record
  // name shoves it right and it moves from record to record. Explicit columns, and each child
  // placed into one, so a missing stepper or a missing Customize does not slide the others.
  const bar = styles.match(/\.wb-record-bar \{[^}]*\}/)[0];
  assert.match(bar, /display: grid/);
  assert.match(bar, /grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
  assert.match(styles, /\.wb-record-bar \.wb-record-step \{[^}]*grid-column: 2;[^}]*justify-self: center/);
  assert.match(styles, /\.wb-record-bar \.wb-dash-controls \{[^}]*grid-column: 3;[^}]*justify-self: end/);
  assert.match(styles, /\.wb-record-lead \{[^}]*grid-column: 1/);
  // Three columns need room; below that it stacks rather than crushing the name.
  assert.match(styles, /@media \(max-width: 720px\) \{\s*\.wb-record-bar \{ grid-template-columns: minmax\(0, 1fr\) auto; \}/);
});

test('a long record name is truncated rather than pushing the row apart', () => {
  // Both lines of the lead are one line each now that the header is a single row.
  assert.match(styles, /\.wb-record-title h1 \{[^}]*text-overflow: ellipsis/);
  assert.match(styles, /\.wb-record-meta \{[^}]*text-overflow: ellipsis/);
  assert.match(styles, /\.wb-record-lead \{[^}]*min-width: 0/, 'or the flex child refuses to shrink');
});

test('the back button is one icon, and still says where it goes', () => {
  // It used to read "All Jobs". Asked for as a single icon, so the visual label goes -- but the
  // information does NOT: an unlabelled arrow is announced as "link" and answers nothing on
  // hover, and "All Jobs" is the whole reason it reads the same as the deck row it came from.
  const page = slice('wbViewItemPage');
  assert.match(page, /class="wb-record-back"[\s\S]*?title="All \$\{h\(app\.name\)\}"/);
  assert.match(page, /aria-label="All \$\{h\(app\.name\)\}"/);
  assert.match(page, /<i class="ti ti-arrow-left"><\/i><\/a>/, 'nothing but the icon inside it');
  // And it is sized as a control rather than inheriting the old pill's text padding.
  assert.match(styles, /\.wb-record-back \{[^}]*justify-content: center;/);
});

test('back returns to the list you left, filters intact', () => {
  const source = slice('wbViewItemPage');
  assert.match(source, /const stage = route\.params\.get\('stage'\) \|\| '';/);
  assert.match(source, /\.\.\.\(stage \? \{ stage \} : \{\}\)/);
  // And the row carries it forward on the way in, or there would be nothing to come back to.
  assert.match(main, /const stage = state\.route\?\.params\?\.get\('stage'\) \|\| '';/);
});

test('a deleted record explains itself instead of rendering blank', () => {
  assert.match(main, /wbRecordMissing\(companyId, app\)/);
  const source = slice('wbRecordMissing');
  assert.match(source, /This record is gone/);
  assert.match(source, /All \$\{h\(app\.name\)\}/, 'the way out must still be there');
});

// --- editing happens on the record, not in a form over it -----------------------------------
//
// "remove the edit button and make it directly edit on the item, so when I click the data
// I'm on edit mode and when I click somewhere else or go back it saves."

test('there is no Edit button, because the value is the control', () => {
  const page = slice('wbViewItemPage');
  assert.ok(!/data-wb-record-edit/.test(page), 'the Edit button must be gone');
  assert.ok(!/openWbItemModal/.test(page), 'and it must not reopen the record as a modal');
  assert.ok(!/data-wb-record-edit/.test(main), 'nothing may still bind it either');
  assert.match(page, /data-wb-inline="\$\{h\(f\.id\)\}"/);
});

test('only somebody who can manage gets an editable cell', () => {
  assert.match(
    slice('wbViewItemPage'),
    /if \(!canManage \|\| !wbFieldIsEditable\(f\)\) return `<span class="wb-view-val">/,
  );
});

test('a generated field is not offered as editable', () => {
  // There is no input behind these, and wbReadFieldInput returns undefined for exactly this
  // set -- so a click would promise an edit that could never be saved.
  assert.match(main, /function wbFieldIsEditable\(field\) \{\n\s*return !!field && !WB_AUTO_FIELD_TYPES\.has\(field\.type\);/);
  assert.match(main, /const WB_AUTO_FIELD_TYPES = new Set\(\['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time', 'button'\]\);/);
});

test('the inline editor is the modal\'s own input and reader', () => {
  // Reusing both is what makes every field type editable inline with no per-type code, and
  // what makes a type added later work here without being taught to.
  const open = slice('wbBindInlineEdits');
  assert.match(open, /wbRenderFieldInput\(companyId, workspaceId, field, item\.values\[field\.id\]\)/);
  assert.match(slice('wbSaveInlineValue'), /const value = wbReadFieldInput\(field\);/);
  // The same binders the modal runs over its own markup.
  // All four the modal runs, not just some: a missing one leaves that field type rendered
  // but dead -- the checklist drew its controls and none of them were wired.
  for (const binder of ['wbMountFileFields(cell)', 'wbMountDurationFields(cell)', 'wbMountProgressFields(cell)', 'wbMountChecklistFields(cell)', 'wbBindUrlControls(cell)', 'wbBindRelationshipPickers(cell)']) {
    assert.ok(open.includes(binder), `${binder} is not run over the inline input`);
  }
});

test('clicking away saves, and Escape puts it back', () => {
  const open = slice('wbBindInlineEdits');
  // A pointerdown outside the cell, not a focus heuristic. Controls that redraw
  // themselves -- the checklist rebuilds its body on every tick -- destroy the focused
  // element, so activeElement fell back to <body> and every tick read as 'they left'.
  assert.match(open, /function onOutside\(event\) \{/);
  assert.match(open, /if \(cell\.contains\(event\.target\)\) return;/);
  assert.match(open, /document\.addEventListener\('pointerdown', onOutside, true\);/);
  assert.match(open, /document\.removeEventListener\('pointerdown', onOutside, true\);/, 'or the listener outlives the editor');
  // Tabbing away is leaving too, and relatedTarget survives a redraw.
  assert.match(open, /const to = event\.relatedTarget;/);
  assert.match(open, /if \(to && !cell\.contains\(to\)\) close\(true\);/);
  assert.match(open, /if \(event\.key === 'Escape'\)[\s\S]*?close\(false\)/);
  // Enter saves, except where a newline is part of the value.
  assert.match(open, /field\.type !== 'textarea' && field\.type !== 'checklist'/);
});

test('an inline save is a real save, not a quieter one', () => {
  // A change made here must not skip what the modal did, or there are two ways to edit a
  // record and they drift. The writing half now lives in wbCommitFieldValue so the map pin
  // can go through it too -- which is the same argument one level along.
  const save = slice('wbCommitFieldValue');
  assert.match(save, /wbLogActivity\(workspace, \{/);
  assert.match(save, /wbNotifyItem\(companyId, workspace, app, item/);
  assert.match(save, /wbRunAutomations\(companyId, workspace, app, item, 'updated', prev\)/);
  assert.match(save, /wbSave\(companyId\);/);
  assert.match(save, /item\.updatedAt = stamp;/);
});

test('every way of writing one field goes through the one writer', () => {
  // The point of the split. A second path that wrote item.values itself would be a second
  // place for history, notifications and automations to be forgotten.
  assert.match(slice('wbSaveInlineValue'), /wbCommitFieldValue\(companyId, workspaceId, appId, itemId, field, value\)/);
  // The writer moved into the record page with the rest of the inline editor, so main.js reaches
  // it through the module it already loads to draw the page.
  assert.match(slice('saveLocationPicker'), /await loadWbViewItemPage\(\)/);
  assert.match(slice('saveLocationPicker'), /recordPage\.commitFieldValue\(picker\.companyId, picker\.workspaceId, picker\.appId, picker\.itemId, field, address\)/);
});

test('it refuses what the form refused, and puts the value back', () => {
  const rules = slice('wbCommitFieldValue');
  assert.match(rules, /if \(field\.required && emptied\)/);
  assert.match(rules, /isValidEmail\(String\(value\)\.trim\(\)\)/);
  // A refusal is handed back rather than shown, so the caller decides what to put back: the
  // inline editor restores its cell, the pin leaves its dialog open.
  assert.match(rules, /return \{ saved: false, refusal: `"\$\{field\.label\}" is required\.` \}/);
  const save = slice('wbSaveInlineValue');
  assert.match(save, /const restore = \(\) => \{ cell\.innerHTML = cell\.dataset\.was;/);
  assert.match(save, /if \(outcome\.refusal\) \{ showToast\(outcome\.refusal, 'local', 'Workspaces'\); restore\(\); return; \}/);
});

test('opening a value and leaving it alone changes nothing', () => {
  // Clicking a value and clicking away is a normal thing to do. It must not stamp the record
  // as edited, log activity, or fire automations at everybody.
  assert.match(
    slice('wbCommitFieldValue'),
    /if \(JSON\.stringify\(before \?\? ''\) === JSON\.stringify\(value \?\? ''\)\) return \{ saved: false, refusal: '' \};/,
  );
  // And the cell goes back rather than being left as an open editor over an unchanged value.
  assert.match(slice('wbSaveInlineValue'), /if \(!outcome\.saved\) \{ restore\(\); return; \}/);
});

// --- comments work in both places ---------------------------------------------------------

test('the comment actions resolve their record from the page as well as the modal', () => {
  const source = slice('wbCommentContext');
  assert.match(source, /const m = state\.builderModal;/, 'the modal wins when both are open');
  assert.match(source, /route\.params\?\.get\('item_id'\)/);
  // Shaped like the modal so wbPersistCommentChange, which already took it, is unchanged.
  assert.match(source, /return \{ companyId, workspaceId, appId: route\.params\.get\('app_id'\) \|\| '', editId \};/);
  for (const fn of ['wbAddItemComment', 'wbSaveEditedComment', 'wbDeleteItemComment']) {
    assert.match(slice(fn), /const m = wbCommentContext\(\);/, `${fn} must not read the modal directly`);
  }
});

test('the page route resolves a workspace id rather than handing wbFind an empty one', () => {
  // wbFind returns a null app for an unknown workspace, which would silently drop every
  // comment action on the page.
  assert.match(slice('wbCommentContext'), /wbCompanyWorkspace\(companyId\)\?\.id \|\| ''/);
});


test('which comment is being edited is not stored on the modal', () => {
  assert.match(main, /wbEditingCommentId: null,/);
  assert.ok(!/editingCommentId(?!:)/.test(main.replace(/wbEditingCommentId/g, '')), 'no modal-scoped copy may remain');
  // The panel moved into ./workspace/record-panel.js; where the flag LIVES is the point.
  assert.match(panel, /state\.wbEditingCommentId === entry\.id/);
});

test('one set of comment handlers serves the page and the modal alike', () => {
  // There used to be two copies of these five bindings, one per surface, differing only in
  // whether they remembered the modal's scroll. Every handler resolves which record it is on
  // through wbCommentContext anyway, so the split bought nothing and cost a second place for
  // the next binding to be forgotten in.
  for (const attr of ['data-wb-add-comment', 'data-wb-comment-edit', 'data-wb-comment-cancel', 'data-wb-comment-save', 'data-wb-comment-del']) {
    assert.ok(main.includes(`[${attr}]`), `${attr} is unbound`);
    assert.ok(!new RegExp(`bind\\('\\[${attr}\\]'`).test(main), `${attr} must not also be bound per render`);
  }
  // Delegated from the document, which is what makes one set enough.
  assert.match(main, /const cmtAct = event\.target\.closest\('\[data-wb-add-comment\]/);
  assert.match(main, /wbCommentAction\(cmtAct\)/);
  const act = slice('wbCommentAction');
  assert.match(act, /wbSaveEditedComment\(wbCommentSave\)/);
  assert.match(act, /wbDeleteItemComment\(wbCommentDel\)/);
  assert.match(act, /wbAddItemComment\(\)/);
  // The scroll is kept for the modal and is a no-op on the page, which is why one path can
  // serve both without the page losing its position.
  assert.match(act, /wbKeepModalScroll\(\)/);
});

test('the record page reads on a phone', () => {
  assert.match(styles, /\.wb-record-body \{[^}]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(0, 1fr\)/);
  assert.match(styles, /@media \(max-width: 900px\) \{ \.wb-record-body \{ grid-template-columns: minmax\(0, 1fr\); \} \}/);
});

test('the editor waits for its module instead of blanking the value', () => {
  // wbRenderFieldInput returns an EMPTY STRING until field-config-ui is fetched, and only
  // the builder modal used to pull that in. Opening an editor cold blanked the cell, and
  // focusout then read no input, got '' back, and wrote it over the real value.
  const open = slice('wbBindInlineEdits');
  // Asked rather than read: the flag is a module-level `let` in main.js, so a value handed over
  // once at construction would be the null it held before anything had been fetched, for ever.
  assert.match(open, /if \(!wbFieldUiReady\(\)\) \{/);
  assert.match(main, /wbFieldUiReady: \(\) => !!wbFieldUiModule/);
  assert.match(open, /wbLoadFieldUi\(\)\s*[\r\n]+\s*\.then\(\(\) => open\(true\)\)/);
  // Bounded: a load that resolves without leaving the module usable must not re-enter
  // forever and hang the click.
  assert.match(open, /const open = \(retried = false\) => \{/);
  assert.match(open, /if \(retried\) \{ showToast\(/);
});

test('a missing input can never be read as an instruction to erase', () => {
  // wbReadFieldInput returns '' both for a field somebody cleared and for markup that never
  // mounted. Checked BEFORE reading, so the two can never be confused.
  const save = slice('wbSaveInlineValue');
  assert.match(save, /if \(!cell\.querySelector\('\[data-f\]'\)\) \{ restore\(\); return; \}/);
  assert.ok(
    save.indexOf("cell.querySelector('[data-f]')") < save.indexOf('const value = wbReadFieldInput(field);'),
    'the guard has to come before the read, or the empty value is already in hand',
  );
});

test('an inline save recomputes derived fields before automations run', () => {
  // The card path (wbEditChecklistStepInline) syncs the linked progress field and only then
  // runs the rules. Inline editing skipped the sync, so an automation watching progress read
  // the stale number: ticking the last checklist step on a card fired it, ticking the same
  // step on the record page did not.
  const save = slice('wbCommitFieldValue');
  assert.match(save, /wbSyncLinkedProgress\(app, item, field\.id\);/);
  assert.ok(
    save.indexOf('wbSyncLinkedProgress(app, item, field.id);') < save.indexOf('wbRunAutomations('),
    'the order is the point: rules must read the recomputed value, not the old one',
  );
  // And the card path it is matching is still doing the same thing.
  const card = main.slice(main.indexOf('function wbEditChecklistStepInline('));
  const cardBody = card.slice(0, card.indexOf('\n}'));
  assert.ok(cardBody.indexOf('wbSyncLinkedProgress(') < cardBody.indexOf('wbRunAutomations('));
});

test('a comment shows the author photo, not always their initials', () => {
  // This built the initials badge as literal markup and never read avatar_url, so a comment
  // showed "LM" while the same person's photo rendered everywhere else. wbAvatar draws the
  // image when there is one and falls back to that same badge when there is not.

  assert.match(panel, /const avatar = wbAvatar\(who, 26\);/);
  assert.match(panel, /avatar_url: live\?\.avatar_url \|\| '',/);
  assert.ok(!/const avatar = `<span class="wb-avatar"/.test(panel), 'no hand-rolled avatar markup');
  // wbAvatar only renders an image if the member carries one, so the directory must supply it.
  const members = main.slice(main.indexOf('function wbMembers('));
  assert.match(members.slice(0, members.indexOf('\n}')), /avatar_url: user\.avatar_url \|\| ''/);
});

test('Created and Last modified show their value on the record page', () => {
  // wbFmtVal already reads these off item.createdAt / item.updatedAt rather than out of
  // values. The record page passed item: null, so both rendered a dash on every record.
  // Named valueCtx, not ctx: the factory's own ctx is passed to the Quick Create module from
  // inside this same function, and a local called `ctx` shadowed it -- see
  // tests/record-quick-create-renders.test.mjs.
  assert.match(slice('wbViewItemPage'), /const valueCtx = \{ companyId, workspace, app, values: item\.values, item, canManage: false \};/);
  assert.match(main, /if \(field\.type === 'created_time'\) \{ const t = ctx\.item && ctx\.item\.createdAt;/);
  assert.match(main, /if \(field\.type === 'updated_time'\)/);
});

test('the timestamp fields stay read-only', () => {
  // "just make sure that the date created and date updated is uneditable." They are in
  // WB_AUTO_FIELD_TYPES, which is what wbFieldIsEditable refuses, so handing the item over
  // does not make them clickable.
  assert.match(main, /const WB_AUTO_FIELD_TYPES = new Set\(\['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time', 'button'\]\);/);
  assert.match(main, /function wbFieldIsEditable\(field\) \{\n\s*return !!field && !WB_AUTO_FIELD_TYPES\.has\(field\.type\);/);
  // And the live checkbox toggle needs canManage as well as the item, so it is still off.
  assert.match(main, /if \(ctx\.item && ctx\.canManage\) \{/);
});

test('the app strip pins to its scroll container, flush under the header', () => {
  // .work-surface has overflow: auto, so IT is the scroll container -- the strip's sticky
  // offset is measured from its top edge, which already sits below the page header.
  // Offsetting by the header height pushed the strip down by exactly that much and left a
  // band of dead space above it.
  assert.match(styles, /\.wb-topbar \{[\s\S]*?position: sticky;[\s\S]*?top: 0;/);
  assert.ok(!/--quest-header-h/.test(styles), 'the header offset was the bug, not the fix');
  assert.ok(!/--quest-header-h/.test(main), 'and nothing should still be measuring it');
  // Pulled through .work-surface's own padding so it meets the header with no seam.
  assert.match(styles, /\.wb-topbar \{[\s\S]*?margin: 0 -24px 12px;/);
  // No negative TOP margin: sticky pins the margin box, so that left an uncovered band.
  assert.match(styles, /\.quest-app\[data-section="workspaces"\] \.work-surface \{ padding-top: 0; \}/);
  assert.match(styles, /\.work-surface \{[\s\S]*?padding: 18px 24px 26px;/, 'the -24px sides mirror these');
  // Opaque, or content scrolls visibly under it.
  assert.match(styles, /\.wb-topbar \{[\s\S]*?background: var\(--surface\);/);
  // The base rule's overflow: hidden would clip the sticky behaviour.
  assert.match(styles, /\.wb-topbar \{[\s\S]*?overflow: visible;/);
});

// ---- the app strip stays on top, on a record too ---------------------------------------------
//
// "I want the Activity and the apps to stay on top even when I'm inside the item record."
//
// A record is a page INSIDE an app. The strip was drawn on the app's own pages and on the
// workspace home and nowhere else, so opening a record took the switcher away and the only way
// to the next app was back out to the list first.

test('the record route draws the app strip, with its own app marked as the one you are in', () => {
  const source = main.match(/if \(app && itemId\) \{[\s\S]*?\n {2}\}/)?.[0] || '';
  assert.match(source, /wbWorkspaceHeader\(companyId, workspace, app\.id\)/, 'no strip on a record');
  // Before the record, not after it: it is the top of the page.
  assert.ok(
    source.indexOf('wbWorkspaceHeader') < source.indexOf('wbViewItemPage'),
    'the strip belongs above the record, not below it',
  );
  // A record that has been deleted keeps it too — that page is still inside the app.
  assert.match(source, /wbWorkspaceHeader\(companyId, workspace, app\.id\)\}\$\{item/);
});

test('the record header stops below the strip instead of sliding under it', () => {
  // Both stick to the same scroll container. At a negative offset they claim the same spot and
  // the lower z-index disappears on scroll, which is the bug the app tab row already had.
  const rule = styles.match(/\.wb-record-top \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(rule, /position: sticky;/);
  assert.match(rule, /top: var\(--wb-strip-h, 0px\);/);
  assert.ok(!/top: -\d/.test(rule), 'a negative offset puts it under the strip');
  assert.ok(!/margin: -\d+px/.test(rule), 'and pulls it up into the strip when nothing is scrolled');
  // Opaque and full-bleed, or the cards show through it as they pass underneath.
  assert.match(rule, /background: var\(--surface-2/);
  assert.match(rule, /margin: 0 -24px;/);
  // The strip stays above it.
  assert.match(styles, /\.wb-topbar \{[\s\S]*?z-index: 30;/);
  assert.match(rule, /z-index: 8;/);
});

test('the record is a column, so its header has room to stick', () => {
  // A grid item's containing block is its own grid area — one row, sized to the item — so
  // sticky had nowhere to move and never worked. A flex item's is the whole container.
  // The gap is a look and has since been tightened; the column is the rule.
  const rule = styles.match(/\n\.wb-record \{([^}]*)\}/);
  assert.ok(rule);
  assert.match(rule[1], /display: flex/);
  assert.match(rule[1], /flex-direction: column/);
});

// ---- each panel on a record scrolls itself ---------------------------------------------------
//
// "Separate the scroll of the contacts record to the activity and comment section."
//
// They sit side by side, so what you are reading on one has nothing to do with the other:
// scrolling a long history used to drag the record's own fields off the screen, and filling in a
// long field list pushed the conversation away.

test('a record panel taller than the screen scrolls inside itself', () => {
  const rule = styles.match(/\.wb-record \.wb-dash-grid > \.wb-w:not\(\.editing\) \{([\s\S]*?)\}/)?.[1] || '';
  // The strip is subtracted separately: it is measured, not counted, so folding it into the
  // constant would be wrong by however much it moved.
  // ONE measured number, not a tally. The cap used to be `100vh - chrome - strip - header`,
  // three values that had to add up to whatever was above the cards -- and the moment the
  // header collapsed to one row the sum was 56px out and every card stopped short. The grid's
  // own top already contains all four, whatever they are doing.
  assert.match(rule, /max-height: calc\(100dvh - var\(--wb-record-grid-top, 300px\) - var\(--wb-record-foot\)\)/);
  assert.match(rule, /overflow-y: auto/);
  // A scroll that reaches its end must not carry on into the page behind it -- the whole point
  // is that the two panels do not move each other.
  assert.match(rule, /overscroll-behavior: contain/);
  assert.match(styles, /--wb-record-grid-top: \d+px;/, 'a value for the first paint');
});

test('the cap is scoped to the record, not to every grid that shares the class', () => {
  // .wb-dash-grid is also the app Dashboard, where the tiles are a page meant to scroll as one.
  const rule = styles.match(/\.wb-record \.wb-dash-grid > \.wb-w:not\(\.editing\) \{/);
  assert.ok(rule, 'the selector must carry .wb-record');
  // And while the layout is being rearranged, whole blocks stay visible: the move/resize tools
  // are pinned inside the block and would scroll away with its content.
  assert.ok(/:not\(\.editing\)/.test(rule[0]));
});

test('only one scrollbar governs the conversation', () => {
  // The feed already scrolled inside the panel. A panel scrollbar around a feed scrollbar is
  // two ways to move the same thing, and the composer would leave with it.
  assert.match(styles, /\.wb-record \.wb-dash-grid > \.wb-w-comments:not\(\.editing\) \{[^}]*overflow: hidden/);
  assert.match(styles, /\.wb-record \.wb-w-comments \.wb-rec-body \{[^}]*max-height: none/);
  // Flexed to fill the panel, so a tall window shows more history rather than a half-empty card.
  assert.match(styles, /\.wb-record \.wb-w-comments \.wb-rec-body \{[^}]*flex: 1 1 auto; min-height: 0/);
  // The feed's own scroll is what remains.
  assert.match(styles, /\.wb-rec-body \{[\s\S]*?overflow-y: auto/);
});

test('stacked on a narrow screen, the panels go back to scrolling with the page', () => {
  // One column means they are no longer side by side, and a scrollbar inside each stacked card
  // is a worse way to read than simply scrolling the page.
  const at = styles.indexOf('.wb-record .wb-dash-grid > .wb-w:not(.editing)');
  const guard = styles.lastIndexOf('@media (min-width: 901px)', at);
  assert.ok(guard !== -1 && guard < at, 'the cap sits inside the wide-screen guard');
  // And it mirrors the breakpoint the record grid already stacks at.
  assert.match(styles, /@media \(max-width: 900px\) \{ \.wb-record-body \{ grid-template-columns: minmax\(0, 1fr\); \} \}/);
});
