# Workspace Sidebar Navigation Design

## Goal

Make workspace selection visible and useful in the Command Center sidebar, matching the supplied reference: accessible workspaces appear as a persistent list, the active workspace is highlighted, and create/manage actions sit directly below the list.

## Scope

- Replace the compact company card/dropdown in the desktop command rail with a persistent workspace navigation block.
- Render every workspace returned by the existing `allowedCompanies()` membership filter.
- Keep the active workspace first and visually selected.
- Switch workspaces through the existing `select-workspace` action so the current module route is preserved and workspace-scoped pipeline stages reload.
- Add `Create workspace` and `Manage workspaces` links to the existing Company settings surface, where workspace creation and identity controls already live.
- Preserve the My work/Company navigation scope toggle below the workspace block.
- Keep collapsed and mobile navigation usable without adding a new tenant model or database migration.

## Architecture

The existing `companies` rows continue to represent top-level workspaces and `company_memberships` continue to determine access. The change is presentation-only: `renderCompanySwitch()` will render a sidebar list in deck mode, while non-deck callers retain the existing compact select. `setActiveCompany()` remains the single switching path and continues to reset scoped UI state, apply the selected company's pipeline stages, and navigate to the same module for the new workspace.

## Interaction Design

- The block header reads `Workspaces` and shows the number available.
- Each row includes the saved workspace icon and name; the active row uses a warm highlighted background and `aria-current="true"`.
- A compact `More workspaces` control expands or collapses the list when more than six workspaces are accessible.
- `Create workspace` routes to Company settings with the creation form anchor.
- `Manage workspaces` routes to Company settings with the workspace identity section.
- In collapsed sidebar mode, only the active workspace icon remains visible.

## Accessibility and Responsive Behavior

Workspace rows are real buttons with unique accessible labels. The active workspace is exposed with `aria-current`. The list stays keyboard accessible. At narrow/mobile breakpoints, the current mobile navigation behavior remains unchanged; the workspace block is available inside the same navigation sheet.

## Verification

- Static navigation contract test for the persistent list, active state, actions, and CSS hooks.
- Existing workspace creation and sidebar navigation tests.
- Full `npm run check`.
- Production browser verification after the Vercel deployment reaches READY.

