import React from 'react'
import styles from './Card.module.css'

export interface CardProps {
  /** Title rendered in the card header strip */
  title?: string
  /** Right-side header slot — buttons, badges, chips */
  actions?: React.ReactNode
  /**
   * Removes body padding. Use when content (table, list) must bleed to card edges.
   * @default false
   */
  flush?: boolean
  className?: string
  children: React.ReactNode
}

export function Card({ title, actions, flush = false, className = '', children }: CardProps) {
  const hasHeader = title || actions

  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      {hasHeader && (
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={flush ? styles.bodyFlush : styles.body}>
        {children}
      </div>
    </div>
  )
}
