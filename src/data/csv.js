/**
 * Parse RFC-4180-style CSV while preserving empty cells and quoted newlines.
 * The parser deliberately returns raw cell strings; individual importers own
 * trimming and type coercion.
 */
export function parseCsvRows(input) {
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
    } else if (character === ',') {
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
  const rows = parseCsvRows(input)
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
