import React from 'react'
import styles from './AuthLayout.module.css'

const FEATURES = [
  'Multi-event, multi-tenant architecture',
  'Real-time check-in and live analytics',
  'Integrated ticketing and commerce',
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>E</span>
            <span className={styles.logoName}>EventHub</span>
          </div>
          <p className={styles.tagline}>
            Enterprise event management built for teams that run at scale.
          </p>
          <ul className={styles.features}>
            {FEATURES.map(f => (
              <li key={f} className={styles.featureItem}>
                <span className={styles.featureDot} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.mobileWordmark}>
            <span className={styles.mobileLogoMark}>E</span>
            <span className={styles.mobileLogoName}>EventHub</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
