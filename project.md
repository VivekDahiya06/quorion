# Quorion — Project Implementation Specification

## Purpose

Build a polished, client-side quotation calculator for a creative services studio. Users select services, configure project scope, optionally add recommended extras, enter client billing details, review a live INR estimate including GST, and download a shareable PDF quotation.

Reproduce the behavior and user experience described here in a blank project. Use the latest stable compatible versions of dependencies at implementation time rather than copying stale package versions.

## Product behavior and scope

- Single-page application with a four-step quotation workflow.
- No backend, database, authentication, or persistence. Quote and client state live in React and reset on reload.
- Keep the pricing catalog as the single source of truth. Use shared pure quote-calculation functions for the UI and PDF.
- Prices are in Indian rupees (INR). Apply GST at 18%, split equally into 9% CGST and 9% SGST. Client state does not affect tax handling.
- Generate the quotation date and reference in the browser.
- Allow PDF downloads from both the live ledger and final review. The ledger download is disabled until at least one service is selected.
- No account system, payment processing, email sending, saved quotes, server-side PDF generation, or IGST handling.
- Client fields have no required validation in the current behavior; include values in the PDF when provided.
- Static studio identity details are display values, not a real tax-invoice service.

## Recommended stack and setup

- React and TypeScript using the latest stable compatible versions.
- TanStack Start / TanStack Router for file-based routing and SSR support. The calculator itself is client-side and needs no server functions.
- Vite, Tailwind CSS v4, and jsPDF.
- Use the framework's current official setup and plugin conventions. Do not register plugins a framework integration already includes. Treat generated route-tree files as generated artifacts.
- Keep TypeScript strict. Provide development, production build, preview, lint, format, and type-check scripts. No test suite exists in the source project; add focused calculation tests if the new project already has a test runner.

Main route: `/`. The root layout should set document metadata, load styles/fonts, and render the route outlet. Include a not-found screen and error boundary if supported by the selected framework setup.

## State model

Keep page state for:

- `step`: current workflow step, starting at `1`.
- `selected`: selected service IDs, initially empty.
- `config`: per-service/per-option values.
- `activeService`: service displayed in the configuration step.
- `chosenAddOns`: selected add-on IDs.
- `client`: `name`, `company`, `email`, `phone`, `gstin`, and `state`, initially empty.
- `ref`: one quotation reference generated per page instance, not on every render.

Compute totals from selected services, configuration, and chosen add-ons, and update immediately when any changes.

### Navigation and selection rules

Steps: 1. Services, 2. Configuration, 3. Add-ons, 4. Quotation.

- Initially only step 1 is reachable. Once at least one service is selected, all four steps are reachable from the step rail.
- Bound navigation to steps 1–4. Disable Back on step 1. Disable Continue when no service is selected and on step 4.
- Selecting a service initializes its configuration from catalog defaults unless configuration already exists. Make it active if there is no active service.
- Deselecting a service preserves its configuration. If it was active, select another remaining service or clear the active service.
- On the configuration step, show a selector for each selected service; changing the active service only changes the displayed options.
- The Continue label on step 3 is “Review quotation.”

## Service catalog

All prices are INR. Every selected service has a base engagement line described as “Discovery, project management and QA.” A counter option has a default quantity and min/max; a toggle has a default on/off value.

### Web Development

- ID: `web`; base ₹45,000.
- Tagline: “Pages, admin panel, backend, API & database migration.”
- Website pages: counter, ₹22,000/page, min 1, max 40, default 5. Custom-designed pages, up to 8 blocks each.
- Admin panel: toggle, ₹45,000, default on. Content management with role-based access.
- Backend & APIs: toggle, ₹90,000, default off. REST endpoints, auth, and business logic.
- API migration: toggle, ₹30,000, default off. Re-point and re-document existing integrations.
- Database migration: counter, ₹18,000/system, min 0, max 10, default 0. Per legacy system or data source.
- Payment gateway: toggle, ₹25,000, default off. Razorpay or Stripe checkout with invoicing.
- Technical SEO setup: toggle, ₹15,000, default off. Schema, sitemaps, metadata and page speed pass.

### UI / UX Design

- ID: `uiux`; base ₹30,000.
- Tagline: “Wireframes, hi-fi screens, prototypes and design systems.”
- Hi-fi screens: counter, ₹6,000/screen, min 1, max 60, default 8. Desktop and mobile states per screen.
- Design system: toggle, ₹28,000, default on. Tokens, components and usage documentation.
- Clickable prototype: toggle, ₹18,000, default off. Interactive flows for stakeholder review.
- User research: toggle, ₹22,000, default off. Five interviews, findings and recommendations.

### Graphic Design

- ID: `graphic`; base ₹18,000.
- Tagline: “Logo, brand kit, social templates and print collateral.”
- Logo suite: toggle, ₹15,000, default on. Primary, secondary and favicon lockups.
- Brand guidelines: toggle, ₹25,000, default off. Colour, type, imagery and tone rules.
- Social templates: counter, ₹2,500/template, min 0, max 50, default 6. Editable post and story templates.
- Print collateral: toggle, ₹12,000, default off. Cards, brochure and standee artwork.

### Video Editing

- ID: `video`; base ₹15,000.
- Tagline: “Reels, cutdowns, motion graphics and sound design.”
- Edited videos: counter, ₹12,000/video, min 1, max 40, default 3. Up to 90 seconds each, two revision rounds.
- Motion graphics: toggle, ₹20,000, default on. Animated titles, lower thirds and transitions.
- Sound design & mix: toggle, ₹8,000, default off. Licensed music, SFX and dialogue clean-up.
- Subtitles & captions: toggle, ₹4,000, default off. Burned-in captions plus SRT files.

## Suggested add-ons

Each add-on has an ID, name, note, flat price, optional display suffix, and service IDs that trigger its recommendation.

- Monthly care plan (`care`): ₹72,000; suffix “₹6,000 / month”; trigger `web`. Hosting, backups and 4 hours of support each month, billed for 12 months.
- Content writing (`content`): ₹18,000; triggers `web`, `uiux`. SEO-ready copy for every page, one revision round.
- Analytics & dashboards (`analytics`): ₹12,000; triggers `web`, `video`. GA4, events and a conversion dashboard.
- Product photoshoot (`photoshoot`): ₹35,000; triggers `graphic`, `video`, `web`. Half-day shoot, 25 retouched images.
- Ad creative pack (`adcreatives`): ₹22,000; triggers `graphic`, `video`, `uiux`. 10 static and 3 video ad variants for launch.

Show an add-on if at least one trigger service is selected or if the add-on is already chosen. This keeps chosen add-ons visible after a triggering service is deselected. A chosen add-on remains included until explicitly removed.

## Quote calculation

Keep calculation logic in a pure module separate from React components.

- For each selected service, create one group with a base engagement line and configured option lines.
- A counter line is included only when quantity is greater than zero. Amount is `quantity × unit price`; detail shows quantity and unit price.
- A toggle line is included only when its value is true. Its detail is “One-time.”
- Group total is the sum of its line amounts.
- If chosen add-ons exist, create one “Additional services” group, with one line per add-on. Use its suffix as detail when present, otherwise “One-time.”
- `subtotal` is the sum of group totals.
- `gst = subtotal × 0.18`; `cgst = gst / 2`; `sgst = gst / 2`; `grandTotal = subtotal + gst`.
- Do not round intermediate values. For display, round to the nearest whole rupee and use `en-IN` grouping, e.g. `₹1,23,456`. PDF values may use `Rs.` instead of `₹`.
- Default a counter to its catalog default quantity (or 1 when absent) and a toggle to `defaultOn` (or false when absent).
- Bound counter inputs to option min/max.
- Ignore unknown service IDs and missing config safely.
- Generate references as `QRN-YYYYMM-NNNN`: local year/month and a random four-digit number in the range 1000–9999.

## User interface

### Shared shell

Create a dark, polished studio dashboard:

- Full-viewport, subtle aurora/radial gradient.
- Header with a “Q” mark, “Quorion,” “Studio quotation desk,” current client/company label, and last four reference characters.
- Centered responsive content area approximately 1200px wide.
- Step rail, main workflow panel, and live-ledger sidebar. Stack on smaller screens; make the step rail horizontally scrollable.
- Semantic, keyboard-operable controls with accessible labels, visible focus, and clear disabled states.

### Step 1: Services

Show four selectable service cards in a responsive two-column grid. Each card has name, tagline, base price (“from …”), and an “added” indicator while selected. Selected cards have an emphasized accent border/highlight. Clicking a card toggles selection.

### Step 2: Configuration

Show a selector for each selected service, then the active service’s base engagement and options. Show a running service subtotal. Every option row shows label, note, unit price, calculated amount, and its control:

- Toggle: accessible switch (`role="switch"`, `aria-checked`).
- Counter: decrement/increment buttons and current quantity, clamped to min/max.
- Counter amount equals quantity times unit price; toggle amount is its flat price when enabled, otherwise zero.

### Step 3: Add-ons and billing details

Show recommended add-ons with name, descriptive note, price, optional suffix, and Add/Remove control. Provide editable billing fields for company name, contact person, email, phone, optional GSTIN, and place of supply/state. Use labels and helpful placeholders; do not prefill client data.

### Step 4: Quotation review

Show client and quotation details, every group and line item, taxable subtotal, CGST, SGST, and grand total. Include reference, current local date formatted for `en-IN`, and “Valid for 30 days.”

Show the note:

> 50% advance to start, 25% at design sign-off, 25% before handover. Prices in INR, GST charged at 18% as applicable, third-party licences billed at actuals.

Provide a prominent “Download quotation PDF” action.

### Live ledger

Keep a live quote summary beside the workflow. Show:

- An “updating” status.
- A prompt to pick a service when there are no groups.
- Each group name and total.
- Subtotal, CGST, SGST, and grand total.
- “Download PDF,” disabled when no service is selected.
- A brief note that the PDF includes GST/tax breakdown.

Totals must update immediately after service, option, quantity, or add-on changes.

## PDF output

Generate and download the PDF in the browser with jsPDF or an equivalent current client-side library. Use A4 portrait pages and INR values with Indian digit grouping. Use the same quote data as the UI; do not duplicate or alter price calculations.

Include:

1. Dark header band with “Quorion,” “Studio quotation desk,” and `GSTIN 07ABCDE1234F1Z5 | hello@quorion.studio`.
2. “QUOTATION,” generated reference, and current date.
3. “PREPARED FOR” section. Display company name, falling back to contact name and then “Client.” Show contact name when both company and name are present; include email, phone, GSTIN, and place of supply when provided.
4. Description/amount table with group names/totals and individual line descriptions, details, and amounts.
5. Subtotal, CGST (9%), SGST (9%), and highlighted grand total.
6. Terms:
   - “50% advance to start, 25% at design sign-off, 25% before handover.”
   - “Prices are in INR and valid for 30 days from the date of this quotation.”
   - “GST charged at 18% as applicable. Third-party licences billed at actuals.”
   - “Timelines confirmed after the kick-off call and content handover.”

Continue content onto additional pages when needed. Save as `Quotation-<reference>.pdf`. Keep studio identity values centralized and easy to replace.

## Styling, theme schema, and accessibility

Recreate the existing dark Quorion design system rather than selecting a generic UI theme. The source uses Tailwind CSS v4, OKLCH custom properties, and `@theme inline` mappings. Preserve the semantic token names below so application classes can use utilities such as `bg-background`, `text-foreground`, `text-mist/70`, `bg-panel`, `ring-border`, `bg-glow`, `font-display`, `font-sans`, and `font-mono`.

### Exact color and radius tokens

These values are the current theme. Use them as the starting point for a faithful rebuild:

| CSS custom property | Current value | Purpose |
| --- | --- | --- |
| `--radius` | `0.75rem` | Base corner radius |
| `--ink` | `oklch(0.1974 0.0236 254.36)` | Main dark navy background |
| `--panel` | `oklch(0.2433 0.0279 251.15)` | Card/panel surface |
| `--mist` | `oklch(0.7237 0.0288 255.13)` | Muted text |
| `--glow` | `oklch(0.7199 0.1495 252.55)` | Primary blue accent |
| `--glow2` | `oklch(0.6829 0.1683 276.13)` | Secondary purple accent |
| `--good` | `oklch(0.7752 0.1471 165.96)` | Positive/status green |
| `--background` | `var(--ink)` | App background |
| `--foreground` | `oklch(1 0 0)` | Main foreground text |
| `--card` | `var(--panel)` | Card surface |
| `--card-foreground` | `oklch(1 0 0)` | Card text |
| `--popover` | `var(--panel)` | Popover surface |
| `--popover-foreground` | `oklch(1 0 0)` | Popover text |
| `--primary` | `var(--glow)` | Primary interactive color |
| `--primary-foreground` | `var(--ink)` | Text on primary |
| `--secondary` | `var(--panel)` | Secondary interactive surface |
| `--secondary-foreground` | `oklch(1 0 0)` | Text on secondary |
| `--muted` | `oklch(1 0 0 / 6%)` | Subtle muted surface |
| `--muted-foreground` | `var(--mist)` | Muted semantic text |
| `--accent` | `oklch(1 0 0 / 10%)` | Hover/selected surface |
| `--accent-foreground` | `oklch(1 0 0)` | Text on accent |
| `--destructive` | `oklch(0.65 0.21 25)` | Destructive action |
| `--destructive-foreground` | `oklch(1 0 0)` | Text on destructive |
| `--border` | `oklch(1 0 0 / 10%)` | Subtle borders |
| `--input` | `oklch(1 0 0 / 15%)` | Input outlines |
| `--ring` | `var(--glow)` | Focus ring |

Semantic token relationships matter: `background`/`foreground`, `card`/`card-foreground`, `popover`/`popover-foreground`, `primary`/`primary-foreground`, and `secondary`/`secondary-foreground` are paired surface/text values. Additional named palette tokens (`ink`, `panel`, `mist`, `glow`, `glow2`, `good`) are directly available to utility classes.

### Tailwind theme mapping and CSS setup

With Tailwind v4, define semantic theme utility mappings in CSS using `@theme inline`. The following illustrates the required schema; retain the complete token mappings in the implementation:

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-ink: var(--ink);
  --color-panel: var(--panel);
  --color-mist: var(--mist);
  --color-glow: var(--glow);
  --color-glow2: var(--glow2);
  --color-good: var(--good);

  --font-display: "Fraunces", serif;
  --font-sans: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

Declare the `:root` values from the color table above. Use `--radius: 0.75rem`. The current design also defines:

```css
:root {
  --aurora:
    radial-gradient(
      900px 500px at 82% -8%,
      color-mix(in oklab, var(--glow) 22%, transparent),
      transparent 60%
    ),
    radial-gradient(
      700px 500px at 0% 100%,
      color-mix(in oklab, var(--glow2) 16%, transparent),
      transparent 55%
    );
  --gradient-total: linear-gradient(
    135deg,
    color-mix(in oklab, var(--glow) 20%, transparent),
    color-mix(in oklab, var(--glow2) 10%, transparent)
  );
}
```

Set global base styles so all borders use the border token; body background uses `--color-background`, body text uses `--color-mist`, and body font uses `--font-sans` with antialiasing. Use `--font-display` for `h1`, `h2`, and `h3`.

Create equivalents of these custom utilities:

- `.aurora-bg`: background is `var(--aurora)`.
- `.gradient-total`: background is `var(--gradient-total)`.
- `.glass`: translucent white at 5% opacity, inset white border at 10%, and `backdrop-filter: blur(12px)`.
- `.num`: JetBrains Mono with `font-variant-numeric: tabular-nums`.
- `.tick`: 0.4s ease-out entrance from 0.2 opacity and 4px above to full opacity at the final position.
- `.slide-in`: 0.35s ease-out entrance from 10px left and transparent to its natural position, retaining final animation state.

Use rounded-xl/2xl panels and controls, subdued 10%-white borders, compact uppercase section labels with letter spacing, and glow-colored highlights for active steps/selections. The aurora layer should be fixed, full-screen, and pointer-events disabled; application content sits above it.

### Fonts and typography

Use these exact font families and roles:

- Display/headings: **Fraunces**, serif fallback.
- Interface/body: **Space Grotesk**, sans-serif fallback.
- Prices, references, and numeric quantities: **JetBrains Mono**, monospace fallback.

The current font stylesheet is loaded from Google Fonts with this URL:

```text
https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap
```

Preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (anonymous crossorigin) before the stylesheet. If using locally hosted fonts instead, load equivalent family/weight/optical-size ranges and preserve the same family assignments and fallback stacks.

### Layout and responsive visual rules

- Header: horizontal alignment, `px-6 py-4`; brand “Q” tile is 36px square with a 10px radius and blue/purple translucent gradient.
- Main shell: `max-width: 1200px`, centered, horizontal gap about 24px, `px-6`, bottom padding about 64px.
- Desktop: step rail about 208px wide; ledger about 340px wide; workflow content flexes to fill remaining space. Rail and ledger can stick about 24px from the viewport top.
- At the large breakpoint (Tailwind `max-lg`, normally below 1024px), stack main columns, make rail full width and horizontally scrollable, and let ledger take full width.
- Service cards use a two-column grid from the small breakpoint, one column on narrow screens.
- Keep options/add-ons as glass panels with around 12px corners and 16–20px padding. Keep labels and explanatory notes muted and amounts right-aligned.
- Use fluid/wrapping layouts for header details, long service labels, quotation lines, and price columns; never let controls or amounts force horizontal overflow.
- Respect `prefers-reduced-motion`; disable or substantially reduce decorative movement for users who request reduced motion.

### Accessibility and metadata

Use semantic buttons and form labels, visible keyboard focus, accessible control names, and clear disabled states. Do not use placeholders as the only input label. Toggle controls expose `role="switch"` and `aria-checked`; counter buttons have action-specific accessible names.

Set document language to English and include a descriptive page title and description. Add Open Graph title/description and a favicon when supported. Make sure text and interactive-state contrast remain legible against the dark palette.

## Acceptance criteria

- Users can select multiple services and configure each independently.
- Catalog defaults display correctly; counter limits are enforced.
- Deselecting a service preserves its saved configuration.
- Suggested add-ons reflect selected services; chosen add-ons remain visible and included until removed.
- The live ledger and final review use the same calculation logic.
- GST is 18%, split equally into CGST and SGST.
- The PDF includes client details when present, reference, date, groups, line items, totals, and terms.
- Ledger PDF download is disabled until a service is selected.
- Layout works on desktop and mobile, and controls are keyboard accessible.
- No unrelated features or pricing changes are introduced.
