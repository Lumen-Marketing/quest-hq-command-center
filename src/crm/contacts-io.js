// Contacts import and export, fetched on first use: both sit behind a toolbar button and
// nothing that paints before that click needs them.
//
// A factory, because every store, formatter and permission helper belongs to main.js.

import { contactRowsToRecords, parseContactsCsv, toCsv } from '../data/csv.js';

export function createContactsIo(ctx) {
  const {
    activeCompanyId, companyContacts, contactStageNames, downloadText, filteredContacts,
    guardUpload, isLiveSupabaseSession, localIsoDate, normalizeContact, partitionImport,
    persistContact, render, showToast,
  } = ctx;

  /** Rows out of whichever format was handed over, then the same import for both. */
  async function readContactRows(file) {
    if (/\.xlsx$/i.test(file.name)) {
      if (!(await guardUpload(file, 'xlsx', 'Contacts'))) return null;
      const { readXlsxRows } = await import('../data/xlsx-read.js');
      return contactRowsToRecords(await readXlsxRows(file));
    }
    if (!(await guardUpload(file, 'csv', 'Contacts'))) return null;
    return parseContactsCsv(await file.text());
  }

  async function importContactsFile(file) {
    const parsed = await readContactRows(file);
    if (parsed === null) return;
    if (!parsed.length) {
      showToast('No contacts found. The first row should name the columns — Name, Email, Phone.', 'local', 'Contacts');
      return;
    }
    const companyId = activeCompanyId();
    // Skip rows that match a contact already here (by email/phone), and collapse
    // repeats within the file, so import doesn't manufacture duplicates.
    const { toImport, duplicates } = partitionImport(parsed, companyContacts(companyId));
    for (const c of toImport) {
      await persistContact(normalizeContact({ id: `contact-${crypto.randomUUID()}`, company_id: companyId, name: c.name, email: c.email, phone: c.phone, title: c.title, stage: contactStageNames()[0], value: 0 }));
    }
    const skipped = duplicates.length ? `, skipped ${duplicates.length} already in your contacts` : '';
    showToast(`Imported ${toImport.length} contact${toImport.length === 1 ? '' : 's'}${skipped}.`, isLiveSupabaseSession() ? 'live' : 'local', 'Contacts');
    render();
  }

  /**
   * Download the contacts you are looking at.
   *
   * The filtered list, not the whole company: exporting something other than what is on screen
   * is how people end up mailing the wrong list. CSV rather than .xlsx because Excel, Sheets and
   * Numbers all open it, and it needs no library.
   */
  function exportContactsToFile() {
    const companyId = activeCompanyId();
    const contacts = filteredContacts(companyId);
    if (!contacts.length) {
      showToast('Nothing to export — this list is empty.', 'local', 'Contacts');
      return;
    }
    const header = ['Name', 'Email', 'Phone', 'Title', 'Account', 'Stage', 'Owner', 'Value', 'Created'];
    const rows = contacts.map((contact) => [
      contact.name || '',
      contact.email || '',
      contact.phone || '',
      contact.title || '',
      contact.account_name || '',
      contact.stage || '',
      contact.owner_name || '',
      contact.value || 0,
      contact.created_at ? localIsoDate(new Date(contact.created_at)) : '',
    ]);
    downloadText(`contacts-${localIsoDate()}.csv`, toCsv([header, ...rows]), 'text/csv;charset=utf-8');
    showToast(`Exported ${contacts.length} contact${contacts.length === 1 ? '' : 's'}.`, 'local', 'Contacts');
  }

  return { importContactsFile, exportContactsToFile };
}
