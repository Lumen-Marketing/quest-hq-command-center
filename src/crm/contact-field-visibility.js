const ROOFING_WORK = /\b(roof|roofing|reroof|re-roof|shingle|underlayment)\b/i;

export function contactUsesRoofFields(contact = {}) {
  const workType = String(contact.title || contact.job_type || '').trim();
  return ROOFING_WORK.test(workType)
    || Boolean(contact.roof_system || contact.secondary_roof_system || contact.has_multiple_roof_systems);
}
