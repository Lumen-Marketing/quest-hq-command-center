-- Normalize older live contact rows/columns after adding CRM intake fields.

update public.contacts
set
  pay_type = coalesce(pay_type, ''),
  roof_system = coalesce(roof_system, ''),
  secondary_roof_system = coalesce(secondary_roof_system, ''),
  source = coalesce(source, ''),
  has_multiple_roof_systems = coalesce(has_multiple_roof_systems, false)
where pay_type is null
   or roof_system is null
   or secondary_roof_system is null
   or source is null
   or has_multiple_roof_systems is null;

alter table public.contacts
  alter column source set default '',
  alter column source set not null,
  alter column pay_type set default '',
  alter column pay_type set not null,
  alter column roof_system set default '',
  alter column roof_system set not null,
  alter column secondary_roof_system set default '',
  alter column secondary_roof_system set not null,
  alter column has_multiple_roof_systems set default false,
  alter column has_multiple_roof_systems set not null;
