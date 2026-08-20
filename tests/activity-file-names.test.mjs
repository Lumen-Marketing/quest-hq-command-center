import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "fix this activity details, so it should display the title of the file not the whole code, and
// in the image is the image title not this"
//
// The Activity feed printed a File / Image change as the raw stored value:
//
//   [{"name":"consultant.webp","url":"https://rqun....supabase.co/...?token=eyJhbGciOi...
//
// wbFileValue could not read a LIST. An array is an object, so the object branch answered null;
// a JSON array stored as a string did not begin with `{`, so it fell past the object branch to
// the last resort -- "a bare string is a filename" -- and the entire array came back AS the
// filename. That is what reached the receipt.
//
// Two things wrong with it, not one. It is unreadable, and a stored URL is SIGNED: the activity
// log is written into the workspace document, so every token in it was being kept there too.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Plain functions of their input, so they are rebuilt from source rather than imported --
// main.js cannot load outside a browser. Same approach as workspace-file-multiple.test.mjs.
const build = () => {
  const single = main.match(/function wbFileValue\(val\) \{[\s\S]*?\n\}/)[0];
  const many = main.match(/function wbFileValues\(val\) \{[\s\S]*?\n\}/)[0];
  // eslint-disable-next-line no-new-func
  return new Function(`${single}; ${many}; return { wbFileValue, wbFileValues };`)();
};
const { wbFileValue, wbFileValues } = build();

const SIGNED = 'https://rqundirizvojpzhljtdn.supabase.co/storage/v1/object/sign/quest-roofing-az/'
  + 'workspace/3aca1fc9-5032-4203-8ff1-4b61cbe316a1-consultant.webp?token=eyJhbGciOiJIUzI1NiJ9.SECRET';
const LIST = [
  { name: 'consultant.webp', url: SIGNED },
  { name: 'inspection.pdf', url: SIGNED },
];

test('a list of files, stored as a JSON string, is not one file called "[{...}]"', () => {
  const one = wbFileValue(JSON.stringify(LIST));
  assert.equal(one.name, 'consultant.webp');
  assert.ok(!one.name.includes('token'), 'no signed URL is smuggled through as a name');
  assert.ok(!one.name.startsWith('['), 'and the array is not the name');
});

test('a real array reads as its first file rather than as nothing', () => {
  // typeof [] === 'object', so the object branch used to answer null for every multi-file field.
  assert.equal(wbFileValue(LIST).name, 'consultant.webp');
  assert.equal(wbFileValue([]), null);
});

test('an empty list is empty, not a file called "[]"', () => {
  assert.equal(wbFileValue('[]'), null);
  assert.deepEqual(wbFileValues('[]'), []);
});

test('the single-file shapes still read exactly as they did', () => {
  assert.equal(wbFileValue({ name: 'plan.pdf', url: 'https://x/p' }).name, 'plan.pdf');
  assert.equal(wbFileValue('{"name":"plan.pdf","url":"https://x/p"}').name, 'plan.pdf');
  assert.equal(wbFileValue('https://x/files/plan.pdf').name, 'plan.pdf');
  assert.equal(wbFileValue(''), null);
  assert.equal(wbFileValue(null), null);
});

/* ---- what the receipt is handed --------------------------------------------------------- */

test('a File or Image change reports every NAME and no URL', () => {
  // wbPlainVal feeds the activity receipt, the search index and CSV export.
  // Sliced from the case itself rather than by line numbers: `case 'money'` appears in more
  // than one switch in this file, and anchoring on it found the wrong one.
  const line = "case 'file': case 'image': return wbFileValues(value).map((one) => one.name).filter(Boolean).join(', ');";
  assert.ok(main.includes(line), 'the receipt is handed names');
  const from = main.indexOf("case 'file': case 'image': return wbFileValues");
  assert.ok(!main.slice(from, from + 140).includes(".url"), "a signed URL never reaches the log");
  // And the behaviour that markup describes, run.
  const names = wbFileValues(JSON.stringify(LIST)).map((f) => f.name).filter(Boolean).join(', ');
  assert.equal(names, 'consultant.webp, inspection.pdf');
});

test('"is this field empty" reads a list too', () => {
  // It asked wbFileValue, which answered null for an array -- so a required Photos field holding
  // three pictures still counted as empty and refused the save.
  assert.match(main, /if \(field\.type === 'file' \|\| field\.type === 'image'\) return !wbFileValues\(raw\)\.length;/);
  assert.equal(wbFileValues(LIST).length, 2);
  assert.equal(wbFileValues('').length, 0);
});
