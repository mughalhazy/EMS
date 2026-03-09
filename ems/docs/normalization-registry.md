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

---

### Events Page (events-page.html)

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| C-021 | events | gradient `var(--i-dk) → var(--i-md)` | page header background | resolved |
| C-022 | events | gradient `var(--t-dk) → var(--t-md)` | featured event background | resolved |
| C-023 | events | `rgba(255,255,255,0.15)` | filters-bar + featured-stat background | logged |
| C-024 | events | `rgba(255,255,255,0.2)` | featured-stat border | logged |
| S-012 | events | `56px` header padding-top | raw — space-14 not defined | logged |
| S-013 | events | `36px` view toggle button | raw — space-9 not defined | logged |
| T-015 | events | `48px` header h1 font-size | raw — between text-2xl (32px) and text-hero (52px) | logged |
| T-016 | events | `36px` featured title font-size | raw — between text-2xl (32px) and text-hero (52px) | logged |
| T-017 | events | `16px` featured desc font-size | raw — between text-md (14px) and text-lg (18px) | logged |
| T-018 | events | `20px` event-title font-size | raw — between text-lg (18px) and text-xl (28px) | logged |
| R-011 | events | `padding: 6px 14px` event-status | raw — both off grid | logged |
| R-012 | events | `border-radius: 20px` event-status | raw — pill shape, above radius-xl (20px = radius-xl actually) | logged |
| R-013 | events | `padding: 14px 28px` btn-white | raw — 14px off grid, 28px not in scale | logged |
| R-014 | events | `box-shadow: 0 8px 20px rgba(0,0,0,0.2)` btn-white hover | raw — custom shadow | logged |
| R-015 | events | `gap: 10px` featured-meta-item + btn-white | raw — between space-2 (8px) and space-3 (12px) | logged |
| R-016 | events | `font-size: 64px` emoji in event image | raw — display-only, not in type scale | logged |
| R-017 | events | `border-radius: 6px` event-tag | raw — below --radius (8px) | logged |
| M-009 | events | `.page-header` | `.pageHeader` CSS module class | resolved |
| M-010 | events | `.event-card` | `<Link>` with `.eventCard` class | resolved |
| M-011 | events | `.event-image.tech/design/business/social` | flat classes: `.imageTech/.imageDesign/.imageBusiness/.imageSocial` | resolved |
| M-012 | events | `.event-status.live/upcoming/sold-out` | flat classes: `.statusLive/.statusUpcoming/.statusSoldOut` | resolved |
| M-013 | events | `.event-price.free` | flat class `.eventPriceFree` overrides `.eventPrice` color | resolved |
| M-014 | events | `.filter-btn.active` | flat class `.filterBtnActive` | resolved |
| M-015 | events | `.view-btn.active` | flat class `.viewBtnActive` | resolved |
| P-008 | events | event meta (emoji, image variant, tags) not in domain model | derived from event name string matching; cycle fallback for unmatched | resolved |
| D-015 | events | page had 100% inline styles — zero CSS module usage | full rewrite: CSS module only, zero inline styles | fixed |
| D-016 | events | missing featured event section entirely | added `.featuredEvent` matching HTML 1:1 | fixed |
| D-017 | events | missing event image area (gradient + emoji + status badge) | added `.eventImage` + image variants + absolute status badge | fixed |
| D-018 | events | missing category filter tabs + search in gradient header | added `.filtersBar` inside `.pageHeader` matching HTML exactly | fixed |
| D-019 | events | card border-radius was radius-lg (14px); HTML uses radius-xl (20px) | changed to `var(--radius-xl)` | fixed |
| D-020 | events | card hover was translateY(-2px) + shadow-md; HTML uses translateY(-4px) + shadow-xl | fixed to match HTML | fixed |

---

### Agenda Page (agenda-page.html)

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| T-019 | agenda | `36px` h1 font-size | raw — between text-2xl (32px) and text-hero (52px) | logged |
| T-020 | agenda | `15px` event-meta + time-text font-size | raw — R-001 (already logged) | logged |
| T-021 | agenda | `10px` session-type badge | raw — R-005 (already logged) | logged |
| R-018 | agenda | `80px` timeline left offset + time-marker width | raw — layout dimension | logged |
| R-019 | agenda | `120px` sessions margin-left | raw — layout dimension | logged |
| R-020 | agenda | `73px` time-dot left position | raw — layout dimension | logged |
| R-021 | agenda | `0 0 0 4px var(--t-lt)` time-dot live box-shadow | raw — custom ring glow | logged |
| R-022 | agenda | `2px` timeline::before width | raw — hairline rule | logged |
| R-023 | agenda | `3px` time-dot border-width | raw — off border-width token | logged |
| R-024 | agenda | `32px` break-icon font-size | raw — emoji display size | logged |
| R-025 | agenda | `margin-left: -8px` speaker avatar overlap | raw — negative spacing (P-010) | logged |
| R-026 | agenda | `2px` speaker-avatar border-width | raw — off token | logged |
| R-027 | agenda | `6px` time-dot size (liveDot) + session-location padding-top | raw — off grid | logged |
| M-016 | agenda | `.page-header` | `.pageHeader` CSS module class | resolved |
| M-017 | agenda | `.day-tab.active` | flat class `.dayTabActive` (P-007) | resolved |
| M-018 | agenda | `.track-filter.active` | flat class `.trackFilterActive` (P-007) | resolved |
| M-019 | agenda | `.session-card.keynote/workshop/panel` | flat classes via `::before` color override: `.sessionCardKeynote/Workshop/Panel/Talk` | resolved |
| M-020 | agenda | `.session-type.keynote/workshop/panel/talk` | flat classes: `.sessionTypeKeynote/Workshop/Panel/Talk` | resolved |
| M-021 | agenda | `.time-dot.live/.break` | flat classes: `.timeDotLive/.timeDotBreak` (P-007) | resolved |
| P-009 | agenda | Session card left accent — 4px ::before, color by type: keynote=gold, workshop=teal, panel=forest, talk=indigo | Use flat `::before` color class per type, no compound selectors | resolved |
| P-010 | agenda | Speaker avatar overlap — `margin-left: -8px` on all except :first-child | pattern for stacked avatar rows | resolved |
| P-011 | agenda | Static agenda data — timeline defined as page-level constant, not wired to mock sessions | Breaks are not domain entities; session placeholder content is design spec static text (P-005) | resolved |
| D-021 | agenda | Page was 100% inline styles + grid/table layout | full rewrite: CSS module + vertical timeline structure | fixed |
| D-022 | agenda | Day tabs were underline-style (border-bottom); HTML uses pill inside surface container | Changed to pill tabs matching HTML | fixed |
| D-023 | agenda | Missing track filter buttons | Added `.trackFilters` with All Tracks / Main Stage / Innovation Lab / Developer Zone | fixed |
| D-024 | agenda | Missing timeline structure entirely (no time markers, dots, session cards) | Full timeline ported: `.timeline`, `.timeBlock`, `.timeMarker`, `.timeDot`, `.sessions`, `.sessionCard` | fixed |
| D-025 | agenda | Missing page header with h1, event meta, live badge | Added `.pageHeader` with title, date/location meta, teal live badge + pulse dot | fixed |
| D-026 | agenda | Sessions were dynamic from mock data via event selector; HTML shows static Day 1 agenda | Replaced with static TIMELINE constant matching HTML 1:1 (P-011) | fixed |

---

### Speakers Page (speakers-page.html)

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| R-028 | speakers | `96px` speaker avatar size | raw — layout dimension | logged |
| R-029 | speakers | `160px` featured avatar size | raw — layout dimension | logged |
| R-030 | speakers | `4px` avatar border-width | raw — off token | logged |
| R-031 | speakers | `rgba(255,255,255,0.15)` featured avatar bg | raw — glass effect | logged |
| R-032 | speakers | `0 8px 32px rgba(0,0,0,0.2)` featured avatar shadow | raw — custom shadow | logged |
| R-033 | speakers | `rgba(255,255,255,0.3)` featured badge/avatar border | raw — glass border | logged |
| R-034 | speakers | `56px` featured avatar initials font-size | raw — display size | logged |
| R-035 | speakers | `12px` session-time + speaker-company font-size | raw — between text-xs (11px) and text-sm (13px) | logged |
| R-036 | speakers | `18px` filter-btn padding-inline | raw — between space-4 (16px) and space-5 (20px) | logged |
| R-037 | speakers | `2px` session-name margin-bottom | raw — off grid | logged |
| R-038 | speakers | `6px` speaker-name margin-bottom | raw — R-003 (already logged) | logged |
| M-022 | speakers | `.filter-btn.active` | flat class `.filterBtnActive` (P-007) | resolved |
| M-023 | speakers | `.speaker-header` surface→white gradient | `.speakerHeader` CSS module class | resolved |
| M-024 | speakers | `.speaker-tag` | `.speakerTag` — indigo lt/dk/border | resolved |
| M-025 | speakers | `.social-link` + SVG icons | `SocialIcon` helper, 3 types: twitter/linkedin/github | resolved |
| P-012 | speakers | Static speaker card content is design spec placeholder | SPEAKERS + FEATURED constants matching HTML (P-005/P-011 pattern) | resolved |
| D-027 | speakers | Page was 100% inline styles + DataTable/table layout | full rewrite: CSS module + card grid | fixed |
| D-028 | speakers | Missing featured speaker banner | `.featuredSpeaker` indigo gradient with avatar, badge, bio, session row | fixed |
| D-029 | speakers | Missing search bar in page header | `.searchBar` + `.searchInput` with absolute SVG icon | fixed |
| D-030 | speakers | Missing speaker cards — was table rows | `.speakerCard` with gradient header + body (bio, tags, session, social) | fixed |
| D-031 | speakers | Missing topic filter tabs | All Speakers / Keynote / AI & ML / DevOps / Cloud / Security | fixed |
| D-032 | speakers | Missing speaker tags | `.speakerTags` + `.speakerTag` indigo chips | fixed |
| D-033 | speakers | Missing session section per card | `.speakerSessions` with time + name + track | fixed |
| D-034 | speakers | Missing social links | `.speakerSocial` + `SocialIcon` (twitter/linkedin/github) | fixed |

---

### Attendees Page (attendees-page.html)

| ID | HTML File | HTML Value | Resolved To | Status |
|----|-----------|------------|-------------|--------|
| R-039 | attendees | `36px` h1 font-size | raw — T-019 (already logged) | logged |
| R-040 | attendees | `15px` header-subtitle font-size | raw — R-001 (already logged) | logged |
| R-041 | attendees | `28px` header-stat-value font-size | raw — matches text-xl token | logged |
| R-042 | attendees | `40px` attendee-avatar width/height | raw — layout dimension | logged |
| R-043 | attendees | `44px` search-input left-padding (icon offset) | raw — layout dimension | logged |
| R-044 | attendees | `12px` stat-label / table th font-size | raw — R-035 (already logged) | logged |
| R-045 | attendees | `2px` attendee-name margin-bottom | raw — R-003 (already logged) | logged |
| R-046 | attendees | `6px` ticket-badge padding-block | raw — off token | logged |
| R-047 | attendees | `10px` company-tag padding-inline | raw — R-018 pattern (already logged) | logged |
| R-048 | attendees | `6px` company-tag border-radius | raw — R-017 (already logged) | logged |
| M-026 | attendees | `.filter-btn.active` | flat class `.filterBtnActive` (P-007) | resolved |
| M-027 | attendees | `.ticket-badge.vip/.standard/.early` | flat classes `.ticketBadgeVip/.Standard/.Early` (P-007) | resolved |
| M-028 | attendees | `.status-indicator.checked-in/.registered/.cancelled` | flat classes `.statusCheckedIn/.Registered/.Cancelled` (P-007) | resolved |
| M-029 | attendees | `.status-indicator.checked-in .status-dot` etc. | flat classes `.statusDotCheckedIn/.Registered/.Cancelled` (P-007) | resolved |
| M-030 | attendees | `.stat-value.teal/.forest/.gold/.indigo` | flat classes `.statValueTeal/.Forest/.Gold/.Indigo` (P-007) | resolved |
| M-031 | attendees | `.pagination-btn.active` | flat class `.paginationBtnActive` (P-007) | resolved |
| D-035 | attendees | Page was inline styles + DataTable layout, no stats grid | full rewrite: CSS module + stats grid + table container | fixed |
| D-036 | attendees | Missing page header with h1, subtitle, right-aligned stats | Added `.pageHeader` / `.headerTop` / `.headerStats` matching HTML | fixed |
| D-037 | attendees | Missing toolbar (search + filter group + add button) | Added `.toolbar` / `.searchBox` / `.filterGroup` / `.btnPrimary` | fixed |
| D-038 | attendees | Missing 4-column stats grid | Added `.statsGrid` `repeat(4,1fr)` with `.statCard` hover | fixed |
| D-039 | attendees | Attendee avatar was circle (Avatar component); HTML uses square (border-radius: var(--radius)) | Changed to 40px square with indigo→teal gradient, border-radius: radius | fixed |
| D-040 | attendees | Status was Badge component; HTML uses dot + text inline | Replaced with `.statusIndicator` + `.statusDot` flat-class pattern | fixed |
| D-041 | attendees | Table was wired to mock-data attendees by event selector | Replaced with static ATTENDEES constant — 8 rows matching HTML exactly (P-012) | fixed |
| D-042 | attendees | Missing pagination row | Added `.pagination` with prev/next chevrons + 1-4…23 buttons | fixed |
