/**
 * Company Contact field definitions are company-scoped and soft-deletable.
 * Keep this filtering in one pure helper so every caller agrees that a deleted
 * definition is recoverable data, not an active form field.
 */
export function activeCompanyContactFields(rows = [], companyId = '') {
  const target = String(companyId || '');
  return (rows || []).filter((field) => (
    String(field?.company_id || '') === target && !field?.deleted_at
  ));
}

/**
 * Replace values for fields that are currently editable without discarding
 * values whose definitions are in the Recycle Bin (or came from an older
 * schema). Restoring a field must restore the answers attached to it too.
 */
export function mergeCompanyContactFieldValues(existingValues = {}, activeFields = [], submittedValues = {}) {
  const existing = existingValues && typeof existingValues === 'object' && !Array.isArray(existingValues)
    ? existingValues
    : {};
  const submitted = submittedValues && typeof submittedValues === 'object' && !Array.isArray(submittedValues)
    ? submittedValues
    : {};
  const activeIds = new Set((activeFields || []).map((field) => String(field?.id || '')).filter(Boolean));
  const merged = Object.fromEntries(
    Object.entries(existing).filter(([fieldId]) => !activeIds.has(String(fieldId))),
  );
  Object.entries(submitted).forEach(([fieldId, value]) => {
    if (activeIds.has(String(fieldId)) && value !== undefined && value !== null && value !== '') {
      merged[fieldId] = value;
    }
  });
  return merged;
}

/**
 * Move removed definitions through the same audited Recycle Bin operation used
 * by jobs, contacts, files and the rest of the product. IDs are de-duplicated so
 * a repeated UI event cannot create two ledger entries for one field.
 */
export async function recycleCompanyContactFieldDefinitions(fieldIds = [], recycleDeleteRecord) {
  if (typeof recycleDeleteRecord !== 'function') return { ok: false, items: [], remainingIds: [] };
  const ids = [...new Set((fieldIds || []).map((id) => String(id || '')).filter(Boolean))];
  const items = [];
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const item = await recycleDeleteRecord({ type: 'company_contact_field', id, options: { silent: true } });
    if (!item) return { ok: false, items, remainingIds: ids.slice(index) };
    items.push(item);
  }
  return { ok: true, items, remainingIds: [] };
}
