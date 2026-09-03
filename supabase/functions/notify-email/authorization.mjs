export const NOTIFICATION_EMAIL_PERMISSION = "tasks.manage";
export const NOTIFICATION_EMAIL_RATE_LIMIT = 20;
export const NOTIFICATION_EMAIL_RATE_WINDOW_SECONDS = 60 * 60;

const ELEVATED_COMPANY_ROLES = new Set(["owner", "admin", "developer"]);

export function canSendCompanyNotificationEmail({ membershipRole, permissionRows = [] }) {
  const role = String(membershipRole ?? "").trim().toLowerCase();
  if (!role) return false;
  if (ELEVATED_COMPANY_ROLES.has(role)) return true;

  const effects = permissionRows
    .filter((row) => row?.permission_key === "*" || row?.permission_key === NOTIFICATION_EMAIL_PERMISSION)
    .map((row) => String(row?.effect ?? "").trim().toLowerCase());

  return effects.includes("allow") && !effects.includes("deny");
}

export async function notificationEmailRateLimitBucket(profileId, companyId) {
  const input = new TextEncoder().encode(`notify-email:${profileId}:${companyId}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
