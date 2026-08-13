-- Corrective for a database that already ran 20260814000000 before its pattern was fixed.
--
-- That migration matched `"type":"company_contact"` with no space. jsonb::text renders a
-- space after the colon, so it updated nothing and left the App Builder field pointing at a
-- type the client no longer registers -- and normalizeWorkspaceBuilderDoc coerces any
-- unrecognised type to `text`, which would have quietly eaten the field's stored values the
-- next time somebody opened that app.
--
-- Idempotent, and a no-op on a database that ran the corrected version.

update public.workspace_builder_state
set doc = replace(doc::text, '"company_contact"', '"company_record"')::jsonb,
    updated_at = now()
where doc::text like '%"company_contact"%';
