#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def assert_exists(path: Path) -> None:
    if not path.exists():
        raise AssertionError(f"Missing required file: {path}")


def validate_dockerfiles() -> None:
    docker_dir = ROOT / "infra" / "docker"
    assert_exists(docker_dir / "Dockerfile")
    assert_exists(docker_dir / "Dockerfile.frontend")
    assert_exists(docker_dir / "Dockerfile.backend")


def validate_compose_stack() -> None:
    compose = read(ROOT / "docker-compose.yml")
    for service in ["postgres:", "redis:", "kafka:", "opensearch:"]:
        if service not in compose:
            raise AssertionError(f"docker-compose missing service: {service}")


def validate_ci_workflow() -> None:
    workflow = read(ROOT / ".github" / "workflows" / "build-test.yml")
    required_markers = [
        "build:",
        "lint:",
        "type-check:",
        "unit-tests:",
        "ems/infra/scripts/ci/build.sh",
        "ems/infra/scripts/ci/lint.sh",
        "ems/infra/scripts/ci/type-check.sh",
        "ems/infra/scripts/ci/test.sh",
    ]
    for marker in required_markers:
        if marker not in workflow:
            raise AssertionError(f"CI workflow missing marker: {marker}")


def validate_environments() -> None:
    env_files = {
        "dev": ROOT / "infra" / "deployment" / "environments" / "dev" / ".env.example",
        "staging": ROOT / "infra" / "deployment" / "environments" / "staging" / ".env.example",
        "prod": ROOT / "infra" / "deployment" / "environments" / "prod" / ".env.example",
    }
    for env_name, path in env_files.items():
        content = read(path)
        if "NODE_ENV=" not in content:
            raise AssertionError(f"{env_name} env missing NODE_ENV")


def validate_kubernetes_structure() -> None:
    base = ROOT / "infra" / "deployment" / "kubernetes" / "base"
    for file_name in ["kustomization.yaml", "namespace.yaml", "configmap.yaml", "secret-placeholder.yaml", "deployment.yaml", "service.yaml"]:
        assert_exists(base / file_name)

    for overlay in ["dev", "staging", "prod"]:
        content = read(ROOT / "infra" / "deployment" / "kubernetes" / "overlays" / overlay / "kustomization.yaml")
        if "../../base" not in content:
            raise AssertionError(f"Overlay {overlay} does not include base")


def validate_observability_and_secrets() -> None:
    configmap = read(ROOT / "infra" / "deployment" / "kubernetes" / "base" / "configmap.yaml")
    for marker in ["LOG_FORMAT: json", "METRICS_ENABLED", "TRACING_ENABLED"]:
        if marker not in configmap:
            raise AssertionError(f"ConfigMap missing observability marker: {marker}")

    secret = read(ROOT / "infra" / "deployment" / "kubernetes" / "base" / "secret-placeholder.yaml")
    if "<set-in-secret-manager>" not in secret:
        raise AssertionError("Secrets placeholder marker missing")


def run_all_checks() -> None:
    validate_dockerfiles()
    validate_compose_stack()
    validate_ci_workflow()
    validate_environments()
    validate_kubernetes_structure()
    validate_observability_and_secrets()


if __name__ == "__main__":
    run_all_checks()
    print("QC validator checks passed.")
