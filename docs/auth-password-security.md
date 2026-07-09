# Supabase password security handoff

Quest HQ now enforces a 12-character password policy with uppercase, lowercase, and numeric characters in the registration and password-recovery UI.

The installed Supabase connector does not expose Auth configuration writes, and no Supabase Management API access token is available in this workspace. The remaining platform setting therefore must be confirmed in the [Quest HQ Email Auth settings](https://supabase.com/dashboard/project/rqundirizvojpzhljtdn/auth/providers?provider=Email):

1. Set the minimum password length to `12`.
2. Require digits, lowercase letters, and uppercase letters. Requiring symbols as well is safe if the product policy is updated to match in the same release.
3. Enable leaked-password protection (available on Supabase Pro and above).
4. Keep the production redirect allowlist entry for `https://quest-hq-command-center-gamma.vercel.app/**` so recovery links return to the deployed app.

Do not mark leaked-password protection complete until the dashboard reports it enabled.
