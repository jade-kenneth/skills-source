#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const agentsPath = process.argv[2];
const sourceRoot = process.argv[3];
if (!agentsPath || !sourceRoot) {
  console.error(
    "Usage: node validate-generated-agents.js <AGENTS.md> <skills-source-root>",
  );
  process.exit(2);
}

function findSkillFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(dir, entry.name);
    const skillFile = path.join(child, "SKILL.md");
    if (fs.existsSync(skillFile)) files.push(skillFile);
    else files.push(...findSkillFiles(child));
  }
  return files;
}

const markdown = fs.readFileSync(agentsPath, "utf8");
const marker =
  "## Stack skills (routed index — read the full file before touching its surface)";
const markerIndex = markdown.indexOf(marker);
if (markerIndex === -1) throw new Error("Generated skill index is missing");

const index = markdown.slice(markerIndex + marker.length);
const entryPattern =
  /^### ([^\n]+)\n_([\s\S]*?)_\n\nFull instructions: `([^`]+)`/gm;
const entries = [...index.matchAll(entryPattern)].map((match) => ({
  name: match[1].trim(),
  description: match[2].trim(),
  source: match[3].trim(),
}));
const expectedCount = findSkillFiles(path.join(sourceRoot, "skills")).length;

if (entries.length !== expectedCount) {
  throw new Error(
    `Generated ${entries.length} skill entries; expected ${expectedCount}`,
  );
}

const names = new Set();
const invalidDescriptions = new Set(["", ">", ">-", "|", "|-"]);
for (const entry of entries) {
  if (names.has(entry.name)) throw new Error(`Duplicate skill: ${entry.name}`);
  if (invalidDescriptions.has(entry.description)) {
    throw new Error(`Invalid description for skill: ${entry.name}`);
  }
  names.add(entry.name);

  const relativeSource = entry.source.replace(/^\.skills-source\//, "");
  if (!fs.existsSync(path.join(sourceRoot, relativeSource))) {
    throw new Error(`Missing routed source for ${entry.name}: ${entry.source}`);
  }
}

console.log(`Validated ${entries.length} generated skill entries`);
