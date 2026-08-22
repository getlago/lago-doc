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

## Validation

- Run `pnpm exec mint validate` after documentation or configuration changes.
- Check changed JSON files with a JSON parser.
- Verify important routes and Markdown fallbacks in the deployed Mintlify preview.
- Confirm the visible homepage still matches the established design after changing `welcome.mdx`.
