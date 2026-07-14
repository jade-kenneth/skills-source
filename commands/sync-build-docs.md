---
description: Create or incrementally reconcile Product Specification and Implementation Plan from the next validated Claude Design release without waiting for the full app design
argument-hint: [project name]
---

# /sync-build-docs — reconcile one incremental design release

**Project name:** $ARGUMENTS

Use this command after any validated Claude Design release, including the first
partial release. It creates the canonical root build documents when absent and
updates the same documents for later batches. It never requires every planned
screen to be finished and never implements application code.

## 1. Validate release identity first

If the project name is empty, ask for it. Run from the product repository root:

```bash
npm run design:validate
```

Stop on failure. Read `design/design-release.json` and
`design/design-sync.lock.json` when present.

The release manifest is authored by Claude Design:

```json
{
  "schemaVersion": 1,
  "project": "Dala",
  "batch": 2,
  "revision": 0,
  "previousBatch": 1,
  "releaseId": "design-batch-002",
  "status": "incremental",
  "readyForBuild": [
    {
      "screen": "Booking",
      "prototype": "prototypes/Booking.dc.html",
      "change": "added"
    }
  ],
  "stillInDesign": ["Payment"],
  "planned": ["Support"],
  "removedOrSuperseded": [],
  "notes": "Adds the booking flow."
}
```

Batch numbers advance only when newly ready scope is released. Corrections to the
same released scope increase `revision`. Prototype filenames remain stable; do
not add batch numbers to filenames.

The synchronization lock is repository-owned and must never be authored or
edited by Claude Design. It records the last successfully reconciled batch,
revision, release ID, and prototype hashes.

## 2. Read the release and repository

Read:

- every prototype named by `readyForBuild`;
- the current `design/planning/screen-inventory.md`;
- applicable design-system, planning, handoff, and asset files;
- existing root `Product Specification.md` and `Implementation Plan.md`;
- `AGENTS.md`, repository conventions, app structure, and reusable architecture.

Confirm the database environment-variable name, sanitized database target, app
mapping, and stack only when they are not already verified in the root documents.
Never request or record secret values.

Treat release status as a build boundary:

- `readyForBuild`: may enter an unblocked implementation phase;
- `stillInDesign` or screen status `in-design`: document but keep blocked;
- `planned`: document as later design scope and keep blocked;
- `revision-required`: reopen only affected implementation and Fidelity QA;
- `removedOrSuperseded`: remove from future scope only after reporting impact.

## 3. Create or reconcile the canonical documents

When the root documents do not exist, create them from the verified repository
and this release using the same ownership, architecture audit, trim-list,
security, GraphQL, React Query, repository, seeding, phase, and Fidelity QA rules
defined by `/finalize-build-docs`.

When they already exist:

1. Preserve completed engineering decisions, user notes, phase history, and
   unrelated implementation status.
2. Add or update only scope supported by the current design release or verified
   repository changes.
3. Never reset all checkboxes or replace the documents wholesale.
4. Keep `planned` and `stillInDesign` screens visible but explicitly blocked.
5. For an updated ready screen, compare it with the prior specification, name
   every affected phase and implemented surface, and change `[x]` to `[~]`
   only where rework and Fidelity QA are actually required.
6. For removed or superseded scope, report data, API, navigation, seed, test, and
   migration impact before changing the plan.
7. Keep section/phase cross-links and the two root documents consistent.

Codex may begin architecture work and any `readyForBuild` slice after this sync.
It must not implement `planned`, `in-design`, or otherwise blocked screens.

## 4. Write the release sync report

Create or update:

```text
design/handoff/Design Batch NNN Revision N Sync Report.md
```

Record:

- release identity and previous synchronized release;
- ready, added, updated, blocked, planned, and superseded screens;
- Product Specification sections changed;
- Implementation Plan phases added, reopened, or left unchanged;
- architecture and data-contract impact;
- unresolved decisions and explicit blockers;
- whether acknowledgement completed.

Do not alter Claude Design's project-named Design Reference or Design Handoff Plan.

## 5. Acknowledge only after reconciliation succeeds

After both root documents and the sync report are internally consistent, run:

```bash
npm run design:ack
```

This deterministically writes `design/design-sync.lock.json` with the accepted
batch, revision, release ID, and prototype hashes. Never acknowledge before the
documents are successfully reconciled. If acknowledgement fails, leave the
release unacknowledged and report the error.

Open `Product Specification.md` for the user and summarize what became buildable,
what remains blocked, and which phases changed.

## Final release

Incremental releases use `"status": "incremental"`. When Claude Design declares
the complete MVP design, it uses `"status": "final"`, leaves `stillInDesign`
and `planned` empty for required MVP scope, and then
`/finalize-build-docs <project name>` performs the final completeness gate.
