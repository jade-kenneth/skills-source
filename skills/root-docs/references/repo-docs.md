# General documents — everything that is not a fault or a feature mechanism

The default tier. An operational guide, a data walkthrough, a subsystem reference,
a primer, a process file — anything that is not *why it broke*, *why it is still
broken*, or *how the built thing works*.

## Where it goes

- **Single repository:** `docs/`, or a broad topic folder under it when the
  project already groups that way.
- **Multi-repo estate:** `docs/<repo>/`, where `<repo>` is the **checkout
  directory name** of the repo whose code the document describes — never the
  remote repository's name. One folder, often named after the root checkout,
  carries the estate-wide process files rather than code documentation.
- **Create the folder if it does not exist.** The folders present are only the
  repos documented so far, not the full list.
- Spanning repos: file under the one you would edit to change the behaviour, and
  name the others in a `**Related:**` line at the top.
- Never write a new document into a repo-local `<repo>/docs/`. That tier is read,
  not added to, so the root set stays the single place to look.

## Registering it

In the same sitting:

1. **A row in the table in `docs/README.md`** — and a new `##` section if you
   created a folder. That table is where people choose what to open, so the row
   says what the document *answers*, not what it is called.
2. **For a feature, an entry in the estate's feature registry**, if it keeps one,
   in the registry's own format. A typical shape:

   ```markdown
   ## Feature Name [TICKET-123, TICKET-456] (YYYY-MM-DD)
   **Status:** ✅ Production Ready | 🚧 In Progress
   **Documentation:**
   - [link](../<folder>/<doc>.md)

   **Description:** what it does and the problem it solves.

   **Key Components:** the classes and services, one line each.

   **Technical Dependencies:** packages, versions, structural requirements.

   **Integration Points:** inbound and outbound.
   ```

A how-it-works document is by definition a feature document and gets a registry
entry too — see `how-it-works.md`.

## A note on the ordering

A feature that *shipped* wants a `how-it-works/` document, not this tier: the
mechanism, the decisions, the options they beat, the measured before and after.
This tier is for the material that is not about a single feature's mechanism at
all. When in doubt between the two, ask whether the document's centre of gravity
is *how does this work and how do we know* — if yes, it is `how-it-works/`.
