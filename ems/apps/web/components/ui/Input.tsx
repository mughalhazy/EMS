'use client'

import React from 'react'
import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[styles.input, error ? styles.error : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <span className={styles.errorMsg}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
