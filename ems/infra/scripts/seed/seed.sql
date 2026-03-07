-- =============================================================
-- EMS Development Seed Data
-- =============================================================
-- Usage:
--   psql -h localhost -U ems -d ems -f seed.sql
--   OR: bash infra/scripts/seed/seed.sh
--
-- Default password for all seeded users: DevSeed2026!
-- Tenant slug: acme
--
-- Fixed UUIDs (idempotent — safe to re-run):
--   Tenant           10000000-0000-0000-0000-000000000001
--   Users            20000000-0000-0000-0000-0000000000XX  (01–10)
--   Auth credentials a0000000-0000-0000-0000-0000000000XX  (01–08)
--   Role             b0000000-0000-0000-0000-000000000001
--   Events           30000000-0000-0000-0000-0000000000XX  (01–03)
--   Venues           50000000-0000-0000-0000-0000000000XX  (01–03)
--   Inventory items  60000000-0000-0000-0000-0000000000XX  (01–05)
--   Tickets          70000000-0000-0000-0000-0000000000XX  (01–05)
--   Attendees        c0000000-0000-0000-0000-0000000000XX  (01–18)
--   Registrations    d0000000-0000-0000-0000-0000000000XX  (01–17)
-- =============================================================

\set ON_ERROR_STOP on

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ──────────────────────────────────────────────────────────────
-- 1. TENANT
-- ──────────────────────────────────────────────────────────────

INSERT INTO tenants (id, name, slug)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Acme Events Co.',
  'acme'
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 2. USERS
-- ──────────────────────────────────────────────────────────────

INSERT INTO users (id, tenant_id, email, first_name, last_name, status, last_login_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'alice@acme.dev',  'Alice', 'Chen',    'active',  NOW() - INTERVAL '2 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'bob@acme.dev',    'Bob',   'Martinez','active',  NOW() - INTERVAL '1 day'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'carol@acme.dev',  'Carol', 'Singh',   'active',  NOW() - INTERVAL '3 days'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'dave@acme.dev',   'Dave',  'Kim',     'active',  NOW() - INTERVAL '5 days'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'eve@acme.dev',    'Eve',   'Okafor',  'active',  NOW() - INTERVAL '1 week'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'frank@acme.dev',  'Frank', 'Torres',  'active',  NOW() - INTERVAL '2 weeks'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'grace@acme.dev',  'Grace', 'Muller',  'active',  NOW() - INTERVAL '3 weeks'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'henry@acme.dev',  'Henry', 'Park',    'active',  NOW() - INTERVAL '1 month'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'iris@acme.dev',   'Iris',  'Patel',   'invited', NULL),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'jack@acme.dev',   'Jack',  'Novak',   'invited', NULL)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 3. AUTH CREDENTIALS  (password: DevSeed2026!)
--    auth_user_state (email verified for active users)
-- ──────────────────────────────────────────────────────────────

INSERT INTO auth_credentials (id, user_id, password_hash, password_changed_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '6 months'),
  ('a0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '6 months'),
  ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '5 months'),
  ('a0000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '5 months'),
  ('a0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '4 months'),
  ('a0000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '3 months'),
  ('a0000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '2 months'),
  ('a0000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', crypt('DevSeed2026!', gen_salt('bf', 10)), NOW() - INTERVAL '1 month')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO auth_user_state (id, user_id, email_verified, email_verified_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '6 months'),
  ('a1000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', true, NOW() - INTERVAL '6 months'),
  ('a1000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', true, NOW() - INTERVAL '5 months'),
  ('a1000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', true, NOW() - INTERVAL '5 months'),
  ('a1000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', true, NOW() - INTERVAL '4 months'),
  ('a1000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', true, NOW() - INTERVAL '3 months'),
  ('a1000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', true, NOW() - INTERVAL '2 months'),
  ('a1000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', true, NOW() - INTERVAL '1 month')
ON CONFLICT (user_id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 4. ROLES + ASSIGNMENTS
-- ──────────────────────────────────────────────────────────────

INSERT INTO roles (id, tenant_id, name, scope, description, is_system)
VALUES
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'tenant_admin',   'tenant', 'Full access to all tenant resources',       true),
  ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'event_manager',  'tenant', 'Create and manage events',                  true),
  ('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'checkin_staff',  'event',  'Onsite check-in and badge scanning access',  true)
ON CONFLICT (id) DO NOTHING;

-- Alice and Bob are tenant admins; Carol–Eve are event managers; Frank is checkin staff
INSERT INTO user_role_assignments (id, tenant_id, user_id, role_id, assigned_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 months'),
  ('b1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 months'),
  ('b1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 months'),
  ('b1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 months'),
  ('b1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 months'),
  ('b1000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 months')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 5. EVENTS
--    E1: TechConf 2026       — live      (Mar  5–8  2026)
--    E2: DevSummit 2026      — published (Jun 10–12 2026)
--    E3: Design Week 2025    — archived  (Nov  1–5  2025)
--
--    organization_id = tenant id (no org table FK enforced)
-- ──────────────────────────────────────────────────────────────

INSERT INTO events (id, tenant_id, organization_id, name, code, description, timezone, start_at, end_at, status)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'TechConf 2026',
    'TECHCONF26',
    'Three days of talks, workshops, and networking for engineers and tech leaders. Covering platform engineering, AI, distributed systems, and open source.',
    'America/Los_Angeles',
    '2026-03-05 09:00:00+00',
    '2026-03-08 18:00:00+00',
    'live'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'DevSummit 2026',
    'DEVSUMMIT26',
    'A focused two-day summit for software developers. Deep dives into TypeScript, Rust, WebAssembly, and developer experience tooling.',
    'America/New_York',
    '2026-06-10 09:00:00+00',
    '2026-06-12 17:00:00+00',
    'published'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Design Week 2025',
    'DESIGNWK25',
    'A five-day immersive design conference covering product design, UX research, design systems, and the intersection of design and engineering.',
    'America/Chicago',
    '2025-11-01 09:00:00+00',
    '2025-11-05 18:00:00+00',
    'archived'
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 6. VENUES
-- ──────────────────────────────────────────────────────────────

INSERT INTO venues (id, tenant_id, event_id, name, type, address_line1, city, country, capacity)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Moscone Center West',
    'physical',
    '800 Howard St',
    'San Francisco',
    'US',
    5000
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Design Hub Chicago',
    'physical',
    '222 W Merchandise Mart Plaza',
    'Chicago',
    'US',
    800
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO venues (id, tenant_id, event_id, name, type, virtual_url)
VALUES
  (
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'Online — Hopin',
    'virtual',
    'https://hopin.com/events/devsummit-2026'
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 7. SESSIONS
--
--    TechConf 2026  (E1) — 13 sessions over 3 days
--    DevSummit 2026 (E2) —  6 sessions over 2 days
--    Design Week    (E3) —  6 sessions over 5 days (all completed)
-- ──────────────────────────────────────────────────────────────

-- === TechConf Day 1: March 5 ===
INSERT INTO sessions (id, tenant_id, event_id, title, abstract, session_type, start_at, end_at, status)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Opening Keynote: Building the Decade''s Infrastructure',
    'A bold look at the infrastructure patterns that will define the next ten years of software. From edge computing to AI-native systems, what fundamentals should every engineering leader understand?',
    'keynote',
    '2026-03-05 17:00:00+00',
    '2026-03-05 18:30:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Resilient Distributed Systems at Scale',
    'War stories and lessons learned from running distributed systems at millions of requests per second. Circuit breakers, chaos engineering, and graceful degradation in practice.',
    'talk',
    '2026-03-05 19:00:00+00',
    '2026-03-05 20:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'AI-Driven Developer Workflows',
    'How AI is reshaping the daily workflow of software engineers. Code generation, test synthesis, documentation automation, and where human judgment remains irreplaceable.',
    'talk',
    '2026-03-05 20:15:00+00',
    '2026-03-05 21:15:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'The Future of Web Architecture',
    'Islands, partial hydration, server components, edge runtimes — a clear-eyed survey of where web architecture is heading and the tradeoffs each approach demands.',
    'talk',
    '2026-03-05 22:00:00+00',
    '2026-03-05 23:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Day 1 Networking Mixer',
    'Connect with speakers and attendees over drinks and light bites. Sponsor booths open in the exhibition hall.',
    'networking',
    '2026-03-06 01:00:00+00',
    '2026-03-06 02:30:00+00',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;

-- === TechConf Day 2: March 6 ===
INSERT INTO sessions (id, tenant_id, event_id, title, abstract, session_type, start_at, end_at, status)
VALUES
  (
    '40000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Platform Engineering at Scale',
    'Building an internal developer platform that teams actually adopt. From golden paths to self-service infrastructure, the organizational and technical patterns that work.',
    'keynote',
    '2026-03-06 17:00:00+00',
    '2026-03-06 18:30:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Observability Patterns for Modern Applications',
    'Structured logging, distributed tracing, and metrics — a unified observability strategy across microservices, serverless, and edge deployments.',
    'talk',
    '2026-03-06 19:00:00+00',
    '2026-03-06 20:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Kubernetes Deep Dive: Advanced Workload Patterns',
    'Hands-on workshop covering custom controllers, admission webhooks, KEDA autoscaling, and progressive delivery with Argo Rollouts. Bring your laptop.',
    'workshop',
    '2026-03-06 21:00:00+00',
    '2026-03-06 23:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000009',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Security in the Age of AI: Panel Discussion',
    'Industry experts discuss AI-generated code vulnerabilities, supply chain security, zero-trust architecture, and the evolving threat landscape for engineering organizations.',
    'panel',
    '2026-03-06 23:30:00+00',
    '2026-03-07 01:00:00+00',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;

-- === TechConf Day 3: March 7 (today) ===
INSERT INTO sessions (id, tenant_id, event_id, title, abstract, session_type, start_at, end_at, status)
VALUES
  (
    '40000000-0000-0000-0000-000000000010',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Open Source Sustainability and Innovation',
    'A keynote on the state of open source: funding models, contributor burnout, corporate stewardship, and the projects shaping tomorrow''s infrastructure stack.',
    'keynote',
    '2026-03-07 17:00:00+00',
    '2026-03-07 18:30:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000011',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'TypeScript: Advanced Type-Level Programming',
    'Template literal types, conditional types, infer tricks, and the patterns that make large TypeScript codebases maintainable. Real-world examples from production code.',
    'talk',
    '2026-03-07 19:00:00+00',
    '2026-03-07 20:00:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000012',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'CI/CD Masterclass: From Commit to Production in Minutes',
    'End-to-end workshop building a modern CI/CD pipeline with GitHub Actions, Buildkite, and ArgoCD. Feature flags, canary deployments, and automatic rollback strategies.',
    'workshop',
    '2026-03-07 21:00:00+00',
    '2026-03-07 23:00:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000013',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Closing Keynote: The Next Chapter',
    'TechConf''s closing address — reflecting on the talks, patterns, and ideas from three days together, and looking ahead to the engineering challenges that await.',
    'keynote',
    '2026-03-08 00:00:00+00',
    '2026-03-08 01:30:00+00',
    'scheduled'
  )
ON CONFLICT (id) DO NOTHING;

-- === DevSummit 2026 (E2) — all scheduled ===
INSERT INTO sessions (id, tenant_id, event_id, title, abstract, session_type, start_at, end_at, status)
VALUES
  (
    '40000000-0000-0000-0000-000000000014',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'TypeScript 6.0: What''s New and What It Means for You',
    'A deep dive into the upcoming TypeScript 6.0 release. New inference improvements, decorator metadata, and the features that will change how you write TypeScript day-to-day.',
    'keynote',
    '2026-06-10 13:00:00+00',
    '2026-06-10 14:00:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000015',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'Rust for TypeScript Developers',
    'A practical introduction to Rust for those who already know TypeScript. Memory ownership, borrowing, and where Rust shines for performance-critical modules in a JS ecosystem.',
    'talk',
    '2026-06-10 14:30:00+00',
    '2026-06-10 15:30:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000016',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'WebAssembly in Production',
    'Beyond the hype — real-world use cases for WebAssembly in 2026. Running WASM at the edge, sandboxed plugins, and integrating WASM modules into existing Node.js and browser apps.',
    'talk',
    '2026-06-10 16:00:00+00',
    '2026-06-10 17:00:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000017',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'DX Tooling: Building Developer Tools People Love',
    'What separates great developer tools from mediocre ones. Ergonomics, error messages, incremental adoption, and the design principles behind beloved CLIs and SDKs.',
    'keynote',
    '2026-06-11 13:00:00+00',
    '2026-06-11 14:00:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000018',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'Monorepos at Scale: Nx and Turborepo in Practice',
    'Hands-on workshop comparing Nx and Turborepo for large TypeScript monorepos. Caching strategies, affected-graph computation, and CI pipeline optimization.',
    'workshop',
    '2026-06-11 14:30:00+00',
    '2026-06-11 16:30:00+00',
    'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000019',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'The Future of Full-Stack Development: Panel',
    'React Server Components, Svelte 5, Solid, Qwik — where is the full-stack JavaScript ecosystem heading? Panelists from framework teams discuss the next generation of web development.',
    'panel',
    '2026-06-11 17:00:00+00',
    '2026-06-11 18:00:00+00',
    'scheduled'
  )
ON CONFLICT (id) DO NOTHING;

-- === Design Week 2025 (E3) — all completed ===
INSERT INTO sessions (id, tenant_id, event_id, title, abstract, session_type, start_at, end_at, status)
VALUES
  (
    '40000000-0000-0000-0000-000000000020',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Designing for AI: New Interaction Paradigms',
    'As conversational UI, generative imagery, and AI-assisted workflows become mainstream, what new design principles must we adopt? Explorations from cutting-edge product teams.',
    'keynote',
    '2025-11-01 14:00:00+00',
    '2025-11-01 15:30:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000021',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Design Systems That Scale',
    'How leading organizations structure and maintain design systems for thousands of components across dozens of product teams. Token architecture, contribution workflows, and governance.',
    'talk',
    '2025-11-02 14:00:00+00',
    '2025-11-02 15:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000022',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'UX Research Methods for Fast-Moving Teams',
    'Practical research techniques for teams without dedicated researchers. Guerrilla testing, remote unmoderated studies, and embedding evidence-based decisions into sprint cycles.',
    'workshop',
    '2025-11-03 14:00:00+00',
    '2025-11-03 16:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000023',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Accessibility as Craft',
    'Moving accessibility from compliance checkbox to design quality. Hands-on patterns, tooling, and the mindset shift needed to make inclusive design the default on your team.',
    'talk',
    '2025-11-04 14:00:00+00',
    '2025-11-04 15:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000024',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Design × Engineering: Closing Panel',
    'A cross-disciplinary panel on the evolving relationship between design and engineering. Shared tools, design tokens, component collaboration, and what the best teams do differently.',
    'panel',
    '2025-11-04 15:30:00+00',
    '2025-11-04 17:00:00+00',
    'completed'
  ),
  (
    '40000000-0000-0000-0000-000000000025',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Closing Keynote: Design in the Next Decade',
    'Where is the design profession heading? AI tools, new form factors, ethics at scale, and the skills that will matter most for the next generation of product designers.',
    'keynote',
    '2025-11-05 15:00:00+00',
    '2025-11-05 16:30:00+00',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 8. SPEAKERS
-- ──────────────────────────────────────────────────────────────

INSERT INTO speakers (id, tenant_id, event_id, first_name, last_name, email, bio, status)
VALUES
  -- TechConf speakers
  ('e0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Priya', 'Mehta', 'priya.mehta@techconf.dev',
   'VP of Engineering at Cloudbase. 15 years building distributed systems at scale. Open source contributor to Kubernetes and Envoy.',
   'confirmed'),
  ('e0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Marcus', 'Reid', 'marcus.reid@techconf.dev',
   'Staff Engineer at Stripe. Author of "Distributed Systems for Practitioners". Regular contributor to the CNCF ecosystem.',
   'confirmed'),
  ('e0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Yuna', 'Sato', 'yuna.sato@techconf.dev',
   'Co-founder of DevPath AI. Previously engineering lead at GitHub Copilot. Building tools that make developers more productive.',
   'confirmed'),
  ('e0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Tobias', 'Grün', 'tobias.grun@techconf.dev',
   'Platform engineer at SAP with expertise in Kubernetes operators and GitOps workflows. Contributor to ArgoCD and Flux.',
   'confirmed'),
  -- DevSummit speakers
  ('e0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
   'Amara', 'Osei', 'amara.osei@devsummit.dev',
   'Core TypeScript team member at Microsoft. TypeScript compiler contributor since 2020.',
   'confirmed'),
  ('e0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
   'Leon', 'Fischer', 'leon.fischer@devsummit.dev',
   'Senior engineer at Fermyon. Building WebAssembly tooling for server-side workloads.',
   'confirmed'),
  -- Design Week speakers
  ('e0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003',
   'Sofia', 'Ramirez', 'sofia.ramirez@designweek.dev',
   'Head of Design at Figma. Previously design lead at Airbnb and Google. Creator of the Spectrum design system.',
   'confirmed'),
  ('e0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003',
   'James', 'Okafor', 'james.okafor@designweek.dev',
   'Accessibility engineer and advocate. Author of "Accessible by Default". W3C WAI contributor.',
   'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 9. INVENTORY ITEMS + TICKETS
--    Wrapped in a DO block so missing ticketing tables don't
--    abort the entire seed (tables may be created by app sync).
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN

  -- Inventory items
  INSERT INTO inventory_items (id, tenant_id, name, total_quantity, reserved_quantity)
  VALUES
    ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'TechConf 2026 — General Admission',  500,  320),
    ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'TechConf 2026 — VIP Pass',           100,   25),
    ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'DevSummit 2026 — Standard',          300,   85),
    ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'DevSummit 2026 — Workshop Add-on',    60,   22),
    ('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Design Week 2025 — All Access',      200,  183)
  ON CONFLICT (id) DO NOTHING;

  -- Tickets
  INSERT INTO tickets (id, tenant_id, event_id, inventory_id, name, currency, base_price, fee_amount, tax_amount, total_price)
  VALUES
    ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'General Admission', 'USD', 279.00, 14.95, 5.05, 299.00),
    ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', 'VIP Pass',          'USD', 749.00, 39.95, 10.05, 799.00),
    ('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003', 'Standard Pass',     'USD', 185.00,  9.95,  4.05, 199.00),
    ('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000004', 'Workshop Add-on',   'USD',  90.00,  5.95,  3.05,  99.00),
    ('70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000005', 'All Access Pass',   'USD', 135.00,  9.95,  4.05, 149.00)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'ticketing tables (inventory_items / tickets) not found — skipping. Run app once to sync schema.';
END $$;

-- ──────────────────────────────────────────────────────────────
-- 10. ATTENDEES
--     TechConf  (c01–c10): 8 linked to users, 2 external walk-ins
--     DevSummit (c11–c15): 4 linked to users, 1 external
--     Design Wk (c16–c18): 3 linked to users (all checked in)
-- ──────────────────────────────────────────────────────────────

INSERT INTO attendees (id, tenant_id, event_id, user_id, first_name, last_name, email, badge_name, status)
VALUES
  -- TechConf — linked to users
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Alice', 'Chen',    'alice@acme.dev',  'Alice C.',  'checked_in'),
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Bob',   'Martinez','bob@acme.dev',    'Bob M.',    'checked_in'),
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Carol', 'Singh',   'carol@acme.dev',  'Carol S.',  'checked_in'),
  ('c0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Dave',  'Kim',     'dave@acme.dev',   'Dave K.',   'checked_in'),
  ('c0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'Eve',   'Okafor',  'eve@acme.dev',    'Eve O.',    'checked_in'),
  ('c0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'Frank', 'Torres',  'frank@acme.dev',  'Frank T.',  'registered'),
  ('c0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'Grace', 'Muller',  'grace@acme.dev',  'Grace M.',  'registered'),
  ('c0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'Henry', 'Park',    'henry@acme.dev',  'Henry P.',  'registered'),
  -- TechConf — external (no user account)
  ('c0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', NULL, 'Yuki',  'Tanaka',  'yuki.tanaka@gmail.com',   'Yuki T.',  'checked_in'),
  ('c0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', NULL, 'Priya', 'Sharma',  'priya.sharma@outlook.com','Priya S.', 'checked_in'),
  -- DevSummit — linked to users
  ('c0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Alice', 'Chen',    'alice@acme.dev',  NULL, 'registered'),
  ('c0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Bob',   'Martinez','bob@acme.dev',    NULL, 'registered'),
  ('c0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Carol', 'Singh',   'carol@acme.dev',  NULL, 'registered'),
  ('c0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'Dave',  'Kim',     'dave@acme.dev',   NULL, 'registered'),
  -- DevSummit — external
  ('c0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', NULL, 'Maria', 'Costa',   'maria.costa@example.com', NULL, 'registered'),
  -- Design Week — linked to users (all checked in — event is archived)
  ('c0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'Eve',   'Okafor',  'eve@acme.dev',    NULL, 'checked_in'),
  ('c0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 'Frank', 'Torres',  'frank@acme.dev',  NULL, 'checked_in'),
  ('c0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', 'Grace', 'Muller',  'grace@acme.dev',  NULL, 'checked_in')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 11. REGISTRATIONS
--     Links users to event tickets.
--     unique: (tenant_id, event_id, user_id, ticket_id)
-- ──────────────────────────────────────────────────────────────

INSERT INTO registrations (id, tenant_id, event_id, user_id, ticket_id, status)
VALUES
  -- TechConf — General Admission (users 1–6)
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000001', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000001', 'approved'),
  -- TechConf — VIP Pass (users 7–8)
  ('d0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000002', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000002', 'confirmed'),
  -- DevSummit — Standard Pass (users 1–4)
  ('d0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000003', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003', 'pending'),
  ('d0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000003', 'pending'),
  -- DevSummit — Workshop Add-on (users 1–2)
  ('d0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000004', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000004', 'pending'),
  -- Design Week — All Access (users 5–7; event archived)
  ('d0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000005', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000005', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000005', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 12. EVENT ANALYTICS
--
--     TechConf 2026:  30 daily snapshots (Feb 5 – Mar 7 2026)
--       Growth model: reg(d)   = ROUND(3 + 5d + 0.1d²)  cap 345
--                     revenue  = reg × 320 (blended avg)
--                     checkins = 0 pre-event; ramps on Mar 5–7
--
--     DevSummit 2026: 14 daily snapshots (Feb 22 – Mar 7 2026)
--       Growth model: reg(d)   = ROUND(2 + 4d + 0.05d²) cap 95
--                     revenue  = reg × 199 (standard only so far)
--                     checkins = 0 (event is June 2026)
--
--     Design Week 2025: 5 event-day snapshots (Nov 1–5 2025)
--       Final state:  183 regs, 183 tickets, $27,267, 162 checkins
-- ──────────────────────────────────────────────────────────────

-- TechConf analytics (30 days)
INSERT INTO event_analytics (
  id, tenant_id, event_id, snapshot_date,
  registrations_count, tickets_sold_count, ticket_sales_amount, attendees_checked_in_count
)
SELECT
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  d::date,
  LEAST(345, ROUND(3 + 5 * idx + 0.1 * idx * idx))::int                                         AS registrations_count,
  LEAST(345, ROUND(3 + 5 * idx + 0.1 * idx * idx))::int                                         AS tickets_sold_count,
  ROUND((LEAST(345, ROUND(3 + 5 * idx + 0.1 * idx * idx)) * 320.0)::numeric, 2)                 AS ticket_sales_amount,
  -- check-ins: 0 before event start (Mar 5); ramp 90/day during live days
  CASE
    WHEN d::date < '2026-03-05' THEN 0
    ELSE LEAST(LEAST(345, ROUND(3 + 5 * idx + 0.1 * idx * idx))::int,
               (d::date - '2026-03-05'::date + 1) * 90)
  END                                                                                            AS attendees_checked_in_count
FROM (
  SELECT
    gs                                            AS d,
    EXTRACT(EPOCH FROM (gs - '2026-02-05 00:00:00'::timestamp))::int / 86400 AS idx
  FROM generate_series(
    '2026-02-05 00:00:00'::timestamp,
    '2026-03-07 00:00:00'::timestamp,
    '1 day'::interval
  ) AS gs
) t
ON CONFLICT (tenant_id, event_id, snapshot_date) DO NOTHING;

-- DevSummit analytics (14 days pre-registration window)
INSERT INTO event_analytics (
  id, tenant_id, event_id, snapshot_date,
  registrations_count, tickets_sold_count, ticket_sales_amount, attendees_checked_in_count
)
SELECT
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000002'::uuid,
  d::date,
  LEAST(95, ROUND(2 + 4 * idx + 0.05 * idx * idx))::int,
  LEAST(95, ROUND(2 + 4 * idx + 0.05 * idx * idx))::int,
  ROUND((LEAST(95, ROUND(2 + 4 * idx + 0.05 * idx * idx)) * 199.0)::numeric, 2),
  0
FROM (
  SELECT
    gs                                            AS d,
    EXTRACT(EPOCH FROM (gs - '2026-02-22 00:00:00'::timestamp))::int / 86400 AS idx
  FROM generate_series(
    '2026-02-22 00:00:00'::timestamp,
    '2026-03-07 00:00:00'::timestamp,
    '1 day'::interval
  ) AS gs
) t
ON CONFLICT (tenant_id, event_id, snapshot_date) DO NOTHING;

-- Design Week 2025 analytics (5 event days, archived)
INSERT INTO event_analytics (
  id, tenant_id, event_id, snapshot_date,
  registrations_count, tickets_sold_count, ticket_sales_amount, attendees_checked_in_count
)
VALUES
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '2025-11-01', 175, 175, 26075.00,  42),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '2025-11-02', 179, 179, 26671.00,  98),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '2025-11-03', 181, 181, 26969.00, 131),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '2025-11-04', 182, 182, 27118.00, 152),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '2025-11-05', 183, 183, 27267.00, 162)
ON CONFLICT (tenant_id, event_id, snapshot_date) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- Summary
-- ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_tenants  int; v_users int; v_events int; v_sessions int;
  v_attendees int; v_regs int; v_analytics int;
BEGIN
  SELECT COUNT(*) INTO v_tenants   FROM tenants   WHERE id = '10000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO v_users     FROM users     WHERE tenant_id = '10000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO v_events    FROM events    WHERE tenant_id = '10000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO v_sessions  FROM sessions  WHERE tenant_id = '10000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO v_attendees FROM attendees WHERE tenant_id = '10000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO v_regs      FROM registrations WHERE tenant_id = '10000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO v_analytics FROM event_analytics WHERE tenant_id = '10000000-0000-0000-0000-000000000001';

  RAISE NOTICE '';
  RAISE NOTICE '=== EMS seed complete ===';
  RAISE NOTICE '  Tenant:       %', v_tenants;
  RAISE NOTICE '  Users:        %', v_users;
  RAISE NOTICE '  Events:       %', v_events;
  RAISE NOTICE '  Sessions:     %', v_sessions;
  RAISE NOTICE '  Attendees:    %', v_attendees;
  RAISE NOTICE '  Registrations:%', v_regs;
  RAISE NOTICE '  Analytics:    %  (daily snapshots)', v_analytics;
  RAISE NOTICE '  Password:     DevSeed2026!';
  RAISE NOTICE '  Tenant slug:  acme';
  RAISE NOTICE '=========================';
END $$;

COMMIT;
