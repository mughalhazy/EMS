# EMS UI Normalization Protocol

> The build contract for reverse-engineering every HTML design sample into the EMS design system.
> This document is the single source of authority for the normalization process.
> It must be read before touching any page file.
>
> **Before executing any normalization step, query `ems/docs/normalization-registry.md` first.**
> If the token substitution, raw value, component mapping, drift fix, or pattern has been resolved before — apply it directly. Do not re-derive.

---

## Purpose

Each page in EMS has an HTML reference file in `Design Samples/`.
These files are pixel-perfect design specs — the ground truth for every visual decision.

The normalization process converts them into:
1. A CSS module using only design language tokens
2. A JSX page that mirrors the HTML structure exactly
3. A wireframe JSON that feeds the renderer

Once all pages are normalized, the renderer can reproduce any page deterministically from its wireframe JSON alone. That is the end goal.

---

## Phase Map

```
Phase 1 — Design Stabilization (current)
  HTML file → page.module.css + page.tsx
  Design is locked. Zero drift from spec.

Phase 2 — Wireframe Extraction
  Stabilized page → page.wireframe.json
  Mechanical — describe what is already verified.

Phase 3 — Renderer Takeover
  page.tsx becomes a thin data shell → <RenderedPage wireframe={...} data={...} />
  Design system is coherent end-to-end.
```

---

## Vocabulary

Every HTML pattern maps to a canonical name in the renderer type system.
Use these names consistently in code, comments, wireframes, and this document.

### Regions (top-level layout zones)

| Canonical name   | Typical HTML class         | Description                              |
|------------------|---------------------------|------------------------------------------|
| `top`            | `.topbar`                 | Sticky bar — date selector, actions, CTA |
| `header`         | `.page-header`            | Page title + subtitle                    |
| `kpi_strip`      | `.stats-grid`             | Row of metric tiles                      |
| `primary`        | `.content` / `.content-grid` | Main content — cards, tables, charts  |
| `secondary`      | `.sidebar` / `.panel`     | Supporting panel (right column)          |
| `filters`        | `.toolbar` / `.filter-bar`| Event selector, status tabs, search      |

### Blocks (discrete UI units within regions)

| Canonical name   | Typical HTML class         | Component           |
|------------------|---------------------------|---------------------|
| `metric_tile`    | `.stat-card`              | `KpiCard`           |
| `entity_card`    | `.event-card`             | `RendererEntityCard`|
| `data_table`     | `.table`                  | `RendererDataTable` |
| `card`           | `.card`                   | `Card`              |
| `page_header`    | `.page-header h1 + p`     | `PageHeader`        |
| `status_chip`    | `.badge` / `.event-badge` | `StatusChip`        |
| `button`         | `.btn-primary` / `.btn`   | `Button`            |
| `progress_bar`   | `.bar` + `.bar-fill`      | inline CSS module   |
| `avatar`         | `.avatar` / gradient div  | `Avatar`            |
| `select_input`   | `<select>`                | `RendererSelect`    |
| `tab_bar`        | `.filter-btn` group       | `Tabs`              |
| `revenue_chart`  | `.revenue-chart`          | inline CSS module   |
| `schedule_grid`  | `.schedule-grid`          | `ScheduleGrid`      |
| `alert_banner`   | `.alert-card`             | `AlertCard`         |

### States

Every block must account for these states where applicable:

| State     | Trigger                        |
|-----------|-------------------------------|
| `default` | Normal render                  |
| `hover`   | Mouse over — elevation + color |
| `active`  | Selected / current             |
| `loading` | Data pending — skeleton        |
| `empty`   | No data — `EmptyState`         |
| `error`   | API failure — brick tone       |

---

## Normalization Rules

A fixed decision tree applied to every CSS property in the HTML file.
No judgment. No invention. Follow the tree.

### Color

```
Is the value a hex / rgba / named color?
  → Find the matching semantic token:
      Forest  #166534 / #16A34A / #DCFCE7  → var(--f-dk) / var(--f-md) / var(--f-lt)
      Indigo  #1E1B4B / #4F46E5 / #EEF2FF  → var(--i-dk) / var(--i-md) / var(--i-lt)
      Amber   #92400E / #D97706 / #FEF3C7  → var(--a-dk) / var(--a-md) / var(--a-lt)
      Brick   #991B1B / #DC2626 / #FEE2E2  → var(--b-dk) / var(--b-md) / var(--b-lt)
      Gold    #78350F / #F59E0B / #FFFBEB  → var(--g-dk) / var(--g-md) / var(--g-lt)
      Teal    #134E4A / #0D9488 / #CCFBF1  → var(--t-dk) / var(--t-md) / var(--t-lt)
      White   #ffffff                       → var(--white)
      Off     #f9fafb                       → var(--off)
      Surface #f3f4f6                       → var(--surface)
      Border  #e5e7eb                       → var(--border)
      Ink     #111827                       → var(--ink)
      Ink-2   #374151                       → var(--ink-2)
      Ink-3   #6b7280                       → var(--ink-3)
      Ink-4   #9ca3af                       → var(--ink-4)
  → No matching token?
      → Use raw hex/rgba + add comment: /* raw — no DL token */
```

### Spacing

```
Is the px value on the 8px grid?
  4px  → var(--space-1)
  8px  → var(--space-2)
  12px → var(--space-3)
  16px → var(--space-4)
  20px → var(--space-5)
  24px → var(--space-6)
  32px → var(--space-8)
  40px → var(--space-10)
  48px → var(--space-12)
  64px → var(--space-16)
  → Off grid (e.g. 6px, 22px)?
      → Use raw px + comment: /* raw — off 8px grid */
```

### Typography

```
font-size:
  11px → var(--text-xs)
  13px → var(--text-sm)
  14px → var(--text-md)
  18px → var(--text-lg)
  28px → var(--text-xl)
  32px → var(--text-2xl)
  52px → var(--text-hero)
  → Other (e.g. 15px, 22px)?
      → Raw px + comment: /* raw — off type scale */

font-weight:
  400 → var(--weight-regular)  [implicit, no token needed]
  500 → var(--weight-medium)
  600 → var(--weight-semibold)
  700 → var(--weight-bold)
  800 → var(--weight-extrabold)
```

### Shape & Elevation

```
border-radius:
  8px  → var(--radius)
  14px → var(--radius-lg)
  20px → var(--radius-xl)
  → Other? → raw px + comment

box-shadow:
  → Use var(--shadow-sm / --shadow-md / --shadow-lg / --shadow-xl)
  → Color-tinted: var(--shadow-color-forest / --shadow-color-indigo)
  → Custom rgba? → raw + comment

transition:
  → Standard: var(--transition-base)  [if defined in tokens]
  → Otherwise: raw `transition: all 0.2s ease` + comment
```

### Inline Styles in JSX

**Only one case is permitted:** data-driven dynamic values.

```tsx
// ALLOWED — width is computed from data at runtime
<div style={{ width: `${pct}%` }} />

// NOT ALLOWED — use a CSS module class instead
<div style={{ display: 'flex', gap: '16px' }} />
```

---

## Per-Page Artifacts

Every HTML file produces exactly these outputs in order:

### 1. `page.module.css`
- One class per HTML class, same name (camelCase in JSX)
- All token substitutions applied per normalization rules
- Raw values documented with inline comments
- No inline styles in corresponding JSX
- Animations (`@keyframes`) copied verbatim from HTML `<style>` block

### 2. `page.tsx`
- JSX structure mirrors HTML DOM 1:1 — same nesting, same hierarchy
- Static text from HTML remains static (do not substitute with dynamic data unless HTML shows a dynamic value)
- Mock data wired where HTML shows placeholder values (names, numbers, dates)
- `className={styles.camelCase}` for every element
- Imports only what is used

### 3. `page.wireframe.json`
- Produced after `page.tsx` is verified against HTML
- Regions map to HTML layout zones (see Vocabulary above)
- Blocks map to canonical block types
- Props derived from rendered output, not from HTML CSS

---

## Build Order (per page)

```
1. Read HTML file completely
2. Query normalization-registry.md — apply all known resolutions before deriving anything new
3. Identify all regions and blocks — map to vocabulary
4. List every CSS class and its properties
5. Apply normalization rules → produce .module.css
6. Port HTML structure to JSX → produce page.tsx
7. Wire mock data (use lib/mock-data.ts)
8. Verify against HTML — zero deviations allowed
9. Log all new entries (C/S/T/R/D/M/P) to normalization-registry.md
10. Extract wireframe.json
11. Commit: fix(page-name): normalize to HTML spec [N]
12. Push to GitHub → auto-deploy to Render
```

---

## Raw Value Registry

Intentional raw values used across the system (no matching DL token exists):

| Value | Context | Reason |
|-------|---------|--------|
| `15px` | Event card name font-size | Between `--text-sm` (13px) and `--text-lg` (18px) |
| `22px` | Event date day number | Between `--text-xl` (28px) and `--text-lg` (18px) |
| `6px` | Small inline gaps | Between `--space-1` (4px) and `--space-2` (8px) |
| `38px` | Icon button size | Not in spacing scale |
| `10px` | Badge font-size | Between `--text-xs` (11px) and below |
| `4px` | Small badge radius | Below `--radius` (8px) |
| `200px` | Revenue chart height | Fixed layout dimension |
| `transition: all 0.15s` | Fast micro-interactions | Faster than standard |
| `opacity: 0.7` | Muted/disabled visual state | No token defined |

Any new raw value introduced must be added to this table before commit.

---

## Rules

1. **HTML is the spec** — if the HTML says it, use it. If the HTML does not say it, do not add it.
2. **No invention** — do not add components, states, colors, or content not in the HTML.
3. **No dynamic substitution of static text** — if HTML says `"Event Dashboard"`, JSX says `"Event Dashboard"`.
4. **Token first, raw second** — always check for a token before using a raw value.
5. **Document every raw value** — add to Raw Value Registry above.
6. **One page per commit** — `fix(page-name): normalize to HTML spec [N]`.
7. **Push to GitHub after every commit** — Render auto-deploys.
