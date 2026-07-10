#!/usr/bin/env bash
# Symlinks all skills into ~/.claude/skills so every Claude Code session loads them.
set -e
SRC="$(cd "$(dirname "$0")/../skills" && pwd)"
DEST="$HOME/.claude/skills"
mkdir -p "$DEST"
for category in "$SRC"/*/; do
  for skill in "$category"*/; do
    name="$(basename "$skill")"
    ln -sfn "$skill" "$DEST/$name"
    echo "linked: $name"
  done
done