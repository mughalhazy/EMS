import React from 'react'
import styles from './StatusChip.module.css'

export type StatusChipColor = 'forest' | 'amber' | 'brick' | 'indigo' | 'gold' | 'teal' | 'neutral'

export interface StatusChipProps {
  color?: StatusChipColor
  children: React.ReactNode
  className?: string
}

export function StatusChip({ color = 'neutral', children, className = '' }: StatusChipProps) {
  return (
    <span className={[styles.chip, styles[color], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
