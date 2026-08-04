// Pricing a change order: the arithmetic between "what will this cost us" and "what do we
// charge". Pure -- no DOM, no Supabase -- so every rule here is testable on its own.
//
// The shape follows the v1 design: labour and materials are priced separately because they
// are estimated differently (a crew costs days, a board costs each), then a single margin
// turns the total cost into the price the client sees.

export const LINE_KINDS = ['labor', 'material', 'hardware', 'equipment'];
export const LABOR_MODES = ['crew_days', 'sub_flat', 'flat_fee'];
export const ASK_METHODS = ['in_person', 'text', 'email', 'phone'];
export const SEND_METHODS = ['text', 'email', 'docusign'];
export const EXECUTE_WHEN = ['on_acceptance', 'after_payment'];
export const PRICING_METHODS = ['lines', 'flat'];

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function normalizeLine(row = {}) {
  return {
    id: row.id || '',
    changeOrderId: row.change_order_id || row.changeOrderId || '',
    kind: LINE_KINDS.includes(row.kind) ? row.kind : 'material',
    label: String(row.label || '').trim(),
    // Guys for labour, units for everything else. Never negative: a negative line reads as a
    // discount, and a discount belongs in the margin, not hidden inside a cost.
    qty: Math.max(0, num(row.qty, 1)),
    // Only labour varies this. A material line is one "day" of one unit price.
    days: Math.max(0, num(row.days, 1)),
    unitCost: Math.max(0, num(row.unit_cost ?? row.unitCost, 0)),
    materialId: row.material_id || row.materialId || '',
    sortOrder: num(row.sort_order ?? row.sortOrder, 0),
  };
}

// Accept either shape. The discriminator has to be a field only the NORMALISED form has:
// `kind` is present on the raw database row too, so keying on it read `unitCost` off a row
// that only carries `unit_cost` and silently returned NaN for the whole change order.
const asLine = (line) => (line && typeof line.unitCost === 'number' ? line : normalizeLine(line));

/** 2 guys x 1.5 days x $280 = $840. A material line has days = 1, so it is qty x unit. */
export function lineAmount(line) {
  const l = asLine(line);
  return l.qty * l.days * l.unitCost;
}

export function linesCost(lines = []) {
  return lines.reduce((total, line) => total + lineAmount(line), 0);
}

/** Lines grouped for display, in the order the wizard asks for them. */
export function groupLines(lines = []) {
  const norm = lines.map(asLine);
  return LINE_KINDS
    .map((kind) => ({
      kind,
      lines: norm.filter((l) => l.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .map((group) => ({ ...group, cost: linesCost(group.lines) }))
    .filter((group) => group.lines.length);
}

/**
 * Price from cost and margin.
 *
 * Margin is on the PRICE, not marked up on the cost -- $1,975 at 45% is $3,590, not $2,864.
 * That is the trade convention and it is what the v1 design shows; getting it the other way
 * round quietly underprices every change order by the difference.
 */
export function priceFromMargin(cost, marginPct) {
  const c = Math.max(0, num(cost, 0));
  const m = num(marginPct, 0);
  // 100% margin is a divide by zero, and above it is nonsense. Clamp rather than return
  // Infinity, which would render as "$Infinity" in the wizard.
  if (m >= 99.99) return c > 0 ? c * 10000 : 0;
  if (m <= 0) return c;
  return c / (1 - m / 100);
}

/** The inverse, for a price typed in directly. Zero price is 0% rather than a divide by zero. */
export function marginFromPrice(cost, price) {
  const c = Math.max(0, num(cost, 0));
  const p = num(price, 0);
  if (p <= 0) return 0;
  return ((p - c) / p) * 100;
}

/** Everything the wizard's summary line needs, computed once. */
export function pricingSummary(lines, marginPct, flatPrice, method = 'lines') {
  const cost = linesCost(lines);
  const price = method === 'flat' ? Math.max(0, num(flatPrice, 0)) : priceFromMargin(cost, marginPct);
  const margin = method === 'flat' ? marginFromPrice(cost, price) : num(marginPct, 0);
  return {
    cost,
    price,
    margin,
    profit: price - cost,
    // A price at or under cost is not automatically wrong -- goodwill work happens -- but it
    // should never be silent, so the wizard has something to warn on.
    underwater: price <= cost && (price > 0 || cost > 0),
  };
}

// ---- the five steps ---------------------------------------------------------------------
//
// Recorded rather than inferred. Most change-order money is lost between "the client asked"
// and "the crew built it", so each stage is a fact with a time on it.

export const CO_STEP_ORDER = ['requested', 'priced', 'sent', 'accepted', 'acknowledged'];

export function nextStep(step) {
  const at = CO_STEP_ORDER.indexOf(step);
  return at >= 0 && at < CO_STEP_ORDER.length - 1 ? CO_STEP_ORDER[at + 1] : '';
}

/**
 * Which step a change order should be at given what has actually been filled in.
 *
 * Priced means priced: a change order sitting at "requested" with a price on it is a step
 * behind where it really is, and the dashboard counts stalled ones by step.
 */
export function impliedStep(co, lines = []) {
  const priced = num(co?.price, 0) > 0 || lines.length > 0;
  if (co?.step && co.step !== 'requested') return co.step;
  return priced ? 'priced' : 'requested';
}

/** A change order with no price that has been sitting since before `cutoffIso`. */
export function unpricedSince(changeOrders = [], cutoffIso = '') {
  return changeOrders.filter((co) => num(co.price, 0) <= 0
    && String(co.created_at || '').slice(0, 10) <= cutoffIso);
}

const LABEL = {
  in_person: 'In person — job walk',
  text: 'Text message',
  email: 'Email',
  phone: 'Phone call',
  docusign: 'DocuSign',
  on_acceptance: 'On acceptance — just do it',
  after_payment: 'After payment',
  crew_days: 'Guys × days',
  sub_flat: 'Sub — flat cost',
  flat_fee: 'Flat fee',
  labor: 'Labor',
  material: 'Material',
  hardware: 'Hardware',
  equipment: 'Equipment',
  // The two pricing methods are chips like everything else, so they need prose too — without
  // these they rendered as bare lowercase keys.
  lines: 'Built from lines',
  flat: 'Flat price',
};

export const methodLabel = (key) => LABEL[key] || String(key || '');
