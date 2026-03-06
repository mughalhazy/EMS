import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './exhibitors.module.css'

export const metadata: Metadata = { title: 'Exhibitors' }

export default function ExhibitorsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Exhibitors" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Exhibitors — wiring pending.</p>
      </div>
    </div>
  )
}
