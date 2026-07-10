#!/usr/bin/env bash
# setup-mcp.sh — registers the stack's MCP servers with Claude Code (user scope = every repo).
# Idempotent and failure-tolerant: a server that's already registered or errors won't stop the rest.
# If this script misbehaves, check: CRLF line endings (fix: sed -i 's/\r$//' setup-mcp.sh)
# and PATH (claude installed via nvm isn't visible to non-interactive shells).

command -v claude >/dev/null 2>&1 || {
  echo "✗ 'claude' not found on PATH in this shell."
  echo "  If Claude Code works in your terminal normally, run:  bash -i $0"
  echo "  (nvm-based installs only set PATH in interactive shells)"
  exit 1
}

add_server() {
  local name="$1" url="$2"
  if claude mcp add --scope user --transport http "$name" "$url"; then
    echo "✓ $name"
  else
    echo "⚠ $name — add command returned non-zero (may already exist, or see error above)"
  fi
}

echo "== Registering MCP servers (user scope) =="
add_server notion        https://mcp.notion.com/mcp
add_server claude-design https://api.anthropic.com/v1/design/mcp

echo ""
echo "== Current MCP servers =="
claude mcp list || true

echo ""
echo "Done. First use of each server triggers OAuth — run /mcp inside Claude Code to authenticate."
echo "Verify the full stack anytime with: /stack-doctor"