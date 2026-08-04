-- Abe's six jobs, as real rows.
--
-- The Jobs rework reads everything from the database, so an empty workspace shows empty
-- screens — correctly, but it makes the new structure look like nothing changed. This puts
-- the six jobs from Abe's design file into a workspace so every tab has something in it:
-- dailies feeding the streak dots, cost buckets feeding projected net, draws feeding the
-- contract tab, a change order mid-flight, plans with a current revision, and start/end
-- dates so the calendar is populated.
--
-- Safe to run more than once: it deletes anything it seeded before doing anything else.
-- Every row is tagged ABE_DEMO_SEED in jobs.notes, so removing them is one delete and the
-- children go with the job by cascade.
--
--   TO REMOVE EVERYTHING THIS CREATED:
--     delete from public.jobs where notes like '%ABE_DEMO_SEED%';
--
-- Dates are relative to the day you run it, so the calendar always has this week on it.

do $$
declare
  v_ws uuid;
  v_co text;
  v_name text := 'Production';   -- <- the workspace to seed. Change if you want a different one.
begin
  select w.id, w.company_id into v_ws, v_co
  from public.workspaces w
  where lower(w.name) = lower(v_name)
  order by w.created_at nulls last
  limit 1;

  if v_ws is null then
    raise exception 'No workspace named "%" was found. Set v_name above to one of: %',
      v_name, (select string_agg(name, ', ' order by name) from public.workspaces);
  end if;

  -- Idempotent: clear a previous run first. Children cascade off the job.
  delete from public.jobs where workspace_id = v_ws and notes like '%ABE_DEMO_SEED%';

  -- ---- the jobs ------------------------------------------------------------------------
  -- Cactus Rd has no dates on purpose: unscheduled is a real state and it should appear
  -- under the calendar rather than on it.
  insert into public.jobs
    (company_id, workspace_id, name, client_name, contact_name, site_address, job_type,
     stage, priority, owner_name, scope, notes, estimate_total, starts_on, ends_on)
  values
    (v_co, v_ws, '58th Pl — Framing', 'Kevin Henderson', 'Kevin Henderson', 'Mesa AZ', 'Framing',
     'In production', 'High', 'Alkeith + 4',
     'Garage walls, headers south side, laundry reframe.',
     'ABE_DEMO_SEED · No start before 7am · dogs in backyard. Closet 8x10 · door +12" · change order awaiting his text.',
     20000, current_date - 9, current_date + 3),

    (v_co, v_ws, 'Onyx Ave — Demo', 'Kevin Henderson', 'Kevin Henderson', 'Mesa AZ', 'Demo',
     'In production', 'Medium', 'Crew B + 3',
     'Full interior gut, kitchen and baths. Save the garage slab.',
     'ABE_DEMO_SEED · Gate code 4482 · water off at meter. Client confirmed: save the garage slab.',
     9000, current_date - 3, current_date + 1),

    (v_co, v_ws, '209th Ave — Roofing', 'Bryan Mccurby', 'Bryan Mccurby', 'Wittmann AZ', 'Roofing',
     'In production', 'High', 'Sub crew',
     'Tear-off and re-roof, both slopes. Piece rate per sub agreement.',
     'ABE_DEMO_SEED · Long driveway — deliveries stage at gate. Sub crew missed a daily.',
     14500, current_date - 2, current_date + 6),

    (v_co, v_ws, 'Villa Ct — Roofing', 'Alex Rodenburg', 'Alex Rodenburg', 'Gilbert AZ', 'Roofing',
     'QC / punch list', 'Medium', 'Alkeith',
     'Re-roof complete, working the punch list.',
     'ABE_DEMO_SEED · Ridge cap colour to confirm with Alex.',
     16800, current_date - 14, current_date + 2),

    (v_co, v_ws, 'Pima St — Siding', 'Dolson Construction', 'Dolson Construction', 'Scottsdale AZ', 'Siding',
     'Scheduled', 'Medium', 'Crew B',
     'Siding replacement, north and east elevations. GC job.',
     'ABE_DEMO_SEED · Badge in at gate office. GC — invoice to office email.',
     11200, current_date + 2, current_date + 9),

    (v_co, v_ws, 'Cactus Rd — Concrete', 'Malik Hegge', 'Malik Hegge', 'Peoria AZ', 'Concrete',
     'Unscheduled', 'Low', 'Sub TBD',
     'Driveway and rear slab pour. Bid accepted, needs a crew and dates.',
     'ABE_DEMO_SEED · Client flexible on dates. Waiting on sub availability.',
     7400, null, null);

  -- ---- cost buckets --------------------------------------------------------------------
  -- A "final" bucket counts at what was actually spent; an open one counts at the greater of
  -- expected and spent. That is what makes projected net firm up as buckets close.
  insert into public.job_cost_buckets (company_id, job_id, name, expected, spent, status, note, sort_order)
  select v_co, j.id, b.name, b.expected, b.spent, b.status, b.note, b.sort_order
  from public.jobs j
  join (values
    ('58th Pl — Framing',   'Labor',                    9000, 7000, 'open',  'On pace — tracking under budget',        0),
    ('58th Pl — Framing',   'Hardware',                 2000, 2340, 'final', 'Closed $340 over — locked into net',     1),
    ('58th Pl — Framing',   'Material',                    0,  480, 'final', 'Hold downs — on the change order',       2),
    ('58th Pl — Framing',   'Equipment',                1500,    0, 'later', 'Crane due at trusses',                   3),
    ('Onyx Ave — Demo',     'Labor',                    5200, 3100, 'open',  'Tracking on pace',                       0),
    ('Onyx Ave — Demo',     'Dump fees',                1400,  800, 'open',  'One more roll-off expected',             1),
    ('209th Ave — Roofing', 'Sub (piece rate)',         8200,    0, 'open',  'Paid at milestones per agreement',       0),
    ('209th Ave — Roofing', 'Material (roofing store)', 3900, 3780, 'final', 'All purchased — final',                  1),
    ('Villa Ct — Roofing',  'Sub',                      9000, 8900, 'final', 'Final',                                  0),
    ('Villa Ct — Roofing',  'Material',                 3600, 3200, 'final', 'Final',                                  1),
    ('Pima St — Siding',    'Labor',                    6200,    0, 'later', 'Starts Wednesday',                       0),
    ('Pima St — Siding',    'Material',                 2800,    0, 'later', 'Order placed',                           1),
    ('Cactus Rd — Concrete','Sub',                      4800,    0, 'later', 'Bid accepted',                           0),
    ('Cactus Rd — Concrete','Material',                  900,    0, 'later', 'Not ordered yet',                        1)
  ) as b(job_name, name, expected, spent, status, note, sort_order) on b.job_name = j.name
  where j.workspace_id = v_ws and j.notes like '%ABE_DEMO_SEED%';

  -- ---- draws ---------------------------------------------------------------------------
  -- Two are 'unlocked', which is what puts money on the dashboard's ready-to-invoice tile.
  insert into public.job_draws (company_id, job_id, label, amount, status, paid_at, sort_order)
  select v_co, j.id, d.label, d.amount, d.status,
         case when d.status = 'paid' then now() - interval '5 days' end, d.sort_order
  from public.jobs j
  join (values
    ('58th Pl — Framing',   'Draw 1 — first day on site',        7500, 'paid',     0),
    ('58th Pl — Framing',   'Draw 2 — end of first week',       10000, 'paid',     1),
    ('58th Pl — Framing',   'Draw 3 — strap & shear (insp Fri)',10000, 'unlocked', 2),
    ('Onyx Ave — Demo',     'Down payment',                      4500, 'paid',     0),
    ('Onyx Ave — Demo',     'Completion — final walk',           4500, 'locked',   1),
    ('209th Ave — Roofing', 'Before commencement',               7250, 'paid',     0),
    ('209th Ave — Roofing', 'Upon completion',                   7250, 'locked',   1),
    ('Villa Ct — Roofing',  'Start',                             8400, 'paid',     0),
    ('Villa Ct — Roofing',  'Completion',                        8400, 'unlocked', 1),
    ('Pima St — Siding',    'Mobilization',                      5600, 'locked',   0),
    ('Pima St — Siding',    'Completion',                        5600, 'locked',   1),
    ('Cactus Rd — Concrete','Start',                             3700, 'locked',   0),
    ('Cactus Rd — Concrete','Completion',                        3700, 'locked',   1)
  ) as d(job_name, label, amount, status, sort_order) on d.job_name = j.name
  where j.workspace_id = v_ws and j.notes like '%ABE_DEMO_SEED%';

  -- ---- dailies -------------------------------------------------------------------------
  -- 209th deliberately has a gap: yesterday has no daily, which is the missing-daily flag
  -- Abe's design leads with. 58th has an 'ok' day so the streak shows more than one colour.
  insert into public.job_dailies
    (company_id, job_id, report_date, crew_label, crew_names, production, production_note,
     site_cleaned, materials_ok, materials_needed, notes, photo_count)
  select v_co, j.id, current_date - r.days_ago, r.crew, r.names, r.production, r.pct,
         r.cleaned, r.mat_ok, r.needed, r.notes, r.photos
  from public.jobs j
  join (values
    ('58th Pl — Framing', 1, 'Alkeith + 4', array['Miguel','Chuy','Beto','Junior'], 'good', '',
     true, false, array['2x6 (40)','Fascia'],
     'Stood garage walls, set headers south side. Plumb and braced.', 12),
    ('58th Pl — Framing', 3, 'Alkeith + 3', array['Miguel','Chuy','Beto'], 'ok', '80% — concrete crew in the way',
     true, true, array[]::text[],
     'Half day — framed laundry, waiting on change order acceptance.', 9),
    ('Onyx Ave — Demo', 1, 'Crew B + 3', array['Luis','Danny','Ray'], 'good', '',
     true, true, array[]::text[],
     'Kitchen and baths gutted, hauled two loads.', 8),
    ('209th Ave — Roofing', 2, 'Sub crew', array['Sub foreman'], 'good', '',
     true, true, array[]::text[],
     'Tear-off complete south slope. Piece rate — 35% complete.', 6),
    ('Villa Ct — Roofing', 1, 'Alkeith', array['Alkeith'], 'good', '',
     true, true, array[]::text[],
     'Punch items 60% done.', 5)
  ) as r(job_name, days_ago, crew, names, production, pct, cleaned, mat_ok, needed, notes, photos)
    on r.job_name = j.name
  where j.workspace_id = v_ws and j.notes like '%ABE_DEMO_SEED%';

  -- ---- change orders -------------------------------------------------------------------
  -- Left at 'sent': the next step is a real button, so the Change Orders tab has something
  -- to actually do rather than a finished record to look at.
  insert into public.job_change_orders
    (company_id, job_id, title, description, price, cost, step, requested_by, asked_via,
     sent_via, execute_when)
  select v_co, j.id,
    'Move laundry walls +12", frame 4 windows',
    'Move both laundry walls 12" · closet 6x5 → 8x10 · frame 4 new windows south wall.',
    3590, 1975, 'sent', 'Kevin Henderson', 'in_person', 'text', 'on_acceptance'
  from public.jobs j
  where j.workspace_id = v_ws and j.notes like '%ABE_DEMO_SEED%' and j.name = '58th Pl — Framing';

  -- ---- plans ---------------------------------------------------------------------------
  -- Exactly one current plan per job — a partial unique index enforces it, and the point of
  -- the tab is answering "which set is the crew building to".
  insert into public.job_plans (company_id, job_id, name, version, is_current)
  select v_co, j.id, p.name, p.version, p.is_current
  from public.jobs j
  join (values
    ('58th Pl — Framing',   'Bid set',                   'v1', false),
    ('58th Pl — Framing',   'Proof set',                 'v2', false),
    ('58th Pl — Framing',   'Revision — laundry walls',  'v3', true),
    ('Onyx Ave — Demo',     'Scope sheet',               'v1', true),
    ('209th Ave — Roofing', 'Roof plan',                 'v1', true),
    ('Villa Ct — Roofing',  'Roof plan',                 'v1', true),
    ('Pima St — Siding',    'Elevations',                'v1', true),
    ('Cactus Rd — Concrete','Site plan',                 'v1', true)
  ) as p(job_name, name, version, is_current) on p.job_name = j.name
  where j.workspace_id = v_ws and j.notes like '%ABE_DEMO_SEED%';

  raise notice 'Seeded % jobs into workspace % (%)',
    (select count(*) from public.jobs where workspace_id = v_ws and notes like '%ABE_DEMO_SEED%'),
    v_name, v_ws;
end $$;
