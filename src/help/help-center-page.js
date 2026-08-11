import {
  HELP_CATEGORIES,
  filterHelpTopics,
  helpTopicById,
} from '../assistant/help-index.js';

if (typeof document !== 'undefined') void import('./help-center.css');

const QUICK_START_IDS = ['navigate-questbase', 'workspace-setup', 'invite-team', 'contacts'];

export function createHelpCenterPage({
  h,
  appHref,
  companyPath,
  canOpenModule = () => true,
  supportEmail = '',
}) {
  const helpPath = (companyId, params = {}) => appHref(companyPath('help', params, companyId));

  function topicIsAvailable(topic, companyId) {
    return Boolean(topic) && (
      !topic.moduleId
      || canOpenModule(topic.moduleId, topic.permission || '', companyId)
    );
  }

  function categoryLabel(categoryId) {
    return HELP_CATEGORIES.find((category) => category.id === categoryId)?.label || 'Questbase guide';
  }

  function topicHref(topic, companyId, query = '', category = '') {
    const params = { topic: topic.id };
    if (query) params.q = query;
    if (category) params.category = category;
    return helpPath(companyId, params);
  }

  function destinationHref(topic, companyId) {
    if (!topic?.route?.section) return '';
    return appHref(companyPath(topic.route.section, topic.route.params || {}, companyId));
  }

  function supportPanel() {
    const emailAction = supportEmail
      ? `<a class="help-secondary-action" href="mailto:${encodeURIComponent(supportEmail)}"><i class="ti ti-mail" aria-hidden="true"></i> Email support</a>`
      : '';
    return `
      <aside class="help-support-panel" aria-labelledby="help-support-title">
        <div>
          <span class="help-eyebrow">Support</span>
          <h2 id="help-support-title">Still need help?</h2>
          <p>Tell us what happened and Questbase will include the page you were using.</p>
        </div>
        <div class="help-support-actions">
          <button class="btn primary" type="button" data-action="open-support">
            <i class="ti ti-help-circle" aria-hidden="true"></i> Report a problem
          </button>
          ${emailAction}
        </div>
      </aside>`;
  }

  function topicCard(topic, companyId, query = '', category = '', compact = false) {
    return `
      <a class="help-topic-card${compact ? ' is-quick' : ''}" href="${topicHref(topic, companyId, query, category)}" data-router>
        <span class="help-topic-icon"><i class="ti ${topic.kind === 'tutorial' ? 'ti-route' : 'ti-bulb'}" aria-hidden="true"></i></span>
        <span class="help-topic-copy">
          <span class="help-topic-meta">${h(categoryLabel(topic.category))} · ${h(`${topic.readingMinutes || 1} min`)}</span>
          <strong>${h(topic.title)}</strong>
          ${compact ? '' : `<span>${h(topic.answer)}</span>`}
        </span>
        <i class="ti ti-chevron-right help-topic-arrow" aria-hidden="true"></i>
      </a>`;
  }

  function renderUnavailable(companyId) {
    return `
      <section class="help-center-page">
        <div class="help-unavailable panel">
          <span class="help-topic-icon"><i class="ti ti-alert-circle" aria-hidden="true"></i></span>
          <h1>That help article is no longer available</h1>
          <p>It may have moved, or the related tool is not available in this workspace.</p>
          <a class="btn primary" href="${helpPath(companyId)}" data-router>Browse all help</a>
        </div>
        ${supportPanel()}
      </section>`;
  }

  function renderFieldReference(fields = []) {
    if (!fields.length) return '';
    return `
      <section class="help-article-section">
        <h2>Field reference</h2>
        <div class="help-reference-grid">
          ${fields.map((field) => `
            <div class="help-reference-item">
              <strong>${h(field.name)}</strong>
              <span>${h(field.desc)}</span>
            </div>`).join('')}
        </div>
      </section>`;
  }

  function renderAutomationExamples(automations) {
    if (!automations?.rules?.length) return '';
    return `
      <section class="help-article-section">
        <h2>Examples</h2>
        ${automations.intro ? `<p>${h(automations.intro)}</p>` : ''}
        <ul class="help-example-list">
          ${automations.rules.map((rule) => `<li>${h(rule)}</li>`).join('')}
        </ul>
      </section>`;
  }

  function renderTopic(topic, companyId) {
    const destination = destinationHref(topic, companyId);
    const guide = topic.guide || null;
    const backHref = helpPath(companyId);

    return `
      <section class="help-center-page">
        <a class="help-back-link" href="${backHref}" data-router><i class="ti ti-arrow-left" aria-hidden="true"></i> Back to all help</a>
        <article class="help-article">
          <header class="help-article-header">
            <span class="help-eyebrow">${h(categoryLabel(topic.category))}</span>
            <h1 tabindex="-1" data-help-topic-heading>${h(topic.title)}</h1>
            <p>${h(topic.answer)}</p>
            <span class="help-reading-time"><i class="ti ti-clock" aria-hidden="true"></i> ${h(`${topic.readingMinutes || 1} min read`)}</span>
          </header>
          ${guide ? `
            <section class="help-article-section">
              <h2>How to do it</h2>
              ${guide.intro ? `<p>${h(guide.intro)}</p>` : ''}
              <ol class="help-steps">
                ${(guide.steps || []).map((step) => `<li><span>${h(step)}</span></li>`).join('')}
              </ol>
            </section>
            ${renderFieldReference(guide.fields)}
            ${renderAutomationExamples(guide.automations)}
            ${guide.tip ? `
              <aside class="help-tip">
                <i class="ti ti-sparkles" aria-hidden="true"></i>
                <div><strong>Good to know</strong><p>${h(guide.tip)}</p></div>
              </aside>` : ''}
          ` : ''}
          ${destination ? `
            <div class="help-article-actions">
              <a class="btn primary" href="${destination}" data-router>${h(topic.route.label || 'Open in Questbase')} <i class="ti ti-arrow-right" aria-hidden="true"></i></a>
              <a class="btn" href="${backHref}" data-router>Back to all help</a>
            </div>` : `
            <div class="help-article-actions">
              <a class="btn" href="${backHref}" data-router>Back to all help</a>
            </div>`}
        </article>
        ${supportPanel()}
      </section>`;
  }

  function renderBrowse(route, companyId) {
    const query = String(route.params?.get('q') || '').trim();
    const requestedCategory = String(route.params?.get('category') || '');
    const category = HELP_CATEGORIES.some((item) => item.id === requestedCategory) ? requestedCategory : '';
    const canOpen = (moduleId, permission) => canOpenModule(moduleId, permission, companyId);
    const topics = filterHelpTopics({ query, category, canOpenModule: canOpen });
    const quickStarts = QUICK_START_IDS
      .map((id) => helpTopicById(id))
      .filter((topic) => topicIsAvailable(topic, companyId));
    const countLabel = `${topics.length} ${topics.length === 1 ? 'guide' : 'guides'}`;

    return `
      <section class="help-center-page">
        <header class="help-hero">
          <span class="help-eyebrow">Questbase Help Center</span>
          <h1>How can we help?</h1>
          <p>Find a short walkthrough for the workspace you are in. You will only see help for tools your role can open.</p>
          <form class="help-search" role="search" data-help-search-form method="get" action="${helpPath(companyId)}">
            <i class="ti ti-search" aria-hidden="true"></i>
            <label class="sr-only" for="help-search-input">Search Questbase help</label>
            <input id="help-search-input" name="q" type="search" value="${h(query)}" placeholder="Search setup, tasks, invites, files..." aria-label="Search Questbase help" autocomplete="off">
            ${category ? `<input type="hidden" name="category" value="${h(category)}">` : ''}
            <button class="btn primary" type="submit">Search</button>
          </form>
        </header>

        ${!query && !category && quickStarts.length ? `
          <section class="help-section" aria-labelledby="help-quick-title">
            <div class="help-section-heading">
              <div><span class="help-eyebrow">Popular guides</span><h2 id="help-quick-title">Quick starts</h2></div>
            </div>
            <div class="help-quick-grid">
              ${quickStarts.map((topic) => topicCard(topic, companyId, '', '', true)).join('')}
            </div>
          </section>` : ''}

        <section class="help-section" aria-labelledby="help-results-title">
          <div class="help-section-heading help-results-heading">
            <div>
              <span class="help-eyebrow">Browse</span>
              <h2 id="help-results-title">${query ? `Results for “${h(query)}”` : category ? h(categoryLabel(category)) : 'All guides'}</h2>
            </div>
            <span class="help-result-count" role="status" aria-live="polite">${countLabel}</span>
          </div>
          <nav class="help-categories" aria-label="Help categories">
            <a class="help-category-pill${category ? '' : ' is-active'}" href="${helpPath(companyId, query ? { q: query } : {})}" data-router>All</a>
            ${HELP_CATEGORIES.map((item) => {
              const params = { category: item.id };
              if (query) params.q = query;
              return `<a class="help-category-pill${category === item.id ? ' is-active' : ''}" href="${helpPath(companyId, params)}" data-router>${h(item.label)}</a>`;
            }).join('')}
          </nav>
          ${topics.length ? `
            <div class="help-topic-list">
              ${topics.map((topic) => topicCard(topic, companyId, query, category)).join('')}
            </div>` : `
            <div class="help-empty panel">
              <span class="help-topic-icon"><i class="ti ti-search" aria-hidden="true"></i></span>
              <h3>No guide matched “${h(query || categoryLabel(category))}”</h3>
              <p>Try a shorter phrase, choose another category, or browse every guide.</p>
              <a class="btn" href="${helpPath(companyId)}" data-router>Clear search</a>
            </div>`}
        </section>
        ${supportPanel()}
      </section>`;
  }

  function renderHelpCenterPage(route, companyId) {
    const requestedTopicId = String(route?.params?.get('topic') || '');
    if (!requestedTopicId) return renderBrowse(route, companyId);

    const topic = helpTopicById(requestedTopicId);
    if (!topicIsAvailable(topic, companyId)) return renderUnavailable(companyId);
    return renderTopic(topic, companyId);
  }

  return { renderHelpCenterPage };
}
