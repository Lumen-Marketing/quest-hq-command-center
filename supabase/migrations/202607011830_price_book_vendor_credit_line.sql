-- Split the vendor credit line into: on_account flag, payment_terms, and a credit_limit.
alter table public.pricebook_vendors
  add column if not exists on_account boolean not null default false,
  add column if not exists payment_terms text not null default 'cod',
  add column if not exists credit_limit numeric(12,2);

update public.pricebook_vendors
  set on_account = (credit_terms is not null and credit_terms <> 'cash_cod'),
      payment_terms = case when credit_terms in ('net_15','net_30','net_45','net_60') then credit_terms else 'cod' end
  where credit_terms is not null;
