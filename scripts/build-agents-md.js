#!/usr/bin/env node
// Renders AGENTS.md for Codex (the EXECUTOR): contract header + full conventions
// + a routed skill index (pointer style — full bodies live in .skills-source/).
// Usage: node build-agents-md.js [output-path]
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = process.argv[2] || "AGENTS.md";

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const o = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) o[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return o;
}

function findSkillFiles(dir) {
  const files = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const child = path.join(dir, entry.name);
    const skillFile = path.join(child, "SKILL.md");

    if (fs.existsSync(skillFile)) {
      files.push(skillFile);
    } else {
      files.push(...findSkillFiles(child));
    }
  }

  return files;
}

let doc = `# AGENTS.md — execution contract (generated from skills-source; do not edit)

You are the EXECUTOR on this project. Claude Design produced the UI/UX and plan;
Claude Code distilled them into the two docs below. Your job is to build, faithfully.

## Read these first, in this order
1. [PROJECT]Reference.md — UI & behavior source of truth. Screens are PORTED
   VERBATIM from design/prototypes/, never rebuilt from a written description.
2. [PROJECT] Task Plan.md — dependency-ordered phases. Work ONE phase at a time,
   top to bottom. Check off [ ] → [~] (in progress) → [x] (done, QA passed).
3. This file — code structure, naming, stack patterns, and the skill index below.

## Non-negotiables
- Conflict order: design/prototypes > design/system > design/planning >
  this file (code structure ONLY) > boilerplate UI (never wins, always discarded).
- Fidelity: a screen is done only when it passes every row of the Fidelity QA
  checklist at the end of the Task Plan. "Close enough" is a failure.
- Reuse-not-rebuild: auth, authz, GraphQL client/server, codegen, S3, CI are
  provided ([BP]) — extend the existing primitive, never re-implement it.
- Do not mark a phase [x] without running its QA rows. Do not skip ahead.
- If the Reference and this file disagree on anything visual, the Reference wins.
- If something is genuinely ambiguous, stop and ask instead of inventing.

## How to use the skill index
Each skill below lists WHEN it applies and WHERE its full instructions live
(inside .skills-source/, which is synced into this repo on npm install).
Before working on a surface or component a skill covers, OPEN and READ its
full instructions at the listed path. The one-line description is a router,
not the rule set. If .skills-source/ is missing, run: npm run sync-skills

`;

// 1) Full conventions inline
doc += "## Conventions\n\n";
for (const f of fs.readdirSync(path.join(root, "conventions")).sort()) {
  doc += fs.readFileSync(path.join(root, "conventions", f), "utf8") + "\n\n";
}

// 2) Skill summaries. Full bodies remain available to Claude Code and in the
// synced producer; keeping them out of AGENTS.md avoids exhausting Codex context.
doc +=
  "## Stack skills (routed index — read the full file before touching its surface)\n\n";
const skillsDir = path.join(root, "skills");
for (const p of findSkillFiles(skillsDir)) {
  const s = path.basename(path.dirname(p));
  const md = fs.readFileSync(p, "utf8");
  const fm = frontmatter(md);
  const source = path.relative(root, p).split(path.sep).join("/");
  doc += `### ${fm.name || s}\n_${fm.description || ""}_\n\n`;
  doc += `Full instructions: \`.skills-source/${source}\`\n\n`;
}

fs.writeFileSync(out, doc);
console.log("wrote", out);
