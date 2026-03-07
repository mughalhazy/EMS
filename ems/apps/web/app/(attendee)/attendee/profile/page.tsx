'use client'

import React, { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/auth.service'
import { registrationsService } from '@/services/registrations.service'
import { eventsService } from '@/services/events.service'
import { User, Registration, Event, RegistrationStatus } from '@/types/domain'
import styles from './profile.module.css'

const REG_STATUS_COLOR: Record<RegistrationStatus, 'amber' | 'indigo' | 'forest' | 'brick'> = {
  pending:   'amber',
  approved:  'indigo',
  confirmed: 'forest',
  cancelled: 'brick',
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProfilePage() {
  const [user, setUser]             = useState<User | null>(null)
  const [events, setEvents]         = useState<Event[]>([])
  const [registrations, setRegs]    = useState<Registration[]>([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)

  // Editable form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')

  useEffect(() => {
    authService.me()
      .then(res => {
        setUser(res.user)
        setFirstName(res.user.firstName)
        setLastName(res.user.lastName)
        setEmail(res.user.email)

        // Load registrations: fetch events first, then registrations for first event
        return eventsService.list({ limit: 10 })
      })
      .then(async evRes => {
        setEvents(evRes.data)
        if (evRes.data.length > 0) {
          const regs = await registrationsService.list(evRes.data[0].id, { limit: 25 }).catch(() => ({ data: [] as Registration[] }))
          setRegs(regs.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleEditStart() {
    if (!user) return
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      // Profile update goes via user/attendee service in a full implementation
      // For now we update local state to reflect the edit
      setUser({ ...user, firstName, lastName, email })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (!user) return
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
    setEditing(false)
  }

  if (loading) {
    return (
      <div className={styles.skeletonPage}>
        <div className={styles.skeletonHero} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundTitle}>Not signed in</p>
        <p className={styles.notFoundDesc}>Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Profile hero */}
      <div className={styles.hero}>
        <Avatar
          initials={initials(user.firstName, user.lastName)}
          color="indigo"
          size="lg"
        />
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{user.firstName} {user.lastName}</h1>
          <p className={styles.heroEmail}>{user.email}</p>
          <div className={styles.heroBadges}>
            <Badge color={user.status === 'active' ? 'forest' : user.status === 'invited' ? 'amber' : 'neutral'}>
              {user.status}
            </Badge>
          </div>
        </div>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={handleEditStart}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className={styles.grid}>
        {/* Edit / details card */}
        <Card title={editing ? 'Edit Profile' : 'Profile Details'}>
          {editing ? (
            <form className={styles.form} onSubmit={handleSave}>
              <Input
                label="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className={styles.formActions}>
                <Button type="submit" variant="forest" size="sm" loading={saving}>
                  Save Changes
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className={styles.detailList}>
              {[
                ['First Name', user.firstName],
                ['Last Name',  user.lastName],
                ['Email',      user.email],
                ['Status',     user.status],
                ['Member Since', fmtDate(user.createdAt)],
                ...(user.lastLoginAt ? [['Last Login', fmtDate(user.lastLoginAt)]] : []),
              ].map(([label, value]) => (
                <div key={label} className={styles.detailRow}>
                  <span className={styles.detailLabel}>{label}</span>
                  <span className={styles.detailValue}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Registrations card */}
        <Card title="My Registrations">
          {registrations.length === 0 ? (
            <p className={styles.emptyRegs}>No registrations found.</p>
          ) : (
            <div className={styles.regList}>
              {registrations.map(r => {
                const event = events.find(e => e.id === r.eventId)
                return (
                  <div key={r.id} className={styles.regRow}>
                    <div className={styles.regInfo}>
                      <p className={styles.regEvent}>{event?.name ?? r.eventId}</p>
                      <p className={styles.regDate}>{fmtDate(r.registeredAt)}</p>
                    </div>
                    <Badge color={REG_STATUS_COLOR[r.status]}>{r.status}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
