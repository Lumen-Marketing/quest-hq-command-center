# Design QA — Quest HQ Standalone Navbar

## Evidence

- Stakeholder source screenshot: `docs/design/quest-hq-navbar-standalone-source.png`
- Stakeholder standalone specification: `C:/Users/My PC/Downloads/navigation bar  (1).docx`
- Initial production mismatch: `docs/design/quest-hq-navbar-current-afe4b73.png`
- Production implementation: `docs/design/quest-hq-navbar-production-6699c9f.jpg`
- Focused side-by-side comparison: `docs/design/quest-hq-navbar-focused-comparison-6699c9f.jpg`
- Viewport: 1488 × 1058, production URL, light theme, public read-only Roofing workspace, Underwriter route.

## Comparison history

1. The initial production capture still used the legacy customizable Contacts stages: All contacts, Prospects, Leads, and Nurturing.
2. The standalone source defines a distinct sales lifecycle: Prospects, Leads, Underwriting, Estimate sent, Negotiating, Contract out, Won → Jobs, Follow-up, and Lost, with a divider before the off-ramp stages.
3. Production commit `6699c9f` adds that exact lifecycle to the sidebar, removes the injected All contacts row, connects every row to a lifecycle-filtered Contacts route, and uses live counts derived from contacts and their linked deals.

## Visual review

- Typography: existing Quest UI fonts, weights, and compact uppercase group labels are preserved. Passed.
- Navigation hierarchy: Work, Pipeline, Contacts, and the complete nine-stage lifecycle match the standalone reference. Passed.
- Spacing: nested stage indentation, row rhythm, divider, and count alignment remain compact and readable. Passed.
- Color: lifecycle dots preserve the reference's gray, blue, amber, violet, green, and red stage coding. Passed.
- Assets: the existing Quest logo and production icon library are used; no placeholder or fabricated visible assets. Passed.
- Copy: Prospects, Leads, Underwriting, Estimate sent, Negotiating, Contract out, Won → Jobs, Follow-up, and Lost match the stakeholder source. Passed.

## Interaction review

- The Underwriting sidebar link changed the production route to `/company/roofing/contacts?lifecycle=underwriting`.
- The Contacts screen rendered the Underwriting heading, `0 items`, and `Filtered by Underwriting`, confirming functional filtering.
- The Underwriter stage chips use the same nine-stage lifecycle and live counts.
- Browser console warnings/errors: none observed during the final production flow.
- Vercel runtime errors in the final one-hour verification window: none.
- Production smoke: 36/36 routes and 3/3 critical assets passed for `6699c9f4f5ee8915f2226dfc2d67477b4c0e8cec`.

## Remaining severity

- P0: none.
- P1: none.
- P2: none.
- P3: the production shell shows live counts and the active Estimator route, while the stakeholder crop shows Home selected and illustrative counts.

## Final result

passed
