'use client'

import { useState } from 'react'
import styles from './ticketing.module.css'

/* ── Static data — faithful port of ticketing-page.html (P-012) ── */

interface Feature {
  text:      string
  available: boolean
}

interface TicketTier {
  icon:        string
  name:        string
  description: string
  price:       string
  savings?:    string
  features:    Feature[]
  ctaClass:    string
  popular?:    boolean
}

const TICKETS: TicketTier[] = [
  {
    icon:        '🎫',
    name:        'Early Bird',
    description: 'Perfect for budget-conscious attendees who register early',
    price:       '$149',
    savings:     'Save $100',
    ctaClass:    styles.btnSecondary,
    features: [
      { text: 'Access to all keynotes',  available: true  },
      { text: 'Networking events',        available: true  },
      { text: 'Event app access',         available: true  },
      { text: 'Workshop access',          available: false },
      { text: 'VIP lounge access',        available: false },
      { text: 'Recording access',         available: false },
    ],
  },
  {
    icon:        '🎟️',
    name:        'Standard Pass',
    description: 'Full conference access including all workshops and sessions',
    price:       '$249',
    popular:     true,
    ctaClass:    styles.btnPopular,
    features: [
      { text: 'Access to all keynotes',  available: true  },
      { text: 'Networking events',        available: true  },
      { text: 'Event app access',         available: true  },
      { text: 'All workshop sessions',    available: true  },
      { text: 'Lunch & refreshments',     available: true  },
      { text: 'VIP lounge access',        available: false },
    ],
  },
  {
    icon:        '⭐',
    name:        'VIP Pass',
    description: 'Premium experience with exclusive perks and private sessions',
    price:       '$499',
    ctaClass:    styles.btnPrimary,
    features: [
      { text: 'Everything in Standard',  available: true },
      { text: 'VIP lounge access',        available: true },
      { text: 'Private speaker sessions', available: true },
      { text: 'Priority seating',         available: true },
      { text: 'All session recordings',   available: true },
      { text: 'Premium swag bag',         available: true },
    ],
  },
]

interface Addon {
  icon:        string
  name:        string
  description: string
  price:       string
}

const ADDONS: Addon[] = [
  { icon: '📚', name: 'Workshop Bundle',   description: 'Access to 5 exclusive hands-on workshops throughout the event',          price: '+ $79'  },
  { icon: '🎥', name: 'Recording Access',  description: 'Lifetime access to all session recordings and presentation slides',       price: '+ $49'  },
  { icon: '🍽️', name: 'VIP Dinner',        description: 'Exclusive networking dinner with speakers on Day 2',                      price: '+ $129' },
  { icon: '🎁', name: 'Premium Swag',      description: 'Curated gift bag with tech gadgets and sponsor merchandise',              price: '+ $39'  },
]

type CompVal = '✓' | '✕' | string
interface CompRow {
  feature: string
  early:   CompVal
  std:     CompVal
  vip:     CompVal
}

const COMPARISON: CompRow[] = [
  { feature: 'Keynote Sessions',    early: '✓',          std: '✓',          vip: '✓'       },
  { feature: 'Workshop Access',     early: '✕',          std: '✓',          vip: '✓'       },
  { feature: 'Networking Events',   early: '✓',          std: '✓',          vip: '✓'       },
  { feature: 'VIP Lounge',          early: '✕',          std: '✕',          vip: '✓'       },
  { feature: 'Session Recordings',  early: '✕',          std: '✕',          vip: '✓'       },
  { feature: 'Private Sessions',    early: '✕',          std: '✕',          vip: '✓'       },
  { feature: 'Meals Included',      early: 'Lunch',      std: 'All',        vip: 'All + VIP'},
  { feature: 'Swag Bag',            early: 'Standard',   std: 'Standard',   vip: 'Premium' },
]

interface FAQ {
  question: string
  answer:   string
}

const FAQS: FAQ[] = [
  {
    question: 'Can I upgrade my ticket after purchase?',
    answer:   'Yes! You can upgrade from Early Bird to Standard or VIP at any time. Simply contact our support team and pay the difference. VIP upgrades are subject to availability.',
  },
  {
    question: 'What is your refund policy?',
    answer:   'Full refunds are available up to 30 days before the event. Between 14-30 days: 50% refund. Less than 14 days: no refund, but tickets are transferable.',
  },
  {
    question: 'Are group discounts available?',
    answer:   'Yes! Groups of 5+ receive 15% off, and groups of 10+ receive 20% off. Contact our team sales team for custom pricing and dedicated support.',
  },
  {
    question: 'Can I transfer my ticket to someone else?',
    answer:   'Absolutely! Tickets are fully transferable. Just update the attendee information in your dashboard up to 48 hours before the event starts.',
  },
]

/* ── SVG Icons ── */
const CalendarIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
)
const LocationIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
  </svg>
)
const AttendeesIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
  </svg>
)
const XIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
)

function compCellClass(val: CompVal) {
  if (val === '✓') return styles.checkIcon
  if (val === '✕') return styles.xIcon
  return ''
}

export default function TicketingPage() {
  const [openFaq, setOpenFaq]     = useState<number | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Set<number>>(new Set())

  function toggleAddon(i: number) {
    setSelectedAddons(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Tech Summit 2026 Tickets</h1>
          <p className={styles.heroSubtitle}>Choose your pass and join us for three days of innovation, learning, and networking</p>
          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}><CalendarIcon /> March 18-20, 2026</div>
            <div className={styles.heroMetaItem}><LocationIcon /> Convention Center</div>
            <div className={styles.heroMetaItem}><AttendeesIcon /> 1,500+ Attendees</div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <main className={styles.content}>

        {/* Section header */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>Pricing</div>
          <h2 className={styles.sectionTitle}>Choose Your Pass</h2>
          <p className={styles.sectionDescription}>Select the ticket that best fits your needs and budget. All passes include access to keynotes and networking events.</p>
        </div>

        {/* Ticket grid */}
        <div className={styles.ticketGrid}>
          {TICKETS.map((t, i) => (
            <div
              key={i}
              className={`${styles.ticketCard}${t.popular ? ` ${styles.ticketCardPopular}` : ''}`}
            >
              <div className={styles.ticketHeader}>
                <div className={`${styles.ticketIcon}${t.popular ? ` ${styles.ticketIconPopular}` : ''}`}>{t.icon}</div>
                <h3 className={styles.ticketName}>{t.name}</h3>
                <p className={styles.ticketDescription}>{t.description}</p>
              </div>

              <div className={styles.ticketPrice}>
                <div className={styles.priceAmount}>{t.price}</div>
                <div className={styles.pricePeriod}>per person</div>
                {t.savings && <span className={styles.priceSavings}>{t.savings}</span>}
              </div>

              <div className={styles.ticketFeatures}>
                {t.features.map((f, fi) => (
                  <div key={fi} className={`${styles.featureItem}${!f.available ? ` ${styles.featureItemUnavailable}` : ''}`}>
                    <span className={`${styles.featureIcon}${!f.available ? ` ${styles.featureIconUnavailable}` : ''}`}>
                      {f.available ? <CheckIcon /> : <XIcon />}
                    </span>
                    <div className={styles.featureText}>{f.text}</div>
                  </div>
                ))}
              </div>

              <button className={`${styles.ticketCta} ${t.ctaClass}`}>Select Ticket</button>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className={styles.addonsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Enhance Your Experience</div>
            <h2 className={styles.sectionTitle}>Optional Add-Ons</h2>
            <p className={styles.sectionDescription}>Upgrade your ticket with these premium add-ons for an enhanced conference experience</p>
          </div>
          <div className={styles.addonGrid}>
            {ADDONS.map((a, i) => (
              <div
                key={i}
                className={`${styles.addonCard}${selectedAddons.has(i) ? ` ${styles.addonCardSelected}` : ''}`}
                onClick={() => toggleAddon(i)}
              >
                <div className={styles.addonIcon}>{a.icon}</div>
                <div className={styles.addonContent}>
                  <h4 className={styles.addonName}>{a.name}</h4>
                  <p className={styles.addonDescription}>{a.description}</p>
                  <div className={styles.addonPrice}>{a.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className={styles.comparisonSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Compare</div>
            <h2 className={styles.sectionTitle}>Ticket Comparison</h2>
            <p className={styles.sectionDescription}>See what's included with each pass at a glance</p>
          </div>
          <div className={styles.comparisonTable}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableHeaderTitle}>Feature Comparison</h3>
            </div>
            <div className={styles.comparisonGrid}>
              {/* Header row */}
              <div className={styles.comparisonRow}>
                <div className={`${styles.comparisonCell} ${styles.comparisonCellHeader}`}>Feature</div>
                <div className={`${styles.comparisonCell} ${styles.comparisonCellHeader}`}>Early Bird</div>
                <div className={`${styles.comparisonCell} ${styles.comparisonCellHeader}`}>Standard</div>
                <div className={`${styles.comparisonCell} ${styles.comparisonCellHeader}`}>VIP</div>
              </div>
              {/* Feature rows */}
              {COMPARISON.map((row, i) => (
                <div key={i} className={styles.comparisonRow}>
                  <div className={`${styles.comparisonCell} ${styles.comparisonCellFeature}`}>{row.feature}</div>
                  {([row.early, row.std, row.vip] as CompVal[]).map((val, ci) => (
                    <div key={ci} className={`${styles.comparisonCell} ${styles.comparisonCellValue}`}>
                      <span className={compCellClass(val)}>{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Questions</div>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          </div>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={styles.faqItem}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className={styles.faqQuestion}>
                {faq.question}
                <ChevronDownIcon />
              </div>
              {openFaq === i && (
                <div className={styles.faqAnswer}>{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className={styles.footerCta}>
          <h2 className={styles.footerCtaTitle}>Ready to Join Us?</h2>
          <p className={styles.footerCtaSubtitle}>Secure your spot at Tech Summit 2026. Early Bird pricing ends soon!</p>
          <div className={styles.ctaButtons}>
            <button className={styles.btnWhite}>Purchase Tickets</button>
          </div>
        </div>

      </main>
    </div>
  )
}
