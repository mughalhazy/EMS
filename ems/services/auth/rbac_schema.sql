-- EMS Auth RBAC schema
-- Models: role, permission
-- Supporting relations: role_permission, user_role_assignment

CREATE TABLE IF NOT EXISTS role (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(64) NOT NULL,
    scope VARCHAR(32) NOT NULL CHECK (scope IN ('tenant', 'organization', 'event')),
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_role_tenant_name UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS permission (
    id BIGSERIAL PRIMARY KEY,
    resource VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    code VARCHAR(128) GENERATED ALWAYS AS (resource || ':' || action) STORED,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_permission_resource_action UNIQUE (resource, action),
    CONSTRAINT uq_permission_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS role_permission (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role
        FOREIGN KEY (role_id)
        REFERENCES role (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY (permission_id)
        REFERENCES permission (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_role_assignment (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    scope_type VARCHAR(32),
    scope_id BIGINT,
    assigned_by BIGINT,
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
    CONSTRAINT fk_user_role_assignment_role
        FOREIGN KEY (role_id)
        REFERENCES role (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_user_role_assignment_active
        UNIQUE (tenant_id, user_id, role_id, scope_type, scope_id, revoked_at)
);

CREATE INDEX IF NOT EXISTS idx_role_tenant_scope ON role (tenant_id, scope);
CREATE INDEX IF NOT EXISTS idx_permission_code ON permission (code);
CREATE INDEX IF NOT EXISTS idx_role_permission_permission ON role_permission (permission_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignment_lookup
    ON user_role_assignment (tenant_id, user_id, scope_type, scope_id)
    WHERE revoked_at IS NULL;
