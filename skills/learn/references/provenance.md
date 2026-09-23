# Provenance — the rule that makes a teaching document trustworthy

`how-it-works/` counts *measured stages*, because everything it describes is our
code and the question is whether it has ever run. Here the subject belongs to the
whole industry, so the question changes to **where does this claim come from**.

That is not a smaller question. **A teaching document is the worst possible place
for an unsourced claim**, for a reason worth stating: the reader is a beginner, so
they cannot catch it, and they will repeat it — in a design review, in an
interview, to somebody more junior than themselves. A wrong sentence in a
reference document gets corrected by the next person who opens the code. A wrong
sentence here propagates.

## The four states

Every **load-bearing claim** — anything a reader would repeat, act on, or size a
system with — carries exactly one.

| State | Means | The minimum you must write |
|---|---|---|
| **measured** | a command was run and produced this number | the command, its **pasted** output, the date, and the machine or lab it ran on |
| **documented** | a named tool at a named version behaves this way | the tool, the version, the directive or API by name, and its **default** |
| **rule of thumb** | common practice with no number behind it | the literal words *rule of thumb*, and **what would make it false** |
| **depends** | genuinely varies by workload, and a number would be a lie | **what** it depends on, and what to measure to find out for your own case |

Non-load-bearing prose — a transition, a restatement of something already tagged,
an analogy — carries nothing. Tagging every sentence produces a document nobody
reads, which is a different way of failing.

### `measured` is the only one that may state a bare number

A number with no state beside it reads as measured. So a number that is *not*
measured must carry its state in the same sentence:

```markdown
✗  Health checks usually eject a bad backend within a couple of seconds.
✗  Ejection takes about 2 s.
✓  Ejection took **1.4 s** and lost **7 requests** — lab run, 22 Sep 2026,
   `bash lab/run.sh eject`, output pasted in §17③.
✓  nginx ejects after `max_fails` consecutive failures within `fail_timeout`;
   **the defaults are 1 and 10 s** — nginx 1.26.3, `ngx_http_upstream_module`.
   *documented, not measured here.*
✓  Teams commonly set `max_fails` to 2–3 to survive one unlucky request.
   *Rule of thumb* — it is wrong wherever a single failure is genuinely fatal,
   such as a backend that has lost its database connection pool.
```

### `depends` is an answer, not an evasion

It is the honest state for *"how many backends do I need"* — and it is only
honest when it says what to measure. `depends` with no follow-through is the
vague claim it was supposed to replace.

```markdown
✗  The right number of backends depends on your workload.
✓  *Depends.* On two things you can measure in an afternoon: the p95 service
   time of your slowest endpoint, and your peak concurrent requests. One backend
   saturates at roughly `workers ÷ p95_seconds` requests per second — the lab's
   single backend, 4 workers, 120 ms p95, saturated at 31 rps (§17①).
```

## Counting it in the masthead

```
Learn · traffic · 23 of 31 claims measured
```

The denominator is the provenance ledger's row count; the numerator is its
`measured` rows. **Both come from the ledger, not from an estimate**, and the
ledger is the last appendix of the document.

A high ratio is not the goal. A load-balancer document sitting at 23 of 31 is
healthier than one at 31 of 31, because the eight it did not measure are the
claims about AWS ALB and Envoy that nobody could measure from this machine —
and a document claiming to have measured those is lying. **What the count is
for is making the unmeasured eight visible**, so a reader knows which sentences
to go and check before they build on them.

## The ledger

The document's last appendix. One row per load-bearing claim, in the order the
claims appear, so a reader who doubts §12 can find it.

| # | Claim | State | Source |
|---|---|---|---|
| 1 | This estate runs a reverse proxy and no load balancer | measured | `docker exec <proxy-container> nginx -T` → 0 `upstream` blocks, 22 Sep 2026 |
| 2 | Round robin sends equal *counts*, not equal *work* | measured | lab §17④ — 100/100/100 requests, p95 of 41 / 43 / 612 ms |
| 3 | nginx `max_fails` defaults to 1 | documented | nginx 1.26.3, `ngx_http_upstream_module` |
| 4 | Sticky sessions are usually a workaround for local session state | rule of thumb | false where stickiness is required for cache locality rather than correctness |

**Write the ledger as you write the document, not afterwards.** Reconstructing
provenance at the end is how a `rule of thumb` quietly becomes a `documented`:
by then the author remembers being confident, not where the confidence came
from.

## The banned phrases

Each of these is a claim wearing the costume of a fact. None may survive into the
finished document **in the document's own voice**. They are fine inside a
quotation, and fine where the document is naming them as the thing it is about
to correct.

| Banned | Because | Write instead |
|---|---|---|
| significantly / dramatically faster | no number | the number, with its state |
| improves performance | which number, by how much, at what cost | `p95 fell from 612 ms to 43 ms (lab §17④)` |
| highly available | a marketing word for a measurable property | the target, and what it survives: `survives one backend of three failing, with ~7 requests lost` |
| scales infinitely / scales horizontally | nothing scales infinitely | what scales, what does not, and where the next limit is |
| industry standard / best practice | an appeal to a crowd | *rule of thumb*, plus what would make it false |
| in most cases | which cases | name the cases, or use *depends* and say what to measure |
| simply / just / easily | hides the cost from the one reader who cannot estimate it | say what it costs |
| lightning fast / blazing | nothing | delete |

```bash
# Run before the document is finished. Every hit is either rewritten or
# deliberately kept — and a kept one carries its state in the same sentence.
grep -nEi 'significantly|dramatically|improves performance|highly available|scales infinitely|industry standard|best practice|in most cases|blazing|lightning' \
  docs/learn/<topic>/<concept>.md docs/learn/<topic>/<concept>.html

# `simply`, `just` and `easily` need an eye rather than a verdict — they are
# sometimes the right word. List them and decide one at a time.
grep -nEi '\b(simply|just|easily)\b' docs/learn/<topic>/<concept>.md
```

## Three traps specific to this tier

- **The confident paraphrase.** You read something true about nginx, and write it
  about load balancers in general. The claim silently widened and is now false of
  half of them. Tag the state, and the tag forces the question: *documented — in
  which tool, at which version?*
- **The borrowed benchmark.** A number from somebody's blog is not `measured`; it
  is not `documented` either, unless the tool documents it. It is a **citation**,
  and this tier does not have that state on purpose — if you cannot measure it in
  the lab and no vendor documents it, it is a `rule of thumb` and must say so.
- **Colour drift in the diagrams.** On a `how-it-works/` map green means
  *measured against the running system*. Here it means *measured, in the lab
  beside this document*. Same treatment, different claim — **say which in the
  legend, on every diagram, every time.**
