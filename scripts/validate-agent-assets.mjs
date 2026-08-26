import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const mirroredFiles = [
  ["lago-skill.md", "skills/lago-billing/SKILL.md"],
  ["ai-catalog.json", ".well-known/ai-catalog.json"],
  ["api-catalog.json", ".well-known/api-catalog.json"],
  ["api-catalog.json", ".well-known/api-catalog"],
];

for (const [canonicalPath, mirrorPath] of mirroredFiles) {
  const [canonical, mirror] = await Promise.all([
    readFile(canonicalPath),
    readFile(mirrorPath),
  ]);

  if (!canonical.equals(mirror)) {
    throw new Error(`${mirrorPath} has drifted from ${canonicalPath}`);
  }
}

const skill = await readFile("lago-skill.md");
const index = JSON.parse(await readFile("agent-skills-index.json", "utf8"));
const digest = `sha256:${createHash("sha256").update(skill).digest("hex")}`;

if (index.skills?.[0]?.digest !== digest) {
  throw new Error(
    `agent-skills-index.json digest ${index.skills?.[0]?.digest} does not match ${digest}`,
  );
}

console.log("Agent discovery mirrors and skill digest are consistent.");
