// A spreadsheet inside a field.
//
// "A field where it opens a spreadsheet where you can use basic functions, add formulas, or
// upload a spreadsheet and adapt its data... you can also print it, and set up what the
// default data and formulas are."
//
// This is the engine: cells, references, and evaluation. No DOM, no state, no storage -- the
// grid draws what this returns, the field stores what this normalizes, and a test can check
// the arithmetic without a browser.
//
// The formula language is the takeoff calculator's, grown up: the same tokenizer and
// recursive-descent parser, plus A1 references, A1:B9 ranges, strings, comparisons and a set
// of functions. It is PARSED, never executed -- a sheet is data typed into a box by anyone who
// can edit the record, and eval() on that is a way to hand them the browser.

/** How big one sheet may get. A field is not a data warehouse. */
export const MAX_ROWS = 200;
export const MAX_COLS = 40;

/** "A" -> 0, "AB" -> 27. Column letters are base-26 with no zero. */
export function columnIndex(letters) {
  let index = 0;
  for (const character of String(letters).toUpperCase()) {
    const value = character.charCodeAt(0) - 64;
    if (value < 1 || value > 26) return -1;
    index = (index * 26) + value;
  }
  return index - 1;
}

/** 0 -> "A", 27 -> "AB". */
export function columnName(index) {
  let name = '';
  let at = index;
  while (at >= 0) {
    name = String.fromCharCode(65 + (at % 26)) + name;
    at = Math.floor(at / 26) - 1;
  }
  return name;
}

export const cellRef = (row, col) => `${columnName(col)}${row + 1}`;

/** "B12" -> { row: 11, col: 1 }, or null when it is not a reference at all. */
export function parseRef(ref) {
  const match = /^([A-Z]+)([0-9]+)$/.exec(String(ref || '').trim().toUpperCase());
  if (!match) return null;
  const col = columnIndex(match[1]);
  const row = Number(match[2]) - 1;
  if (col < 0 || row < 0) return null;
  return { row, col };
}

/**
 * A sheet, in the shape the field stores.
 *
 * `cells` is a sparse map of "A1" -> raw text, because a 200x40 grid is 8,000 cells and a
 * filled-in one is rarely more than a few dozen. Everything else about the sheet is a rule for
 * drawing it.
 */
export function normalizeSheet(input) {
  const rows = Math.max(1, Math.min(MAX_ROWS, Number(input?.rows) || 20));
  const cols = Math.max(1, Math.min(MAX_COLS, Number(input?.cols) || 8));
  const cells = {};
  Object.entries(input?.cells || {}).forEach(([ref, value]) => {
    const at = parseRef(ref);
    if (!at || at.row >= rows || at.col >= cols) return;
    const text = value === null || value === undefined ? '' : String(value);
    if (text !== '') cells[cellRef(at.row, at.col)] = text;
  });
  return {
    rows,
    cols,
    cells,
    // A first row that names the columns, which is what makes a sheet readable and a print
    // worth reading. Off by default: not every sheet has headings.
    headerRow: !!input?.headerRow,
    title: String(input?.title || '').slice(0, 120),
  };
}

const FUNCTIONS = {
  SUM: (values) => values.reduce((total, value) => total + num(value), 0),
  AVERAGE: (values) => (values.length ? values.reduce((total, value) => total + num(value), 0) / values.length : 0),
  COUNT: (values) => values.filter((value) => value !== '' && value !== null && Number.isFinite(Number(value))).length,
  COUNTA: (values) => values.filter((value) => value !== '' && value !== null && value !== undefined).length,
  MIN: (values) => (values.length ? Math.min(...values.map(num)) : 0),
  MAX: (values) => (values.length ? Math.max(...values.map(num)) : 0),
  ABS: (values) => Math.abs(num(values[0])),
  ROUND: (values) => roundTo(Math.round, values[0], values[1]),
  ROUNDUP: (values) => roundTo(Math.ceil, values[0], values[1]),
  ROUNDDOWN: (values) => roundTo(Math.floor, values[0], values[1]),
  INT: (values) => Math.trunc(num(values[0])),
  SQRT: (values) => Math.sqrt(num(values[0])),
  POWER: (values) => num(values[0]) ** num(values[1]),
  PRODUCT: (values) => values.reduce((total, value) => total * num(value), 1),
  IF: (values) => (truthy(values[0]) ? values[1] : values[2] ?? ''),
  AND: (values) => values.every(truthy),
  OR: (values) => values.some(truthy),
  NOT: (values) => !truthy(values[0]),
  CONCAT: (values) => values.map((value) => (value === null || value === undefined ? '' : String(value))).join(''),
  LEN: (values) => String(values[0] ?? '').length,
  UPPER: (values) => String(values[0] ?? '').toUpperCase(),
  LOWER: (values) => String(values[0] ?? '').toLowerCase(),
  TRIM: (values) => String(values[0] ?? '').trim(),
};

export const SHEET_FUNCTIONS = Object.keys(FUNCTIONS);

/** Functions that want the whole range, not one value per argument. */
const AGGREGATES = new Set(['SUM', 'AVERAGE', 'COUNT', 'COUNTA', 'MIN', 'MAX', 'PRODUCT', 'AND', 'OR', 'CONCAT']);

const num = (value) => {
  if (typeof value === 'boolean') return value ? 1 : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const truthy = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === '' || value === null || value === undefined) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed !== 0 : true;
};

function roundTo(fn, value, digits) {
  const scale = 10 ** Math.trunc(num(digits));
  // Nudge off the floating-point edge first, or ROUND(528/8) answers 67 for a number that is
  // exactly 66 -- the same trap the takeoff calculator hit.
  return fn(Number((num(value) * scale).toPrecision(12))) / scale;
}

function tokenize(source) {
  const tokens = [];
  const text = String(source);
  let at = 0;
  while (at < text.length) {
    const char = text[at];
    if (/\s/.test(char)) { at += 1; continue; }
    if (char === '"') {
      const end = text.indexOf('"', at + 1);
      if (end === -1) throw new Error('A quote is never closed');
      tokens.push({ type: 'text', value: text.slice(at + 1, end) });
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
    if (/[A-Za-z_]/.test(char)) {
      const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(at));
      tokens.push({ type: 'name', value: match[0].toUpperCase() });
      at += match[0].length;
      continue;
    }
    const two = text.slice(at, at + 2);
    if (['<=', '>=', '<>'].includes(two)) { tokens.push({ type: two }); at += 2; continue; }
    if ('+-*/(),:<>=&%'.includes(char)) { tokens.push({ type: char }); at += 1; continue; }
    throw new Error(`"${char}" cannot be used in a formula`);
  }
  return tokens;
}

function parse(tokens, resolve, resolveRange) {
  let at = 0;
  const peek = () => tokens[at];
  const eat = (type) => {
    if (!tokens[at] || tokens[at].type !== type) throw new Error(type === ')' ? 'A bracket is never closed' : `Expected ${type}`);
    return tokens[at++];
  };

  function comparison() {
    let value = expression();
    while (peek() && ['<', '>', '=', '<=', '>=', '<>'].includes(peek().type)) {
      const op = tokens[at++].type;
      const right = expression();
      const [a, b] = [value, right];
      const bothNumeric = Number.isFinite(Number(a)) && Number.isFinite(Number(b)) && a !== '' && b !== '';
      const [x, y] = bothNumeric ? [Number(a), Number(b)] : [String(a).toLowerCase(), String(b).toLowerCase()];
      value = { '<': x < y, '>': x > y, '=': x === y, '<=': x <= y, '>=': x >= y, '<>': x !== y }[op];
    }
    return value;
  }

  function expression() {
    let value = term();
    while (peek() && ['+', '-', '&'].includes(peek().type)) {
      const op = tokens[at++].type;
      const right = term();
      if (op === '&') value = `${value ?? ''}${right ?? ''}`;
      else value = op === '+' ? num(value) + num(right) : num(value) - num(right);
    }
    return value;
  }

  function term() {
    let value = unary();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = tokens[at++].type;
      const right = unary();
      if (op === '/' && num(right) === 0) throw new Error('Division by zero');
      value = op === '*' ? num(value) * num(right) : num(value) / num(right);
    }
    return value;
  }

  function unary() {
    if (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = tokens[at++].type;
      const value = unary();
      return op === '-' ? -num(value) : num(value);
    }
    let value = primary();
    // 15% is 0.15, which is how a rate gets typed into a sheet.
    while (peek() && peek().type === '%') { at += 1; value = num(value) / 100; }
    return value;
  }

  function primary() {
    const token = peek();
    if (!token) throw new Error('The formula ends too early');
    if (token.type === ')' || token.type === ',') throw new Error('A value is missing');
    if (token.type === 'number' || token.type === 'text') { at += 1; return token.value; }
    if (token.type === '(') { at += 1; const value = comparison(); eat(')'); return value; }
    if (token.type === 'name') {
      at += 1;
      // A name followed by "(" is a function; anything else is a cell reference.
      if (peek() && peek().type === '(') {
        const fn = FUNCTIONS[token.value];
        if (!fn) throw new Error(`${token.value} is not a function you can use here`);
        at += 1;
        const args = [];
        if (peek() && peek().type !== ')') {
          args.push(argument());
          while (peek() && peek().type === ',') { at += 1; args.push(argument()); }
        }
        eat(')');
        // An aggregate takes everything it was handed, flattened; the rest take one per slot.
        const flat = args.flat();
        return fn(AGGREGATES.has(token.value) ? flat : args.map((value) => (Array.isArray(value) ? value[0] : value)));
      }
      // A range, or a single cell.
      if (peek() && peek().type === ':') {
        at += 1;
        const end = eat('name');
        return resolveRange(token.value, end.value);
      }
      if (token.value === 'TRUE') return true;
      if (token.value === 'FALSE') return false;
      return resolve(token.value);
    }
    throw new Error('The formula has a stray symbol');
  }

  function argument() {
    const token = peek();
    // A bare range as an argument: SUM(A1:A9).
    if (token?.type === 'name' && tokens[at + 1]?.type === ':') {
      at += 2;
      const end = eat('name');
      return resolveRange(token.value, end.value);
    }
    return comparison();
  }

  const result = comparison();
  if (at < tokens.length) throw new Error('The formula has something extra on the end');
  return result;
}

/**
 * Work out every cell of a sheet.
 *
 * Returns { values, errors } where `values` maps "A1" to what the cell SHOWS. It is SPARSE: a
 * 200x40 grid is 8,000 cells and a filled-in one is a few dozen, so a cell nobody has touched
 * is absent rather than stored as empty. Absent means empty. A cell holding
 * text shows the text; one starting with "=" shows what its formula works out to, or an error
 * if it cannot. A reference to a cell that is itself a formula follows through, and a loop is
 * caught rather than left spinning.
 */
export function evaluateSheet(sheet) {
  const { cells } = normalizeSheet(sheet);
  const values = {};
  const errors = {};
  const resolving = new Set();

  function valueOf(ref) {
    const key = String(ref).toUpperCase();
    if (key in values) return values[key];
    // A name that is not a cell and not a function is a mistake, not an empty cell. Reading it
    // as blank is how "=constructor" or "=totl" quietly produces a number that looks fine.
    if (!parseRef(key)) throw new Error(`"${ref}" is not a cell or a function`);
    const raw = cells[key];
    if (raw === undefined || raw === '') { values[key] = ''; return ''; }
    if (!raw.startsWith('=')) {
      // A number typed into a cell is a number; anything else is text.
      const parsed = Number(raw);
      values[key] = raw.trim() !== '' && Number.isFinite(parsed) ? parsed : raw;
      return values[key];
    }
    if (resolving.has(key)) throw new Error(`${key} refers back to itself`);
    resolving.add(key);
    try {
      const result = parse(tokenize(raw.slice(1)), valueOf, rangeOf);
      values[key] = typeof result === 'number' && !Number.isFinite(result) ? 0 : result;
    } catch (error) {
      errors[key] = error.message;
      values[key] = '#ERROR';
    } finally {
      resolving.delete(key);
    }
    return values[key];
  }

  function rangeOf(from, to) {
    const start = parseRef(from);
    const end = parseRef(to);
    if (!start || !end) throw new Error(`${from}:${to} is not a range`);
    const out = [];
    for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row += 1) {
      for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col += 1) {
        out.push(valueOf(cellRef(row, col)));
      }
    }
    return out;
  }

  Object.keys(cells).forEach((ref) => {
    try {
      valueOf(ref);
    } catch (error) {
      errors[ref] = error.message;
      values[ref] = '#ERROR';
    }
  });

  return { values, errors };
}

/**
 * Rows of text from an uploaded file, laid into a sheet.
 *
 * The upload brings VALUES. A formula in the original file is not translated: the functions it
 * used may not exist here, and a formula that silently means something else is worse than a
 * number that is simply correct as of the import. Anything already in the sheet is replaced --
 * an import is an import, not a merge.
 */
export function sheetFromRows(rows, existing = {}) {
  const grid = (rows || []).slice(0, MAX_ROWS);
  const width = grid.reduce((widest, row) => Math.max(widest, (row || []).length), 0);
  const cells = {};
  grid.forEach((row, rowIndex) => {
    (row || []).slice(0, MAX_COLS).forEach((value, colIndex) => {
      const text = value === null || value === undefined ? '' : String(value).trim();
      if (text !== '') cells[cellRef(rowIndex, colIndex)] = text;
    });
  });
  return normalizeSheet({
    ...existing,
    rows: Math.max(grid.length || 1, 1),
    cols: Math.max(Math.min(width, MAX_COLS) || 1, 1),
    cells,
  });
}
