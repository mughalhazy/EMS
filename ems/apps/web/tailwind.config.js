// ============================================================
// EMS Tailwind Configuration
// Source of truth: ems/design-language/design-language.html
//
// All values are literal hex/px to enable JIT, opacity modifiers,
// and arbitrary value support. Values are kept in 1:1 sync with
// styles/tokens.css — do not add values not in the design language.
//
// theme: {} (not extend) intentionally replaces Tailwind defaults.
// This enforces design language compliance — no stray default colors.
// ============================================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
  ],

  // Disable Preflight — we manage our own reset in styles/globals.css
  corePlugins: {
    preflight: false,
  },

  theme: {
    // ── Colors ────────────────────────────────────────────────
    // Exact values from design-language.html
    // No Tailwind defaults. Only these colors exist.
    colors: {
      transparent: 'transparent',
      current:     'currentColor',

      // Neutrals
      white:   '#FFFFFF',
      off:     '#FAFAF9',
      surface: '#F5F4F1',
      border: {
        DEFAULT: '#E8E6E1',
        strong:  '#D4D0C8',
      },
      ink: {
        DEFAULT: '#0F0F0E',
        2:       '#3D3D3A',
        3:       '#8A8880',
        4:       '#C4C2BC',
      },

      // Forest — health / positive / confirmed
      forest: {
        dk:     '#166534',
        DEFAULT: '#16A34A',
        lt:     '#DCFCE7',
        border: 'rgba(22,101,52,0.15)',
      },

      // Amber — warning / pending / attention
      amber: {
        dk:     '#92400E',
        DEFAULT: '#D97706',
        lt:     '#FEF3C7',
        border: 'rgba(146,64,14,0.15)',
      },

      // Brick — danger / error / cancellation
      brick: {
        dk:     '#991B1B',
        DEFAULT: '#DC2626',
        lt:     '#FEE2E2',
        border: 'rgba(153,27,27,0.15)',
      },

      // Indigo — data / navigation / primary action
      indigo: {
        dk:     '#1E1B4B',
        DEFAULT: '#4F46E5',
        lt:     '#EEF2FF',
        border: 'rgba(79,70,229,0.15)',
      },

      // Gold — finance / revenue / commerce
      gold: {
        dk:     '#78350F',
        DEFAULT: '#F59E0B',
        lt:     '#FFFBEB',
        border: 'rgba(120,53,15,0.15)',
      },

      // Teal — sync / live / real-time
      teal: {
        dk:     '#134E4A',
        DEFAULT: '#0D9488',
        lt:     '#CCFBF1',
        border: 'rgba(13,78,74,0.15)',
      },
    },

    // ── Typography ─────────────────────────────────────────────
    fontFamily: {
      sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['SF Mono', 'Fira Code', 'monospace'],
    },

    // Named to match design language roles (hero/section/card/body/label)
    fontSize: {
      hero:    ['52px', { fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.05' }],
      section: ['28px', { fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.15' }],
      card:    ['18px', { fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.3'  }],
      body:    ['13px', { fontWeight: '600', lineHeight: '1.5' }],
      label:   ['11px', { fontWeight: '700', letterSpacing: '0.06em',  lineHeight: '1'   }],
    },

    fontWeight: {
      medium:    '500',
      semibold:  '600',
      bold:      '700',
      extrabold: '800',
    },

    letterSpacing: {
      hero:    '-0.04em',
      section: '-0.03em',
      card:    '-0.02em',
      label:   '0.06em',
      normal:  '0',
    },

    lineHeight: {
      hero:    '1.05',
      section: '1.15',
      card:    '1.3',
      body:    '1.5',
      tight:   '1',
    },

    // ── Spacing — 8px grid ─────────────────────────────────────
    // Tailwind uses 4px base (1 unit = 4px).
    // Our grid is 8px — use even numbers only (2=8px, 4=16px, 6=24px…)
    spacing: {
      px:  '1px',
      0:   '0',
      0.5: '2px',
      1:   '4px',
      1.5: '6px',
      2:   '8px',
      3:   '12px',
      4:   '16px',
      5:   '20px',
      6:   '24px',
      7:   '28px',
      8:   '32px',
      9:   '36px',
      10:  '40px',
      12:  '48px',
      14:  '56px',
      16:  '64px',
      20:  '80px',
      24:  '96px',
      32:  '128px',
      40:  '160px',
      48:  '192px',
      56:  '224px',
      64:  '256px',
    },

    // ── Border Radius ──────────────────────────────────────────
    borderRadius: {
      none:    '0',
      DEFAULT: '8px',   // --radius
      lg:      '14px',  // --radius-lg
      xl:      '20px',  // --radius-xl
      full:    '9999px',
    },

    // ── Box Shadow ─────────────────────────────────────────────
    boxShadow: {
      sm:            '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
      DEFAULT:       '0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
      lg:            '0 12px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)',
      xl:            '0 24px 64px rgba(0,0,0,.16), 0 8px 24px rgba(0,0,0,.08)',
      'color-forest': '0 8px 24px rgba(22,163,74,0.18)',
      'color-indigo': '0 8px 24px rgba(79,70,229,0.18)',
      none:          'none',
    },

    // ── Breakpoints ────────────────────────────────────────────
    // Design language defines one primary breakpoint: 900px
    screens: {
      sm:  '640px',
      md:  '900px',   // ← primary design language breakpoint
      lg:  '1200px',
      xl:  '1536px',
    },

    // ── Transition ─────────────────────────────────────────────
    transitionDuration: {
      fast:    '120ms',  // --transition-fast
      DEFAULT: '200ms',  // --transition-base
      slow:    '400ms',  // --transition-slow
    },

    transitionTimingFunction: {
      DEFAULT: 'ease',
    },

    // ── Z-index ────────────────────────────────────────────────
    zIndex: {
      0:       '0',
      base:    '1',
      above:   '10',
      dropdown:'100',
      sticky:  '200',
      overlay: '300',
      modal:   '400',
      toast:   '500',
    },

    // ── Opacity ────────────────────────────────────────────────
    opacity: {
      0:    '0',
      5:    '0.05',
      10:   '0.1',
      15:   '0.15',
      20:   '0.2',
      25:   '0.25',
      50:   '0.5',
      75:   '0.75',
      100:  '1',
    },

    // Pass-through utilities (keep Tailwind defaults for these)
    extend: {},
  },

  plugins: [],
}
