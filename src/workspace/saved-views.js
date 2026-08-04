// Saved views for an app's record list.
//
// A view is a name plus a field to split by. Rendered, it becomes a heading with the total
// and a row per value of that field with its own count — "Lead Status 21 → New Untouched 4,
// Discovery 2". Clicking a row filters the list to that value.
//
// Splitting is done by pipeline-core's boardColumns, the same function the board, the deck
// nav and the stage card use, so a count here can never disagree with a count there.
//
// Team views live on the app, so everybody sees them. Private views live in this browser's
// localStorage, which is the only place they are actually private: the workspace document is
// one JSON value every member can read, so a "private" flag stored in it would hide a view
// in the UI while leaving it in plain sight in the data.

import { boardColumns, stagesOf } from './pipeline-core.js';

export const VIEW_SCOPES = ['team', 'private'];

/** Fields a view can split by: ones whose values are a named, ordered, bounded list. */
export const SPLIT_FIELD_TYPES = ['status', 'category'];
export const splitFields = (app) => (app?.fields || []).filter((f) => SPLIT_FIELD_TYPES.includes(f.type));

let seq = 0;
const nextId = () => `v${(seq += 1)}${Math.abs(Date.now() % 100000)}`;

export function normalizeView(input, makeId = nextId) {
  const raw = input && typeof input === 'object' ? input : {};
  return {
    id: String(raw.id || makeId()),
    title: String(raw.title || '').trim() || 'Untitled view',
    // '' means no split: the view is just a named shortcut to the whole list.
    fieldId: String(raw.fieldId || ''),
    scope: VIEW_SCOPES.includes(raw.scope) ? raw.scope : 'team',
  };
}

export const normalizeViews = (list, makeId = nextId) => (Array.isArray(list) ? list.map((v) => normalizeView(v, makeId)) : []);

/**
 * Every view for an app, team and private together, tagged with where it came from.
 *
 * Private ones are filtered to this app so one browser's storage can hold views for many.
 */
export function allViews(app, privateList) {
  // Filter BEFORE normalising: normalizeView keeps only the four fields a view has, so an
  // appId checked afterwards is always undefined and every app's private views leak into
  // every other app's rail.
  const mine = (Array.isArray(privateList) ? privateList : []).filter((v) => v?.appId === app?.id);
  return [
    ...normalizeViews(app?.views).map((v) => ({ ...v, scope: 'team' })),
    ...normalizeViews(mine).map((v) => ({ ...v, scope: 'private' })),
  ];
}

/**
 * A view's rows: one per value of the field it splits by, with counts.
 *
 * Returns null when the view has no split field, which is how the renderer knows to draw a
 * plain shortcut rather than an empty group. A field that has since been deleted is treated
 * the same way, so the view degrades to a shortcut instead of vanishing.
 */
export function viewGroups(app, view) {
  const field = (app?.fields || []).find((f) => f.id === view?.fieldId);
  if (!field || !stagesOf(field).length) return null;
  return boardColumns(app?.items || [], field, null);
}

/** How many records a view covers. Without a split that is simply all of them. */
export function viewTotal(app, view) {
  const groups = viewGroups(app, view);
  if (!groups) return (app?.items || []).length;
  return groups.reduce((n, g) => n + g.count, 0);
}

export function addView(views, input, makeId = nextId) {
  const view = normalizeView(input, makeId);
  if (!String(input?.title || '').trim()) return views;
  return [...views, view];
}

export const removeView = (views, id) => views.filter((v) => v.id !== id);

/** Split a mixed list back into what belongs on the app and what belongs in this browser. */
export function partitionViews(views, appId) {
  return {
    team: views.filter((v) => v.scope === 'team').map(({ scope, appId: _a, ...rest }) => rest),
    private: views.filter((v) => v.scope === 'private').map(({ scope, ...rest }) => ({ ...rest, appId })),
  };
}

/**
 * The rail itself.
 *
 * Takes everything it needs rather than reaching into main.js: the escaper, the permission
 * check, the app, the current filter state, and this browser's private views. That is what
 * lets the panel live beside the model it renders instead of in the entry chunk.
 */
export function renderViewsRail({ h, can, companyId, app, ui, state, privateViews, noneKey }) {
  const scope = state.wbViewScope === 'private' ? 'private' : 'team';
  const views = allViews(app, privateViews).filter((v) => v.scope === scope);
  const canManage = can('workspaces.manage', companyId);
  const total = app.items.length;
  const adding = state.wbViewAdding;
  const fields = splitFields(app);

  const row = (view) => {
    const groups = viewGroups(app, view);
    const shownAll = state.wbViewExpanded?.[view.id];
    const visible = groups ? (shownAll ? groups : groups.slice(0, 5)) : [];
    const field = (app.fields || []).find((f) => f.id === view.fieldId) || null;
    // What a view splits by is chosen when it is created and stays chosen. The rows below
    // already name the field's own values, so a label repeating it earned no space, and a
    // control to change it invited editing a decision that was already made.
    const editable = view.scope === 'private' || canManage;
    return `<div class="wb-vrow">
      <div class="wb-vhead">
        <button class="wb-vtitle" type="button" data-wb-view-pick="${h(view.id)}:">${h(view.title)}</button>
        <span class="wb-vcount">${h(String(viewTotal(app, view)))}</span>
        ${editable ? `<button class="wb-vdel" type="button" data-wb-view-del="${h(view.id)}" title="Delete view" aria-label="Delete ${h(view.title)}"><i class="ti ti-x"></i></button>` : ''}
      </div>
      ${view.fieldId && !groups ? `<p class="wb-vhint">${field ? `<b>${h(field.label)}</b> has no options yet, so there is nothing to split by.` : 'That field was deleted, so this view now shows everything.'}</p>` : ''}
      ${visible.map((g) => {
    const id = g.id == null ? noneKey : g.id;
    const on = ui.chipFieldId === view.fieldId && ui.chipValue === id;
    return `<button class="wb-vopt ${on ? 'on' : ''}" type="button" data-wb-view-pick="${h(view.id)}:${h(id)}" aria-pressed="${on}">
          <i style="background:${h(g.color)}"></i><span>${h(g.label)}</span><b>${h(String(g.count))}</b>
        </button>`;
  }).join('')}
      ${groups && groups.length > 5 && !shownAll ? `<button class="wb-vmore" type="button" data-wb-view-more="${h(view.id)}">Show more</button>` : ''}
    </div>`;
  };

  return `<aside class="wb-views" aria-label="Saved views">
    <div class="wb-views-head">
      <h3>Views</h3>
      <button class="wb-vadd" type="button" data-wb-view-add><i class="ti ti-circle-plus"></i>Add</button>
    </div>
    ${adding ? `<form class="wb-vform" data-wb-view-form>
      <label>Title<input class="wb-input" name="title" placeholder="Name your view" autofocus required></label>
      <label>Place in<select class="wb-input" name="scope">
        <option value="private">My private views</option>
        ${canManage ? '<option value="team">Team views</option>' : ''}
      </select></label>
      <label>Split by<select class="wb-input" name="fieldId">
        <option value="">None</option>
        ${fields.map((f) => `<option value="${h(f.id)}">${h(f.label)}</option>`).join('')}
      </select></label>
      <div class="wb-vform-acts">
        <button class="btn btn-sm btn-primary" type="submit">Save</button>
        <button class="btn btn-sm" type="button" data-wb-view-cancel>Cancel</button>
      </div>
    </form>` : ''}
    <div class="wb-vtabs" role="group" aria-label="View scope">
      ${['team', 'private'].map((s) => `<button class="wb-vtab ${scope === s ? 'on' : ''}" type="button" data-wb-view-scope="${s}" aria-pressed="${scope === s}">${s === 'team' ? 'Team' : 'Private'}</button>`).join('')}
    </div>
    <div class="wb-vlist">
      <button class="wb-vall ${ui.chipValue ? '' : 'on'}" type="button" data-wb-view-pick=":"><span>All ${h(app.name)}</span><b>${h(String(total))}</b></button>
      ${views.length ? views.map(row).join('') : `<p class="wb-vempty">No ${scope} views yet. Add one to group this list by a field.</p>`}
    </div>
    ${scope === 'private' ? '<p class="wb-vnote">Private views are saved in this browser only.</p>' : ''}
  </aside>`;
}
