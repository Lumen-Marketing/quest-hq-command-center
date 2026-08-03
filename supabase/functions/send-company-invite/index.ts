// Transactional company-invite email.
//
// The browser supplies only an invite id. Recipient, company, role, workspace
// names, token, subject, and HTML are all derived server-side so this endpoint
// cannot be repurposed as an arbitrary mail sender.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_PAYLOAD_BYTES = 8 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MANAGER_ROLES = new Set(["owner", "admin", "developer"]);
const ELEVATED_INVITE_ROLES = new Set(["owner", "admin", "developer"]);
const PRODUCTION_ORIGINS = [
  "https://quest-hq-command-center-gamma.vercel.app",
  "https://questbase.io",
  "https://www.questbase.io",
];

// Where an invitation link points.
//
// Deliberately NOT the same list as PRODUCTION_ORIGINS above. That list says which sites may
// call this endpoint, which reasonably includes deployment hosts. This is the address that
// goes into someone's inbox and may be clicked days later, so it has to be the product's
// permanent home.
const CANONICAL_APP_URL = "https://www.questbase.io";
// Vercel gives every deployment its own hostname. They rotate, they outlive nothing, and an
// invite sent against one is a link to a build rather than to the product.
const DEPLOYMENT_HOST_RE = /(^|\.)vercel\.app$/i;

interface InvitePayload {
  invite_id?: unknown;
}

function corsHeadersFor(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  const allowed = new Set([
    ...PRODUCTION_ORIGINS,
    ...(Deno.env.get("ALLOWED_ORIGINS") ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);
  const origin = req.headers.get("Origin") ?? "";
  if (origin && allowed.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] as string));
}

async function recordFailure(
  admin: ReturnType<typeof createClient>,
  inviteId: string,
  code: string,
) {
  const { error } = await admin
    .from("company_invites")
    .update({
      email_status: "failed",
      email_sent_at: null,
      email_last_error: code.slice(0, 120),
    })
    .eq("id", inviteId)
    .eq("status", "pending");
  if (error) console.error("[send-company-invite] failed to record delivery error", error);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const length = Number(req.headers.get("content-length") ?? 0);
    if (length > MAX_PAYLOAD_BYTES) return json(req, { error: "Payload too large." }, 413);
    const raw = await req.text();
    if (raw.length > MAX_PAYLOAD_BYTES) return json(req, { error: "Payload too large." }, 413);

    let payload: InvitePayload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json(req, { error: "Invalid JSON body." }, 400);
    }
    const inviteId = typeof payload?.invite_id === "string" ? payload.invite_id.trim() : "";
    if (!UUID_RE.test(inviteId)) return json(req, { error: "A valid invite id is required." }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json(req, { error: "Service credentials are not available." }, 503);
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") ?? "";
    const callerJwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!callerJwt) return json(req, { error: "Not signed in." }, 401);
    const { data: callerUser, error: callerError } = await admin.auth.getUser(callerJwt);
    if (callerError || !callerUser?.user) return json(req, { error: "Not signed in." }, 401);

    const { data: invite, error: inviteError } = await admin
      .from("company_invites")
      .select("id, company_id, email, role_id, token, status, expires_at, workspace_ids, email_status")
      .eq("id", inviteId)
      .maybeSingle();
    if (inviteError) {
      console.error("[send-company-invite] invite lookup failed", inviteError);
      return json(req, { error: "Could not load the invite." }, 500);
    }
    if (!invite) return json(req, { error: "Invite not found." }, 404);

    const { data: membership, error: membershipError } = await admin
      .from("company_memberships")
      .select("role")
      .eq("company_id", invite.company_id)
      .eq("profile_id", callerUser.user.id)
      .eq("status", "active")
      .maybeSingle();
    const callerRole = String(membership?.role ?? "").trim().toLowerCase();
    if (membershipError || !MANAGER_ROLES.has(callerRole)) {
      return json(req, { error: "Not authorized." }, 403);
    }

    if (invite.status !== "pending") return json(req, { error: "Invite is no longer pending." }, 409);
    if (Date.parse(invite.expires_at) <= Date.now()) {
      return json(req, { error: "Invite has expired." }, 410);
    }
    if (!EMAIL_RE.test(String(invite.email ?? "").trim())) {
      await recordFailure(admin, invite.id, "invalid_recipient");
      return json(req, { error: "Invite recipient is invalid." }, 422);
    }
    if (invite.email_status === "sent") {
      return json(req, { ok: true, already_sent: true, email_status: "sent" });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const from = Deno.env.get("EMAIL_FROM") ?? "";
    const appUrlRaw = Deno.env.get("APP_URL") ?? CANONICAL_APP_URL;
    if (!resendKey || !from) {
      await recordFailure(admin, invite.id, "email_not_configured");
      return json(req, { error: "Invite email is not configured. Copy the invite link instead." }, 503);
    }

    let appUrl: URL;
    try {
      appUrl = new URL(appUrlRaw);
      if (appUrl.protocol !== "https:") throw new Error("APP_URL must use HTTPS");
    } catch (error) {
      console.error("[send-company-invite] invalid APP_URL", error);
      await recordFailure(admin, invite.id, "invalid_app_url");
      return json(req, { error: "Invite email is not configured. Copy the invite link instead." }, 503);
    }
    // APP_URL was pointing at the Vercel deployment host, so invited people landed on an old
    // build instead of Questbase. A dashboard field being wrong should not be able to send
    // the wrong address to a customer, so this is enforced here rather than trusted.
    if (DEPLOYMENT_HOST_RE.test(appUrl.hostname)) {
      console.warn("[send-company-invite] APP_URL points at a deployment host; using", CANONICAL_APP_URL);
      appUrl = new URL(CANONICAL_APP_URL);
    }

    const [{ data: company }, { data: role }] = await Promise.all([
      admin.from("companies").select("name").eq("id", invite.company_id).maybeSingle(),
      invite.role_id
        ? admin.from("roles").select("name").eq("id", invite.role_id).eq("company_id", invite.company_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const rawRoleName = String(role?.name ?? "Member").trim() || "Member";
    const roleName = ELEVATED_INVITE_ROLES.has(rawRoleName.toLowerCase()) ? "Member" : rawRoleName;
    const companyName = String(company?.name ?? "your Questbase company").trim();

    let workspaceIds = Array.isArray(invite.workspace_ids)
      ? invite.workspace_ids.filter((id: unknown): id is string => typeof id === "string" && UUID_RE.test(id))
      : [];
    let workspaceQuery = admin
      .from("workspaces")
      .select("id, name")
      .eq("company_id", invite.company_id)
      .eq("status", "active");
    workspaceQuery = workspaceIds.length > 0
      ? workspaceQuery.in("id", workspaceIds)
      : workspaceQuery.eq("is_default", true);
    const { data: workspaces, error: workspaceError } = await workspaceQuery;
    if (workspaceError || !workspaces?.length) {
      await recordFailure(admin, invite.id, "workspace_lookup_failed");
      return json(req, { error: "Invite workspaces could not be verified." }, 409);
    }
    workspaceIds = workspaces.map((workspace: { id: string }) => workspace.id);

    const loginUrl = new URL("/login", appUrl);
    loginUrl.searchParams.set("invite", invite.token);
    const workspaceNames = workspaces
      .map((workspace: { name: string }) => String(workspace.name ?? "").trim())
      .filter(Boolean)
      .join(", ");
    const subject = `You're invited to ${companyName} on Questbase`;
    const text = `Questbase

You've been invited to join ${companyName} as ${roleName}.
Workspace access: ${workspaceNames}

Accept invitation: ${loginUrl.toString()}

This link is tied to ${String(invite.email).trim()} and expires ${new Date(invite.expires_at).toUTCString()}.`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:0 auto;padding:32px;color:#172033">
        <div style="font-weight:800;font-size:22px;color:#ed4e0d">Questbase</div>
        <h1 style="font-size:28px;line-height:1.2;margin:28px 0 12px">Join ${escapeHtml(companyName)}</h1>
        <p style="font-size:16px;line-height:1.6">You've been invited as <strong>${escapeHtml(roleName)}</strong>.</p>
        <p style="font-size:16px;line-height:1.6"><strong>Workspace access:</strong> ${escapeHtml(workspaceNames)}</p>
        <a href="${escapeHtml(loginUrl.toString())}" style="display:inline-block;margin:20px 0;padding:13px 20px;border-radius:10px;background:#ed4e0d;color:#fff;text-decoration:none;font-weight:700">Accept invitation</a>
        <p style="font-size:13px;line-height:1.6;color:#667085">This link is tied to ${escapeHtml(invite.email)} and expires ${escapeHtml(new Date(invite.expires_at).toUTCString())}.</p>
      </div>
    `.trim();

    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `questbase-company-invite-${invite.id}`,
      },
      body: JSON.stringify({
        from,
        to: [String(invite.email).trim().toLowerCase()],
        subject,
        text,
        html,
      }),
    });
    const providerData = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("[send-company-invite] provider rejected", {
        status: response.status,
        providerData,
      });
      await recordFailure(admin, invite.id, "provider_rejected");
      return json(req, { error: "Email delivery failed. The invite link is still valid." }, 502);
    }

    const sentAt = new Date().toISOString();
    const { error: updateError } = await admin
      .from("company_invites")
      .update({
        email_status: "sent",
        email_sent_at: sentAt,
        email_last_error: null,
        workspace_ids: workspaceIds,
      })
      .eq("id", invite.id)
      .eq("status", "pending");
    if (updateError) {
      console.error("[send-company-invite] sent but status update failed", updateError);
      return json(req, { ok: true, email_status: "sent", warning: "status_update_failed" }, 202);
    }

    await admin.from("audit_events").insert({
      company_id: invite.company_id,
      actor_profile_id: callerUser.user.id,
      event_type: "invite.email_sent",
      target_type: "company_invite",
      target_id: invite.id,
      details: { workspace_ids: workspaceIds },
    });

    return json(req, {
      ok: true,
      email_status: "sent",
      email_sent_at: sentAt,
    });
  } catch (error) {
    console.error("[send-company-invite] unhandled error", error);
    return json(req, { error: "Invite email could not be sent." }, 500);
  }
});
