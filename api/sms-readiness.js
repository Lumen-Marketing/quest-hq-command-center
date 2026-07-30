import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { getUserFromBearer } from './_lib/user-auth.js';

const COMPANY_ADMIN_ROLES = new Set(['owner', 'admin', 'developer']);
// Keep this at 0 until sms-send and sms-inbound both route and persist by
// workspace. A partial schema rollout must never unlock the customer UI.
const WORKSPACE_SMS_BACKEND_VERSION = 0;

const READINESS_MESSAGES = Object.freeze({
  ready: 'SMS is ready.',
  provider_unconfigured: 'SMS provider setup is incomplete.',
  backend_unavailable: 'Workspace-safe SMS routing is not available yet.',
  storage_unavailable: 'Workspace-safe SMS storage is not available yet.',
  workspace_required: 'Assign this contact to a workspace before using SMS.',
  workspace_unavailable: 'This contact workspace is not active.',
  number_unassigned: 'No active SMS number is assigned to this workspace.',
});

function readiness(status, workspaceId = null) {
  return {
    ready: status === 'ready',
    status,
    message: READINESS_MESSAGES[status],
    workspace_id: workspaceId || null,
  };
}

async function queryRows(db, path) {
  try {
    const response = await db(path);
    if (!response?.ok) return { ok: false, rows: [] };
    const data = await response.json().catch(() => []);
    return { ok: true, rows: Array.isArray(data) ? data : [] };
  } catch {
    return { ok: false, rows: [] };
  }
}

function configuredProvider() {
  return Boolean(process.env.SMSBLAST_API_KEY && process.env.SMSBLAST_WEBHOOK_TOKEN);
}

function configuredWorkspaceBackend(ctx) {
  const version = ctx.workspaceSmsBackendVersion ?? WORKSPACE_SMS_BACKEND_VERSION;
  return Number(version) >= 1;
}

export default defineEndpoint(
  {
    method: 'GET',
    auth: 'none',
    cacheControl: 'private, no-store',
    notConfiguredStatus: 503,
    notConfiguredMessage: 'SMS readiness is unavailable.',
    rateLimit: { namespace: 'sms-readiness', limit: 120, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const getUser = ctx.getUser || getUserFromBearer;
    const contactId = String(ctx.query.contact_id || '').trim();
    if (!contactId) throw new HttpError(400, 'contact_id is required.');

    let user = null;
    try {
      user = await getUser(ctx.req);
    } catch {
      user = null;
    }
    if (!user?.id) throw new HttpError(401, 'Authentication required.');

    const contactResult = await queryRows(
      ctx.db,
      `/rest/v1/contacts?id=eq.${encodeURIComponent(contactId)}&select=id,company_id,workspace_id&limit=1`,
    );
    if (!contactResult.ok) return readiness('storage_unavailable');

    const contact = contactResult.rows[0];
    if (!contact) throw new HttpError(404, 'Contact not found.');

    const companyId = String(contact.company_id || '');
    const membershipResult = await queryRows(
      ctx.db,
      `/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}`
        + `&profile_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=role,status&limit=1`,
    );
    if (!membershipResult.ok) return readiness('storage_unavailable');

    const companyMembership = membershipResult.rows[0];
    if (!companyMembership) throw new HttpError(403, 'You do not have access to this contact.');

    const workspaceId = String(contact.workspace_id || '').trim();
    if (!workspaceId) return readiness('workspace_required');

    const workspaceResult = await queryRows(
      ctx.db,
      `/rest/v1/workspaces?id=eq.${encodeURIComponent(workspaceId)}`
        + `&company_id=eq.${encodeURIComponent(companyId)}&status=eq.active`
        + '&select=id,company_id,status&limit=1',
    );
    if (!workspaceResult.ok) return readiness('storage_unavailable', workspaceId);
    if (!workspaceResult.rows[0]) return readiness('workspace_unavailable', workspaceId);

    const companyRole = String(companyMembership.role || '').toLowerCase();
    if (!COMPANY_ADMIN_ROLES.has(companyRole)) {
      const workspaceMembershipResult = await queryRows(
        ctx.db,
        `/rest/v1/workspace_memberships?workspace_id=eq.${encodeURIComponent(workspaceId)}`
          + `&profile_id=eq.${encodeURIComponent(user.id)}&status=eq.active`
          + '&select=status&limit=1',
      );
      if (!workspaceMembershipResult.ok) return readiness('storage_unavailable', workspaceId);
      if (!workspaceMembershipResult.rows[0]) {
        throw new HttpError(403, 'You do not have access to this workspace.');
      }
    }

    if (!configuredProvider()) return readiness('provider_unconfigured', workspaceId);
    if (!configuredWorkspaceBackend(ctx)) return readiness('backend_unavailable', workspaceId);

    const numberResult = await queryRows(
      ctx.db,
      `/rest/v1/sms_numbers?company_id=eq.${encodeURIComponent(companyId)}`
        + `&workspace_id=eq.${encodeURIComponent(workspaceId)}&active=eq.true`
        + '&select=id,workspace_id,from_number&limit=1',
    );
    if (!numberResult.ok) return readiness('storage_unavailable', workspaceId);

    const messagesResult = await queryRows(
      ctx.db,
      `/rest/v1/sms_messages?company_id=eq.${encodeURIComponent(companyId)}`
        + `&workspace_id=eq.${encodeURIComponent(workspaceId)}`
        + `&contact_id=eq.${encodeURIComponent(contact.id)}`
        + '&select=id,workspace_id&limit=1',
    );
    if (!messagesResult.ok) return readiness('storage_unavailable', workspaceId);

    if (!numberResult.rows[0]?.from_number) return readiness('number_unassigned', workspaceId);
    return readiness('ready', workspaceId);
  },
);
