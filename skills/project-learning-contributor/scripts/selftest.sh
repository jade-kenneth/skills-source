#!/usr/bin/env bash
set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

cp "$SKILL_ROOT/assets/example-proposal.json" "$TEMP_DIR/valid.json"
node "$SKILL_ROOT/scripts/proposal.mjs" validate --file "$TEMP_DIR/valid.json"
node "$SKILL_ROOT/scripts/proposal.mjs" render --file "$TEMP_DIR/valid.json" >"$TEMP_DIR/rendered.md"
grep -Fq 'Target skills:** `mobile-app`' "$TEMP_DIR/rendered.md"
sed 's/"mobile-app"/"not-a-real-skill"/' "$TEMP_DIR/valid.json" >"$TEMP_DIR/invalid.json"
if node "$SKILL_ROOT/scripts/proposal.mjs" validate --file "$TEMP_DIR/invalid.json" 2>/dev/null; then
  echo "Unknown target skill should fail validation." >&2
  exit 1
fi
echo "project-learning-contributor selftest passed"
