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
];

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
  return [...blocks, normalizeBlock({ type, size: meta.size, config }, makeId)];
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
