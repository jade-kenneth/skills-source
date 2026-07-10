---
description: Set up or verify the Notion state layer — Projects + Pipeline Items databases with properties, relations, and views. Idempotent; optionally registers the current project.
argument-hint: [optional: project name to register after setup]
---

# /notion-setup — Notion state layer (Projects + Pipeline Items)

**Project to register (optional):** $ARGUMENTS

You are setting up my Notion workspace as the state & visibility layer for my agent stack. Use the Notion MCP tools. Be **idempotent**: search before creating, update instead of duplicating, and never destroy existing data. Report every action taken and every action skipped (with the reason) at the end.

## Ground rules

- Notion owns **state** (what stage things are in); git repos own **execution** (task files, code). Never create task-detail pages here — status level only.
- If a database with the target name already exists, verify its schema against the spec below and **add any missing properties/options**; do not rename or delete existing properties without asking me.
- If something is ambiguous (e.g. two databases with the same name), stop and ask before touching anything.

## Step 1 — Locate or create the parent page

Search for a page titled **"Ops HQ"**. If it doesn't exist, create it as a top-level workspace page. Both databases live under it.

## Step 2 — Projects database

Find or create a database named **"Projects"** under Ops HQ with exactly these properties:

| Property    | Type      | Options                                     |
| ----------- | --------- | ------------------------------------------- |
| Name        | title     | —                                           |
| Status      | select    | Idea / Planning / Active / Shipped / Paused |
| Type        | select    | Client / Product / Internal / Content       |
| Repo        | url       | —                                           |
| Priority    | select    | P1 / P2 / P3                                |
| Next action | rich text | —                                           |
| Notes       | rich text | —                                           |

Views to create (skip any that already exist):

- **Board by Status** — board grouped by Status.
- **Active** — table filtered `Status = Active`, sorted by Priority ascending.

## Step 3 — Pipeline Items database

Find or create a database named **"Pipeline Items"** under Ops HQ with exactly these properties:

| Property   | Type             | Options                                             |
| ---------- | ---------------- | --------------------------------------------------- |
| Name       | title            | —                                                   |
| Project    | relation         | → Projects database (created in Step 2)             |
| Status     | select           | Queued / In progress / Needs review / Done / Failed |
| Kind       | select           | Feature / Video / Post / Task                       |
| Payload    | rich text        | input data for n8n                                  |
| Result     | rich text        | written back by automation                          |
| Result URL | url              | —                                                   |
| Updated    | last edited time | —                                                   |

Views to create (skip any that already exist):

- **Board by Status** — board grouped by Status.
- **Blocked on me** — table filtered `Status = Needs review`, sorted by Updated descending. (This is the morning dashboard.)
- **Queue** — table filtered `Status = Queued`, sorted by Updated ascending. (This is what n8n polls.)

## Step 4 — Seed current projects (first run only)

If the Projects database was **just created** (not pre-existing), add these rows so the board isn't empty — Status/Priority as stated, everything else blank for me to fill:

- **AI Video Factory** — Type: Internal, Status: Active
- **Barangay Buddy** — Type: Product, Status: Active
- **RepoJarvis** — Type: Product, Status: Planning
- **Portfolio Revamp** — Type: Internal, Status: Paused

If the database already existed, skip this step entirely — never re-seed.

## Step 5 — Register the current project (only if a name was passed)

If a project name was provided in the arguments:

1. Search Projects for a row with that name. If found, tell me its current Status and stop.
2. If not found, create it: Status = Planning, Type = ask me (Client / Product / Internal / Content), Repo = ask me for the URL or take it from the current git remote if you're running inside a repo.
3. Do **not** create any Pipeline Items — those are created by workflows or by me, per item.

## Step 6 — Report

End with a short summary:

- What was created vs. found existing (databases, properties, views, rows)
- The URLs of Ops HQ, Projects, and Pipeline Items
- Anything skipped and why
- Remind me of the two integration points that consume this layer: Claude Code updates task status after each phase (CLAUDE.md instruction), and n8n polls the **Queue** view (Phase 7 of task_agent_stack.md).
