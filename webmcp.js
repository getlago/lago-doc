(function registerLagoDocsAgentFeatures() {
  const organizationId = "https://getlago.com/#organization";
  if (!document.querySelector(`script[data-lago-organization="${organizationId}"]`)) {
    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.dataset.lagoOrganization = organizationId;
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: "Lago",
      legalName: "Get Lago Corp.",
      description:
        "Lago builds open-source, API-first billing infrastructure for usage metering, subscriptions, invoicing, payments, and revenue operations.",
      url: "https://getlago.com/",
      logo: "https://doc.getlago.com/logo/light.svg",
      sameAs: [
        "https://github.com/getlago",
        "https://www.linkedin.com/company/getlago",
        "https://x.com/GetLago",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales and support",
        email: "hello@getlago.com",
        url: "https://doc.getlago.com/contact",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "1111B S Governors Ave #7455",
        addressLocality: "Dover",
        addressRegion: "DE",
        postalCode: "19904",
        addressCountry: "US",
      },
    });
    document.head.append(structuredData);
  }

  // WebMCP's current imperative API is document.modelContext. The former
  // navigator.modelContext surface is deprecated, so this tool does not fall
  // back to it. Validation uses a document.modelContext-compatible client stub.
  if (!document.modelContext?.registerTool || window.__lagoDocsWebMcpRegistered) {
    return;
  }

  window.__lagoDocsWebMcpRegistered = true;

  const documents = [
    {
      title: "Developer resources",
      path: "/developers",
      description: "Authentication, OpenAPI, SDKs, webhooks, MCP, examples, status, and support.",
      keywords: "developer api sdk openapi support status"
    },
    {
      title: "API authentication",
      path: "/auth",
      description: "Create, use, restrict, rotate, and revoke Lago API keys safely.",
      keywords: "authentication api key bearer permission security"
    },
    {
      title: "API reference",
      path: "/api-reference/intro",
      description: "Lago Cloud base URLs, conventions, endpoints, and response contracts.",
      keywords: "rest endpoint request response schema"
    },
    {
      title: "Ingest usage events",
      path: "/guide/events/ingesting-usage",
      description: "Send idempotent product-usage events for metering and billing.",
      keywords: "event usage ingestion transaction id metering"
    },
    {
      title: "Billable metric aggregations",
      path: "/guide/billable-metrics/aggregation-types/overview",
      description: "Choose count, sum, unique count, latest, maximum, weighted sum, or custom aggregation.",
      keywords: "billable metric aggregation count sum usage"
    },
    {
      title: "Plans and pricing models",
      path: "/guide/plans/plan-model",
      description: "Model plans, charges, intervals, filters, and pricing rules.",
      keywords: "plan charge price pricing model interval"
    },
    {
      title: "Customer management",
      path: "/guide/customers/customer-management",
      description: "Create and manage billable customers using stable external identifiers.",
      keywords: "customer account external id billing"
    },
    {
      title: "Subscriptions",
      path: "/guide/subscriptions/assign-plan",
      description: "Assign plans and configure subscription lifecycle behavior.",
      keywords: "subscription assign plan lifecycle billing"
    },
    {
      title: "Invoicing",
      path: "/guide/invoicing/overview",
      description: "Generate, finalize, deliver, and manage invoices.",
      keywords: "invoice invoicing finalize credit note billing"
    },
    {
      title: "Webhooks",
      path: "/guide/webhooks",
      description: "Receive and verify asynchronous Lago billing events.",
      keywords: "webhook signature callback event asynchronous"
    },
    {
      title: "Lago MCP server",
      path: "/guide/ai-agents/mcp-server",
      description: "Connect agents to Lago documentation or authenticated billing tools through MCP.",
      keywords: "mcp agent ai tool model context protocol"
    },
    {
      title: "Self-hosted deployment",
      path: "/guide/lago-self-hosted/overview",
      description: "Deploy, configure, upgrade, and operate Lago on your infrastructure.",
      keywords: "self hosted deploy docker helm upgrade operations"
    }
  ];

  const words = (value) => String(value).toLowerCase().match(/[a-z0-9]+/g) || [];

  document.modelContext.registerTool({
    name: "search_lago_documentation",
    title: "Search Lago documentation",
    description: "Find authoritative Lago documentation for an API, billing workflow, integration, or deployment task. This read-only tool returns canonical documentation links and summaries.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["query"],
      properties: {
        query: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "The Lago topic or implementation task to find documentation for."
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 8,
          default: 5,
          description: "Maximum number of documentation results to return."
        }
      }
    },
    execute: async ({ query, limit = 5 }) => {
      const queryWords = words(query);
      const ranked = documents
        .map((document) => {
          const titleWords = words(document.title);
          const searchable = new Set(words(`${document.title} ${document.description} ${document.keywords}`));
          const score = queryWords.reduce(
            (total, word) => total + (titleWords.includes(word) ? 3 : searchable.has(word) ? 1 : 0),
            0
          );
          return { document, score };
        })
        .filter(({ score }) => score > 0)
        .sort((left, right) => right.score - left.score || left.document.title.localeCompare(right.document.title))
        .slice(0, limit)
        .map(({ document }) => ({
          title: document.title,
          url: new URL(document.path, window.location.origin).href,
          description: document.description
        }));

      const results = ranked.length
        ? ranked
        : documents.slice(0, Math.min(limit, 3)).map((document) => ({
            title: document.title,
            url: new URL(document.path, window.location.origin).href,
            description: document.description
          }));

      return {
        content: [
          {
            type: "text",
            text: results.map((result) => `${result.title}: ${result.url} — ${result.description}`).join("\n")
          }
        ],
        structuredContent: {
          query,
          results
        }
      };
    }
  }).catch(() => {
    window.__lagoDocsWebMcpRegistered = false;
  });
})();
