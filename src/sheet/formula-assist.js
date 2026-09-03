// Writing a formula the way a spreadsheet lets you: point at the cells, and get told what the
// functions are called.
//
// Two things were missing, and both are the same complaint -- the editor made you know things
// it could have shown you. A reference had to be typed from memory, with the row and column
// read off the headers by eye; and the function names existed only as a strip of grey text
// along the bottom, which you had to copy by hand and spell exactly.
//
// PURE ON PURPOSE. Everything here is string-in, string-out around a caret position, so the
// awkward parts -- where a reference may go, what counts as a half-typed name, where the caret
// lands afterwards -- are tested directly instead of through a grid and a mouse. sheet-model.js
// is laid out the same way for the same reason.

/** A single cell, `A1`, or a rectangle, `A1:B4`. Anchored so a partial match is not a match. */
const REFERENCE = /^\$?[A-Za-z]{1,3}\$?\d{1,7}(?::\$?[A-Za-z]{1,3}\$?\d{1,7})?$/;

// What may sit immediately before a reference. An operator, an opening bracket, an argument
// separator, or the `=` itself -- anywhere a value is expected. Deliberately NOT a letter or a
// digit: `A1` after `SUM` is a typo, not a reference, and quietly rewriting it would be worse
// than leaving it alone.
const OPENERS = new Set(['=', '(', ',', ';', '+', '-', '*', '/', '^', '%', '<', '>', '&', ':', ' ']);

const isFormula = (text) => String(text ?? '').trimStart().startsWith('=');

/**
 * Where a clicked reference would go, or null when a click should not be hijacked.
 *
 * Returns the span to REPLACE, which is what makes the second click behave: in Excel, clicking
 * one cell and then another does not leave you with `=A1B2` -- the second replaces the first.
 * So when the caret sits just after something that already reads as a reference, that reference
 * is the span; otherwise the span is empty and the reference is inserted at the caret.
 */
export function referenceSlotAt(text, caret) {
  const value = String(text ?? '');
  if (!isFormula(value)) return null;
  const at = Math.max(0, Math.min(Number(caret) || 0, value.length));
  const before = value.slice(0, at);

  // A reference the caret is sitting at the end of: replace it.
  const trailing = /(\$?[A-Za-z]{1,3}\$?\d{1,7}(?::\$?[A-Za-z]{1,3}\$?\d{1,7})?)$/.exec(before);
  if (trailing) {
    const start = at - trailing[1].length;
    // Only if what precedes it is an opener too -- otherwise this is the tail of a name like
    // `LOG10`, and replacing it would eat part of a function.
    const preceding = start > 0 ? value[start - 1] : '=';
    if (OPENERS.has(preceding) || start === 0) return { start, end: at };
    return null;
  }

  // Otherwise a reference may be inserted only where a value is expected.
  const prev = before.replace(/\s+$/, '').slice(-1);
  if (before.trim() === '=' || OPENERS.has(prev) || prev === '') return { start: at, end: at };
  return null;
}

/** Put `ref` into the slot, and say where the caret lands after it. */
export function insertReference(text, caret, ref) {
  const value = String(text ?? '');
  const slot = referenceSlotAt(value, caret);
  const clean = String(ref ?? '').trim();
  if (!slot || !REFERENCE.test(clean)) return { text: value, caret: Number(caret) || 0, changed: false };
  const next = value.slice(0, slot.start) + clean + value.slice(slot.end);
  return { text: next, caret: slot.start + clean.length, changed: true };
}

/**
 * The half-typed function name at the caret, or '' when there is not one.
 *
 * Only ever the run of letters immediately before the caret, and only when what precedes THAT
 * is an opener. `=SU` suggests; `=SUM(A1` does not, because `A1` is a reference and offering
 * `ABS` there would be noise on top of the thing being typed.
 */
export function functionQueryAt(text, caret) {
  const value = String(text ?? '');
  if (!isFormula(value)) return '';
  const at = Math.max(0, Math.min(Number(caret) || 0, value.length));
  const before = value.slice(0, at);
  const word = /([A-Za-z]+)$/.exec(before);
  if (!word) return '';
  const start = at - word[1].length;
  const preceding = start > 0 ? value[start - 1] : '';
  if (start > 0 && !OPENERS.has(preceding)) return '';
  return word[1];
}

/**
 * Names worth offering for a query.
 *
 * Prefix matches first and in their own order, then names that merely contain the query, so
 * typing `OU` still finds ROUND and ROUNDUP without burying the thing you probably meant.
 */
export function matchFunctions(query, names) {
  const list = Array.isArray(names) ? names : [];
  const q = String(query ?? '').trim().toUpperCase();
  if (!q) return [];
  const starts = list.filter((name) => name.toUpperCase().startsWith(q));
  const contains = list.filter((name) => !name.toUpperCase().startsWith(q) && name.toUpperCase().includes(q));
  return [...starts, ...contains];
}

/**
 * Accept a suggestion: the half-typed name becomes `NAME(`, caret inside the bracket.
 *
 * The bracket is opened for you and NOT closed. A closing bracket the editor typed is one the
 * caret has to be moved past, and every argument typed in between fights it.
 */
export function applyFunction(text, caret, name) {
  const value = String(text ?? '');
  const at = Math.max(0, Math.min(Number(caret) || 0, value.length));
  const query = functionQueryAt(value, at);
  const clean = String(name ?? '').trim().toUpperCase();
  if (!clean) return { text: value, caret: at, changed: false };
  const start = at - query.length;
  const insert = `${clean}(`;
  const next = value.slice(0, start) + insert + value.slice(at);
  return { text: next, caret: start + insert.length, changed: true };
}

/**
 * Where a SECOND reference goes, after the one the caret is sitting on: Excel's ctrl-click.
 *
 * Pointing at another cell normally REPLACES the reference just written -- that is what stops a
 * second click leaving you with `=A1B2`. Holding ctrl means "and this one as well", which is a
 * different edit: the reference stays put, an argument separator goes in after it, and the next
 * reference lands beyond that.
 *
 * Refuses anywhere the caret is not already sitting on a reference. A comma with nothing before
 * it is a broken formula, not the start of a list, and ctrl-clicking into empty space should
 * behave like the ordinary click it otherwise is.
 */
export function separateReference(text, caret) {
  const value = String(text ?? '');
  const at = Math.max(0, Math.min(Number(caret) || 0, value.length));
  const slot = referenceSlotAt(value, at);
  // An empty slot means the caret is on open ground -- there is no reference to come after.
  if (!slot || slot.start === slot.end) return { text: value, caret: at, changed: false };
  return { text: `${value.slice(0, at)},${value.slice(at)}`, caret: at + 1, changed: true };
}

/** `A1` and `B4` as the range a drag covers, in the order a spreadsheet writes it. */
export function rangeReference(fromRef, toRef) {
  const a = String(fromRef ?? '').toUpperCase();
  const b = String(toRef ?? '').toUpperCase();
  if (!a || !b || a === b) return a || b;
  return `${a}:${b}`;
}
