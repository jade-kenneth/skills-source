# Claude Design handoff prompt

Canonical workflow: `commands/prepare-claude-design.md`.

In Claude Code, run `/prepare-claude-design <project name>`. It asks whether
Claude Design will be used, gathers the product brief, and writes the reusable,
copy-ready prompt to `design/CLAUDE_DESIGN_PROMPT.md`. Paste that generated file
into Claude Design, then import the completed export before running
`/sync-build-docs`. `/finalize-build-docs` is the closing completeness gate, not
the entry point.

When the Claude Design process is not used, run
`/prepare-claude-design <project name> --prompt-only`. It writes the same prompt,
then carries it out in Claude Code to generate the `design/` export locally under
the same contract.
