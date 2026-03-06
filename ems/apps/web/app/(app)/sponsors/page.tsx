import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './sponsors.module.css'

export const metadata: Metadata = { title: 'Sponsors' }

export default function SponsorsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Sponsors" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Sponsors — wiring pending.</p>
      </div>
    </div>
  )
}
