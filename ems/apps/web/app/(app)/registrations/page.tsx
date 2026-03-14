'use client'

import { useState } from 'react'
import styles from './registrations.module.css'

/* ── Static data — faithful port of registration-page.html (P-012) ── */

const STEPS = [
  { label: 'Ticket',  state: 'completed' },
  { label: 'Info',    state: 'active'    },
  { label: 'Payment', state: 'default'   },
  { label: 'Confirm', state: 'default'   },
]

const FEATURES = [
  { icon: '🎤', title: '45+ Expert Speakers',       desc: 'Learn from industry leaders at the forefront of technology' },
  { icon: '🛠️', title: 'Hands-on Workshops',        desc: 'Build practical skills in AI, DevOps, and Cloud Architecture' },
  { icon: '🤝', title: 'Networking Opportunities',  desc: 'Connect with professionals from 300+ companies worldwide' },
]

const DIETARY = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Other (specify in next page)']

const HEAR_OPTIONS = [
  'Select an option',
  'Social Media',
  'Email Newsletter',
  'Colleague Referral',
  'Search Engine',
  'Previous Event',
  'Other',
]

/* ── SVG icons ── */
const BackIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
)
const ForwardIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
  </svg>
)

function stepClass(state: string): string {
  if (state === 'active')    return `${styles.step} ${styles.stepActive}`
  if (state === 'completed') return `${styles.step} ${styles.stepCompleted}`
  return styles.step
}

export default function RegistrationsPage() {
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [company,    setCompany]    = useState('')
  const [jobTitle,   setJobTitle]   = useState('')
  const [phone,      setPhone]      = useState('')
  const [dietary,    setDietary]    = useState<Set<string>>(new Set())
  const [hearAbout,  setHearAbout]  = useState('Select an option')

  function toggleDietary(item: string) {
    setDietary(prev => {
      const next = new Set(prev)
      next.has(item) ? next.delete(item) : next.add(item)
      return next
    })
  }

  return (
    <div className={styles.page}>

      {/* ── Brand Side ── */}
      <div className={styles.brandSide}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>E</div>
          <div className={styles.logoText}>EventHub</div>
        </div>

        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>Register for Tech Summit 2026</h1>
          <p className={styles.brandSubtitle}>Join 1,500+ tech leaders, innovators, and entrepreneurs for three days of inspiring talks and networking.</p>

          <div className={styles.brandFeatures}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <div className={styles.featureTextTitle}>{f.title}</div>
                  <div className={styles.featureTextDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.brandFooter}>© 2026 EventHub. All rights reserved.</div>
      </div>

      {/* ── Form Side ── */}
      <div className={styles.formSide}>

        {/* Progress steps */}
        <div className={styles.progressSteps}>
          {STEPS.map((s, i) => (
            <div key={i} className={stepClass(s.state)}>
              <div className={styles.stepNumber}>{s.state === 'completed' ? '✓' : i + 1}</div>
              <div className={styles.stepLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form header */}
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Personal Information</h2>
          <p className={styles.formSubtitle}>Please provide your details to complete registration</p>
        </div>

        {/* Form */}
        <form onSubmit={e => e.preventDefault()}>

          {/* First + Last name row */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                First Name<span className={styles.formLabelRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Last Name<span className={styles.formLabelRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Email Address<span className={styles.formLabelRequired}>*</span>
            </label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="john.doe@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className={styles.formHelp}>We'll send your ticket and event updates to this email</div>
          </div>

          {/* Company */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Company / Organization<span className={styles.formLabelRequired}>*</span>
            </label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Acme Corporation"
              value={company}
              onChange={e => setCompany(e.target.value)}
              required
            />
          </div>

          {/* Job title */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Job Title</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Software Engineer"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone Number</label>
            <input
              type="tel"
              className={styles.formInput}
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Dietary restrictions */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Dietary Restrictions</label>
            <div className={styles.checkboxGroup}>
              {DIETARY.map(item => (
                <label key={item} className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={dietary.has(item)}
                    onChange={() => toggleDietary(item)}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionTitle}>{item}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* How did you hear */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>How did you hear about this event?</label>
            <select
              className={styles.formInput}
              value={hearAbout}
              onChange={e => setHearAbout(e.target.value)}
            >
              {HEAR_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}>
              <BackIcon /> Back
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Continue <ForwardIcon />
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
