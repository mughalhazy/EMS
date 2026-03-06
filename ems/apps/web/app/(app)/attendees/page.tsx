import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './attendees.module.css'

export const metadata: Metadata = { title: 'Attendees' }

export default function AttendeesPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Attendees" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Attendees — wiring pending.</p>
      </div>
    </div>
  )
}
