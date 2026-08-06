/**
 * Parse RFC-4180-style CSV while preserving empty cells and quoted newlines.
 * The parser deliberately returns raw cell strings; individual importers own
 * trimming and type coercion.
 */
/**
 * Work out what separates the cells.
 *
 * Excel writes a semicolon in any locale whose decimal mark is a comma, and "Save as
 * tab-delimited" is just as common. Both used to parse as ONE column per row, so the header
 * never matched and the import reported "no contacts found" on a perfectly good file.
 *
 * Only the first line is inspected, and only outside quotes, so a comma inside a quoted
 * address cannot outvote the real delimiter.
 */
export function detectDelimiter(input) {
  const source = String(input ?? '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { index += 1; continue; }
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (character === '\n') break;
    if (character in counts) counts[character] += 1;
  }
  const best = Object.keys(counts).reduce((a, b) => (counts[b] > counts[a] ? b : a), ',');
  return counts[best] > 0 ? best : ',';
}

export function parseCsvRows(input, delimiter) {
  const separator = delimiter || detectDelimiter(input);
  const source = String(input ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/^ï»¿/, '')
    .replace(/\r\n?/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field === '') {
      quoted = true;
    } else if (character === separator) {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseContactsCsv(input) {
  return contactRowsToRecords(parseCsvRows(input));
}

/**
 * Rows -> contact records, by reading the header row.
 *
 * Shared by the CSV and the .xlsx paths so a spreadsheet and its exported CSV import
 * identically -- two copies of this mapping would drift the first time a header was added.
 */
export function contactRowsToRecords(input) {
  const rows = (Array.isArray(input) ? input : [])
    .filter((row) => row.some((cell) => String(cell).trim() !== ''));
  if (rows.length < 2) return [];

  const headers = rows[0].map((value) => String(value).trim().toLowerCase());
  const findIndex = (names) => headers.findIndex((header) => names.some((name) => header.includes(name)));
  const nameIndex = findIndex(['name', 'contact', 'full']);
  const emailIndex = findIndex(['email', 'e-mail']);
  const phoneIndex = findIndex(['phone', 'mobile', 'cell', 'tel']);
  const titleIndex = findIndex(['title', 'job']);

  return rows.slice(1).flatMap((columns) => {
    const cell = (index, fallback = '') => (
      index >= 0 ? String(columns[index] ?? '').trim() : fallback
    );
    const name = cell(nameIndex, String(columns[0] ?? '').trim());
    if (!name) return [];
    return [{
      name,
      email: cell(emailIndex),
      phone: cell(phoneIndex),
      title: cell(titleIndex),
    }];
  });
}

/**
 * Turn rows into CSV text Excel will open without a fight.
 *
 * Quotes anything containing the delimiter, a quote or a newline, and doubles inner quotes.
 * A leading =, +, - or @ is prefixed with a tab: Excel treats those as formulas, so a contact
 * called "-Bob" or a phone written "+1..." would otherwise be evaluated rather than shown.
 * CRLF endings and a BOM are what Excel expects; without the BOM it mangles accented names.
 */
export function toCsv(rows, delimiter = ',') {
  const cell = (value) => {
    let text = value == null ? '' : String(value);
    if (/^[=+\-@]/.test(text)) text = `\t${text}`;
    return /["\n\r]|[,;\t]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return `\uFEFF${rows.map((row) => row.map(cell).join(delimiter)).join('\r\n')}\r\n`;
}
