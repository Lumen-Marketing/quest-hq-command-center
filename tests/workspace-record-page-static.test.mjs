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
const slice = (name) => (name === 'wbViewItemPage' ? recordPage : main)
  .match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0] || '';

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

test('the back button names the app', () => {
  // "All Jobs", not "Back" -- it says where it goes, so it reads the same as the deck row.
  assert.match(slice('wbViewItemPage'), /<i class="ti ti-arrow-left"><\/i>All \$\{h\(app\.name\)\}/);
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
  // record and they drift.
  const save = slice('wbSaveInlineValue');
  assert.match(save, /wbLogActivity\(workspace, \{/);
  assert.match(save, /wbNotifyItem\(companyId, workspace, app, item/);
  assert.match(save, /wbRunAutomations\(companyId, workspace, app, item, 'updated', prev\)/);
  assert.match(save, /wbSave\(companyId\);/);
  assert.match(save, /item\.updatedAt = stamp;/);
});

test('it refuses what the form refused, and puts the value back', () => {
  const save = slice('wbSaveInlineValue');
  assert.match(save, /if \(field\.required && emptied\)/);
  assert.match(save, /isValidEmail\(String\(value\)\.trim\(\)\)/);
  assert.match(save, /const restore = \(\) => \{ cell\.innerHTML = cell\.dataset\.was;/);
});

test('opening a value and leaving it alone changes nothing', () => {
  // Clicking a value and clicking away is a normal thing to do. It must not stamp the record
  // as edited, log activity, or fire automations at everybody.
  assert.match(
    slice('wbSaveInlineValue'),
    /if \(JSON\.stringify\(before \?\? ''\) === JSON\.stringify\(value \?\? ''\)\) \{ restore\(\); return; \}/,
  );
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

test('the page binds its own comment handlers', () => {
  for (const attr of ['data-wb-add-comment', 'data-wb-comment-edit', 'data-wb-comment-save', 'data-wb-comment-del']) {
    assert.match(main, new RegExp(`bind\\('\\[${attr}\\]'`), `${attr} is unbound on the page`);
  }
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
  assert.match(open, /if \(!wbFieldUiModule\) \{/);
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
  const save = slice('wbSaveInlineValue');
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
  assert.match(slice('wbViewItemPage'), /const ctx = \{ companyId, workspace, app, values: item\.values, item, canManage: false \};/);
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

// ---- each panel on a record scrolls itself ---------------------------------------------------
//
// "Separate the scroll of the contacts record to the activity and comment section."
//
// They sit side by side, so what you are reading on one has nothing to do with the other:
// scrolling a long history used to drag the record's own fields off the screen, and filling in a
// long field list pushed the conversation away.

test('a record panel taller than the screen scrolls inside itself', () => {
  const rule = styles.match(/\.wb-record \.wb-dash-grid > \.wb-w:not\(\.editing\) \{([\s\S]*?)\}/)?.[1] || '';
  assert.match(rule, /max-height: calc\(100vh - var\(--wb-record-chrome\)\)/);
  assert.match(rule, /overflow-y: auto/);
  // A scroll that reaches its end must not carry on into the page behind it -- the whole point
  // is that the two panels do not move each other.
  assert.match(rule, /overscroll-behavior: contain/);
  assert.match(styles, /--wb-record-chrome: \d+px;/);
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
