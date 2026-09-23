---
name: plain-report
description: Write a short, plain-language, Slack-ready progress report for non-technical readers (client, manager, stakeholders) from the documents in `docs/bug-fixed/` and `docs/unresolved/`. It first asks where the report will be posted and who did the work, so the voice fits (by default the client reads it in the group chat and one developer did the work). Each item shows a plain before-and-after comparison and, when the reader can see the change for themselves, short numbered steps to check it. It says what problem was solved, what it means for them, and what to expect next, then tags each reported document so the next report skips it. Use when asked to "report what we fixed", "write a status update for the client", "explain this to a non-techy person", "what's new since the last report", or "make a plain report".
---

# Plain report: finished work, explained for non-technical readers

Produce **one short report** that someone with no technical background can read
in two minutes. It covers only work that hasn't been reported yet, and it marks
what it covered so the next run skips it.

It reads the `bug-fixed/` and `unresolved/` tiers that the `root-docs` skill
defines, including their resolution trackers and task cards. A project without
those tiers has nothing for this skill to report from; say so rather than
reporting from commits.

---

## 0 · Ask who's reading and who did the work

Before scanning anything, ask the user both questions in **one**
`AskUserQuestion` call. The answers set the report's voice in step 3. Put the
default first in each list and mark it _(Recommended)_.

| Question                                                  | Header   | Options, default first                                                                                                                                             |
| --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Where will this report be posted, and who reads it there? | Audience | **Group chat with the client in it** (the client reads it directly) · Internal chat, no client (a manager or teammates pass it on) · Sent to the client one-to-one |
| Who did the work in this report?                          | Work by  | **Just me** (I work alone) · A team                                                                                                                                |

If the user skips the questions or asks you to just write it, use the defaults:
**the client is in the group chat, and the user works alone.** Say in your chat
reply which answers you used.

Ask every run. The audience can change between reports, so never reuse last
run's answers without asking.

---

## 1 · Find what hasn't been reported

Scan every `.md` in `docs/bug-fixed/**` and `docs/unresolved/**`. Skip
`task_*.md` plans, `*.build.py`, `.svg` and `.html` files. The `.md` is the
source, and the `.html` beside it is a copy.

Each document may carry a **reported tag** on the line right after its `# title`:

```markdown
<!-- reported: 2026-09-17 · rows: W1, U1, U2 -->
```

`rows:` lists the resolution-tracker rows that were **closed** when the
document was reported (`rows: none` for a document reported while fully open).
Decide per document:

| Document state                                                   | Goes in the report?                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| No tag, under `bug-fixed/`                                       | Yes, as **Fixed**                                                       |
| No tag, under `unresolved/`, with some tracker rows closed       | Yes. Closed rows go under **Fixed**, the open ones under **Still open** |
| No tag, under `unresolved/`, nothing closed                      | Yes, under **Still open**, once, so the reader knows it exists          |
| Tagged, and its tracker now has closed rows missing from `rows:` | Yes, **only the newly closed rows**                                     |
| Tagged, nothing new closed                                       | No                                                                      |

Read the tracker from the document itself (the `## The resolution tracker`
table). A row counts as closed only when the document says it is closed. Don't
decide from the code or from a task card's wording. If a tracker row's status
is unclear, leave it out and name it in your chat reply.

If nothing qualifies, don't write a report. Tell the user there's nothing new
since the last tagged date.

---

## 2 · Read for meaning, not detail

For each qualifying document, read the title, the intro paragraph,
`## In plain terms`, `## The resolution tracker`, and the task cards'
_Before_ / _After_ / _Good to know_ for the rows you're reporting. That's
usually enough. Open other sections only to answer "so what does this mean for
the client?"

Pull out, per item:

- **The problem**, as the client would have noticed it (or could have been hurt by it)
- **Before and after**: what happened before the fix, and what happens now
  (for an open item: what happens today, and what will happen once it's
  fixed). See _Before and after_ below
- **Can they check it?** Whether the reader can see the change for
  themselves, and if so, how. See _Check it yourself_ below
- **The impact**: the result that matters to the reader, in one sentence.
  What they gain, what risk is gone, or what they can now do (see _Lead with
  the impact_ below)
- **What to expect**: what they'll notice now, or that they'll notice nothing
  (common for security fixes, so say it outright)
- **What's still needed**, and **who** it waits on (a role, never a person's name)
- **Severity**, from the scale below
- **How we know.** Keep the document's honesty: "tested in a browser on
  16 Sept" is different from "built, not yet tried with a real client". Never
  make an item sound more finished than its document says.
  Say it in the first person ("I tested it in a browser on 16 Sept").

### Lead with the impact

The reader cares about the result, not the work. Every item carries **one
bolded impact sentence**: what's better for them, what risk is gone, or what
they (or their clients) can now do. It is the sentence to read if they read
nothing else.

- Say the result in their terms: time saved, a risk removed, something that now
  works, something their clients will notice. Use a number when the document
  has one ("files up to 4 MB", "on all 5 pages").
- Put it **inside the sentence**, in bold, not as a separate label
  ("_Now:_ the app checks every file. **Your clients can only upload real
  pictures and documents.**").
- For an open item, the impact is what they'll gain once it's fixed, or what
  the risk is until then.
- Bold only the impact sentence, and one per item. If everything is bold,
  nothing stands out.
- An impact must be true today. For something built but not yet tried, say so
  in the same sentence ("**Once it's tried with a real client, …**").

| Weak (don't)                | Clear (do)                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| The fix improves security   | **Your clients' files stay private to them, even if someone tries a trick link.**                                                       |
| Error handling was improved | **If the system has a hiccup, your clients get a clear "try again shortly" message instead of being told their account doesn't exist.** |

### Business value: only when it's real

Clients think in business terms. When an item genuinely affects the business,
say how, in the impact sentence or the one right after it. Pick the angle that
fits the item, and **skip this entirely when none does.** A cosmetic fix
doesn't need a cost story, and forcing one onto every item makes the real ones
sound like padding.

| Angle                         | Use it when the item…                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cost avoided**              | removes a cost that could appear or grow over time: a paid service used more than needed, a bill that could creep up, an incident that would need paid clean-up |
| **Time saved**                | removes manual work, back-and-forth, or support questions for their team                                                                                        |
| **Risk removed**              | closes a way to lose data, clients, money or reputation                                                                                                         |
| **Trust / client experience** | changes what their clients see or feel about the service                                                                                                        |
| **Ready to grow**             | lets them take on more clients or work without extra effort                                                                                                     |

Examples of the tone:

| Angle      | Sentence                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Money      | A data leak between clients is the kind of incident that costs a client relationship, plus legal and clean-up work. **This closes that off before any real client is invited.** |
| Staff time | **Your team no longer has to answer "why does the app say my account isn't set up?" when the real cause was a short outage.**                                                |
| Trust      | **Clients see a clear, honest message instead of an alarming one, which protects how they see your service.**                                                                   |

Rules:

- **Never invent a number.** Use an amount, a time or a count only when the
  source document states it. Otherwise describe the direction plainly ("could
  rise over time", "fewer support questions") without a figure.
- Say "avoids" or "reduces the chance of", not "saves $X", unless a saving was
  actually measured.
- One business angle per item at most, and only on the items where it's true.
  It's fine, and normal, for most items to have none.
- If the report has several items with business value, the opening line may
  name the biggest one.

### Before and after

Every item gets a comparison, because "it's fixed" means little to someone who
never saw it broken. Write both halves as **something a person would see or
experience**, not as what the code does.

| Weak (don't)                                                  | Clear (do)                                                                                                                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before: uploads weren't validated. Now: uploads are validated | Before: a file pretending to be a picture could be uploaded. Now: the app checks what's really inside a file and refuses anything that isn't what it claims to be              |
| Before: error handling was missing. Now: it returns a 503     | Before: if the database was down, the page said your account wasn't set up, which was wrong and alarming. Now: it says the system is briefly unavailable and to try again shortly |

- Take _Before_ from the task card's **Before** (it carries the date it was
  seen) and _Now_ from its **After**. A card with no _After_ is still open, so
  write _Today_ / _Once fixed_ instead, and never invent an _After_.
- If the change is invisible (most security fixes), say so in _Now_:
  "Nothing looks different to you. The difference is that …".
- Use a small everyday comparison when it helps ("like a building that checks
  ID at the door, not just at the front gate"). One per item at most.

### Check it yourself: only when it helps

Give numbered steps **only when all of these are true**. Otherwise leave the
steps out and say in one plain sentence how it was confirmed.

| Include steps when…                                                                                                  | Leave them out when…                                                                      |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| The change shows on screen in the app (a page that used to break now loads, a picture that was missing now shows) | Nothing on screen changes (a security layer, a header, a behind-the-scenes check)         |
| The reader can do it with a normal web browser and the access they already have                                      | It needs a terminal, developer tools, a database login, or a test account they don't have |
| You (or the task card's _See it for yourself_) actually ran the steps and saw the result                             | Nobody has run them yet. Then the item says "not yet tried", with no steps                |

Writing the steps:

- **Three to six steps**, numbered, one action each. Start with where to go
  ("Open the app in your browser and sign in as usual").
- Name what they'll see on screen by its **visible label**, in quotes:
  click "Files", look for the "Download" link. Never a route, file or code name.
- End with **"You should see:"** and what you actually saw, in plain words.
  Add "If you see … instead, let me know" when a wrong result is possible.
- Rewrite a task card's _See it for yourself_ for this reader. Drop every step
  that uses a terminal or developer tools; if that leaves nothing useful, leave
  the steps out.

### Severity

Every item gets one severity. It answers one question: **how bad would this be
for a real client if it were left alone?** Use the document's own severity if it
states one. Otherwise, rate the worst case the document describes against this
scale:

| Severity     | Meaning                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Critical** | One client could see or change another client's data, or someone could get in without being approved |
| **High**     | Someone could act as a signed-in client, or harm them through the app, with a little extra effort |
| **Medium**   | An extra layer on top of protection that already works. No known way to cause harm by itself         |
| **Low**      | An inconvenience, a missing feature or a cosmetic issue. No risk to anyone's data                    |

Rate the problem, not the fix. A fixed item keeps the severity it had while it
was open. Features and requests that aren't faults are **Low**. If two levels
both seem to fit, pick the one the document's evidence supports and say why in
your chat reply, never in the report.

---

## 3 · Write it

The report is **pasted straight into the chat** (Slack), so the saved file is the message
itself, exactly as it will be sent. Nothing in it may need removing first.

Save to `docs/reports/<YYYY-MM-DD>-progress-report.md` (create the folder). If
that file already exists today, add `-2`, `-3`.

**Only reader-facing content.** Everything in the file is for the
non-technical reader. No notes to developers, no HTML comments, no
bookkeeping (tags, row IDs, source document names), no mentions of tests,
code, builds, branches or deployments, and no "for the team" asides. If
something only matters to a developer, it goes in your chat reply, not the
report. "How we know" stays, in plain words ("I tried it in a browser on
16 September", "built, not yet tried with a real client").

**Voice.** Set it from the step 0 answers.

_Who did the work:_

- **Just me** (default): first person singular. "I fixed", "I tested",
  "I'll build". Never "we" or "our team".
- **A team**: "we", "we tested", "we'll build". Still never name anyone.

_Who reads it:_

- **Group chat with the client in it** (default), or **sent to the client**:
  speak to the client as "you" and "your team". Never refer to them in the third
  person ("the client asked", "the client's team needs to decide"). Their request is
  "your request", their decision is "once you decide", and the people who sign
  in to the app are "your clients" (or "your users", whichever the client says).
- **Internal chat, no client**: name the client by their role or company
  ("the client", "the <company> team"), and write their decisions as "waiting on the
  client".

_Either way:_ other people who have to act are named by role ("whoever manages
the database"), never by name. When the client can read it, don't guess whose
job an open step is. If it isn't clear whether it's the user's, the client's or
someone else's, use the role and ask in your chat reply.

**Hard limits:** about 300 words, not counting the _Check it yourself_ steps.
Per item: a _Before_ and a _Now_ of one or two sentences each, plus at most one
more sentence. No code, no file paths, no route names, no header names, no
ticket IDs in the body. Explain any term you can't avoid in a few words
("a security header, an instruction that tells the browser what it may load").

**Write for someone who has never seen the code.**

- Short sentences, one idea each. Everyday words ("page", "button", "sign in",
  "the database, where your information is stored").
- Describe what a person sees or does, never what the software does inside.
- Numbers and dates in full ("16 September", "files up to 4 MB, about the size
  of a few phone photos").
- If a sentence would need a follow-up question to understand, rewrite it.

```markdown
# <Project name> progress, <D Month YYYY>

<One or two sentences, in the step 0 voice: the biggest result for you in this report, in bold, then what the report covers.>
Severity shows how serious each item would be for <your clients | the client's clients> if it were left alone.

## Fixed

**<Plain name of the problem>** · <Critical | High | Medium | Low>
_Before:_ <what used to happen, as a person would have seen or suffered it>
_Now:_ <what happens instead, or "Nothing looks different to you. The difference is that …"> **<The impact: the result for you or your clients, in one sentence.>**
<How I know, in plain words: "I tried it in a browser on 16 September.">

_Check it yourself_ (only when the rules in step 2 allow it)

1. <Where to go, e.g. "Open the app in your browser and sign in as usual.">
2. <One action, naming the on-screen label in quotes>
3. <…>
   You should see: <what I actually saw>. If you see <wrong result> instead, let me know.

## Still open

**<Plain name>** · <Critical | High | Medium | Low>
_Today:_ <what happens now, and why it matters>
_Once fixed:_ <what will be different> **<The impact: what you gain once it's done, or the risk until then.>**
<What it's waiting on, and who.>

## What to expect next

- <Next step, and roughly when or what it depends on>

## Before real clients use it

<Only if it applies: the checks that still have to happen. One or two sentences.>
```

Leave out any section that has nothing in it. Within **Fixed** and **Still
open**, order items by severity, most serious first. Keep the severity word
plain, with no emoji or colour, so it reads the same wherever it's pasted. Put a
blank line between items so each comparison stands on its own when pasted.

Then **run the text through the `humanizer` skill** and apply its fixes. No em
dashes, no filler, no inflated wording ("robust", "seamless", "comprehensive",
"leverage", "significantly enhanced"). Read it once more as someone who has
never heard of the project's internals. If a sentence needs the codebase to make
sense, rewrite it or drop it.

---

## 4 · Tag what you reported

Only after the report is saved, add or update the tag in **each `.md`** you
reported from, on the line directly after the `# title`:

- New tag: `<!-- reported: <today> · rows: <closed rows, comma-separated, or none> -->`
- Existing tag: replace it, keeping **all** closed rows (old and new) in `rows:`.
  Keep one tag per document, never two.

The tag goes in the **source documents only, never in the report**. It's an
HTML comment, so it doesn't show when the Markdown is rendered and it doesn't
change the `.html` companion. **Don't edit the `.html` files, the task
cards generator, or any `.build.py`.** No rebuild is needed.

Then add the report's row to `docs/README.md`, as every document under `docs/`
needs.

---

## 5 · Reply to the user

Keep it short:

1. The report's path, and the report text itself inside a ` ```markdown `
   block, byte-for-byte the same as the file, so it can be copied into Slack
   without edits
2. Which documents were tagged, and which rows each tag now lists
3. Anything you left out and why (unclear status, nothing new)
4. The step 0 answers you wrote for, and any open step whose owner you
   couldn't tell

`docs/` is gitignored, so the report is never committed and never named in a
commit or PR. It travels by being sent.

---

## Don't

- Re-report a tagged document with nothing newly closed
- Tag a document you didn't actually include
- Skip the step 0 questions, or reuse last run's answers without asking
- Mix voices. With the defaults it's "I" and "you" throughout, never "we" or "the client"
- Leave an item without a severity, or lower a fixed item's severity because it's fixed
- Call an open item "done", or a built-but-untried fix "working"
- Name people. Name roles ("whoever manages the hosting account")
- Copy the documents' technical reasoning in. The reader wants the outcome
- Leave an item without a _Before_ / _Now_ (or _Today_ / _Once fixed_) comparison
- Add a cost, time or growth claim to an item it doesn't truly apply to, or
  put a number on it that the documents don't state
- Leave an item without a bolded impact sentence, bold more than one sentence
  per item, or state an impact that hasn't been seen yet as if it had
- Write _Before_ / _Now_ as what the code does instead of what a person sees
- Give _Check it yourself_ steps that need a terminal, developer tools or access
  the reader doesn't have, or steps nobody actually ran
- Write "You should see" from what you expect rather than what you saw
- Write more than one report per run
- Put anything in the report meant for developers: comments, tags, test or code
  notes, internal asides. Those go in your chat reply
