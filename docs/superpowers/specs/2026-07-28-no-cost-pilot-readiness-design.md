# No-Cost Pilot Readiness Design

## Goal

Make Questbase safer and easier to pilot while the owner is still arranging
banking, the payment provider, and a dedicated Questbase mailbox.

## Chosen approach

Use the launch controls and services that already exist instead of adding a
second onboarding, tenancy, or billing system.

- Company accounts remain the customer and security boundary.
- Operational workspaces remain configurable children of one company.
- New company accounts remain behind manual subscription approval.
- Workers continue to join only through a company invite.
- Billing remains in manual mode until the payment provider is ready.
- The existing `report-problem` Edge Function remains the support source of
  truth; Questbase gains a first-class way to invoke it.
- First-run progress is derived from existing company/workspace data. No new
  onboarding table or migration is required.

## Alternatives considered

### Documentation only

This would prepare runbooks but leave owners without guidance and leave the
deployed support function unreachable from the Questbase interface. It is too
weak for a market pilot.

### Focused no-schema launch pass

This is the selected option. It improves the real owner and worker journey,
uses the current authorization model, and can be removed or expanded later
without migrating customer data.

### Full pilot, billing, and lifecycle framework

This would add new database state, automated trials, lifecycle emails, and
provider-specific billing objects. It depends on product and banking decisions
that are not available yet and creates unnecessary launch risk.

## Customer flow

### Company owner

1. Register or sign in.
2. Create a company account and its default operational workspace.
3. See manual review status instead of a broken checkout.
4. After approval, enter the dashboard.
5. Use a launch checklist to confirm apps, teammate access, the first customer
   or job, and the first task.

The checklist reads existing state and disappears when all steps are complete.
It does not lock the owner into one pipeline or workspace layout.

### Worker

1. Register or sign in through an invite.
2. Accept access only to the assigned company workspaces and role.
3. Land on the permission-neutral company dashboard rather than the Jobs page,
   which may be unavailable to that role.
4. Use only the modules allowed by workspace membership, plugins, and
   permissions.

### Support

1. A signed-in user chooses **Help & support** from the account menu.
2. The modal offers concise self-service guidance and a bug/problem/suggestion
   form.
3. The form sends only the report type, description, and bounded route/device
   context to the existing `report-problem` function.
4. The function stores the report even when outbound email is unavailable.
5. A visible support-email link remains available as the fallback.

## Seven-item launch mapping

1. **Customer email:** keep Resend-based transactional functions ready, add
   plain-text invite content and exact setup guidance. Provider secrets and DNS
   remain an external owner action.
2. **Pilot rehearsal:** add a repeatable owner/worker rehearsal and record the
   automated checks that can run without creating production test accounts.
3. **Invite-only pilot:** preserve manual company approval and invite-only
   worker access; do not add a competing access mode.
4. **First-time onboarding:** add a derived owner launch checklist and a safe
   post-invite landing route.
5. **Support readiness:** expose the existing report channel in the main app,
   fix the production-origin allowlist, and retain email fallback.
6. **Launch testing:** correct the stale Contacts assertion, run the full
   repository check, smoke the deployed revision, and verify the signed-in
   support/onboarding surfaces.
7. **Payment preparation:** keep checkout disabled in manual mode and document
   the non-secret business, plan, domain, and webhook information needed for
   provider activation.

## Error handling and security

- Support submission requires a real Supabase session and the Edge Function
  continues to validate the caller server-side.
- Demo users and unavailable network sessions receive the support-email
  fallback; no report is falsely presented as submitted.
- Production origins are explicit defaults plus optional deployment-provided
  origins.
- The caller cannot choose support-email recipients.
- No service key, provider key, bank information, customer row, or auth-user
  record enters source control.
- Onboarding completion is display-only and cannot grant access or bypass RLS.

## Verification

- A pure onboarding helper is covered by behavior tests for new owners,
  invited teammates, and completed setup.
- The support interface and worker redirect receive focused regression tests.
- The CORS helper is behavior-tested with allowed and rejected origins.
- Existing invite, auth, tenant, billing, and launch tests remain green.
- `npm run check`, `git diff --check`, the production deployment state, and the
  production smoke command gate publication.

