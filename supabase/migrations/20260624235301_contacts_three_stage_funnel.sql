-- Collapse the Contacts top-of-funnel module to the current three-stage model:
-- Prospects -> Leads -> Nurturing. Existing contact records are preserved and
-- legacy quote-like contact stages are mapped into Nurturing.

update public.contacts
set stage = case
  when lower(stage) in ('prospect', 'prospects') then 'Prospects'
  when lower(stage) in ('contacted', 'lead', 'leads') then 'Leads'
  when lower(stage) in (
    'nurturing',
    'underwriting',
    'estimate sent',
    'proposal sent',
    'negotiating',
    'negotiation',
    'contract out',
    'contract sent',
    'waiting to sign',
    'won',
    'follow-up',
    'lost'
  ) then 'Nurturing'
  else stage
end
where lower(stage) in (
  'prospect',
  'prospects',
  'contacted',
  'lead',
  'leads',
  'nurturing',
  'underwriting',
  'estimate sent',
  'proposal sent',
  'negotiating',
  'negotiation',
  'contract out',
  'contract sent',
  'waiting to sign',
  'won',
  'follow-up',
  'lost'
);

delete from public.pipeline_stages
where kind = 'contacts'
  and lower(name) in (
    'prospect',
    'prospects',
    'contacted',
    'lead',
    'leads',
    'nurturing',
    'underwriting',
    'estimate sent',
    'proposal sent',
    'negotiating',
    'negotiation',
    'contract out',
    'contract sent',
    'waiting to sign',
    'won',
    'follow-up',
    'lost'
  );

insert into public.pipeline_stages (company_id, kind, name, color, position)
select c.id, 'contacts', s.name, s.color, s.position
from public.companies c
cross join (values
  ('Prospects', '#9AA0A8', 0),
  ('Leads', '#378ADD', 1),
  ('Nurturing', '#5AB0A6', 2)
) as s(name, color, position)
on conflict (company_id, kind, name) do update
set color = excluded.color,
    position = excluded.position,
    updated_at = now();
