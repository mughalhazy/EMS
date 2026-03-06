import React from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        {children}
      </div>
    </div>
  )
}
