# Claude Design handoff prompt

Canonical workflow: `commands/prepare-claude-design.md`.

In Claude Code, run `/prepare-claude-design <project name>`. It gathers the product
brief and writes the reusable, copy-ready prompt to
`design/CLAUDE_DESIGN_PROMPT.md`. Paste that generated file into Claude Design,
then import the completed export before running `/gen-build-docs`.
