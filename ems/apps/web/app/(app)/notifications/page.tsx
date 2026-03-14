'use client'

import { useState } from 'react'
import styles from './notifications.module.css'

/* ── Static data — faithful port of notifications-page.html ── */

type IconVariant = 'success' | 'info' | 'warning' | 'error' | 'revenue' | 'activity'
type BadgeVariant = 'urgent' | 'high' | 'medium' | null

interface Notification {
  icon:     string
  iconVar:  IconVariant
  title:    string
  time:     string
  message:  string
  badge:    BadgeVariant
  link:     string
  unread?:  boolean
}

const NOTIFICATIONS: Notification[] = [
  {
    icon:    '⚠️',
    iconVar: 'error',
    title:   'Session capacity exceeded',
    time:    '2 min ago',
    message: '"The Future of AI" keynote has exceeded capacity by 120 attendees. Overflow room recommended.',
    badge:   'urgent',
    link:    'View Session →',
    unread:  true,
  },
  {
    icon:    '💰',
    iconVar: 'revenue',
    title:   'Revenue milestone reached',
    time:    '18 min ago',
    message: 'Total event revenue has reached $500K, exceeding the target by 15%. VIP tickets contributed 42%.',
    badge:   'high',
    link:    'View Analytics →',
    unread:  true,
  },
  {
    icon:    '🎫',
    iconVar: 'activity',
    title:   'Bulk ticket purchase',
    time:    '1 hour ago',
    message: 'TechCorp purchased 50 VIP tickets for their team. Total transaction: $24,950.',
    badge:   null,
    link:    'View Order →',
    unread:  true,
  },
  {
    icon:    '✅',
    iconVar: 'success',
    title:   'Speaker confirmed',
    time:    '3 hours ago',
    message: 'Dr. Sarah Chen confirmed for the "ML at Scale" workshop. Bio and headshot uploaded.',
    badge:   null,
    link:    'View Speaker →',
  },
  {
    icon:    '📧',
    iconVar: 'info',
    title:   'Email campaign sent',
    time:    '5 hours ago',
    message: '"Last Chance: Early Bird Pricing" campaign sent to 8,472 recipients. Current open rate: 38%.',
    badge:   null,
    link:    'View Campaign →',
  },
  {
    icon:    '⏰',
    iconVar: 'warning',
    title:   'Deadline approaching',
    time:    '6 hours ago',
    message: 'Speaker submission deadline is in 48 hours. 12 pending submissions require review.',
    badge:   'medium',
    link:    'Review Submissions →',
  },
  {
    icon:    '🎉',
    iconVar: 'success',
    title:   'Sponsorship confirmed',
    time:    '8 hours ago',
    message: 'DataFlow Analytics signed Platinum sponsorship agreement. Contract value: $150,000.',
    badge:   null,
    link:    'View Contract →',
  },
  {
    icon:    '📊',
    iconVar: 'activity',
    title:   'Weekly analytics ready',
    time:    'Yesterday',
    message: 'Your weekly event performance report is ready. Attendance up 24%, revenue up 18%.',
    badge:   null,
    link:    'View Report →',
  },
  {
    icon:    '🏢',
    iconVar: 'info',
    title:   'Exhibitor booth assigned',
    time:    'Yesterday',
    message: 'CloudXpress has been assigned booth A-110 in the main exhibition hall.',
    badge:   null,
    link:    'View Floor Plan →',
  },
  {
    icon:    '✨',
    iconVar: 'success',
    title:   'Attendee milestone',
    time:    '2 days ago',
    message: 'Registered attendees surpassed 2,000. Current total: 2,147 registrations.',
    badge:   null,
    link:    'View Attendees →',
  },
]

const TABS = ['All', 'Unread', 'Urgent', 'Revenue']

function iconVariantClass(v: IconVariant): string {
  const map: Record<IconVariant, string> = {
    success:  styles.notificationIconSuccess,
    info:     styles.notificationIconInfo,
    warning:  styles.notificationIconWarning,
    error:    styles.notificationIconError,
    revenue:  styles.notificationIconRevenue,
    activity: styles.notificationIconActivity,
  }
  return map[v]
}

function badgeClass(b: BadgeVariant): string {
  if (b === 'urgent') return styles.notificationBadgeUrgent
  if (b === 'high')   return styles.notificationBadgeHigh
  if (b === 'medium') return styles.notificationBadgeMedium
  return ''
}

function badgeLabel(b: BadgeVariant): string {
  if (b === 'urgent') return 'Urgent'
  if (b === 'high')   return 'High Priority'
  if (b === 'medium') return 'Medium'
  return ''
}

/* ── SVG icons ── */
const SettingsIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
)
const MarkReadIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
  </svg>
)

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTitle}>
            <h1>Notifications</h1>
            <p className={styles.headerSubtitle}>Stay updated with real-time event activity and alerts</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn}>
              <SettingsIcon /> Settings
            </button>
            <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
              <MarkReadIcon /> Mark All Read
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className={styles.content}>
        <div className={styles.contentLayout}>

          {/* ── Main Feed ── */}
          <div>
            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              {TABS.map(t => (
                <button
                  key={t}
                  className={`${styles.filterTab}${activeTab === t ? ` ${styles.filterTabActive}` : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Notifications Feed */}
            <div className={styles.notificationsFeed}>
              {NOTIFICATIONS.map((n, i) => (
                <div
                  key={i}
                  className={`${styles.notificationItem}${n.unread ? ` ${styles.notificationItemUnread}` : ''}`}
                >
                  <div className={`${styles.notificationIcon} ${iconVariantClass(n.iconVar)}`}>
                    {n.icon}
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationTitle}>{n.title}</div>
                      <div className={styles.notificationTime}>{n.time}</div>
                    </div>
                    <div className={styles.notificationMessage}>{n.message}</div>
                    <div className={styles.notificationMeta}>
                      {n.badge && (
                        <span className={`${styles.notificationBadge} ${badgeClass(n.badge)}`}>
                          {badgeLabel(n.badge)}
                        </span>
                      )}
                      <button className={styles.notificationLink}>{n.link}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className={styles.sidebar}>

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <h3 className={styles.sidebarTitle}>Quick Stats</h3>
              {[
                { label: 'Unread',     value: '3',  unread: true  },
                { label: 'Today',      value: '12', unread: false },
                { label: 'This Week',  value: '47', unread: false },
                { label: 'Urgent',     value: '1',  unread: false },
              ].map((s, i) => (
                <div key={i} className={styles.statRow}>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={`${styles.statValue}${s.unread ? ` ${styles.statValueUnread}` : ''}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Priority Alerts */}
            <div className={styles.priorityAlerts}>
              <h3 className={styles.sidebarTitle}>Priority Alerts</h3>
              <div className={styles.alertItem}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertIcon}>🚨</span>
                  <span className={styles.alertTitle}>Capacity Issue</span>
                </div>
                <div className={styles.alertMessage}>Main keynote session over capacity</div>
              </div>
              <div className={`${styles.alertItem} ${styles.alertItemWarning}`}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertIcon}>⏰</span>
                  <span className={styles.alertTitle}>Deadline Soon</span>
                </div>
                <div className={styles.alertMessage}>Speaker submissions close in 48h</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <h3 className={styles.sidebarTitle}>Recent Activity</h3>
              <div className={styles.activityTimeline}>
                {[
                  { dot: styles.activityDotRevenue, text: '$500K revenue milestone',  time: '18 min ago'   },
                  { dot: '',                         text: '50 VIP tickets purchased', time: '1 hour ago'   },
                  { dot: styles.activityDotSuccess,  text: 'Speaker confirmed',        time: '3 hours ago'  },
                  { dot: '',                         text: 'Email campaign sent',      time: '5 hours ago'  },
                  { dot: styles.activityDotSuccess,  text: 'Platinum sponsor signed',  time: '8 hours ago'  },
                ].map((a, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={`${styles.activityDot}${a.dot ? ` ${a.dot}` : ''}`} />
                    <div className={styles.activityText}>{a.text}</div>
                    <div className={styles.activityTime}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  )
}
