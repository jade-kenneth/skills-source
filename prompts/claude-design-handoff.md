# Claude Design handoff prompt

Canonical workflow: `commands/prepare-claude-design.md`.

In Claude Code, run `/prepare-claude-design <project name>`. It asks whether
Claude Design will be used, gathers the product brief, and writes the reusable,
copy-ready prompt to `design/CLAUDE_DESIGN_PROMPT.md`. Paste that generated file
into Claude Design, then import the completed export before running
`/sync-build-docs`. `/finalize-build-docs` is the closing completeness gate, not
the entry point.

When the Claude Design process is not used, run
`/prepare-claude-design <project name> --prompt-only`. It skips only the
prototypes: it writes the planning, system, and handoff documents, the root build
docs, and the task file, then implements the UI directly in the repository.

When tasks later block on missing designs, run
`/generate-design-request <project name>`. It follows the mode recorded in the
prompt: a copy-ready request for Claude Design, or, in prompt-only mode, specs
written directly into the design documents.
