# Environment Configuration Management

EMS now supports environment-aware configuration with three runtime targets:

- `development`
- `staging`
- `production`

## How it works

`services/shared/src/environment-config.ts` provides a central `environmentConfig` singleton.

At startup, it:

1. Detects environment from `APP_ENV` (preferred) or `NODE_ENV`.
2. Falls back to `development` when an unsupported value is provided.
3. Loads `.env` and then `.env.<environment>` from the repository root.
4. Keeps already-defined process env vars unchanged (real env always wins over files).

## API

Use the config singleton instead of reading `process.env` directly:

- `environmentConfig.environment`
- `environmentConfig.isDevelopment`
- `environmentConfig.isStaging`
- `environmentConfig.isProduction`
- `environmentConfig.get(key)`
- `environmentConfig.getOrDefault(key, fallback)`
- `environmentConfig.getBoolean(key, fallback?)`

## Env files

Templates are included at the repo root:

- `.env.development`
- `.env.staging`
- `.env.production`

You can run services in a specific environment by setting `APP_ENV`:

```bash
APP_ENV=staging node dist/main.js
```

Or by setting `NODE_ENV` if `APP_ENV` is omitted:

```bash
NODE_ENV=production node dist/main.js
```

## Notes

- Keep secrets out of source control in real deployments.
- Supply production secrets using your deployment platform secret manager.
