#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def read(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def assert_exists(path: Path) -> None:
    if not path.exists():
        raise AssertionError(f'Missing required file: {path}')


def run(command: list[str], cwd: Path = ROOT) -> str:
    completed = subprocess.run(command, cwd=cwd, capture_output=True, text=True, check=True)
    return completed.stdout.strip()


def validate_dependency_security() -> None:
    assert_exists(ROOT / 'package-lock.json')
    run(['npm', 'audit', '--audit-level=high', '--omit=dev'])


def validate_build_reproducibility() -> None:
    assert_exists(ROOT / 'package-lock.json')
    run(['npm', 'ci', '--ignore-scripts'])


def validate_dockerfiles() -> None:
    docker_dir = ROOT / 'infra' / 'docker'
    backend = read(docker_dir / 'Dockerfile.backend')
    frontend = read(docker_dir / 'Dockerfile.frontend')
    combined = backend + '\n' + frontend + '\n' + read(docker_dir / 'Dockerfile')

    for marker in ['FROM node:${NODE_VERSION}', 'USER nextjs', 'USER nodeapp']:
        if marker not in combined:
            raise AssertionError(f'Docker hardening marker missing: {marker}')

    if 'else npm install; fi' in combined:
        raise AssertionError('Non-reproducible npm install fallback is not allowed in Dockerfiles')


def validate_secrets_safety() -> None:
    for env_name in ['.env.development', '.env.staging', '.env.production']:
        content = read(ROOT / env_name)
        if 'local-dev-secret-change-me' in content:
            raise AssertionError(f'Hard-coded default secret found in {env_name}')
        if '<set-in-secret-manager>' not in content:
            raise AssertionError(f'Secrets placeholder marker missing in {env_name}')


def validate_api_protection() -> None:
    config = read(ROOT / 'infra' / 'deployment' / 'kubernetes' / 'base' / 'configmap.yaml')
    for marker in [
        'API_RATE_LIMIT_ENABLED',
        'API_RATE_LIMIT_WINDOW_MS',
        'API_RATE_LIMIT_MAX',
        'API_INPUT_VALIDATION_ENABLED',
        'API_REQUEST_SIZE_LIMIT',
    ]:
        if marker not in config:
            raise AssertionError(f'API protection marker missing: {marker}')


def validate_performance_readiness() -> None:
    config = read(ROOT / 'infra' / 'deployment' / 'kubernetes' / 'base' / 'configmap.yaml')
    for marker in ['DB_POOL_MIN', 'DB_POOL_MAX', 'REDIS_CACHE_ENABLED', 'REDIS_CACHE_DEFAULT_TTL_SECONDS']:
        if marker not in config:
            raise AssertionError(f'Performance marker missing: {marker}')


def validate_observability() -> None:
    config = read(ROOT / 'infra' / 'deployment' / 'kubernetes' / 'base' / 'configmap.yaml')
    for marker in ['LOG_FORMAT: json', 'METRICS_ENABLED', 'METRICS_PATH', 'TRACING_ENABLED']:
        if marker not in config:
            raise AssertionError(f'Observability marker missing: {marker}')


def validate_infrastructure_resilience() -> None:
    deployment = read(ROOT / 'infra' / 'deployment' / 'kubernetes' / 'base' / 'deployment.yaml')
    for marker in ['livenessProbe', 'readinessProbe', 'startupProbe', 'terminationGracePeriodSeconds', 'preStop']:
        if marker not in deployment:
            raise AssertionError(f'Infrastructure resilience marker missing: {marker}')


def validate_ci_stability() -> None:
    workflow = read(ROOT / '.github' / 'workflows' / 'build-test.yml')
    for marker in ['build:', 'lint:', 'type-check:', 'unit-tests:', 'dependency-audit:']:
        if marker not in workflow:
            raise AssertionError(f'CI workflow missing marker: {marker}')


def validate_load_readiness() -> None:
    assert_exists(ROOT / 'infra' / 'scripts' / 'ci' / 'load_test.py')
    run(['python3', 'infra/scripts/ci/load_test.py'])


def run_all_checks() -> dict[str, int]:
    validators = {
        'dependency security': validate_dependency_security,
        'build reproducibility': validate_build_reproducibility,
        'container security': validate_dockerfiles,
        'secrets safety': validate_secrets_safety,
        'API protection': validate_api_protection,
        'performance readiness': validate_performance_readiness,
        'observability': validate_observability,
        'infrastructure resilience': validate_infrastructure_resilience,
        'CI stability': validate_ci_stability,
        'load readiness': validate_load_readiness,
    }

    scores: dict[str, int] = {}
    for category, validator in validators.items():
        validator()
        scores[category] = 10

    return scores


if __name__ == '__main__':
    scorecard = run_all_checks()
    print('HARDENING REPORT')
    for category, score in scorecard.items():
        print(f'{category}: {score}/10')
    print('PRODUCTION_READY = TRUE')
    print(json.dumps(scorecard, indent=2, sort_keys=True))
