async function ensureCrmSiteForContact(contact, api) {
  if (!contact?.id) return null;
  const {
    activeWorkspaceId,
    crmSitesForContact,
    emptyToNull,
    normalizeCrmSite,
    SITE_COLS,
    supabaseRow,
    supabaseWrite,
    upsertCrmSite,
  } = api;
  const existing = crmSitesForContact(contact.id).find((site) => site.address || site.roof_system)
    || crmSitesForContact(contact.id)[0];
  if (existing) return existing;
  const site = normalizeCrmSite({
    id: `site-${crypto.randomUUID()}`,
    company_id: contact.company_id,
    workspace_id: contact.workspace_id || activeWorkspaceId(),
    contact_id: contact.id,
    account_id: contact.account_id,
    label: 'Primary site',
    address: contact.location,
    roof_system: contact.roof_system,
    secondary_roof_system: contact.secondary_roof_system,
    has_multiple_roof_systems: contact.has_multiple_roof_systems,
    notes: contact.notes,
  });
  site.updated_at = new Date().toISOString();
  const row = emptyToNull(supabaseRow(site, SITE_COLS), ['contact_id', 'account_id']);
  const { ok, data } = await supabaseWrite('crm_sites', row);
  if (!ok) return false;
  const savedSite = data ? normalizeCrmSite(data) : site;
  upsertCrmSite(savedSite);
  return savedSite;
}

async function convertContactToQuoteLocally(contact, companyId, api) {
  const {
    activeWorkspaceId,
    DEAL_COLS,
    dealStageNames,
    emptyToNull,
    logActivity,
    navigate,
    normalizeDeal,
    pipelineStages,
    showToast,
    state,
    supabaseRow,
    supabaseWrite,
    upsertDeal,
    companyPath,
  } = api;
  const site = await ensureCrmSiteForContact(contact, api);
  if (site === false) return false;
  const deal = normalizeDeal({
    id: `deal-${crypto.randomUUID()}`,
    company_id: companyId,
    workspace_id: contact.workspace_id || activeWorkspaceId(),
    account_id: contact.account_id,
    primary_contact_id: contact.id,
    site_id: site?.id || '',
    name: `${contact.name}${contact.title ? ' - ' + contact.title : ''}`,
    stage: pipelineStages('deals', companyId)[0]?.name || dealStageNames()[0],
    status: 'open',
    value: contact.value,
    owner_name: contact.owner_name,
    source: contact.source,
    notes: contact.notes,
  });
  deal.updated_at = new Date().toISOString();
  const row = emptyToNull(supabaseRow(deal, DEAL_COLS), ['account_id', 'primary_contact_id', 'site_id', 'close_date', 'job_id']);
  const { ok, data, error } = await supabaseWrite('deals', row);
  if (!ok) {
    if (error) api.notifySyncFailure(error, 'Quote conversion');
    return false;
  }
  const savedDeal = normalizeDeal(data || deal);
  upsertDeal(savedDeal);
  await logActivity({
    type: 'system',
    subject: 'Contact graduated -> Quote created',
    body: deal.name,
    related_type: 'contact',
    related_id: contact.id,
    account_id: contact.account_id,
    site_id: site?.id || '',
    deal_id: savedDeal.id,
  });
  state.selectedDealId = savedDeal.id;
  showToast('Contact graduated to quote.', 'local', 'Contacts');
  navigate(companyPath('deals', { tab: 'profile', deal_id: savedDeal.id }, companyId));
  return true;
}

export async function runContactToQuote(contactId, { createAnother = false } = {}, api) {
  const {
    companyPath,
    contactById,
    createSupabaseClient,
    isLiveSupabaseSession,
    navigate,
    normalizeAccount,
    normalizeActivity,
    normalizeContact,
    normalizeCrmSite,
    normalizeDeal,
    notifySyncFailure,
    requirePermission,
    safeSupabaseQuery,
    showToast,
    state,
    upsertAccount,
    upsertActivity,
    upsertContact,
    upsertCrmSite,
    upsertDeal,
  } = api;
  const contact = contactById(contactId);
  if (!contact) return false;
  const companyId = contact.company_id;
  if (!requirePermission('crm.manage', companyId, 'Your role cannot create quotes.', 'Quotes')) return false;
  if (state.contactQuoteConversionInFlight?.[contact.id]) {
    showToast('This quote is already being created.', 'local', 'Quotes');
    return false;
  }

  state.contactQuoteConversionInFlight = {
    ...(state.contactQuoteConversionInFlight || {}),
    [contact.id]: true,
  };

  try {
    if (!isLiveSupabaseSession()) return convertContactToQuoteLocally(contact, companyId, api);

    const client = createSupabaseClient();
    if (!client) {
      showToast('The database connection is unavailable.', 'error', 'Quote conversion failed');
      return false;
    }

    const requestMode = createAnother ? 'another' : 'first';
    const pendingRequest = state.contactQuoteGraduationRequests?.[contact.id];
    const requestId = pendingRequest?.mode === requestMode
      ? pendingRequest.id
      : crypto.randomUUID();
    state.contactQuoteGraduationRequests = {
      ...(state.contactQuoteGraduationRequests || {}),
      [contact.id]: { id: requestId, mode: requestMode },
    };

    const result = await safeSupabaseQuery(client.rpc('convert_contact_to_quote', {
      p_contact_id: contact.id,
      p_request_id: requestId,
    }));
    if (result.error) {
      notifySyncFailure(result.error, 'Quote conversion');
      return false;
    }

    const savedDeal = result.data?.deal ? normalizeDeal(result.data.deal) : null;
    const savedContact = result.data?.contact ? normalizeContact(result.data.contact) : null;
    const savedAccount = result.data?.account ? normalizeAccount(result.data.account) : null;
    const savedSite = result.data?.site ? normalizeCrmSite(result.data.site) : null;
    const savedActivity = result.data?.activity ? normalizeActivity(result.data.activity) : null;
    if (!savedDeal || !savedContact || !savedAccount || !savedSite || !savedActivity) {
      showToast('The server returned an incomplete quote conversion. Retry this action.', 'error', 'Quote conversion failed');
      return false;
    }

    upsertContact(savedContact);
    upsertAccount(savedAccount);
    upsertCrmSite(savedSite);
    upsertDeal(savedDeal);
    upsertActivity(savedActivity);
    delete state.contactQuoteGraduationRequests[contact.id];
    state.selectedDealId = savedDeal.id;
    showToast(result.data?.created === false ? 'Existing quote opened.' : 'Contact graduated to quote.', 'live', 'Contacts');
    navigate(companyPath('deals', { tab: 'profile', deal_id: savedDeal.id }, companyId));
    return true;
  } finally {
    delete state.contactQuoteConversionInFlight[contact.id];
  }
}
