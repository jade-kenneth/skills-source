#!/usr/bin/env bash
# setup-mcp.sh — registers the stack's MCP servers with Claude Code (user scope = every repo).
# Idempotent: re-adding an existing server just updates it. Run once per machine, re-run anytime.
set -e

echo "== Registering MCP servers (user scope) =="

# Notion — state layer (Projects / Pipeline Items status updates)
claude mcp add --scope user --transport http notion https://mcp.notion.com/mcp \
  && echo "✓ notion"

# Claude Design — design round-trip (/design pull, /design-sync push)
claude mcp add --scope user --transport http claude-design https://api.anthropic.com/v1/design/mcp \
  && echo "✓ claude-design"

echo ""
echo "== Current MCP servers =="
claude mcp list

echo ""
echo "Done. First use of each server will trigger OAuth in Claude Code."
echo "Verify the full stack anytime with: /stack-doctor"