// The contact create/edit form.
//
// Fetched on demand: it only exists once someone opens the form, and every list, board and
// record page paints without it.
//
// A factory -- the field builders and option lists belong to main.js. The body is unchanged
// from where it lived there.

import { contactUsesRoofFields } from './contact-field-visibility.js';
import { renderSearchCombobox } from '../ui/combobox-menu.js';

export function createContactEditor(ctx) {
  const {
    h, field, selectField, textareaField, blankContact, TEMPERATURES,
    protectedFormDraftAttributes, renderProtectedFormDraftStrip, activeWorkspaceId,
    allowedCompanies, companyLabel, companyAccounts, contactJobTypeOptions,
    contactStageNames, contactOwnerOptions, contactRoofSystemSelectOptions, contactSourceOptions,
  } = ctx;

  function renderContactEditor(companyId, contact) {
    const edit = contact || blankContact(companyId);
    const showRoofFields = contactUsesRoofFields(edit);
    return `
      <form class="job-editor contact-editor" data-contact-form data-contact-address-form ${protectedFormDraftAttributes('contact', edit.id || 'new', companyId, edit.workspace_id || activeWorkspaceId())}>
        <input type="hidden" name="id" value="${h(edit.id || '')}" />
        <div class="section-head span-2">
          <div><h2>${contact ? 'Edit contact' : 'New contact'}</h2><p>Contacts move through Prospects, Leads, and Nurturing before quote handoff.</p></div>
        </div>
        ${renderProtectedFormDraftStrip()}
        ${field('Name', 'name', edit.name, true)}
        ${selectField('Company', 'company_id', companyId, allowedCompanies().map((company) => [company.id, companyLabel(company)]))}
        ${selectField('Account', 'account_id', edit.account_id, [['', '- None -']].concat(companyAccounts(companyId).map((account) => [account.id, account.name])))}
        ${renderSearchCombobox(h, 'Job type', 'title', edit.title, contactJobTypeOptions(companyId), { placeholder: 'Type or choose job type' })}
        ${field('Email', 'email', edit.email, false, 'email')}
        <label class="span-2">
          <span>Phone</span>
          <div class="qc-phone-row">
            <div class="qc-combo" id="qc-phone-combo">
              <button type="button" class="qc-combo-trigger" id="qc-phone-trigger" aria-haspopup="listbox" aria-expanded="false">
                <img id="qc-phone-flag" alt="" src="https://flagcdn.com/us.svg" />
                <span class="qc-dial" id="qc-phone-dial">${h(edit.country_code || '+1')}</span>
                <i class="ti ti-chevron-down"></i>
              </button>
              <div class="qc-combo-panel">
                <input type="text" class="qc-combo-search" id="qc-phone-search" placeholder="Search country or code..." autocomplete="off" />
                <ul class="qc-combo-list" id="qc-phone-list" role="listbox"></ul>
              </div>
            </div>
            <input type="hidden" name="country_code" id="qc-country-code" value="${h(edit.country_code || '')}" />
            <input type="tel" name="phone" id="qc-phone-number" value="${h(edit.phone || '')}" placeholder="555 123 4567" autocomplete="tel" inputmode="tel" data-phone-format />
          </div>
        </label>
        <fieldset class="qc-fieldset span-2 qc-fs-map">
          <legend><i class="ti ti-map-pin"></i> Pinpoint location</legend>
          <div class="qc-map-tools">
            <label class="qc-map-search">
              <i class="ti ti-search"></i>
              <input type="text" id="qc-addr-search" placeholder="Search an address to drop a pin..." autocomplete="off" />
            </label>
            <button type="button" class="btn" id="qc-gps-btn"><i class="ti ti-current-location"></i> Use my location</button>
          </div>
          <div id="qc-contact-map" class="qc-map"></div>
          <div class="qc-map-status" id="qc-map-status"><span class="qc-spinner"></span> Resolving address from coordinates...</div>
          <div class="qc-coords" id="qc-coords-text">Click the map or drag the pin for a precise location.</div>
          <input type="hidden" name="lat" id="qc-lat" value="${h(edit.lat || '')}" />
          <input type="hidden" name="lng" id="qc-lng" value="${h(edit.lng || '')}" />
        </fieldset>
        <fieldset class="qc-fieldset span-2 qc-fs-address">
          <legend><i class="ti ti-building-community"></i> Address</legend>
          <div class="qc-address-grid">
            <label>
              <span>Country</span>
              <select id="qc-country"><option value="">Loading countries...</option></select>
            </label>
            <label>
              <span>Province / State</span>
              <select id="qc-province" disabled><option value="">Select country first</option></select>
            </label>
            <label>
              <span>City / Municipality</span>
              <select id="qc-city" disabled><option value="">Select province first</option></select>
            </label>
            <label id="qc-brgy-field">
              <span>Barangay / Neighborhood</span>
              <select id="qc-brgy-select" disabled hidden><option value="">Select city first</option></select>
              <input type="text" id="qc-brgy-text" placeholder="District / suburb (optional)" autocomplete="off" />
            </label>
            <label>
              <span>Street name</span>
              <input type="text" name="street" id="qc-street" value="${h(edit.street || '')}" placeholder="e.g. Main Street" autocomplete="off" />
            </label>
            <label>
              <span>Block / House / Unit no.</span>
              <input type="text" name="block_no" id="qc-block" value="${h(edit.block_no || '')}" placeholder="e.g. Unit 5B" autocomplete="off" />
            </label>
            <label class="span-2">
              <span>Postal / Zip code</span>
              <input type="text" name="zip" id="qc-zip" value="${h(edit.zip || '')}" placeholder="e.g. 85001" autocomplete="off" />
            </label>
          </div>
          <input type="hidden" name="country" id="qc-country-hidden" value="${h(edit.country || '')}" />
          <input type="hidden" name="province" id="qc-province-hidden" value="${h(edit.province || '')}" />
          <input type="hidden" name="city" id="qc-city-hidden" value="${h(edit.city || '')}" />
          <input type="hidden" name="barangay" id="qc-brgy-hidden" value="${h(edit.barangay || '')}" />
          <input type="hidden" name="location" id="qc-location" value="${h(edit.location || '')}" />
        </fieldset>
        ${selectField('Stage', 'stage', edit.stage || contactStageNames()[0], contactStageNames().map((stage) => [stage, stage]))}
        ${selectField('Owner', 'owner_name', edit.owner_name, contactOwnerOptions(companyId, edit.owner_name))}
        ${field('Estimated value', 'value', edit.value || 0, false, 'number')}
        ${selectField('Temperature', 'temperature', edit.temperature || 'Warm', TEMPERATURES.map((t) => [t, t]))}
        ${field('Pay type', 'pay_type', edit.pay_type)}
        <div class="contact-roof-fields span-2" data-contact-roof-fields ${showRoofFields ? '' : 'hidden'}>
          ${selectField('Roof system', 'roof_system', edit.roof_system, contactRoofSystemSelectOptions(companyId))}
          <label class="checkbox-field"><span>Multiple roof systems?</span><input name="has_multiple_roof_systems" type="checkbox" ${edit.has_multiple_roof_systems ? 'checked' : ''} /></label>
          ${selectField('Secondary roof system', 'secondary_roof_system', edit.secondary_roof_system, contactRoofSystemSelectOptions(companyId, true))}
        </div>
        ${selectField('Source', 'source', edit.source, contactSourceOptions(companyId))}
        ${textareaField('Notes', 'notes', edit.notes, 'span-2')}
        <div class="form-actions span-2">
          <button class="btn btn-primary" type="submit">Save contact</button>
          ${contact ? `<button class="btn danger" type="button" data-action="delete-contact" data-contact-id="${h(contact.id)}">Delete</button>` : ''}
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </div>
      </form>
    `;
  }

  return { renderContactEditor };
}
