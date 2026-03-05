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
