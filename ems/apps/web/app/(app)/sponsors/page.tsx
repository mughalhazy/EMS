'use client'

import styles from './sponsors.module.css'

/* ── Static data — faithful port of sponsors-page.html ── */

interface Sponsor {
  initials:  string
  name:      string
  tagline:   string
  desc:      string
  benefits:  string[]
  booth:     string
  tier:      'platinum' | 'gold' | 'silver'
}

const SPONSORS_PLATINUM: Sponsor[] = [
  {
    initials: 'TF',
    name:     'TechFlow Solutions',
    tagline:  'Powering the future of enterprise software',
    desc:     'TechFlow Solutions is the world\'s leading provider of enterprise workflow automation. Trusted by 10,000+ companies globally, TechFlow transforms how businesses operate through intelligent automation, real-time analytics, and seamless integrations.',
    benefits: ['Keynote Stage Sponsorship', 'Premier Booth Position', 'VIP Dinner Hosting', 'Brand on All Materials', '10 VIP Passes'],
    booth:    'Hall A — Main Stage',
    tier:     'platinum',
  },
  {
    initials: 'CF',
    name:     'CloudForge Inc.',
    tagline:  'The cloud platform built for scale',
    desc:     'CloudForge provides the most reliable cloud infrastructure for enterprise applications. With 99.99% uptime and global presence in 45 regions, CloudForge powers the applications that power the world.',
    benefits: ['Opening Reception Sponsor', 'Workshop Theater Naming', 'Conference App Sponsor', 'Lunch Sponsor Day 1', '8 VIP Passes'],
    booth:    'Hall A — Booth A-100',
    tier:     'platinum',
  },
]

const SPONSORS_GOLD: Sponsor[] = [
  {
    initials: 'DL',
    name:     'DataLink Analytics',
    tagline:  'Data-driven decisions, simplified',
    desc:     'DataLink provides enterprise analytics and business intelligence tools used by 5,000+ organizations worldwide.',
    benefits: ['Session Track Sponsor', 'Networking Break Sponsor', '5 VIP Passes'],
    booth:    'Hall B — Booth B-200',
    tier:     'gold',
  },
  {
    initials: 'NS',
    name:     'NetSecure Pro',
    tagline:  'Zero-trust security for modern enterprises',
    desc:     'NetSecure Pro delivers enterprise-grade cybersecurity solutions protecting over 5,000 organizations with AI-powered threat detection.',
    benefits: ['Security Track Sponsor', 'Badge Lanyard Sponsor', '4 VIP Passes'],
    booth:    'Hall B — Booth B-205',
    tier:     'gold',
  },
]

const SPONSORS_SILVER: Sponsor[] = [
  {
    initials: 'DK',
    name:     'DevKit Tools',
    tagline:  'Tools that ship faster',
    desc:     'Comprehensive development toolkit for modern software teams including CI/CD, testing, and monitoring.',
    benefits: ['Workshop Co-Sponsor', '2 Standard Passes'],
    booth:    'Hall C — C-310',
    tier:     'silver',
  },
  {
    initials: 'CX',
    name:     'CodeXcel',
    tagline:  'Accelerate your development lifecycle',
    desc:     'CodeXcel provides AI-powered code review and quality assurance tools for enterprise development teams.',
    benefits: ['Hackathon Sponsor', '2 Standard Passes'],
    booth:    'Hall C — C-312',
    tier:     'silver',
  },
  {
    initials: 'HP',
    name:     'HorizonPay',
    tagline:  'Payments built for platforms',
    desc:     'HorizonPay enables seamless payment experiences for B2B platforms, marketplaces, and SaaS businesses.',
    benefits: ['Break Sponsor', '2 Standard Passes'],
    booth:    'Hall C — C-315',
    tier:     'silver',
  },
]

/* ── Sponsor card sub-components ── */

function SponsorFooter({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className={styles.sponsorFooter}>
      <div className={styles.boothLocation}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        </svg>
        {sponsor.booth}
      </div>
      <div className={styles.socialLinks}>
        <button className={styles.socialLink} aria-label="Website">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
        </button>
        <button className={styles.socialLink} aria-label="LinkedIn">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function SponsorsPage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>🏆 Partnership Excellence</div>
          <h1 className={styles.heroTitle}>Powered by Innovation</h1>
          <p className={styles.heroSubtitle}>
            Our world-class sponsors make Tech Summit 2026 possible. Meet the companies shaping the future of technology.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.heroStatValue}>28</div>
              <div className={styles.heroStatLabel}>Total Sponsors</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatValue}>$850K</div>
              <div className={styles.heroStatLabel}>Sponsorship Value</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatValue}>3</div>
              <div className={styles.heroStatLabel}>Sponsorship Tiers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <main className={styles.content}>

        {/* ── Platinum Tier ── */}
        <section className={styles.tierSection}>
          <div className={styles.tierHeader}>
            <div className={`${styles.tierBadge} ${styles.tierBadgePlatinum}`}>Platinum</div>
            <h2 className={styles.tierTitle}>Platinum Sponsors</h2>
            <p className={styles.tierDescription}>
              Our premier partners who make Tech Summit 2026 extraordinary. Maximum visibility and engagement.
            </p>
          </div>
          <div className={styles.gridPlatinum}>
            {SPONSORS_PLATINUM.map((s, i) => (
              <div key={i} className={`${styles.sponsorCard} ${styles.sponsorCardPlatinum}`}>
                <div className={styles.sponsorHeaderPlatinum}>
                  <div className={styles.logoPlaceholderPlatinum}>{s.initials}</div>
                </div>
                <div className={styles.sponsorBody}>
                  <div className={styles.sponsorNameRow}>
                    <span className={styles.sponsorNamePlatinum}>{s.name}</span>
                    <span className={`${styles.sponsorTierBadgeInline} ${styles.sponsorTierBadgePlatinum}`}>Platinum</span>
                  </div>
                  <p className={styles.sponsorTagline}>{s.tagline}</p>
                  <p className={styles.sponsorDesc}>{s.desc}</p>
                  <div className={styles.benefitTags}>
                    {s.benefits.map((b, bi) => (
                      <span key={bi} className={`${styles.benefitTag} ${styles.benefitTagPlatinum}`}>{b}</span>
                    ))}
                  </div>
                </div>
                <SponsorFooter sponsor={s} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Gold Tier ── */}
        <section className={styles.tierSection}>
          <div className={styles.tierHeader}>
            <div className={`${styles.tierBadge} ${styles.tierBadgeGold}`}>Gold</div>
            <h2 className={styles.tierTitle}>Gold Sponsors</h2>
            <p className={styles.tierDescription}>
              Distinguished partners providing significant support and premium engagement opportunities.
            </p>
          </div>
          <div className={styles.gridGold}>
            {SPONSORS_GOLD.map((s, i) => (
              <div key={i} className={`${styles.sponsorCard} ${styles.sponsorCardGold}`}>
                <div className={styles.sponsorHeaderGold}>
                  <div className={styles.logoPlaceholderGold}>{s.initials}</div>
                </div>
                <div className={styles.sponsorBody}>
                  <div className={styles.sponsorNameRow}>
                    <span className={styles.sponsorNameGold}>{s.name}</span>
                    <span className={`${styles.sponsorTierBadgeInline} ${styles.sponsorTierBadgeGold}`}>Gold</span>
                  </div>
                  <p className={styles.sponsorTagline}>{s.tagline}</p>
                  <p className={styles.sponsorDesc}>{s.desc}</p>
                  <div className={styles.benefitTags}>
                    {s.benefits.map((b, bi) => (
                      <span key={bi} className={`${styles.benefitTag} ${styles.benefitTagGold}`}>{b}</span>
                    ))}
                  </div>
                </div>
                <SponsorFooter sponsor={s} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Silver Tier ── */}
        <section className={styles.tierSection}>
          <div className={styles.tierHeader}>
            <div className={`${styles.tierBadge} ${styles.tierBadgeSilver}`}>Silver</div>
            <h2 className={styles.tierTitle}>Silver Sponsors</h2>
            <p className={styles.tierDescription}>
              Valued partners contributing to making Tech Summit 2026 a world-class experience.
            </p>
          </div>
          <div className={styles.gridSilver}>
            {SPONSORS_SILVER.map((s, i) => (
              <div key={i} className={`${styles.sponsorCard} ${styles.sponsorCardSilver}`}>
                <div className={styles.sponsorHeaderSilver}>
                  <div className={styles.logoPlaceholderSilver}>{s.initials}</div>
                </div>
                <div className={styles.sponsorBody}>
                  <div className={styles.sponsorNameRow}>
                    <span className={styles.sponsorNameSilver}>{s.name}</span>
                    <span className={`${styles.sponsorTierBadgeInline} ${styles.sponsorTierBadgeSilver}`}>Silver</span>
                  </div>
                  <p className={styles.sponsorTagline}>{s.tagline}</p>
                  <p className={styles.sponsorDesc}>{s.desc}</p>
                  <div className={styles.benefitTags}>
                    {s.benefits.map((b, bi) => (
                      <span key={bi} className={`${styles.benefitTag} ${styles.benefitTagSilver}`}>{b}</span>
                    ))}
                  </div>
                </div>
                <SponsorFooter sponsor={s} />
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Become a Sponsor</h2>
        <p className={styles.ctaSubtitle}>
          Join our world-class sponsors and connect with 1,500+ tech leaders and innovators at Tech Summit 2026.
        </p>
        <button className={styles.ctaButton}>Get Sponsorship Package →</button>
      </section>

    </div>
  )
}
