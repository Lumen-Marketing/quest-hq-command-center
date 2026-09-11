# Code Review — `d050fd9` "Fix sidebar and landing rail spacing"

- **Repo:** `Lumen-Marketing/quest-hq-command-center`
- **Commit reviewed:** `d050fd9` — _Fix sidebar and landing rail spacing_
- **Review date:** 2026-06-23
- **Mode:** Recall (catch every real bug; err on the side of surfacing)
- **Files in scope:** `src/main.js`, `src/styles.css`, rebuilt build outputs in `docs/`

## What changed

- `src/main.js` — the landing-page console rail now wraps each nav label in `<em>` so it can ellipsis-truncate.
- `src/styles.css` — widened the landing console rail (`152px`), added grid rules for the rail `em`/`b` children, and changed `.deck-footer { margin-top: auto → 0 }`.
- `docs/index.html`, `docs/404.html`, `docs/assets/*` — rebuilt asset-hash bumps (`index-CzwmjrQ5.js → index-kN_E08tk.js`, `index-DsF93k3E.css → index-DSYxXBB5.css`). The referenced bundles are committed and consistent — no broken-bundle risk.

## Findings

### 1. High — Mobile landing-console layout regression (`src/styles.css:11123`)

A new **top-level base rule** was added:

```css
.landing-console {
  grid-template-columns: 152px minmax(0, 1fr);   /* line 11122–11123 */
}
```

This rule sits **after** the responsive overrides that collapse the console to a single column on small screens:

| Override | Media query | Line |
| --- | --- | --- |
| `.landing-console { grid-template-columns: 1fr }` | `@media (max-width: 820px)` (opens 8167) | 8196 |
| `.landing-console { grid-template-columns: 1fr }` | `@media (max-width: 760px)` (opens 9616) | 10050 |
| `.landing-console { grid-template-columns: 1fr }` | `@media (max-width: 720px)` (opens 9015) | 9020 |

Media queries do **not** add specificity, so all four `.landing-console` rules have equal specificity `(0,1,0)`. With equal specificity, **source order decides** — and the new rule at 11122 is the last one. It therefore wins at **every** viewport width, overriding the mobile `1fr` rules.

**Failure scenario:** On any viewport ≤ 820px, the console is forced into a two-column `152px minmax(0,1fr)` grid instead of stacking. At ≤ 820/760px the rail is `display:none`, so `.landing-console-main` is auto-placed into the empty 152px first column and the whole preview is crushed to ~152px wide on phones.

**Regression introduced by this commit:** before the change, the effective base rule was at line 8876 (`118px`), which *precedes* the mobile media queries — so they correctly won and mobile stacked. Adding a later base layer flipped that.

**Recommended fix (fix at the right altitude — don't add another override layer):**

```css
/* styles.css:8876 — edit the existing base rule, which precedes the media queries */
.landing-console { grid-template-columns: 152px minmax(0, 1fr); }
```

…and delete the new block at `styles.css:11122`. This keeps the desktop widening while leaving the mobile `1fr` overrides in control.

### 2. Verify intent — Sidebar footer un-pinned (`src/styles.css:10503`)

```diff
 .deck-footer {
   display: grid;
   gap: 8px;
-  margin-top: auto;
+  margin-top: 0;
   padding-top: 10px;
   border-top: 1px solid var(--border);
 }
```

`.deck` is `display:flex; flex-direction:column; height:100dvh`, and **no** deck child (`.deck-brand`, `.company-card`, `.deck-scroll`, `.deck-footer`) has `flex-grow`. `margin-top: auto` was the only thing pinning the footer (company switch + user-profile card) to the bottom of the full-height sidebar.

**Effect:** on viewports tall enough that the nav doesn't fill the sidebar, the footer now floats up directly beneath the nav list with empty space below, instead of hugging the bottom.

This is squarely within the commit's stated intent ("Fix sidebar … spacing"), so it is **likely deliberate** — flagged only to confirm. If the footer should still pin to the bottom, restore `margin-top: auto`.

## What checks out (no action needed)

- **`<em>` label wrapper** (`src/main.js:4851`) — labels were already anonymous grid items in the same column; the `<em>` makes that explicit and enables `text-overflow: ellipsis`. `display: grid` is already set on `.landing-console-rail span:not(.console-mark)` (line 8909), so the new `grid-template-columns`, `em`, and `b` rules all apply correctly. The rail is `aria-hidden`, so repurposing `<em>` for layout has no accessibility cost.
- **Asset-hash bumps** — the new hashed bundles exist on disk and are committed; `docs/index.html` and `docs/404.html` reference them consistently.

## Findings (machine-readable)

```json
[
  {
    "file": "src/styles.css",
    "line": 11123,
    "severity": "high",
    "summary": "New top-level base rule `.landing-console { grid-template-columns: 152px minmax(0,1fr) }` is declared after the mobile media queries that set `1fr`, so with equal specificity it wins on mobile and breaks the stacked layout.",
    "repro": "Viewport <=820px: console forced to 2-column 152px grid; rail is display:none so main content is crushed into the 152px first column.",
    "fix": "Edit the existing base rule at styles.css:8876 to 152px and delete the new block at 11122."
  },
  {
    "file": "src/styles.css",
    "line": 10503,
    "severity": "verify-intent",
    "summary": ".deck-footer margin-top auto -> 0 removes the only mechanism pinning the sidebar footer to the bottom of the full-height flex-column .deck.",
    "repro": "Tall viewport with short nav: footer floats up under the nav with empty space below instead of pinning to the bottom.",
    "fix": "If bottom-pinning is intended, restore margin-top: auto."
  }
]
```
