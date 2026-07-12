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

## Downstream synchronization

`app-boilerplate` separates normal synchronization from intentional upgrades:

- `npm run sync-skills` hydrates and generates from the committed lock.
- `npm run update-skills` advances the lock and regenerates `AGENTS.md`.
- `npm run check-skills` verifies that committed generated output matches the lock.

After changes land on `main`, `notify-app-boilerplate.yml` dispatches an update
notification to the downstream repository. Configure a fine-grained token named
`APP_BOILERPLATE_SYNC_TOKEN` with access to `jade-kenneth/app-boilerplate` and the
`Contents: Read and write` permission required by GitHub's repository-dispatch
endpoint. The downstream workflow is intentionally read-only: it reports the exact
available SHA and the reviewed update commands instead of executing fetched code
while holding repository write permissions.

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
