# The lab — `docs/learn/<topic>/lab/`

**Every learn document has one, and its measured numbers come from it.**

Without a lab, a teaching document degrades into recitation inside a paragraph.
The author reaches for a number they half-remember, there is nothing to stop
them, and the provenance rule becomes an aspiration. The lab is what makes
`measured` available at all — and it is what lets a beginner stop believing the
page and go and look, which is the only way anybody ever really learns a
mechanism.

## The constraints

**Zero dependencies.** It runs with what is already on the machine. No
`npm install`, no `pip install`, no image pull. On this machine that means
Node 26, Python 3.9, Docker 29, `curl` — check before you lean on one:

```bash
node -v; python3 -V; docker --version; curl --version | head -1
```

**One command.** `bash docs/learn/<topic>/lab/run.sh` runs everything and prints
the table. A lab needing a paragraph of setup is a lab nobody runs, and an
unrun lab is worse than none because the document still quotes it.

**It runs the counterfactual too.** The WITHOUT column of the comparison diagram
needs measured cells as much as the WITH column. A lab that only demonstrates
the happy path leaves half the document unsourced — and it is the half the
reader came for.

**High ports, and it cleans up after itself.** Bind `19080`+ so nothing
collides with the estate's stack. `trap` on `EXIT` so an interrupted run leaves
no orphans. Check the port is free before binding and fail with a clear message
rather than a confusing one.

**It never touches the estate's running stack.** Probes against real containers
are **read-only** — `docker exec … nginx -T`, `docker inspect`, a `GET`. Anything
that stops, restarts, writes or reconfigures runs against the lab's own
processes. The stack on this machine has containers up for thirteen days; a
teaching document is not a reason to restart one.

**It says what it is.** The first lines of output carry the date, the tool
versions and the machine, so a pasted transcript is self-describing and a reader
can tell at a glance whether it predates the thing they are debugging.

**It fails loudly.** A scenario that could not run exits non-zero and says why.
Silent partial output is how a stale transcript survives into a document.

## The shape

```
docs/learn/<topic>/lab/
  README.md      what it demonstrates, what it cannot, how to run one scenario
  run.sh         the entry point; dispatches scenarios, prints the table
  <parts>        the smallest programs that make the point
```

Two rules about the programs themselves, because the lab is teaching material:

- **Small enough to read.** A reader who can read the balancer is a reader who
  understands the mechanism. If a part cannot be read in one sitting, the lab is
  demonstrating too much at once — split the scenario.
- **Commented for what the line is *for*.** Same rule as every other code block
  in this estate. The lab is often the first thing a curious reader opens.

## Getting the numbers into the document

**Paste the output. Never write what it would print.** A transcript nobody ran
is the most convincing wrong thing a document can contain, and this estate has
published one twice.

Have `run.sh` end with a **summary table** whose rows are exactly the claims the
document makes, so the document and the lab cannot drift without it being
visible in a diff:

```
scenario              metric              value     doc §
--------------------  ------------------  --------  -----
single-backend        p95 latency         612 ms    §7
single-backend        failed requests     300/300   §8 r1
three-backend-rr      p95 latency          43 ms    §8 r1
three-backend-rr      requests lost        7         §14 c2
```

Then **run the document's own blocks in `zsh -f`** — a virgin shell, not the one
you wrote them in. That shell has your history, your functions and your
environment, and it hides exactly the failure a reader hits first. The estate
has shipped two broken evidence sections this way: a `PSQL="docker exec …"`
variable, which zsh does not word-split; and a shell function, which works
beautifully until somebody pastes the *second* block into a new tab.

## Say what the lab cannot prove — in the lab and in the document

**This is the section that keeps a lab honest, and it is the one that gets left
out.** A handful of processes on one laptop share a CPU, a kernel, a scheduler
and a loopback interface. That is enough to prove a great deal and nothing like
enough to prove everything.

A lab of this kind *can* prove: how work is distributed, how long a failure
takes to be noticed, how many requests are lost while it is noticed, how
queueing behaves as concurrency rises past capacity, and that a mechanism you
believed was active is in fact attached to nothing.

It *cannot* prove: anything about network partitions, packet loss, NIC or
bandwidth saturation, cross-zone latency, TLS handshake cost at scale, kernel
connection-table limits, or behaviour under a real production traffic shape.

Write both lists. Put the second one beside the numbers, not in a footnote —
a reader who takes a loopback measurement as a production measurement was
misled by the document, not by the lab.
