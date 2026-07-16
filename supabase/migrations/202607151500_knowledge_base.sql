-- Knowledge Base: a company SOP / document library.
-- Company-scoped, RLS-protected. Any member of the company can read articles;
-- managing (create / edit / delete) requires the files.manage permission — the
-- Knowledge Base is a document library, so it reuses that document permission
-- rather than introducing a new permission key across the whole role system.

create table if not exists public.knowledge_articles (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  title text not null default 'Untitled article',
  body text not null default '',
  category text not null default 'General',
  creator_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_articles_company_updated_idx
  on public.knowledge_articles(company_id, updated_at desc);

alter table public.knowledge_articles enable row level security;

drop policy if exists "members read company knowledge" on public.knowledge_articles;
create policy "members read company knowledge" on public.knowledge_articles
for select to authenticated
using (
  app_private.is_company_member(company_id)
);

drop policy if exists "managers create company knowledge" on public.knowledge_articles;
create policy "managers create company knowledge" on public.knowledge_articles
for insert to authenticated
with check (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'files.manage')
);

drop policy if exists "managers update company knowledge" on public.knowledge_articles;
create policy "managers update company knowledge" on public.knowledge_articles
for update to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'files.manage')
)
with check (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'files.manage')
);

drop policy if exists "managers delete company knowledge" on public.knowledge_articles;
create policy "managers delete company knowledge" on public.knowledge_articles
for delete to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'files.manage')
);

grant select, insert, update, delete on public.knowledge_articles to authenticated;
