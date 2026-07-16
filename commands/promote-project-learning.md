---
description: Promote a reviewed project-learning issue into its correctly categorized canonical skills
argument-hint: "<skills-source issue URL or number>"
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

Use the `project-learning-contributor` skill in promotion mode. The required issue is `$ARGUMENTS`.

1. Work in `skills-source` on a separate branch and read the complete issue and discussion.
2. Verify every target under `skills/`; correct, narrow, or split the categorization when needed.
3. Confirm changeable framework/library behavior using primary documentation.
4. Generalize the learning without product names, feature behavior, secrets, private URLs, or raw logs.
5. Update the smallest appropriate reference for every approved target; update `SKILL.md` only when a discovery route or non-negotiable is needed.
6. Add or update eval coverage and run `./scripts/validate.sh`.
7. Open a focused PR linking the issue. Do not auto-merge it.
8. Report rejected or deferred portions explicitly.
