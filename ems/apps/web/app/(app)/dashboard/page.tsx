import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import { KpiCard } from '@/components/ui/KpiCard'
import { AlertCard } from '@/components/ui/AlertCard'
import styles from './dashboard.module.css'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Dashboard" />
      <div className={styles.content}>
        <AlertCard variant="indigo" live title="Platform status">
          All systems operational
        </AlertCard>

        <div className={styles.kpiGrid}>
          <KpiCard label="Active Events"     value="—" color="i" />
          <KpiCard label="Registrations"     value="—" color="f" />
          <KpiCard label="Total Revenue"     value="—" color="g" />
          <KpiCard label="Checked In"        value="—" color="t" />
          <KpiCard label="Pending Approvals" value="—" color="a" />
          <KpiCard label="Open Issues"       value="—" color="b" />
        </div>
      </div>
    </div>
  )
}
