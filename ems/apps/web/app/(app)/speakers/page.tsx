'use client'

import { useState } from 'react'
import styles from './speakers.module.css'

/* ── Types ───────────────────────────────────────────────── */
type Social  = 'twitter' | 'linkedin' | 'github'
type Session = { time: string; name: string; track: string }
type Speaker = {
  initials: string
  name:     string
  role:     string
  company:  string
  bio:      string
  tags:     string[]
  session:  Session
  social:   Social[]
}

/* ── Static data — matches speakers-page.html exactly ───── */
const FEATURED = {
  initials: 'DR',
  badge:    '⭐ Featured Keynote Speaker',
  name:     'Dr. Rachel Martinez',
  title:    'Chief AI Officer at TechCorp · Former MIT Professor',
  bio:      'Dr. Martinez is a leading expert in artificial intelligence with over 15 years of experience. She has published 40+ research papers and led breakthrough AI projects at Google and Microsoft before joining TechCorp.',
  session:  { time: 'Day 1 · 9:00 AM', name: "The Future of AI: What's Next in 2026" },
}

const SPEAKERS: Speaker[] = [
  {
    initials: 'JC',
    name:    'James Chen',
    role:    'Senior ML Engineer',
    company: 'DataCorp',
    bio:     'Specializes in building scalable machine learning systems. Previously at Amazon, where he led the ML infrastructure team for 5 years.',
    tags:    ['Machine Learning', 'Python', 'MLOps'],
    session: { time: 'Day 1 · 10:45', name: 'Building Scalable ML Pipelines', track: 'Innovation Lab' },
    social:  ['twitter', 'linkedin'],
  },
  {
    initials: 'SK',
    name:    'Sarah Kim',
    role:    'AI Research Scientist',
    company: 'OpenMind AI',
    bio:     'PhD in Computer Science from Stanford. Her research focuses on natural language processing and multi-modal AI systems that push the boundaries of human-computer interaction.',
    tags:    ['NLP', 'Deep Learning', 'Research'],
    session: { time: 'Day 1 · 10:45', name: 'Building Scalable ML Pipelines', track: 'Innovation Lab' },
    social:  ['twitter', 'linkedin'],
  },
  {
    initials: 'MP',
    name:    'Michael Peterson',
    role:    'DevOps Architect',
    company: 'CloudScale',
    bio:     'Expert in cloud infrastructure and DevOps practices with 12+ years of experience. Helped 50+ companies migrate to cloud-native architectures and implement CI/CD pipelines.',
    tags:    ['DevOps', 'Kubernetes', 'AWS'],
    session: { time: 'Day 1 · 10:45', name: 'Modern DevOps Practices', track: 'Developer Zone' },
    social:  ['github', 'linkedin'],
  },
  {
    initials: 'EW',
    name:    'Emily Wu',
    role:    'VP of Engineering',
    company: 'FutureTech',
    bio:     'Leads a team of 200+ engineers at FutureTech. Passionate about building inclusive tech teams and scalable engineering cultures. Speaker at 20+ international conferences.',
    tags:    ['Leadership', 'Ethics', 'Cloud'],
    session: { time: 'Day 1 · 1:45', name: 'The Ethics of AI: A Panel Discussion', track: 'Main Stage' },
    social:  ['twitter', 'linkedin'],
  },
  {
    initials: 'LT',
    name:    'Lisa Taylor',
    role:    'Cloud Solutions Architect',
    company: 'Azure Labs',
    bio:     'Microsoft MVP and certified Azure architect. Specializes in designing multi-cloud architectures for enterprise clients across finance, healthcare, and retail sectors.',
    tags:    ['Azure', 'Architecture', 'Security'],
    session: { time: 'Day 1 · 3:30', name: 'Cloud Architecture Patterns', track: 'Developer Zone' },
    social:  ['twitter', 'linkedin'],
  },
  {
    initials: 'DK',
    name:    'Dr. David Kumar',
    role:    'Quantum Computing Researcher',
    company: 'QuantumLabs',
    bio:     'Pioneer in quantum computing with 10 patents. His work on quantum error correction has been published in Nature and Science. Making quantum accessible to software developers worldwide.',
    tags:    ['Quantum', 'Physics', 'Research'],
    session: { time: 'Day 1 · 3:30', name: 'Intro to Quantum Computing', track: 'Innovation Lab' },
    social:  ['twitter', 'github'],
  },
]

/* ── Filter tabs ─────────────────────────────────────────── */
const FILTERS = ['All Speakers', 'Keynote', 'AI & ML', 'DevOps', 'Cloud', 'Security']

/* ── Social icon SVGs ────────────────────────────────────── */
function SocialIcon({ type }: { type: Social }) {
  if (type === 'twitter') return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.852L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
  if (type === 'github') return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function SpeakersPage() {
  const [activeFilter, setActiveFilter] = useState('All Speakers')

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Our Speakers</h1>
        <p className={styles.headerSubtitle}>Meet the brilliant minds shaping the future of technology</p>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search speakers, topics, companies..."
          />
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Featured Speaker ── */}
        <div className={styles.featuredSpeaker}>
          <div className={styles.featuredAvatar}>{FEATURED.initials}</div>
          <div>
            <div className={styles.featuredBadge}>{FEATURED.badge}</div>
            <h2 className={styles.featuredName}>{FEATURED.name}</h2>
            <p className={styles.featuredTitle}>{FEATURED.title}</p>
            <p className={styles.featuredBio}>{FEATURED.bio}</p>
            <div className={styles.featuredSession}>
              <span className={styles.featuredSessionTime}>{FEATURED.session.time}</span>
              <span className={styles.featuredSessionName}>{FEATURED.session.name}</span>
            </div>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn}${activeFilter === f ? ` ${styles.filterBtnActive}` : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Section Header ── */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Speakers</h2>
          <span className={styles.speakerCount}>45 speakers total</span>
        </div>

        {/* ── Speaker Grid ── */}
        <div className={styles.speakerGrid}>
          {SPEAKERS.map((sp, i) => (
            <div key={i} className={styles.speakerCard}>

              {/* Header */}
              <div className={styles.speakerHeader}>
                <div className={styles.speakerAvatar}>{sp.initials}</div>
                <h3 className={styles.speakerName}>{sp.name}</h3>
                <p className={styles.speakerRole}>{sp.role}</p>
                <span className={styles.speakerCompany}>{sp.company}</span>
              </div>

              {/* Body */}
              <div className={styles.speakerBody}>
                <p className={styles.speakerBio}>{sp.bio}</p>

                {/* Tags */}
                <div className={styles.speakerTags}>
                  {sp.tags.map(tag => (
                    <span key={tag} className={styles.speakerTag}>{tag}</span>
                  ))}
                </div>

                {/* Session */}
                <div className={styles.speakerSessions}>
                  <div className={styles.sessionsLabel}>Sessions</div>
                  <div className={styles.sessionItem}>
                    <div className={styles.sessionTime}>{sp.session.time}</div>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionName}>{sp.session.name}</div>
                      <div className={styles.sessionTrack}>{sp.session.track}</div>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className={styles.speakerSocial}>
                  {sp.social.map(s => (
                    <button key={s} className={styles.socialLink} aria-label={s}>
                      <SocialIcon type={s} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
