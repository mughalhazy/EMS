import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './registrations.module.css'

export const metadata: Metadata = { title: 'Registrations' }

export default function RegistrationsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Registrations" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Registrations — wiring pending.</p>
      </div>
    </div>
  )
}
