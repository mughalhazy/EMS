import type { Metadata } from 'next'
import { EventLayout } from '@/layouts/EventLayout'

export const metadata: Metadata = { title: 'Events' }

export default function EventsPage() {
  return (
    <EventLayout title="Events">
      <p style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>
        Events — wiring pending.
      </p>
    </EventLayout>
  )
}
