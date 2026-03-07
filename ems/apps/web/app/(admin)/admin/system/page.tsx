'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { adminService, SystemMetrics, ServiceHealth, ServiceStatus } from '@/services/admin.service'
import styles from './system.module.css'

// ── Helpers ───────────────────────────────────────────────────
function fmtPct(n: number) { return `${n.toFixed(1)}%` }
function fmtMs(n: number)  { return `${n}ms` }
function fmtNum(n: number) { return n.toLocaleString() }
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  healthy:  'Healthy',
  degraded: 'Degraded',
  down:     'Down',
}

// ── Platform metric definitions ───────────────────────────────
function platformMetrics(m: SystemMetrics) {
  return [
    { label: 'Requests / min',   value: fmtNum(m.requestsPerMinute), color: 'indigo' },
    { label: 'Error Rate',       value: fmtPct(m.errorRate),         color: m.errorRate > 1 ? 'brick' : 'forest' },
    { label: 'P95 Latency',      value: fmtMs(m.p95LatencyMs),       color: m.p95LatencyMs > 500 ? 'amber' : 'indigo' },
    { label: 'Active Sessions',  value: fmtNum(m.activeSessions),    color: 'teal' },
    { label: 'Kafka Lag',        value: fmtNum(m.kafkaLag),          color: m.kafkaLag > 1000 ? 'amber' : 'forest' },
    { label: 'Cache Hit Rate',   value: fmtPct(m.cacheHitRate),      color: m.cacheHitRate < 80 ? 'amber' : 'forest' },
  ] as const
}

type MetricColor = 'indigo' | 'forest' | 'amber' | 'brick' | 'teal'
const METRIC_COLOR_CLASS: Record<MetricColor, string> = {
  indigo: styles.colorIndigo,
  forest: styles.colorForest,
  amber:  styles.colorAmber,
  brick:  styles.colorBrick,
  teal:   styles.colorTeal,
}

// ── Service health card ───────────────────────────────────────
function ServiceCard({ svc }: { svc: ServiceHealth }) {
  return (
    <div className={[styles.svcCard, styles[`svc_${svc.status}`]].join(' ')}>
      <div className={styles.svcHeader}>
        <span className={[styles.svcDot, styles[`dot_${svc.status}`]].join(' ')} aria-hidden="true" />
        <span className={styles.svcName}>{svc.name}</span>
        <span className={[styles.svcStatus, styles[`status_${svc.status}`]].join(' ')}>
          {STATUS_LABEL[svc.status]}
        </span>
      </div>
      <div className={styles.svcMeta}>
        <span className={styles.svcMetaItem}>
          <span className={styles.svcMetaLabel}>Latency</span>
          <span className={styles.svcMetaValue}>{fmtMs(svc.latencyMs)}</span>
        </span>
        <span className={styles.svcMetaItem}>
          <span className={styles.svcMetaLabel}>Uptime</span>
          <span className={[styles.svcMetaValue, svc.uptimePercent < 99 ? styles.uptimeLow : ''].join(' ')}>
            {fmtPct(svc.uptimePercent)}
          </span>
        </span>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function SystemSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonMetricRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonMetric} />
        ))}
      </div>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminSystemPage() {
  const [metrics, setMetrics]   = useState<SystemMetrics | null>(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    adminService.systemHealth()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const allHealthy = metrics ? metrics.services.every(s => s.status === 'healthy') : null
  const downCount  = metrics ? metrics.services.filter(s => s.status === 'down').length : 0
  const degraded   = metrics ? metrics.services.filter(s => s.status === 'degraded').length : 0

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>System Health</h1>
          <p className={styles.subheading}>
            Real-time service status and platform metrics.
            {metrics && (
              <span className={styles.asOf}> As of {fmtTime(metrics.asOf)}</span>
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {allHealthy !== null && (
            <div className={[styles.overallStatus, allHealthy && downCount === 0 && degraded === 0 ? styles.overallOk : downCount > 0 ? styles.overallDown : styles.overallDegraded].join(' ')}>
              <span className={styles.overallDot} />
              {allHealthy && downCount === 0 && degraded === 0
                ? 'All systems operational'
                : downCount > 0
                  ? `${downCount} service${downCount > 1 ? 's' : ''} down`
                  : `${degraded} degraded`}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            loading={refreshing}
            onClick={() => load(true)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <SystemSkeleton />
      ) : !metrics ? (
        <div className={styles.error}>
          <p className={styles.errorTitle}>Unable to load system metrics</p>
          <p className={styles.errorDesc}>Check your connection or try refreshing.</p>
          <Button variant="ghost" size="sm" onClick={() => load(true)}>Retry</Button>
        </div>
      ) : (
        <>
          {/* Platform metrics */}
          <section>
            <h2 className={styles.sectionTitle}>Platform Metrics</h2>
            <div className={styles.metricGrid}>
              {platformMetrics(metrics).map(m => (
                <div key={m.label} className={styles.metricCard}>
                  <span className={[styles.metricValue, METRIC_COLOR_CLASS[m.color as MetricColor]].join(' ')}>
                    {m.value}
                  </span>
                  <span className={styles.metricLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Service health grid */}
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Services</h2>
              <span className={styles.svcCount}>{metrics.services.length} services</span>
            </div>
            <div className={styles.svcGrid}>
              {metrics.services.map(svc => (
                <ServiceCard key={svc.name} svc={svc} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
