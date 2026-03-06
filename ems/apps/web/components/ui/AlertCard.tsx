import React from 'react'
import styles from './AlertCard.module.css'

export type AlertVariant = 'forest' | 'amber' | 'brick' | 'indigo'

export interface AlertCardProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  live?: boolean
  className?: string
}

export function AlertCard({
  variant = 'indigo',
  title,
  children,
  live = false,
  className = '',
}: AlertCardProps) {
  return (
    <div className={[styles.alert, styles[variant], className].filter(Boolean).join(' ')}>
      {live && <span className={styles.liveDot} aria-label="Live" />}
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
