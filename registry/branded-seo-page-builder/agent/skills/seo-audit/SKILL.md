---
name: seo-audit
description: Apply on-page SEO checks when building a single branded HTML page — metadata, headings, schema, links, and images.
---

# Page SEO checklist

Use when planning or reviewing metadata, headings, canonical tags, internal links,
image alt text, and schema for a page this agent is **building** — not for full-site
audit reports unless the user explicitly asks.

## Schema detection limitation

`web_fetch` and `curl` cannot reliably detect structured data. Many CMS plugins inject
JSON-LD via client-side JavaScript — it will not appear in static HTML or `web_fetch`
output (which strips `<script>` tags).

Do not report "no schema found" from `web_fetch` or `curl` alone. When validating
schema on a live site, use the browser tool, Google Rich Results Test, or Screaming
Frog.

## Priority order for page building

1. **Indexability** — page is meant to be indexed; no accidental `noindex`
2. **On-page metadata** — title, description, canonical, Open Graph, Twitter cards
3. **Heading structure** — one `<h1>`, logical hierarchy, keyword-aligned sections
4. **Content quality** — answers search intent; claims grounded in source data
5. **Schema** — JSON-LD matching page intent (`WebPage`, `Organization`, `FAQPage`,
   `Product`, or `Service`)

## On-page checks

Apply every check before returning HTML. **Done when** each item is addressed or
marked N/A with a reason.

### Title and meta

- Unique `<title>` with primary keyword near the start (50–60 visible chars)
- Unique meta description with value proposition (150–160 chars)
- Self-referencing canonical URL on the page being built
- Open Graph and Twitter card tags aligned with title and description

### Headings and content

- Exactly one `<h1>` containing the primary keyword
- Logical hierarchy (`h1` → `h2` → `h3`); no skipped levels
- Primary keyword in the first 100 words when natural
- Descriptive link text — never "click here" or bare URLs
- Accessible `alt` on every image; decorative images use `alt=""`

### Structured data

- JSON-LD in `application/ld+json` matching page intent
- Claims in schema match visible page content and source data
- FAQ schema only when an FAQ section exists on the page

### Technical notes for generated pages

- `<html lang="...">` set correctly
- No remote scripts unless the user explicitly asked
- Image dimensions set when known to avoid layout shift

## Out of scope

Unless the user explicitly requests an audit report, do not produce a full-site
technical SEO audit. For deep dives on international SEO or AI-writing patterns, see
[international-seo](./references/international-seo.md) and
[ai-writing-detection](./references/ai-writing-detection.md).

## Output when building

Return SEO notes with: target search intent, primary keyword, secondary topics,
schema types used, and source URLs — per the agent output contract.
