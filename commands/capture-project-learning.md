---
description: Capture a verified product lesson and route it to the correct skills-source category
argument-hint: "<short lesson name>"
allowed-tools: Read, Glob, Grep, Bash, Write
---

Use the `project-learning-contributor` skill in capture mode. The optional argument is `$ARGUMENTS`.

1. Read the completed fix, its diff, regression evidence, and the locked skill index under `.skills-source/skills/`.
2. Reject feature-specific behavior, unverified guesses, and boilerplate-only file changes.
3. Select exact target skill directory names. Keep platform lessons in their category, such as `mobile-app`, `web-app`, or `api-app`.
4. Remove product identity, customer information, private URLs, credentials, raw logs, and feature-specific details.
5. Write a complete proposal to `skill-contributions/YYYY-MM-DD-<stable-slug>.json` using the contributor skill schema.
6. Run `npm run skills:contribution:validate -- --file skill-contributions/YYYY-MM-DD-<stable-slug>.json`.
7. Correct validation failures rather than bypassing them.
8. Summarize the evidence, target skill(s), reusable rules, and excluded project-specific details.

Merging the proposal to the product default branch dispatches a review issue when `SKILLS_SOURCE_CONTRIBUTION_TOKEN` is configured. This command never modifies or merges `skills-source` directly.
