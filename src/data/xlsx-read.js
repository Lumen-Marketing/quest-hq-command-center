// Read the first sheet of an .xlsx into rows of strings.
//
// Fetched on demand, together with JSZip, because only an import touches it and a spreadsheet
// parser has no business in the entry bundle.
//
// An .xlsx is a zip of XML. Cell text lives in one of three places depending on how Excel
// chose to write it: an index into sharedStrings.xml (t="s"), an inline <is> run, or a plain
// <v>. All three are handled -- reading only one of them is how a file opens fine in Excel
// and imports as blank here.

const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function textOf(node) {
  // <t> runs, in order, so rich text keeps its words in the right sequence.
  return Array.from(node.getElementsByTagNameNS(NS, 't')).map((t) => t.textContent || '').join('');
}

/** "BC12" -> 54. Column letters are base-26 with no zero. */
function columnIndex(ref) {
  const letters = String(ref || '').match(/^[A-Z]+/)?.[0] || 'A';
  let index = 0;
  for (const character of letters) index = index * 26 + (character.charCodeAt(0) - 64);
  return index - 1;
}

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('That spreadsheet could not be read.');
  return doc;
}

/**
 * @param {File|Blob|ArrayBuffer} file
 * @returns {Promise<string[][]>} rows of trimmed cell strings, ragged rows padded out
 */
export async function readXlsxRows(file) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(file);

  const shared = [];
  const sharedFile = zip.file('xl/sharedStrings.xml');
  if (sharedFile) {
    const doc = parseXml(await sharedFile.async('string'));
    for (const si of Array.from(doc.getElementsByTagNameNS(NS, 'si'))) shared.push(textOf(si));
  }

  // Follow the workbook's own relationships rather than assuming sheet1.xml: a workbook whose
  // first sheet was renamed or reordered does not keep that name.
  let sheetPath = 'xl/worksheets/sheet1.xml';
  const workbookFile = zip.file('xl/workbook.xml');
  const relsFile = zip.file('xl/_rels/workbook.xml.rels');
  if (workbookFile && relsFile) {
    const workbook = parseXml(await workbookFile.async('string'));
    const rels = parseXml(await relsFile.async('string'));
    const firstSheet = workbook.getElementsByTagNameNS(NS, 'sheet')[0];
    const relId = firstSheet?.getAttributeNS(REL_NS, 'id') || firstSheet?.getAttribute('r:id');
    const target = Array.from(rels.getElementsByTagName('Relationship'))
      .find((rel) => rel.getAttribute('Id') === relId)?.getAttribute('Target');
    if (target) sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  }

  const sheetFile = zip.file(sheetPath) || zip.file('xl/worksheets/sheet1.xml');
  if (!sheetFile) throw new Error('That workbook has no readable sheet.');
  const sheet = parseXml(await sheetFile.async('string'));

  const rows = [];
  for (const row of Array.from(sheet.getElementsByTagNameNS(NS, 'row'))) {
    const cells = [];
    for (const cell of Array.from(row.getElementsByTagNameNS(NS, 'c'))) {
      const at = columnIndex(cell.getAttribute('r'));
      const type = cell.getAttribute('t');
      let value = '';
      if (type === 's') {
        const v = cell.getElementsByTagNameNS(NS, 'v')[0];
        value = shared[Number(v?.textContent || -1)] || '';
      } else if (type === 'inlineStr') {
        const is = cell.getElementsByTagNameNS(NS, 'is')[0];
        value = is ? textOf(is) : '';
      } else {
        const v = cell.getElementsByTagNameNS(NS, 'v')[0];
        value = v?.textContent || '';
      }
      while (cells.length < at) cells.push('');
      cells[at] = String(value).trim();
    }
    rows.push(cells);
  }
  // A trailing empty row is normal in hand-edited sheets and would look like a blank contact.
  while (rows.length && rows[rows.length - 1].every((cell) => !cell)) rows.pop();
  return rows;
}
