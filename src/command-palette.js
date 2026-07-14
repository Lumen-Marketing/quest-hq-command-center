// Command palette — pure indexing and matching logic.
//
// This module knows nothing about the DOM, routing, or app state. It turns a
// set of sources (navigable modules, switchable companies, quick actions) into a
// flat command list, and ranks that list against a typed query. main.js owns the
// overlay, keyboard wiring, and turning a chosen command's `run` descriptor into
// real navigation — so all of the fiddly matching logic here can be unit-tested
// in isolation.
//
// A command:
//   { id, group, label, hint, icon, keywords, run }
// where `run` is an opaque descriptor the caller interprets, e.g.
//   { kind: 'navigate', section: 'jobs' }
//   { kind: 'company',  companyId: 'lumen' }
//   { kind: 'action',   action: 'open-quick-add', data: { type: 'contact' } }

/**
 * Build the flat command list from already-permission-filtered sources.
 * Callers pass ONLY the modules/companies/actions the current user may use —
 * this function does no access control of its own.
 */
export function buildCommandIndex({ modules = [], companies = [], actions = [], activeCompanyId = '' } = {}) {
  const commands = [];

  for (const module of modules) {
    commands.push({
      id: `nav:${module.id}`,
      group: 'Go to',
      label: module.label,
      hint: module.group || '',
      icon: module.icon || 'ti-arrow-right',
      keywords: `${module.id} ${module.group || ''} open view`,
      run: { kind: 'navigate', section: module.id },
    });
  }

  for (const company of companies) {
    const isActive = company.id === activeCompanyId;
    commands.push({
      id: `co:${company.id}`,
      group: 'Switch workspace',
      label: company.name || company.id,
      hint: isActive ? 'Current' : '',
      icon: 'ti-building-community',
      keywords: `${company.id} workspace company switch`,
      // Selecting the active company is a no-op the caller can skip.
      run: { kind: 'company', companyId: company.id, noop: isActive },
    });
  }

  for (const action of actions) {
    commands.push({
      id: `act:${action.id}`,
      group: 'Actions',
      label: action.label,
      hint: action.hint || '',
      icon: action.icon || 'ti-bolt',
      keywords: action.keywords || '',
      run: { kind: 'action', action: action.action, data: action.data || {} },
    });
  }

  return commands;
}

/**
 * Score one command against a lowercased query. Higher is better; null means the
 * query is not even a subsequence of the command's searchable text, so it should
 * be dropped entirely.
 *
 * Tiers, best to worst:
 *   - label starts with the query          (a "jo" -> "Jobs")
 *   - a word in the label starts with it    ("con" -> "New contact")
 *   - label contains it anywhere
 *   - keywords contain it
 *   - query is a scattered subsequence      ("nc" -> "New contact")
 */
export function scoreCommand(command, query) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const label = command.label.toLowerCase();
  const keywords = (command.keywords || '').toLowerCase();

  if (label.startsWith(q)) return 1000 - label.length;
  if (label.split(/[\s-]+/).some((word) => word.startsWith(q))) return 800 - label.length;
  if (label.includes(q)) return 600 - label.indexOf(q);
  if (keywords.includes(q)) return 400;

  const sub = subsequenceScore(`${label} ${keywords}`, q);
  return sub === null ? null : 200 + sub;
}

// Reward subsequence matches whose characters land close together (tighter runs
// read as more relevant than characters scattered across the whole string).
function subsequenceScore(text, query) {
  let ti = 0;
  let lastHit = -1;
  let gaps = 0;
  for (let qi = 0; qi < query.length; qi++) {
    const ch = query[qi];
    let found = -1;
    for (let j = ti; j < text.length; j++) {
      if (text[j] === ch) { found = j; break; }
    }
    if (found === -1) return null;
    if (lastHit !== -1) gaps += found - lastHit - 1;
    lastHit = found;
    ti = found + 1;
  }
  return Math.max(0, 100 - gaps);
}

/**
 * Rank the command list for a query. Empty query keeps source order (a menu of
 * everything available); a non-empty query filters to matches, best first, with
 * source order as a stable tiebreak.
 */
export function filterCommands(commands, query) {
  if (!query || !query.trim()) return commands.slice();

  return commands
    .map((command, index) => ({ command, index, score: scoreCommand(command, query) }))
    .filter((entry) => entry.score !== null)
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((entry) => entry.command);
}

/** Group an ordered command list into [{ group, items }], preserving order. */
export function groupCommands(commands) {
  const groups = [];
  const byName = new Map();
  for (const command of commands) {
    let bucket = byName.get(command.group);
    if (!bucket) {
      bucket = { group: command.group, items: [] };
      byName.set(command.group, bucket);
      groups.push(bucket);
    }
    bucket.items.push(command);
  }
  return groups;
}
