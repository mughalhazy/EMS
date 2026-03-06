#!/usr/bin/env bash
set -euo pipefail

if rg -n "\t" ems/infra ems/.github/workflows >/dev/null; then
  echo "Tab characters detected in infra/workflow YAML or scripts."
  exit 1
fi

if rg -n "[[:blank:]]+$" ems/infra ems/.github/workflows >/dev/null; then
  echo "Trailing whitespace detected in infra/workflow files."
  exit 1
fi

echo "Lint checks passed."
