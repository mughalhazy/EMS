'use client'

import React, { useState } from 'react'
import styles from './Tabs.module.css'

interface Tab {
  label: string
  value: string
}

type TabVariant = 'underline' | 'pill'

interface TabsProps {
  tabs?: Tab[]
  defaultTab?: string
  variant?: TabVariant
  onChange?: (value: string) => void
}

export function Tabs({ tabs = [], defaultTab, variant = 'underline', onChange }: TabsProps) {
  const [active, setActive] = useState<string>(defaultTab ?? tabs[0]?.value ?? '')

  function select(value: string) {
    setActive(value)
    onChange?.(value)
  }

  if (!tabs.length) return null

  const wrapClass = variant === 'pill' ? styles.pill : ''

  return (
    <div className={wrapClass}>
      <div className={styles.tabBar} role="tablist">
        {tabs.map(tab => (
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
