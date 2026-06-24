-- Create per-service schemas (one per owning service)
-- Each service owns its schema; no cross-schema foreign keys allowed.

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS tenant;
CREATE SCHEMA IF NOT EXISTS rbac;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS event;
CREATE SCHEMA IF NOT EXISTS agenda;
CREATE SCHEMA IF NOT EXISTS speaker;
CREATE SCHEMA IF NOT EXISTS exhibitor;
CREATE SCHEMA IF NOT EXISTS attendee;
CREATE SCHEMA IF NOT EXISTS registration;
CREATE SCHEMA IF NOT EXISTS onsite;
CREATE SCHEMA IF NOT EXISTS ticketing;
CREATE SCHEMA IF NOT EXISTS pricing;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS "ordering"; -- entity uses schema:'ordering' (SQL reserved word); was "order" — fixed 2026-06-17
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS fulfillment;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS engagement;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS networking;
CREATE SCHEMA IF NOT EXISTS interactive_engagement;
CREATE SCHEMA IF NOT EXISTS ai_service;
CREATE SCHEMA IF NOT EXISTS integration;

-- Enable uuid-ossp for uuid_generate_v4() across all schemas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for gen_random_uuid() (preferred over uuid-ossp in PG14+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
