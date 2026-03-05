# EMS Design System (Next.js + Tailwind)

## 1. Purpose
The EMS design system establishes a reusable, consistent UI foundation for all EMS surfaces. It defines visual tokens, component standards, and wireframe conventions for delivery with **Next.js** and **Tailwind CSS**.

## 2. Directory Structure

```txt
ems/
  design/
    tokens/
      colors.json
      typography.json
      spacing.json
      radius.json
      shadows.json
      grid.json
      breakpoints.json
    components/
      README.md
    wireframes/
      README.md
  docs/
    design-system.md
```

## 3. Design Tokens
Token source of truth lives in `ems/design/tokens`.

### 3.1 Colors
- Brand scale (`brand.50` to `brand.900`)
- Neutral scale (`neutral.0` to `neutral.950`)
- Semantic colors (`success`, `warning`, `danger`, `info`)
- Surface, text, and border semantic aliases

### 3.2 Typography
- Primary font: Inter
- Monospace font: JetBrains Mono
- Type scale from `xs` to `4xl`
- Font weights: regular, medium, semibold, bold

### 3.3 Spacing
- 4px baseline spacing scale (`1 = 0.25rem`)
- Includes utility-friendly fractional steps (`0.5`, `1.5`, `2.5`, `3.5`)

### 3.4 Radius
- Corner radius from `none` to `2xl`, plus `full`

### 3.5 Shadows
- Elevation levels `xs` to `xl`
- Focus ring shadow token for accessibility

### 3.6 Grid
- 12-column responsive grid
- Breakpoint-aware gutters
- Container max widths for common viewport ranges

### 3.7 Breakpoints
Tailwind-compatible screen sizes:
- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1536px`

## 4. Tailwind Integration
Use token files to extend `tailwind.config.ts`.

```ts
import colors from './ems/design/tokens/colors.json';
import typography from './ems/design/tokens/typography.json';
import spacing from './ems/design/tokens/spacing.json';
import radius from './ems/design/tokens/radius.json';
import shadows from './ems/design/tokens/shadows.json';
import breakpoints from './ems/design/tokens/breakpoints.json';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    screens: breakpoints.breakpoints,
    extend: {
      colors: {
        brand: colors.color.brand,
        neutral: colors.color.neutral,
        semantic: colors.color.semantic,
        surface: colors.color.surface,
        text: colors.color.text,
        border: colors.color.border
      },
      fontFamily: typography.typography.fontFamily,
      fontSize: typography.typography.fontSize,
      fontWeight: typography.typography.fontWeight,
      letterSpacing: typography.typography.letterSpacing,
      spacing: spacing.spacing,
      borderRadius: radius.radius,
      boxShadow: shadows.shadow
    }
  }
};
```

## 5. Component System Scope
Component specification and inventory lives in `ems/design/components/README.md` and includes:
- Primitives
- Feedback/status components
- Navigation components
- Data display components
- Overlay components
- EMS domain components (events, venues, attendees, audit, tenant switching)

Each component should define API, states, accessibility, and responsive behavior.

## 6. Wireframe Scope
Wireframe plan in `ems/design/wireframes/README.md` covers:
- Auth
- Dashboard
- Event workflows
- Venue/room workflows
- Attendee workflows
- Audit/admin workflows

All wireframes must include loading, empty, and error states plus responsive notes.

## 7. Governance
- Tokens are the only source for visual values.
- Component changes must reference token usage.
- New screens should map to existing components before introducing new ones.
- Accessibility is a release gate (focus order, contrast, keyboard interaction, ARIA correctness).

## 8. Implementation Notes for Next.js
- Keep low-level presentational components in a shared `components/ui` layer.
- Use server components for data-fetching pages and client components only for interaction-heavy islands.
- Keep Tailwind class composition consistent using utility helpers (e.g., `clsx`, `tailwind-merge`) where needed.
