---
description: Verify the whole agent stack is wired correctly — skills, commands, MCP servers, boilerplate consumer files, Notion state layer, design pipeline. Read-only; fixes nothing without asking.
---

# /stack-doctor — full stack wiring check

You are diagnosing my agent-stack setup. Run every check below, **read-only** — report problems and the exact fix command, but change nothing unless I say so. Output a single checklist at the end: ✓ pass / ✗ fail (with fix) / – not applicable here.

## 1. Global installs (machine level)

- [ ] `~/.claude/skills/` exists and contains symlinks into skills-source (not copies — check with `ls -la`). List the skill names found.
- [ ] `~/.claude/commands/` contains the current command set, symlinked: `prepare-claude-design.md`, `adapt-design-export.md`, `sync-build-docs.md`, `finalize-build-docs.md`, `generate-design-request.md`, `generate-project-tasks.md`, `capture-project-learning.md`, `promote-project-learning.md`, `notion-setup.md`, `stack-doctor.md`. A link named `gen-build-docs.md` is **stale** — that command was replaced by `sync-build-docs` (incremental) plus `finalize-build-docs` (final gate); report it as ✗ and remove it.
- [ ] The skills include the coordinator set: `fix-and-enhance` plus its companions (`web-app`, `mobile-app`, `api-app`) — flag any missing.
- [ ] **Skill hygiene** (matters most for AI-created skills): every skill folder has a `SKILL.md` whose frontmatter contains a `name` and a non-empty `description` that states _when_ to use it. A missing or vague description = the skill silently never triggers — report it as ✗ with the file path.
- [ ] Broken symlinks check: flag any link whose target no longer exists (skills-source moved/renamed).
- Fix for any of the above: `./scripts/install-global.sh` in skills-source.

## 2. MCP servers

- [ ] Run `claude mcp list` — confirm `notion` and `claude-design` are registered at user scope.
- [ ] Probe Notion: attempt a lightweight search for the "Ops HQ" page. If it fails with an auth error, the fix is re-authenticating (first-use OAuth).
- [ ] Probe Claude Design: confirm the server's tools are available. Don't create or modify any design project.
- [ ] If the repo declares its own servers (`.mcp.json`, `opencode.json`), confirm each one resolves — a declared server whose command is not installed is a ✗ with the install command as the fix.
- Fix: `./scripts/setup-mcp.sh` in skills-source, then authenticate on first use.

## 3. Current repo — instruction layer (skip section with "–" if not inside a project repo)

- [ ] `CLAUDE.md` exists and carries the current role design: the **"PLANNER + REVIEWER, not builder"** block (review finished phases against the root `Product Specification.md`, run the Fidelity QA gate per screen against `design/prototypes/`, sync phase status to Notion; do not implement unless asked), the progress-flow rule (Codex writes checkboxes, Claude Code writes Notion), and the design/ rules with the conflict order. An old-style CLAUDE.md that tells Claude Code to build and update Notion after phases is a ✗, not a pass.
- [ ] `CLAUDE.md` names the **skills-source repository** (the pointer `fix-and-enhance` uses for durable rule updates) and describes the lock workflow (`sync-skills` / `update-skills` / `check-skills`). Missing pointer or dead path = ✗ (durable updates will stall on guessing).
- [ ] `CLAUDE.md` references only commands that exist in `.skills-source/commands/`. Any `/gen-build-docs` reference is stale. Any instruction to run `npm run design:validate` before `/finalize-build-docs` is stale — finalization requires `npm run design:validate-final`.
- [ ] `AGENTS.md` exists, is committed (not gitignored), and opens as the **execution contract**: the "You are the EXECUTOR" preamble, the automatic read-order (root `Product Specification.md` → root `Implementation Plan.md` → this file), and the Non-negotiables (conflict order, Fidelity gate, prototype `data-app-root` boundary, platform-native conversion, reuse-not-rebuild, checkbox protocol). **Pointer-style is valid**: skills listed as a routed index (description + `.skills-source/...` path) pass, PROVIDED `.skills-source/` is present in the repo so the pointers resolve — pointer-style with a missing `.skills-source/` is a ✗ (the executor's rules point at nothing; fix: `npm run sync-skills`). A headerless AGENTS.md (no contract preamble) is a ✗ regardless of style.
- [ ] `AGENTS.md` is generated, not hand-edited: `npm run check-skills` passes. A failure here means someone edited generated output or the lock and `AGENTS.md` disagree.
- [ ] If per-app split is in use (`apps/*/AGENTS.md` exist): each is generated (not hand-edited) and the root one still carries the coordinator rules (`fix-and-enhance`).
- [ ] `package.json` has BOTH `"sync-skills"` and a `"postinstall"` that runs it — postinstall missing = fresh clones start stale.
- [ ] `.github/workflows/skills-drift.yml` exists (the CI check that fails pushes with a stale AGENTS.md). Missing = drift is possible silently; report as a warning if the repo has no CI at all.
- [ ] `.skills-source/` exists (synced) and IS gitignored; `.skills-source/.pinned-sha` present — report the pinned short SHA, the SHA in `skills-source.lock.json`, and whether the lock is behind skills-source `main`. Fix for a behind lock: `npm run update-skills -- --sha <full-sha>` then `npm run check-skills`.
- [ ] `.claude/commands/*.md` wrappers each delegate to an existing `.skills-source/commands/<name>.md` — a wrapper that inlines its own build-doc format instead of delegating is a ✗ (two editable copies drift). `npm run check-skills` enforces this.
- [ ] Skills are reachable by Claude Code in **this repo**, not just via the machine-level install: either `.claude/skills/` resolves to the locked snapshot, or the session is expected to read `.skills-source/skills/<name>/SKILL.md` by path. If neither holds, report it as a warning — a fresh clone, a CI run, or a web session gets no skills.

## 4. Current repo — design pipeline

- [ ] `design/` has all three subfolders (`prototypes/`, `system/`, `planning/`), plus `handoff/` once Claude Design has exported. Report which contain files. An empty `design/` in a fresh boilerplate clone is `–`, not ✗.
- [ ] Prototype files are **committed** and follow a supported name: `screen--<name>.html` / `logo--<name>.html`, **or** Design Component exports named `<Screen Name>.dc.html`. Both forms are valid screen contracts — never flag a `*.dc.html` file as misnamed. Flag any untracked file under `design/` (uncommitted contract = the Fidelity QA "side-by-side" check has no frozen target). Flag `design/` being gitignored as a critical error.
- [ ] Each delivered prototype declares exactly one `data-app-root` and one supported `data-prototype-surface`; preview shells, device frames, and `data-handoff="presentation-only"` blocks sit outside that boundary. A prototype with zero or multiple `data-app-root` elements is a ✗ (the production boundary is ambiguous).
- [ ] `design/handoff/` holds exactly one `[PROJECT] Design Reference.md` and exactly one `[PROJECT] Design Handoff Plan.md`. Zero or multiple = ✗; fix with `/adapt-design-export <project name>` when prototypes already exist, `/prepare-claude-design <project name>` when design has not started.
- [ ] `design/planning/screen-inventory.md` exists once any release has shipped — it carries per-screen status and is required for incremental releases.
- [ ] `design/design-release.json` exists and validates: `npm run design:validate`. Report `releaseId`, `batch`, `revision`, `status` (`incremental` or `final`), and the `readyForBuild` count.
- [ ] `design/design-sync.lock.json` is **repository-owned**. It is written by `npm run design:ack`, never by Claude Design. If its batch/revision is behind `design-release.json`, the release is unreconciled — fix with `/sync-build-docs <project name>`.
- [ ] Sanity: `design/prototypes/` non-empty while `design/system/` is empty is a warning (Product Specification §1 will be inferred, not exported).

## 5. Current repo — build documents and task tracker

- [ ] Root `Product Specification.md` and `Implementation Plan.md` exist at the repository root — not under `design/handoff/`, not nested, not duplicated. The `design/handoff/` documents are the **export inputs**; the root pair is canonical. Competing copies are a ✗.
- [ ] `Implementation Plan.md` opens with the **"Executor: Codex"** header block and uses the `[ ]` / `[~]` / `[x]` phase protocol, and ends with the **Fidelity QA checklist**. A plan with no QA checklist cannot gate a phase.
- [ ] Pairing spot-check: every prototype file (`screen--*.html` and `*.dc.html`) has a matching §3/§4 subsection in `Product Specification.md`, and each screen subsection ends with its **"Production mapping (Phase N)"** table and one-line fidelity check. Report missing pairs in both directions — a prototype with no section, and a section with no prototype.
- [ ] Exactly one root `TASK_<project-slug>.md` when the task tracker is in use, carrying the reconciliation fingerprint block for `Product Specification.md` and `Implementation Plan.md`. Multiple task files, or a fingerprint that no longer matches `git hash-object` on either document, means the tracker is stale — fix with `/generate-project-tasks <project name>`.
- [ ] Fix for missing build docs: `/sync-build-docs <project name>` for the first or any partial release; `/finalize-build-docs <project name>` **only** once Claude Design marks the release `final`. Finalization is not the first-build gate.

## 6. Current repo — boilerplate consumer wiring

- [ ] `boilerplate.lock.json` exists and is initialized (`reviewedThroughSha` non-null). In a product repo, null = ✗, fix with `npm run boilerplate:setup`. **In app-boilerplate itself null is correct** — it is the upstream and tracks nothing; report `–`. The sync scripts detect this by comparing `git remote get-url origin` against `lock.repository`, so an origin that does not normalize to the lock value (a fork, a mirror, a proxied clone) makes the upstream repo look like a consumer and the lock guard throws instead of skipping. If `boilerplate:check` reports an uninitialized lock, confirm the origin URL before treating it as a real failure.
- [ ] `.github/CODEOWNERS` matches `foundationPaths` in `boilerplate-sync.config.json`. Compare the two lists literally and report any path protected in one but not the other — CODEOWNERS states this invariant in its own header, and nothing in CI enforces it.
- [ ] `skill-contributions/*.json`, when present, each validate: `npm run skills:contribution:validate -- --file <path>`. Report any proposal that carries product identity, credentials, or raw logs as a ✗ regardless of schema validity.
- Fix for foundation surface drift: `npm run boilerplate:contributions` (advisory classifier) and `npm run boilerplate:foundation-drift` (against the reviewed revision).

## 7. Notion state layer

- [ ] "Ops HQ" page, "Projects" and "Pipeline Items" databases exist with the expected key properties (Status selects, Kind, Payload/Result, relation Projects↔Pipeline Items) and the **Queue** + **Blocked on me** views.
- [ ] If inside a project repo: a Projects row exists whose Repo matches this repo's git remote. Report its Status, and whether it agrees with the `[~]`/`[x]` phase state in `Implementation Plan.md`. Notion is written during planning/review sessions only — the executor never edits it.
- Fix: `/notion-setup` (workspace) or `/notion-setup [ProjectName]` (register this project).

## 8. Report format

End with:

1. The checklist (grouped by section, ✓/✗/–).
2. **Fix queue** — the exact commands to run, in order, for every ✗.
3. One-line verdict: "Stack healthy" / "N issues — fix queue above."

Do not attempt any fix yourself unless I explicitly approve after seeing the report.
