'use client'

import React, { useState, useEffect } from 'react'
import styles from './Tabs.module.css'
import { useRendererActions } from '@/renderer/context/RendererActionsContext'

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
  /** Block ID injected by RenderedBlock — used to identify the source block in callbacks */
  blockId?: string
}

function normalise(tabs: Tab[] | string[]): Tab[] {
  return tabs.map(t => typeof t === 'string' ? { label: t, value: t } : t)
}

export function Tabs({ tabs = [], tabsData, defaultTab, variant = 'underline', onChange, blockId }: TabsProps) {
  const { onTabChange } = useRendererActions()

  // tabsData (dynamic, from data bridge) wins over static tabs prop
  const resolved: Tab[] = tabsData && tabsData.length > 0
    ? tabsData.map(d => ({ label: d, value: d }))
    : normalise(tabs as Tab[] | string[])

  const [active, setActive] = useState<string>(defaultTab ?? resolved[0]?.value ?? '')

  // Sync active tab when defaultTab changes (e.g. page fetches new event → new days)
  useEffect(() => {
    if (defaultTab && defaultTab !== active) setActive(defaultTab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTab])

  // When resolved tabs change and current active no longer exists, reset to first
  useEffect(() => {
    if (resolved.length > 0 && !resolved.find(t => t.value === active)) {
      setActive(resolved[0].value)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsData])

  function select(value: string) {
    setActive(value)
    onChange?.(value)
    if (blockId && onTabChange) {
      onTabChange(blockId, value)
    }
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
