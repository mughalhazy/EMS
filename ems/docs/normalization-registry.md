# EMS Normalization Registry

> Flat lookup table. One row per decision.
> Query this FIRST before deriving any token substitution, raw value, component mapping, or fix.
> If an entry exists — apply it directly. Do not re-derive.
> New entries added as each HTML file is processed.

---

## Prefix Key

| Prefix | Source | Meaning |
|--------|--------|---------|
| `C-`   | System | Color value → DL token |
| `S-`   | System | Spacing value → DL token |
| `T-`   | System | Typography value → DL token |
| `R-`   | System | Raw value exception — no matching token, intentional |
| `D-`   | System | Drift detected vs HTML spec — fix applied |
| `M-`   | System | Component mapping — HTML class → React component |
| `P-`   | System | CSS pattern — structural rule (inline vs module, etc.) |
| `H-`   | Human  | Visual/UX observation — not in spec, caught by eye |

---

## Status Key

| Status | Meaning |
|--------|---------|
| `resolved` | Token/fix applied, confirmed correct |
| `logged`   | Raw exception accepted, no fix needed |
| `fixed`    | Drift or error corrected |
| `open`     | Detected, not yet actioned |

---

## Registry

### Color

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| C-001 | dashboard | `#0D9488` | `var(--t-md)` | resolved |
| C-002 | dashboard | `#CCFBF1` | `var(--t-lt)` | resolved |
| C-003 | dashboard | `#134E4A` | `var(--t-dk)` | resolved |
| C-004 | dashboard | `#F59E0B` | `var(--g-md)` | resolved |
| C-005 | dashboard | `#FFFBEB` | `var(--g-lt)` | resolved |
| C-006 | dashboard | `#78350F` | `var(--g-dk)` | resolved |
| C-007 | dashboard | `#4F46E5` | `var(--i-md)` | resolved |
| C-008 | dashboard | `#EEF2FF` | `var(--i-lt)` | resolved |
| C-009 | dashboard | `#1E1B4B` | `var(--i-dk)` | resolved |
| C-010 | dashboard | `#16A34A` | `var(--f-md)` | resolved |
| C-011 | dashboard | `#DCFCE7` | `var(--f-lt)` | resolved |
| C-012 | dashboard | `#166534` | `var(--f-dk)` | resolved |
| C-013 | dashboard | `#ffffff` | `var(--white)` | resolved |
| C-014 | dashboard | `#f9fafb` | `var(--off)` | resolved |
| C-015 | dashboard | `#f3f4f6` | `var(--surface)` | resolved |
| C-016 | dashboard | `#e5e7eb` | `var(--border)` | resolved |
| C-017 | dashboard | `#111827` | `var(--ink)` | resolved |
| C-018 | dashboard | `#374151` | `var(--ink-2)` | resolved |
| C-019 | dashboard | `#6b7280` | `var(--ink-3)` | resolved |
| C-020 | dashboard | `#9ca3af` | `var(--ink-4)` | resolved |

---

### Spacing

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| S-001 | dashboard | `4px` | `var(--space-1)` | resolved |
| S-002 | dashboard | `8px` | `var(--space-2)` | resolved |
| S-003 | dashboard | `12px` | `var(--space-3)` | resolved |
| S-004 | dashboard | `16px` | `var(--space-4)` | resolved |
| S-005 | dashboard | `20px` | `var(--space-5)` | resolved |
| S-006 | dashboard | `24px` | `var(--space-6)` | resolved |
| S-007 | dashboard | `32px` | `var(--space-8)` | resolved |
| S-008 | dashboard | `40px` | `var(--space-10)` | resolved |
| S-009 | dashboard | `48px` | `var(--space-12)` | resolved |
| S-010 | dashboard | `6px` gap (event detail items) | raw — off 8px grid | logged |
| S-011 | dashboard | `38px` icon button size | raw — not in spacing scale | logged |

---

### Typography

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| T-001 | dashboard | `font-size: 11px` | `var(--text-xs)` | resolved |
| T-002 | dashboard | `font-size: 13px` | `var(--text-sm)` | resolved |
| T-003 | dashboard | `font-size: 14px` | `var(--text-md)` | resolved |
| T-004 | dashboard | `font-size: 18px` | `var(--text-lg)` | resolved |
| T-005 | dashboard | `font-size: 28px` | `var(--text-xl)` | resolved |
| T-006 | dashboard | `font-weight: 500` | `var(--weight-medium)` | resolved |
| T-007 | dashboard | `font-weight: 600` | `var(--weight-semibold)` | resolved |
| T-008 | dashboard | `font-weight: 700` | `var(--weight-bold)` | resolved |
| T-009 | dashboard | `font-weight: 800` | `var(--weight-extrabold)` | resolved |
| T-010 | dashboard | `font-size: 15px` (event name) | raw — between --text-sm and --text-lg | logged |
| T-011 | dashboard | `font-size: 22px` (date day number) | raw — between --text-xl and --text-lg | logged |
| T-012 | dashboard | `font-size: 10px` (badge text) | raw — below --text-xs | logged |
| T-013 | dashboard | `letter-spacing: 0.04em` (kpi label) | raw — no letter-spacing token | logged |
| T-014 | dashboard | `letter-spacing: -0.03em` (kpi value) | raw — no letter-spacing token | logged |

---

### Raw Value Exceptions

| ID | HTML File | Value | Context | Reason | Status |
|----|-----------|-------|---------|--------|--------|
| R-001 | dashboard | `15px` | Event card name font-size | Between --text-sm (13px) and --text-lg (18px) | logged |
| R-002 | dashboard | `22px` | Date block day number | Between --text-xl (28px) and --text-lg (18px) | logged |
| R-003 | dashboard | `6px` | Event detail item gap | Between --space-1 (4px) and --space-2 (8px) | logged |
| R-004 | dashboard | `38px` | Icon button width/height | Not in spacing scale | logged |
| R-005 | dashboard | `10px` | Badge/chip font-size | Below --text-xs (11px) | logged |
| R-006 | dashboard | `4px` | Badge border-radius | Below --radius (8px) | logged |
| R-007 | dashboard | `200px` | Revenue chart height | Fixed layout dimension | logged |
| R-008 | dashboard | `transition: all 0.15s` | Fast micro-interactions | Faster than standard 0.2s | logged |
| R-009 | dashboard | `opacity: 0.7` | Muted/disabled visual state | No opacity token defined | logged |
| R-010 | dashboard | `linear-gradient(135deg, var(--t-md) 0%, var(--i-md) 100%)` | Avatar gradient | No gradient token defined | logged |

---

### Drift (Deviations from HTML Spec)

| ID | HTML File | Location | What Was Wrong | Fix Applied | Status |
|----|-----------|----------|----------------|-------------|--------|
| D-001 | dashboard | Page title | `tenant.name` (dynamic) used instead of static `"Event Dashboard"` | Changed to static string | fixed |
| D-002 | dashboard | KPI 3rd card delta | `` `${liveEvents.length} live now` `` instead of `"+3 this week"` | Changed to static string | fixed |
| D-003 | dashboard | Event detail 2nd item | `ev.timezone` instead of `"Convention Center"` | Changed to static string | fixed |
| D-004 | dashboard | Quick stat 3rd note | `{confirmedSpeakers} confirmed speakers` instead of `"Great attendance rate!"` | Changed to static string | fixed |
| D-005 | dashboard | KpiCard | Top colored border (`border-top: 3px solid`) added — not in HTML spec | Removed | fixed |
| D-006 | dashboard | Revenue chart | Used dynamic per-event data instead of HTML's 6 static monthly bars | Replaced with static bars matching HTML | fixed |
| D-007 | dashboard | Badge classes | Used `.published`/`.draft`/`.confirmed`/`.cancelled` instead of HTML's `.upcoming`/`.completed`/`.checkedIn`/`.registered` | Renamed to match HTML | fixed |
| D-008 | dashboard | AlertCard | Added live alert banner not present in HTML spec | Removed | fixed |
| D-009 | dashboard | Dead variables | `fmtDate`, `liveEvent`, `maxRevenue`, `confirmedSpeakers` left in file after fixes | Removed | fixed |

---

### Component Mappings

| ID | HTML Class | React Component | File | Status |
|----|-----------|-----------------|------|--------|
| M-001 | `.stat-card` | `KpiCard` | `components/ui/KpiCard.tsx` | resolved |
| M-002 | `.card` + `.card-header` | `Card` | `components/ui/Card.tsx` | resolved |
| M-003 | `.event-card` | inline JSX in page | `dashboard/page.tsx` | resolved |
| M-004 | `.badge` / `.event-badge` | inline CSS classes | `dashboard.module.css` | resolved |
| M-005 | `.avatar` (gradient) | inline div with CSS | `dashboard.module.css` | resolved |
| M-006 | `.bar` + `.bar-fill` | inline JSX with CSS module | `dashboard.module.css` | resolved |
| M-007 | `.revenue-chart` | inline JSX with CSS module | `dashboard.module.css` | resolved |
| M-008 | `.table` | inline JSX with CSS module | `dashboard.module.css` | resolved |

---

### Patterns

| ID | HTML File | Pattern | Rule | Status |
|----|-----------|---------|------|--------|
| P-001 | dashboard | Progress bar width | Must be inline style `width: \`${pct}%\`` — data-driven, cannot be static CSS | resolved |
| P-002 | dashboard | Staggered animation | `@keyframes fadeIn` on `.statsGrid > *:nth-child(1-4)` with 0/0.05/0.1/0.15s delays | resolved |
| P-003 | dashboard | Revenue chart bars | Static heights as percentage strings — not data-driven | resolved |
| P-004 | dashboard | Avatar gradient | `linear-gradient(135deg, var(--t-md) 0%, var(--i-md) 100%)` — apply to all initials avatars | resolved |
| P-005 | dashboard | Static text rule | Where HTML shows static text, JSX must use static string — no dynamic substitution | resolved |
| P-006 | dashboard | Card animation | `@keyframes fadeIn` + `animation: fadeIn 0.3s ease-out both` on `.card` | resolved |

---

### Human Observations

| ID | HTML File | Session | Observation | Action Taken | Status |
|----|-----------|---------|-------------|--------------|--------|
| H-001 | dashboard | [33] | Colors used decoratively, not semantically — too many color pots creating visual noise | Reinforced rule: color only to express information state, not decoration | fixed |
| H-002 | dashboard | [33] | UI cluttered and unstructured — high cognitive load on reader | Deferred to full HTML normalization pass | open |
| H-003 | dashboard | [33] | Hovers and interactions feel like speed bumps, not glides | Deferred to full HTML normalization pass | open |
| H-004 | dashboard | [33] | Data not placed in simple understanding order and continuity | Deferred to full HTML normalization pass | open |
| H-005 | dashboard | [33] | Solid colors should use only 1-2 extremely light variants to express info — rest should be grey/white | Reinforced in token rules: use --*-lt sparingly, default to neutrals | fixed |
| D-010 | dashboard | [34] | fadeIn keyframes animated `transform` with `fill-mode: both` — animation fill overrides hover `transform: translateY(-2px)` making KPI hover non-functional | Changed fadeIn to opacity-only; transform freed for hover | fixed |
| D-011 | dashboard | [34] | `.eventCard:last-child` selector never matched — eventCard is inside eventLink wrapper, not a direct child | Changed to `.eventLink:last-child .eventCard { border-bottom: none }` | fixed |
| D-012 | dashboard | [34] | CSS module compound selectors `.ticketBadge.vip` / `.statusBadge.checkedIn` unreliable — badges rendered unstyled | Replaced with flat self-contained classes: `.badgeVip`, `.badgeEarly`, `.badgeStandard`, `.badgeCheckedIn`, `.badgeRegistered` | fixed |
| P-007 | dashboard | [34] | CSS module compound selectors (.foo.bar) are unreliable — use flat self-contained classes instead | All future badge/chip variants should be flat classes, never compound selectors in CSS modules | resolved |
| D-013 | dashboard | [34] | Ticket category mapping incomplete — workshop/add-on/sprint names all fell through to badgeStandard (indigo); HTML teal category never rendered | Added workshop/add-on/sprint/early detection → badgeEarly (teal) | fixed |
| D-014 | dashboard | [34] | Status badge showed raw mock values (confirmed, approved, cancelled) instead of HTML labels (Checked In, Registered) | Added statusLabel() mapping: confirmed/approved → "Checked In", all else → "Registered" | fixed |
