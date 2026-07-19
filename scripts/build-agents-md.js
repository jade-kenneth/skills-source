#!/usr/bin/env node
// Renders AGENTS.md for Codex (the EXECUTOR): contract header + full conventions
// + a routed skill index (pointer style — full bodies live in .skills-source/).
// Usage: node build-agents-md.js [output-path]
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = process.argv[2] || "AGENTS.md";
const sourceRevision = process.env.SKILLS_SOURCE_SHA || "";

function frontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result = {};
  const lines = match[1].split("\n");
  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const line = lines[lineNumber];
    const separator = line.indexOf(":");
    if (separator <= 0 || /^\s/.test(line)) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if ([">", ">-", "|", "|-"].includes(value)) {
      const parts = [];
      while (
        lineNumber + 1 < lines.length &&
        /^\s+/.test(lines[lineNumber + 1])
      ) {
        parts.push(lines[(lineNumber += 1)].trim());
      }
      value = parts.join(value.startsWith("|") ? "\n" : " ");
    } else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const quote = value[0];
      value = value.slice(1, -1);
      if (quote === '"') value = value.replace(/\\"/g, '"');
      if (quote === "'") value = value.replace(/''/g, "'");
    }

    result[key] = value;
  }

  return result;
}

function findSkillFiles(dir) {
  const files = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

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

const revisionNotice = sourceRevision
  ? `\nSource revision: \`jade-kenneth/skills-source@${sourceRevision}\`\n`
  : "";

let doc = `# AGENTS.md — execution contract (generated from skills-source; do not edit)
${revisionNotice}
You are the EXECUTOR on this project. Claude Design produced the UI/UX handoff;
Claude Code reconciled it with this repository. Your job is to build faithfully.

## Automatic project context — no repeated user instruction required
Before planning, editing, reviewing, or implementing application code:

1. Read the repository-root \`Product Specification.md\` and
   \`Implementation Plan.md\`. Do not use similarly named files under
   \`design/\`, \`.skills-source/\`, dependencies, generated output, or nested copies.
2. The Product Specification owns verified UI and behavior. The Implementation
   Plan owns dependency order, scope, phase status, and Fidelity QA.
3. Read this AGENTS.md for code structure, naming, stack patterns, and skills.
4. If either canonical root document is missing, stop and ask for
   \`/finalize-build-docs <project name>\` instead of guessing or using a legacy file.

The user does not need to repeat “read AGENTS.md, Product Specification.md, and
Implementation Plan.md.” Treat that context load as the default start of every
application task.
For an implementation request, follow the phase the user names; otherwise resume
the single \`[~]\` phase, or start the first unblocked \`[ ]\` phase when none is in
progress. Check \`[ ]\` → \`[~]\` → \`[x]\` only after the phase's QA rows pass.

## Non-negotiables
- Conflict order: design/prototypes > design/system > design/planning >
  this file (code structure ONLY) > boilerplate UI (never wins, always discarded).
- Fidelity: a screen is done only when it passes every row of the Fidelity QA
  checklist at the end of the Implementation Plan. "Close enough" is a failure.
- Prototype boundary: implement only \`data-app-root\`; never ship device frames,
  preview shells, presentation canvases, annotations, or presentation-only content.
- Platform-native conversion: web may reuse compatible markup; Expo/React Native
  must use native primitives and must not ship prototype HTML in a WebView or copy
  fixed preview dimensions into a production container.
- Prototype-to-production boundary: prototypes own visual and interaction outcomes,
  not implementation mechanics. Never carry prototype-local data, manual-only
  validation, inline mock handlers, hard-coded permissions, or fake persistence
  into production. Resolve the production path from current project configuration,
  the approved Implementation Plan, protected foundations that actually exist,
  nearby end-to-end exemplars, and then the routed app skill. Reuse GraphQL,
  codegen, TanStack Query, form schemas, and API layers when this repository
  provides them; otherwise use its configured equivalents.
- Reuse-not-rebuild: auth, authz, GraphQL client/server, codegen, S3, CI are
  provided ([BP]) — extend the existing primitive, never re-implement it.
- Do not mark a phase [x] without running its QA rows. Do not skip ahead.
- If the Product Specification and this file disagree on anything visual, the Product Specification wins.
- If something is genuinely ambiguous, stop and ask instead of inventing.

## How to use the skill index
Each skill below lists WHEN it applies and WHERE its full instructions live
(inside .skills-source/, which is hydrated from the committed lock file).
Before working on a surface or component a skill covers, OPEN and READ its
full instructions at the listed path. The one-line description is a router,
not the rule set. If .skills-source/ is missing, run: npm run sync-skills

`;

doc += "## Conventions\n\n";
const conventionFiles = fs
  .readdirSync(path.join(root, "conventions"))
  .filter((file) => file.endsWith(".md"))
  .sort();
for (const file of conventionFiles) {
  doc +=
    fs.readFileSync(path.join(root, "conventions", file), "utf8").trimEnd() +
    "\n\n";
}

doc +=
  "## Stack skills (routed index — read the full file before touching its surface)\n\n";
const seenNames = new Set();
const invalidDescriptions = new Set(["", ">", ">-", "|", "|-"]);
for (const skillFile of findSkillFiles(path.join(root, "skills"))) {
  const fallbackName = path.basename(path.dirname(skillFile));
  const markdown = fs.readFileSync(skillFile, "utf8");
  const metadata = frontmatter(markdown);
  const name = metadata.name || fallbackName;
  const description = metadata.description || "";

  if (seenNames.has(name)) {
    throw new Error(`Duplicate skill name: ${name}`);
  }
  if (invalidDescriptions.has(description.trim())) {
    throw new Error(`Invalid or empty description for skill: ${name}`);
  }
  seenNames.add(name);

  const source = path.relative(root, skillFile).split(path.sep).join("/");
  doc += `### ${name}\n_${description}_\n\n`;
  doc += `Full instructions: \`.skills-source/${source}\`\n\n`;
}

fs.writeFileSync(out, doc);
console.log("wrote", out);
