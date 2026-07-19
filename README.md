# Skills Sources

Canonical source repository for reusable agent skills, engineering conventions,
commands, prompts, and the generated `AGENTS.md` execution contract used by
downstream projects.

## Repository map

| Path | Purpose |
| --- | --- |
| `skills/` | Triggerable skills with routed references, scripts, assets, and evals |
| `conventions/` | Cross-project rules embedded into generated `AGENTS.md` files |
| `commands/` | Claude Code slash commands installed globally by the install script |
| `prompts/` | Small compatibility wrappers that point to canonical commands or skills |
| `scripts/` | Installation, MCP setup, generation, and validation utilities |

Treat `skills/*/SKILL.md`, `commands/*.md`, and `conventions/*.md` as canonical.
Keep files under `prompts/` short; they should route to a canonical source rather
than duplicate it.

## Install

Run once per machine:

```bash
chmod +x scripts/install-global.sh scripts/setup-mcp.sh scripts/validate.sh
./scripts/install-global.sh
./scripts/setup-mcp.sh
```

`install-global.sh` symlinks skills and commands into `~/.claude/`, so edits in
this repository are picked up without copying files. `setup-mcp.sh` registers the
Notion and Claude Design MCP servers and may open their OAuth flows.

## Generate a downstream AGENTS.md

```bash
SKILLS_SOURCE_SHA="$(git rev-parse HEAD)" \
  node scripts/build-agents-md.js /path/to/project/AGENTS.md
```

The generated document embeds every convention, records the source revision, and
adds a routed index pointing to full skill instructions under the downstream
project's `.skills-source/` snapshot. Consumer projects hydrate that snapshot from
a committed lock file so normal installs and CI use the same reviewed revision.

## Prepare the Claude Design prompt

Before design work begins, run the canonical Claude Code command:

```text
/prepare-claude-design <project name>
```

It gathers the product brief and writes a copy-ready
`design/CLAUDE_DESIGN_PROMPT.md`. Paste that file into Claude Design, complete the
design, and import the export under `design/prototypes/`, `design/system/`, and
`design/planning/`, including
`design/handoff/[PROJECT] Design Reference.md` and
`design/handoff/[PROJECT] Design Handoff Plan.md`. The compatibility pointer is
`prompts/claude-design-handoff.md`; the full workflow remains canonical under
`commands/`.

## Adapt an existing Claude Design export

If screens were already designed before the current handoff contract—either
still inside Claude Design or already exported—run:

```text
/adapt-design-export <project name>
```

It writes `design/CLAUDE_DESIGN_ADAPTATION_PROMPT.md`. When no export exists
yet, the prompt makes Claude Design inventory and correct its live project before
the first export. When files were already exported, it also inventories those
files. Paste the prompt into the existing Claude Design project so it can add
platform and production-boundary metadata, split combined screen exports when
needed, and refresh the paired handoff documents without redesigning the product.
Import the corrected result, run `npm run design:validate`, then use
`/sync-build-docs <project name>` for each release. Use
`/finalize-build-docs <project name>` only for the final completeness gate.

## Synchronize incremental design releases

Claude Design does not need to finish the whole app before implementation starts.
Every export declares its batch and revision in `design/design-release.json`.
After importing and validating a release, run:

```text
/sync-build-docs <project name>
```

The command creates or updates the same root `Product Specification.md` and
`Implementation Plan.md`, unblocks only `readyForBuild` screens, preserves
existing phase status, writes a batch sync report, and acknowledges the release
through `design/design-sync.lock.json`. Claude Design can continue later screens
while Codex implements already released slices.

## Preserve design fidelity without copying prototype architecture

Claude Design and production engineering work together through a strict boundary:
the prototype owns appearance, copy, required states, and observable interaction
outcomes; the repository and routed skills own implementation architecture.
`/sync-build-docs`, `/finalize-build-docs`, and `/generate-project-tasks` require a
production mapping before UI implementation. Prototype-local data, mock
persistence, manual validation, fake delays, and hard-coded permissions are
explicitly rejected. The mapping resolves its implementation from current project
configuration, the approved plan, protected foundations present in the repository,
existing end-to-end examples, and the routed app skill. GraphQL/codegen/TanStack
Query, form schemas, API validation/authz, repositories, and standardized errors
remain the app-boilerplate defaults when present; another approved architecture
uses its configured equivalents. Visual fidelity cannot make a screen complete
when that mapping is missing.

## Finalize the repository build docs

After all required MVP design releases have been synchronized and Claude Design
marks the release manifest as final, run the canonical command in Claude Code:

```text
/finalize-build-docs <project name>
```

The command inventories every design source, requires Claude Design's exported
Design Reference and Design Handoff Plan, confirms the product's app mapping and stack, and
reconciles those documents into the canonical repository-root `Product Specification.md` and `Implementation Plan.md`. Prototype fidelity is bounded by each screen's `data-app-root`: preview shells never ship, and mobile HTML is translated into native Expo/React Native primitives. Database configuration is
described by environment-variable name and sanitized target only; never provide or
commit connection strings, credentials, tokens, or other secret values.

## Continuous project learning

Products created from app-boilerplate can contribute verified, reusable lessons
back to the correct skill category. Run:

```text
/capture-project-learning <short lesson name>
```

The command writes a validated proposal under `skill-contributions/`. Target
skills are exact directory names from the product's locked snapshot, such as
`mobile-app`, `web-app`, or `api-app`; cross-cutting proposals may name more
than one target only when each skill needs an actionable rule.

After a proposal reaches the product's default branch,
`submit-project-learning.yml` dispatches it here using the product secret
`SKILLS_SOURCE_CONTRIBUTION_TOKEN`. This repository creates or updates a review
issue. Run `/promote-project-learning <issue>` to generalize the lesson, update
the smallest appropriate skill reference and eval, validate, and open a separate
PR. Product events never edit or merge canonical skills automatically.

## Downstream synchronization

`app-boilerplate` separates normal synchronization from intentional upgrades:

- `npm run sync-skills` hydrates and generates from the committed lock.
- `npm run update-skills` advances the lock and regenerates `AGENTS.md`.
- `npm run check-skills` verifies that committed generated output matches the lock.
- Downstream products use `npm run boilerplate:port -- --sha <full-sha>` to
  apply explicitly reviewed non-merge boilerplate commits on a dedicated branch;
  porting never acknowledges the reviewed range automatically.

After changes land on `main`, `notify-app-boilerplate.yml` dispatches an update
notification to the downstream repository. Configure a fine-grained token named
`APP_BOILERPLATE_SYNC_TOKEN` with access to `jade-kenneth/app-boilerplate` and the
`Contents: Read and write` permission required by GitHub's repository-dispatch
endpoint. The downstream workflow is intentionally read-only: it reports the exact
available SHA and the reviewed update commands instead of executing fetched code
while holding repository write permissions. The notification workflow fails when
the required token is missing so a broken downstream connection is not silently
treated as successful.

### Product boilerplate updates

Products use three intentionally separate commands:

```bash
npm run boilerplate:check
npm run boilerplate:port -- --dry-run --sha <full-app-boilerplate-sha>
npm run boilerplate:port -- --sha <full-app-boilerplate-sha>
npm run boilerplate:ack -- --sha <full-reviewed-through-sha>
```

`boilerplate:check` discovers unreviewed commits. `boilerplate:port` applies only
explicit, full-SHA selections from that unreviewed range on a clean non-default
branch, in upstream dependency order, using `git cherry-pick -x` and recording
successful SHAs in `appliedUpdates`. `boilerplate:ack` records the final review
boundary after every commit through it was applied or deliberately declined.

Porting and acknowledgement never imply each other. The guarded port command
rejects merge commits instead of guessing a mainline parent and preserves conflict
state for explicit `git cherry-pick --continue` or `git cherry-pick --abort`.
Automatic conflict resolution, automatic merge-commit selection, lock commits,
and automatic advancement of `reviewedThroughSha` are prohibited.

## Validate changes

```bash
./scripts/validate.sh
```

The validation script checks shell and JavaScript syntax, validates every skill
manifest and eval file, runs the project-learning-auditor self-test, verifies every
generated skill description and route, smoke-tests `AGENTS.md` generation, and
verifies the isolated global installer output.

## Contribution rules

- Put reusable workflow rules in `conventions/`.
- Put specialized triggerable workflows in a skill.
- Keep `SKILL.md` focused and route detailed material to `references/`.
- Add or update eval prompts when changing behavior or trigger scope.
- Run `./scripts/validate.sh` before committing.
- Do not edit generated downstream `AGENTS.md` files to change canonical rules.
