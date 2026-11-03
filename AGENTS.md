# Agent guidance for Lago documentation

Use this repository to improve Lago's public developer documentation. Preserve the established Lago visual design and navigation unless a task explicitly requests a redesign.

## Sources of truth

- Use `docs.json` for site navigation and Mintlify configuration.
- Use `https://swagger.getlago.com/openapi.yaml` and `https://github.com/getlago/lago-openapi` for the exhaustive production API contract.
- Use `openapi.json` only as the concise same-origin discovery profile.
- Verify product, pricing, authentication, security, and operational claims against current Lago documentation or primary Lago sources.

## Content rules

- Prefer task-oriented guidance and exact links over generic marketing copy.
- Do not invent endpoints, fields, authentication flows, permissions, prices, limits, or product availability.
- Keep API keys and customer data out of examples.
- Explain approval and validation boundaries for financial or destructive actions.
- Keep agent-discovery pages machine-readable without adding them to visible navigation unless requested.

## Discoverability rules (search engines and coding agents)

- Every page has a `description` in its frontmatter: one sentence that names the task and the outcome. A page without one falls back to the site-wide description in `docs.json`, so add one when touching a page that lacks it.
- Headings name the task ("Send an event", "Void an invoice"), not a question. A page never opens with a sentence about itself ("This page covers…").
- Code first: each task has a copy-paste example (curl, or a `<CodeGroup>` with one tab per SDK) and the expected response or error. Prose explains only the rule, the limit or the decision.
- The canonical host is `https://getlago.com/docs`. Never write `doc.getlago.com` or `docs.getlago.com` in content, structured data, discovery files or `docs.json`; links inside the site are relative.
- The agent skill lives where Mintlify picks it up: the root `skill.md`, or `.mintlify/skills/<name>/SKILL.md`. Its frontmatter `description` is one line. Do not add skill or index files at other paths.
- `llms.txt` is a curated index, not a sitemap: add a page there only when it is the page that owns a task, keep every link in it alive, and add a redirect in `docs.json` for every removed or renamed URL.
- Do not add schema markup, FAQ blocks or summary boxes to win search or AI citations. Structured data only states what the visible text says.
- Do not remove entries from `contextual.options` in `docs.json`; `download-spec` is what publishes the API catalog at `/.well-known/api-catalog`.

## Validation

- Run `pnpm exec mint validate` after documentation or configuration changes.
- Check changed JSON files with a JSON parser.
- Run `npm run validate:agent-assets` after changing a discovery file (`skill.md`, `llms.txt`, `.well-known/`, `AGENTS.md`).
- Verify important routes and Markdown fallbacks in the deployed Mintlify preview.
- Confirm the visible homepage still matches the established design after changing `welcome.mdx`.
