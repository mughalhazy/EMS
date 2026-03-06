import React from 'react'
import styles from './AuthLayout.module.css'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.wordmark}>EMS</div>
        {children}
      </div>
    </div>
  )
}
