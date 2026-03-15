import { NextResponse } from 'next/server'
import * as mock from '@/lib/mock-data'

type Context = { params: { path: string[] } }

function paginate<T>(items: T[]) {
  return { data: items, nextCursor: null, total: items.length }
}

// All-events flat lists (for pages that don't filter by event)
const allSessions     = mock.sessions
const allSpeakers     = mock.speakers
const allAttendees    = Object.values(mock.attendees).flat()
const allRegistrations = Object.values(mock.registrations).flat()
const allTickets      = Object.values(mock.tickets).flat()
const allSponsors     = Object.values(mock.sponsors).flat()
const allExhibitors   = Object.values(mock.exhibitors).flat()

export async function GET(req: Request, { params }: Context) {
  const path = params.path.join('/')
  const url = new URL(req.url)

  // ── /events ──────────────────────────────────────────────────
  if (path === 'events') {
    const status = url.searchParams.get('status')
    const items = status ? mock.events.filter(e => e.status === status) : mock.events
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id ───────────────────────────────────────────────
  const eventMatch = path.match(/^events\/([^/]+)$/)
  if (eventMatch) {
    const ev = mock.events.find(e => e.id === eventMatch[1])
    if (!ev) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(ev)
  }

  // ── /events/:id/sessions ──────────────────────────────────────
  const sessionsMatch = path.match(/^events\/([^/]+)\/sessions$/)
  if (sessionsMatch) {
    const items = mock.sessions.filter(s => s.eventId === sessionsMatch[1])
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/sessions/:sid ─────────────────────────────────
  const sessionMatch = path.match(/^events\/([^/]+)\/sessions\/([^/]+)$/)
  if (sessionMatch) {
    const s = mock.sessions.find(x => x.eventId === sessionMatch[1] && x.id === sessionMatch[2])
    if (!s) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Session not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(s)
  }

  // ── /events/:id/speakers ──────────────────────────────────────
  const speakersMatch = path.match(/^events\/([^/]+)\/speakers$/)
  if (speakersMatch) {
    const items = mock.speakers.filter(s => s.eventId === speakersMatch[1])
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/attendees ─────────────────────────────────────
  const attendeesMatch = path.match(/^events\/([^/]+)\/attendees$/)
  if (attendeesMatch) {
    const items = mock.attendees[attendeesMatch[1]] ?? []
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/registrations ─────────────────────────────────
  const registrationsMatch = path.match(/^events\/([^/]+)\/registrations$/)
  if (registrationsMatch) {
    const items = mock.registrations[registrationsMatch[1]] ?? []
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/tickets ───────────────────────────────────────
  const ticketsMatch = path.match(/^events\/([^/]+)\/tickets$/)
  if (ticketsMatch) {
    const items = mock.tickets[ticketsMatch[1]] ?? []
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/tickets/:tid ──────────────────────────────────
  const ticketMatch = path.match(/^events\/([^/]+)\/tickets\/([^/]+)$/)
  if (ticketMatch) {
    const items = mock.tickets[ticketMatch[1]] ?? []
    const t = items.find(x => x.id === ticketMatch[2])
    if (!t) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Ticket not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(t)
  }

  // ── /events/:id/sponsors ──────────────────────────────────────
  const sponsorsMatch = path.match(/^events\/([^/]+)\/sponsors$/)
  if (sponsorsMatch) {
    const items = mock.sponsors[sponsorsMatch[1]] ?? []
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/exhibitors ────────────────────────────────────
  const exhibitorsMatch = path.match(/^events\/([^/]+)\/exhibitors$/)
  if (exhibitorsMatch) {
    const items = mock.exhibitors[exhibitorsMatch[1]] ?? []
    return NextResponse.json(paginate(items))
  }

  // ── /events/:id/venues ────────────────────────────────────────
  const venuesMatch = path.match(/^events\/([^/]+)\/venues$/)
  if (venuesMatch) {
    return NextResponse.json(mock.venues[venuesMatch[1]] ?? [])
  }

  // ── /events/:id/venues/:venueId/rooms ────────────────────────
  const roomsMatch = path.match(/^events\/([^/]+)\/venues\/([^/]+)\/rooms$/)
  if (roomsMatch) {
    const [_, eventId, venueId] = roomsMatch
    const venue = (mock.venues[eventId] ?? []).find(v => v.id === venueId)
    if (!venue) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Venue not found', details: [], requestId: 'mock' } }, { status: 404 })
    }

    return NextResponse.json(mock.rooms[venueId] ?? [])
  }

  // ── /events/:id/settings ──────────────────────────────────────
  const settingsMatch = path.match(/^events\/([^/]+)\/settings$/)
  if (settingsMatch) {
    const settings = mock.eventSettings[settingsMatch[1]]
    if (!settings) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event settings not found', details: [], requestId: 'mock' } }, { status: 404 })
    }

    return NextResponse.json(settings)
  }

  // ── /analytics/kpis ──────────────────────────────────────────
  if (path === 'analytics/kpis') {
    return NextResponse.json(mock.tenantKpis)
  }

  // ── /analytics/events/:id/kpis ────────────────────────────────
  const analyticsKpisMatch = path.match(/^analytics\/events\/([^/]+)\/kpis$/)
  if (analyticsKpisMatch) {
    const kpis = mock.eventKpis[analyticsKpisMatch[1]]
    if (!kpis) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(kpis)
  }

  // ── /analytics/events/:id/revenue ────────────────────────────
  const revenueMatch = path.match(/^analytics\/events\/([^/]+)\/revenue$/)
  if (revenueMatch) {
    const r = mock.revenueSummary[revenueMatch[1]]
    if (!r) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(r)
  }

  // ── /analytics/events/:id/attendance ─────────────────────────
  const attendanceMatch = path.match(/^analytics\/events\/([^/]+)\/attendance$/)
  if (attendanceMatch) {
    const a = mock.attendanceTrend[attendanceMatch[1]]
    if (!a) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(a)
  }

  // ── /analytics/events/:id/funnel ─────────────────────────────
  const funnelMatch = path.match(/^analytics\/events\/([^/]+)\/funnel$/)
  if (funnelMatch) {
    const f = mock.funnelMetrics[funnelMatch[1]]
    if (!f) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(f)
  }

  // ── /analytics/events/:id/sessions ───────────────────────────
  const sessionEngagementMatch = path.match(/^analytics\/events\/([^/]+)\/sessions$/)
  if (sessionEngagementMatch) {
    const items = mock.sessions.filter(s => s.eventId === sessionEngagementMatch[1]).map(s => ({
      sessionId: s.id,
      title: s.title,
      capacity: s.capacity ?? 0,
      checkins: Math.floor(Math.random() * (s.capacity ?? 100) * 0.8),
    }))
    return NextResponse.json(items)
  }

  // ── /notifications ────────────────────────────────────────────
  if (path === 'notifications') {
    return NextResponse.json(paginate(mock.notifications))
  }

  // ── /notifications/:id ───────────────────────────────────────
  const notifMatch = path.match(/^notifications\/([^/]+)$/)
  if (notifMatch) {
    const n = mock.notifications.find(x => x.id === notifMatch[1])
    if (!n) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Notification not found', details: [], requestId: 'mock' } }, { status: 404 })
    return NextResponse.json(n)
  }

  // ── /tenant ───────────────────────────────────────────────────
  if (path === 'tenant') {
    return NextResponse.json(mock.tenant)
  }

  // ── /users ────────────────────────────────────────────────────
  if (path === 'users') {
    return NextResponse.json(mock.users)
  }

  // ── /organizations ────────────────────────────────────────────
  if (path === 'organizations') {
    return NextResponse.json(mock.organizations)
  }

  // ── /auth/me ──────────────────────────────────────────────────
  if (path === 'auth/me') {
    return NextResponse.json(mock.me)
  }

  // ── 404 fallback ──────────────────────────────────────────────
  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message: `Mock: no handler for /api/v1/${path}`, details: [], requestId: 'mock' } },
    { status: 404 },
  )
}

export async function POST(req: Request, { params }: Context) {
  const path = params.path.join('/')

  const lifecycleMatch = path.match(/^events\/([^/]+)\/(publish|unpublish|archive)$/)
  if (lifecycleMatch) {
    const [_, eventId, action] = lifecycleMatch
    const ev = mock.events.find(e => e.id === eventId)
    if (!ev) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event not found', details: [], requestId: 'mock' } }, { status: 404 })
    }

    const nextStatus = action === 'publish' ? 'published' : action === 'unpublish' ? 'draft' : 'archived'
    return NextResponse.json({ ...ev, status: nextStatus })
  }

  const createVenueMatch = path.match(/^events\/([^/]+)\/venues$/)
  if (createVenueMatch) {
    const eventId = createVenueMatch[1]
    const payload = await req.json() as Record<string, unknown>
    return NextResponse.json({
      id: `venue-${Date.now()}`,
      tenantId: mock.tenant.id,
      eventId,
      name: payload.name ?? 'New Venue',
      type: payload.type ?? 'physical',
      addressLine1: payload.addressLine1,
      city: payload.city,
      country: payload.country,
      virtualUrl: payload.virtualUrl,
      capacity: payload.capacity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 })
  }

  const createRoomMatch = path.match(/^events\/([^/]+)\/venues\/([^/]+)\/rooms$/)
  if (createRoomMatch) {
    const [_, eventId, venueId] = createRoomMatch
    const payload = await req.json() as Record<string, unknown>
    return NextResponse.json({
      id: `room-${Date.now()}`,
      tenantId: mock.tenant.id,
      eventId,
      venueId,
      name: payload.name ?? 'New Room',
      floor: payload.floor,
      capacity: payload.capacity ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 })
  }

  return NextResponse.json({ ok: true, mock: true })
}

export async function PATCH(req: Request, { params }: Context) {
  const path = params.path.join('/')

  const settingsMatch = path.match(/^events\/([^/]+)\/settings$/)
  if (settingsMatch) {
    const eventId = settingsMatch[1]
    const existing = mock.eventSettings[eventId]
    if (!existing) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Event settings not found', details: [], requestId: 'mock' } }, { status: 404 })
    }

    const payload = await req.json() as Record<string, unknown>
    return NextResponse.json({ ...existing, ...payload, updatedAt: new Date().toISOString() })
  }

  const roomMatch = path.match(/^events\/([^/]+)\/venues\/([^/]+)\/rooms\/([^/]+)$/)
  if (roomMatch) {
    const [_, eventId, venueId, roomId] = roomMatch
    const current = (mock.rooms[venueId] ?? []).find(r => r.id === roomId)
    if (!current) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Room not found', details: [], requestId: 'mock' } }, { status: 404 })
    }

    const payload = await req.json() as Record<string, unknown>
    return NextResponse.json({ ...current, ...payload, eventId, venueId, updatedAt: new Date().toISOString() })
  }

  return NextResponse.json({ ok: true, mock: true })
}

export async function PUT(_req: Request, { params }: Context) {
  return NextResponse.json({ ok: true, mock: true })
}

export async function DELETE(_req: Request, { params }: Context) {
  const path = params.path.join('/')
  const roomMatch = path.match(/^events\/([^/]+)\/venues\/([^/]+)\/rooms\/([^/]+)$/)
  if (roomMatch) {
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json({ ok: true, mock: true })
}
