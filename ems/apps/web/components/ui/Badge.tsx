import React from 'react'
import styles from './Badge.module.css'

export type BadgeColor = 'forest' | 'amber' | 'brick' | 'indigo' | 'gold' | 'teal' | 'neutral'

export interface BadgeProps {
  color?: BadgeColor
  children: React.ReactNode
  className?: string
}

export function Badge({ color = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[color], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
