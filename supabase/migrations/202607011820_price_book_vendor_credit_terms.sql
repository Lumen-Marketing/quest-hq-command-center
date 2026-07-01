-- Track whether a vendor extends a credit line (net terms) to the subscriber, or is cash/COD.
alter table public.pricebook_vendors
  add column if not exists credit_terms text not null default 'cash_cod';
