'use client'

import React, { useState } from 'react'
import styles from './Tabs.module.css'

interface Tab {
  label: string
  value: string
}

type TabVariant = 'underline' | 'pill'

interface TabsProps {
  /** Static tabs — string[] auto-converted to { label, value }[] */
  tabs?: Tab[] | string[]
  /** Dynamic tabs injected by data bridge via tabsDataKey */
  tabsData?: string[]
  defaultTab?: string
  variant?: TabVariant
  onChange?: (value: string) => void
}

function normalise(tabs: Tab[] | string[]): Tab[] {
  return tabs.map(t => typeof t === 'string' ? { label: t, value: t } : t)
}

export function Tabs({ tabs = [], tabsData, defaultTab, variant = 'underline', onChange }: TabsProps) {
  // tabsData (dynamic, from data bridge) wins over static tabs prop
  const resolved: Tab[] = tabsData && tabsData.length > 0
    ? tabsData.map(d => ({ label: d, value: d }))
    : normalise(tabs as Tab[] | string[])

  const [active, setActive] = useState<string>(defaultTab ?? resolved[0]?.value ?? '')

  function select(value: string) {
    setActive(value)
    onChange?.(value)
  }

  if (!resolved.length) return null

  const wrapClass = variant === 'pill' ? styles.pill : ''

  return (
    <div className={wrapClass}>
      <div className={styles.tabBar} role="tablist">
        {resolved.map(tab => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active === tab.value}
            className={[styles.tab, active === tab.value ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => select(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
