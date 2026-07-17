# Job Center Navigation and Underwriter Design

Date: 2026-07-18  
Status: Approved visual direction; implementation pending  
Selected direction: Technical Ledger (option 3)

## Objective

Bring Quest HQ closer to the stakeholder-approved Job Center shell while improving the integrated Underwriter for fast, accurate daily estimating. The change is a visual and information-architecture refinement of the existing Vite SPA. It does not create a second application, task model, calculator, or data path.

The selected visual reference is [quest-hq-underwriter-technical-ledger.png](../../design/quest-hq-underwriter-technical-ledger.png).

## Design authority

Implementation must reconcile three sources in this order:

1. The stakeholder-provided navigation reference and its React/CSS specification.
2. The selected Technical Ledger visual reference.
3. The current production Quest HQ behavior, permissions, routes, and data contracts.

The new shell must preserve live module permission gates, installed-plugin checks, company tenancy, the read-only demo, mobile navigation, and the existing Underwriter persistence rules.

## Navigation shell

### Desktop rail

- Width: 264px.
- Background: white.
- Right divider: `#E8EAED`.
- Horizontal padding: 12px; top/bottom padding: 16px.
- Navigation rows: compact, flat, approximately 7px vertical by 10px horizontal padding, 8px radius.
- Default text: `#545B64`.
- Active row: pale orange fill and `#ED4E0D` text.
- Hover row: `#F4F5F7`.
- Icons: 18px Tabler icons or the closest existing repository icon.
- Count badges: orange circle/pill with white text.
- Nested stages: 6px colored dot, thin vertical guide, 12.5px label text.
- Chevron expands and collapses Contacts and Jobs stages.

### Rail structure

The desktop rail uses the following visible hierarchy:

- Brand: Quest / command center.
- Company selector: All companies for multi-company members; preserve the current single-company behavior when only one membership is available.
- Search or jump to.
- Scope switch: My work / Company.
- Work: Home, My tasks, Inbox.
- Pipeline: Contacts and its stage rows.
- Production: Jobs and its stage rows.
- Tools: Estimator, Proposals.
- Review: Reports, People, Meetings.
- Build: Templates, Automations.
- Bottom account row: avatar, name, role, settings.

The selected design names the integrated Underwriter entry `Estimator` while retaining the existing Underwriter route and permissions. The page heading remains `Underwriting calculator`. No duplicate Underwriter or Estimator module may appear.

Planned items must remain visually distinct and must not be presented as shipped functionality.

### Pipeline stages

Preserve live stage data and route behavior. The visual reference establishes the preferred ordering and labels:

- Prospects
- Leads
- Underwriting
- Estimate sent
- Negotiating
- Contract out
- Won -> Jobs
- Follow-up
- Lost

Job stage labels must come from the live company configuration rather than a hard-coded parallel list. The supplied Production list is a presentation reference, not permission to fork pipeline data.

## Typography

- Primary family: IBM Plex Sans.
- Numeric and metadata family: IBM Plex Mono.
- Body text: 14-15px where space allows; navigation rows may use 13-13.5px.
- Section labels: IBM Plex Mono, approximately 10.5px, uppercase, `0.09em` tracking, `#9AA0A8`.
- Financial values, percentages, counts, table headings, keyboard hints, and compact metadata use IBM Plex Mono.
- Page and panel headings use IBM Plex Sans with restrained 600 weight.
- No more than these two families in the main application shell and Underwriter.

Fonts should be loaded explicitly rather than relying on an uninstalled system fallback. Existing icon-font declarations and document-preview serif styles are outside this typography migration.

## Underwriter workspace

### Information order

1. Compact summary strip: Underwriting, Estimate queue, Pipeline value, Quest CRM stage.
2. CRM stage filters.
3. Underwriting calculator and decision summary in one primary surface.
4. Estimate/Underwriter queue table.

The calculator begins high in the viewport. Large title-page whitespace and duplicate introductory blocks are removed.

### Calculator

- Main content uses a two-column labeled input grid.
- Contact selection spans the calculator width.
- Contract price and target margin form the first paired row.
- Direct costs and percentage costs remain grouped and aligned.
- Decision notes remain visible without forcing the user into a secondary modal.
- Monetary and percentage values align through IBM Plex Mono.
- Existing calculation rules in `src/underwriting/calculator.js` remain the source of truth.
- Existing durable `underwriting_cases` persistence and company/contact scoping remain unchanged.

### Decision summary

- Fixed right-side column inside the primary Underwriter surface.
- Shows gross profit, gross margin, total cost, break-even price, direct costs, overhead, commissions, contingency, direct-cost headroom, and maximum direct cost at target.
- Uses thin dividers and aligned numeric values rather than separate metric cards.
- Updates from the same calculator state as the inputs.
- The save action remains explicit and uses the Quest orange primary treatment.

### Queue

- Appears immediately below the calculator.
- Uses a compact table with readable columns for contact/company, stage, contract price, target margin, and last updated.
- Existing permission and read-only behavior remains authoritative.
- No production customer records or personal data are added to fixtures, documentation, or screenshots.

## Responsive behavior

- The 264px rail is desktop-only.
- Preserve the existing mobile topbar and More-sheet behavior so all permitted modules remain reachable.
- At tablet widths, the rail may collapse to the existing compact icon behavior before switching to mobile navigation.
- The calculator stacks the decision summary below the inputs when two columns no longer fit without horizontal overflow.
- Inputs, buttons, navigation rows, and mobile actions retain at least 44px touch targets where the existing responsive system requires them.

## Implementation boundaries

- Primary source files: `src/main.js`, `src/styles.css`, and `index.html` for font loading.
- Reuse the existing module registry, permission checks, routes, stage configuration, calculator state, and persistence APIs.
- Do not start a local server.
- Do not change Supabase schema or RLS for this visual refinement.
- Avoid broad unrelated refactors in the monolithic source files.
- Keep the public read-only demo functional.
- Update the project brain if module terminology or current product state changes materially.

## Verification

Required deterministic checks:

- `npm run check`
- `git diff --check`

Required focused verification:

- Existing Underwriter calculation tests continue to pass.
- Add or update static tests for font loading, desktop rail structure, active navigation state, Estimator/Underwriter naming, and responsive stacking.
- Confirm no duplicate navigation entries appear.
- Confirm planned modules are not reported as shipped.
- Confirm the read-only demo cannot persist calculator changes.
- Confirm company, plugin, and permission gates still hide disallowed modules.

After merge, verify the Vercel production deployment and smoke-test the Job Center routes without running a local server.

## Acceptance criteria

- The desktop rail visibly matches the supplied compact Job Center reference.
- IBM Plex Sans and IBM Plex Mono render throughout the application shell and Underwriter roles defined above.
- The integrated Underwriter matches the Technical Ledger hierarchy and remains fully functional.
- Existing tenancy, permissions, read-only behavior, routes, calculations, and persistence remain intact.
- Desktop, tablet, and mobile layouts have no clipped text or unintended horizontal overflow.
- Repository checks and the production smoke flow pass.
