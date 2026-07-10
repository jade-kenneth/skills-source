#!/usr/bin/env bash
# Symlinks all skills into ~/.claude/skills so every Claude Code session loads them.
# Supports both skills/<skill>/ and skills/<category>/<skill>/ layouts.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/../skills" && pwd)"
DEST="$HOME/.claude/skills"
mkdir -p "$DEST"

while IFS= read -r -d '' skill_file; do
  skill="$(dirname "$skill_file")"
  name="$(basename "$skill")"
  ln -sfn "$skill" "$DEST/$name"
  echo "linked: $name"
done < <(find "$SRC" -type f -name SKILL.md -print0)
