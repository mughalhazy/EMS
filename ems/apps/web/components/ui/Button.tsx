'use client'

import React from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'forest' | 'indigo' | 'ghost' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  as?: 'button' | 'a'
  href?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  as: Tag = 'button',
  href,
  ...props
}: ButtonProps) {
  const classes = [styles.btn, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  if (Tag === 'a') {
    return (
      <a href={href} className={classes}>
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}
