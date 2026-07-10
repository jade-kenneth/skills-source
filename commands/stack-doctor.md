---
description: Verify the whole agent stack is wired correctly — skills, commands, MCP servers, boilerplate consumer files, Notion state layer, design pipeline. Read-only; fixes nothing without asking.
---

# /stack-doctor — full stack wiring check

You are diagnosing my agent-stack setup. Run every check below, **read-only** — report problems and the exact fix command, but change nothing unless I say so. Output a single checklist at the end: ✓ pass / ✗ fail (with fix) / – not applicable here.

## 1. Global installs (machine level)

- [ ] `~/.claude/skills/` exists and contains symlinks into skills-source (not copies — check with `ls -la`). List the skill names found.
- [ ] `~/.claude/commands/` contains at least `gen-build-docs.md` and `notion-setup.md`, symlinked.
- [ ] Broken symlinks check: flag any link whose target no longer exists (skills-source moved/renamed).
- Fix for any of the above: `./scripts/install-global.sh` in skills-source.

## 2. MCP servers

- [ ] Run `claude mcp list` — confirm `notion` and `claude-design` are registered at user scope.
- [ ] Probe Notion: attempt a lightweight search for the "Ops HQ" page. If it fails with an auth error, the fix is re-authenticating (first-use OAuth).
- [ ] Probe Claude Design: confirm the server's tools are available. Don't create or modify any design project.
- Fix: `./scripts/setup-mcp.sh` in skills-source, then authenticate on first use.

## 3. Current repo (skip section with "–" if not inside a project repo)

- [ ] `CLAUDE.md` exists and mentions: conventions/AGENTS.md, task-file workflow, the Notion status-update instruction, and the design/prototypes rules.
- [ ] `AGENTS.md` exists, starts with the "generated from skills-source" header, and is committed (not gitignored).
- [ ] `.skills-source/` exists (synced) and IS gitignored; `.skills-source/.pinned-sha` present — report the pinned short SHA and whether it's behind skills-source main.
- [ ] `design/prototypes/` exists. If it has files, confirm they follow the `screen--*.html` / `logo--*.html` convention and are committed; flag any untracked prototype files (uncommitted contract = QA checklist has no frozen target).
- [ ] If `[PROJECT]Reference.md` + Task Plan exist: spot-check the pairing — companion-doc headers present, and every `screen--*.html` has a matching §3/§4 subsection. Report missing pairs.
- Fix for stale sync: `npm run sync-skills`. Fix for missing docs: `/gen-build-docs [ProjectName]`.

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
