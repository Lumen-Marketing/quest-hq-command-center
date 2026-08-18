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
  { type: 'quick', label: 'Quick Create', icon: 'ti-bolt', desc: 'Make a spreadsheet, form, file or proposal on this record', size: 2, config: false },
];

/**
 * What Quick Create can make.
 *
 * The first four are FIELD TYPES. The App Builder stores a record's values keyed by field id and
 * has no per-record attachment slot, so "attached to this record" can only mean: the app gains a
 * field of that type, and this record's value of it is opened. The field is made once and reused
 * -- pressing Spreadsheet on a second record opens the same column, not a second one -- which is
 * why `name` is a plain noun rather than something per-record.
 *
 * The consequence is worth stating rather than discovering: the column exists on every record in
 * the app from then on, blank until used. That is the same thing a Button push already does to
 * the app it pushes into.
 *
 * `proposal` is not a field at all. It is a row in public.proposal_documents, which already has
 * the generic `related_type` / `related_id` pair, so it can point at a record here with nothing
 * added to the schema. Task and Estimate are deliberately absent: public.tasks and public.deals
 * link only to a contact, deal, job or project, so attaching one needs a migration of its own.
 */
export const QUICK_CREATE = [
  { key: 'sheet', field: 'sheet', name: 'Spreadsheet', label: 'Spreadsheet', desc: 'A grid with formulas', icon: 'ti-table', tone: '#0f766e' },
  { key: 'form', field: 'form', name: 'Form', label: 'Form', desc: 'A document you fill in and print', icon: 'ti-file-text', tone: '#4f46e5' },
  { key: 'image', field: 'image', name: 'Image', label: 'Image', desc: 'A picture on this record', icon: 'ti-photo', tone: '#0891b2' },
  { key: 'file', field: 'file', name: 'File', label: 'File', desc: 'Attach a document', icon: 'ti-paperclip', tone: '#6b7280' },
  { key: 'proposal', module: 'proposal', label: 'Proposal', desc: 'A proposal linked to this record', icon: 'ti-file-description', tone: '#7c3aed' },
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
