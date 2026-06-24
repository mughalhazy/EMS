# Design System

> Source: V1 Packet 0 Design Prompt 1 — Design System Foundation.
> Implemented via Tailwind CSS custom theme in `apps/web/tailwind.config.ts`.
> Physical token files live in `design/tokens/`. Component primitives in
> `design/components/`. See `services/ui-renderer/spec.md` for rendering contract.

## 1. Colors

### Brand Palette
| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#eff6ff` | light backgrounds, hover states |
| `primary-100` | `#dbeafe` | subtle fills |
| `primary-500` | `#3b82f6` | primary actions, active states |
| `primary-600` | `#2563eb` | primary button hover |
| `primary-700` | `#1d4ed8` | pressed states |
| `primary-900` | `#1e3a8a` | dark text on light |

### Neutral Palette
| Token | Hex | Usage |
|---|---|---|
| `neutral-0` | `#ffffff` | surfaces, cards |
| `neutral-50` | `#f8fafc` | page background |
| `neutral-100` | `#f1f5f9` | subtle dividers |
| `neutral-200` | `#e2e8f0` | borders |
| `neutral-500` | `#64748b` | secondary text |
| `neutral-700` | `#334155` | body text |
| `neutral-900` | `#0f172a` | headings |

### Semantic Colors
| Token | Value | Usage |
|---|---|---|
| `success` | `#22c55e` | confirmation, check-in success |
| `warning` | `#f59e0b` | caution states (waitlisted, low inventory) |
| `error` | `#ef4444` | validation errors, payment failed |
| `info` | `#0ea5e9` | informational banners |

### Tenant Branding Override
`TenantSettings` keys `brand.primaryColor` and `brand.logoUrl` override
`primary-*` tokens at runtime via CSS custom properties
(`--color-primary: {tenantValue}` injected server-side by `ui-renderer`).

## 2. Typography

| Scale | Class | Size / Line-height | Usage |
|---|---|---|---|
| `display-lg` | | 48px / 56px | Hero headings |
| `display-sm` | | 36px / 44px` | Section headings |
| `heading-xl` | | 24px / 32px | Page titles |
| `heading-lg` | | 20px / 28px | Card headings |
| `heading-md` | | 16px / 24px | Sub-headings |
| `body-lg` | | 18px / 28px | Primary body copy |
| `body-md` | | 16px / 24px | Default body |
| `body-sm` | | 14px / 20px | Secondary body, captions |
| `label` | | 12px / 16px | Form labels, badges |
| `code` | monospace | 14px / 20px | IDs, promo codes |

- **Font family**: Inter (primary), system-ui (fallback).
- **Font weight**: regular (400), medium (500), semibold (600), bold (700).
- Applied via Tailwind `fontFamily` + `fontSize` config extending defaults.

## 3. Spacing Scale

Based on 4px base unit. Tailwind `spacing` extension:

`0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px), 10(40px), 12(48px), 16(64px), 20(80px), 24(96px)`

Standard padding/gap usage:
- Card body: `p-6`
- Section gap: `gap-8`
- Form field gap: `gap-4`
- Inline icon gap: `gap-2`

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | inputs, badges |
| `rounded` | 6px | buttons, small cards |
| `rounded-md` | 8px | cards, modals |
| `rounded-lg` | 12px | panels, sheets |
| `rounded-xl` | 16px | large cards, hero blocks |
| `rounded-full` | 9999px | avatars, pill tags |

## 5. Shadows / Elevation

| Token | Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | subtle lifts |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | cards at rest |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | cards on hover |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | modals, drawers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | command palettes |

## 6. Grid & Layout

- **Max content width**: 1280px (`max-w-screen-xl`).
- **Page gutters**: `px-4` (mobile), `px-6` (tablet), `px-8` (desktop).
- **Column system**: 12-column CSS grid via Tailwind `grid-cols-12`.
- **Standard layouts**:
  - Full-width: `col-span-12`
  - Sidebar + main: `col-span-3` + `col-span-9`
  - Two-column: `col-span-6` + `col-span-6`
  - Three-column cards: `col-span-4` each

## 7. Breakpoints

| Name | Min-width | Target |
|---|---|---|
| `sm` | 640px | large phones |
| `md` | 768px | tablets |
| `lg` | 1024px | small laptops |
| `xl` | 1280px | desktop |
| `2xl` | 1536px | wide desktop |

- Mobile-first: base styles target `< sm`; breakpoint prefixes add larger.
- Onsite check-in UI (`/events/[id]/onsite/*`) is designed for tablet-landscape
  as primary target.

## 8. Iconography

- Library: Lucide React (consistent stroke-based, tree-shakeable).
- Default size: 16px (`size-4`) inline, 20px (`size-5`) standalone.
- Color inherits from parent text color.

## 9. Motion / Transitions

- Default transition: `transition-colors duration-150 ease-out` (buttons, links).
- Modal enter/exit: `transition-opacity duration-200`.
- No motion for users with `prefers-reduced-motion: reduce` (enforced via
  Tailwind `motion-reduce:` variant).

## 10. Tailwind Config Entry Points

```
design/tokens/colors.js      -> tailwind theme.extend.colors
design/tokens/typography.js  -> tailwind theme.extend.fontSize + fontFamily
design/tokens/spacing.js     -> tailwind theme.extend.spacing
design/tokens/shadows.js     -> tailwind theme.extend.boxShadow
design/tokens/radius.js      -> tailwind theme.extend.borderRadius
```

These are imported in `apps/web/tailwind.config.ts`. Token files in `design/tokens/`
are the single source of truth — UI components and `ui-renderer` must not hard-code
values that appear in these files.
