# Questbase optimization implementation — 2026-08-25

## Scope

This pass implements the safe, measured items from the 2026-08-22 optimization review. It does not change tenant rules, database records, feature behavior, or visual design.

Starting revision: `fd6e7043c1139813ae8b5f8bd630b28774f17486` (`origin/main`).

## Production baseline

- Content-hashed `/assets/*` responses were served with `Cache-Control: public, max-age=0, must-revalidate`; repeated requests therefore revalidated instead of using a durable browser cache.
- The copied Tasks runtime and its 206,365-byte Supabase browser SDK used the same revalidation policy.
- Shared entry CSS measured 711,230 raw bytes and 121,599 gzip bytes.
- Shared entry JavaScript measured 1,292,687 raw bytes and 362,994 gzip bytes.
- Read-only production route samples were approximately 127–687 ms depending on route and cache state. A signed-in data trace was not available from the browser session used for the baseline.

## Implemented

1. **Immutable release assets.** Vite's content-hashed `/assets/*` now receive a one-year immutable cache policy. HTML, the service worker, the manifest, runtime environment configuration, auth, and API responses remain revalidated or dynamic.
2. **Versioned Tasks assets.** The copied Tasks scripts, styles, and vendor files receive a deployment revision query and an immutable policy. `app.html` and `env.json` remain revalidated, so a deployment always points the browser at the new revision.
3. **Tasks SDK recovery.** If the first same-origin Supabase SDK request is interrupted, the embedded Tasks surface retries it once instead of stopping permanently at “SDK failed to load.”
4. **Workspace Builder CSS split.** Builder-only styles are no longer part of every Questbase page. The route loads them once on demand, shows a skeleton while they arrive, surfaces a terminal error if they fail, and can retry.
5. **Concurrent startup reads.** Automations now starts with the rest of the independent initial Supabase reads instead of adding another full network round trip afterward. The named query plan lives in a lazy auth-only module.
6. **Bounded startup waits.** The profile read and each initial workspace read settle after 15 seconds. One degraded request can no longer leave the secure-session or workspace skeleton running for several minutes.

## Build result

- Shared entry CSS: **631,388 raw / 110,398 gzip bytes**, down 79,842 raw and 11,201 gzip bytes. The 110 KiB gzip guard passes.
- Workspace Builder route CSS: **79,919 raw / 13,177 gzip bytes**, downloaded only when that surface is opened.
- Shared entry JavaScript: **1,292,172 raw / 363,736 gzip bytes**. Raw size is slightly lower; gzip is effectively flat and remains under the existing 356 KiB guard. The review's aspirational 340 KiB target is not claimed as complete.
- The App Builder modal was already a dynamic chunk on the starting revision, so it was verified rather than duplicated.
- No database indexes or migrations were added because this pass found a client startup waterfall and unbounded waits, not query-plan evidence for a schema change.

## Verification

- Full Node test suite: **4,231 passed / 0 failed**.
- AI/project-state validation: **pass** (21 required files, 18 Markdown files, latest migration recognized).
- Tenancy matrix: **pass** (76 tenant-scoped tables retain RLS and a readable policy).
- Dependency security audit: **0 vulnerabilities** at the high-severity gate.
- Production build, tightened bundle budget, and module-boot check: **pass**.
- Production cache headers, exact deployment revision, and post-deploy route smoke: required after integration.
