// Pure helpers for the Knowledge Base — filtering and category rollups. No DOM,
// no app state, so they're unit-tested directly.

/**
 * Articles matching a query — every whitespace-separated word must appear in the
 * title, category or body (case-insensitive). Empty query returns all.
 * @param {Array<{title,category,body}>} articles
 * @param {string} query
 */
export function filterKnowledgeArticles(articles, query) {
  const words = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return (articles || []).slice();
  return (articles || []).filter((a) => {
    const hay = `${a.title || ''} ${a.category || ''} ${a.body || ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** Distinct categories present, sorted, each with its article count. */
export function knowledgeCategories(articles) {
  const counts = new Map();
  for (const a of articles || []) {
    const cat = String(a.category || 'General').trim() || 'General';
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
