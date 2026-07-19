---
name: project-learning-contributor
description: >-
  Capture verified, reusable engineering lessons from a product repository and
  route them to the correct canonical skill in skills-source. Use after a bug fix,
  incident, integration discovery, performance improvement, security correction,
  or durable architecture lesson should benefit other projects; also use when
  promoting a reviewed project-learning issue into one or more skills. Produces
  review-gated proposals and never auto-merges canonical skill changes.
---

# Project Learning Contributor

Turn a verified product lesson into a product-neutral improvement for the correct
skill. A product is evidence; it is never the canonical source.

## Non-negotiables

- Contribute only behavior verified by code, generated artifacts, tests, builds, or reproducible runtime evidence.
- Route to exact skill directory names. Use multiple targets only when the same rule independently belongs to each skill.
- Remove product names, feature names, customer data, private URLs, credentials, raw logs, and incidental implementation details.
- Keep framework-specific rules in their framework skill. Do not put every lesson into a generic learning or workflow skill.
- Do not change a canonical skill automatically from a product event. Product automation creates or updates a review issue; promotion happens in a separate PR.
- Prefer the smallest existing reference file. Create a reference only when no existing category fits, then add a route from the target `SKILL.md`.
- Add or update an eval when the lesson changes agent behavior.
- Before proposing, compare every candidate rule against the locked local snapshot under `.skills-source/skills/<target>/`. Never propose a rule an existing reference already states; when a rule refines or contradicts an existing one, propose it as an amendment that cites the existing file so promotion updates that rule in place instead of appending a duplicate or a conflicting instruction.
- Never auto-merge the promotion PR.

## Category selection

Inspect the available directories under `.skills-source/skills/` in a product
repository or `skills/` in this repository. The proposal validator rejects target
names that do not exist in the locked snapshot.

| Lesson | Typical target |
| --- | --- |
| Expo, React Native, device APIs, native permissions | `mobile-app` |
| Next.js, browser React, web accessibility, SEO | `web-app` |
| NestJS, GraphQL server, repositories, auth, jobs | `api-app` |
| Reusable UI execution rules | the matching UI-design skill |
| Repository-wide execution or placement rule | an existing cross-project convention |
| Boilerplate file or sync behavior | `app-boilerplate`, not skills-source |

A GraphQL contract lesson may target `api-app` and one or more client skills, but
only when each target needs its own actionable rule. Do not use multiple targets
merely because several applications were involved in the original fix.

## Capture mode — product repository

1. Read the fix, regression evidence, and applicable skill references.
2. Decide whether the lesson is reusable. If it is feature-specific or unsupported by evidence, stop and explain why no proposal should be created.
3. Choose exact target skill names from the locked snapshot.
4. Run the local overlap check against the locked snapshot — no network or skills-source clone needed. For each candidate rule, search the target's `SKILL.md` and `references/` under `.skills-source/skills/<target>/` (grep for the rule's key terms: API names, file kinds, error symptoms). Then:
   - **Already covered** — an existing rule states the same requirement: drop the candidate rule and record it under `excludedProjectDetails` as already covered, citing the reference file. If nothing remains, stop; no proposal is created.
   - **Refines or contradicts** — an existing rule overlaps but says less, or says the opposite: keep the rule, and cite the existing reference path plus the intended resolution inside the rule text (e.g. "Amends `references/auth-patterns.md`: …") so promotion edits that rule in place rather than appending a conflicting instruction.
   - **New** — no overlap found: propose it as-is.
5. Generalize the symptom, root cause, prevention rule, and verification method.
6. Write `skill-contributions/<id>.json` using the schema below.
7. Run `npm run skills:contribution:validate -- --file skill-contributions/<id>.json`.
8. Commit the proposal with the product fix or in a follow-up PR. After it reaches the product's default branch, the contribution workflow dispatches it to `skills-source` when `SKILLS_SOURCE_CONTRIBUTION_TOKEN` is configured.
9. Report the target skill(s), the overlap-check outcome per rule, and excluded product-specific details.

The required shape is:

```json
{
  "schemaVersion": 1,
  "id": "2026-07-17-short-stable-slug",
  "title": "Imperative reusable rule title",
  "targetSkills": ["mobile-app"],
  "kind": "bug-fix",
  "symptom": "Observable failure.",
  "rootCause": "General technical cause.",
  "reusableRules": ["Actionable prevention rule."],
  "evidence": [{ "path": "apps/app-mobile/app.config.ts", "note": "What this location proves." }],
  "verification": ["A check that passed and can be repeated."],
  "excludedProjectDetails": ["What was intentionally removed."]
}
```

Allowed `kind` values are `bug-fix`, `security`, `reliability`, `performance`,
`integration`, `architecture`, and `developer-experience`.

## Promotion mode — skills-source

1. Read the complete inbound issue and verify its target skills exist.
2. Treat product evidence as a lead, not unquestionable truth. Confirm framework/library behavior from primary documentation when it can change.
3. Reject, narrow, or split proposals that are product-specific, unsupported, or incorrectly categorized.
4. Update the smallest relevant reference in each approved target skill. When a rule cites an existing reference as an amendment, edit that rule in place; never append a second rule on the same topic.
5. Add a quick-reference or non-negotiable route only when agents must discover the rule before implementation.
6. Add or update eval coverage and run `./scripts/validate.sh`.
7. Create a focused PR linking the learning issue. Never merge it automatically.
8. After merge, normal skills-source notification and app-boilerplate pinning distribute the reviewed improvement downstream.
