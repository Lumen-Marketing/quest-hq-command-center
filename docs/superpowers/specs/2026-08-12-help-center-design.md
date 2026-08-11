# Questbase Help Center Design

## Purpose

Questbase is powerful but difficult for a new owner or worker to navigate without guidance. Add a dedicated, searchable Help Center inside the signed-in Questbase shell so a user can understand where features live, follow common workflows, and jump directly to the screen they need without leaving the product.

The Help Center is product documentation. It remains separate from the existing company Knowledge Base, which contains customer-authored SOPs and reference articles.

## Chosen approach

Build a first-class in-app Help Center route that reuses the existing curated `HELP_TOPICS` index. This is preferred over a single static FAQ page because search, categories, and direct links scale better, and preferred over an external documentation site because users should not lose their current company or workspace context.

No database, Supabase, API, or content-management change is required. Help content ships with the application and is therefore versioned with the product behavior it describes.

## Entry points and routing

- Add a circular `?` Help Center button to the desktop top navigation, beside the existing command, refresh, notification, and account controls.
- Add Help Center to the mobile More sheet so the feature remains reachable when the compact top bar hides desktop actions.
- Change the account-menu `Help & support` entry into a `Help Center` link rather than opening the report dialog directly.
- Use the company route `/company/:companyId/help?workspace=:workspaceId` so the selected company and operational workspace remain intact.
- Support `?topic=:topicId` on the Help Center route. Tutorial links, search results, and copied URLs can open the relevant article directly.
- Treat Help Center as a signed-in shell utility rather than an installable workspace plugin. Any signed-in user who can enter the resolved company/workspace may open it, even when subscription-gated business modules are unavailable.

## Page structure

The page uses the existing Questbase visual system and contains four areas:

1. **Header and search**
   - Title: `Help Center`.
   - Short description explaining that users can search for a task or browse common workflows.
   - Search input with a plain-language placeholder such as `What are you trying to do?`.
   - Empty search shows the full permission-allowed catalog. An unmatched search shows a clear no-results state and a Contact support action.

2. **Quick-start guides**
   - A compact row of the highest-value onboarding tutorials: Navigate Questbase, Set up a workspace, Invite your team, and Create your first customer/job.
   - Only quick starts the current user can perform are shown.

3. **Browse and article view**
   - Category filters: Getting started, Daily work, Workspace setup, Team and access, and Account help.
   - Search results and category results display article cards with title, one-sentence answer, article type, and estimated reading time.
   - Selecting an article opens its detail in the same route using `topic` in the query string.
   - A detailed tutorial renders an introduction, numbered steps, optional field/reference explanations, a practical tip, and a button that opens the relevant Questbase module.
   - A short FAQ renders its direct answer and the relevant-module action without inventing unnecessary steps.
   - The detail view includes `Back to all help`, preserving the current search/category when possible.

4. **Still need help**
   - A final support panel offers `Report a problem` through the existing authenticated support modal and `Email support` through the existing configured support address.
   - This reuses the current reporting controller and does not add a second submission path.

## Help content model

Keep `src/assistant/help-index.js` as the single product-help source used by the command palette, floating guide, and new Help Center. Existing topic fields remain compatible. Add optional metadata for the page:

- `category`: one of the five Help Center categories.
- `kind`: `tutorial` or `faq`.
- `moduleId`: the Questbase module whose visibility controls the topic; omit for universally useful topics.
- `route`: the destination section and optional query parameters for the `Open ...` action.
- `guide`: the existing structured tutorial object with `intro`, `steps`, optional supporting sections, and `tip`.
- `readingMinutes`: a small bounded integer shown as orientation, not analytics.

`searchHelp(query)` remains backward compatible for command-palette and dock callers. A separate pure selector applies Help Center filters and permission visibility after search, so the existing grounded assistant behavior does not change.

The first release should cover the highest-friction frontend workflows with complete, accurate tutorials:

- Navigating My work versus Company and using the mobile More menu.
- Switching operational workspaces.
- Completing or reopening workspace setup.
- Inviting a worker and choosing workspaces/roles.
- Understanding roles and permissions.
- Enabling or disabling workspace plugins.
- Returning from Task setup to Tasks.
- Creating and finding contacts, quotes, jobs, tasks, files, and forms.
- Using company search and the Ctrl/Cmd+K command palette.
- Reporting a problem.

## Permission behavior

- General navigation, account, command-palette, and support topics are visible to every signed-in company member.
- A module-specific topic is visible only when the existing module registry, installed-plugin state, and `can()` checks say that user can open the module in the selected workspace.
- The filter is presentation, not authorization. Every destination still passes through the normal route reconciliation, plugin, subscription, workspace-membership, and permission gates.
- Owner/admin-only instructions do not appear to a worker who cannot perform them. A limited worker therefore receives a smaller, relevant Help Center instead of tutorials that lead to blocked screens.
- Content never includes company records, user data, credentials, or production state.

## Loading and bundle behavior

- Implement the page as a lazy-loaded module, matching the existing Knowledge, EOD, setup, and support patterns.
- Import Help Center-specific CSS from the lazy page module so the primary entry bundle does not absorb the page layout.
- Reuse the already-curated help index rather than embedding a second copy of the content in `src/main.js`.
- The page is entirely client-side and should render immediately after the chunk loads; it performs no data fetch beyond the company/workspace state already required by the shell.
- A failed chunk load must show an actionable page-level error with Retry and Contact support actions rather than leaving a blank workspace.

## Accessibility and responsive behavior

- The top-bar `?` control has the accessible name `Open Help Center`, a title, keyboard focus styling, and a true link destination so open-in-new-tab works.
- Search uses a visible label or accessible name and reports the result count.
- Category controls expose selected state, tutorial steps use an ordered list, and the selected article heading receives focus after route navigation.
- Cards and article actions remain keyboard reachable without relying on icon meaning or color.
- On narrow screens, the category rail becomes horizontally scrollable, cards become one column, the article layout stacks, and Help Center remains available through the mobile More sheet.

## Error and empty states

- Unknown or no-longer-valid `topic` values return to the browse view and show a small `That help article is no longer available` notice.
- A search with zero allowed matches explains that no guide was found and offers Clear search plus Contact support.
- If every module-specific topic is filtered out, general Getting started and Account help topics still provide a useful page.
- Direct module links are created at render time using the current company and workspace so switching context does not leave stale hardcoded URLs.

## Testing and verification

Automated coverage must verify:

- The Help Center selector searches, categorizes, and preserves the existing `searchHelp` behavior.
- Module topics are removed when access is denied while general topics remain visible.
- Every topic has a unique id, valid category/kind metadata, a non-empty answer, and a valid destination when one is declared.
- Rich tutorials contain an introduction and at least three concrete steps.
- The Help Center route renders before subscription/plugin blocking and remains company/workspace scoped.
- Desktop top bar, mobile More sheet, and account menu all point to the Help Center.
- `topic` query selection and unknown-topic fallback work without losing workspace context.
- The page retains accessible names, result status, ordered steps, and responsive layout rules.
- Report a problem continues to open the existing support controller rather than introducing a parallel handler.
- Full `npm run check` passes, including bundle budget and top-level boot validation.
- After merge and Git deployment, production smoke must match the exact commit. Signed-in production QA must verify desktop entry, mobile entry, search, a permitted tutorial, a filtered worker view, a direct module jump, and the existing support modal.

## Out of scope

- Customer-editable Help Center content.
- Database-backed article analytics, completion tracking, comments, or ratings.
- Videos, screenshots, an AI-generated answer service, or an external documentation domain.
- Replacing the company Knowledge Base.
- Changing any business-module permission or plugin rule.

