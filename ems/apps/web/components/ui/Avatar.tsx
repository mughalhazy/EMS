import React from 'react'
import styles from './Avatar.module.css'

export type AvatarColor = 'indigo' | 'forest' | 'amber' | 'brick' | 'gold' | 'teal' | 'neutral'
export type AvatarSize  = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  /** 1–2 character initials, e.g. "JD". Uppercased automatically. */
  initials: string
  color?: AvatarColor
  size?: AvatarSize
  /** Optional image URL — renders <img> instead of initials */
  src?: string
  /** Alt text for image variant; falls back to initials */
  alt?: string
  className?: string
}

export function Avatar({
  initials,
  color = 'indigo',
  size  = 'md',
  src,
  alt,
  className = '',
}: AvatarProps) {
  const label = alt ?? initials

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={[styles.avatar, styles.img, styles[size], className].filter(Boolean).join(' ')}
      />
    )
  }

  return (
    <span
      className={[styles.avatar, styles[color], styles[size], className].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  )
}
