'use client'

import React from 'react'
import { Avatar } from '@/components/ui/Avatar'
import styles from './TopBar.module.css'

interface TopBarProps {
  title: string
  actions?: React.ReactNode
}

// Static session user — connect to auth context when auth is wired
const SESSION_USER = { name: 'Sarah Chen', initials: 'SC' }

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        {actions && <div className={styles.actions}>{actions}</div>}
        <div className={styles.sep} aria-hidden="true" />
        <div className={styles.userChip}>
          <Avatar initials={SESSION_USER.initials} color="teal" size="sm" />
          <span className={styles.userName}>{SESSION_USER.name}</span>
          <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  )
}
