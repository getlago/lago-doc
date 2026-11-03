import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const mirroredFiles = [
  ["skill.md", "skills/lago-billing/SKILL.md"],
  ["ai-catalog.json", ".well-known/ai-catalog.json"],
  ["api-catalog.json", ".well-known/api-catalog.json"],
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

const skill = await readFile("skill.md", "utf8");
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const description = frontmatter.match(/^description:(.*)$/m)?.[1]?.trim();
const nextLine = frontmatter.match(/^description:.*\n( +\S)/m);

if (!description || nextLine) {
  throw new Error(
    "skill.md needs a one-line description: the agent skills index and the agent card keep only its first line",
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

for (const [path, pathItem] of Object.entries(openapi.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!new Set(["get", "post", "put", "patch", "delete"]).has(method)) {
      continue;
    }

    if (
      operation.responses?.default?.$ref !==
      "#/components/responses/UnexpectedError"
    ) {
      throw new Error(`${method.toUpperCase()} ${path} has no typed default error`);
    }
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

const appendedElements = [];
const registeredTools = [];
runInNewContext(await readFile("webmcp.js", "utf8"), {
  document: {
    createElement: () => ({ dataset: {} }),
    head: { append: (element) => appendedElements.push(element) },
    modelContext: {
      registerTool: (tool) => {
        registeredTools.push(tool);
        return Promise.resolve();
      },
    },
    querySelector: () => null,
  },
  URL,
  window: {},
});

const organization = JSON.parse(appendedElements[0]?.textContent ?? "null");
if (
  organization?.contactPoint?.email !== "hello@getlago.com" ||
  organization?.address?.addressCountry !== "US"
) {
  throw new Error("The agent-facing Organization data is incomplete");
}

if (registeredTools[0]?.name !== "search_lago_documentation") {
  throw new Error("The Lago documentation WebMCP tool did not register");
}

console.log(
  "Agent discovery assets and recorded API contract shapes are consistent.",
);
