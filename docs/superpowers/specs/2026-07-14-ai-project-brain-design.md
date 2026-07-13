# AI Project Brain Design

## Purpose

Quest HQ needs a durable, vendor-neutral project brain that any AI assistant or incoming developer can use without a separate handoff conversation. The `.ai/` directory will be the canonical onboarding and operating memory for the repository: what the product is, how it is built, what is live, how the database is structured, how releases work, and what remains unresolved.

The system must remain useful across Codex, Claude, Gemini, GitHub Copilot, and other tools. Vendor-specific instruction files will be thin adapters only; they will point to `.ai/README.md` and will not duplicate project knowledge.

## Success criteria

An AI with repository access should be able to answer these questions after reading `.ai/`:

1. What does Quest HQ do and which product areas are live?
2. What are the application boundaries, entry points, routes, APIs, and external services?
3. What does the production database contain, how are entities related, and how is access controlled?
4. What is currently deployed and when was that state last verified?
5. How should code, migrations, tests, pull requests, and direct Vercel deployments be handled?
6. Which decisions and known risks must be preserved?
7. Which project-brain files must be updated when a change is completed?

The folder must never contain credentials, tokens, private keys, customer records, message contents, file-object names, personal user data, or other row-level production data.

## Selected approach: hybrid project brain

The project brain combines curated explanations with generated or verified snapshots.

- Curated Markdown explains product intent, boundaries, conventions, decisions, and operational rules.
- Machine-readable JSON records objective snapshot metadata such as generation time, source commit, project identifiers, migration ledger state, and schema inventory.
- A repository command validates the folder, adapters, manifest, links, sensitive-data exclusions, and migration-map freshness.
- Authorized AIs refresh live Supabase and Vercel facts through their connectors. Repository scripts never require or persist platform secrets.

Static documentation alone was rejected because it becomes stale silently. A generated-only system was rejected because schema introspection cannot explain product intent or architectural decisions.

## Repository structure

```text
.ai/
  README.md
  context.md
  architecture.md
  current-state.md
  operations.md
  decisions.md
  known-issues.md
  manifest.json
  database/
    overview.md
    schema.md
    relationships.md
    functions.md
    security.md
    storage.md
    snapshot.json
    introspection.sql

AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
scripts/ai-context-lib.mjs
scripts/check-ai-context.mjs
tests/ai-context.test.mjs
```

### `.ai/README.md`

The mandatory entry point. It defines the reading order, truth hierarchy, security boundary, update rules, and a short task-routing table. It tells an AI which file to inspect for product, database, deployment, security, or operational questions.

Truth precedence will be explicit:

1. Live platform metadata when verified through an authorized connector.
2. Current repository code and committed migrations.
3. `.ai/current-state.md` and `.ai/database/snapshot.json`, interpreted using their timestamps.
4. Historical reports and archived documentation.

If sources disagree, the AI must report the mismatch and update the project brain after resolving it.

### Product and architecture files

- `context.md` documents product purpose, companies/tenancy vocabulary, user roles, major workflows, and the distinction between current modules and future ideas.
- `architecture.md` documents the Vite frontend, Vercel functions, Supabase services, authentication, realtime flow, storage, Stripe boundary, main source locations, and route/module ownership.
- `current-state.md` records verified production URL, source branch, deployed commit, latest successful production smoke and guardian run, current live modules, and the last refresh timestamp.
- `operations.md` documents dependency installation, tests, build budget, database migration workflow, pull-request workflow, direct Vercel deployment, production smoke, rollback, and log/advisor checks. It explicitly forbids starting local servers for this project unless the owner changes that rule.
- `decisions.md` records durable decisions with date, decision, rationale, and consequence. It is not a chronological work log.
- `known-issues.md` lists only confirmed unresolved risks or debt, with evidence, impact, and the condition for removal.

### Database map

The initial database map will be generated from the live Supabase project and reconciled with committed migrations.

- `overview.md` groups tables into business domains and explains company tenancy.
- `schema.md` lists every application-owned `public` table, its purpose, primary key, important columns, RLS state, and owning domain.
- `relationships.md` lists foreign-key relationships and important logical relationships not represented by a foreign key.
- `functions.md` lists application RPCs, signatures, security mode, purpose, and callable roles. Privileged functions receive an explicit warning.
- `security.md` summarizes RLS policies, permission helpers, role boundaries, anonymous/public entry points, and direct-table operations intentionally revoked.
- `storage.md` lists bucket names, public/private state, file-size/MIME restrictions, ownership convention, and related application flows. It never lists stored object paths.
- `snapshot.json` provides a machine-readable inventory of tables, columns, keys, relationships, policies, functions, triggers, buckets, installed extensions, cron jobs, and migration ledger metadata.
- `introspection.sql` is a read-only metadata query that an authorized AI can run through Supabase tooling. It reads catalog metadata only and never reads application rows or auth identities.

Auth and storage system schemas are documented only where they touch application behavior. Internal Supabase implementation tables and production row counts are excluded.

## Compatibility adapters

The root adapter files are intentionally short. Each states that `.ai/README.md` must be read before planning, modifying code, changing the database, or using deployment tools. Each also states that relevant `.ai/` files must be updated before a task is considered complete.

Adapters must not contain project facts beyond the pointer and universal rules, preventing vendor-specific copies from drifting apart.

## Refresh and drift model

`npm run ai:check` will run `scripts/check-ai-context.mjs` and fail when:

- a required project-brain or adapter file is missing;
- `manifest.json` has an invalid schema or missing timestamps/source metadata;
- Markdown links inside `.ai/` are broken;
- an adapter does not point to `.ai/README.md`;
- the latest committed migration is not represented by the database snapshot manifest;
- a forbidden secret pattern or private-key marker is found;
- the database snapshot contains row payloads instead of catalog metadata.

The existing `npm run check` command will include `npm run ai:check`, making the project brain part of normal CI.

The refresh process is intentionally split:

1. Repository facts are refreshed from Git, `package.json`, `vercel.json`, source routes, API files, and migration files.
2. Live facts are refreshed by an authorized AI through GitHub, Vercel, and Supabase connectors.
3. The AI updates the curated explanation when behavior or intent changed.
4. `manifest.json` records `generated_at`, `generated_from_commit`, the latest repository migration, the latest live migration, and live-verification timestamps.
5. `npm run ai:check` verifies the committed result without needing platform credentials.

The manifest describes the commit used as input, not the commit that later stores the refreshed files. This avoids an impossible self-referential commit hash requirement.

## Update responsibilities

All AI adapters will enforce this completion rule:

- Product behavior or module changes update `context.md` or `current-state.md`.
- Architecture, dependency, route, API, or service-boundary changes update `architecture.md`.
- Schema, RLS, RPC, trigger, storage, extension, cron, or migration changes update the relevant database files and snapshot.
- Deployment, test, migration, rollback, or operational changes update `operations.md`.
- Durable trade-offs update `decisions.md`.
- Newly confirmed unresolved risks update `known-issues.md`; resolved items are removed rather than preserved as noise.

Small implementation details that do not affect another AI's understanding require no project-brain edit.

## Error handling and stale data

Every live-derived document includes a timestamp and source. If a connector is unavailable, the AI may use the committed snapshot but must label it as unverified rather than presenting it as live truth.

If repository migrations and the live migration ledger disagree, the database map records both values and links to the reconciliation procedure. The refresh process must never overwrite a curated explanation with generated prose.

If the secret scan reports a possible credential, the check fails closed. The suspected value must be removed or replaced with a clearly non-secret identifier before committing.

## Testing and verification

Automated tests will cover:

- required file and adapter discovery;
- adapter pointer validation;
- manifest schema validation;
- migration freshness checks;
- Markdown link resolution;
- secret/private-key marker rejection;
- rejection of row-like database snapshot payloads;
- acceptance of the committed project brain.

Implementation verification requires the focused AI-context test, the full repository check, `git diff --check`, a live Supabase metadata comparison, and a production-safe review. No local server is required.

## Initial snapshot scope

The first committed version will reflect the live project at implementation time, including:

- the active Supabase project and Postgres version;
- application-owned `public` tables with RLS metadata and relationships;
- application RPCs, policies, triggers, storage buckets, extensions, cron jobs, and migration ledger;
- the current Vercel production URL and deployed commit;
- the latest GitHub `main` state, CI state, Production Guardian state, and verified production smoke result;
- currently live modules and confirmed operational gaps.

The snapshot is a point-in-time record, not a replacement for checking live systems when a task requires current truth.
