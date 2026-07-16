-- Give quote/deal next actions a direct, tenant-safe task relationship.

alter table public.tasks
  add column if not exists deal_id text;

create unique index if not exists deals_company_id_id_uidx
  on public.deals(company_id, id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_company_deal_id_fkey'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_company_deal_id_fkey
      foreign key (company_id, deal_id)
      references public.deals(company_id, id);
  end if;
end
$$;

create index if not exists tasks_company_deal_idx
  on public.tasks(company_id, deal_id, status, due)
  where deal_id is not null and deleted_at is null;
