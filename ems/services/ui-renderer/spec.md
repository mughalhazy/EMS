# EMS UI Renderer Deterministic Specification

## 1. Purpose
This specification defines a deterministic renderer that converts EMS wireframe metadata and design tokens into concrete UI component trees.

Deterministic means: given the same wireframe input, token set, and renderer version, the output component structure and styling are byte-for-byte identical.

---

## 2. Inputs and Outputs

## 2.1 Required Inputs
1. **Wireframe document** (screen-level JSON/YAML/AST) containing:
   - screen id
   - regions/blocks
   - interaction annotations
   - state variants (`default`, `loading`, `empty`, `error`)
   - role metadata (if provided)
2. **Design tokens** from:
   - `ems/design/tokens/colors.json`
   - `ems/design/tokens/typography.json`
   - `ems/design/tokens/spacing.json`
   - `ems/design/tokens/radius.json`
   - `ems/design/tokens/shadows.json`
   - `ems/design/tokens/grid.json`
   - `ems/design/tokens/breakpoints.json`
3. **Component catalog contract** aligned with `ems/design/components/README.md`.
4. **Renderer version** string (`ui-renderer-spec/v1`).

## 2.2 Output
Renderer emits a normalized tree where each node includes:
- `component`: canonical component name
- `props`: resolved props with explicit defaults
- `layout`: span, alignment, gap, region placement
- `styleTokens`: token references only (no raw hex/rem except token aliases)
- `state`: explicit state branch
- `a11y`: role/aria/label/focus behavior

---

## 3. Deterministic Rendering Pipeline

1. **Normalize wireframe**
   - Sort blocks by explicit `order` ascending; tie-break with stable `id` lexicographic ordering.
   - Expand shorthand wireframe elements into canonical primitives.
2. **Resolve component type**
   - Apply mapping table in Section 4.
   - If multiple candidates match, pick highest-priority rule (top-to-bottom order in table).
3. **Apply layout model**
   - Resolve grid columns/spans using Section 5 rules.
4. **Apply responsive transforms**
   - Compute `sm/md/lg/xl/2xl` variants using Section 6.
5. **Attach tokenized styles**
   - Assign only approved token references per Section 7.
6. **Enforce constraints**
   - Validate against Section 8; fail render if constraint violations are unresolvable.
7. **Emit stable output**
   - Serialize object keys alphabetically.
   - Serialize arrays in deterministic order defined by steps 1-6.

---

## 4. Component Mapping Rules

Wireframe blocks are mapped to UI components using the following deterministic rules:

| Wireframe block type / annotation | Rendered component | Notes |
|---|---|---|
| `page_header` | `Card` + heading/text primitives | Includes title, subtitle, and top actions region. |
| `primary_cta` / `secondary_cta` | `Button` (`primary`/`secondary`) | Variant inferred from annotation priority. |
| `icon_action` | `IconButton` | Requires accessible label. |
| `text_input` | `Input` | Error annotation maps to invalid state props. |
| `long_text_input` | `Textarea` | Minimum 3 rows. |
| `select_input` | `Select` | Supports placeholder option. |
| `toggle` | `Switch` | Boolean-only fields. |
| `boolean_choice` | `Checkbox` or `Radio` | Single independent = `Checkbox`; exclusive group = `Radio`. |
| `status_chip` / `event_status` | `EventStatusPill` | Semantic color determined by status mapping. |
| `metric_tile` | `StatCard` | Value + label + optional delta. |
| `list_table` | `DataTable` | With pagination if row count annotation exceeds page size. |
| `audit_stream` | `AuditLogTable` or `Timeline` | `table` if columns annotated, otherwise `timeline`. |
| `entity_card` (event-focused) | `EventCard` | Used in dashboard/event list cards. |
| `empty_placeholder` | `Empty state` | Must include recovery CTA when action exists. |
| `loading_placeholder` | `Skeleton` | Structure mirrors target block shape. |
| `error_banner` | `Alert` (`danger`) | Persistent at region top. |
| `toast_feedback` | `Toast` | Non-blocking async feedback. |
| `overlay_modal` | `Modal / Dialog` | Modal for blocking actions. |
| `overlay_sidepanel` | `Drawer` | For contextual editing/navigation. |
| `context_menu` / `quick_actions` | `Popover` | Anchored to invoking element. |
| `global_search` | `Command Palette` | Keyboard-first interaction (`Ctrl/Cmd+K`). |
| `top_navigation` | `TopNav` | Global scope links/actions. |
| `side_navigation` | `Sidebar` | Section-level navigation. |
| `breadcrumbs` | `Breadcrumb` | Derived from hierarchy metadata. |
| `tabset` | `Tabs` | Requires explicit selected tab id. |
| `tenant_selector` | `TenantSwitcher` | Must include tenant context metadata. |
| `venue_picker` | `VenueSelector` | Venue + room selection flow. |
| `attendee_list` | `AttendeeList` | Includes search/filter controls. |

### 4.1 Unknown Block Fallback
- If wireframe block type is unknown, renderer falls back to `Card` containing:
  - block title as heading
  - description text
  - optional placeholder area
- Unknown block type must be recorded in `renderWarnings[]`.

---

## 5. Layout Rules

## 5.1 Grid Foundation
- Desktop-first logical grid: **12 columns**.
- Mobile adaptation: **4 columns**.
- Gutter tokens:
  - mobile: `grid.gutter.mobile` (`1rem`)
  - tablet: `grid.gutter.tablet` (`1.5rem`)
  - desktop: `grid.gutter.desktop` (`2rem`)

## 5.2 Region Model
Each screen is split into deterministic regions in this order:
1. `top`
2. `filters`
3. `primary`
4. `secondary`
5. `footer`

Within each region:
- blocks are sorted by `order`, then `id`
- row packing is left-to-right
- if span overflow occurs, wrap to next row

## 5.3 Default Span Heuristics
- `page_header`, `top_navigation`, `error_banner`: 12 columns
- `StatCard`, `EventCard`, `Card`: 4 columns on desktop (auto-wrap)
- `DataTable`, `AuditLogTable`, `Timeline`, `AttendeeList`: 12 columns
- form controls in form sections: 6 columns unless annotated `full`
- sidepanel-like secondary content: 4 columns in `secondary` region

## 5.4 Spacing and Rhythm
- Vertical stack gap defaults to `spacing.4`.
- Dense control groups use `spacing.3`.
- Section-to-section separation uses `spacing.8`.
- Padding defaults:
  - card/container: `spacing.4`
  - page container: `spacing.6` mobile, `spacing.8` desktop

---

## 6. Responsive Behavior

Breakpoints use token-defined values:
- `sm` 640px
- `md` 768px
- `lg` 1024px
- `xl` 1280px
- `2xl` 1536px

Deterministic adaptation rules:
1. **< md (mobile)**
   - 4-column grid
   - all `DataTable` blocks become horizontally scrollable or card-list fallback when annotation `mobileCards=true`
   - Sidebar collapses to Drawer
2. **md to < lg (tablet)**
   - 8 logical columns (implemented as 12 grid with constrained spans)
   - two-column forms where controls have `span >= 6`
3. **>= lg (desktop)**
   - full 12-column layout
   - Sidebar persistent if present
4. **>= xl**
   - expand container up to token max width
5. **>= 2xl**
   - cap at `grid.containerMaxWidth.2xl` (90rem)

Component-specific responsive rules:
- `TopNav`: collapse secondary actions into overflow menu below `md`.
- `Tabs`: convert to horizontal scroll list below `md`.
- `Modal`: max width `sm` on mobile, `md/lg` on desktop by content complexity annotation.
- `StatCard`: 4-up desktop, 2-up tablet, 1-up mobile.

---

## 7. Token Usage Rules

## 7.1 General Rule
All visual values must be token references. Literal values are prohibited unless no corresponding token exists and exception is explicitly documented.

## 7.2 Allowed Token Categories by Concern
- Color/background/border/text -> `colors.json`
- Font family/size/weight/letter spacing -> `typography.json`
- Margin/padding/gaps/size spacing -> `spacing.json`
- Corner rounding -> `radius.json`
- Elevation/focus ring -> `shadows.json`
- Breakpoint logic -> `breakpoints.json`
- Grid columns/gutter/max widths -> `grid.json`

## 7.3 State Token Rules
- Focus-visible must use `shadow.focus` and/or `color.border.focus`.
- Disabled state uses neutral text/border/surface tokens and reduced emphasis (no ad-hoc opacity constants).
- Error state for form controls uses semantic danger + border strong pairing with accessible contrast.
- Success/warning/info feedback must map to semantic token family only.

## 7.4 Typography Rules
- Body text defaults to `fontSize.base`, `fontWeight.regular`.
- Section titles use `fontSize.xl` or `2xl` based on hierarchy depth.
- Numeric/stat values use `fontSize.2xl` minimum.

---

## 8. Design Constraints and Validation

Renderer MUST enforce the following constraints:

1. **Accessibility constraints**
   - Interactive controls require accessible name.
   - Keyboard focus order follows DOM order from deterministic block sorting.
   - Focus-visible styling always present.
2. **Contrast constraints**
   - Text/surface combinations must meet WCAG AA target.
3. **State completeness**
   - Interactive components must define: default, hover, active, focus-visible, disabled.
   - Form inputs must include invalid/error rendering.
4. **Wireframe completeness**
   - Each priority screen must include loading, empty, and error states.
5. **Component reuse first**
   - New blocks map to existing component catalog before custom component creation.
6. **No arbitrary styling**
   - No raw color hex, rem, px in emitted component styles (except token references).
7. **Deterministic failure behavior**
   - On hard validation error, renderer returns `status: failed` with ordered `errors[]` and no partial tree.

---

## 9. Conflict Resolution

When wireframe annotations conflict with token or component constraints, apply precedence:
1. Accessibility and safety constraints
2. Explicit renderer constraints (Section 8)
3. Wireframe explicit annotations
4. Component defaults
5. Global defaults

All resolved conflicts must be logged in ordered `resolutionLog[]`.

---

## 10. Versioning

- Current spec identifier: `ui-renderer-spec/v1`.
- Any rule change that can alter output tree structure, token assignment, or responsive behavior increments minor/major version and requires snapshot regeneration.
