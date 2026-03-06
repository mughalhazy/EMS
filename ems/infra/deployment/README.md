# Deployment Configuration Structure

This directory provides a baseline deployment layout for EMS across local, development, staging, and production environments.

## Structure

```text
deployment/
  environments/
    dev/.env.example
    staging/.env.example
    prod/.env.example
  helm/
    ems/
      Chart.yaml
      values.yaml
  kubernetes/
    base/
      kustomization.yaml
      namespace.yaml
      configmap.yaml
      secret-placeholder.yaml
      deployment.yaml
      service.yaml
    overlays/
      dev/kustomization.yaml
      staging/kustomization.yaml
      prod/kustomization.yaml
  scripts/
    README.md
```

## Notes

- `kubernetes/base` contains shared manifests for EMS workloads (namespace, config, secrets placeholder, deployment, service).
- `kubernetes/overlays/*` include environment-specific overrides for `APP_ENV`.
- `helm/ems` is available for teams preferring Helm-based releases.
- `environments/*/.env.example` files define expected environment variables per environment.
- `secret-placeholder.yaml` and Helm `secrets.placeholders` are intentionally non-production placeholders and should be replaced by managed secret-store integrations.

## Architecture alignment

The deployment layout aligns to the architecture stack described in `ems/docs/architecture.md`:

- Next.js frontend image path: `infra/docker/Dockerfile.frontend`
- NestJS backend image path: `infra/docker/Dockerfile.backend`
- PostgreSQL / Redis / Kafka / OpenSearch local stack: `docker-compose.yml`
- Environment overlays for dev/staging/prod and JSON logging + metrics + tracing toggles: `kubernetes/base/configmap.yaml` and overlays.
