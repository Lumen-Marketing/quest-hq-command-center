// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createKnowledgePage(ctx) {
  const {
    can, companyKnowledgeArticles, formatDate, h, knowledgeById, loadKnowledgeArticles, renderKnowledgeArticleForm, state,
  } = ctx;

  function renderKnowledgePage(route, companyId) {
    if (!knowledgeLoadedCompanies.has(companyId)) queueMicrotask(() => loadKnowledgeArticles(companyId).catch(() => {}));
    const canManage = can('files.manage', companyId);
    const all = companyKnowledgeArticles(companyId);
    const ui = state.knowledgeUi;
    const filtered = filterKnowledgeArticles(all, ui.query);
    const activeId = ui.selectedId && filtered.some((a) => a.id === ui.selectedId) ? ui.selectedId : (filtered[0] && filtered[0].id) || '';

    let detail;
    if (canManage && (ui.creating || ui.editingId)) {
      detail = renderKnowledgeArticleForm(companyId, ui.editingId ? knowledgeById(ui.editingId) : null);
    } else {
      const selected = knowledgeById(activeId);
      if (selected) {
        detail = `
          <article class="kb-article panel">
            <div class="kb-article-head">
              <div>
                <span class="kb-cat-tag">${h(selected.category)}</span>
                <h2>${h(selected.title)}</h2>
                <p class="kb-meta">Updated ${h(formatDate(selected.updated_at))}</p>
              </div>
              ${canManage ? `<div class="kb-article-acts">
                <button class="btn" type="button" data-action="kb-edit" data-id="${h(selected.id)}"><i class="ti ti-pencil" aria-hidden="true"></i>Edit</button>
                <button class="btn danger" type="button" data-action="kb-delete" data-id="${h(selected.id)}" aria-label="Delete article"><i class="ti ti-trash" aria-hidden="true"></i></button>
              </div>` : ''}
            </div>
            <div class="kb-body">${h(selected.body).replace(/\n/g, '<br>') || '<span class="muted">No content yet.</span>'}</div>
          </article>`;
      } else {
        detail = `<div class="kb-empty panel">${all.length ? 'No articles match your search.' : ('No articles yet.' + (canManage ? ' Create the first one with “New article”.' : ' Check back soon.'))}</div>`;
      }
    }

    const list = filtered.map((a) => `
      <button type="button" class="kb-list-item${a.id === activeId && !ui.creating && !ui.editingId ? ' active' : ''}" data-action="kb-select" data-id="${h(a.id)}">
        <span class="kb-list-title">${h(a.title)}</span>
        <span class="kb-list-cat">${h(a.category)}</span>
      </button>`).join('');
    // The detail panel already states why the list is empty, so the sidebar stays quiet
    // rather than repeating it next to itself.

    return `
      <section class="kb-page">
        <div class="kb-head">
          <div><h1>Knowledge Base</h1><p class="muted">Company SOPs, processes and reference articles.</p></div>
          ${canManage ? `<button class="btn btn-primary" type="button" data-action="kb-new"><i class="ti ti-plus" aria-hidden="true"></i>New article</button>` : ''}
        </div>
        <div class="kb-grid">
          <aside class="kb-sidebar">
            <div class="kb-search"><i class="ti ti-search" aria-hidden="true"></i><input type="search" data-knowledge-search value="${h(ui.query)}" placeholder="Search articles…" aria-label="Search knowledge base" /></div>
            <div class="kb-list">${list}</div>
          </aside>
          <div class="kb-detail">${detail}</div>
        </div>
      </section>`;
  }

  return { renderKnowledgePage };
}
