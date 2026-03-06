import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './settings.module.css'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Settings" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Settings — wiring pending.</p>
      </div>
    </div>
  )
}
