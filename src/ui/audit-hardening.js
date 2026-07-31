export function compactContactFilterValues(values, query = '', defaultLimit = 7, searchLimit = 20) {
  const unique = [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
  const matching = normalizedQuery
    ? unique.filter((value) => value.toLocaleLowerCase().includes(normalizedQuery))
    : unique;
  const limit = normalizedQuery ? searchLimit : defaultLimit;
  return {
    items: matching.slice(0, limit),
    total: unique.length,
    matchCount: matching.length,
    hiddenCount: Math.max(0, matching.length - limit),
    searchable: unique.length > defaultLimit,
  };
}

export function analyticsJobChoiceLabel(job = {}) {
  const name = String(job.name || '').trim() || 'Untitled job';
  const locationOrClient = String(job.site_address || job.client_name || '').trim();
  const stage = String(job.stage || '').trim();
  return [name, locationOrClient, stage].filter(Boolean).join(' - ');
}
