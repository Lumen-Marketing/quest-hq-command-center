// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createFormsPage(ctx) {
  const {
    filteredForms, h, isLiveSupabaseSession, renderFormsBuilder, renderFormsLibrary, renderFormsResponses, selectedForm, titleCase, state,
  } = ctx;

  function renderFormsPage(companyId) {
    const routeTab = state.route?.params?.get('tab');
    if (routeTab === 'responses') state.formsTab = 'responses';
    if (routeTab === 'library') state.formsTab = 'library';
    const forms = filteredForms(companyId);
    const current = selectedForm(companyId);
    const activeTab = state.formsTab === 'builder' && current ? 'builder' : state.formsTab === 'responses' ? 'responses' : 'library';
    const formsSyncLabel = state.sync?.label || (isLiveSupabaseSession() ? 'Supabase live' : 'Local draft');
    const formsSyncMode = state.sync?.mode || (isLiveSupabaseSession() ? 'live' : 'local');
    return `
      <section class="tool-page forms-center">
        <div class="forms-command panel">
          <span class="sync-pill ${h(formsSyncMode)}"><i class="ti ti-device-floppy"></i>${h(formsSyncLabel)}</span>
          <label>
            <span>Search</span>
            <input data-form-search value="${h(state.formQuery)}" placeholder="Find form, audience, or job" />
          </label>
          <button class="btn" type="button" data-action="open-forms-tools"><i class="ti ti-adjustments"></i>Tools</button>
          <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
        </div>
        ${activeTab === 'builder' ? '' : `
          <nav class="tabbar forms-tabs" aria-label="Forms workspace">
            ${['library', 'responses'].map((tab) => `
              <button class="${activeTab === tab ? 'active' : ''}" type="button" data-action="set-forms-tab" data-tab="${h(tab)}">${h(titleCase(tab))}</button>
            `).join('')}
          </nav>
        `}
        ${activeTab === 'library' ? renderFormsLibrary(companyId, forms, current) : ''}
        ${activeTab === 'builder' ? renderFormsBuilder(companyId, current) : ''}
        ${activeTab === 'responses' ? renderFormsResponses(companyId, current) : ''}
      </section>
    `;
  }

  return { renderFormsPage };
}
