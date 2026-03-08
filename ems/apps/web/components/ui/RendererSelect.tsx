'use client'

import React from 'react'
import styles from './RendererSelect.module.css'

type AnyObj = Record<string, unknown>

interface RendererSelectProps {
  label?: string
  placeholder?: string
  /** Current selected value — injected via dataKey (e.g. current eventId string) */
  data?: unknown
  /** Options array — injected via optionsKey (e.g. Event[]) */
  options?: unknown
  /** Field in each option object to use as display label (default: "name") */
  optionLabel?: string
  /** Field in each option object to use as option value (default: "id") */
  optionValue?: string
  disabled?: boolean
}

export function RendererSelect({
  label,
  placeholder = 'Select…',
  data,
  options,
  optionLabel = 'name',
  optionValue = 'id',
  disabled = false,
}: RendererSelectProps) {
  const items = Array.isArray(options) ? (options as AnyObj[]) : []
  const currentValue = data !== undefined && data !== null ? String(data) : ''

  return (
    <div className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <select
        className={styles.select}
        defaultValue={currentValue}
        disabled={disabled}
        aria-label={label ?? placeholder}
      >
        <option value="">{items.length ? placeholder : 'No events'}</option>
        {items.map((item, i) => {
          const val = String(item[optionValue] ?? i)
          const lbl = String(item[optionLabel] ?? val)
          return <option key={val} value={val}>{lbl}</option>
        })}
      </select>
    </div>
  )
}
