// Portal, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createPortalDetail(ctx) {
  const {
    CP_STATUS_META, clientPortalAnnotationsForDocument, clientPortalAnnotationsForPortal, clientPortalEventsForPortal, clientPortalPublicLink, cpEventMeta,
    cpTimeAgo, currentVersionOf, emptyState, fileTypeBadge, formatBytes, h,
    portalDocumentGroups, renderClientPortalMarkCard, titleCase,
  } = ctx;

  function renderClientPortalDetail(portal, canManagePortals) {
    const groups = portalDocumentGroups(portal.id);
    const annotations = clientPortalAnnotationsForPortal(portal.id);
    const guestMarks = annotations.filter((annotation) => (annotation.payload?.author || (annotation.guest_name ? 'guest' : 'draft')) === 'guest');
    const events = clientPortalEventsForPortal(portal.id);
    const revoked = portal.status === 'revoked';
    const link = clientPortalPublicLink(portal);
    return `
      <div class="client-portal-head">
        <div>
          <div class="eyebrow">Client Portal</div>
          <h2>${h(portal.title)}</h2>
          <p>${h(portal.client_name || 'External reviewer')} / ${h(portal.client_email || 'No email saved')}</p>
        </div>
        <span class="status-pill ${h(portal.status)}">${h(titleCase(portal.status))}</span>
      </div>
      <div class="forms-summary-share compact">
        <strong>Portal link</strong>
        <input readonly value="${revoked ? '— link revoked —' : h(link)}" />
        <button class="btn" type="button" data-action="copy-client-portal-link" data-portal-id="${h(portal.id)}" ${revoked ? 'disabled' : ''}><i class="ti ti-copy"></i>Copy link</button>
        ${canManagePortals ? `<button class="btn" type="button" data-action="regenerate-client-portal-link" data-portal-id="${h(portal.id)}"><i class="ti ti-refresh"></i>Regenerate</button>` : ''}
        ${canManagePortals && !revoked ? `<button class="btn danger" type="button" data-action="revoke-client-portal" data-portal-id="${h(portal.id)}"><i class="ti ti-ban"></i>Revoke</button>` : ''}
        ${canManagePortals && revoked ? `<button class="btn" type="button" data-action="restore-client-portal" data-portal-id="${h(portal.id)}"><i class="ti ti-rotate"></i>Reactivate</button>` : ''}
      </div>
      ${canManagePortals ? `
        <div class="client-portal-actionbar">
          <button class="btn btn-primary" type="button" data-action="open-client-portal-document-form" data-portal-id="${h(portal.id)}"><i class="ti ti-upload"></i>Upload plan set</button>
          <button class="btn" type="button" data-action="open-client-portal-form" data-portal-id="${h(portal.id)}"><i class="ti ti-key"></i>Edit details</button>
          ${!revoked ? `<button class="btn" type="button" data-action="copy-client-portal-link" data-portal-id="${h(portal.id)}"><i class="ti ti-external-link"></i>Open client view</button>` : ''}
          <button class="btn danger" type="button" data-action="delete-client-portal" data-portal-id="${h(portal.id)}"><i class="ti ti-trash"></i>Delete</button>
        </div>
      ` : ''}
      <div class="client-portal-detail-grid">
        <article>
          <div class="section-head"><div><h2>Documents</h2><p>PDF, PNG, and JPG plan sets. DWG should be exported to PDF first.</p></div></div>
          ${canManagePortals ? `<button class="cp-dropzone" type="button" data-action="open-client-portal-document-form" data-portal-id="${h(portal.id)}"><i class="ti ti-cloud-upload"></i><strong>Click or drop to upload plan set</strong><small>PDF · PNG · JPG · multiple files</small></button>` : ''}
          <div class="client-portal-doc-list">
            ${groups.map((versions) => {
              const doc = currentVersionOf(versions);
              const meta = CP_STATUS_META[doc.review_status] || CP_STATUS_META.pending;
              const marks = clientPortalAnnotationsForDocument(doc.id).length;
              return `
                <button class="client-portal-doc-row" type="button" data-action="cp-open-document-page" data-portal-id="${h(portal.id)}" data-document-id="${h(doc.id)}">
                  ${fileTypeBadge({ file_name: doc.file_name, mime_type: doc.mime_type })}
                  <span><strong>${h(doc.file_name)}</strong><small>${versions.length > 1 ? `v${doc.version_number} · ` : ''}${formatBytes(doc.size_bytes)} · ${marks} mark${marks === 1 ? '' : 's'}</small></span>
                  <span class="status-pill sm ${h(doc.review_status)}"><i class="ti ${meta.icon}"></i>${h(meta.label)}</span>
                  <i class="ti ti-chevron-right cp-row-chevron"></i>
                </button>`;
            }).join('') || emptyState('No plan documents uploaded.')}
          </div>
        </article>
        <article>
          <div class="section-head"><div><h2>Guest markups</h2><p>${guestMarks.length} client annotation${guestMarks.length === 1 ? '' : 's'}.</p></div></div>
          <div class="client-portal-annotation-list">
            ${guestMarks.slice(0, 8).map((annotation) => renderClientPortalMarkCard(annotation)).join('') || emptyState('No guest markups yet.')}
          </div>
        </article>
      </div>
      <section class="client-portal-events">
        <div class="section-head"><div><h2>Activity</h2><p>${events.length} portal event${events.length === 1 ? '' : 's'}.</p></div></div>
        <div class="cp-activity">
          ${events.slice(0, 14).map((event) => {
            const meta = cpEventMeta(event);
            return `<div class="cp-activity-row">
              <span class="cp-activity-ico"><i class="ti ${meta.icon}"></i></span>
              <div class="cp-activity-meta"><p><b>${h(meta.actor)}</b> ${h(meta.text)}</p><small>${cpTimeAgo(event.created_at)}</small></div>
            </div>`;
          }).join('') || emptyState('No portal activity yet.')}
        </div>
      </section>
    `;
  }

  return { renderClientPortalDetail };
}
