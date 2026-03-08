'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/settings.wireframe.json'
import { tenantService } from '@/services/tenant.service'
import { Tenant, User } from '@/types/domain'
import styles from './settings.module.css'

export default function SettingsPage() {
  const [tenant, setTenant]   = useState<Tenant | null>(null)
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      tenantService.getCurrent().catch(() => null),
      tenantService.listUsers().catch(() => [] as User[]),
    ]).then(([t, u]) => { setTenant(t); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ workspace: tenant, users, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
