#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIR, '../../..');
const SKILLS_ROOT = path.join(REPOSITORY_ROOT, 'skills');
const ID_PATTERN = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TARGET_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_KINDS = new Set(['bug-fix', 'security', 'reliability', 'performance', 'integration', 'architecture', 'developer-experience']);
const SECRET_PATTERNS = [/-----BEGIN [A-Z ]+ PRIVATE KEY-----/i, /mongodb(?:\+srv)?:\/\//i, /\bgh[ps]_[A-Za-z0-9]{20,}\b/, /\bsk-[A-Za-z0-9_-]{20,}\b/, /\bAKIA[0-9A-Z]{16}\b/];
const SENSITIVE_PATH = /(^|\/)(?:\.env(?:\.|$)|.*\.(?:pem|p8|p12|key|mobileprovision)$)/i;

function fail(message) { throw new Error(message); }
function option(name) { const index = process.argv.indexOf(name); return index === -1 ? '' : process.argv[index + 1] || ''; }
function readProposal(file) { if (!file) fail('Pass --file <skill-contributions/proposal.json>.'); return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')); }
function nonEmptyString(value, field) { if (typeof value !== 'string' || !value.trim()) fail(`${field} must be a non-empty string.`); }
function nonEmptyStrings(value, field) { if (!Array.isArray(value) || !value.length) fail(`${field} must be a non-empty array.`); value.forEach((item, index) => nonEmptyString(item, `${field}[${index}]`)); }
function availableSkills() {
  if (!fs.existsSync(SKILLS_ROOT)) fail(`Skills directory not found: ${SKILLS_ROOT}`);
  return new Set(fs.readdirSync(SKILLS_ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory()).filter((entry) => fs.existsSync(path.join(SKILLS_ROOT, entry.name, 'SKILL.md'))).map((entry) => entry.name));
}
function inspectForSecrets(value, field = 'proposal') {
  if (typeof value === 'string') { if (SECRET_PATTERNS.some((pattern) => pattern.test(value))) fail(`${field} appears to contain a credential or connection string.`); return; }
  if (Array.isArray(value)) { value.forEach((item, index) => inspectForSecrets(item, `${field}[${index}]`)); return; }
  if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => inspectForSecrets(item, `${field}.${key}`));
}
function validate(proposal) {
  if (proposal.schemaVersion !== 1) fail('schemaVersion must be 1.');
  nonEmptyString(proposal.id, 'id');
  if (!ID_PATTERN.test(proposal.id)) fail('id must use YYYY-MM-DD-kebab-case.');
  nonEmptyString(proposal.title, 'title');
  nonEmptyStrings(proposal.targetSkills, 'targetSkills');
  const known = availableSkills();
  const uniqueTargets = new Set();
  for (const target of proposal.targetSkills) {
    if (!TARGET_PATTERN.test(target)) fail(`Invalid target skill name: ${target}`);
    if (!known.has(target)) fail(`Unknown target skill '${target}' in the locked skills snapshot.`);
    if (uniqueTargets.has(target)) fail(`Duplicate target skill: ${target}`);
    uniqueTargets.add(target);
  }
  if (!ALLOWED_KINDS.has(proposal.kind)) fail(`kind must be one of: ${[...ALLOWED_KINDS].join(', ')}.`);
  nonEmptyString(proposal.symptom, 'symptom');
  nonEmptyString(proposal.rootCause, 'rootCause');
  nonEmptyStrings(proposal.reusableRules, 'reusableRules');
  nonEmptyStrings(proposal.verification, 'verification');
  if (!Array.isArray(proposal.evidence) || !proposal.evidence.length) fail('evidence must be a non-empty array.');
  proposal.evidence.forEach((item, index) => {
    if (!item || typeof item !== 'object') fail(`evidence[${index}] must be an object.`);
    nonEmptyString(item.path, `evidence[${index}].path`);
    nonEmptyString(item.note, `evidence[${index}].note`);
    if (path.isAbsolute(item.path) || item.path.split('/').includes('..')) fail(`evidence[${index}].path must be a repository-relative path.`);
    if (SENSITIVE_PATH.test(item.path)) fail(`evidence[${index}].path points to a sensitive file and must not be contributed.`);
  });
  if (proposal.excludedProjectDetails !== undefined) nonEmptyStrings(proposal.excludedProjectDetails, 'excludedProjectDetails');
  inspectForSecrets(proposal);
  return proposal;
}
function render(proposal) {
  const targets = proposal.targetSkills.map((skill) => `\`${skill}\``).join(', ');
  const evidence = proposal.evidence.map((item) => `- \`${item.path}\` — ${item.note}`).join('\n');
  const rules = proposal.reusableRules.map((rule) => `- ${rule}`).join('\n');
  const verification = proposal.verification.map((item) => `- ${item}`).join('\n');
  const excluded = (proposal.excludedProjectDetails || ['None recorded.']).map((item) => `- ${item}`).join('\n');
  return [`# ${proposal.title}`, '', `- **Proposal ID:** \`${proposal.id}\``, `- **Kind:** \`${proposal.kind}\``, `- **Target skills:** ${targets}`, '', '## Symptom', '', proposal.symptom, '', '## Root cause', '', proposal.rootCause, '', '## Reusable rules', '', rules, '', '## Product evidence', '', evidence, '', '## Verification performed', '', verification, '', '## Project-specific details excluded', '', excluded, '', '## Promotion checklist', '', '- [ ] Evidence is sufficient and contains no private/product-specific data.', '- [ ] Target skill categorization is correct.', '- [ ] No rule duplicates an existing reference; amendments were applied in place at the cited reference.', '- [ ] Primary documentation was checked where behavior may have changed.', '- [ ] The smallest relevant reference and routing entry were updated.', '- [ ] Eval coverage was added or updated.', '- [ ] `./scripts/validate.sh` passes.', ''].join('\n');
}

const command = process.argv[2] || 'validate';
const proposal = validate(readProposal(option('--file')));
if (command === 'validate') console.log(`Valid project-learning proposal '${proposal.id}' for ${proposal.targetSkills.join(', ')}.`);
else if (command === 'render') process.stdout.write(render(proposal));
else fail(`Unknown command '${command}'. Use validate or render.`);
