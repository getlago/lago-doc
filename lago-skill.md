---
name: lago-billing-integration
description: Use when designing or implementing usage metering, subscriptions, pricing, invoicing, payments, entitlements, prepaid credits, or billing operations with Lago.
license: AGPL-3.0-only
metadata:
  author: Lago
  version: 1.0.0
  homepage: https://doc.getlago.com/developers
---

# Lago billing integration

Use this skill when a task involves Lago billing architecture, API integration, usage-event ingestion, pricing configuration, customer and subscription management, invoicing, payments, entitlements, prepaid credits, or billing operations.

## Start with discovery

1. Read the [developer portal](https://doc.getlago.com/developers.md) for the supported entry points.
2. Use the [same-origin OpenAPI discovery profile](https://doc.getlago.com/openapi.json) for representative operations and the [complete production OpenAPI contract](https://swagger.getlago.com/openapi.yaml) for exhaustive schemas.
3. Read the relevant workflow guide before constructing requests. Exact API fields and current product documentation take precedence over examples or prior knowledge.
4. Use the [Lago Docs MCP server](https://doc.getlago.com/mcp) for read-only documentation search and retrieval.

## Authentication and environment

- Lago Cloud REST requests use an organization API key as a Bearer credential.
- Keep keys in server-side secret storage. Never put a production key in prompts, browser code, mobile clients, source control, or client-visible logs.
- Set the API base URL explicitly for the target deployment:
  - US Cloud: `https://api.getlago.com/api/v1`
  - EU Cloud: `https://api.eu.getlago.com/api/v1`
  - Self-hosted: the Lago API origin followed by `/api/v1`
- Confirm the deployment, organization, and environment before constructing URLs or operational instructions. For the Product MCP, pass the selected base URL through `LAGO_API_URL`.
- Do not invent an OAuth flow, sandbox, endpoint, field, permission, price, or product limit that Lago has not published.

## Integration workflow

1. Model customers with stable external identifiers from the calling system.
2. Define billable metrics and plans before ingesting billable usage.
3. Create subscriptions that connect customers to plans and verify their effective dates and billing cadence.
4. Send usage events with a unique `transaction_id`; reuse it only when retrying the same logical event.
5. Consume webhooks idempotently, tolerate retries and reordering, and retrieve current API state when the next action depends on it.
6. Reconcile fees, invoices, credit notes, wallet balances, and payments before triggering accounting or collection workflows.

## Safety boundaries

- Read-only discovery can run automatically when the caller is authorized.
- Validate the target organization, environment, customer, subscription, plan, currency, amount, and effective date before a mutation.
- Follow the operator's approval policy for backdating, wallet funding, invoice finalization, credit notes, payment collection, subscription termination, bulk changes, and other financial corrections.
- Surface API errors rather than retrying authentication, authorization, or validation failures blindly.
- Use bounded exponential backoff for transient failures and preserve the original idempotency identifier on a retry.

## Authoritative resources

- Developer portal: https://doc.getlago.com/developers.md
- Authentication: https://doc.getlago.com/auth.md
- API overview: https://doc.getlago.com/api-reference/intro.md
- API standards: https://doc.getlago.com/api-reference/api-standards.md
- API versioning: https://doc.getlago.com/api-reference/versioning.md
- Structured errors: https://doc.getlago.com/api-reference/errors.md
- Usage ingestion: https://doc.getlago.com/guide/events/ingesting-usage.md
- Webhooks: https://doc.getlago.com/guide/webhooks.md
- Integration testing: https://doc.getlago.com/guide/integration-testing.md
- Pricing and packaging: https://doc.getlago.com/pricing.md
- Service status: https://status.getlago.com/
