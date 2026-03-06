'use client'

import React from 'react'
import styles from './TopBar.module.css'

interface TopBarProps {
  title: string
  actions?: React.ReactNode
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
