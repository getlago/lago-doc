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

const openapi = JSON.parse(await readFile("openapi.json", "utf8"));
const contract = JSON.parse(
  await readFile("scripts/fixtures/api-contract-shapes.json", "utf8"),
);

for (const [responseName, schemaName] of Object.entries(
  contract.error_response_schemas,
)) {
  const actualRef =
    openapi.components?.responses?.[responseName]?.content?.["application/json"]
      ?.schema?.$ref;
  const expectedRef = `#/components/schemas/${schemaName}`;

  if (actualRef !== expectedRef) {
    throw new Error(
      `${responseName} uses ${actualRef ?? "no schema"}; expected ${expectedRef}`,
    );
  }
}

if (openapi.components.schemas.LagoError || openapi.components.schemas.ServerError) {
  throw new Error(
    "The public REST contract must not expose a union or development-only server error envelope",
  );
}

const apiErrorRequired = openapi.components.schemas.ApiError?.required;
if (JSON.stringify(apiErrorRequired) !== JSON.stringify(contract.api_error_required)) {
  throw new Error(
    `ApiError required fields ${JSON.stringify(apiErrorRequired)} do not match the recorded contract`,
  );
}

const internalServerErrorExample =
  openapi.components.responses.InternalServerError.content["application/json"].example;
if (
  JSON.stringify(internalServerErrorExample) !==
  JSON.stringify(contract.internal_server_error_example)
) {
  throw new Error("The 500 example has drifted from Rails' production JSON response");
}

const serializedOpenapi = JSON.stringify(openapi);
if (serializedOpenapi.includes("backtrace")) {
  throw new Error("The public REST contract must not expose server backtraces");
}

const paginationMeta = openapi.components.schemas.PaginationMeta;
const paginationProperties = Object.keys(paginationMeta?.properties ?? {});
if (
  JSON.stringify(paginationMeta?.required) !==
    JSON.stringify(contract.pagination_meta.required) ||
  JSON.stringify(paginationProperties) !==
    JSON.stringify(contract.pagination_meta.properties)
) {
  throw new Error(
    "PaginationMeta has drifted from the recorded production OpenAPI shape",
  );
}

console.log(
  "Agent discovery assets and recorded API contract shapes are consistent.",
);
