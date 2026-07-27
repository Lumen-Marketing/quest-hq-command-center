# Questbase pilot onboarding rehearsal

Run this rehearsal before admitting a real pilot company. Use one team-owned
owner mailbox and a second team-owned worker mailbox. Do not use a customer as
the first end-to-end test.

## Preparation

- Confirm the exact production commit is `READY` on Vercel.
- Confirm `https://www.questbase.io/login` loads over HTTPS.
- Confirm Supabase reports healthy and the production smoke check passes.
- Confirm the owner and worker mailboxes are accessible.
- If transactional email is not configured, plan to use the copy-link fallback.

## Owner journey

1. Register the owner account and verify the email.
2. Confirm the new company is pending and cannot reach protected company data.
3. Approve the company through the platform approval console.
4. Sign in again and confirm the owner lands in the new company.
5. Follow the dashboard setup checklist:
   - review the default workspace;
   - enable the required workspace apps;
   - invite the worker into only the intended workspace;
   - add one test customer;
   - add one test task.
6. Open Help & support from the account menu and submit a test report.
7. Confirm the report appears in the platform report inbox.

## Worker journey

1. Open the email invitation or copied invite link in a separate browser
   profile.
2. Register or sign in with the invited email.
3. Accept the invitation and confirm the worker lands on the Dashboard.
4. Confirm only the assigned company and workspaces appear.
5. Confirm allowed apps open and restricted apps/actions remain unavailable.
6. Create or update one permitted test record.
7. Sign out and sign back in; confirm access is unchanged.

## Isolation and recovery checks

- Directly visit another company's URL and confirm access is denied.
- Disable the worker and confirm company routes stop loading.
- Reactivate only if the pilot still needs the account.
- Retry a failed invitation email and confirm the original link remains valid.
- Remove or clearly label all rehearsal records after the test.

## Completion record

Record the date, exact Git commit, Vercel deployment ID, owner tester, worker
tester, email result, support-report result, access result, and any issue link.
The rehearsal is complete only when both users confirm the full journey.
