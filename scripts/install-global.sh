#!/usr/bin/env bash
# Symlinks all skills and commands into ~/.claude so Claude Code loads them.
# Supports both skills/<skill>/ and skills/<category>/<skill>/ layouts.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_SRC="$ROOT/skills"
SKILLS_DEST="$HOME/.claude/skills"
COMMANDS_SRC="$ROOT/commands"
COMMANDS_DEST="$HOME/.claude/commands"
mkdir -p "$SKILLS_DEST" "$COMMANDS_DEST"

while IFS= read -r -d '' skill_file; do
  skill="$(dirname "$skill_file")"
  name="$(basename "$skill")"
  ln -sfn "$skill" "$SKILLS_DEST/$name"
  echo "linked skill: $name"
done < <(find "$SKILLS_SRC" -type f -name SKILL.md -print0)

while IFS= read -r -d '' command_file; do
  name="$(basename "$command_file")"
  ln -sfn "$command_file" "$COMMANDS_DEST/$name"
  echo "linked command: $name"
done < <(find "$COMMANDS_SRC" -maxdepth 1 -type f -name '*.md' -print0)
