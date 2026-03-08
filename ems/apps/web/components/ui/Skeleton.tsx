'use client'

import React from 'react'
import styles from './Skeleton.module.css'

type SkeletonVariant = 'table' | 'card' | 'stat'

interface SkeletonProps {
  rows?: number
  variant?: SkeletonVariant
}

export function Skeleton({ rows = 5, variant = 'table' }: SkeletonProps) {
  const wrapClass = [styles.wrap, variant === 'stat' ? styles.stat : variant === 'card' ? styles.card : ''].filter(Boolean).join(' ')

  return (
    <div className={wrapClass} aria-busy="true" aria-label="Loading…" role="status">
      {[...Array(Math.min(rows, 8))].map((_, i) => (
        <div key={i} className={styles.line} />
      ))}
    </div>
  )
}
