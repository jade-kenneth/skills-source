# Worked example — "I want to learn about load balancers"

The spec in the other references is abstract. This is one concept carried
through it, so each rule has something to be checked against.

> **Read the numbers here carefully.** Only two facts below were measured:
> the `nginx -T` counts in §3, run read-only against this estate's proxy on
> 22 September 2026, and the tool versions. **Everything shown as a lab figure
> is a placeholder demonstrating the *shape* of a measured claim, and is marked
> `‹lab›`.** A worked example that invented benchmarks would break the rule it
> exists to teach. When you build the real document, those come from your run.
>
> **Whose estate this is.** The example was written against one multi-repo
> Docker estate with an nginx reverse proxy in front (a clinic-software suite).
> Its container and file names, its clinic analogy and its second-language
> (Tagalog) lines belong to that estate. Carry the shape; take every name,
> number and analogy from your own project.

---

## 1 · Route it

The user said *"I want to learn about load balancer"* — a general concept, not
this estate's code. So: `docs/learn/traffic/load-balancer.md`, with the
one-pager, four generators and `lab/` beside it. `traffic/` is the topic family,
and its later siblings are the neighbours: `reverse-proxy.md`, `api-gateway.md`,
`cdn.md`, `service-discovery.md`.

## 2 · Section 3 — what type of thing this is

- **Category** — a traffic-distribution pattern. Infrastructure, not application
  code: you configure it, you do not import it.
- **Where it sits** — between whatever resolves your hostname and a pool of
  interchangeable backends. Upstream of it: DNS, a CDN, the client. Downstream:
  two or more processes that can each serve any request.
- **What it is not** — not a reverse proxy (one origin, no pool), not an API
  gateway (auth, rate limits, request shaping), not a CDN (caches *content* near
  users rather than spreading *load*). One clause each; §16 is the long version.
- **What you need first** — what a process, a port and a health check are.
  Nothing else.

## 3 · The estate anchor — and it is the "we do not use it" kind

The stronger anchor, because it turns the concept into a live question about the
reader's own stack:

```bash
# What nginx actually loaded in the running proxy — read-only, changes nothing.
# `nginx -T` dumps the *merged* config, which is stronger evidence than the conf
# files in the repo: it is what the process is really running.
C=$(docker exec mwell-webapp nginx -T 2>/dev/null)
printf '%s\n' "$C" | grep -cE '^[[:space:]]*upstream '   # pools defined
printf '%s\n' "$C" | grep -cE 'proxy_pass'               # routes forwarded
printf '%s\n' "$C" | grep -cE 'max_fails|proxy_next_upstream'   # failover
```

```
nginx version: nginx/1.26.3
upstream blocks  : 0
proxy_pass       : 3
max_fails        : 0
proxy_next_upstr : 0
server{} blocks  : 9
```

**Measured, 22 September 2026.** Nine vhosts, three of them forwarding to an
application, and **not one pool among them**. Every `proxy_pass` names a single
container — `proxy_pass http://onboarding-api:3000`
(`nginxphp/sites-available-local/mwell/his/onboarding-api.conf:25`). So there is
a reverse proxy in front of this estate and no load balancer behind it: if
`onboarding-api` stops, nginx has nowhere else to send the request, and there is
no `max_fails` or `proxy_next_upstream` to make it try.

*That is the first sentence the document should have*, and it is worth more than
any paragraph of theory, because the reader can run the three lines themselves.

## 4 · The analogy — the clinic reception desk

Chosen from this estate's own domain, so the mapping is free for anybody who
works here. Every part maps to a named part of the real thing:

| In the analogy | In the system |
|---|---|
| The reception desk | the load balancer |
| The consultation rooms | the backend instances (the pool) |
| Reception sending you to room 3 | the balancing algorithm choosing a backend |
| Reception ringing each room to see who is in | the health check |
| A doctor stepping out without telling reception | a backend that dies silently |
| Your notes kept in one doctor's own drawer | session state held in one backend's memory |
| "Always see Dr Reyes" written on your card | a sticky session |
| The notes moved to the shared records room | a shared session store |
| The sign on the street door | DNS |
| Reception itself closing | the balancer as a single point of failure |

**In English** and **Sa Tagalog**, paragraph for paragraph, ending with
**The fix:** / **Ang solusyon:** and the **How that fixes it:** /
**Bakit ayos na:** clause — `root-docs` → `references/plain-terms.md` governs it.

> Today there is no reception desk. The street sign points at one room, so
> everybody walks to that one door. If the doctor in it steps out, the corridor
> fills up and nobody is sent anywhere else — there is nowhere else written down.
>
> Ngayon, walang reception desk. Ang sign sa pinto ay tumuturo sa isang room
> lang. Kaya lahat ng tao, doon pumipila. Kapag umalis ang doctor sa room na
> iyon, wala nang ibang pupuntahan — kasi wala namang nakasulat na iba.

Use the same desk for every later section. Never a second analogy.

## 5 · The lab

```
docs/learn/traffic/lab/
  README.md     what it shows, what it cannot, how to run one scenario
  backend.js    an origin server: reports its own name, N workers, settable
                delay, and an admin route to make it sick
  balancer.js   ~120 readable lines: round-robin, least-connections, hash,
                and `single` — which models this estate's proxy_pass exactly
  drive.js      fires N requests at C concurrency; prints per-backend counts,
                p50/p95/p99, and how many the client saw fail
  run.sh        one command; scenarios below; trap on EXIT; ports 19080+
```

Scenarios, chosen so **each one sources a specific section**:

| # | Scenario | Sources |
|---|---|---|
| ① | one backend, rising concurrency | §7 the pain — where a single box saturates |
| ② | one backend, it dies | §8 row 1 — every request fails, not some |
| ③ | three backends, round robin | §8 — distribution, and what it costs |
| ④ | three backends, **one slow** | §9 — round robin sends equal counts, not equal work |
| ⑤ | one dies, **health checks off** | §14 — a pool without checks fails 1/N of requests indefinitely |
| ⑥ | one dies, **health checks on** | §14 — how *brief*, and exactly how many requests were lost |
| ⑦ | sticky sessions, then that backend dies | §14 — the `none` row |

Scenario ⑥ is the one that earns the document. "Load balancers give you high
availability" is a banned phrase; *"ejection took `‹lab›` and `‹lab›` requests
failed in the meantime"* is the same idea, true, and useful.

## 6 · The counterfactual rows

| Step | Without | With | Difference |
|---|---|---|---|
| A backend dies | every request fails | the pool routes around it | `‹lab›` lost, then 0 |
| Traffic doubles | p95 climbs, then queues | add a backend, p95 returns | `‹lab›` |
| Deploying a new version | the service is down for the restart | drain one, restart, return it | downtime → none |
| **Something breaks that did not before** | one thing can fail | **two**, and the new one takes everything with it | the balancer is now a SPOF |

**That last row is the required one** — the generator fails the build without it.
A comparison in which the new design is better on every line has stopped
comparing.

## 7 · Risk cards, including the `none`

- **The balancer is a new single point of failure.** Mitigation: two of them.
  Residual: now you need something to choose between *those* — DNS, anycast, a
  floating address. *Standard, with a cost.*
- **Health checks lie.** A backend answers `/healthz` from a thread pool that is
  fine while the pool it needs is exhausted. Mitigation: check the dependency.
  Residual: now the check can fail the whole pool at once. *Partial.*
- **Sticky sessions turn one death into lost work.** Mitigation: move session
  state out. Residual: **none that keeps stickiness** — if you genuinely need a
  user pinned to a backend, you have chosen to lose their work when it dies.
  *This is the `none` row, and it is the most valuable card on the page.*

## 8 · The neighbourhood

- **Works with** — health checks (tells the pool who exists) · autoscaling
  (changes the pool size) · shared session store (makes backends
  interchangeable) · graceful drain (makes deploys invisible).
- **Depends on** — backends that are actually interchangeable. Not true by
  default, and the thing that most often makes a load balancer misbehave rather
  than fail cleanly.
- **Competes with** — client-side load balancing · DNS round robin · anycast ·
  a service mesh's sidecar.
- **Is confused with** — reverse proxy · API gateway · CDN · ingress controller.
  **The band a beginner needs most**, and the generator refuses an empty one.

## 9 · Misconceptions to cover

- *"A load balancer makes my app highly available."* It removes one cause of
  downtime and adds another. What it actually buys is measured in §13.
- *"Round robin is fair."* It is fair in **counts**, not in **work** — scenario ④.
- *"Health checks mean no dropped requests."* They mean *fewer*, for a measured
  window — scenario ⑥.
- *"I'll add one now so I can scale later."* §12's middle subsection: the signals
  you do **not** need one yet, and what the cheaper answer is.

## 10 · What the ledger looks like part-built

| # | Claim | State | Source |
|---|---|---|---|
| 1 | This estate runs a reverse proxy, not a load balancer | measured | `nginx -T` → 0 upstream blocks, 22 Sep 2026 |
| 2 | nginx `max_fails` defaults to 1, `fail_timeout` to 10 s | documented | nginx 1.26.3, `ngx_http_upstream_module` |
| 3 | Round robin equalises counts, not work | measured | lab ④ |
| 4 | Sticky sessions are usually a workaround for local session state | rule of thumb | false where stickiness serves cache locality, not correctness |
| 5 | How many backends you need | depends | on p95 service time and peak concurrency — measure both; lab ① shows the method |

Five rows, three states, and **row 5 is an answer** rather than a shrug, because
it says what to measure.
