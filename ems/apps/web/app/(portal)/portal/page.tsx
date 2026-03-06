import type { Metadata } from 'next'
import { KpiCard } from '@/components/ui/KpiCard'
import styles from './portal.module.css'

export const metadata: Metadata = { title: 'Executive Portal' }

export default function PortalPage() {
  return (
    <div>
      <h1 className={styles.heading}>Executive Overview</h1>
      <div className={styles.kpiGrid}>
        <KpiCard label="Total Revenue"     value="—" color="g" />
        <KpiCard label="Total Registrations" value="—" color="f" />
        <KpiCard label="Active Events"     value="—" color="i" />
        <KpiCard label="Pending Items"     value="—" color="a" />
      </div>
    </div>
  )
}
