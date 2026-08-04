// Logging a spend against a job's cost bucket.
//
// Fetched on demand -- it opens from one button on one tab, and the markup is most of it.
//
// An expense is not a row of its own: it is money added to a bucket, which is what moves the
// projected net. Recording it anywhere else would let the Numbers tab and the receipts
// disagree, and the Numbers tab is the one people decide on.

export function createJobExpense(ctx) {
  const {
    h, money, state, render, renderModalShell, emptyState, showToast, jobById,
    requirePermission, createSupabaseClient, isLiveSupabaseSession, beginSubmitting,
    navigate, companyPath, acceptAttr, uploadJobFile,
  } = ctx;

  /**
   * Log a spend against a cost bucket.
   *
   * An expense is not a row of its own -- it is money added to a bucket, which is what moves
   * the projected net. Recording it anywhere else would mean the Numbers tab and the receipts
   * disagreed, and the Numbers tab is the one people make decisions on.
   *
   * The receipt is optional but goes through the same upload path as job photos, so it lands
   * in the job's files where anyone chasing the number later will look for it.
   */
  function renderModal() {
    const draft = state.jobExpenseDraft;
    const job = draft ? jobById(draft.jobId) : null;
    if (!job) return renderModalShell('Jobs', 'Log spend', emptyState('That job is no longer available.'), 'wb-modal-sm');
    const buckets = state.jobCostBuckets.filter((b) => b.job_id === job.id && b.status !== 'final');
    if (!buckets.length) {
      return renderModalShell('Jobs', 'Log spend',
        emptyState('This job has no open cost buckets. Add one first — a spend has to land somewhere, or it cannot show up in the net.'),
        'wb-modal-sm');
    }
    return renderModalShell('Jobs', 'Log spend', `
      <form class="jd-form" data-job-expense-form>
        <p class="jd-job"><b>${h(job.name)}</b></p>
        <p class="jf-sub">Adds to what that bucket has spent, which is what moves the projected net.</p>
        ${draft.error ? `<div class="wb-modal-error" role="alert">${h(draft.error)}</div>` : ''}
        <label class="jd-why">Which bucket
          <select class="wb-input" name="bucket_id" required>
            ${buckets.map((b) => `<option value="${h(b.id)}">${h(b.name)} — ${h(money(b.spent))} of ${h(money(b.expected))}</option>`).join('')}
          </select>
        </label>
        <label class="jd-why">Amount
          <input class="wb-input" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
        </label>
        <label class="jd-why">What was it <span class="jf-sub">(optional)</span>
          <input class="wb-input" name="note" type="text" placeholder="e.g. 2x6 from the lumber yard" />
        </label>
        <label class="jd-why">Receipt <span class="jf-sub">(optional)</span>
          <input class="wb-input" name="receipt" type="file" accept="${acceptAttr('image')}" capture="environment" />
        </label>
        <div class="modal-actions">
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" type="submit">Log spend</button>
        </div>
      </form>`, 'wb-modal-sm');
  }

  async function submit(formNode) {
    const draft = state.jobExpenseDraft;
    const job = draft ? jobById(draft.jobId) : null;
    if (!job) return;
    if (!requirePermission('jobs.manage', job.company_id, 'Your role cannot log spend.', 'Jobs')) return;

    const data = new FormData(formNode);
    const bucket = state.jobCostBuckets.find((b) => b.id === String(data.get('bucket_id') || ''));
    const amount = Number(data.get('amount') || 0);
    if (!bucket) { draft.error = 'Pick a bucket.'; render(); return; }
    if (!(amount > 0)) { draft.error = 'Enter an amount greater than zero.'; render(); return; }

    const note = String(data.get('note') || '').trim();
    const next = Number(bucket.spent || 0) + amount;
    const done = beginSubmitting(formNode, 'Logging…');
    try {
      const client = createSupabaseClient();
      if (isLiveSupabaseSession() && client) {
        const result = await client.from('job_cost_buckets')
          .update({ spent: next, updated_at: new Date().toISOString() }).eq('id', bucket.id);
        if (result.error) { draft.error = result.error.message || 'Could not log that.'; render(); return; }
      }
      state.jobCostBuckets = state.jobCostBuckets.map((b) => (b.id === bucket.id ? { ...b, spent: next } : b));

      // The receipt is a bonus, not the point. If it fails the spend still stands, and saying so
      // is better than rolling back a number the user watched go in.
      const receipt = data.get('receipt');
      if (receipt && receipt.size) {
        try {
          await uploadJobFile(job, receipt, note || `${bucket.name} spend`, 'Receipt', 'image');
        } catch (error) {
          showToast('Spend logged, but the receipt did not upload.', 'error', 'Jobs');
        }
      }

      state.modal = '';
      state.jobExpenseDraft = null;
      showToast(`${money(amount)} logged to ${bucket.name}.`, isLiveSupabaseSession() ? 'live' : 'local', 'Jobs');
      navigate(companyPath('jobs', { tab: 'profile', job_id: job.id, jt: 'numbers' }, job.company_id), { replace: true });
    } finally {
      if (done) done();
    }
  }

  return { renderModal, submit };
}
