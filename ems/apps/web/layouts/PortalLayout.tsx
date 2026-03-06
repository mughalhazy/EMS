import React from 'react'
import styles from './PortalLayout.module.css'

export function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.wordmark}>EMS Portal</span>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
