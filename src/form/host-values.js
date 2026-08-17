// What a record's field says, as plain words, for a printed document.
//
// The app renders values as HTML -- a coloured chip for a stage, a row of stars for a rating, an
// anchor for a link -- and none of that can go into a PDF, which takes text. Stripping tags out
// of the HTML version would be worse than useless: a stage chip's markup carries the label in an
// attribute, and a rating's carries no number at all.
//
// So this is the plain-text half, and it lives on its own because the PDF, the exported image and
// the on-screen preview must all say the same thing. Three renderers reading one function is the
// only way they stay in agreement.
//
// Pure: no DOM, no state. Anything it cannot resolve on its own -- a member's name, a linked
// record's title -- is passed in.

const str = (v) => String(v ?? '').trim();

/** An options list keyed by id, for the field types that store an id and show a label. */
function optionLabel(field, raw) {
  const options = Array.isArray(field?.config?.options) ? field.config.options : [];
  const found = options.find((option) => option && String(option.id) === String(raw));
  // A value whose option has been deleted shows the raw value rather than nothing: somebody
  // reading the document needs to see that there IS something there.
  return found ? str(found.label) : str(raw);
}

function money(raw, currency) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return '';
  // Intl gives the thousands separators and the right number of decimal places for the currency,
  // which hand-rolling gets wrong for the ones that have none.
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function duration(raw) {
  const total = Math.max(0, Math.round(Number(raw) || 0));
  if (!total) return '';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * One field of the host record, as words.
 *
 * `helpers` supplies what this file cannot know: how a date is written in this company's format,
 * who a member id belongs to, and what a linked record is called.
 */
export function plainFieldText(field, raw, helpers = {}) {
  const {
    formatDate = (v) => str(v), memberName = (id) => str(id), recordTitle = (id) => str(id),
  } = helpers;
  if (raw == null || raw === '') return '';
  const type = str(field?.type) || 'text';

  switch (type) {
    case 'money':
      return money(raw, field?.config?.currency);
    case 'number':
    case 'calculation': {
      const n = Number(raw);
      if (!Number.isFinite(n)) return str(raw);
      const decimals = Number(field?.config?.decimals);
      const fixed = Number.isFinite(decimals) ? n.toFixed(Math.min(6, Math.max(0, decimals))) : String(n);
      return Number(fixed).toLocaleString('en-US', {
        minimumFractionDigits: Number.isFinite(decimals) ? Math.min(6, Math.max(0, decimals)) : 0,
        maximumFractionDigits: Number.isFinite(decimals) ? Math.min(6, Math.max(0, decimals)) : 6,
      });
    }
    case 'progress': {
      const n = Number(raw);
      return Number.isFinite(n) ? `${Math.round(n)}%` : '';
    }
    case 'rating': {
      const n = Math.max(0, Math.min(5, Math.round(Number(raw) || 0)));
      // Written out rather than drawn: a row of star characters depends on a font the PDF has
      // not got, and "4 / 5" reads correctly everywhere.
      return n ? `${n} / 5` : '';
    }
    case 'duration':
      return duration(raw);
    case 'date':
      return formatDate(raw);
    case 'checkbox':
      // An unchecked box is stored as false, so that is a real 'No'. A value that was never set at
      // all is caught by the guard above and prints nothing, which is the difference between "they
      // said no" and "nobody has been asked yet".
      return raw === true || raw === 'true' ? 'Yes' : 'No';
    case 'status':
    case 'category':
      return optionLabel(field, raw);
    case 'tags':
      return (Array.isArray(raw) ? raw : [raw]).map((one) => optionLabel(field, one)).filter(Boolean).join(', ');
    case 'user':
      return (Array.isArray(raw) ? raw : [raw]).map((id) => memberName(id)).filter(Boolean).join(', ');
    case 'relationship':
      return (Array.isArray(raw) ? raw : [raw]).map((id) => recordTitle(id)).filter(Boolean).join(', ');
    case 'company_contact':
      return recordTitle(raw);
    case 'location': {
      // Stored either as a typed address or as a picked place with coordinates; the address is
      // the half a document wants.
      if (typeof raw === 'object') return str(raw.address || raw.label || raw.name);
      return str(raw);
    }
    case 'checklist': {
      const steps = Array.isArray(raw) ? raw : (Array.isArray(raw?.steps) ? raw.steps : []);
      const done = steps.filter((step) => step && (step.done === true || step.checked === true)).length;
      return steps.length ? `${done} of ${steps.length} done` : '';
    }
    case 'file':
    case 'image': {
      const files = Array.isArray(raw) ? raw : [raw];
      return files.map((one) => str(typeof one === 'object' ? one.name : one)).filter(Boolean).join(', ');
    }
    case 'sheet':
    case 'form': {
      // A container inside a container. Its name is the only sensible thing to print.
      const held = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : raw;
      return str(held?.title);
    }
    default:
      if (typeof raw === 'object') return str(raw.label ?? raw.name ?? raw.address ?? '');
      return str(raw);
  }
}

/**
 * Which of a record's fields are worth offering to a document.
 *
 * Everything with words in it, which is nearly everything -- a button has no value and a form
 * would be a document inside a document, so those two are left out. Unlike form-model's
 * importable list, this does not filter by what a FORM FIELD can hold: an element on a page is
 * just text, so a rollup or a relationship prints perfectly well.
 */
export function placeableFields(fields) {
  return (fields || []).filter((field) => field && !['button', 'form'].includes(field.type));
}
