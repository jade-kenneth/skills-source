# The estate map — read the shape off the disk

Read this to place a document before searching for it. **Regenerate the facts
rather than trusting a written list** — the commands are at the bottom, and a map
is not an index. `docs/README.md` is the index.

## Which shape is this?

```bash
# Is docs/ untracked, and by which mechanism?
git check-ignore -v docs/ 2>/dev/null        # prints the .gitignore or info/exclude line that hides it
git ls-files docs/                            # tracked exceptions, if any (see docs-path-rule.md)

# Are there sibling repositories cloned inside this checkout?
find . -mindepth 2 -maxdepth 3 -name .git -not -path './node_modules/*' | sort
```

- **No nested `.git`** → a single repository. `bug-fixed/` is flat, and general
  documents live directly under `docs/` or a topic folder.
- **Nested `.git` directories** → a multi-repo estate. Each checkout directory
  gets `docs/<repo>/` and `docs/bug-fixed/<repo>/`, and each may carry an older
  `<repo>/docs/` that is read but never added to.

**Record the answer in the project's `CLAUDE.md`** — the repositories, the topic
folders in use, any process files, and the ignore entries — so the next reader
does not re-derive it. That record is project-specific and belongs there, not in
this skill.

## The tiers

```
docs/
├── README.md                  ← the index. Every document has a row here.
├── <repo>/                    ← multi-repo only: everything that is not a fault or a mechanism
├── bug-fixed/[<repo>/]        ← fixed faults (per repo you changed, in an estate)
├── unresolved/<topic>/        ← by topic. Diagnosed, still open. Ends with task cards.
├── how-it-works/<topic>/      ← by topic. Built things, and how we know.
├── tasks/                     ← task_<name>.md plans (task-phase skill)
├── learn/<topic>/             ← concept lessons (learn skill)
├── reports/                   ← plain reports and the project story
└── tools/doc-assistant/       ← assistant.js · assistant.css · build.py
```

**The two grouping schemes meet when a problem is fixed:** `unresolved/<topic>/x.md`
becomes `bug-fixed/[<repo>/]x.md`. Never a straight rename — the relative links
inside change depth with it.

## The ignore consequence you will meet first

`docs/` is untracked, and in an estate so are the sibling checkouts. **A
recursive search returns empty rather than an error** — it is not that nothing
matched, it is that the tool never looked. Point it at the path explicitly:

```bash
# ✗ finds nothing, silently
git grep -n 'idempotency'

# ✓ searches the ignored trees
grep -rn 'idempotency' docs/ --include='*.md'
rg --no-ignore -n 'idempotency' docs
```

Two more consequences, both covered in their own references:

- Nothing under `docs/` reaches the remote, so **no committed file may name a
  `docs/` path** — `docs-path-rule.md`.
- An HTML one-pager travels only by being **sent**, so **everything in it must be
  inline** and a sent copy can never be updated — `one-pager.md`.

## Commands worth having

```bash
# What exists in each tier, right now.
find docs -maxdepth 2 -type d | sort
ls docs/unresolved/*/ docs/how-it-works/*/ docs/bug-fixed/

# Every superseded document — words, not the glyph, because the HTML uses &#9888;.
grep -rl 'Superseded in part' docs
grep -rn '\[corrected \|\[superseded ' docs --include='*.md'

# Every generated diagram and task-card generator.
find docs -name '*.build.py' | sort

# Rebuild and verify the reading assistant across every HTML page.
python3 docs/tools/doc-assistant/build.py
python3 docs/tools/doc-assistant/build.py --check   # must report 0 pages would change

# Rasterise a page or an SVG and actually look at it (macOS, nothing to install).
qlmanage -t -s 1000 -o /tmp/render docs/unresolved/<topic>/<name>.html

# Documents with no companion page yet — the backlog, built when next touched.
for f in docs/unresolved/*/*.md docs/how-it-works/*/*.md; do
  [ -f "${f%.md}.html" ] || echo "no page: $f"
done
```

## Tracked plans at the repository root

A plan or task breakdown committed at the root (`task_<name>.md`) is a **plan**:
it says what to build and goes stale the day the work lands. It reaches the
remote like any source file, so its prose may not name `docs/` paths or cite
`CLAUDE.md` by line. A `docs/` document **may** link out to one of them; the
arrow the other way breaks.
