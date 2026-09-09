-- Run only after 20260909182840_recover_legacy_wb_trash_snapshots.sql is applied and its
-- rollback-only review probe has passed. This is intentionally generic: it reconciles up to
-- 100 company documents without embedding production identifiers or snapshot counts.
select public.reconcile_legacy_wb_trash_snapshots(null, 100, false);
