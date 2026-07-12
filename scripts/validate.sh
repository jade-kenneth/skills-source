#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VALIDATOR="$ROOT/skills/skill-creator/scripts/quick_validate.py"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Checking script syntax"
node --check "$ROOT/scripts/build-agents-md.js"
node --check "$ROOT/scripts/validate-generated-agents.js"
bash -n "$ROOT/scripts/install-global.sh" "$ROOT/scripts/setup-mcp.sh" "$0"

echo "Validating skills"
while IFS= read -r -d '' skill_file; do
  python3 "$VALIDATOR" "$(dirname "$skill_file")"
done < <(find "$ROOT/skills" -type f -name SKILL.md -print0)

echo "Validating eval JSON"
while IFS= read -r -d '' eval_file; do
  python3 -m json.tool "$eval_file" >/dev/null
done < <(find "$ROOT/skills" -path '*/evals/*.json' -type f -print0)

echo "Running project-learning-auditor self-test"
bash "$ROOT/skills/project-learning-auditor/scripts/selftest.sh" "$ROOT"

echo "Smoke-testing AGENTS.md generation"
SKILLS_SOURCE_SHA="0000000000000000000000000000000000000000" \
  node "$ROOT/scripts/build-agents-md.js" "$TEMP_DIR/AGENTS.md"
node "$ROOT/scripts/validate-generated-agents.js" "$TEMP_DIR/AGENTS.md" "$ROOT"
grep -Fq 'Source revision: `jade-kenneth/skills-source@0000000000000000000000000000000000000000`' \
  "$TEMP_DIR/AGENTS.md"

echo "Smoke-testing isolated global installation"
HOME="$TEMP_DIR/home" bash "$ROOT/scripts/install-global.sh" >/dev/null
skill_count="$(find "$ROOT/skills" -type f -name SKILL.md | wc -l | tr -d ' ')"
command_count="$(find "$ROOT/commands" -maxdepth 1 -type f -name '*.md' | wc -l | tr -d ' ')"
installed_skills="$(find "$TEMP_DIR/home/.claude/skills" -type l | wc -l | tr -d ' ')"
installed_commands="$(find "$TEMP_DIR/home/.claude/commands" -type l | wc -l | tr -d ' ')"
test "$skill_count" = "$installed_skills"
test "$command_count" = "$installed_commands"

echo "Validation passed: $skill_count skills and $command_count commands"
