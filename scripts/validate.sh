#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VALIDATOR="$ROOT/skills/skill-creator/scripts/quick_validate.py"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Checking script syntax"
node --check "$ROOT/scripts/build-agents-md.js"
node --check "$ROOT/scripts/validate-generated-agents.js"
node --check "$ROOT/skills/project-learning-contributor/scripts/proposal.mjs"
bash -n "$ROOT/scripts/install-global.sh" "$ROOT/scripts/setup-mcp.sh" "$0"

echo "Validating project-learning contribution commands"
test -f "$ROOT/commands/capture-project-learning.md"
test -f "$ROOT/commands/promote-project-learning.md"
grep -Fq "skill-contributions/" "$ROOT/commands/capture-project-learning.md"
grep -Fq "skills/" "$ROOT/commands/promote-project-learning.md"

echo "Validating canonical Claude Design preparation command"
PREPARE_DESIGN="$ROOT/commands/prepare-claude-design.md"
DESIGN_PROMPT_POINTER="$ROOT/prompts/claude-design-handoff.md"
test -f "$PREPARE_DESIGN"
test -f "$DESIGN_PROMPT_POINTER"
grep -Fq 'design/CLAUDE_DESIGN_PROMPT.md' "$PREPARE_DESIGN"
grep -Fq 'design/prototypes/' "$PREPARE_DESIGN"
grep -Fq 'design/system/' "$PREPARE_DESIGN"
grep -Fq 'design/planning/' "$PREPARE_DESIGN"
grep -Fq 'data-prototype-surface="mobile"' "$PREPARE_DESIGN"
grep -Fq 'data-app-root' "$PREPARE_DESIGN"
grep -Fq 'data-handoff="presentation-only"' "$PREPARE_DESIGN"
grep -Fq 'design/handoff/[PROJECT] Design Reference.md' "$PREPARE_DESIGN"
grep -Fq 'design/handoff/[PROJECT] Design Handoff Plan.md' "$PREPARE_DESIGN"
grep -Fq 'commands/prepare-claude-design.md' "$DESIGN_PROMPT_POINTER"
grep -Fq '/adapt-design-export <project name>' "$PREPARE_DESIGN"
grep -Fq 'design/design-release.json' "$PREPARE_DESIGN"
grep -Fq '/sync-build-docs <project name>' "$PREPARE_DESIGN"
if grep -Eqi 'ask the user to (provide|paste|enter).*(password|api key|token|connection string)' "$PREPARE_DESIGN"; then
  echo "prepare-claude-design must never request secrets." >&2
  exit 1
fi

echo "Validating existing Claude Design adaptation command"
ADAPT_DESIGN="$ROOT/commands/adapt-design-export.md"
test -f "$ADAPT_DESIGN"
grep -Fq 'design/CLAUDE_DESIGN_ADAPTATION_PROMPT.md' "$ADAPT_DESIGN"
grep -Fq 'data-prototype-surface="web"' "$ADAPT_DESIGN"
grep -Fq 'data-app-root' "$ADAPT_DESIGN"
grep -Fq 'data-preview-shell' "$ADAPT_DESIGN"
grep -Fq 'data-handoff="presentation-only"' "$ADAPT_DESIGN"
grep -Fq 'design/handoff/[PROJECT] Design Reference.md' "$ADAPT_DESIGN"
grep -Fq 'design/handoff/[PROJECT] Design Handoff Plan.md' "$ADAPT_DESIGN"
grep -Fq '/finalize-build-docs <project name>' "$ADAPT_DESIGN"
grep -Fq 'design/design-release.json' "$ADAPT_DESIGN"
grep -Fq '/sync-build-docs <project name>' "$ADAPT_DESIGN"
if grep -Eqi 'ask (the user|me) (to provide|for|to paste|to enter).*(password|api key|token|connection string)' "$ADAPT_DESIGN"; then
  echo "adapt-design-export must never request secrets." >&2
  exit 1
fi

echo "Validating incremental build-doc synchronization command"
SYNC_BUILD_DOCS="$ROOT/commands/sync-build-docs.md"
test -f "$SYNC_BUILD_DOCS"
grep -Fq 'design/design-release.json' "$SYNC_BUILD_DOCS"
grep -Fq 'design/design-sync.lock.json' "$SYNC_BUILD_DOCS"
grep -Fq 'readyForBuild' "$SYNC_BUILD_DOCS"
grep -Fq 'npm run design:validate' "$SYNC_BUILD_DOCS"
grep -Fq 'npm run design:ack' "$SYNC_BUILD_DOCS"
grep -Fq 'Product Specification.md' "$SYNC_BUILD_DOCS"
grep -Fq 'Implementation Plan.md' "$SYNC_BUILD_DOCS"
grep -Fq '/finalize-build-docs <project name>' "$SYNC_BUILD_DOCS"
grep -Fq 'prototype-only evidence' "$SYNC_BUILD_DOCS"
grep -Fq 'Production mapping' "$SYNC_BUILD_DOCS"

echo "Validating canonical design-request command"
GENERATE_DESIGN_REQUEST="$ROOT/commands/generate-design-request.md"
test -f "$GENERATE_DESIGN_REQUEST"
grep -Fq 'TASK_<project-slug>.md' "$GENERATE_DESIGN_REQUEST"
grep -Fq 'design/CLAUDE_DESIGN_REQUEST.md' "$GENERATE_DESIGN_REQUEST"
grep -Fq 'design/design-release.json' "$GENERATE_DESIGN_REQUEST"
grep -Fq 'design/design-sync.lock.json' "$GENERATE_DESIGN_REQUEST"
grep -Fq 'PROTOTYPE ONLY — MAP TO PRODUCTION ARCHITECTURE' "$GENERATE_DESIGN_REQUEST"
grep -Fq '/sync-build-docs <project name>' "$GENERATE_DESIGN_REQUEST"

echo "Validating canonical build-doc finalization command"
FINALIZE_BUILD_DOCS="$ROOT/commands/finalize-build-docs.md"
test -f "$FINALIZE_BUILD_DOCS"
grep -Fq 'design/prototypes/' "$FINALIZE_BUILD_DOCS"
grep -Fq 'Product Specification.md' "$FINALIZE_BUILD_DOCS"
grep -Fq 'Implementation Plan.md' "$FINALIZE_BUILD_DOCS"
grep -Fq 'design/handoff/[PROJECT] Design Reference.md' "$FINALIZE_BUILD_DOCS"
grep -Fq 'design/handoff/[PROJECT] Design Handoff Plan.md' "$FINALIZE_BUILD_DOCS"
grep -Fq 'Platform-aware fidelity mandate' "$FINALIZE_BUILD_DOCS"
grep -Fq 'data-app-root' "$FINALIZE_BUILD_DOCS"
grep -Fq '/adapt-design-export <project name>' "$FINALIZE_BUILD_DOCS"
grep -Fq '/sync-build-docs <project name>' "$FINALIZE_BUILD_DOCS"
grep -Fq '"status": "final"' "$FINALIZE_BUILD_DOCS"
grep -Fq 'npm run design:validate-final' "$FINALIZE_BUILD_DOCS"
grep -Fq 'No prototype runtime leakage' "$FINALIZE_BUILD_DOCS"
grep -Fq 'Prototype-to-production boundary' "$ROOT/scripts/build-agents-md.js"
grep -Fq 'must not ship prototype HTML in a WebView' "$ROOT/scripts/build-agents-md.js"
grep -Fq 'Never ask for, print, copy, or write the connection string or credentials.' "$FINALIZE_BUILD_DOCS"
if grep -Fq "port the prototype's markup + styles as the starting DOM" "$FINALIZE_BUILD_DOCS"; then
  echo "finalize-build-docs must preserve outcomes without forcing cross-platform markup copying." >&2
  exit 1
fi
if grep -Eq 'ask me for the exact connection string|mongodb\+srv://user:pass' "$FINALIZE_BUILD_DOCS"; then
  echo "finalize-build-docs must never request or embed database credentials." >&2
  exit 1
fi

echo "Validating project-task reconciliation contract"
GENERATE_PROJECT_TASKS="$ROOT/commands/generate-project-tasks.md"
test -f "$GENERATE_PROJECT_TASKS"
grep -Fq 'Classify every affected task on two axes' "$GENERATE_PROJECT_TASKS"
grep -Fq 'of the updated or newly added acceptance criteria has actually started' "$GENERATE_PROJECT_TASKS"
grep -Fq 'An older implementation may be useful historical evidence' "$GENERATE_PROJECT_TASKS"
grep -Fq 'A task may have one requirement classification and one blocker classification' "$GENERATE_PROJECT_TASKS"
grep -Fq 'git hash-object "Product Specification.md"' "$GENERATE_PROJECT_TASKS"
grep -Fq 'Previous reconciliation fingerprints:' "$GENERATE_PROJECT_TASKS"
grep -Fq 'Evidence/history:' "$GENERATE_PROJECT_TASKS"
grep -Fq 'Reconciliation: <preserved/reopened/added/revised/unblocked/superseded and why>' "$GENERATE_PROJECT_TASKS"
grep -Fq '## Reconciliation report' "$GENERATE_PROJECT_TASKS"
if grep -Fq 'existing implementation provides a valid starting point or work is already underway' "$GENERATE_PROJECT_TASKS"; then
  echo "generate-project-tasks must not infer in-progress work from an older implementation." >&2
  exit 1
fi

echo "Validating skills"
while IFS= read -r -d '' skill_file; do
  python3 "$VALIDATOR" "$(dirname "$skill_file")"
done < <(find "$ROOT/skills" -type f -name SKILL.md -print0)

echo "Validating eval JSON"
while IFS= read -r -d '' eval_file; do
  python3 -m json.tool "$eval_file" >/dev/null
done < <(find "$ROOT/skills" -path '*/evals/*.json' -type f -print0)

echo "Running project-learning-contributor self-test"
bash "$ROOT/skills/project-learning-contributor/scripts/selftest.sh" "$ROOT"

echo "Running project-learning-auditor self-test"
bash "$ROOT/skills/project-learning-auditor/scripts/selftest.sh" "$ROOT"

echo "Smoke-testing AGENTS.md generation"
SKILLS_SOURCE_SHA="0000000000000000000000000000000000000000" \
  node "$ROOT/scripts/build-agents-md.js" "$TEMP_DIR/AGENTS.md"
node "$ROOT/scripts/validate-generated-agents.js" "$TEMP_DIR/AGENTS.md" "$ROOT"
grep -Fq 'Source revision: `jade-kenneth/skills-source@0000000000000000000000000000000000000000`' \
  "$TEMP_DIR/AGENTS.md"
grep -Fq 'Automatic project context — no repeated user instruction required' "$TEMP_DIR/AGENTS.md"
grep -Fq 'The user does not need to repeat' "$TEMP_DIR/AGENTS.md"
grep -Fq '`Product Specification.md`' "$TEMP_DIR/AGENTS.md"
grep -Fq '`Implementation Plan.md`' "$TEMP_DIR/AGENTS.md"
if grep -Fq '.agents/skills/' "$ROOT/conventions/project-structure.md" "$TEMP_DIR/AGENTS.md"; then
  echo "Legacy .agents/skills/ path found; downstream snapshots live in .skills-source/." >&2
  exit 1
fi

echo "Smoke-testing isolated global installation"
HOME="$TEMP_DIR/home" bash "$ROOT/scripts/install-global.sh" >/dev/null
skill_count="$(find "$ROOT/skills" -type f -name SKILL.md | wc -l | tr -d ' ')"
command_count="$(find "$ROOT/commands" -maxdepth 1 -type f -name '*.md' | wc -l | tr -d ' ')"
installed_skills="$(find "$TEMP_DIR/home/.claude/skills" -type l | wc -l | tr -d ' ')"
installed_commands="$(find "$TEMP_DIR/home/.claude/commands" -type l | wc -l | tr -d ' ')"
test "$skill_count" = "$installed_skills"
test "$command_count" = "$installed_commands"

echo "Validation passed: $skill_count skills and $command_count commands"
