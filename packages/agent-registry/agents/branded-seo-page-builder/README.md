# Branded SEO Page Builder

An on-demand Eve agent that turns a domain into a complete SEO-optimized HTML
page. It connects to Context.dev's hosted MCP server to resolve brand metadata,
scrape homepage content, and extract design-system signals, then applies the
bundled `seo-audit` and `ai-seo` skills to produce search-ready static HTML.

## What it does

1. **Connects to Context.dev MCP** — uses the hosted MCP server at
   `https://context-dev.stlmcp.com`, authenticated with the
   `x-context-dev-api-key` header.
2. **Resolves brand data with Context.dev** — pulls company name, description,
   colors, logos, industry labels, and related metadata from a domain.
3. **Scrapes source content** — reads the homepage or a user-provided page URL as
   clean markdown so the generated copy is grounded in existing brand language.
4. **Extracts style cues** — optionally pulls Context.dev styleguide data for
   colors, typography, spacing, shadows, and component cues.
5. **Generates SEO HTML** — returns one complete HTML document with semantic
   sections, metadata, Open Graph tags, Twitter card tags, accessible image alt
   text, and JSON-LD schema.
6. **Optimizes for AI search** — loads the bundled `ai-seo` skill so the page is
   extractable and citable by answer engines while staying people-first.

## Skills

- **seo-audit** — technical and on-page SEO checks for metadata, headings,
  canonicalization, schema, accessibility, and crawlability.
- **ai-seo** — answer engine optimization patterns for extractable sections,
  answer blocks, FAQs, and LLM-friendly structure.

Both skills are vendored from
`https://github.com/coreyhaines31/marketingskills/tree/main/skills`.

## Installation

```bash
npx shadcn@latest add https://evex.sh/r/branded-seo-page-builder
```

Install the public runtime dependencies listed by the registry item if your Eve
app does not already have them.

## Configuration

Copy `.env.example` into your Eve app environment and fill in the Context.dev
credential.

```env
CONTEXT_DEV_API_KEY=ctxt_secret_...
```

`CONTEXT_API_KEY` is also supported as a fallback for projects that already use
that name, but `CONTEXT_DEV_API_KEY` is the documented Context.dev standard. The
Eve MCP connection sends the resolved key as the `x-context-dev-api-key` header.

Never expose the Context.dev key to browser-side code. This agent sends it only
from the Eve MCP connection runtime.

## Usage

Ask the agent for a page from a domain:

```text
Create an SEO-optimized landing page for linear.app.
```

You can also provide a specific source page:

```text
Build a product page from https://example.com/product and target "AI support automation".
```

The agent returns:

1. A complete HTML document in one fenced `html` block.
2. SEO notes with search intent, primary keyword, secondary topics, schema types,
   and Context.dev source URLs.
3. Assumptions when any copy was inferred instead of directly sourced.

## Smoke test

1. Set `CONTEXT_DEV_API_KEY` in the Eve app environment.
2. Start the app in development:

   ```bash
   pnpm dev
   ```

3. In your Eve chat/client, ask:

   ```text
   Generate an SEO HTML homepage for stripe.com.
   ```

4. Confirm the agent uses the `context-dev` MCP connection, then returns a full
   `<!doctype html>` document with metadata, JSON-LD, semantic sections, and SEO
   notes listing Context.dev source URLs.

## Troubleshooting

- **`CONTEXT_DEV_API_KEY is required`** — set `CONTEXT_DEV_API_KEY` in the Eve app
  environment and restart the server.
- **`Context.dev API 401`** — the key is missing, revoked, or copied incorrectly.
- **`Context.dev API 408` or `429`** — the MCP call hit a cold-start timeout or
  rate limit. Retry later or lower concurrent usage.
- **No brand facts in the HTML** — Context.dev did not return enough brand data
  and the agent refused to invent claims. Provide more source copy or a specific
  page URL.
- **Unexpected visual style** — pass a specific source page URL or disable
  styleguide use by asking the agent to call Context without styleguide data.

## Development

```bash
pnpm install
pnpm info
pnpm build
```

Run `pnpm typecheck` while editing the Context MCP connection.
