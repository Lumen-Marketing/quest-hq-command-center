-- Split company_contacts.manage into the four powers it was bundling.
--
-- One checkbox granted all of: file a new contact, edit an existing one, delete one, and
-- restructure the contact SCHEMA. Those are not the same risk. Deleting a Company Contacts
-- field is a hard delete with no recycle bin (see .ai/known-issues.md) that has already cost
-- one company its entire field set, while "file a new contact" is what an ordinary worker
-- does every time a Workspace button sends a lead to the directory.
--
-- Because they shared a key, letting a worker file a lead also handed them the power to
-- destroy the directory's structure. That is the reason a Worker role pressing "Lead" got
-- "could not be filed in Company Contacts": the only permission that would have let them do
-- it was one nobody sensibly grants a worker.
--
-- Backwards compatible on purpose. Every policy accepts the legacy key as well as the new
-- one, so every existing role keeps exactly the access it has today and no role assignment
-- has to be rewritten. company_contacts.manage stays the super-grant; an administrator who
-- wants fine control simply stops granting it and grants the specific keys instead.
--
-- Note on precedence: a role that is DENIED a specific key but ALLOWED the legacy manage key
-- still passes, because the two are OR-ed. That is the documented meaning of manage -- it is
-- the "everything" grant. Fine-grained control requires not granting it.
--
-- No new SECURITY DEFINER function is introduced. Each policy simply calls the existing
-- app_private.has_company_permission twice, so plugin gating, deny handling, owner/admin/
-- developer elevation and the subscription check all keep their current behaviour with no
-- new surface for the security advisor to flag.

-- ---------------------------------------------------------------------------------------
-- Contacts themselves: create / edit / delete are now separable.
-- ---------------------------------------------------------------------------------------

drop policy if exists "company contacts insert" on public.company_contacts;
create policy "company contacts insert" on public.company_contacts
for insert with check (
  app_private.has_company_permission(company_id, 'company_contacts.create')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
);

drop policy if exists "company contacts update" on public.company_contacts;
create policy "company contacts update" on public.company_contacts
for update using (
  app_private.has_company_permission(company_id, 'company_contacts.edit')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.edit')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
);

drop policy if exists "company contacts delete" on public.company_contacts;
create policy "company contacts delete" on public.company_contacts
for delete using (
  app_private.has_company_permission(company_id, 'company_contacts.delete')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
);

-- Reading is unchanged: any active member of the company may read the directory, which is
-- what "company_contacts.view" already expresses at the UI layer.

-- ---------------------------------------------------------------------------------------
-- The schema behind the directory: field definitions, their options, and the contact types.
-- This is the half that is unrecoverable when it goes wrong, so it gets its own key.
-- ---------------------------------------------------------------------------------------

drop policy if exists "company contact fields write" on public.company_contact_fields;
create policy "company contact fields write" on public.company_contact_fields
for all using (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
);

drop policy if exists "company contact types write" on public.company_contact_types;
create policy "company contact types write" on public.company_contact_types
for all using (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
  or app_private.has_company_permission(company_id, 'company_contacts.manage')
);

-- app_private.permission_plugin_ids already maps 'company_contacts.%' onto the
-- company_contacts plugin, so every new key inherits the module gate with no change here.
