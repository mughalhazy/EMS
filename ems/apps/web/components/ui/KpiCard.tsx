import React from 'react'
import styles from './KpiCard.module.css'

export type KpiColor = 'f' | 'g' | 'b' | 'i' | 'a' | 't'

export interface KpiCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  color?: KpiColor
  className?: string
}

export function KpiCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon,
  color = 'i',
  className = '',
}: KpiCardProps) {
  return (
    <div className={[styles.card, styles[color], className].filter(Boolean).join(' ')}>
      {icon && (
        <div className={[styles.icon, styles[color]].join(' ')} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {delta && (
        <div className={[styles.delta, styles[deltaType]].join(' ')}>
          {deltaType === 'positive' && '↑'}
          {deltaType === 'negative' && '↓'}
          {delta}
        </div>
      )}
    </div>
  )
}
