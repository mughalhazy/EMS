'use client'

import React from 'react'
import { StatusChip } from './StatusChip'
import type { StatusChipColor } from './StatusChip'

type AnyObj = Record<string, unknown>

// All domain status values → DL color token
const STATUS_COLOR_MAP: Record<string, StatusChipColor> = {
  // Event
  draft: 'neutral', published: 'forest', live: 'teal', archived: 'neutral',
  // Session
  scheduled: 'forest', completed: 'indigo', cancelled: 'brick',
  // Speaker
  invited: 'amber', confirmed: 'forest', declined: 'brick', withdrawn: 'neutral',
  // Ticket
  on_sale: 'forest', sold_out: 'brick', closed: 'neutral',
  // Registration
  pending: 'amber', approved: 'forest',
  // Attendee
  registered: 'forest', checked_in: 'teal', prospect: 'amber',
  // Sponsor / Exhibitor
  active: 'forest', fulfilled: 'forest',
  // Notification
  sent: 'forest', delivered: 'teal', failed: 'brick', bounced: 'brick',
  suppressed: 'neutral', queued: 'amber',
  // Generic
  inactive: 'neutral', disabled: 'neutral',
}

interface RendererStatusChipProps {
  /** Entity object injected via dataKey — chip extracts statusKey from it */
  data?: unknown
  /** Field to extract from entity object (default: "status") */
  statusKey?: string
  /** Direct status string — used when data is already the status value */
  status?: string
  children?: React.ReactNode
}

export function RendererStatusChip({
  data,
  statusKey = 'status',
  status,
  children,
}: RendererStatusChipProps) {
  let statusValue: string

  if (typeof data === 'string') {
    // data bridge resolved directly to a string value
    statusValue = data
  } else if (data && typeof data === 'object' && !Array.isArray(data)) {
    // data bridge resolved to an entity object — extract the status field
    statusValue = String((data as AnyObj)[statusKey] ?? '')
  } else if (status) {
    statusValue = status
  } else if (typeof children === 'string') {
    statusValue = children
  } else {
    statusValue = ''
  }

  if (!statusValue) return null

  const color: StatusChipColor = STATUS_COLOR_MAP[statusValue] ?? 'neutral'
  const label = statusValue.replace(/_/g, ' ')

  return <StatusChip color={color}>{label}</StatusChip>
}
