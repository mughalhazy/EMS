import React from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = 'No records found',
  description = 'Nothing here yet. Try adjusting your filters.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 9h18" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
      {actionLabel && onAction && (
        <button className={styles.cta} onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
