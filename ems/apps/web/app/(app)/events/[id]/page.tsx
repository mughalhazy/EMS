import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './event.module.css'

export const metadata: Metadata = { title: 'Event Detail' }

interface Props {
  params: { id: string }
}

export default function EventDetailPage({ params }: Props) {
  return (
    <div className={styles.page}>
      <TopBar title="Event Detail" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Event {params.id} — wiring pending.</p>
      </div>
    </div>
  )
}
