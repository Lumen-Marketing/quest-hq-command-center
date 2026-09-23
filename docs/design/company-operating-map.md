# Company Operating Map: design direction

Status: **direction only, not approved for build.** Use it to guide future Health Map and Ops
Cockpit iterations. Recorded 2026-09-23.

## The idea

Each company should eventually see its work as a **living operational blueprint**, not a card
dashboard: where work enters, how it moves, where it waits, and who holds it. The map should
feel intelligent because it makes relationships visible, before any added AI.

The current Operational Health Map (one container per workspace, with a health level) is the
first, smallest step toward this.

## What the map shows

- **Zones:** the stages or areas work passes through.
- **Paths and handoffs:** how work moves between zones, and where it changes hands.
- **Bottlenecks:** where work piles up or ages.
- **Health overlays on each zone:** Good, Watch, Needs review, Urgent, Stuck.
- **Active work, and owner/status overlays:** who holds what, and in what state.
- **Drill-down areas:** every zone opens the underlying tasks and records.

It should answer, at a glance:

- where work enters
- where it gets stuck
- who owns it
- what needs review
- what is aging
- what moved recently
- where the owner and the ops reviewer should look first

## Configurable per company, never roofing-only

Quest Roofing's flow might read:

`Lead / Follow-up → Bid / Estimate → Underwriting → Sales → Production → Invoice / Payment → AR`

That is **one company's configuration, not the model.** Every company must be able to define its
own zones, labels, order, colors, icons and paths. Nothing in the map's code may assume roofing
stages. Existing per-company data such as workspaces, task types (Task setup) and pipeline stages
are the natural sources for zones.

## Design language

Inspiration: architectural typology diagrams, isometric process maps, blueprint-style flows and
modular spatial diagrams.

- Architectural or blueprint feel; isometric or diagrammatic layout.
- Modular zones, clean lines and paths, strong hierarchy.
- Health overlays per zone, using color sparingly (an edge or a chip, not a flood).
- Soft glass or sheer overlays **only where they improve clarity**; restrained texture.
- Calm, but visually memorable. **Function first:** every visual element must carry
  operational meaning.

Avoid:

- a generic SaaS card grid, or cluttered widgets
- decorative 3D with no operational meaning
- locking the UI to roofing workflows
- spreadsheet density

## Two readers

- **Owner (Abraham): the snapshot.** Where are we good, where are we stuck, what needs review,
  what needs attention today. Only true escalations, summaries and final decisions.
- **Ops reviewer (Alexia): the cockpit.** Who owns what, what has not been updated, what lacks
  proof, what is blocked, and what to review before the owner sees it.

Work flows **team → ops review → owner only when needed.** Labels should not train people to send
everything to the owner. Prefer "Needs review", "Stuck" and "Escalation needed" over naming a
person.

## Path from today

1. Today: workspace containers with health levels (Operational Health Map).
2. Next: zones sourced from per-company configuration (task types or pipeline stages), in the
   company's order, with counts and health per zone.
3. Then: paths between zones from real transitions (activity history), with aging and
   bottleneck overlays.
4. Later: the blueprint or isometric presentation, and per-company styling (colors, icons,
   labels).

Anything beyond step 1 needs explicit approval before it is built.
