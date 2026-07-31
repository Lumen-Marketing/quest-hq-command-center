// Contact -> quote -> job handoff review.
//
// New conversions are atomic and idempotent, so they cannot create these problems any
// more. Records created before that landed still can, and the release checklist requires
// that existing data be repaired only after human review — so this screen reports and
// links, and deliberately offers no "fix all" button. A bulk rewrite of pilot data is
// exactly the kind of irreversible action a person should take one record at a time.
//
// Detection runs over records already in memory; it issues no queries of its own.
//
// Loaded on demand: an admin-only review surface has no business in the entry chunk.

export const HANDOFF_CHECKS = [
  {
    id: 'duplicate-quotes',
    label: 'Contacts with more than one quote',
    detail: 'A repeated Graduate to quote could produce these before conversion became idempotent. Keep the real one; the rest are usually duplicates.',
    severity: 'review',
  },
  {
    id: 'quote-missing-account',
    label: 'Quotes with no account',
    detail: 'The quote is not attached to a customer account, so it will not appear in that account’s history.',
    severity: 'incomplete',
  },
  {
    id: 'quote-missing-contact',
    label: 'Quotes with no primary contact',
    detail: 'Nobody to follow up with from the quote itself.',
    severity: 'incomplete',
  },
  {
    id: 'job-missing-quote',
    label: 'Jobs with no originating quote',
    detail: 'The job has no quote behind it, so priced scope and the job are not linked.',
    severity: 'incomplete',
  },
  {
    id: 'job-missing-contact',
    label: 'Jobs with no contact',
    detail: 'Crew and scheduling have no customer to reach from the job.',
    severity: 'incomplete',
  },
];

// Pure: takes the records, returns findings. Kept separate from rendering so the rules
// can be tested directly rather than through markup.
export function findHandoffIssues({ contacts = [], deals = [], jobs = [] } = {}) {
  const byCheck = new Map(HANDOFF_CHECKS.map((check) => [check.id, []]));
  const contactName = new Map(contacts.map((contact) => [contact.id, contact.name || contact.id]));

  const quotesByContact = new Map();
  for (const deal of deals) {
    if (!deal.primary_contact_id) continue;
    const list = quotesByContact.get(deal.primary_contact_id) || [];
    list.push(deal);
    quotesByContact.set(deal.primary_contact_id, list);
  }
  for (const [contactId, quotes] of quotesByContact) {
    if (quotes.length < 2) continue;
    byCheck.get('duplicate-quotes').push({
      id: contactId,
      title: contactName.get(contactId) || contactId,
      note: `${quotes.length} quotes: ${quotes.map((quote) => quote.name || quote.id).join(', ')}`,
      kind: 'contact',
    });
  }

  for (const deal of deals) {
    if (!deal.account_id) {
      byCheck.get('quote-missing-account').push({ id: deal.id, title: deal.name || deal.id, note: 'No account linked', kind: 'deal' });
    }
    if (!deal.primary_contact_id) {
      byCheck.get('quote-missing-contact').push({ id: deal.id, title: deal.name || deal.id, note: 'No primary contact', kind: 'deal' });
    }
  }

  for (const job of jobs) {
    if (!job.deal_id) {
      byCheck.get('job-missing-quote').push({ id: job.id, title: job.name || job.id, note: 'No originating quote', kind: 'job' });
    }
    if (!job.contact_id) {
      byCheck.get('job-missing-contact').push({ id: job.id, title: job.name || job.id, note: job.contact_name ? `Only a name: ${job.contact_name}` : 'No contact', kind: 'job' });
    }
  }

  return HANDOFF_CHECKS.map((check) => ({ ...check, items: byCheck.get(check.id) || [] }));
}

export function renderHandoffReview({ findings, companyLabel, h, emptyState, metricCard, hrefFor }) {
  const total = findings.reduce((sum, group) => sum + group.items.length, 0);
  const affectedGroups = findings.filter((group) => group.items.length);

  return `
    <article class="panel span-3 handoff-review">
      <div class="section-head">
        <div>
          <h2>Handoff review</h2>
          <p>Contact to quote to job links in ${h(companyLabel)} that look duplicated or incomplete.</p>
        </div>
      </div>
      <section class="metric-grid">
        ${metricCard('Records to review', String(total))}
        ${metricCard('Checks run', String(findings.length))}
        ${metricCard('Checks with findings', String(affectedGroups.length))}
      </section>
      ${total === 0
        ? emptyState('No duplicate or incomplete handoffs found. Nothing to repair.')
        : `
        <p class="handoff-note">
          Nothing here is changed automatically. Open each record and decide — a bulk repair of
          historic data cannot be undone.
        </p>
        ${affectedGroups.map((group) => `
          <section class="handoff-group">
            <div class="handoff-group-head">
              <strong>${h(group.label)}</strong>
              <b class="status-pill ${group.severity === 'review' ? 'pending' : 'muted'}">${group.items.length}</b>
            </div>
            <p class="handoff-detail">${h(group.detail)}</p>
            <div class="contract-rows">
              ${group.items.slice(0, 25).map((item) => `
                <div>
                  <span>${h(item.note)}</span>
                  <strong>${hrefFor(item) ? `<a href="${h(hrefFor(item))}" data-router>${h(item.title)}</a>` : h(item.title)}</strong>
                </div>
              `).join('')}
            </div>
            ${group.items.length > 25 ? `<p class="handoff-detail">Showing the first 25 of ${group.items.length}.</p>` : ''}
          </section>
        `).join('')}
      `}
    </article>
  `;
}
