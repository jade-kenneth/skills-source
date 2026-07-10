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

let doc =
  "# AGENTS.md — Project conventions (generated from skills-source, do not edit)\n\n";

// 1) Full conventions inline
doc += "## Conventions\n\n";
for (const f of fs.readdirSync(path.join(root, "conventions"))) {
  doc += fs.readFileSync(path.join(root, "conventions", f), "utf8") + "\n\n";
}

// 2) Skill summaries (name + description + body)
doc += "## Stack skills\n\n";
const skillsDir = path.join(root, "skills");
for (const cat of fs.readdirSync(skillsDir)) {
  const catDir = path.join(skillsDir, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const s of fs.readdirSync(catDir)) {
    const p = path.join(catDir, s, "SKILL.md");
    if (!fs.existsSync(p)) continue;
    const md = fs.readFileSync(p, "utf8");
    const fm = frontmatter(md);
    const body = md.replace(/^---\n[\s\S]*?\n---\n?/, "");
    doc += `### ${fm.name || s}\n_${fm.description || ""}_\n\n${body}\n\n`;
  }
}

fs.writeFileSync(out, doc);
console.log("wrote", out);
