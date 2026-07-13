# Quest HQ project brain

This folder is the canonical, vendor-neutral context for AI agents and human handoffs. Start here instead of relying on a chat transcript.

## Required reading order

1. [Product context](context.md)
2. [Current state](current-state.md)
3. [Architecture](architecture.md)
4. The relevant [database map](database/overview.md)
5. [Operations](operations.md)
6. [Decisions](decisions.md) and [known issues](known-issues.md)

For exact freshness and source metadata, inspect [manifest.json](manifest.json).

## Truth precedence

When sources disagree, use this order:

1. Live Supabase, Vercel, and GitHub state checked through their connected tools.
2. Current repository code, configuration, tests, and SQL migrations.
3. The generated database [snapshot](database/snapshot.json) and current-state page.
4. Historical documents, old handoff notes, and chat transcripts.

Do not silently guess around a conflict. Verify the higher-priority source and update this folder in the same change.

## Operating rules

- The team deploys directly. Do not start a local development or preview server.
- Run non-server checks locally: npm test, npm run ai:check, npm run build, and npm run check.
- Treat Supabase as the source of truth for production data shape and authorization.
- Create every database change as a reviewed migration, then refresh the database map from live metadata.
- Preserve tenant boundaries, RLS, permissions, atomic RPC behavior, and recycle-bin semantics.
- Verify the deployed production URL after changes merge to main.
- Keep credentials in deployment providers. This folder must never contain secrets, auth-user records, personal data, production rows, or storage object paths.

## Update matrix

| Change | Project-brain files to update |
| --- | --- |
| Product module or terminology | context.md, current-state.md |
| Frontend/API architecture | architecture.md, current-state.md |
| Supabase schema, RLS, routines, storage, cron | database/*, manifest.json, current-state.md |
| Deployment or CI workflow | operations.md, current-state.md, manifest.json |
| Durable technical decision | decisions.md |
| Confirmed unresolved problem | known-issues.md |
| Any refresh | manifest.json timestamps and source revisions |

## AI adapters

AGENTS.md, CLAUDE.md, GEMINI.md, and .github/copilot-instructions.md are deliberately thin pointers here. Do not duplicate the project brain in vendor-specific files.

## Validation

Run npm run ai:check. CI runs it as part of npm run check and fails on missing files, stale migration markers, broken local links, malformed snapshots, adapter drift, or likely committed credentials.

