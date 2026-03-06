import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './agenda.module.css'

export const metadata: Metadata = { title: 'Agenda' }

export default function AgendaPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Agenda" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Agenda — wiring pending.</p>
      </div>
    </div>
  )
}
