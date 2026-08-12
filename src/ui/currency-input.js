export function parseCurrencyAmount(value) {
  const raw = String(value ?? '').replace(/[^0-9.]/g, '');
  const dot = raw.indexOf('.');
  const clean = dot < 0
    ? raw
    : `${raw.slice(0, dot)}.${raw.slice(dot + 1).replace(/\./g, '')}`;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyDraft(value) {
  const raw = String(value ?? '').replace(/[^0-9.]/g, '');
  if (!raw) return '';
  const dot = raw.indexOf('.');
  const integerRaw = (dot < 0 ? raw : raw.slice(0, dot)).replace(/^0+(?=\d)/, '') || '0';
  const decimals = dot < 0 ? '' : raw.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  const integer = integerRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${integer}${dot < 0 ? '' : `.${decimals}`}`;
}
