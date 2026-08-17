import assert from 'node:assert/strict';
import test from 'node:test';

import { MM_TO_PT, jpegInfo, textWidth, wrapText, writePdf } from '../src/form/doc-pdf.js';
import { normalizeDoc, normalizeElement } from '../src/form/doc-model.js';

// The PDF this project writes itself.
//
// A generated PDF fails in ways nothing else does: a cross-reference offset one byte out makes a
// file that opens in one reader and is refused by another, and an upside-down page is a single
// wrong subtraction. Neither is visible from "it downloaded". So this test reads the bytes back.

const bytes = (opts) => writePdf(opts);
const text = (out) => Buffer.from(out).toString('latin1');

const el = (input) => {
  const e = normalizeElement(input, () => 'e1');
  return { ...e, text: input.text ?? '' };
};
const A4 = { size: 'a4', landscape: false, margin: 12 };

// --- the file is a file --------------------------------------------------------------------------

test('it is a PDF, and it is complete', () => {
  const s = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'Hello' })], title: 'Proposal' }));
  assert.ok(s.startsWith('%PDF-1.4\n'), 'a PDF says so on its first line');
  assert.ok(s.includes('\n%\xE2\xE3\xCF\xD3\n'), 'the binary comment is what stops a transfer mangling it');
  assert.ok(s.trimEnd().endsWith('%%EOF'));
  assert.ok(s.includes('/Type /Catalog'));
  assert.ok(s.includes('/Type /Page '));
});

test('every cross-reference offset points at the object it claims', () => {
  // This is the test that matters. The xref table is a list of absolute byte offsets, and a
  // reader uses it to find objects rather than scanning; an off-by-one here produces a file that
  // some readers open and others reject, which is the worst possible failure mode.
  const out = bytes({
    page: A4,
    items: [el({ kind: 'text', text: 'Some text long enough to shift the offsets along' }), el({ kind: 'shape', shape: 'ellipse' })],
    images: [{ id: 'i1', bytes: new Uint8Array([1, 2, 3, 4, 5]), width: 10, height: 10, components: 3 }],
    title: 'Offsets',
  });
  const s = text(out);
  const xrefAt = Number(s.slice(s.lastIndexOf('startxref') + 9).trim().split('\n')[0]);
  assert.equal(s.slice(xrefAt, xrefAt + 4), 'xref', 'startxref must point at the table');
  const table = s.slice(xrefAt).split('\n');
  const count = Number(table[1].split(' ')[1]);
  assert.ok(count >= 10, `expected catalog, pages, page, 4 fonts, content, image and info: got ${count}`);
  // table[0] is 'xref', table[1] the range, table[2] the free head; object n is at 2 + n.
  for (let n = 1; n < count; n += 1) {
    const offset = Number(table[2 + n].slice(0, 10));
    assert.equal(s.slice(offset, offset + `${n} 0 obj`.length), `${n} 0 obj`, `object ${n} is not at offset ${offset}`);
  }
  assert.match(s, /\/Size (\d+) \/Root 1 0 R \/Info (\d+) 0 R/);
  assert.equal(Number(s.match(/\/Size (\d+)/)[1]), count);
});

test('/Info is an indirect object, not a dictionary sitting in the trailer', () => {
  // An inline /Info dictionary is invalid and some readers reject the whole file for it.
  const s = text(bytes({ page: A4, items: [], title: 'Named' }));
  const ref = Number(s.match(/\/Info (\d+) 0 R/)[1]);
  assert.ok(s.includes(`${ref} 0 obj\n<< /Title (Named)`), 'the title lives in its own object');
});

test('the page box is the page, in points', () => {
  const portrait = text(bytes({ page: A4, items: [] }));
  const w = (210 * MM_TO_PT).toFixed(3).replace(/\.?0+$/, '');
  const h = (297 * MM_TO_PT).toFixed(3).replace(/\.?0+$/, '');
  assert.ok(portrait.includes(`/MediaBox [0 0 ${w} ${h}]`), `expected ${w} x ${h}, got ${portrait.match(/\/MediaBox[^\]]+\]/)}`);
  const landscape = text(bytes({ page: { ...A4, landscape: true }, items: [] }));
  assert.ok(landscape.includes(`/MediaBox [0 0 ${h} ${w}]`), 'landscape swaps them');
});

test('no font data is embedded — the base fourteen are already in every reader', () => {
  const s = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'Hi' })] }));
  ['/Helvetica', '/Helvetica-Bold', '/Helvetica-Oblique', '/Helvetica-BoldOblique'].forEach((face) => {
    assert.ok(s.includes(`/BaseFont ${face} `), `${face} must be available to the page`);
  });
  assert.ok(!s.includes('/FontFile'), 'embedding a font would cost more than this whole feature');
  assert.ok(s.includes('/Encoding /WinAnsiEncoding'), 'without this, anything above ASCII draws wrong');
});

// --- what is actually drawn ---------------------------------------------------------------------

test('text goes in as text, so it can be selected and searched in the reader', () => {
  const s = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'Roof replacement' })] }));
  assert.ok(s.includes('(Roof replacement) Tj'), 'not a picture of the words');
});

test('the page is the right way up', () => {
  // PDF measures from the bottom, the document measures from the top. Getting this backwards
  // prints everything upside down, and it is one subtraction.
  const pageHeight = 297 * MM_TO_PT;
  const top = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'TOP', y: 0, h: 10 })] }));
  const baseline = Number(top.match(/1 0 0 1 [\d.]+ ([\d.]+) Tm/)[1]);
  assert.ok(baseline > pageHeight - 40, `text at y=0 must be near the top of the page, got ${baseline} of ${pageHeight}`);
  const low = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'LOW', y: 280, h: 10 })] }));
  const lowBaseline = Number(low.match(/1 0 0 1 [\d.]+ ([\d.]+) Tm/)[1]);
  assert.ok(lowBaseline < 60, `text at y=280 must be near the bottom, got ${lowBaseline}`);
});

test('bold, italic and both pick different faces', () => {
  const face = (style) => text(bytes({ page: A4, items: [el({ kind: 'text', text: 'x', style })] })).match(/\/F(\d) [\d.]+ Tf/)[1];
  assert.equal(face({}), '1');
  assert.equal(face({ bold: true }), '2');
  assert.equal(face({ italic: true }), '3');
  assert.equal(face({ bold: true, italic: true }), '4');
});

test('underline is drawn, because PDF has no underline attribute', () => {
  const plain = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'Total' })] }));
  const lined = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'Total', style: { underline: true } })] }));
  assert.ok(!/re\nf/.test(plain));
  assert.ok(/re\nf/.test(lined), 'an underline is a thin filled rectangle');
});

test('a colour reaches the stream as three channels', () => {
  const s = text(bytes({ page: A4, items: [el({ kind: 'text', text: 'x', style: { color: '#ff0000' } })] }));
  assert.ok(s.includes('1 0 0 rg'), 'red');
});

test('centring and right-aligning use the measured width of the line', () => {
  const xOf = (align) => Number(text(bytes({
    page: A4, items: [el({ kind: 'text', text: 'Quote', x: 0, w: 100, style: { align, size: 12 } })],
  })).match(/1 0 0 1 ([\d.]+) [\d.]+ Tm/)[1]);
  const left = xOf('left');
  const centre = xOf('center');
  const right = xOf('right');
  assert.equal(left, 0);
  assert.ok(centre > left && centre < right, `expected left < center < right, got ${left} ${centre} ${right}`);
  // The right edge of a right-aligned line lands on the right edge of the box.
  assert.ok(Math.abs((right + textWidth('Quote', 12, false)) - 100 * MM_TO_PT) < 0.5);
});

test('an empty text element draws nothing at all', () => {
  const s = text(bytes({ page: A4, items: [el({ kind: 'text', text: '   ' })] }));
  assert.ok(!s.includes('BT'), 'a blank box must not emit a text object');
});

test('a shape is filled, stroked, both, or dropped — never left on the stack', () => {
  const draw = (style, shape = 'rect') => text(bytes({ page: A4, items: [el({ kind: 'shape', shape, style })] }));
  assert.ok(/re\nf\n/.test(draw({ fill: '#ff0000', stroke: 'none', strokeWidth: 0 })));
  assert.ok(/re\nS\n/.test(draw({ fill: 'none', stroke: '#000000', strokeWidth: 1 })));
  assert.ok(/re\nB\n/.test(draw({ fill: '#ff0000', stroke: '#000000', strokeWidth: 1 })));
  // A path with nothing to paint has to be discarded with 'n', or the next element inherits it.
  assert.ok(/re\nn\n/.test(draw({ fill: 'none', stroke: 'none', strokeWidth: 0 })));
});

test('an ellipse and a rounded corner are Bézier curves, not boxes', () => {
  assert.ok(text(bytes({ page: A4, items: [el({ kind: 'shape', shape: 'ellipse' })] })).includes(' c\n'));
  const rounded = text(bytes({ page: A4, items: [el({ kind: 'shape', shape: 'rect', style: { radius: 4 } })] }));
  assert.ok(rounded.includes(' c\n'), 'a rounded rectangle needs arcs');
  assert.ok(!/ re\n/.test(rounded), 'and is therefore not a plain re');
});

test('a line is a rule across its box', () => {
  const s = text(bytes({ page: A4, items: [el({ kind: 'shape', shape: 'line', x: 10, y: 50, w: 100, h: 2 })] }));
  const [, x1, y1, x2, y2] = s.match(/([\d.]+) ([\d.]+) m\n([\d.]+) ([\d.]+) l\nS/).map(Number);
  assert.equal(y1, y2, 'a rule is level');
  assert.ok(x2 > x1);
});

test('an element drawn in an unsupported way is skipped, not drawn as a black box', () => {
  // An image whose bytes never arrived: better a gap than a rectangle of ink.
  const s = text(bytes({ page: A4, items: [el({ kind: 'image', src: 'data:image/png;base64,AA' })], images: [] }));
  assert.ok(!s.includes(' Do\n'));
});

test('a JPEG is embedded by copying it — that is what DCTDecode means', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0x11, 0x22, 0x33, 0xff, 0xd9]);
  const out = bytes({
    page: A4,
    items: [{ ...el({ kind: 'image' }), id: 'i1' }],
    images: [{ id: 'i1', bytes: jpeg, width: 64, height: 32, components: 3 }],
  });
  const s = text(out);
  assert.ok(s.includes('/Filter /DCTDecode'));
  assert.ok(s.includes('/Width 64 /Height 32'));
  assert.ok(s.includes('/ColorSpace /DeviceRGB'));
  assert.ok(s.includes('/Im0 Do'), 'and it is actually painted');
  // The bytes survive untouched, which is the entire trick.
  assert.ok(Buffer.from(out).includes(Buffer.from(jpeg)));
});

test('a greyscale JPEG is declared greyscale', () => {
  const s = text(bytes({
    page: A4,
    items: [{ ...el({ kind: 'image' }), id: 'i1' }],
    images: [{ id: 'i1', bytes: new Uint8Array([1, 2, 3]), width: 4, height: 4, components: 1 }],
  }));
  assert.ok(s.includes('/ColorSpace /DeviceGray'), 'declaring RGB for one channel makes a broken image');
});

test('the image matrix maps the unit square onto the box', () => {
  const s = text(bytes({
    page: A4,
    items: [{ ...el({ kind: 'image', x: 20, y: 30, w: 50, h: 25 }), id: 'i1' }],
    images: [{ id: 'i1', bytes: new Uint8Array([1]), width: 8, height: 4, components: 3 }],
  }));
  const [, w, h] = s.match(/([\d.]+) 0 0 ([\d.]+) [\d.]+ [\d.]+ cm/).map(Number);
  assert.ok(Math.abs(w - 50 * MM_TO_PT) < 0.1);
  assert.ok(Math.abs(h - 25 * MM_TO_PT) < 0.1);
});

// --- text measurement ---------------------------------------------------------------------------

test('measurement uses the real font metrics, so bold is wider than regular', () => {
  assert.ok(textWidth('Total contract value', 12, true) > textWidth('Total contract value', 12, false));
  // Helvetica at 12pt: 'i' is narrow and 'W' is wide. A single average width would make these equal.
  assert.ok(textWidth('W', 12) > textWidth('i', 12) * 3);
  assert.equal(textWidth('', 12), 0);
  // Twice the size is twice the width.
  assert.ok(Math.abs(textWidth('Quest', 24) - textWidth('Quest', 12) * 2) < 0.001);
});

test('a glyph outside the metrics is measured as something, never as nothing', () => {
  assert.ok(textWidth('中文', 12) > 0, 'measuring as zero lets a line run off the paper');
});

test('wrapping fits the width it was given', () => {
  const width = 120;
  const lines = wrapText('The contractor shall furnish all labour, materials and equipment necessary to complete the roof replacement described herein.', width, 11);
  assert.ok(lines.length > 1, 'that does not fit on one line');
  lines.forEach((line) => assert.ok(textWidth(line, 11) <= width, `"${line}" overflows`));
  assert.equal(lines.join(' ').replace(/\s+/g, ' '), 'The contractor shall furnish all labour, materials and equipment necessary to complete the roof replacement described herein.');
});

test('a deliberate blank line survives wrapping', () => {
  assert.deepEqual(wrapText('One\n\nTwo', 400, 11), ['One', '', 'Two']);
});

test('a word too long for the line is broken rather than left to overflow', () => {
  const lines = wrapText('https://example.com/a/very/long/path/that/cannot/possibly/fit', 40, 11);
  assert.ok(lines.length > 1);
  lines.forEach((line) => assert.ok(textWidth(line, 11) <= 40, `"${line}" overflows`));
  assert.equal(lines.join(''), 'https://example.com/a/very/long/path/that/cannot/possibly/fit');
});

test('long text is clipped at the bottom of its box rather than printing over what is below', () => {
  const many = Array.from({ length: 60 }, (unused, i) => `line ${i}`).join('\n');
  const s = text(bytes({ page: A4, items: [el({ kind: 'text', text: many, x: 10, y: 10, w: 80, h: 20, style: { size: 11 } })] }));
  const drawn = (s.match(/ Tj/g) || []).length;
  assert.ok(drawn > 0 && drawn < 10, `a 20 mm box cannot hold 60 lines: ${drawn} were drawn`);
});

// --- reading a JPEG's own header -----------------------------------------------------------------

const jpegWith = (segments) => new Uint8Array([0xff, 0xd8, ...segments]);

test('a JPEG size is read out of its SOF marker, wherever that is', () => {
  // A real JPEG is a chain of markers; the SOF is not at a fixed offset, so the segment lengths
  // have to be walked. This one puts a comment in front of it.
  const comment = [0xff, 0xfe, 0x00, 0x06, 1, 2, 3, 4];
  const sof0 = [0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0x2c, 0x00, 0xc8, 0x03];
  const info = jpegInfo(jpegWith([...comment, ...sof0]));
  assert.deepEqual([info.width, info.height, info.components], [200, 300, 3]);
});

test('a progressive JPEG is read too — browsers produce them', () => {
  const sof2 = [0xff, 0xc2, 0x00, 0x11, 0x08, 0x00, 0x10, 0x00, 0x20, 0x01];
  const info = jpegInfo(jpegWith(sof2));
  assert.deepEqual([info.width, info.height, info.components], [32, 16, 1]);
});

test('a Huffman table is not mistaken for a frame header', () => {
  // 0xC4 is DHT and sits in the middle of the SOFn range. Reading it as a frame gives nonsense
  // dimensions and a corrupt image in the PDF.
  const dht = [0xff, 0xc4, 0x00, 0x06, 0x00, 0x01, 0x02, 0x03];
  const sof0 = [0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0x64, 0x03];
  assert.equal(jpegInfo(jpegWith([...dht, ...sof0])).width, 100);
});

test('something that is not a JPEG says so rather than producing a broken file', () => {
  assert.throws(() => jpegInfo(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), /not a JPEG/);
  assert.throws(() => jpegInfo(jpegWith([0xff, 0xfe, 0x00, 0x04, 1, 2])), /no size/);
});

// --- the two files agree ------------------------------------------------------------------------

test('a document normalized by the model draws through the writer unchanged', () => {
  // The editor hands the writer whatever normalizeDoc produced, so the two shapes have to match:
  // a missing style property here would be a crash on export, not a wrong pixel.
  const doc = normalizeDoc({
    title: 'Proposal',
    page: { size: 'letter', landscape: true },
    elements: [
      {
        kind: 'text', text: 'Roof Replacement Proposal', w: 180, h: 14, style: { size: 20, bold: true, align: 'center' },
      },
      { kind: 'shape', shape: 'line', y: 30, w: 180 },
      { kind: 'field', from: 'h-name', w: 90 },
      { kind: 'icon', glyph: 'ti-home' },
    ],
  }, (() => { let i = 0; return () => `e${(i += 1)}`; })());
  const items = doc.elements.map((element) => ({ ...element, text: element.kind === 'text' ? element.text : 'Acme Roofing' }));
  const s = text(writePdf({ page: doc.page, items, title: doc.title }));
  assert.ok(s.includes('(Roof Replacement Proposal) Tj'));
  assert.ok(s.includes('(Acme Roofing) Tj'));
  assert.ok(s.trimEnd().endsWith('%%EOF'));
});
