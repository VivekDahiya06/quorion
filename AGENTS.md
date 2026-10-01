<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quorion — Agent Guide

This is the main guide to the project for any AI coding agent. `CLAUDE.md` imports this file and adds only Claude Code–specific notes. If you read this file, you should be able to make changes without exploring the repo first. Open the specific files you are about to edit.

---

## ⚠️ Rule 0: keep these docs in sync (mandatory)

**Every change to the codebase must update `AGENTS.md` and/or `CLAUDE.md` in the same piece of work.** A task is not done until the docs describe the code as it now is.

- Added, removed, renamed or moved a file → update **Folder structure**.
- Changed state, props, data flow or a pure function's signature → update **Architecture**.
- Changed services, options, add-ons, prices, tax or terms → update **Domain model**.
- Changed navigation or step behavior → update **Workflow rules**.
- Changed PDF output → update **PDF generation**.
- Added a CSS class pattern, token, font or breakpoint → update **Styling**.
- Introduced a new convention, or fixed or added a gotcha → update **Conventions** or **Gotchas**.
- Added a script, dependency or tool → update **Tech stack / Commands**.
- Agent-agnostic facts go in `AGENTS.md`. Only Claude Code–specific workflow goes in `CLAUDE.md`.
- Never edit the `nextjs-agent-rules` block above. `next dev` manages it.
- Keep the docs concise and factual. Remove anything that is no longer true rather than adding to it.

---

## What the app is

A **client-side quotation calculator for a creative services studio**. The user goes through four steps:

1. **Services**: pick one or more of Web Development, UI/UX Design, Graphic Design, Video Editing.
2. **Configuration**: adjust quantities (counters) and extras (toggles) per service.
3. **Add-ons & billing**: optional recommended extras, plus optional client details.
4. **Review**: full quotation with an INR total including 18% GST (9% CGST + 9% SGST), and a PDF download.

A live **ledger** panel shows the running estimate on every step.

Out of scope: backend, database, persistence, auth, payments, email, IGST, form validation. All state lives in React and resets on reload. The studio identity (name, GSTIN, email) is display-only.

`project.md` is the original product/design spec (exact copy, prices, colors, acceptance criteria). Its "Recommended stack" section (TanStack Start/Vite) is **outdated**: the app is built on Next.js. The code and this file take precedence.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16.3 App Router**, React 19.2, **React Compiler on** (`next.config.ts` → `reactCompiler: true`) |
| Language | TypeScript (strict), path alias `@/*` → `src/*` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css` + `shadcn/tailwind.css`. In practice most styles are **hand-written classes in `globals.css`** |
| UI kit | shadcn/ui, style `base-maia` on `@base-ui/react` (not Radix), icons `@hugeicons/react`. Configured in `components.json`, barely used so far |
| PDF | `jspdf` (dynamically imported, runs in the browser) |
| Package manager | **Bun** (`bun.lock`, `packageManager: bun@1.3.13`) |
| Lint / format | ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript); Prettier 3 with default config (2-space indent) |

## Commands

```bash
bun install            # install deps
bun dev                # dev server → http://localhost:3000
bun run build          # production build (also type-checks)
bun start              # serve the production build
bun run lint           # eslint
bun run typecheck      # tsc --noEmit
bun run format         # prettier --write "src/**/*.{ts,tsx,css}"
```

There is **no test framework**. To verify a change, run `bun run typecheck && bun run lint`. For UI or PDF changes, also run the app and check it manually.

---

## Folder structure

```
quorion/
├─ AGENTS.md / CLAUDE.md        agent docs (this file / Claude-specific)
├─ project.md                   original product + design spec (stack section outdated)
├─ next.config.ts               reactCompiler: true
├─ components.json              shadcn config (aliases, base-maia, hugeicons)
├─ eslint.config.mjs            flat config
└─ src/
   ├─ app/
   │  ├─ layout.tsx             <html>/<body>, metadata, Google Fonts <link>s (Fraunces, Space Grotesk, JetBrains Mono)
   │  ├─ page.tsx               route "/" → renders <QuotationApp />
   │  ├─ error.tsx              "use client" error boundary; uses Next 16 `retry` prop (not `reset`)
   │  ├─ not-found.tsx          404 screen, link back to "/"
   │  ├─ globals.css            theme tokens + ALL component styles + breakpoints + animations
   │  ├─ icon.svg, favicon.ico
   ├─ components/
   │  ├─ quotation-app.tsx      "use client" — the ONLY stateful component; owns all state and handlers
   │  ├─ quotation/             presentational components (props in, callbacks out, no state)
   │  │  ├─ quotation-topbar.tsx       brand lockup, client pill (company || name || "New quotation"), last 4 chars of reference
   │  │  ├─ quotation-step-rail.tsx    left nav of STEPS; ✓ for completed, disabled until a service is selected
   │  │  ├─ quotation-ledger.tsx       right "Your ledger": groups, subtotal/CGST/SGST/grand total, Download PDF
   │  │  ├─ workflow-footer.tsx        Back / Continue ("Review quotation" on step 3), "0N / 04" counter
   │  │  ├─ step-heading.tsx           eyebrow + h1 + description used at the top of each step
   │  │  ├─ section-eyebrow.tsx        <p className="eyebrow">
   │  │  └─ steps/
   │  │     ├─ step-services.tsx       step 1: service cards (toggle select); icon via serviceSymbol(name)
   │  │     ├─ step-configuration.tsx  step 2: service tabs + ServiceConfiguration (counters/switches, per-service subtotal)
   │  │     ├─ step-addons.tsx         step 3: visible add-ons + CLIENT_FIELDS billing form
   │  │     └─ step-review.tsx         step 4: reference/date, prepared-for, line items, totals, terms, download
   │  └─ ui/button.tsx          shadcn Button + buttonVariants (currently unused)
   ├─ constants/                UPPER_SNAKE exports, no logic
   │  ├─ app.constants.ts       APP_CONSTANTS {LOCALE "en-IN", CURRENCY "INR"}, STEPS [{title, note}] ×4
   │  ├─ quotation-catalog.constants.ts  BASE_ENGAGEMENT_NAME, SERVICES, ADD_ONS, STUDIO, QUOTATION_TERMS
   │  └─ quotation-pdf.constants.ts      QUOTATION_PDF_LAYOUT (mm), _COLORS (RGB tuples), _FONT_SIZES, _DATE_LOCALE
   ├─ lib/                      pure functions (plus the PDF side effect)
   │  ├─ quote-calculation.ts   calculateQuote(), formatINR(), createQuotationReference()
   │  ├─ quotation-catalog.ts   getServiceDefaults(service)
   │  ├─ quotation-pdf.ts       downloadQuotationPdf(); also exports the ClientDetails type
   │  └─ utils.ts               cn(), re-exported from the `cn` npm package
   ├─ hooks/
   │  └─ use-quotation-identity.ts  {reference, date} created once in the browser via useSyncExternalStore
   └─ types/
      ├─ quote-catalog.types.ts     Service, ServiceOption = CounterOption | ToggleOption, AddOn
      └─ quote-calculation.types.ts QuoteConfig, QuoteLine, QuoteGroup, QuoteTotals
```

---

## Architecture

### State (all in `quotation-app.tsx`)

| State | Type | Purpose |
|---|---|---|
| `step` | `number` 1–4 | current step |
| `completedSteps` | `number[]` | steps marked ✓ (filtered by `isStepComplete` before display) |
| `selected` | `string[]` | selected service ids, in click order |
| `config` | `QuoteConfig` = `Record<serviceId, Record<optionId, number \| boolean>>` | option values per service |
| `activeService` | `string \| null` | which service tab is open in step 2 |
| `chosenAddOns` | `string[]` | chosen add-on ids |
| `client` | `ClientDetails` {name, company, email, phone, gstin, state} | billing details, all optional strings |
| `isDownloading`, `downloadError` | `boolean`, `string` | PDF download UI state |
| `reference`, `quoteDate` | from `useQuotationIdentity()` | `""` / `null` during SSR, set once in the browser |

Handlers: `toggleService`, `changeOption`, `toggleAddOn`, `changeClient`, `downloadPdf`, `goToStep`, `isStepComplete`. Child components receive data plus these callbacks as props. They never hold state.

### Data flow

```
SERVICES / ADD_ONS (constants) ──┐
selected + config + chosenAddOns ┴─► calculateQuote() ─► QuoteTotals ─┬─► QuotationLedger
                                                                      ├─► StepReview
                                                                      └─► downloadQuotationPdf()
```

- **`calculateQuote(selected, config, chosenAddOns): QuoteTotals`** is the single pricing engine. It runs on every render (the React Compiler handles memoization, so don't add `useMemo`). For each selected service it outputs a group made of a base line (`BASE_ENGAGEMENT_NAME`, `basePrice`), one line per counter with value > 0 (`qty × unitPrice`), and one line per toggle that is on. Chosen add-ons go into one extra group, `id: "additional-services"`. Then: `subtotal`, `gst = subtotal × 0.18`, `cgst = sgst = gst / 2`, `grandTotal`. Counter values are clamped to `[min, max]` and truncated. Missing values fall back to `defaultQuantity ?? 1` / `defaultOn ?? false`.
- `step-configuration.tsx` also calls `calculateQuote([serviceId], …, [])` to show a per-service subtotal.
- **Never compute prices anywhere else.** UI, ledger and PDF must all read `QuoteTotals`.
- `formatINR(n)` → `₹1,23,456` (en-IN, 0 decimals). The PDF uses its own `formatPdfMoney` → `Rs. 1,23,456`, because jsPDF's helvetica font has no ₹ glyph. Line `detail` strings have `₹` replaced with `Rs. ` before drawing.
- `createQuotationReference(date, random)` → `QRN-YYYYMM-NNNN` (NNNN 1000–9999).

### SSR / hydration

The page is server-rendered, and then `QuotationApp` hydrates as a client component. `useQuotationIdentity` uses `useSyncExternalStore` with a fixed server snapshot (`{reference: "", date: null}`). The random reference and the date therefore exist only in the browser, which avoids hydration mismatches. Any code that uses `reference`/`quoteDate` must handle the empty or `null` case (e.g. `"Generating…"`, `"—"`, `"----"`). `downloadPdf` returns early if either is missing.

---

## Domain model (catalog)

Everything lives in `src/constants/quotation-catalog.constants.ts`. Prices are INR, written with `_` separators (e.g. `45_000`).

- `Service = { id, name, tagline, basePrice, options: ServiceOption[] }`
- `CounterOption = { kind: "counter", id, name, note, unitPrice, min, max, defaultQuantity? }`
- `ToggleOption = { kind: "toggle", id, name, note, price, defaultOn? }`
- `AddOn = { id, name, note, price, suffix?, triggers: serviceId[] }`. `suffix` replaces "One-time" as the line detail.

| Service id | Name | Base | Options (id: kind) |
|---|---|---|---|
| `web` | Web Development | 45,000 | pages: counter 22k (1–40, def 5) · admin: toggle 45k (on) · backend 90k · api-migration 30k · database-migration: counter 18k (0–10, def 0) · payment 25k · seo 15k |
| `uiux` | UI / UX Design | 30,000 | screens: counter 6k (1–60, def 8) · design-system 28k (on) · prototype 18k · research 22k |
| `graphic` | Graphic Design | 18,000 | logo 15k (on) · guidelines 25k · templates: counter 2.5k (0–50, def 6) · print 12k |
| `video` | Video Editing | 15,000 | videos: counter 12k (1–40, def 3) · motion 20k (on) · sound 8k · subtitles 4k |

| Add-on id | Price | Triggered by |
|---|---|---|
| `care` (Monthly care plan, suffix "₹6,000 / month") | 72,000 | web |
| `content` | 18,000 | web, uiux |
| `analytics` | 12,000 | web, video |
| `photoshoot` | 35,000 | graphic, video, web |
| `adcreatives` | 22,000 | graphic, video, uiux |

`STUDIO` = {name "Quorion", descriptor, gstin, email}. `QUOTATION_TERMS` = 4 strings, printed in the PDF.

---

## Workflow rules

- `goToStep(n)` rejects `n < 1`, `n > 4`, and any `n > 1` when nothing is selected. Moving forward exactly one step (`n === step + 1`) while the current step is complete adds the current step to `completedSteps`.
- `isStepComplete`: steps 1 and 2 are complete when `selected.length > 0`, step 3 is always complete, step 4 never is.
- Step rail: step 1 is always reachable; steps 2–4 need at least one selected service. The footer's Continue button is disabled on step 4, and on step 1 when nothing is selected.
- **Selecting a service** appends it to `selected`, seeds `config[serviceId]` with `getServiceDefaults()` only if it has no config yet, and makes it the active tab if none is active. **Deselecting** removes it from `selected` and keeps its config, so reselecting restores the user's values. If it was the active tab, the first remaining service becomes active.
- Step 3 shows an add-on if any of its `triggers` is selected **or** it is already chosen. Chosen add-ons stay in the quote even after their trigger service is deselected.
- Both download buttons (ledger and review) are disabled when nothing is selected or while a download is in progress. Errors appear in `<p className="error-message" role="alert">`.
- Client fields have no validation. Blank values are left out of the "Prepared for" text and the PDF. Display name = `company || name || "Client"`. The contact name is shown separately only when both company and name are set.

---

## PDF generation (`src/lib/quotation-pdf.ts`)

`downloadQuotationPdf(quote, client, reference, date)` → `await import("jspdf")`, A4 portrait, units mm. It draws in this order:

1. A header band on every page (studio name, descriptor, GSTIN | email).
2. "QUOTATION" title, reference (courier) and date on the right.
3. PREPARED FOR block.
4. DESCRIPTION/AMOUNT table header, then each group (shaded row with total) and its lines (description + detail, amount on the right).
5. Subtotal / CGST / SGST rows, then a rounded GRAND TOTAL box.
6. TERMS (from `QUOTATION_TERMS`).
7. A footer on each page: `Quorion | <reference>` and `page / total`.

Pagination uses a moving `y` cursor. `ensureSpace(h)` adds a page and redraws the header when needed, and `writeWrapped()` wraps text across pages. The output file is named `Quotation-<reference>.pdf`. All coordinates, colors (RGB tuples) and font sizes come from `quotation-pdf.constants.ts`. Change them there rather than using magic numbers. (The few remaining inline offsets are local spacing.)

---

## Styling

- **Most styling is hand-written semantic CSS in `src/app/globals.css`**, not Tailwind utility classes. Components use plain `<button>`, `<input>`, `<article>` etc. with classes such as `glass`, `button button-primary|button-outline|button-quiet`, `eyebrow`, `num`, `status-dot`, `service-card selected`, `option-row`, `switch on`, `ledger-*`, `review-*`, `addon-card`, `field`, `form-grid`, `slide-in`, `tick`. State is expressed with modifier classes (`selected`, `is-active`, `is-complete`, `on`, `checked`), built with template strings. When editing existing UI, **follow this pattern**: add or extend classes in `globals.css` next to related rules.
- Layout: `.app-shell` > `.topbar` + `.main-grid` (3 columns: `.step-rail` | `.workflow` | `.ledger`) + `.page-footer`. Breakpoints are in `globals.css`: **1150px** (narrower columns), **1023px** (stacked layout), **600px** (mobile). `prefers-reduced-motion` disables animations.
- Theme: **one dark theme**. Tokens are on `:root` (oklch): `--ink` (background), `--panel`, `--mist` (body text), `--glow` (primary blue), `--glow2` (violet), `--good` (green), plus shadcn aliases (`--background`, `--primary`, `--border`, …), `--aurora` and `--gradient-total`. They are exposed to Tailwind via `@theme inline` (`bg-ink`, `text-mist`, `text-glow`, …). There is no `tailwind.config`.
- Fonts: `--font-display` Fraunces (headings), `--font-sans` Space Grotesk (body), `--font-mono` JetBrains Mono (use the `.num` class for figures and references).
- Icons in the current UI are Unicode glyphs (✦ ↗ ⌘ ◈ ▶ ✓ ↓ →) wrapped in `aria-hidden="true"`.
- Accessibility patterns in use: `aria-pressed` on toggle buttons, `role="switch"` + `aria-checked` on option switches, `aria-current="step"` on the active step, `aria-live="polite"` on the workflow and counters, labelled `<label className="field">` wrapping inputs, `autoComplete` set per field.

---

## Conventions

- **File names**: kebab-case. Constants go in `*.constants.ts`, types in `*.types.ts`, hooks in `use-*.ts`.
- **Exports**: named exports for components and functions. The exceptions are `QuotationApp` and Next route files (`page`, `layout`, `error`, `not-found`), which use default exports.
- **Component props** are typed inline in the function signature (`{ a, b }: { a: T; b: U }`), not as separate interfaces.
- **Client boundary**: only `quotation-app.tsx` and `error.tsx` have `"use client"`. Child components become client components because they are imported from there. Don't add the directive to presentational components unless they need it.
- **State**: keep all workflow state in `QuotationApp`. New UI pieces receive props and callbacks. Use functional `setState` updates where the new value depends on the old one.
- **Data first**: catalog, copy and config values belong in `src/constants/`. Pure logic goes in `src/lib/`, shared types in `src/types/`.
- **Imports**: use the `@/` alias across folders; relative `./` / `../` is fine within `components/quotation/`. Use `import type` for type-only imports.
- **Formatting**: Prettier defaults (2 spaces, double quotes, trailing commas). `constants/` and `types/` currently use 4-space indentation, so match the file you're editing or run `bun run format`.
- **Next.js 16 specifics**: `error.tsx` receives `retry` (not `reset`). `layout.tsx` uses the global `LayoutProps<"/">` type helper. Check `node_modules/next/dist/docs/` before using any Next API.
- **No manual memoization** (`useMemo`/`useCallback`/`memo`). The React Compiler handles it.

---

## How-to recipes

**Add or edit a service option**: edit `SERVICES` in the catalog constants. Pricing, defaults, the configuration UI, ledger, review and PDF all pick it up automatically. If you add a new service, also add an icon case to `serviceSymbol()` in `step-services.tsx` (it matches on `service.name`) and consider adding the new id to relevant `ADD_ONS[].triggers`.

**Add an add-on**: append to `ADD_ONS` with `triggers`. Nothing else is needed.

**Change the tax rate or split**: `calculateQuote` (`0.18`, `/ 2`), plus the hard-coded "9%" labels in `quotation-ledger.tsx` and `step-review.tsx`, the PDF summary rows, the "GST 18%" text in `quotation-app.tsx`'s footer and `step-review.tsx`'s terms card, and `QUOTATION_TERMS`.

**Add a client field**: `ClientDetails` type + `EMPTY_CLIENT` (`quotation-app.tsx`) + `CLIENT_FIELDS` and `fieldAutoComplete` (`step-addons.tsx`) + `preparedForDetails` (`step-review.tsx`) + the `details` array in `quotation-pdf.ts`.

**Add or remove a workflow step**: `STEPS` (`app.constants.ts`); the hard-coded `4` bounds and `isStepComplete` in `quotation-app.tsx`; the `step === N` rendering blocks; `workflow-footer.tsx` (`/ 04`, `step === 3` label, `step === 4` disable); the eyebrow numbers ("0N / …") in each step's `StepHeading`.

**Change PDF look**: `quotation-pdf.constants.ts` first, then the drawing code in `quotation-pdf.ts`. Test with many services selected to check page breaks.

---

## Gotchas / known duplication

These are places where the same fact is written more than once. Update every copy, or better, refactor it to a single source and then remove the entry here.

- The base line label "Discovery, project management and QA" is hard-coded in `step-configuration.tsx` instead of using `BASE_ENGAGEMENT_NAME`.
- The terms text in `step-review.tsx`'s terms card duplicates part of `QUOTATION_TERMS`.
- The "Prepared for" detail-building logic is duplicated in `step-review.tsx` (`preparedForDetails`) and `quotation-pdf.ts`.
- GST rate and labels are hard-coded in several places (see the recipe above).
- `serviceSymbol()` matches on the display name, so renaming a service silently changes its icon to ▶.
- `step-review.tsx` hard-codes `"en-IN"` for the date rather than using `APP_CONSTANTS.LOCALE`.
- `ClientDetails` is defined in `lib/quotation-pdf.ts`, not in `types/`.
- `step-configuration.tsx` reads counter values with `Number(value ?? option.defaultQuantity ?? 1)` but doesn't clamp them. `calculateQuote` does clamp, so the UI row amount and the quote can differ only if config holds an out-of-range value.
- `components/ui/button.tsx` exists but is unused. The app uses `.button` CSS classes.

---

## Definition of done

1. `bun run typecheck` and `bun run lint` pass.
2. Behavior was checked in the running app (`bun dev`) for UI or PDF changes.
3. **`AGENTS.md` / `CLAUDE.md` updated to match the change (Rule 0).**
