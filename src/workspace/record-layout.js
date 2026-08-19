// How one record of an app is laid out.
//
// The arrangement belongs to the APP, not to the record: you set it up once on any record
// and every record in that app is laid out the same way. That is the whole point — a record
// page is a form you read, and a form that changed shape per row would be unreadable.
//
// The blocks are moved, resized and removed by exactly the same functions the dashboard uses
// (moveWidget, resizeWidget, removeWidget, reorderWidget). They only ever touch `id` and
// `size`, so they work on any arrangement; a second copy would drift the first time one of
// them was fixed.

import { moveWidget, removeWidget, reorderWidget, resizeWidget } from './dashboard-widgets.js';

export {
  moveWidget as moveBlock,
  removeWidget as removeBlock,
  reorderWidget as reorderBlock,
  resizeWidget as resizeBlock,
};

/** Columns in the record grid, matching the dashboard so the two feel like one control. */
export const RECORD_COLUMNS = 4;

export const BLOCK_TYPES = [
  { type: 'fields', label: 'Field group', icon: 'ti-list-details', desc: 'A panel of fields you choose', size: 2, config: true },
  { type: 'comments', label: 'Comments', icon: 'ti-message', desc: 'The conversation on this record', size: 2, config: false },
  { type: 'meta', label: 'Details', icon: 'ti-info-circle', desc: 'Created and last edited', size: 1, config: false },
  { type: 'note', label: 'Note', icon: 'ti-note', desc: 'A line of text on every record', size: 2, config: true },
  { type: 'collection', label: 'Sub-items', icon: 'ti-list-check', desc: 'Records inside this record — dailies, line items, visits', size: 4, config: true },
  { type: 'events', label: 'Calls & messages', icon: 'ti-calendar-event', desc: 'Calls and messages scheduled on this record', size: 2, config: false },
  { type: 'quick', label: 'Quick Create', icon: 'ti-bolt', desc: 'Make a spreadsheet, form, file or proposal on this record', size: 2, config: false },
];

/**
 * What Quick Create can make.
 *
 * Nothing here is a field on the record any more. Spreadsheet, Form, Image and File were, and
 * they were removed on request: each one added a COLUMN TO THE APP the first time it was
 * pressed, so a spreadsheet made for one job put an empty Spreadsheet box on every other record
 * in that app for ever. That is what the App Builder's storage allows -- values are keyed by
 * field id, with no per-record attachment slot -- and it is not what Quick Create is for.
 *
 * What is left makes something ELSEWHERE and points it at this record. A task is a row in
 * public.tasks, made through the Tasks module's own New-task form, so it arrives with the
 * assignee, the due date, the notification and the My Work listing every other task has --
 * rather than a second task writer here that would drift from the first.
 *
 * `soon` marks an entry that is declared but has nothing behind it yet, so the card does not
 * draw it. Marked on the entry rather than filtered by the card, because the card is not the
 * place to remember which half of this list works.
 */
export const QUICK_CREATE = [
  { key: 'task', module: 'task', label: 'Task', desc: 'Something for someone to do', icon: 'ti-checkbox', tone: '#16a34a' },
  { key: 'field', module: 'field', label: 'New Field', desc: 'Add a field, and say where it goes', icon: 'ti-plus', tone: '#2563eb' },
  { key: 'call', module: 'call', label: 'Call', desc: 'Call now, or schedule one', icon: 'ti-phone', tone: '#0891b2' },
  { key: 'sms', module: 'sms', label: 'SMS', desc: 'Write a message to send later', icon: 'ti-message-2', tone: '#d97706' },
  // `soon`: declared here, nothing behind it yet, so the card does not draw it. Marked on the
  // entry rather than filtered out by the card, because the card is not the place to remember
  // which half of this list works -- an entry added without the flag is drawn, which is the
  // right default: a tile somebody forgot to show is invisible, and invisible is how Task
  // spent its first day.
  { key: 'proposal', module: 'proposal', label: 'Proposal', desc: 'A proposal linked to this record', icon: 'ti-file-description', tone: '#7c3aed', soon: true },
];

export const quickEntry = (key) => QUICK_CREATE.find((entry) => entry.key === key) || null;

/**
 * The field a Quick Create button writes into, and whether it has to be made first.
 *
 * Matched on TYPE rather than on a name: somebody who renames "Spreadsheet" to "Takeoff" has not
 * asked for a second spreadsheet column, and matching by name would give them one.
 */
export function quickCreateField(app, entry, makeId = nextId) {
  if (!entry?.field) return null;
  const existing = (app?.fields || []).find((f) => f?.type === entry.field && !f.hidden);
  if (existing) return { field: existing, created: false };
  return {
    field: { id: makeId(), label: entry.name, type: entry.field, required: false, hidden: false, config: {} },
    created: true,
  };
}

/**
 * Put a newly made field somewhere it will actually be seen.
 *
 * A `fields` block with an explicit `fieldIds` list is honoured EXACTLY, so a field in none of
 * them is invisible on the record page with nothing on screen to say why -- which would make
 * Quick Create look broken the first time it was used on a customised layout. Appended to the
 * last field group, because an arrival belongs after what was already there.
 *
 * A layout whose groups say "every field" (`fieldIds: null`) already shows it, and is returned
 * untouched rather than being pinned to a list it never had.
 */
export function placeFieldInLayout(blocks, fieldId) {
  const list = Array.isArray(blocks) ? blocks : [];
  const groups = list.filter((block) => block?.type === 'fields');
  if (!groups.length || groups.some((block) => block.config?.fieldIds == null)) return list;
  if (groups.some((block) => (block.config.fieldIds || []).includes(fieldId))) return list;
  const last = groups[groups.length - 1];
  return list.map((block) => (block === last
    ? { ...block, config: { ...block.config, fieldIds: [...(block.config.fieldIds || []), fieldId] } }
    : block));
}

const TYPE_BY_NAME = new Map(BLOCK_TYPES.map((t) => [t.type, t]));
export const blockMeta = (type) => TYPE_BY_NAME.get(type) || null;

let seq = 0;
const nextId = () => `b${(seq += 1)}${Math.abs(Date.now() % 100000)}`;

export function normalizeBlock(input, makeId = nextId) {
  const raw = input && typeof input === 'object' ? input : {};
  const meta = blockMeta(raw.type);
  const type = meta ? raw.type : 'fields';
  const size = Number(raw.size);
  const config = raw.config && typeof raw.config === 'object' ? { ...raw.config } : {};
  if (type === 'fields' && !Array.isArray(config.fieldIds)) config.fieldIds = null;
  return {
    id: String(raw.id || makeId()),
    type,
    size: Math.min(RECORD_COLUMNS, Math.max(1, Number.isFinite(size) ? Math.round(size) : (blockMeta(type)?.size || 2))),
    config,
  };
}

/**
 * What a record shows before anybody arranges it: every field, then the comments.
 *
 * Deliberately what the fixed page already showed, so turning this on changes nothing until
 * somebody chooses to change it.
 */
export function defaultLayout(app, makeId = nextId) {
  return [
    { type: 'fields', size: 2, config: { title: '', fieldIds: null } },
    { type: 'comments', size: 2, config: {} },
  ].map((b) => normalizeBlock(b, makeId));
}

export function layoutFor(app, makeId = nextId) {
  return Array.isArray(app?.recordLayout) ? app.recordLayout.map((b) => normalizeBlock(b, makeId)) : defaultLayout(app, makeId);
}

export function addBlock(blocks, type, app, makeId = nextId) {
  const meta = blockMeta(type);
  if (!meta) return blocks;
  const config = {};
  // A new field group starts EMPTY rather than holding every field: it is being added
  // alongside one that already shows them, and two panels listing the same fields is the
  // confusing outcome, not the helpful one.
  if (type === 'fields') { config.title = ''; config.fieldIds = []; }
  // A Sub-items card picks the app's first list, so it shows something the moment it lands
  // instead of needing a second trip through its settings to become anything at all.
  if (type === 'collection') {
    // A new card starts on the first list. It can show several -- the settings are checkboxes
    // -- but one is the only sensible default, and none would be a blank card.
    const first = (app?.collections || [])[0]?.id || '';
    config.collectionIds = first ? [first] : [];
    config.collectionId = first;
  }
  return [...blocks, normalizeBlock({ type, size: meta.size, config }, makeId)];
}

/** Whether the app has what a block needs. A Sub-items card needs a list to point at. */
export function blockSupported(app, type) {
  if (type !== 'collection') return true;
  return (app?.collections || []).length > 0;
}

/**
 * The fields a group shows, in the app's own field order.
 *
 * `fieldIds: null` means "whatever fields exist", so a field added later appears without
 * anybody having to revisit the layout. An explicit list is honoured exactly, minus any id
 * whose field has since been deleted.
 */
export function blockFields(app, block) {
  const all = app?.fields || [];
  const chosen = block?.config?.fieldIds;
  if (!Array.isArray(chosen)) return all;
  const wanted = new Set(chosen);
  return all.filter((f) => wanted.has(f.id));
}

/** Fields not shown by any group, so the editor can say what is missing from the page. */
export function unplacedFields(app, blocks) {
  const groups = (blocks || []).filter((b) => b.type === 'fields');
  // A group set to "all fields" covers everything, so nothing is unplaced.
  if (groups.some((b) => !Array.isArray(b.config?.fieldIds))) return [];
  const shown = new Set(groups.flatMap((b) => b.config.fieldIds || []));
  return (app?.fields || []).filter((f) => !shown.has(f.id));
}

/**
 * The layout with one block of `type` on it, added if it was not there.
 *
 * Scheduling the first call puts the card on the record, so the thing just saved is visible
 * without anybody going to Customize to find out where it went. Once it is on the layout it is
 * an element like any other -- movable, resizable, removable -- and adding it again is a no-op,
 * so removing it deliberately is not undone by the next save.
 */
export function ensureBlock(blocks, type, makeId = nextId) {
  const list = Array.isArray(blocks) ? blocks : [];
  if (list.some((block) => block?.type === type)) return { blocks: list, added: false };
  return { blocks: [...list, normalizeBlock({ type }, makeId)], added: true };
}
