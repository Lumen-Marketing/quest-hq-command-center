// The App Builder's Reports tab: KPI tiles, a donut, a bar chart and a sparkline,
// drawn as hand-rolled SVG and CSS rather than pulled from a charting library.
//
// Extracted from main.js for two reasons.
//
// First, weight. Reports sit behind a tab that must be clicked, and the print view behind
// a button — neither is on the path to first paint, so none of this needs to be in the
// entry bundle. main.js imports it dynamically, which is what keeps it out.
//
// Second, testability. Chart geometry is arithmetic, and arithmetic buried in a 41,000
// line module can only be tested by matching source strings. Here it can be called.
//
// Pure and dependency-free: `memberById` is passed in so this file knows nothing about
// application state, and escaping is done locally so it knows nothing about main.js.

function h(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * A donut drawn with one stroked circle per segment, each dashed to its own share of the
 * circumference and offset past the segments before it.
 *
 * Zero-value segments are dropped: a zero-length dash still paints its round cap, so an
 * empty category would show as a stray tick on the ring.
 */
import { addRecordLabel } from './naming.js';

export function donutSVG(segs, size = 176) {
  const total = segs.reduce((sum, x) => sum + x.value, 0);
  // Separate from `total` on purpose. Sharing one `|| 1` between the divisor and the
  // printed figure -- as this did before it was extracted -- makes an empty chart claim a
  // total of 1. No segment is drawn either way, so the guard only has to avoid NaN.
  const divisor = total || 1;
  const r = size / 2 - 16; const cx = size / 2; const cy = size / 2; const C = 2 * Math.PI * r; let off = 0;
  const rings = segs.filter((s) => s.value > 0).map((s) => {
    const dash = s.value / divisor * C;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="20" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off += dash; return el;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3,#eef1f5)" stroke-width="20"/>${rings}<text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="27" font-weight="800" fill="var(--text,#1f2937)">${total}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="10.5" letter-spacing="1" fill="var(--text-muted,#6b7280)" font-weight="700">TOTAL</text></svg>`;
}

/** Horizontal bars scaled to the largest value, with a stub so a non-zero bar stays visible. */
export function barsHTML(bars, fmt) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return `<div class="wb-bars">${bars.map((b) => `<div class="wb-bar-row"><div class="wb-bar-label" title="${h(b.label)}">${h(b.label)}</div><div class="wb-bar-track"><div class="wb-bar-fill" style="width:${Math.max(b.value / max * 100, b.value > 0 ? 4 : 0)}%;background:${b.color}"></div></div><div class="wb-bar-val">${fmt ? fmt(b.value) : b.value.toLocaleString()}</div></div>`).join('')}</div>`;
}

/** The value to group an item by. A multi-select contributes its first choice only. */
export function groupKey(item, field) {
  let k = item.values[field.id];
  if (Array.isArray(k)) k = k[0];
  // Blank and unset are the same thing to a reader, and both need a real key to count under.
  return (k == null || k === '') ? '__none' : k;
}

/** The label and colour for one group, resolved from whatever kind of field it came from. */
export function keyMeta(field, key, memberById) {
  if (key === '__none') return { label: '(empty)', color: '#9ca3af' };
  if (field.type === 'user') {
    const m = memberById ? memberById(key) : null;
    return m ? { label: m.name, color: m.color } : { label: String(key), color: '#6b7280' };
  }
  if (field.type === 'status' || field.type === 'category') {
    const o = (field.config.options || []).find((x) => x.id === key);
    return o ? { label: o.label, color: o.color || '#6b7280' } : { label: String(key), color: '#6b7280' };
  }
  return { label: String(key), color: '#6b7280' };
}

/**
 * The whole Reports tab. `memberById(id)` resolves a user field's value to a person;
 * `canManage` decides whether the empty state offers a way out of itself.
 */
export function renderReports(app, { memberById, canManage } = {}) {
  if (!app.fields.length || !app.items.length) return `<div class="wb-empty"><i class="ti ti-chart-donut"></i><h3>Nothing to report yet</h3><p>Add fields and a few items to this app and charts will appear here automatically.</p>${canManage ? `<button class="btn btn-primary" data-tab="${app.fields.length ? 'items' : 'fields'}"><i class="ti ti-plus"></i>${app.fields.length ? h(addRecordLabel(app)) : 'Add fields'}</button>` : ''}</div>`;
  const moneyFields = app.fields.filter((f) => f.type === 'money');
  // Status first, then category, then user: the earlier the field type, the more likely it
  // describes progress, which is what someone opening Reports is usually after.
  const groupField = app.fields.find((f) => f.type === 'status') || app.fields.find((f) => f.type === 'category') || app.fields.find((f) => f.type === 'user');
  const kpis = [{ v: app.items.length, l: 'Total items', ic: 'ti-database', c: 'var(--primary,#e0552d)' }];
  moneyFields.slice(0, 2).forEach((mf) => { const sum = app.items.reduce((s, it) => s + Number(it.values[mf.id] || 0), 0); kpis.push({ v: (mf.config.currency || '$') + sum.toLocaleString(), l: `Σ ${mf.label}`, ic: 'ti-currency-dollar', c: '#16a34a' }); });
  if (groupField && groupField.type === 'status') {
    // First and last status are the two worth a tile: what is waiting, and what is done.
    const opts = groupField.config.options || []; const last = opts[opts.length - 1];
    if (last) { const n = app.items.filter((it) => it.values[groupField.id] === last.id).length; kpis.push({ v: n, l: last.label, ic: 'ti-flag', c: last.color }); }
    const first = opts[0]; if (first) { const n = app.items.filter((it) => it.values[groupField.id] === first.id).length; kpis.push({ v: n, l: first.label, ic: 'ti-sparkles', c: first.color }); }
  }
  const kpiHTML = `<div class="wb-kpi-grid">${kpis.slice(0, 5).map((k) => `<div class="wb-kpi"><div class="wb-ki" style="background:${k.c}"><i class="ti ${k.ic}"></i></div><div class="wb-kv">${h(String(k.v))}</div><div class="wb-kl">${h(k.l)}</div></div>`).join('')}</div>`;
  let donutCard = '';
  let barCard = '';
  if (groupField) {
    const counts = {}; app.items.forEach((it) => { const k = groupKey(it, groupField); counts[k] = (counts[k] || 0) + 1; });
    const segs = Object.keys(counts).map((k) => ({ ...keyMeta(groupField, k, memberById), value: counts[k] })).sort((x, y) => y.value - x.value);
    donutCard = `<div class="wb-chart-card"><h4><i class="ti ti-chart-donut"></i>${app.items.length} items by ${h(groupField.label)}</h4><div class="wb-donut-wrap">${donutSVG(segs)}<div class="wb-legend">${segs.map((s) => `<div class="wb-lg"><span class="wb-sw" style="background:${s.color}"></span>${h(s.label)}<span class="wb-lv">${s.value}</span></div>`).join('')}</div></div></div>`;
    // With a money field the bars total it; without one they fall back to counting.
    const mf = moneyFields[0]; const agg = {};
    app.items.forEach((it) => { const k = groupKey(it, groupField); agg[k] = (agg[k] || 0) + (mf ? Number(it.values[mf.id] || 0) : 1); });
    const bars = Object.keys(agg).map((k) => ({ ...keyMeta(groupField, k, memberById), value: agg[k] })).sort((x, y) => y.value - x.value);
    barCard = `<div class="wb-chart-card"><h4><i class="ti ti-chart-bar"></i>${mf ? `${h(mf.label)} by ${h(groupField.label)}` : `Count by ${h(groupField.label)}`}</h4>${barsHTML(bars, mf ? (v) => (mf.config.currency || '$') + v.toLocaleString() : null)}</div>`;
  }
  const byDate = {}; app.items.forEach((it) => { const d = it.createdAt || '—'; byDate[d] = (byDate[d] || 0) + 1; });
  const dates = Object.keys(byDate).sort().slice(-10); const dmax = Math.max(...dates.map((d) => byDate[d]), 1);
  const timeCard = `<div class="wb-chart-card"><h4><i class="ti ti-timeline"></i>Items added over time</h4><div class="wb-spark">${dates.map((d) => `<div class="wb-sb" style="height:${byDate[d] / dmax * 100}%" title="${h(d)}: ${byDate[d]}"></div>`).join('')}</div><div class="wb-spark-x">${dates.map((d) => `<span>${h(String(d).slice(5))}</span>`).join('')}</div></div>`;
  return kpiHTML + `<div class="wb-report-grid">${donutCard}${barCard}${timeCard}</div>`;
}
