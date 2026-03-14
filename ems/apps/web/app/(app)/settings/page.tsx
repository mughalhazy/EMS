'use client'

import { useState } from 'react'
import styles from './settings.module.css'

/* ── Static data — faithful port of settings-page.html ── */

const TABS = [
  {
    id:   'account',
    label: 'Account',
    icon: (
      <svg className={styles.settingsTabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    id:   'notifications',
    label: 'Notifications',
    icon: (
      <svg className={styles.settingsTabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
    ),
  },
  {
    id:   'billing',
    label: 'Billing',
    icon: (
      <svg className={styles.settingsTabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    id:   'team',
    label: 'Team',
    icon: (
      <svg className={styles.settingsTabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    id:   'integrations',
    label: 'Integrations',
    icon: (
      <svg className={styles.settingsTabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    id:   'security',
    label: 'Security',
    icon: (
      <svg className={styles.settingsTabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
  },
]

interface ToggleItem {
  label:       string
  description: string
  on:          boolean
}

const TOGGLES: ToggleItem[] = [
  { label: 'Event Updates',       description: 'Receive notifications about event changes and updates',    on: true  },
  { label: 'Registration Alerts', description: 'Get notified when new attendees register',                on: true  },
  { label: 'Revenue Milestones',  description: 'Notifications when revenue targets are reached',          on: true  },
  { label: 'Weekly Summary',      description: 'Receive weekly analytics and performance reports',         on: false },
  { label: 'Marketing Emails',    description: 'Product updates, tips, and EventHub news',                on: false },
]

interface Integration {
  icon:      string
  name:      string
  connected: boolean
}

const INTEGRATIONS: Integration[] = [
  { icon: '📧', name: 'Gmail',           connected: true  },
  { icon: '📅', name: 'Google Calendar', connected: true  },
  { icon: '💬', name: 'Slack',           connected: false },
  { icon: '💳', name: 'Stripe',          connected: false },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab]   = useState('account')
  const [fullName, setFullName]     = useState('Alex Johnson')
  const [email, setEmail]           = useState('alex.johnson@eventhub.com')
  const [role, setRole]             = useState('Event Manager')
  const [language, setLanguage]     = useState('English (US)')
  const [timezone, setTimezone]     = useState('Pacific Time (PT)')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [toggles, setToggles]       = useState<boolean[]>(TOGGLES.map(t => t.on))

  function toggleNotification(i: number) {
    setToggles(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTitle}>
            <h1>Settings</h1>
            <p className={styles.headerSubtitle}>Manage your account preferences and event configurations</p>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className={styles.content}>
        <div className={styles.settingsLayout}>

          {/* ── Sidebar ── */}
          <aside className={styles.settingsSidebar}>
            <nav className={styles.settingsNav}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`${styles.settingsTab}${activeTab === t.id ? ` ${styles.settingsTabActive}` : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Panel ── */}
          <div className={styles.settingsPanel}>

            {/* ── Profile Information ── */}
            <div className={styles.panelSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                <p className={styles.sectionDescription}>Update your account profile information and email address</p>
              </div>

              {/* Avatar */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Profile Photo</label>
                <div className={styles.avatarUpload}>
                  <div className={styles.avatarPreview}>AJ</div>
                  <div className={styles.avatarActions}>
                    <button className={`${styles.btn} ${styles.btnSecondary}`}>Upload Photo</button>
                    <button className={`${styles.btn} ${styles.btnDanger}`}>Remove</button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={fullName}
                  placeholder="Enter your name"
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={email}
                  placeholder="Enter your email"
                  onChange={e => setEmail(e.target.value)}
                />
                <p className={styles.formHelper}>We'll send confirmation emails to this address</p>
              </div>

              {/* Role */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={role}
                  placeholder="Enter your role"
                  onChange={e => setRole(e.target.value)}
                />
              </div>
            </div>

            {/* ── Preferences ── */}
            <div className={styles.panelSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Preferences</h2>
                <p className={styles.sectionDescription}>Customize your EventHub experience</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Language</label>
                <select className={styles.formSelect} value={language} onChange={e => setLanguage(e.target.value)}>
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Timezone</label>
                <select className={styles.formSelect} value={timezone} onChange={e => setTimezone(e.target.value)}>
                  <option>Pacific Time (PT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Central Time (CT)</option>
                  <option>Eastern Time (ET)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date Format</label>
                <select className={styles.formSelect} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            {/* ── Email Notifications ── */}
            <div className={styles.panelSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Email Notifications</h2>
                <p className={styles.sectionDescription}>Choose what updates you want to receive</p>
              </div>

              {TOGGLES.map((t, i) => (
                <div key={i} className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleLabel}>{t.label}</div>
                    <div className={styles.toggleDescription}>{t.description}</div>
                  </div>
                  <button
                    className={`${styles.toggleSwitch}${toggles[i] ? ` ${styles.toggleSwitchActive}` : ''}`}
                    onClick={() => toggleNotification(i)}
                    aria-pressed={toggles[i]}
                    aria-label={t.label}
                  />
                </div>
              ))}
            </div>

            {/* ── Connected Services ── */}
            <div className={styles.panelSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Connected Services</h2>
                <p className={styles.sectionDescription}>Manage your third-party integrations</p>
              </div>
              <div className={styles.integrationGrid}>
                {INTEGRATIONS.map((intg, i) => (
                  <div
                    key={i}
                    className={`${styles.integrationCard}${intg.connected ? ` ${styles.integrationCardConnected}` : ''}`}
                  >
                    <div className={styles.integrationIcon}>{intg.icon}</div>
                    <div className={styles.integrationInfo}>
                      <div className={styles.integrationName}>{intg.name}</div>
                      <div className={`${styles.integrationStatus}${intg.connected ? ` ${styles.integrationStatusConnected}` : ''}`}>
                        {intg.connected ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className={styles.panelSection}>
              <div className={styles.dangerZone}>
                <div className={styles.dangerZoneHeader}>
                  <span className={styles.dangerZoneIcon}>⚠️</span>
                  <h3 className={styles.dangerZoneTitle}>Danger Zone</h3>
                </div>
                <p className={styles.dangerZoneDescription}>
                  Once you delete your account, there is no going back. All your events, attendees, and analytics data will be permanently deleted.
                </p>
                <button className={`${styles.btn} ${styles.btnDanger}`}>Delete Account</button>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className={styles.settingsFooter}>
              <p className={styles.footerMessage}>Changes are saved automatically</p>
              <button className={`${styles.btn} ${styles.btnPrimary}`}>Save Changes</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
