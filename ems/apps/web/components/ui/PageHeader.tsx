'use client'

import React from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  /** Action buttons slot — rendered on the right */
  children?: React.ReactNode
}

export function PageHeader({ title = 'Untitled', subtitle, children }: PageHeaderProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  )
}
