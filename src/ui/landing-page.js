// The signed-out marketing page.
//
// Fetched on demand. It is the largest single view in the app and nobody signed in ever sees
// it, so carrying it in the entry chunk taxed every authenticated page load for a screen
// they had already passed through.
//
// It writes straight into #app rather than returning markup, which is how it was written --
// unchanged here, only moved.

export function createLandingPage(ctx) {
  const {
    activeCompanyId, appHref, companyPath, defaultCompanyId, getRoute, h, normalizeAuthMode, renderAuthModal, renderLandingWorkspaceBoard, safeReturnUrl,
    CONFIG, state, questLogoMarkUrl, questbaseInteriorJobsUrl, app,
  } = ctx;

  function renderLandingPage(forceAuthModal = false) {
    document.title = 'Questbase.io | Connected workspaces for service teams';
    const route = state.route || getRoute();
    const returnUrl = safeReturnUrl(route.params.get('return_url') || appHref(companyPath('jobs', {}, defaultCompanyId())));
    const authEnabled = CONFIG.questAuthEnabled;
    const inviteToken = String(route.params.get('invite') || '').trim();
    const authParam = String(route.params.get('auth') || '').trim();
    const requestedMode = normalizeAuthMode(route.params.get('mode') || authParam, inviteToken);
    if (requestedMode && state.authMode !== requestedMode) state.authMode = requestedMode;
    if (inviteToken && !['signin', 'register'].includes(state.authMode)) state.authMode = 'register';
    const showAuthModal = forceAuthModal || Boolean(inviteToken || authParam);
    const session = state.session;
    app.innerHTML = `
      <main class="qb-landing-shell" data-workspace="sales">
        <nav class="qb-landing-nav" aria-label="Main navigation">
          <div class="qb-landing-wrap qb-landing-nav-inner">
            <a class="qb-landing-brand" href="${appHref('/')}" data-router aria-label="Questbase home">
              <img src="${h(questLogoMarkUrl)}" alt="" />
              <span>Questbase.io</span>
            </a>
            <div class="qb-landing-nav-links">
              <a href="#product">Product</a>
              <a href="#workspaces">Workspaces</a>
              <a href="#features">Why Questbase</a>
            </div>
            <div class="qb-landing-nav-actions">
              ${session ? `
                <a class="qb-landing-button qb-landing-button-primary" href="${appHref(companyPath('jobs', {}, activeCompanyId()))}" data-router>
                  Open workspace<i class="ti ti-arrow-right" aria-hidden="true"></i>
                </a>
              ` : `
                <button class="qb-landing-button qb-landing-button-primary" type="button" data-action="open-auth-modal" data-auth-mode="signin">
                  <i class="ti ti-login" aria-hidden="true"></i>Business login
                </button>
              `}
            </div>
          </div>
        </nav>

        <section class="qb-landing-hero" id="product">
          <div class="qb-landing-wrap qb-landing-hero-grid">
            <div class="qb-landing-hero-copy">
              <span class="qb-landing-eyebrow"><i class="ti ti-sparkles" aria-hidden="true"></i>The operating base for service teams</span>
              <h1>Run every team from one connected base.</h1>
              <p>Give sales, underwriting, production, and management their own focused workspace—without breaking the pipeline that connects the work.</p>
              <div class="qb-landing-hero-actions">
                <button class="qb-landing-button qb-landing-button-primary" type="button" data-action="open-auth-modal" data-auth-mode="register">
                  Start workspace<i class="ti ti-arrow-right" aria-hidden="true"></i>
                </button>
                <a class="qb-landing-button qb-landing-button-secondary" href="#workspaces">
                  <i class="ti ti-player-play-filled" aria-hidden="true"></i>See how it works
                </a>
              </div>
              <div class="qb-landing-proof">
                <div class="qb-landing-avatars" aria-hidden="true"><span>AM</span><span>JS</span><span>RP</span></div>
                <p>Built with operators who already run the work every day.</p>
              </div>
            </div>

            <div class="qb-landing-hero-product" id="workspaces">
              <div class="qb-landing-product-window" aria-label="Interactive Questbase workspace preview">
                <div class="qb-landing-window-bar">
                  <div class="qb-landing-window-brand"><img src="${h(questLogoMarkUrl)}" alt="" /><span>Questbase command center</span></div>
                  <div class="qb-landing-window-tools" aria-hidden="true">
                    <span><i class="ti ti-search"></i></span>
                    <span><i class="ti ti-bell"></i></span>
                    <b><i class="ti ti-plus"></i>Add job</b>
                  </div>
                </div>
                <div class="qb-landing-product-layout">
                  <aside class="qb-landing-product-sidebar" aria-label="Product preview navigation">
                    <div class="qb-landing-company-select">
                      <span><i class="ti ti-building" aria-hidden="true"></i></span>
                      <div><strong>Quest Roofing</strong><small>Main workspace</small></div>
                      <i class="ti ti-chevron-down" aria-hidden="true"></i>
                    </div>
                    <p>Work</p>
                    <span class="qb-landing-side-link"><i class="ti ti-home"></i>Home</span>
                    <span class="qb-landing-side-link"><i class="ti ti-list-check"></i>My tasks<b>3</b></span>
                    <p>Pipeline</p>
                    <span class="qb-landing-side-link"><i class="ti ti-users"></i>Contacts</span>
                    <span class="qb-landing-side-link active"><i class="ti ti-briefcase"></i>Jobs</span>
                    <span class="qb-landing-side-link"><i class="ti ti-calculator"></i>Underwriter</span>
                    <p>Production</p>
                    <span class="qb-landing-side-link"><i class="ti ti-calendar-event"></i>Schedule</span>
                    <span class="qb-landing-side-link"><i class="ti ti-plug"></i>Apps</span>
                  </aside>
                  <section class="qb-landing-product-main">
                    <div class="qb-landing-product-heading">
                      <div>
                        <h2 data-landing-workspace-title>Sales workspace</h2>
                        <p data-landing-workspace-description>Track every opportunity from lead to signed job.</p>
                      </div>
                      <span aria-hidden="true"><i class="ti ti-dots"></i></span>
                    </div>
                    <div class="qb-landing-workspace-switcher" role="tablist" aria-label="Preview a workspace">
                      ${[
                        ['cold-calling', 'ti-phone', 'Cold calling'],
                        ['sales', 'ti-handshake', 'Sales'],
                        ['underwriting', 'ti-calculator', 'Underwriting'],
                        ['production', 'ti-hammer', 'Production'],
                      ].map(([key, icon, label]) => `
                        <button class="qb-landing-workspace-pill ${key === 'sales' ? 'active' : ''}" type="button" role="tab" aria-selected="${key === 'sales'}" data-action="landing-preview-workspace" data-workspace="${h(key)}">
                          <i class="ti ${h(icon)}" aria-hidden="true"></i>${h(label)}
                        </button>
                      `).join('')}
                    </div>
                    <div class="qb-landing-board" data-landing-workspace-board aria-live="polite">${renderLandingWorkspaceBoard('sales')}</div>
                  </section>
                </div>
              </div>
              <div class="qb-landing-live-badge">
                <i class="ti ti-circle-check" aria-hidden="true"></i>
                <span><strong>One live record</strong><small>Every team stays in sync</small></span>
              </div>
            </div>
          </div>
        </section>

        <section class="qb-landing-signal" aria-label="Product benefits">
          <div class="qb-landing-wrap qb-landing-signal-grid">
            <article class="qb-landing-signal-copy"><strong>Not another disconnected tool.</strong><p>Questbase changes shape around the work while the customer record stays whole.</p></article>
            <article><strong>1 company</strong><p>Shared identity and controls</p></article>
            <article><strong>∞ workspaces</strong><p>Configured per team or pipeline</p></article>
            <article><strong>1 source</strong><p>Every handoff remains visible</p></article>
          </div>
        </section>

        <section class="qb-landing-inside">
          <div class="qb-landing-wrap">
            <div class="qb-landing-section-head">
              <div><span class="qb-landing-eyebrow"><i class="ti ti-device-desktop" aria-hidden="true"></i>Product first by design</span><h2>The landing page speaks the same language as the app.</h2></div>
              <p>Light operational surfaces, compact controls, clear hierarchy, and the same warm orange action system users see after sign-in.</p>
            </div>
            <div class="qb-landing-reference-card">
              <div class="qb-landing-reference-bar"><span><i class="ti ti-lock" aria-hidden="true"></i>Questbase workspace · Jobs</span><span>Live product language</span></div>
              <div class="qb-landing-reference-image"><img src="${h(questbaseInteriorJobsUrl)}" alt="Questbase jobs workspace showing its navigation, pipeline lanes, and job cards" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <section class="qb-landing-features" id="features">
          <div class="qb-landing-wrap">
            <div class="qb-landing-section-head">
              <div><span class="qb-landing-eyebrow"><i class="ti ti-plug" aria-hidden="true"></i>One connected system</span><h2>Focused for each role. Connected for the company.</h2></div>
              <p>Teams get the controls they need, owners keep visibility, and records move forward without copy-and-paste handoffs.</p>
            </div>
            <div class="qb-landing-feature-grid">
              ${[
                ['ti-adjustments-horizontal', 'Configure the workspace', 'Choose the pipeline, fields, permissions, and installed apps that fit how each team works.'],
                ['ti-route', 'Connect the handoff', 'Carry the same customer and job context from the first call through production and closeout.'],
                ['ti-eye', 'Keep company visibility', 'Give operators a focused view while management sees progress across every workspace.'],
              ].map(([icon, title, body]) => `
                <article class="qb-landing-feature-card">
                  <span><i class="ti ${h(icon)}" aria-hidden="true"></i></span>
                  <h3>${h(title)}</h3>
                  <p>${h(body)}</p>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="qb-landing-cta" id="access">
          <div class="qb-landing-wrap qb-landing-cta-box">
            <div>
              <span class="qb-landing-eyebrow"><i class="ti ti-rocket" aria-hidden="true"></i>Ready to work</span>
              <h2>Build the base your company runs on.</h2>
              <p>Create a company workspace, sign into an existing one, or join the workspace your team invited you to.</p>
            </div>
            <div class="qb-landing-access-actions">
              ${session ? `
                <a class="qb-landing-button qb-landing-button-primary" href="${appHref(companyPath('jobs', {}, activeCompanyId()))}" data-router>Open workspace<i class="ti ti-arrow-right" aria-hidden="true"></i></a>
              ` : `
                <button class="qb-landing-button qb-landing-button-primary" type="button" data-action="open-auth-modal" data-auth-mode="register">Start workspace<i class="ti ti-arrow-right" aria-hidden="true"></i></button>
                <button class="qb-landing-button qb-landing-button-secondary" type="button" data-action="open-auth-modal" data-auth-mode="signin"><i class="ti ti-login" aria-hidden="true"></i>Business login</button>
                <button class="qb-landing-text-action" type="button" data-action="open-auth-modal" data-auth-mode="invite"><i class="ti ti-user-plus" aria-hidden="true"></i>Join by invite</button>
              `}
            </div>
          </div>
        </section>

        <footer class="qb-landing-footer">
          <div class="qb-landing-wrap">
            <span class="qb-landing-footer-brand"><img src="${h(questLogoMarkUrl)}" alt="" />Questbase.io</span>
            <span>Every team has a place. Every handoff stays connected.</span>
            <span>© 2026 Questbase</span>
          </div>
        </footer>
        ${showAuthModal ? renderAuthModal(returnUrl, inviteToken, authEnabled) : ''}
      </main>
    `;
  }

  return { renderLandingPage };
}
