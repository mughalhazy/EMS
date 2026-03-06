import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './speakers.module.css'

export const metadata: Metadata = { title: 'Speakers' }

export default function SpeakersPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Speakers" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Speakers — wiring pending.</p>
      </div>
    </div>
  )
}
