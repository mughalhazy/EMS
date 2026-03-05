# EMS Component Library Specification

Target stack: **Next.js + Tailwind CSS**.

## Foundations
- Composition via React server/client components in `app/` router.
- Styling via Tailwind utility classes and token-driven `theme.extend` values.
- Accessibility defaults: keyboard-first interactions, visible focus ring, and semantic HTML.

## Core Components

### Primitives
- Button (`primary`, `secondary`, `ghost`, `danger`)
- IconButton
- Input / Textarea / Select
- Checkbox / Radio / Switch
- Badge
- Avatar
- Tooltip

### Feedback & Status
- Alert
- Toast
- Inline validation error
- Skeleton
- Empty state

### Navigation
- TopNav
- Sidebar
- Breadcrumb
- Tabs
- Pagination

### Data Display
- Card
- StatCard
- DataTable
- KeyValueList
- Timeline

### Overlays
- Modal / Dialog
- Drawer
- Popover
- Command Palette

### EMS Domain Components
- EventCard
- EventStatusPill
- VenueSelector
- AttendeeList
- AuditLogTable
- TenantSwitcher

## States for Every Interactive Component
- Default
- Hover
- Active / Pressed
- Focus-visible
- Disabled
- Loading (where relevant)
- Error / Invalid (for form elements)

## Component Delivery Format
Each component spec should include:
1. Purpose and usage guidance
2. Props API (TypeScript)
3. Accessibility requirements
4. Responsive behavior
5. Visual states
6. Example Tailwind class recipe
