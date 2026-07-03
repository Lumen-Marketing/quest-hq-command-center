alter table public.contacts
  add column if not exists country_code text,
  add column if not exists country text,
  add column if not exists province text,
  add column if not exists city text,
  add column if not exists barangay text,
  add column if not exists street text,
  add column if not exists block_no text,
  add column if not exists zip text,
  add column if not exists lat text,
  add column if not exists lng text;
