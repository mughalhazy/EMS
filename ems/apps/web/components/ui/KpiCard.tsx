import React from 'react'
import styles from './KpiCard.module.css'

export type KpiColor = 'f' | 'g' | 'b' | 'i' | 'a' | 't'

export interface KpiCardProps {
  label?: string
  value?: string | number
  /** Renderer data bridge — injected via dataKey; used as value when value is absent */
  data?: unknown
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  color?: KpiColor
  className?: string
}

export function KpiCard({
  label = '',
  value,
  data,
  delta,
  deltaType = 'neutral',
  icon,
  color = 'i',
  className = '',
}: KpiCardProps) {
  const displayValue = value ?? (
    data !== undefined && data !== null && typeof data !== 'object'
      ? String(data)
      : '—'
  )
  return (
    <div className={[styles.card, styles[color], className].filter(Boolean).join(' ')}>
      {icon && (
        <div className={[styles.icon, styles[color]].join(' ')} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{displayValue}</div>
      {delta && (
        <div className={[styles.delta, styles[deltaType]].join(' ')}>
          {deltaType === 'positive' && (
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          )}
          {deltaType === 'negative' && (
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          )}
          {delta}
        </div>
      )}
    </div>
  )
}
