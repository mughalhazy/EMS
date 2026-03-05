-- EMS Auth RBAC schema
-- Models: roles, permissions
-- Supporting relations: role_permissions, user_role_assignments

CREATE TYPE role_scope AS ENUM ('tenant', 'organization', 'event');

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(64) NOT NULL,
    scope role_scope NOT NULL DEFAULT 'tenant',
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_roles_tenant_name UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    code VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_permissions_resource_action UNIQUE (resource, action),
    CONSTRAINT uq_permissions_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    scope_type VARCHAR(32),
    scope_id UUID,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT ck_scope_pair CHECK (
        (scope_type IS NULL AND scope_id IS NULL)
        OR (scope_type IS NOT NULL AND scope_id IS NOT NULL)
    ),
    CONSTRAINT ck_scope_type CHECK (
        scope_type IS NULL OR scope_type IN ('tenant', 'organization', 'event')
    ),
    CONSTRAINT fk_user_role_assignments_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_user_role_assignments_active
        UNIQUE (tenant_id, user_id, role_id, scope_type, scope_id, revoked_at)
);

CREATE INDEX IF NOT EXISTS idx_roles_tenant_scope ON roles (tenant_id, scope);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions (code);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions (permission_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_lookup
    ON user_role_assignments (tenant_id, user_id, scope_type, scope_id)
    WHERE revoked_at IS NULL;

-- -----------------------------------------------------------------------------
-- Tenant-aware authorization guards
-- -----------------------------------------------------------------------------
--
-- These helpers rely on per-request PostgreSQL settings that should be set by
-- the API layer at transaction start:
--   SET LOCAL app.current_tenant_id = '<tenant-id>';
--   SET LOCAL app.current_user_id = '<user-id>';

CREATE OR REPLACE FUNCTION auth_current_tenant_id()
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    tenant_id_setting TEXT;
BEGIN
    tenant_id_setting := current_setting('app.current_tenant_id', true);
    IF tenant_id_setting IS NULL OR btrim(tenant_id_setting) = '' THEN
        RAISE EXCEPTION 'Missing app.current_tenant_id for tenant-isolated access';
    END IF;
    RETURN tenant_id_setting::BIGINT;
END;
$$;

CREATE OR REPLACE FUNCTION auth_current_user_id()
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_id_setting TEXT;
BEGIN
    user_id_setting := current_setting('app.current_user_id', true);
    IF user_id_setting IS NULL OR btrim(user_id_setting) = '' THEN
        RAISE EXCEPTION 'Missing app.current_user_id for RBAC checks';
    END IF;
    RETURN user_id_setting::BIGINT;
END;
$$;

CREATE OR REPLACE FUNCTION auth_has_permission(
    permission_code TEXT,
    requested_scope_type VARCHAR(32) DEFAULT NULL,
    requested_scope_id BIGINT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_role_assignment ura
        JOIN role r
            ON r.id = ura.role_id
        JOIN role_permission rp
            ON rp.role_id = r.id
        JOIN permission p
            ON p.id = rp.permission_id
        WHERE p.code = permission_code
          AND ura.tenant_id = auth_current_tenant_id()
          AND r.tenant_id = auth_current_tenant_id()
          AND ura.user_id = auth_current_user_id()
          AND ura.revoked_at IS NULL
          AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
          AND (
              ura.scope_type IS NULL
              OR (
                  requested_scope_type IS NOT NULL
                  AND ura.scope_type = requested_scope_type
                  AND ura.scope_id = requested_scope_id
              )
          )
    );
$$;

CREATE OR REPLACE FUNCTION auth_require_permission(
    permission_code TEXT,
    requested_scope_type VARCHAR(32) DEFAULT NULL,
    requested_scope_id BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    IF NOT auth_has_permission(permission_code, requested_scope_type, requested_scope_id) THEN
        RAISE EXCEPTION 'Access denied for permission % in tenant %', permission_code, auth_current_tenant_id()
            USING ERRCODE = '42501';
    END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- Row-level security for tenant isolation
-- -----------------------------------------------------------------------------

ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permission ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS role_tenant_isolation_policy ON role;
DROP POLICY IF EXISTS user_role_assignment_tenant_isolation_policy ON user_role_assignment;
DROP POLICY IF EXISTS role_permission_tenant_isolation_policy ON role_permission;

CREATE POLICY role_tenant_isolation_policy ON role
    USING (tenant_id = auth_current_tenant_id())
    WITH CHECK (tenant_id = auth_current_tenant_id());

CREATE POLICY user_role_assignment_tenant_isolation_policy ON user_role_assignment
    USING (tenant_id = auth_current_tenant_id())
    WITH CHECK (tenant_id = auth_current_tenant_id());

CREATE POLICY role_permission_tenant_isolation_policy ON role_permission
    USING (
        EXISTS (
            SELECT 1
            FROM role r
            WHERE r.id = role_permission.role_id
              AND r.tenant_id = auth_current_tenant_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM role r
            WHERE r.id = role_permission.role_id
              AND r.tenant_id = auth_current_tenant_id()
        )
    );
