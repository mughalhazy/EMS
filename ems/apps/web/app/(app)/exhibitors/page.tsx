'use client'

import { useState } from 'react'
import styles from './exhibitors.module.css'

/* ── Static data — faithful port of exhibitors-page.html ── */

type TagVariant = 'hardware' | 'software' | 'services' | 'cloud'

interface ExhibitorTag {
  label:   string
  variant: TagVariant
}

interface Exhibitor {
  initials:    string
  name:        string
  category:    string
  description: string
  tags:        ExhibitorTag[]
  booth:       string
}

const EXHIBITORS: Exhibitor[] = [
  {
    initials:    'CX',
    name:        'CloudXpress',
    category:    'Cloud Infrastructure',
    description: 'Scalable cloud infrastructure solutions for modern enterprises. Deploy, scale, and manage applications with ease using our global network.',
    tags:        [{ label: 'Cloud', variant: 'cloud' }, { label: 'Platform', variant: 'software' }],
    booth:       'A-110',
  },
  {
    initials:    'DH',
    name:        'DataHub Analytics',
    category:    'Business Intelligence',
    description: 'Transform raw data into actionable insights with our advanced analytics platform. Real-time dashboards and predictive modeling included.',
    tags:        [{ label: 'Analytics', variant: 'software' }, { label: 'SaaS', variant: 'cloud' }],
    booth:       'A-112',
  },
  {
    initials:    'NS',
    name:        'NetSecure Pro',
    category:    'Cybersecurity',
    description: 'Enterprise-grade security solutions protecting over 5,000 organizations worldwide. Zero-trust architecture and AI-powered threat detection.',
    tags:        [{ label: 'Security', variant: 'software' }, { label: 'Consulting', variant: 'services' }],
    booth:       'B-205',
  },
  {
    initials:    'AI',
    name:        'AI Innovations',
    category:    'Artificial Intelligence',
    description: 'Next-generation AI platforms for customer service, automation, and predictive analytics. Trusted by Fortune 500 companies.',
    tags:        [{ label: 'AI/ML', variant: 'software' }, { label: 'Platform', variant: 'cloud' }],
    booth:       'A-115',
  },
  {
    initials:    'DK',
    name:        'DevKit Tools',
    category:    'Developer Tools',
    description: 'Comprehensive development toolkit for modern software teams. CI/CD, testing, monitoring, and collaboration all in one platform.',
    tags:        [{ label: 'DevOps', variant: 'software' }, { label: 'Tools', variant: 'cloud' }],
    booth:       'B-208',
  },
  {
    initials:    'HW',
    name:        'HyperWave Systems',
    category:    'Networking Hardware',
    description: 'High-performance networking equipment for data centers and enterprise environments. 100Gbps switches and routers with industry-leading reliability.',
    tags:        [{ label: 'Networking', variant: 'hardware' }, { label: 'Infrastructure', variant: 'hardware' }],
    booth:       'C-310',
  },
]

const FILTERS = ['All', 'Hardware', 'Software', 'Cloud', 'Services']

function tagClass(v: TagVariant): string {
  if (v === 'hardware') return styles.exhibitorTagHardware
  if (v === 'services') return styles.exhibitorTagServices
  if (v === 'cloud')    return styles.exhibitorTagCloud
  return styles.exhibitorTagSoftware
}

/* ── SVG icons ── */
const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
)
const LocationIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
  </svg>
)
const EmailIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
)
const WebIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
  </svg>
)

export default function ExhibitorsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitle}>
              <h1>Exhibitor Directory</h1>
              <p className={styles.headerSubtitle}>Explore innovative products and services from leading tech companies</p>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.headerStat}>
                <div className={styles.headerStatValue}>65</div>
                <div className={styles.headerStatLabel}>Total Exhibitors</div>
              </div>
              <div className={styles.headerStat}>
                <div className={styles.headerStatValue}>12</div>
                <div className={styles.headerStatLabel}>Categories</div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search exhibitors by name, product, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterChips}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`${styles.filterChip}${activeFilter === f ? ` ${styles.filterChipActive}` : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className={styles.content}>

        {/* Featured Exhibitor */}
        <div className={styles.featuredExhibitor}>
          <div className={styles.featuredContent}>
            <h2>Featured: TechFlow Solutions</h2>
            <p>
              Leading provider of enterprise workflow automation platforms. TechFlow helps companies streamline operations and increase productivity through intelligent automation.
            </p>
            <div className={styles.featuredMeta}>
              <div className={styles.featuredMetaItem}>
                <div className={styles.featuredMetaLabel}>Booth Location</div>
                <div className={styles.featuredMetaValue}>Hall A-105</div>
              </div>
              <div className={styles.featuredMetaItem}>
                <div className={styles.featuredMetaLabel}>Category</div>
                <div className={styles.featuredMetaValue}>Software</div>
              </div>
            </div>
          </div>
          <div className={styles.featuredProducts}>
            {[
              { name: 'WorkFlow Pro',  desc: 'Enterprise workflow automation with AI-powered insights' },
              { name: 'TaskSync',      desc: 'Real-time collaboration platform for distributed teams' },
              { name: 'DataBridge',   desc: 'Seamless integration across 500+ business applications' },
            ].map((p, i) => (
              <div key={i} className={styles.productItem}>
                <div className={styles.productName}>{p.name}</div>
                <div className={styles.productDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Exhibitors</h2>
          <span className={styles.exhibitorCount}>65 exhibitors</span>
        </div>

        {/* Exhibitor Grid */}
        <div className={styles.exhibitorGrid}>
          {EXHIBITORS.map((ex, i) => (
            <div key={i} className={styles.exhibitorCard}>
              <div className={styles.exhibitorHeader}>
                <div className={styles.exhibitorLogo}>{ex.initials}</div>
                <div className={styles.exhibitorIdentity}>
                  <h3 className={styles.exhibitorName}>{ex.name}</h3>
                  <p className={styles.exhibitorCategory}>{ex.category}</p>
                </div>
              </div>
              <div className={styles.exhibitorBody}>
                <p className={styles.exhibitorDescription}>{ex.description}</p>
                <div className={styles.exhibitorTags}>
                  {ex.tags.map((t, ti) => (
                    <span key={ti} className={`${styles.exhibitorTag} ${tagClass(t.variant)}`}>{t.label}</span>
                  ))}
                </div>
              </div>
              <div className={styles.exhibitorFooter}>
                <div className={styles.boothNumber}>
                  <LocationIcon />
                  {ex.booth}
                </div>
                <div className={styles.contactButtons}>
                  <button className={styles.contactBtn} aria-label="Email"><EmailIcon /></button>
                  <button className={styles.contactBtn} aria-label="Website"><WebIcon /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
