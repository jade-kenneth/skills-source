---
name: feature-rationale
description: Write a plain-language HTML guide that explains why a built feature looks and behaves the way it does, covering every field, dropdown, toggle, required mark, check, message and export section, including the parts that were not in the original objective but that the feature needs. Each choice gets a short answer, the reason in everyday words, what would go wrong the other way, and an honest label for how solid the reason is (outside rule checked, outside rule not yet checked, project safety rule, design choice, decided early and waiting on someone, or no recorded reason). Saved as a standalone house-style page under docs/feature-rationale/ by topic and run through the humanizer. Use after a feature lands (not a bug fix) and whenever someone asks "why was it built this way", "why a dropdown instead of a text box", "why is there an X", "why are there fields that weren't in the brief", or "explain the design decisions to a non-technical person".
---

# Feature rationale: why it was built this way, in plain words

Produce **one standalone HTML page per feature** that answers every "why is it
like this?" question a non-technical person could ask about it, before they have
to ask. The page is honest about which reasons are solid and which are guesses,
because a guide where every reason sounds certain teaches the reader to trust
the wrong ones.

The reader is whoever uses or owns the feature, not a developer. The outside
rules a feature answers to are the platforms and services it has to match: an
ad platform, a payment provider, a CMS, an identity provider. "Checked" means
someone confirmed a rule against the real service or its published docs, a test
covers it, or someone ran it and saw the result, and the page says which, with
the date. A test with the service mocked is *tested only*, not seen working.

---

## When this runs

| Runs | Does not run (use instead) |
|---|---|
| A feature landed or changed shape: a new screen, tab, step, field group, check or download section | A bug fix (`docs/bug-fixed/`, the `root-docs` skill) |
| Someone asks why a feature looks or behaves the way it does | How the code works, for a developer (`docs/how-it-works/`, `root-docs`) |
| A reviewer asks why something was added that the objective did not mention | A concept lesson (`learn`) or a progress update (`plain-report`) |

If the page for this feature already exists, **read it and update it in place.**
Change the checked date, add cards for new decisions, and strike a removed one
as `~~Why …~~ Removed <ISO date>: <reason>`. Never rewrite the page from scratch;
the cards you did not come to change are the ones most likely to be lost.

---

## 1 · Pin the feature and what was asked for

- **The feature:** what the user named, or the plan just executed. Name it the
  way its users say it ("the checkout settings tab"), never by a component name.
- **The objective:** what was actually asked for. Look in the brief the user
  gave, the task plan's *Objective* and *Scope*, and the source document's row.
  **Copy the list of what was asked for word for word.** It is the yardstick for
  every "added beyond the request" card.
- If nothing written says what was asked for, ask the user for it in one
  `AskUserQuestion` call. If they have nothing either, the page says plainly that
  there was no written objective to compare against, and drops the *Asked for*
  section instead of guessing one.

---

## 2 · Walk the feature and list every decision

Build the list from **the code and the screen**, never from memory or from the
plan alone. The plan says what was intended; the code says what was built.

| Look at | Collect |
|---|---|
| The screen component | Every field, dropdown, checkbox or toggle, required star, placeholder, helper line, button label, tab and its position, disabled or greyed state, warning, empty state |
| What appears only sometimes | Every field that shows only after another choice (an end date only when a fixed-length plan is picked) |
| The handler that saves it | What cannot be saved, what blocks approval, what is dropped, what is filled in automatically, what number or length limits apply |
| The types, constants and schema documents | Every fixed list of choices and where its values came from |
| The download or handoff | What it contains, in what order, and what it says is left out |
| The plan's *Out* list | What was left out on purpose |

Turn each item into **the question a staff member would ask**, in their words:

- "Why is this a dropdown when it only has one choice?"
- "Why do I have to enter an end date?"
- "Why can't I approve without a name?"
- "Why is this link optional but that one required?"

**Coverage rule:** every item you listed appears either in a card or in the
*Asked for, built as asked* list. Count both and write the counts in your chat
reply. An item that is in neither has been skipped.

---

## 3 · Find the real reason, and label how solid it is

Look for each reason in this order, and note where you found it:

1. A comment in the code next to it.
2. One of the project's non-negotiables (its `CLAUDE.md` or `AGENTS.md`),
   translated into plain words ("the app never saves a value it has not
   checked").
3. The task plan (a step, a risk row, a Phase 0 decision) or the source document.
4. An outside rule from a platform or service the feature has to match. Say
   whether someone checked it against the real service or its published docs,
   and when, whether only a test covers it, or whether it is general knowledge
   nobody has checked here.
5. An ease-of-use reason (fewer typos, one place to edit, nothing hidden).

**If you find no reason, the card says "No recorded reason."** Never invent one
to fill the gap. A missing reason is a finding, and it goes in your chat reply as
a question for the developer.

### The six labels: one per card, never blurred

| Label | Means | Page class |
|---|---|---|
| **Outside rule, checked** | Confirmed against the real service or its published docs, with the date | ok status |
| **Project safety rule** | One of the project's non-negotiables, such as never saving an unchecked value or never showing one customer another's data | ok status |
| **Outside rule, not yet checked** | From general knowledge, or covered only by a test with the service mocked. It could be wrong for the real setup | warning status |
| **Design choice** | Picked for ease of use. It could reasonably be done another way | neutral |
| **Decided early, waiting on <role>** | The code made a choice before the person who owns it answered | flag status |
| **No recorded reason** | Nobody wrote down why | flag status |

Use the status classes and tokens the project's existing pages already use.
Never add a colour.

**Count the labels in the masthead** ("14 decisions: 2 checked outside rules, 5
safety rules, 4 outside rules not yet checked, 2 design choices, 1 decided
early").
If every card is *checked* or *safety rule*, look again. A page with only strong
reasons is a poster, and the weak cards are the most useful ones to the reader.

---

## 4 · Write each card

| Part | What it holds |
|---|---|
| **The question** | The heading, in the reader's words |
| **Short answer** | One bold sentence |
| **Why** | Two to four short sentences in everyday words. One small everyday comparison is allowed per card, only where it helps |
| **If it were done the other way** | What would actually go wrong: a value the outside service refuses, a record nobody can use, the same thing set in two places |
| **How solid** | The label chip, plus one line: who checked and when, or who decides |
| **Could it change?** | What would change it ("if the business starts selling in a second country, this becomes a real choice") |
| **For the developer** | A closed `<details>` with the file and line, plan step or non-negotiable it came from. **The only place a code name may appear** |

### Worked example: the card to copy

> **Why is Currency a dropdown and not a text box?**
>
> **The payment provider only accepts a fixed set of currencies, so the screen only offers those.**
>
> *Why:* A payment provider takes a short list of currency codes. It never
> accepts free text. If this were a text box, someone could type "Canadian" or
> "CDN", and every payment would fail at the last step.
>
> *If it were a text box:* a typo would get saved, and nobody would find out
> until a real customer tried to pay.
>
> *How solid:* `Outside rule, not yet checked`. Payment providers work this
> way, but nobody has checked this list against the provider's account yet.
>
> *Could it change?* The list has one choice today, because the business only
> sells in one country. If that changes, more currencies get added after
> someone checks them with the provider.
>
> *For the developer:* the currency list in the checkout types, the matching
> server check, and the plan step that fixed the currency.

---

## 5 · The page

**Copy the house style from the fullest existing one-pager in the project's
`docs/`**: the token block, the typefaces with real fallback stacks, the class
vocabulary, the sticky grouped nav with its progress rail and current-section
label. Everything inline, a web-font link as the only outside request, and **a
file, never a published page**. The full recipe is `root-docs` →
`references/one-pager.md`. Leave out diagrams and animation switches unless the
feature has a flow that needs a picture. If you draw one, the `root-docs`
diagram rules apply.

Sections, in order, each with a meaningful `id`:

1. **Masthead** (`#top`): the feature's plain name, one sentence on what it does
   for its users, the pill with the decision count, and **the date and state of the
   code it was checked against** (a commit, or "uncommitted changes on
   <branch>").
2. **State strip**, three tiles: *Solid* (checked outside rules and safety rules) ·
   *Resting on something not yet checked* · *Waiting on someone, or no reason*.
3. **In 60 seconds** (`#summary`): an `.onesentence` panel, then the whole
   feature in plain terms, in the project's reading languages as its other pages
   do. Follow `root-docs` → `references/plain-terms.md`:
   one everyday analogy for the whole feature, ending on **What is still true:**
   (what is not settled yet).
4. **Asked for, and what was built** (`#asked`): the objective's list word for
   word beside what was built, then a table of **Added beyond the request**, one
   line of reason per row and a link to its card.
5. **The cards** grouped under four headings, and the nav uses the same groups:
   *Added beyond the request* (`#added`) · *How it looks and behaves* (`#looks`)
   · *Checks that stop you* (`#checks`) · *Left out on purpose* (`#left-out`).
6. **Still to decide** (`#open`): every *Decided early* and *No recorded reason*
   card as a question, who answers it (a role, never a name), and what changes
   once they answer.
7. **Things we noticed** (`#noticed`): weaknesses found while writing, in plain
   words, such as a dropdown with one choice or a value that will not clear. Tell
   the user about each in your chat reply. **Do not fix code while writing this
   page.**
8. **Footer:** the sources read (brief, plan, the screen, the handler, the
   types), each with the date read, and links to the feature's `how-it-works/`
   page or task plan if one exists.

---

## 6 · Plain words, then the humanizer

- **No code in the body:** no file names, routes, stored values, status codes or
  component names. Those go only in the *For the developer* details.
- **Use the on-screen labels in quotes** ("Save settings"), and the outside
  platform's own wording, not stored values ("Canadian dollars", never `CAD`
  alone).
- Short sentences, one idea each. Explain any term you cannot avoid in a few
  words ("a webhook, a message the payment provider sends back when a payment clears").
- "You" is whoever the page is for; decide once and keep it. Other people are
  roles ("the product owner", "whoever manages the payment account"), never
  names.
- A reason's strength is stated, never implied. "The provider requires this"
  only when someone checked it; otherwise "providers usually require this;
  nobody has checked this account yet".

Then **run every visible sentence through the `humanizer` skill** and apply its
fixes: no em dashes, no filler, no inflated words ("robust", "seamless",
"comprehensive", "leverage"). Read the page once as someone who has never seen
the code. If a sentence needs the codebase to make sense, rewrite it or cut it.

---

## 7 · Finish

- [ ] If the project's pages carry the reading assistant, rebuild it on every
      page and run its check (`root-docs` → `references/doc-assistant.md`).
- [ ] Render the page to an image and look at it before calling it done.
- [ ] Add the page's row to the docs index under *feature-rationale*.
- [ ] Nothing committed names a `docs/` path.
- [ ] Reply with: the path, the counts per label, the coverage counts from step 2,
      every *Decided early* and *No recorded reason* question (these need the
      user), and everything under *Things we noticed*.

---

## Don't

- Invent a reason, or dress a guess up as a rule
- Label a general-knowledge or test-only rule as checked, or a *Decided early* choice as
  a *Design choice* to make the page look finished
- Skip an element because it seems obvious. The obvious ones are what a new
  staff member asks about first
- Put code names, file paths or stored values in the body
- Write about a bug fix here, or fix code while writing the page
- Publish the page anywhere. It is a file that travels by being sent
- Name people. Name roles
