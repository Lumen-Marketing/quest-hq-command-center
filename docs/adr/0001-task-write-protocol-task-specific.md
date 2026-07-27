# ADR-0001 — A task-specific Tasks store as the write engine for the native tasks path

- Status: Accepted
- Date: 2026-07-28
- Deciders: Quest HQ owner + architecture review (candidate "Collapse the forked task engine")

## Context

Task management can render two ways, chosen by the `VITE_NATIVE_TASKS_MODULE`
flag (`CONFIG.nativeTasksModule`, default **off**):

- **Embedded (default):** the vendored `taskmanagement/` app in an iframe
  (`?embed=1&project_id=<job.id>`), session shared same-origin.
- **Native (flag on):** the host's own task UI writing directly to `tasks`.

This flag is a deliberate, in-progress strangler migration from embed to native.
An earlier reading — from a stale feature branch where the native UI was the only
path and the fork looked dead — framed this as "delete the fork." **That is wrong
for `main`:** the fork is the default production surface, and a static test
(`task-native-module-static.test.mjs`) pins the native write implementation.

The native path today hand-rolls its `tasks` writes across ~9 sites (insert /
update / status), each repeating the client-guard → optimistic apply → error /
rollback ceremony, and the status toggle bypasses the workspace guard. Extracting
that write protocol raised one design fork: build it **task-specific**, or deepen
the entity registry (`RECYCLE_BIN_TYPES`, ~19 types) into a generic
`Records.save(type, input)`.

## Decision

Build a **task-specific** Tasks store (`src/tasks/task-store.js`) as the injectable
write engine for the **native** path. It owns the write protocol and scopes every
update by `id` + `workspace_id`; `normalizeTask` / `taskPayload` and the `db`
client are injected (real in prod, fake in tests). We do **not** generalise the
write path across all entity types, and we do **not** delete the vendored fork —
the flag governs which surface ships.

## Why not the generic entity-write module

- **Blast radius.** A generic `Records.save` touches every entity write in a live,
  multi-tenant 38k-line `main.js`. One regression risks contacts, deals, jobs,
  finance, forms — not just tasks.
- **One adapter is a hypothetical seam; two make it real.** Only tasks have a
  demonstrated second implementation.

## Why not delete the fork

- The fork is the **default** task surface (`VITE_NATIVE_TASKS_MODULE=false`), not
  dead code. The flag is the migration path; deletion is only appropriate once the
  team commits to native-by-default and the flag is retired.

## Consequences

- The Tasks store exists and is unit-tested (tenant guard, rollback, setStatus),
  but is **not yet wired** into `main.js`. Wiring it means routing the native
  write sites through it and updating the pinning static test to assert the store
  is the writer (guard preserved), not the literal `client.from('tasks')` call.
- The other 18 entity types keep hand-rolling their write ceremony — known,
  deliberate debt.

## Revisit when

- The team flips `VITE_NATIVE_TASKS_MODULE` to default-on / retires it — then wire
  the store into the native path and delete the embed fallback + vendored fork.
- A **second** entity type needs the same write protocol — then promote the store
  to a generic `Records.save`, with tasks as its first adapter.
