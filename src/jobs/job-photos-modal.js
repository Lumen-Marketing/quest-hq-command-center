// Job photos, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createJobPhotosModal(ctx) {
  const {
    JOB_PHOTO_CATEGORIES, acceptAttr, appHref, can, companyName, companyPath,
    emptyState, ensureFileThumbnails, field, fileThumb, h, jobPhotosFor,
    renderModalShell, selectField, state,
  } = ctx;

  function renderJobPhotosModal(companyId, job) {
    if (!job || job.company_id !== companyId) return renderModalShell('Job photos', 'Job unavailable', emptyState('This job is no longer available.'));
    const canManagePhotos = can('files.manage', companyId);
    const allPhotos = jobPhotosFor(job.id, companyId);
    const filter = state.jobPhotoCategory || 'All';
    const photos = filter === 'All' ? allPhotos : allPhotos.filter((file) => file.category === filter);
    ensureFileThumbnails(photos);
    return `
      <div class="modal-overlay">
        <div class="modal-panel job-photos-modal" role="dialog" aria-modal="true" aria-labelledby="job-photos-title">
          <div class="modal-head">
            <div><div class="eyebrow">${h(job.name)}</div><h2 id="job-photos-title">Job photos</h2><p>${h(job.site_address || job.client_name || companyName(companyId))}</p></div>
            <button class="btn" type="button" data-action="close-modal">Close</button>
          </div>
          <div class="job-photos-shell">
            <form class="job-photo-uploader" data-job-photo-form>
              <fieldset class="job-photo-upload-fields" ${canManagePhotos ? '' : 'disabled'}>
              <input type="hidden" name="job_id" value="${h(job.id)}" />
              <div class="job-photo-drop span-2">
                <label class="job-photo-capture">
                  <i class="ti ti-camera"></i><span><strong>Take a photo</strong><small>Opens the rear camera on supported phones.</small></span>
                  <input name="camera" type="file" accept="${acceptAttr('image')}" capture="environment" />
                </label>
                <label class="job-photo-capture">
                  <i class="ti ti-photo"></i><span><strong>Add from device</strong><small>Select several job photos at once.</small></span>
                  <input name="photos" type="file" multiple accept="${acceptAttr('image')}" />
                </label>
              </div>
              ${selectField('Photo type', 'category', 'Inspection', JOB_PHOTO_CATEGORIES.map((item) => [item, item]))}
              ${field('Caption', 'notes', '', false, 'text')}
              <div class="form-actions span-2">
                <button class="btn btn-primary" type="submit" data-job-photo-submit ${canManagePhotos ? '' : 'disabled'}><i class="ti ti-cloud-upload"></i>Upload photos</button>
                <span class="form-note">${canManagePhotos ? 'Images stay inside this job and the company workspace.' : 'Your role has view-only access to job photos.'}</span>
              </div>
              <div class="upload-progress span-2" data-job-photo-progress hidden><div class="upload-progress-bar" data-job-photo-bar></div></div>
              </fieldset>
            </form>
            <section class="job-photo-library">
              <div class="job-photo-library-head">
                <div><strong>${allPhotos.length} photo${allPhotos.length === 1 ? '' : 's'}</strong><span>Before, damage, progress, and closeout evidence.</span></div>
                <a class="btn btn-compact" href="${appHref(companyPath('files', { folder: 'jobs', job_id: job.id }, companyId))}" data-router><i class="ti ti-folder"></i>Open drive</a>
              </div>
              <div class="job-photo-filters" role="group" aria-label="Photo type">
                ${['All', ...JOB_PHOTO_CATEGORIES].map((item) => `<button class="${filter === item ? 'active' : ''}" type="button" data-action="set-job-photo-filter" data-category="${h(item)}">${h(item)}</button>`).join('')}
              </div>
              <div class="job-photo-gallery">
                ${photos.map((file) => `
                  <button type="button" class="job-photo-card" data-action="select-file" data-file-id="${h(file.id)}">
                    <span class="job-photo-image">${fileThumb(file)}</span>
                    <span><strong>${h(file.category || 'Photo')}</strong><small>${h(file.notes || file.file_name)}</small></span>
                  </button>
                `).join('') || `<div class="job-photo-empty"><i class="ti ti-camera"></i><strong>No ${filter === 'All' ? '' : h(filter.toLowerCase() + ' ')}photos yet</strong><span>Capture the first photo without leaving this job.</span></div>`}
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  return { renderJobPhotosModal };
}
