import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { contactRowsToRecords, detectDelimiter, parseContactsCsv, parseCsvRows, toCsv } from '../src/data/csv.js';

// Import accepted only comma-separated CSV. Excel writes a semicolon in every locale whose
// decimal mark is a comma, and "save as tab-delimited" is just as common -- both parsed as a
// single column, so the header never matched and a perfectly good file reported
// "no contacts found". .xlsx was rejected outright, and there was no export at all.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const io = readFileSync(join(root, 'src', 'crm', 'contacts-io.js'), 'utf8');
const table = readFileSync(join(root, 'src', 'crm', 'contact-table.js'), 'utf8');
const policy = readFileSync(join(root, 'src', 'security', 'upload-policy.js'), 'utf8');

test('the delimiter is read off the file, not assumed', () => {
  assert.equal(detectDelimiter('Name,Email\nA,b'), ',');
  assert.equal(detectDelimiter('Name;Email\nA;b'), ';');
  assert.equal(detectDelimiter('Name\tEmail\nA\tb'), '\t');
  // A comma inside a quoted cell must not outvote the real delimiter.
  assert.equal(detectDelimiter('"Smith, Ada";Email\n"x, y";b'), ';');
  // Only the header line counts, so a comma further down cannot win either.
  assert.equal(detectDelimiter('Name;Email\n"a,b,c,d,e";f'), ';');
  assert.equal(detectDelimiter('OneColumn\nvalue'), ',', 'a single column falls back to comma');
});

test('all three delimiters produce the same contacts', () => {
  const expected = [{ name: 'Ada Lovelace', email: 'ada@x.com', phone: '555-111-2222', title: '' }];
  assert.deepEqual(parseContactsCsv('Name,Email,Phone\nAda Lovelace,ada@x.com,555-111-2222'), expected);
  assert.deepEqual(parseContactsCsv('Name;Email;Phone\nAda Lovelace;ada@x.com;555-111-2222'), expected);
  assert.deepEqual(parseContactsCsv('Name\tEmail\tPhone\nAda Lovelace\tada@x.com\t555-111-2222'), expected);
});

test('quoted cells still survive, whichever delimiter is in play', () => {
  assert.deepEqual(parseCsvRows('a,"b,c",d'), [['a', 'b,c', 'd']]);
  assert.deepEqual(parseCsvRows('a;"b;c";d'), [['a', 'b;c', 'd']]);
  assert.deepEqual(parseCsvRows('a,"line\nbreak",d'), [['a', 'line\nbreak', 'd']]);
  assert.deepEqual(parseCsvRows('a,"say ""hi""",d'), [['a', 'say "hi"', 'd']]);
});

test('a spreadsheet and its exported CSV import identically', () => {
  // One mapping for both, so adding a header cannot fix one path and miss the other.
  const rows = [['Name', 'Email', 'Phone'], ['Ada', 'a@x.com', '555']];
  assert.deepEqual(contactRowsToRecords(rows), parseContactsCsv('Name,Email,Phone\nAda,a@x.com,555'));
});

test('export quotes what needs quoting and defuses formulas', () => {
  const csv = toCsv([['Name', 'Note'], ['Smith, Ada', 'say "hi"'], ['-Bob', '+1 555']]);
  assert.ok(csv.startsWith('\uFEFF'), 'a BOM, or Excel mangles accented names');
  assert.ok(csv.includes('"Smith, Ada"'), 'a comma in a cell must be quoted');
  assert.ok(csv.includes('"say ""hi"""'), 'inner quotes are doubled');
  // Excel evaluates a cell starting = + - or @, so a name like -Bob would run as a formula.
  assert.ok(csv.includes('"\t-Bob"') && csv.includes('"\t+1 555"'));
  assert.ok(csv.endsWith('\r\n'), 'CRLF is what Excel expects');
});

test('a round trip through export and import keeps the contact intact', () => {
  const csv = toCsv([['Name', 'Email', 'Phone'], ['Smith, Ada', 'ada@x.com', '555-111-2222']]);
  assert.deepEqual(parseContactsCsv(csv), [
    { name: 'Smith, Ada', email: 'ada@x.com', phone: '555-111-2222', title: '' },
  ]);
});

test('Excel workbooks are accepted, and stay their own upload kind', () => {
  assert.match(main, /input\.accept = '\.csv,\.tsv,\.txt,\.xlsx';/);
  assert.match(io, /if \(\/\\\.xlsx\$\/i\.test\(file\.name\)\)/);
  assert.match(io, /await import\('\.\.\/data\/xlsx-read\.js'\)/, 'the parser is fetched, not bundled');
  assert.match(policy, /xlsx: \{ exts: \['xlsx'\], max: 10 \* MB/);
  // Widening 'csv' to cover a zip would have weakened the archive backstop.
  assert.match(policy, /csv: \{ exts: \['csv', 'tsv', 'txt'\]/);
});

test('export is offered beside import, and exports what is on screen', () => {
  assert.match(table, /data-action="contacts-export"/);
  assert.match(main, /action === 'contacts-export'/);
  // The filtered list, not the whole company: exporting something other than what is shown
  // is how people mail the wrong list.
  assert.match(io, /const contacts = filteredContacts\(companyId\);/);
  assert.match(io, /Nothing to export/, 'an empty list says so rather than downloading a header');
});

test('the price book import shares the one parser', () => {
  // It hand-rolled tab detection and could not read a semicolon file at all.
  assert.ok(!/includes\('\\t'\) \? '\\t' : ','/.test(main), 'no second delimiter guess');
});

// The audit found the import claiming success after a failed write, and the .xlsx path
// accepting anything 10 MB or under without checking what it actually was.

test('the import reports what saved, not what it planned to save', () => {
  const fn = io.slice(io.indexOf('async function importContactsFile'));
  const body = fn.slice(0, fn.indexOf('\n  }'));
  assert.match(body, /const ok = await persistContact\(/, 'the result has to be read');
  assert.match(body, /if \(ok === false\) \{/);
  assert.match(body, /stoppedAt = c\.name;/);
  assert.match(body, /Imported \$\{saved\} of \$\{toImport\.length\} contacts/);
  // The old version interpolated the planned count and nothing else.
  assert.ok(!/Imported \$\{toImport\.length\} contact\$\{toImport\.length === 1/.test(body));
});

test('one refusal stops the run instead of repeating itself', () => {
  const fn = io.slice(io.indexOf('async function importContactsFile'));
  const body = fn.slice(0, fn.indexOf('\n  }'));
  // Whatever refused one row refuses them all; continuing just buries the screen in toasts.
  assert.match(body, /break;/);
});

test('an .xlsx must prove it is a zip, and match a real MIME type', () => {
  assert.match(policy, /xlsx: 'zip',/, 'the container is checked, not just the extension');
  assert.match(policy, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
});

test('a workbook cannot expand without limit', () => {
  const reader = readFileSync(join(root, 'src', 'data', 'xlsx-read.js'), 'utf8');
  assert.match(reader, /const MAX_EXPANDED_BYTES = 40 \* 1024 \* 1024;/);
  assert.match(reader, /const MAX_ROWS = 50000;/);
  assert.match(reader, /const MAX_COLUMNS = 512;/);
  // Checked from the archive's declared sizes, before anything is decompressed.
  assert.match(reader, /entry\?\._data\?\.uncompressedSize/);
  assert.match(reader, /if \(declared > MAX_EXPANDED_BYTES\)/);
  assert.match(reader, /if \(sheetRows\.length > MAX_ROWS\)/);
  assert.match(reader, /if \(at >= MAX_COLUMNS\) continue;/);
});

test('a file that is not a zip is refused with a usable message', () => {
  const reader = readFileSync(join(root, 'src', 'data', 'xlsx-read.js'), 'utf8');
  assert.match(reader, /zip = await JSZip\.loadAsync\(file\);/);
  assert.match(reader, /If it is password protected, remove the password and try again\./);
});
