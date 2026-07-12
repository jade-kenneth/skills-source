---
description: Verify the whole agent stack is wired correctly — skills, commands, MCP servers, boilerplate consumer files, Notion state layer, design pipeline. Read-only; fixes nothing without asking.
---

# /stack-doctor — full stack wiring check

You are diagnosing my agent-stack setup. Run every check below, **read-only** — report problems and the exact fix command, but change nothing unless I say so. Output a single checklist at the end: ✓ pass / ✗ fail (with fix) / – not applicable here.

## 1. Global installs (machine level)

- [ ] `~/.claude/skills/` exists and contains symlinks into skills-source (not copies — check with `ls -la`). List the skill names found.
- [ ] `~/.claude/commands/` contains at least `gen-build-docs.md`, `notion-setup.md`, and `stack-doctor.md`, symlinked.
- [ ] The skills include the coordinator set: `fix-and-enhance` plus its companions (`web-app`, `mobile-app`, `api-app`) — flag any missing.
- [ ] **Skill hygiene** (matters most for AI-created skills): every skill folder has a `SKILL.md` whose frontmatter contains a `name` and a non-empty `description` that states _when_ to use it. A missing or vague description = the skill silently never triggers — report it as ✗ with the file path.
- [ ] Broken symlinks check: flag any link whose target no longer exists (skills-source moved/renamed).
- Fix for any of the above: `./scripts/install-global.sh` in skills-source.

## 2. MCP servers

- [ ] Run `claude mcp list` — confirm `notion` and `claude-design` are registered at user scope.
- [ ] Probe Notion: attempt a lightweight search for the "Ops HQ" page. If it fails with an auth error, the fix is re-authenticating (first-use OAuth).
- [ ] Probe Claude Design: confirm the server's tools are available. Don't create or modify any design project.
- Fix: `./scripts/setup-mcp.sh` in skills-source, then authenticate on first use.

## 3. Current repo (skip section with "–" if not inside a project repo)

- [ ] `CLAUDE.md` exists and carries the current role design: the **"PLANNER + REVIEWER, not builder"** block (review against Reference, Fidelity QA gate, sync phase status to Notion; do not implement unless asked), the progress-flow rule (Codex writes checkboxes, Claude Code writes Notion), and the design/ rules with the conflict order. An old-style CLAUDE.md that tells Claude Code to build and update Notion after phases is a ✗, not a pass.
- [ ] `CLAUDE.md` names the **skills-source path** (the line `fix-and-enhance` uses for durable rule updates) — and that path exists on this machine. Missing line or dead path = ✗ (durable updates will stall on guessing).
- [ ] `AGENTS.md` exists, is committed (not gitignored), and opens as the **execution contract**: the "You are the EXECUTOR" preamble, the read-order (Reference → Task Plan → this file), and the Non-negotiables (conflict order, Fidelity gate, reuse-not-rebuild, checkbox protocol). A summaries-only or headerless AGENTS.md is a ✗ — the executor is missing its rules.
- [ ] If per-app split is in use (`apps/*/AGENTS.md` exist): each is generated (not hand-edited) and the root one still carries the coordinator rules (`fix-and-enhance`).
- [ ] `package.json` has BOTH `"sync-skills"` and a `"postinstall"` that runs it — postinstall missing = fresh clones start stale.
- [ ] `.github/workflows/skills-drift.yml` exists (the CI check that fails pushes with a stale AGENTS.md). Missing = drift is possible silently; report as a warning if the repo has no CI at all.
- [ ] `.skills-source/` exists (synced) and IS gitignored; `.skills-source/.pinned-sha` present — report the pinned short SHA and whether it's behind skills-source main.
- [ ] `design/` has all three subfolders (`prototypes/`, `system/`, `planning/`). Report which contain files.
- [ ] Prototype files follow the `screen--*.html` / `logo--*.html` convention and are **committed** — flag any untracked file under `design/` (uncommitted contract = the Fidelity QA "side-by-side" check has no frozen target). Flag `design/` being gitignored as a critical error.
- [ ] Sanity: `design/prototypes/` non-empty while `design/system/` is empty is a warning (Reference §1 will be inferred, not exported).
- [ ] If `[PROJECT]Reference.md` + Task Plan exist: spot-check the pairing — companion-doc headers present, the Task Plan opens with the **"Executor: Codex"** header block, and every `screen--*.html` has a matching §3/§4 subsection. Report missing pairs.
- Fix for stale sync: `npm run sync-skills`. Fix for missing docs: `/gen-build-docs [ProjectName]`. Fix for old-style CLAUDE.md / missing workflows: copy the current blocks from the boilerplate (Phase 4 of task_agent_stack.md).

## 4. Notion state layer

- [ ] "Ops HQ" page, "Projects" and "Pipeline Items" databases exist with the expected key properties (Status selects, Kind, Payload/Result, relation Projects↔Pipeline Items) and the **Queue** + **Blocked on me** views.
- [ ] If inside a project repo: a Projects row exists whose Repo matches this repo's git remote. Report its Status.
- Fix: `/notion-setup` (workspace) or `/notion-setup [ProjectName]` (register this project).

## 5. Report format

End with:

1. The checklist (grouped by section, ✓/✗/–).
2. **Fix queue** — the exact commands to run, in order, for every ✗.
3. One-line verdict: "Stack healthy" / "N issues — fix queue above."

Do not attempt any fix yourself unless I explicitly approve after seeing the report.
