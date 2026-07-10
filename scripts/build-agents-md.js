#!/usr/bin/env node
// Renders AGENTS.md for Codex from conventions + skill summaries.
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

let doc =
  "# AGENTS.md — Project conventions (generated from skills-source, do not edit)\n\n";

// 1) Full conventions inline
doc += "## Conventions\n\n";
for (const f of fs.readdirSync(path.join(root, "conventions")).sort()) {
  doc += fs.readFileSync(path.join(root, "conventions", f), "utf8") + "\n\n";
}

// 2) Skill summaries. Full bodies remain available to Claude Code and in the
// synced producer; keeping them out of AGENTS.md avoids exhausting Codex context.
doc += "## Stack skills\n\n";
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
