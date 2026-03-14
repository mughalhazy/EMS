'use client'

import { useState } from 'react'
import styles from './analytics.module.css'

/* ── Static data — faithful port of analytics-page.html ── */

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'All Time']

const KPIS = [
  { variant: styles.kpiCardRevenue,      icon: '💰', label: 'Total Revenue',      value: '$487K', change: '+18% vs last month' },
  { variant: styles.kpiCardAttendees,    icon: '👥', label: 'Total Attendees',     value: '1,847', change: '+24% vs last month' },
  { variant: styles.kpiCardEngagement,   icon: '📊', label: 'Avg Sessions / Person', value: '4.2',   change: '+0.8 vs last event' },
  { variant: styles.kpiCardSatisfaction, icon: '⭐', label: 'Satisfaction Score',  value: '4.8',   change: '+0.3 vs last event' },
]

interface BarData { month: string; revenue: number; target: number }

const BAR_DATA: BarData[] = [
  { month: 'Sep', revenue: 55,  target: 60  },
  { month: 'Oct', revenue: 72,  target: 70  },
  { month: 'Nov', revenue: 48,  target: 65  },
  { month: 'Dec', revenue: 85,  target: 75  },
  { month: 'Jan', revenue: 63,  target: 70  },
  { month: 'Feb', revenue: 91,  target: 80  },
  { month: 'Mar', revenue: 100, target: 85  },
  { month: 'Apr', revenue: 78,  target: 80  },
]

interface Insight { variant: string; title: string; desc: string }

const INSIGHTS: Insight[] = [
  { variant: styles.insightPositive, title: 'Revenue on Track',        desc: 'Current trajectory exceeds Q1 target by 15%. Strong VIP ticket sales driving growth.' },
  { variant: styles.insightDefault,  title: 'High Engagement',         desc: 'Attendees averaging 4.2 sessions — 40% above industry benchmark.' },
  { variant: styles.insightWarning,  title: 'Email Open Rate Dipping',  desc: 'Open rates dropped 6% this week. Consider A/B testing subject lines.' },
  { variant: styles.insightPositive, title: 'Workshop Demand Surging',  desc: 'All 12 workshops now at 90%+ capacity. Consider adding overflow sessions.' },
]

interface PerfItem { title: string; metric: string; metricClass: string; pct: number; fillClass: string; label: string; badgeClass: string; badge: string }

const PERFORMANCE: PerfItem[] = [
  {
    title:       'Ticket Conversion',
    metric:      '68%',
    metricClass: styles.perfMetricHigh,
    pct:         68,
    fillClass:   styles.progressFillHigh,
    label:       'of page visitors converted',
    badgeClass:  styles.metricBadgeHigh,
    badge:       'High',
  },
  {
    title:       'Email Open Rate',
    metric:      '42%',
    metricClass: styles.perfMetricMedium,
    pct:         42,
    fillClass:   styles.progressFillMedium,
    label:       'industry avg: 38%',
    badgeClass:  styles.metricBadgeMedium,
    badge:       'Medium',
  },
  {
    title:       'App Engagement',
    metric:      '78%',
    metricClass: styles.perfMetricHigh,
    pct:         78,
    fillClass:   styles.progressFillHigh,
    label:       'of attendees using app',
    badgeClass:  styles.metricBadgeHigh,
    badge:       'High',
  },
]

interface SessionRow { name: string; speaker: string; attendees: number; rating: string; badge: string; badgeClass: string }

const SESSIONS: SessionRow[] = [
  { name: 'The Future of AI',           speaker: 'Dr. Sarah Chen',    attendees: 520, rating: '4.9', badge: 'High',   badgeClass: styles.metricBadgeHigh   },
  { name: 'Cloud Architecture at Scale', speaker: 'Marcus Johnson',   attendees: 380, rating: '4.7', badge: 'High',   badgeClass: styles.metricBadgeHigh   },
  { name: 'DevOps Best Practices',       speaker: 'Emma Rodriguez',   attendees: 290, rating: '4.5', badge: 'High',   badgeClass: styles.metricBadgeHigh   },
  { name: 'Web3 & Decentralization',     speaker: 'Alex Thompson',    attendees: 210, rating: '4.2', badge: 'Medium', badgeClass: styles.metricBadgeMedium },
  { name: 'Security in the Age of AI',   speaker: 'Priya Patel',      attendees: 340, rating: '4.6', badge: 'High',   badgeClass: styles.metricBadgeHigh   },
]

export default function AnalyticsPage() {
  const [activeDateRange, setActiveDateRange] = useState('Last 30 Days')

  const maxRevenue = Math.max(...BAR_DATA.map(b => b.revenue))

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitle}>
              <h1>Event Analytics</h1>
              <p className={styles.headerSubtitle}>Comprehensive performance metrics and insights for Tech Summit 2026</p>
            </div>
            <div className={styles.dateRange}>
              {DATE_RANGES.map(r => (
                <button
                  key={r}
                  className={`${styles.dateBtn}${activeDateRange === r ? ` ${styles.dateBtnActive}` : ''}`}
                  onClick={() => setActiveDateRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className={styles.content}>

        {/* KPI Grid */}
        <div className={styles.kpiGrid}>
          {KPIS.map((k, i) => (
            <div key={i} className={`${styles.kpiCard} ${k.variant}`}>
              <div className={styles.kpiIcon}>{k.icon}</div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{k.value}</div>
              <div className={styles.kpiChange}>{k.change}</div>
            </div>
          ))}
        </div>

        {/* Content Grid — chart + insights */}
        <div className={styles.contentGrid}>

          {/* Revenue Trends Chart */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Revenue Trends</div>
                <div className={styles.cardSubtitle}>Monthly revenue vs target</div>
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendDotRevenue}`} />
                  Revenue
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendDotTarget}`} />
                  Target
                </div>
              </div>
            </div>
            <div className={styles.barChart}>
              {BAR_DATA.map((b, i) => (
                <div key={i} className={styles.barGroup}>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(b.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className={styles.barLabel}>{b.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className={styles.insightsCard}>
            <div className={styles.cardTitle}>Key Insights</div>
            <div className={styles.insightsList}>
              {INSIGHTS.map((ins, i) => (
                <div key={i} className={`${styles.insightItem} ${ins.variant}`}>
                  <div className={styles.insightTitle}>{ins.title}</div>
                  <div className={styles.insightDesc}>{ins.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Performance Grid */}
        <div className={styles.performanceGrid}>
          {PERFORMANCE.map((p, i) => (
            <div key={i} className={styles.perfCard}>
              <div className={styles.perfHeader}>
                <div className={styles.perfTitle}>{p.title}</div>
                <span className={`${styles.metricBadge} ${p.badgeClass}`}>{p.badge}</span>
              </div>
              <div className={`${styles.perfMetric} ${p.metricClass}`}>{p.metric}</div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${p.fillClass}`} style={{ width: `${p.pct}%` }} />
              </div>
              <div className={styles.perfLabel}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* Session Performance Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>
              <div className={styles.cardTitle}>Session Performance</div>
              <div className={styles.cardSubtitle}>Top sessions by attendance and rating</div>
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Session</th>
                <th>Speaker</th>
                <th>Attendees</th>
                <th>Rating</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {SESSIONS.map((s, i) => (
                <tr key={i}>
                  <td className={styles.sessionName}>{s.name}</td>
                  <td>{s.speaker}</td>
                  <td>{s.attendees.toLocaleString()}</td>
                  <td>{'⭐'.repeat(1)} {s.rating}</td>
                  <td><span className={`${styles.metricBadge} ${s.badgeClass}`}>{s.badge}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
