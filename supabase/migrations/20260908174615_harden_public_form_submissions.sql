-- Bind anonymous public-form uploads to exactly one later submission.
--
-- Signed upload URLs are intentionally short lived, but the object they create is not. An
-- unguessable intent records the server-approved form/question/name/type/size before Storage
-- accepts bytes. The submit endpoint verifies the real Storage metadata, then this routine
-- claims every intent and inserts the response in one transaction.

create table if not exists public.form_upload_intents (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  form_id text not null references public.forms(id) on delete cascade,
  question_id text not null,
  object_path text not null unique,
  expected_name text not null,
  expected_type text not null,
  expected_size bigint not null check (expected_size > 0 and expected_size <= 15728640),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  claimed_at timestamptz,
  response_id text references public.form_responses(id) on delete set null
);

create index if not exists form_upload_intents_form_created_idx
  on public.form_upload_intents (form_id, created_at desc);

create index if not exists form_upload_intents_expired_unclaimed_idx
  on public.form_upload_intents (expires_at)
  where claimed_at is null;

create index if not exists form_upload_intents_response_idx
  on public.form_upload_intents (response_id)
  where response_id is not null;

alter table public.form_upload_intents enable row level security;
revoke all on table public.form_upload_intents from public, anon, authenticated;
grant select, insert, update, delete on table public.form_upload_intents to service_role;

create or replace function public.submit_public_form_response(
  p_response_id text,
  p_company_id text,
  p_form_id text,
  p_submitted_by text,
  p_submitter_email text,
  p_answers jsonb,
  p_upload_intent_ids uuid[] default '{}'::uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '15s'
as $$
declare
  v_form public.forms%rowtype;
  v_claimed integer := 0;
  v_expected integer := coalesce(cardinality(p_upload_intent_ids), 0);
  v_response public.form_responses%rowtype;
  v_role text := coalesce((select auth.role()), current_setting('request.jwt.claim.role', true), '');
begin
  if session_user <> 'postgres' and v_role <> 'service_role' then
    raise exception 'service role required';
  end if;
  if p_response_id is null or length(p_response_id) > 200 then
    raise exception 'invalid response id';
  end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then
    raise exception 'answers must be an object';
  end if;

  select * into v_form
    from public.forms
   where id = p_form_id
     and company_id = p_company_id
     and status = 'Published'
   for share;
  if not found then raise exception 'form is not published'; end if;

  insert into public.form_responses (
    id, company_id, form_id, submitted_by, submitter_email, answers, created_at
  ) values (
    p_response_id,
    p_company_id,
    p_form_id,
    left(coalesce(p_submitted_by, 'Public respondent'), 240),
    left(coalesce(p_submitter_email, ''), 240),
    p_answers,
    now()
  ) returning * into v_response;

  if v_expected > 0 then
    if v_expected <> (select count(distinct item) from unnest(p_upload_intent_ids) item) then
      raise exception 'duplicate upload intent';
    end if;
    update public.form_upload_intents
       set claimed_at = now(), response_id = p_response_id
     where id = any(p_upload_intent_ids)
       and company_id = p_company_id
       and form_id = p_form_id
       and claimed_at is null
       and expires_at > now();
    get diagnostics v_claimed = row_count;
    if v_claimed <> v_expected then raise exception 'upload intent is invalid or expired'; end if;
  end if;

  return to_jsonb(v_response);
end;
$$;

revoke all on function public.submit_public_form_response(text, text, text, text, text, jsonb, uuid[])
  from public, anon, authenticated;
grant execute on function public.submit_public_form_response(text, text, text, text, text, jsonb, uuid[])
  to service_role;

comment on table public.form_upload_intents is
  'Short-lived server approvals that bind a public-form Storage object to one form response.';
comment on function public.submit_public_form_response(text, text, text, text, text, jsonb, uuid[]) is
  'Service-role-only atomic claim of validated upload intents plus public form response insert.';
