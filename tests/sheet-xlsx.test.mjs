import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildStyleTables, pointsToPx, pxToPoints, pxToWidth, sheetXml, stylesXml, usableFormula, widthToPx,
} from '../src/sheet/sheet-xlsx.js';
import { applyBorders, applyStyle, normalizeSheetFull, parseRange } from '../src/sheet/sheet-format.js';
import { evaluateSheet } from '../src/sheet/sheet-model.js';

// "I can also export it as an Excel file, or import a spreadsheet file format."
//
// Reading needs a DOMParser, so the round trip is proved in a browser. What is checked here is
// everything the writer decides on its own: the tables, the XML, and the conversions both
// directions share.

const styled = () => {
  const sheet = normalizeSheetFull({
    rows: 4, cols: 3,
    cells: { A1: 'Item', B1: 'Qty', A2: 'Shingles', B2: '12', B3: '=SUM(B2:B2)', C2: "Bob's <bolt> & \"nut\"" },
    merges: ['A4:C4'], colW: { 0: 180 }, rowH: { 0: 40 },
  });
  sheet.styles = applyStyle(sheet, parseRange('A1:B1'), { b: 1, bg: '#e0552d', fg: '#ffffff', ha: 'center' });
  sheet.styles = applyStyle(sheet, parseRange('B2:B3'), { nf: '#,##0.00' });
  sheet.styles = applyBorders({ ...sheet }, parseRange('A1:C3'), 'all');
  return sheet;
};

// ---- what survives the trip in, and what cannot ----------------------------------------------

test('a formula this engine can work out comes in as a formula', () => {
  assert.equal(usableFormula('SUM(A1:A9)'), '=SUM(A1:A9)');
  assert.equal(usableFormula('B2*1.15'), '=B2*1.15');
  assert.equal(usableFormula(''), '');
});

test('a formula it cannot is imported as the number Excel last showed', () => {
  // A workbook using VLOOKUP would otherwise import as a grid of errors. Taking the cached
  // value keeps the number on screen the number that was on screen.
  assert.equal(usableFormula('VLOOKUP(A1,Sheet2!A:B,2,0)'), '');
  assert.equal(usableFormula('XLOOKUP(A1,B:B,C:C)'), '');
  // One sheet here, so a reference to another one has nothing to point at -- and $A$1 is not a
  // reference this parser reads.
  assert.equal(usableFormula('SUM(Sheet2!A1:A9)'), '');
  assert.equal(usableFormula('SUM($A$1:$A$9)'), '');
});

test('the units Excel measures in convert both ways', () => {
  // Columns are in characters of the default font, rows in points, and the grid is in pixels.
  assert.equal(widthToPx(25), 180);
  assert.equal(Math.round(pxToWidth(180)), 25);
  assert.equal(pointsToPx(30), 40);
  assert.equal(pxToPoints(40), 30);
});

// ---- the style tables ------------------------------------------------------------------------

test('the reserved slots Excel insists on are the first ones', () => {
  // A workbook whose fills do not start with none/gray125 is one Excel calls corrupt.
  const tables = buildStyleTables(styled());
  assert.equal(tables.fills[0], '');
  assert.equal(tables.fills[1], 'gray125');
  assert.deepEqual(tables.xfs[0], { font: 0, fill: 0, border: 0, numFmt: 0, align: null });
  assert.equal(tables.fonts[0].b, 0, 'index 0 is the plain font');
});

test('a style used by many cells is written once', () => {
  // Cells point at an xf, which points at a font. A sheet where every cell is bold has to write
  // one font, not one per cell.
  const sheet = normalizeSheetFull({ rows: 20, cols: 5 });
  sheet.styles = applyStyle(sheet, parseRange('A1:E20'), { b: 1, bg: '#ffff00' });
  const tables = buildStyleTables(sheet);
  assert.equal(Object.keys(tables.byRef).length, 100, 'every cell is styled');
  assert.equal(tables.fonts.length, 2, 'and they share one font');
  assert.equal(tables.fills.length, 3, 'none, gray125, and the yellow');
  assert.equal(tables.xfs.length, 2);
});

test('a custom number format is numbered above the built-in range', () => {
  const tables = buildStyleTables(styled());
  const used = tables.xfs.filter((xf) => xf.numFmt);
  assert.ok(used.length, 'the money column has a format');
  used.forEach((xf) => assert.ok(xf.numFmt >= 164, 'ids below 164 belong to Excel'));
  assert.match(stylesXml(tables), /<numFmt numFmtId="164" formatCode="#,##0.00"\/>/);
});

// ---- the XML ---------------------------------------------------------------------------------

test('the sheet carries its formulas AND what they currently come to', () => {
  // Excel shows the cached value until it recalculates, so a workbook without one opens blank.
  const sheet = styled();
  const xml = sheetXml(sheet, buildStyleTables(sheet), evaluateSheet(sheet).values);
  assert.match(xml, /<f>SUM\(B2:B2\)<\/f><v>12<\/v>/);
});

test('a number is written as a number and words as text', () => {
  const sheet = styled();
  const xml = sheetXml(sheet, buildStyleTables(sheet), evaluateSheet(sheet).values);
  assert.match(xml, /r="B2"[^>]*><v>12<\/v>/, 'a quantity is a number Excel can sum');
  assert.match(xml, /r="A2"[^>]*t="inlineStr"><is><t xml:space="preserve">Shingles</, 'a word is text');
});

test('the characters that break XML are escaped, not passed through', () => {
  const sheet = styled();
  const xml = sheetXml(sheet, buildStyleTables(sheet), {});
  assert.match(xml, /Bob&apos;s &lt;bolt&gt; &amp; &quot;nut&quot;/);
  assert.ok(!/<bolt>/.test(xml), 'an angle bracket in a cell must not open a tag');
});

test('a control character is dropped rather than making the whole workbook corrupt', () => {
  const sheet = normalizeSheetFull({ rows: 2, cols: 2, cells: { A1: 'ab' } });
  assert.match(sheetXml(sheet, buildStyleTables(sheet), {}), /<t xml:space="preserve">ab<\/t>/);
});

test('widths, heights and merges are written in the units Excel reads', () => {
  const sheet = styled();
  const xml = sheetXml(sheet, buildStyleTables(sheet), {});
  assert.match(xml, /<col min="1" max="1" width="25.00" customWidth="1"\/>/);
  assert.match(xml, /<row r="1" ht="30.00" customHeight="1"/);
  assert.match(xml, /<mergeCells count="1"><mergeCell ref="A4:C4"\/><\/mergeCells>/);
});

test('a cell with only a colour is still written, so a shaded band survives', () => {
  const sheet = normalizeSheetFull({ rows: 3, cols: 3 });
  sheet.styles = applyStyle(sheet, parseRange('A1:C1'), { bg: '#ffff00' });
  const xml = sheetXml(sheet, buildStyleTables(sheet), {});
  assert.match(xml, /<c r="B1" s="\d+"\/>/, 'empty, but carrying its fill');
});

test('the style sheet names a real font and a real fill for what was set', () => {
  const xml = stylesXml(buildStyleTables(styled()));
  assert.match(xml, /<b\/>/);
  assert.match(xml, /<fgColor rgb="FFE0552D"\/>/, 'the orange header fill');
  assert.match(xml, /<name val="Arial"\/>/);
  assert.match(xml, /<alignment horizontal="center"\/>/);
  assert.match(xml, /<left style="thin">/, 'the cell lines');
  // The counts have to match the tables, or Excel refuses the file.
  const tables = buildStyleTables(styled());
  assert.match(xml, new RegExp(`<fonts count="${tables.fonts.length}">`));
  assert.match(xml, new RegExp(`<cellXfs count="${tables.xfs.length}">`));
});

test('vertical middle is written as Excel spells it', () => {
  const sheet = normalizeSheetFull({ rows: 2, cols: 2 });
  sheet.styles = applyStyle(sheet, parseRange('A1'), { va: 'middle', wrap: 1 });
  assert.match(stylesXml(buildStyleTables(sheet)), /<alignment vertical="center" wrapText="1"\/>/);
});
