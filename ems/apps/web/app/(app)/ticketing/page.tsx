import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './ticketing.module.css'

export const metadata: Metadata = { title: 'Ticketing' }

export default function TicketingPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Ticketing" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Ticketing — wiring pending.</p>
      </div>
    </div>
  )
}
