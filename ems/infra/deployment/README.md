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
    overlays/
      dev/kustomization.yaml
      staging/kustomization.yaml
      prod/kustomization.yaml
  scripts/
    README.md
```

## Notes

- `kubernetes/base` should contain shared manifests for EMS workloads.
- `kubernetes/overlays/*` should include environment-specific overrides.
- `helm/ems` is available for teams preferring Helm-based releases.
- `environments/*/.env.example` files define expected environment variables per environment.
- `scripts` is reserved for deployment automation helpers.
