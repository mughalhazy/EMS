'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlertCard } from '@/components/ui/AlertCard'
import { authService } from '@/services/auth.service'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', tenantSlug: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login(form)
      router.replace('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Sign in</h1>
      <p className={styles.sub}>Access your event workspace</p>

      {error && (
        <div className={styles.alertWrap}>
          <AlertCard variant="brick">{error}</AlertCard>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Workspace"
          type="text"
          placeholder="your-org"
          required
          value={form.tenantSlug}
          onChange={(e) => setForm({ ...form, tenantSlug: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
          Sign in
        </Button>
      </form>
    </div>
  )
}
