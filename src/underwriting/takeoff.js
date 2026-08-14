// The GAF-report takeoff: measurements in, a priced job out.
//
// Transcribed from Underwriting_Calculator.xlsx. The spreadsheet addressed its own cells --
// ROUNDUP(I5/10,0) means "the total squares plus waste, divided by ten, rounded up" -- which
// is unreadable once the grid is gone. Here a formula names what it refers to instead:
//
//   ROUNDUP({Total SQ + waste} / 10)
//
// These are defaults, not rules. Every price, every quantity and every formula on this page is
// editable, and a company that prices differently edits them once and keeps its own version.

export const TAKEOFF_MEASUREMENTS = [
  { key: 'total_sq', label: 'Total SQ', unit: 'SQ' },
  { key: 'rakes', label: 'Rakes', unit: 'FT' },
  { key: 'valleys', label: 'Valleys', unit: 'FT' },
  { key: 'drip_edge', label: 'Drip edge', unit: 'FT' },
  { key: 'eaves', label: 'Eaves', unit: 'FT' },
  { key: 'ridges', label: 'Ridges', unit: 'FT' },
  { key: 'low_slope', label: 'Low slope', unit: 'SQ FT' },
  { key: 'leak_barrier', label: 'Leak barrier', unit: 'FT' },
];

export const TAKEOFF_GROUPS = [
  { key: 'labor', label: 'Labor', total: 'Labor total' },
  { key: 'material', label: 'Material', total: 'Material total' },
  { key: 'client', label: 'Price to client', total: 'Total for client' },
];

// Sheet rows 4-8, 12-30 and 36-38. A blank formula means the quantity is typed in by hand --
// pipejacks and dump runs are counted off the report, not derived from it.
const DEFAULT_LINES = [
  ['labor', 'Tile install labor per square', '{Total SQ}', 0, 120],
  ['labor', 'Metal', '', 0, 250],
  ['labor', 'Plywood labor per sheet', '', 0, 4],
  ['labor', 'Solar panels un-install & re-install', '', 0, 150],
  ['labor', 'Dump & gas', '', 1, 800],
  ['material', 'Eagle tile', 'ROUNDUP({Total SQ + waste} / 10)', 0, 120],
  ['material', 'Tile trim', 'ROUNDUP({Rakes + waste} / 5)', 0, 5],
  ['material', 'Ply40 Westlake Royal underlayment', '{Total SQ}', 0, 55],
  ['material', 'Furring strips', '{Total SQ} + 1', 0, 14],
  ['material', 'Valley metals', 'ROUNDUP({Valleys + waste} / 10)', 0, 44],
  ['material', 'Drip edge 2x2 10ft', 'ROUNDUP({Drip edge + waste} / 10)', 0, 8],
  ['material', 'Birdstop / eave riser', 'ROUND({Eaves + waste} / 8)', 0, 10],
  ['material', 'Pipejacks', '', 10, 15],
  ['material', 'Other flashings', '', 0, 15],
  ['material', 'Plastic cap nails', 'ROUNDUP({Total SQ} / 15)', 0, 25],
  ['material', 'Nails', 'ROUNDUP({Total SQ} / 22)', 0, 55],
  ['material', 'Hip & ridge blocker', '', 1, 100],
  ['material', 'Plastic cement 4.75gal', '', 1, 75],
  ['material', 'Base sheet 2sq', 'ROUNDUP({Low slope + waste} / 200)', 0, 130],
  ['material', 'Cap sheet 1sq', '{Base sheet 2sq} * 2', 0, 130],
  ['material', 'Ice and water barrier', 'ROUNDUP({Leak barrier + waste} / 200)', 0, 120],
  ['material', 'Tile seal', '', 0, 125],
  ['material', 'Misc', '', 0, 500],
  ['client', 'Whole roof shingle replacement (underlayment, drip edge)', '{Total SQ}', 0, 450],
  ['client', 'Whole roof plywood replacement', '', 0, 60],
  ['client', 'Solar panels un-install & re-install', '', 0, 200],
];

export const DEFAULT_WASTE_PERCENT = 10;
export const DEFAULT_TAX_PERCENT = 8.5;

export function defaultTakeoffConfig() {
  return {
    waste_percent: DEFAULT_WASTE_PERCENT,
    tax_percent: DEFAULT_TAX_PERCENT,
    lines: DEFAULT_LINES.map(([group, name, formula, qty, price], index) => ({
      id: `ln-${index + 1}`, group, name, formula, qty, price,
    })),
  };
}

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const money = (value) => Math.round((num(value) + Number.EPSILON) * 100) / 100;
const slug = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export function normalizeTakeoffConfig(input) {
  const fallback = defaultTakeoffConfig();
  const lines = Array.isArray(input?.lines) && input.lines.length ? input.lines : fallback.lines;
  const groups = new Set(TAKEOFF_GROUPS.map((group) => group.key));
  return {
    waste_percent: input?.waste_percent === undefined ? fallback.waste_percent : num(input.waste_percent),
    tax_percent: input?.tax_percent === undefined ? fallback.tax_percent : num(input.tax_percent),
    lines: lines.map((line, index) => ({
      id: String(line?.id || `ln-${index + 1}`),
      group: groups.has(line?.group) ? line.group : 'material',
      name: String(line?.name ?? '').trim(),
      formula: String(line?.formula ?? '').trim(),
      qty: num(line?.qty),
      price: num(line?.price),
    })),
  };
}

export function normalizeMeasurements(input) {
  const values = {};
  TAKEOFF_MEASUREMENTS.forEach(({ key }) => { values[key] = Math.max(0, num(input?.[key])); });
  return values;
}

// ---- the formula language ----------------------------------------------------------------
// Deliberately small: arithmetic, brackets, a handful of rounding functions, and {references}.
// No cell addresses, no lookups, and nothing that can reach outside this evaluation -- an
// edited formula is data typed into a text box, so it is parsed, never executed.

const FUNCTIONS = {
  ROUNDUP: (x, digits = 0) => roundTo(Math.ceil, x, digits),
  ROUNDDOWN: (x, digits = 0) => roundTo(Math.floor, x, digits),
  ROUND: (x, digits = 0) => roundTo(Math.round, x, digits),
  CEILING: (x, digits = 0) => roundTo(Math.ceil, x, digits),
  FLOOR: (x, digits = 0) => roundTo(Math.floor, x, digits),
  ABS: (x) => Math.abs(x),
  MIN: (...args) => (args.length ? Math.min(...args) : 0),
  MAX: (...args) => (args.length ? Math.max(...args) : 0),
};

export const TAKEOFF_FUNCTIONS = Object.keys(FUNCTIONS);

function roundTo(fn, value, digits) {
  const scale = 10 ** Math.trunc(num(digits));
  // Nudge off the floating-point edge first: 206.8/200 is 1.0340000000000003 either way, but
  // 528/8 is 65.99999999999999 in binary, and ROUND would answer 66 while ROUNDUP answered 67.
  const scaled = Number((num(value) * scale).toPrecision(12));
  return fn(scaled) / scale;
}

function tokenize(source) {
  const tokens = [];
  const text = String(source ?? '');
  let at = 0;
  while (at < text.length) {
    const char = text[at];
    if (/\s/.test(char)) { at += 1; continue; }
    if (char === '{') {
      const end = text.indexOf('}', at);
      if (end === -1) throw new Error('A { is missing its closing }');
      tokens.push({ type: 'ref', value: text.slice(at + 1, end) });
      at = end + 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      const match = /^\d*\.?\d+/.exec(text.slice(at));
      if (!match) throw new Error(`"${text.slice(at, at + 6)}" is not a number`);
      tokens.push({ type: 'number', value: Number(match[0]) });
      at += match[0].length;
      continue;
    }
    if (/[A-Za-z]/.test(char)) {
      const match = /^[A-Za-z]+/.exec(text.slice(at));
      tokens.push({ type: 'name', value: match[0].toUpperCase() });
      at += match[0].length;
      continue;
    }
    if ('+-*/(),'.includes(char)) { tokens.push({ type: char }); at += 1; continue; }
    throw new Error(`"${char}" cannot be used in a formula`);
  }
  return tokens;
}

function parse(tokens, resolve) {
  let at = 0;
  const peek = () => tokens[at];
  const take = (type) => {
    if (!tokens[at] || tokens[at].type !== type) throw new Error(type === ')' ? 'A bracket is never closed' : 'A bracket is missing');
    return tokens[at++];
  };

  function expression() {
    let value = term();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = tokens[at++].type;
      const right = term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }

  function term() {
    let value = unary();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = tokens[at++].type;
      const right = unary();
      if (op === '/' && right === 0) throw new Error('Division by zero');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }

  function unary() {
    if (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = tokens[at++].type;
      const value = unary();
      return op === '-' ? -value : value;
    }
    return primary();
  }

  function primary() {
    const token = peek();
    if (!token) throw new Error('The formula ends too early');
    if (token.type === ')' || token.type === ',') throw new Error('A value is missing');
    if (token.type === 'number') { at += 1; return token.value; }
    if (token.type === 'ref') { at += 1; return resolve(token.value); }
    if (token.type === '(') { at += 1; const value = expression(); take(')'); return value; }
    if (token.type === 'name') {
      at += 1;
      const fn = FUNCTIONS[token.value];
      if (!fn) throw new Error(`${token.value} is not a function you can use here`);
      take('(');
      const args = [];
      if (peek() && peek().type !== ')') {
        args.push(expression());
        while (peek() && peek().type === ',') { at += 1; args.push(expression()); }
      }
      take(')');
      return fn(...args);
    }
    throw new Error('The formula has a stray symbol');
  }

  const result = expression();
  if (at < tokens.length) throw new Error('The formula has something extra on the end');
  return result;
}

export function evaluateFormula(source, resolve) {
  if (!String(source ?? '').trim()) return { value: 0, error: '' };
  try {
    const value = parse(tokenize(source), resolve);
    if (!Number.isFinite(value)) throw new Error('That works out to a number we cannot use');
    return { value, error: '' };
  } catch (error) {
    return { value: 0, error: error.message };
  }
}

// ---- the calculation ----------------------------------------------------------------------

/**
 * A quantity typed over the top of one a formula worked out.
 *
 * "Although some of it is auto calculated, still make it editable for further customizing."
 * The formula is the default, not the law: the estimator who can see the roof gets the last
 * word. An override belongs to the job rather than to the company's calculator, so it is
 * stored with the measurements and cleared by emptying the box.
 */
export function overrideOf(overrides, lineId) {
  const raw = overrides?.[lineId];
  if (raw === undefined || raw === null || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function calculateTakeoff(config, measurementInput, overrides = {}) {
  const { waste_percent: wastePercent, tax_percent: taxPercent, lines } = normalizeTakeoffConfig(config);
  const raw = normalizeMeasurements(measurementInput);
  const wasteRate = 1 + (wastePercent / 100);

  const measurements = TAKEOFF_MEASUREMENTS.map((item) => ({
    ...item,
    value: raw[item.key],
    withWaste: money(raw[item.key] * wasteRate),
  }));

  // Two lookups share one namespace: a measurement by name, and any line by name -- which
  // reads as its quantity, so "cap sheet" can be twice the base sheet without restating how
  // the base sheet was worked out. Measurements win a tie, and are listed first in the help.
  const byName = new Map();
  measurements.forEach((item) => {
    byName.set(slug(item.label), () => item.value);
    byName.set(`${slug(item.label)} + waste`, () => item.withWaste);
  });

  const quantities = new Map();
  const errors = new Map();
  const resolving = new Set();

  const lineByName = new Map();
  lines.forEach((line) => {
    const key = slug(line.name);
    if (key && !lineByName.has(key)) lineByName.set(key, line);
  });

  function quantityOf(line) {
    if (quantities.has(line.id)) return quantities.get(line.id);
    // A typed quantity wins over the formula, and is still what other lines referring to this
    // one read -- override the base sheet and the cap sheet follows, as it would on paper.
    const typed = overrideOf(overrides, line.id);
    if (typed !== null) {
      quantities.set(line.id, typed);
      return typed;
    }
    if (!line.formula) {
      quantities.set(line.id, line.qty);
      return line.qty;
    }
    if (resolving.has(line.id)) throw new Error(`"${line.name}" refers back to itself`);
    resolving.add(line.id);
    const { value, error } = evaluateFormula(line.formula, (ref) => {
      const wanted = slug(ref);
      const measurement = byName.get(wanted);
      if (measurement) return measurement();
      const target = lineByName.get(wanted.replace(/\s*\+\s*waste$/, ''));
      if (target && target.id !== line.id) return quantityOf(target);
      throw new Error(`Nothing here is called "${String(ref).trim()}"`);
    });
    resolving.delete(line.id);
    if (error) errors.set(line.id, error);
    quantities.set(line.id, value);
    return value;
  }

  const priced = lines.map((line) => {
    let qty = 0;
    try {
      qty = quantityOf(line);
    } catch (error) {
      errors.set(line.id, error.message);
    }
    return {
      ...line,
      quantity: qty,
      total: money(qty * line.price),
      overridden: overrideOf(overrides, line.id) !== null,
      error: errors.get(line.id) || '',
    };
  });

  const groupTotal = (key) => money(priced
    .filter((line) => line.group === key)
    .reduce((running, line) => running + line.total, 0));

  const laborTotal = groupTotal('labor');
  const materialTotal = groupTotal('material');
  const materialWithTax = money(materialTotal * (1 + (taxPercent / 100)));
  const costTotal = money(materialWithTax + laborTotal);
  const clientTotal = groupTotal('client');
  const profit = money(clientTotal - costTotal);

  return {
    wastePercent,
    taxPercent,
    measurements,
    lines: priced,
    laborTotal,
    materialTotal,
    materialWithTax,
    costTotal,
    clientTotal,
    profit,
    marginPercent: clientTotal > 0 ? Math.round((profit / clientTotal) * 10000) / 100 : 0,
    errors: [...errors.values()],
  };
}
