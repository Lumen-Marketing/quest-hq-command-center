// Sign in, create account, invite, reset and recovery -- every form inside the auth modal.
//
// Fetched on demand alongside the landing page. Nobody signed in renders any of it, so it
// was pure weight on every authenticated page load.
//
// Bodies unchanged from where they lived in main.js.

export function createAuthForm(ctx) {
  const {
    h, state, authStatusMessage, authSubmitButton, inviteLookupForToken,
    isLiveSupabaseSession, renderAuthOAuthButtons, renderPasswordField,
    renderPasswordRequirements,
  } = ctx;

  function renderSupabaseAuthForm(returnUrl) {
    const inviteToken = String(state.route?.params?.get('invite') || '').trim();
    if (state.authMode === 'forgot') {
      return `
        <form class="auth-form-compact" data-auth-forgot-form>
          <div class="auth-form-title">
            <strong>Reset your password</strong>
            <span>We will email a secure reset link if the account exists.</span>
          </div>
          ${inviteToken ? `
            <!-- Reached from an invitation. Say the invite survives this, or it looks like
                 leaving the page abandons it. -->
            <p class="auth-note">Your invitation is still waiting. Reset your password, then
            sign in here to join.</p>
          ` : ''}
          <label>Email<input name="email" type="email" autocomplete="email" required /></label>
          ${authSubmitButton('Send reset link', 'Sending reset link...')}
          ${authStatusMessage('The message is the same whether or not that email has an account.')}
          <button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">${inviteToken ? 'Back to sign in and join' : 'Back to sign in'}</button>
        </form>
      `;
    }
    if (state.authMode === 'recovery') {
      // A reset link is single-use. Clicking it again -- or reloading this page, which
      // re-requests it -- spends nothing, because the token is already gone: the server answers
      // "One-time token not found" and no session is created. This screen used to claim "your
      // recovery link has been verified" purely because ?auth=recovery was in the URL, so the
      // only sign anything was wrong came from "Auth session missing!" after typing a new
      // password twice. Check for the session that the link was supposed to produce.
      if (!isLiveSupabaseSession()) {
        return `
          <div class="auth-form-compact">
            <div class="auth-form-title">
              <strong>This reset link has expired</strong>
              <span>Reset links work once. If you opened it twice, or reloaded this page, the first use was the one that counted.</span>
            </div>
            <p class="auth-note">Request a new link and open it once. It stays valid for one hour.</p>
            <button class="btn btn-primary full" type="button" data-action="set-auth-mode" data-auth-mode="forgot">Send a new reset link</button>
            <button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">Back to sign in</button>
          </div>
        `;
      }
      return `
        <form class="auth-form-compact" data-auth-update-password-form>
          <div class="auth-form-title">
            <strong>Choose a new password</strong>
            <span>Your recovery link has been verified.</span>
          </div>
          ${renderPasswordField({ label: 'New password', autocomplete: 'new-password' })}
          ${renderPasswordField({ label: 'Confirm new password', autocomplete: 'new-password', confirm: true })}
          ${renderPasswordRequirements()}
          ${authSubmitButton('Update password', 'Updating password...')}
          ${authStatusMessage('Use a password you have not used for this account before.')}
        </form>
      `;
    }
    if (state.authMode === 'register') {
      return `
        <form class="auth-form-compact" data-auth-register-form>
          <div class="auth-form-title">
            <strong>${inviteToken ? 'Create invited worker account' : 'Create business workspace'}</strong>
            <span>${inviteToken ? 'Email must match the invite.' : 'Workspace opens after Quest approval.'}</span>
          </div>
          ${renderAuthOAuthButtons(inviteToken ? (inviteLookupForToken(inviteToken)?.email || '') : '')}
          <label>${inviteToken ? 'Display name / username' : 'Full name'}<input name="full_name" autocomplete="name" required /></label>
          <label>Email<input name="email" type="email" autocomplete="email" required /></label>
          ${renderPasswordField({ autocomplete: 'new-password' })}
          ${renderPasswordRequirements()}
          ${inviteToken ? '' : '<label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>'}
          <input type="hidden" name="invite_token" value="${h(inviteToken)}" />
          <input type="hidden" name="return_url" value="${h(returnUrl)}" />
          ${authSubmitButton(inviteToken ? 'Create account and join' : 'Create secure workspace', 'Creating account...')}
          ${authStatusMessage(inviteToken ? 'Workers cannot create access without a valid invite code.' : 'You become Owner, then Quest approves billing/access before the workspace opens.')}
          ${inviteToken ? '<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">I already have an account</button>' : ''}
        </form>
      `;
    }
    if (state.authMode === 'invite') {
      return `
        <form class="auth-form-compact" data-auth-invite-code-form>
          <div class="auth-form-title">
            <strong>Join with invite code</strong>
            <span>Workers need a code from their company admin.</span>
          </div>
          <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
          <input type="hidden" name="return_url" value="${h(returnUrl)}" />
          <button class="btn btn-primary full" type="submit">Continue with invite code</button>
          ${authStatusMessage('Invite codes are shared by your Owner/Admin. No email delivery required.')}
        </form>
      `;
    }
    if (state.authMode === 'request') {
      return `
        <form class="auth-form-compact" data-auth-request-form>
          <div class="auth-form-title">
            <strong>Request access</strong>
            <span>This is for existing accounts only. New workers should use an admin invite.</span>
          </div>
          <label>Email<input name="email" type="email" autocomplete="email" required /></label>
          ${renderPasswordField()}
          <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
          <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
          <input type="hidden" name="return_url" value="${h(returnUrl)}" />
          ${authSubmitButton('Request company access', 'Requesting access...')}
          ${authStatusMessage('Requests stay pending until a company Owner/Admin approves them.')}
        </form>
      `;
    }
    return `
      <form class="auth-form-compact" data-auth-sign-in-form>
        <div class="auth-form-title">
          <strong>${inviteToken ? 'Sign in and accept invite' : 'Sign in'}</strong>
          <span>${inviteToken ? 'Use the invited email account.' : 'Use your company account.'}</span>
        </div>
        ${renderAuthOAuthButtons(inviteToken ? (inviteLookupForToken(inviteToken)?.email || '') : '')}
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        ${renderPasswordField()}
        <input type="hidden" name="invite_token" value="${h(inviteToken)}" />
        <input type="hidden" name="return_url" value="${h(returnUrl)}" />
        ${authSubmitButton(inviteToken ? 'Sign in and join' : 'Sign in', 'Signing in...')}
        <!-- Offered on the invite flow too. Someone accepting an invite with an existing
             account is exactly the person most likely to have forgotten its password -- they
             may not have signed in for months, which is why they were invited again. Hiding it
             here left "Invalid login credentials" as a dead end. The invite token lives in the
             URL, so it survives the trip to the reset form and back. -->
        <button class="auth-text-action" type="button" data-action="set-auth-mode" data-auth-mode="forgot">Forgot password?</button>
        ${authStatusMessage(inviteToken ? 'If you do not have an account yet, create an invited worker account.' : 'Business owners and workers use the same sign in after access is created.')}
        ${inviteToken ? '<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>' : ''}
      </form>
    `;
  }


  return { renderSupabaseAuthForm };
}
