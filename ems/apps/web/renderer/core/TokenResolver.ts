// ============================================================
// TokenResolver — Pipeline Step 5: Validate & resolve style tokens
// Enforces: token references only, no arbitrary CSS literals
// ============================================================

import type { RenderedNode, ValidationError } from '../types/output'

// ── Known token namespaces from design language ──────────────
const TOKEN_PREFIXES = [
  // Color families
  'color-forest-', 'color-amber-', 'color-brick-', 'color-indigo-',
  'color-gold-', 'color-teal-',
  // Neutrals
  'color-white', 'color-off', 'color-surface', 'color-border',
  'color-border-strong', 'color-ink', 'color-ink-2', 'color-ink-3', 'color-ink-4',
  // Typography
  'text-hero', 'text-section', 'text-card', 'text-body', 'text-label',
  // Radius
  'radius', 'radius-lg', 'radius-xl',
  // Shadows
  'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
  'shadow-color-forest', 'shadow-color-indigo',
  // Spacing (design language scale)
  'space-', 'gap-',
  // Transitions
  'transition-base', 'transition-fast',
  // Surface tokens
  'surface-app', 'surface-portal', 'surface-auth',
  // State tokens
  'state-loading', 'state-empty', 'state-error', 'state-default',
]

// ── Patterns that indicate arbitrary CSS literals (forbidden) ─
const ARBITRARY_PATTERNS = [
  /^#[0-9a-fA-F]{3,8}$/,        // hex color
  /^rgb\(/,                       // rgb()
  /^rgba\(/,                      // rgba()
  /^\d+px$/,                      // pixel literal
  /^\d+rem$/,                     // rem literal
  /^\d+em$/,                      // em literal
  /^\d+%$/,                       // percent literal
  /^hsl\(/,                       // hsl()
]

// ── Validate a single token string ──────────────────────────
export function isValidToken(token: string): boolean {
  // Must not be an arbitrary literal
  for (const pattern of ARBITRARY_PATTERNS) {
    if (pattern.test(token)) return false
  }
  // Must match a known prefix
  return TOKEN_PREFIXES.some(prefix => token.startsWith(prefix))
}

// ── Resolve tokens for a node — returns errors if any invalid ─
export function resolveTokens(
  node: RenderedNode,
  styleTokens: string[],
): { tokens: string[]; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  const validTokens: string[] = []

  for (const token of styleTokens) {
    if (isValidToken(token)) {
      validTokens.push(token)
    } else {
      errors.push({
        code: 'NO_ARBITRARY_STYLING',
        message: `Token "${token}" in block "${node._blockId}" is not a valid design language token`,
        blockId: node._blockId,
        category: 'no_arbitrary_styling',
        severity: 'error',
      })
    }
  }

  return { tokens: validTokens, errors }
}

// ── Derive semantic style tokens from block context ──────────
export function deriveTokens(
  component: string,
  state: RenderedNode['state'],
  variant?: string,
): string[] {
  const tokens: string[] = []

  // State tokens
  if (state !== 'default') {
    tokens.push(`state-${state}`)
  }

  // Component-specific semantic tokens
  switch (component) {
    case 'Button':
      if (variant === 'primary') tokens.push('color-indigo-md', 'color-white')
      else if (variant === 'ghost') tokens.push('color-surface')
      else tokens.push('color-surface')
      break
    case 'Alert':
      tokens.push('color-brick-lt', 'color-brick-dk')
      break
    case 'EventStatusPill':
      tokens.push('color-forest-lt', 'color-forest-dk')
      break
    case 'StatCard':
      tokens.push('shadow-md')
      break
    case 'DataTable':
      tokens.push('color-surface', 'shadow-sm')
      break
    case 'EmptyState':
      tokens.push('color-surface')
      break
    case 'Skeleton':
      tokens.push('color-border')
      break
    case 'Sidebar':
      tokens.push('surface-app')
      break
    case 'TopNav':
      tokens.push('color-white', 'shadow-sm')
      break
    case 'Modal':
      tokens.push('color-white', 'shadow-xl')
      break
    case 'Drawer':
      tokens.push('color-white', 'shadow-lg')
      break
    case 'Toast':
      tokens.push('color-white', 'shadow-md')
      break
    default:
      tokens.push('color-white')
  }

  return tokens
}
