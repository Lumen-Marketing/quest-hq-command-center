// Reading and writing real .xlsx files, formatting and all.
//
// "When I upload the spreadsheet file I want it to inherit the formula, colour, the cell line,
// text colour, cell colour... I can also export it as an Excel file, or import a spreadsheet
// file format."
//
// An .xlsx is a zip of XML, and JSZip is already fetched on demand elsewhere in the app, so this
// costs a parser rather than a library. SheetJS would do it in one call and cost several hundred
// kilobytes for a field most sessions never open.
//
// Fetched on demand from the sheet editor. Nothing here touches the DOM beyond DOMParser.

import { SHEET_FUNCTIONS, cellRef, columnName, parseRef } from './sheet-model.js';
import {
  DEFAULT_FONT, DEFAULT_SIZE, FONTS, NUMBER_FORMATS, normalizeSheetFull, parseRange, rangeLabel,
} from './sheet-format.js';

const MAIN_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const MAX_EXPANDED_BYTES = 40 * 1024 * 1024;

// Excel measures columns in characters of the default font and rows in points. The grid is drawn
// in pixels, so both are converted on the way in and back again on the way out.
const widthToPx = (chars) => Math.round(Number(chars) * 7 + 5);
const pxToWidth = (px) => Math.max(1, (Number(px) - 5) / 7);
const pointsToPx = (points) => Math.round(Number(points) * (4 / 3));
const pxToPoints = (px) => Number(px) * 0.75;

// `<color theme="N"/>` is more common in real files than a plain rgb, and a reader that ignores
// it imports a coloured workbook as black on white. These are the default Office theme's, in the
// order the file numbers them (lt1 and dk1 swapped, which is the part that trips people up).
const THEME_COLORS = ['#ffffff', '#000000', '#e7e6e6', '#44546a', '#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47'];

const BUILTIN_FORMATS = {
  0: 'general', 1: '0', 2: '0.00', 3: '#,##0', 4: '#,##0.00',
  9: '0%', 10: '0.00%', 37: '#,##0', 38: '#,##0', 39: '#,##0.00', 40: '#,##0.00',
  44: '$#,##0.00', 42: '$#,##0.00', 43: '#,##0.00', 41: '#,##0',
};

const xmlEscape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  // Control characters are not legal in XML at all, and one in a cell makes Excel call the whole
  // workbook corrupt rather than skipping that cell.
  .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('that file could not be read');
  return doc;
}

const tags = (node, name) => Array.from(node?.getElementsByTagNameNS(MAIN_NS, name) || []);
const firstTag = (node, name) => tags(node, name)[0] || null;

/** "FFE0552D" or "E0552D" -> "#e0552d". The leading pair is alpha and is dropped. */
function argb(value) {
  const text = String(value || '').trim();
  if (/^[0-9a-f]{8}$/i.test(text)) return `#${text.slice(2).toLowerCase()}`;
  if (/^[0-9a-f]{6}$/i.test(text)) return `#${text.toLowerCase()}`;
  return '';
}

function colorOf(node) {
  if (!node) return '';
  const direct = argb(node.getAttribute('rgb'));
  if (direct) return direct;
  const theme = Number(node.getAttribute('theme'));
  if (Number.isInteger(theme) && THEME_COLORS[theme]) return THEME_COLORS[theme];
  return '';
}

// ---- reading ---------------------------------------------------------------------------------

/** The style table: cellXfs resolved into the flat shape a cell carries. */
function readStyles(doc) {
  if (!doc) return [];
  const custom = {};
  tags(doc, 'numFmt').forEach((node) => {
    custom[node.getAttribute('numFmtId')] = String(node.getAttribute('formatCode') || '');
  });

  const fontsNode = firstTag(doc, 'fonts');
  const fonts = tags(fontsNode, 'font').map((node) => {
    const name = firstTag(node, 'name')?.getAttribute('val') || '';
    const size = Number(firstTag(node, 'sz')?.getAttribute('val'));
    return {
      b: !!firstTag(node, 'b'),
      i: !!firstTag(node, 'i'),
      u: !!firstTag(node, 'u'),
      // Only fonts the picker offers, so a sheet cannot come back naming something the dropdown
      // has no way to show or set again.
      ff: FONTS.find((known) => known.toLowerCase() === name.toLowerCase()) || '',
      fs: Number.isFinite(size) ? Math.round(size) : 0,
      fg: colorOf(firstTag(node, 'color')),
    };
  });

  const fillsNode = firstTag(doc, 'fills');
  const fills = tags(fillsNode, 'fill').map((node) => {
    const pattern = firstTag(node, 'patternFill');
    if (!pattern || pattern.getAttribute('patternType') === 'none') return '';
    return colorOf(firstTag(pattern, 'fgColor'));
  });

  const bordersNode = firstTag(doc, 'borders');
  const borders = tags(bordersNode, 'border').map((node) => {
    const edges = [['top', 't'], ['right', 'r'], ['bottom', 'b'], ['left', 'l']];
    let bd = '';
    let bc = '';
    edges.forEach(([name, letter]) => {
      const edge = firstTag(node, name);
      if (!edge || !edge.getAttribute('style')) return;
      bd += letter;
      bc = bc || colorOf(firstTag(edge, 'color'));
    });
    return { bd: bd.split('').sort().join(''), bc };
  });

  const xfsNode = tags(doc, 'cellXfs')[0];
  return tags(xfsNode, 'xf').map((node) => {
    const style = {};
    const font = fonts[Number(node.getAttribute('fontId')) || 0];
    if (font) {
      if (font.b) style.b = 1;
      if (font.i) style.i = 1;
      if (font.u) style.u = 1;
      // The default font and size are not worth storing: every cell in a plain workbook names
      // them, and a sheet that round-trips should come back the size it went in.
      if (font.ff && font.ff !== DEFAULT_FONT) style.ff = font.ff;
      if (font.fs && font.fs !== DEFAULT_SIZE) style.fs = font.fs;
      // Black is the default, and storing it on every cell doubles the size of the field for
      // nothing.
      if (font.fg && font.fg !== '#000000') style.fg = font.fg;
    }
    const fill = fills[Number(node.getAttribute('fillId')) || 0];
    if (fill && fill !== '#ffffff') style.bg = fill;
    const border = borders[Number(node.getAttribute('borderId')) || 0];
    if (border?.bd) {
      style.bd = border.bd;
      if (border.bc && border.bc !== '#000000') style.bc = border.bc;
    }
    const alignment = firstTag(node, 'alignment');
    if (alignment) {
      const horizontal = alignment.getAttribute('horizontal');
      const vertical = alignment.getAttribute('vertical');
      if (['left', 'center', 'right'].includes(horizontal)) style.ha = horizontal;
      if (vertical === 'center') style.va = 'middle';
      else if (['top', 'bottom'].includes(vertical)) style.va = vertical;
      if (alignment.getAttribute('wrapText') === '1') style.wrap = 1;
    }
    const numFmtId = node.getAttribute('numFmtId');
    const code = custom[numFmtId] || BUILTIN_FORMATS[Number(numFmtId)] || '';
    const known = NUMBER_FORMATS.find((format) => format.code === code);
    if (known && known.code !== 'general') style.nf = known.code;
    return style;
  });
}

const FUNCTION_NAMES = new Set(SHEET_FUNCTIONS);

/**
 * A formula this sheet can actually work out, or nothing.
 *
 * A workbook using VLOOKUP imports as a grid of errors if the formula is taken at face value.
 * Where a function is one this engine does not have, the value Excel last calculated is imported
 * instead -- the number on screen stays the number that was on screen.
 */
function usableFormula(text) {
  const source = String(text || '');
  if (!source) return '';
  const names = source.match(/([A-Z][A-Z0-9.]*)\s*\(/gi) || [];
  const unknown = names.some((name) => !FUNCTION_NAMES.has(name.replace(/\s*\($/, '').toUpperCase()));
  if (unknown) return '';
  // Cross-sheet and absolute references are dropped for the same reason: there is one sheet
  // here, and $A$1 is not a reference this engine parses.
  if (/[!$]/.test(source)) return '';
  return `=${source}`;
}

/**
 * Read the first worksheet of an .xlsx into the shape the field stores.
 *
 * @param {File|Blob|ArrayBuffer} file
 * @returns {Promise<object>} a normalized sheet
 */
export async function readXlsxSheet(file, existing = {}) {
  const { default: JSZip } = await import('jszip');
  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error('That file is not a readable .xlsx. If it is password protected, remove the password and try again.');
  }
  const declared = Object.values(zip.files)
    .reduce((total, entry) => total + Number(entry?._data?.uncompressedSize || 0), 0);
  if (declared > MAX_EXPANDED_BYTES) throw new Error('That workbook expands to more than 40 MB.');

  const readFile = async (path) => {
    const entry = zip.file(path.replace(/^\//, ''));
    return entry ? entry.async('string') : '';
  };

  // The first sheet, found through the workbook's own relationships rather than assumed to be
  // sheet1.xml -- a workbook whose first sheet was renamed or reordered is not unusual.
  let sheetPath = 'xl/worksheets/sheet1.xml';
  const workbookXml = await readFile('xl/workbook.xml');
  const relsXml = await readFile('xl/_rels/workbook.xml.rels');
  if (workbookXml && relsXml) {
    try {
      const first = parseXml(workbookXml).getElementsByTagName('sheet')[0];
      const id = first?.getAttribute('r:id') || first?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      const target = Array.from(parseXml(relsXml).getElementsByTagName('Relationship'))
        .find((node) => node.getAttribute('Id') === id)?.getAttribute('Target');
      if (target) sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
    } catch { /* the default path is a fine guess */ }
  }

  const sheetXml = await readFile(sheetPath);
  if (!sheetXml) throw new Error('That workbook has no readable sheet.');
  const doc = parseXml(sheetXml);

  const sharedXml = await readFile('xl/sharedStrings.xml');
  const shared = sharedXml
    ? tags(parseXml(sharedXml), 'si').map((node) => tags(node, 't').map((t) => t.textContent || '').join(''))
    : [];
  const stylesXml = await readFile('xl/styles.xml');
  const xfs = stylesXml ? readStyles(parseXml(stylesXml)) : [];

  const cells = {};
  const styles = {};
  const rowH = {};
  let maxRow = 0;
  let maxCol = 0;

  tags(doc, 'row').forEach((rowNode) => {
    const rowIndex = Number(rowNode.getAttribute('r')) - 1;
    if (!Number.isInteger(rowIndex) || rowIndex < 0) return;
    if (rowNode.getAttribute('customHeight') === '1') {
      const px = pointsToPx(rowNode.getAttribute('ht'));
      if (px) rowH[rowIndex] = px;
    }
    tags(rowNode, 'c').forEach((cellNode) => {
      const ref = String(cellNode.getAttribute('r') || '').toUpperCase();
      const at = parseRef(ref);
      if (!at) return;

      const type = cellNode.getAttribute('t');
      const formula = usableFormula(firstTag(cellNode, 'f')?.textContent);
      let text = '';
      if (formula) {
        text = formula;
      } else if (type === 's') {
        text = shared[Number(firstTag(cellNode, 'v')?.textContent)] ?? '';
      } else if (type === 'inlineStr') {
        text = tags(firstTag(cellNode, 'is'), 't').map((t) => t.textContent || '').join('');
      } else if (type === 'b') {
        text = firstTag(cellNode, 'v')?.textContent === '1' ? 'TRUE' : 'FALSE';
      } else {
        text = firstTag(cellNode, 'v')?.textContent || '';
      }

      const style = xfs[Number(cellNode.getAttribute('s'))] || null;
      if (text !== '') {
        cells[cellRef(at.row, at.col)] = text;
        maxRow = Math.max(maxRow, at.row);
        maxCol = Math.max(maxCol, at.col);
      }
      if (style && Object.keys(style).length) {
        styles[cellRef(at.row, at.col)] = style;
        // A cell that is only a colour still counts towards the size, or importing a shaded
        // header band crops it away.
        maxRow = Math.max(maxRow, at.row);
        maxCol = Math.max(maxCol, at.col);
      }
    });
  });

  const colW = {};
  tags(doc, 'col').forEach((node) => {
    if (node.getAttribute('customWidth') !== '1') return;
    const from = Number(node.getAttribute('min')) - 1;
    const to = Number(node.getAttribute('max')) - 1;
    const px = widthToPx(node.getAttribute('width'));
    if (!Number.isFinite(px)) return;
    for (let col = from; col <= to && col < from + 64; col += 1) if (col >= 0) colW[col] = px;
  });

  const merges = tags(doc, 'mergeCell')
    .map((node) => rangeLabel(parseRange(node.getAttribute('ref') || '')))
    .filter(Boolean);

  return normalizeSheetFull({
    // Never smaller than what was there, so an import into a laid-out sheet does not crop it.
    rows: Math.max(maxRow + 1, Number(existing.rows) || 0, 12),
    cols: Math.max(maxCol + 1, Number(existing.cols) || 0, 6),
    cells,
    styles,
    merges,
    colW,
    rowH,
    headerRow: !!existing.headerRow,
    title: existing.title || '',
  });
}

// ---- writing ---------------------------------------------------------------------------------

/**
 * The style tables, built from the styles actually used.
 *
 * Excel's format is indirect on purpose: cells point at an xf, which points at a font, a fill and
 * a border. Collecting the distinct ones first means a sheet where every cell is bold writes one
 * font rather than 8,000.
 */
function buildStyleTables(sheet) {
  // Index 0 of each table has to be the default, and fills additionally reserve index 1 for
  // gray125 -- Excel refuses to open a workbook that does not.
  const fonts = [{ b: 0, i: 0, u: 0, ff: DEFAULT_FONT, fs: DEFAULT_SIZE, fg: '' }];
  const fills = ['', 'gray125'];
  const borders = [{ bd: '', bc: '' }];
  const numFmts = [];
  const xfs = [{ font: 0, fill: 0, border: 0, numFmt: 0, align: null }];
  const byRef = {};

  const indexOf = (list, value, same) => {
    const at = list.findIndex((entry) => same(entry, value));
    if (at !== -1) return at;
    list.push(value);
    return list.length - 1;
  };

  Object.entries(sheet.styles || {}).forEach(([ref, style]) => {
    const font = {
      b: style.b ? 1 : 0, i: style.i ? 1 : 0, u: style.u ? 1 : 0,
      ff: style.ff || DEFAULT_FONT, fs: style.fs || DEFAULT_SIZE, fg: style.fg || '',
    };
    const fontId = indexOf(fonts, font, (a, b) => a.b === b.b && a.i === b.i && a.u === b.u && a.ff === b.ff && a.fs === b.fs && a.fg === b.fg);
    const fillId = style.bg ? indexOf(fills, style.bg, (a, b) => a === b) : 0;
    const border = { bd: style.bd || '', bc: style.bc || '' };
    const borderId = border.bd ? indexOf(borders, border, (a, b) => a.bd === b.bd && a.bc === b.bc) : 0;

    const excel = NUMBER_FORMATS.find((format) => format.code === style.nf)?.excel || '';
    // Custom ids start at 164; anything below that is a built-in Excel already knows.
    const numFmtId = excel ? 164 + indexOf(numFmts, excel, (a, b) => a === b) : 0;

    const align = (style.ha || style.va || style.wrap)
      ? { ha: style.ha || '', va: style.va || '', wrap: style.wrap ? 1 : 0 }
      : null;
    const xf = { font: fontId, fill: fillId, border: borderId, numFmt: numFmtId, align };
    byRef[ref] = indexOf(xfs, xf, (a, b) => a.font === b.font && a.fill === b.fill && a.border === b.border
      && a.numFmt === b.numFmt && JSON.stringify(a.align) === JSON.stringify(b.align));
  });

  return { fonts, fills, borders, numFmts, xfs, byRef };
}

const rgb = (color) => `FF${String(color || '#000000').replace('#', '').toUpperCase()}`;

function stylesXml(tables) {
  const fonts = tables.fonts.map((font) => `<font>${font.b ? '<b/>' : ''}${font.i ? '<i/>' : ''}${font.u ? '<u/>' : ''}`
    + `<sz val="${font.fs}"/>${font.fg ? `<color rgb="${rgb(font.fg)}"/>` : '<color theme="1"/>'}`
    + `<name val="${xmlEscape(font.ff)}"/></font>`).join('');

  const fills = tables.fills.map((fill) => {
    if (!fill) return '<fill><patternFill patternType="none"/></fill>';
    if (fill === 'gray125') return '<fill><patternFill patternType="gray125"/></fill>';
    return `<fill><patternFill patternType="solid"><fgColor rgb="${rgb(fill)}"/><bgColor indexed="64"/></patternFill></fill>`;
  }).join('');

  const borders = tables.borders.map((border) => {
    const edge = (letter, name) => (border.bd.includes(letter)
      ? `<${name} style="thin"><color rgb="${rgb(border.bc || '#000000')}"/></${name}>`
      : `<${name}/>`);
    return `<border>${edge('l', 'left')}${edge('r', 'right')}${edge('t', 'top')}${edge('b', 'bottom')}<diagonal/></border>`;
  }).join('');

  const numFmts = tables.numFmts.length
    ? `<numFmts count="${tables.numFmts.length}">${tables.numFmts.map((code, at) => `<numFmt numFmtId="${164 + at}" formatCode="${xmlEscape(code)}"/>`).join('')}</numFmts>`
    : '';

  const xfs = tables.xfs.map((xf) => {
    const alignment = xf.align
      ? `<alignment${xf.align.ha ? ` horizontal="${xf.align.ha}"` : ''}`
        + `${xf.align.va ? ` vertical="${xf.align.va === 'middle' ? 'center' : xf.align.va}"` : ''}`
        + `${xf.align.wrap ? ' wrapText="1"' : ''}/>`
      : '';
    const applies = `${xf.font ? ' applyFont="1"' : ''}${xf.fill ? ' applyFill="1"' : ''}`
      + `${xf.border ? ' applyBorder="1"' : ''}${xf.numFmt ? ' applyNumberFormat="1"' : ''}`
      + `${alignment ? ' applyAlignment="1"' : ''}`;
    return `<xf numFmtId="${xf.numFmt}" fontId="${xf.font}" fillId="${xf.fill}" borderId="${xf.border}" xfId="0"${applies}>${alignment}</xf>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="${MAIN_NS}">${numFmts}<fonts count="${tables.fonts.length}">${fonts}</fonts>`
    + `<fills count="${tables.fills.length}">${fills}</fills><borders count="${tables.borders.length}">${borders}</borders>`
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + `<cellXfs count="${tables.xfs.length}">${xfs}</cellXfs>`
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
}

function sheetXml(sheet, tables, values) {
  const cols = Object.entries(sheet.colW || {})
    .map(([col, px]) => `<col min="${Number(col) + 1}" max="${Number(col) + 1}" width="${pxToWidth(px).toFixed(2)}" customWidth="1"/>`)
    .join('');

  const rows = [];
  for (let row = 0; row < sheet.rows; row += 1) {
    const parts = [];
    for (let col = 0; col < sheet.cols; col += 1) {
      const ref = cellRef(row, col);
      const raw = sheet.cells[ref];
      const styleId = tables.byRef[ref];
      if (raw === undefined && styleId === undefined) continue;
      const attrs = `r="${ref}"${styleId === undefined ? '' : ` s="${styleId}"`}`;
      if (raw === undefined) { parts.push(`<c ${attrs}/>`); continue; }

      if (String(raw).startsWith('=')) {
        // The formula AND what it currently works out to. Excel shows the cached value until it
        // recalculates, so a workbook without one opens blank.
        const computed = values?.[ref];
        const cached = typeof computed === 'number' && Number.isFinite(computed)
          ? `<v>${computed}</v>`
          : '';
        parts.push(`<c ${attrs}><f>${xmlEscape(String(raw).slice(1))}</f>${cached}</c>`);
        continue;
      }
      const asNumber = Number(raw);
      if (String(raw).trim() !== '' && Number.isFinite(asNumber) && /^-?[\d.]+$/.test(String(raw).trim())) {
        parts.push(`<c ${attrs}><v>${asNumber}</v></c>`);
      } else {
        // Inline rather than shared strings: one fewer part to keep in step, and Excel reads
        // both.
        parts.push(`<c ${attrs} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(raw)}</t></is></c>`);
      }
    }
    if (!parts.length && !sheet.rowH?.[row]) continue;
    const height = sheet.rowH?.[row] ? ` ht="${pxToPoints(sheet.rowH[row]).toFixed(2)}" customHeight="1"` : '';
    rows.push(`<row r="${row + 1}"${height}>${parts.join('')}</row>`);
  }

  const merges = (sheet.merges || []).length
    ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>`
    : '';
  const last = `${columnName(Math.max(0, sheet.cols - 1))}${sheet.rows}`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="${MAIN_NS}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0"/></sheetViews>`
    + '<sheetFormatPr defaultRowHeight="15"/>'
    + `${cols ? `<cols>${cols}</cols>` : ''}<sheetData>${rows.join('')}</sheetData>${merges}</worksheet>`;
}

/**
 * The whole workbook as a Blob, ready to download.
 *
 * @param {object} sheet a normalized sheet
 * @param {object} values what each formula currently works out to, so Excel opens showing numbers
 * @param {string} name the sheet's tab name
 */
export async function writeXlsx(sheet, values, name = 'Sheet1') {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const tables = buildStyleTables(sheet);
  // Excel's own rules: 31 characters, and none of : \ / ? * [ ]
  const tab = xmlEscape(String(name || 'Sheet1').replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31) || 'Sheet1');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="${MAIN_NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${tab}" sheetId="1" r:id="rId1"/></sheets></workbook>`);

  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  zip.file('xl/styles.xml', stylesXml(tables));
  zip.file('xl/worksheets/sheet1.xml', sheetXml(sheet, tables, values));

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
  });
}

export { buildStyleTables, stylesXml, sheetXml, usableFormula, argb, widthToPx, pxToWidth, pointsToPx, pxToPoints };
