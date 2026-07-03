---
name: ai-seo
description: Make page content citable by AI search — extractable structure, authority signals, and machine-readable files. Use when writing page body copy for AI visibility.
---

# AI SEO

Optimize page content so AI systems can **cite** it — not just rank it. Traditional
SEO gets you ranked; AI SEO gets you **cited** in generated answers.

## Before writing

Ground copy in Context.dev brand and page data. Do not write separate "AI-only"
content — that risks scaled content abuse. Write for people; organize for clarity.

## Cited vs ranked

| Traditional SEO | AI SEO |
|-----------------|--------|
| Rank on page 1 | Get cited as a source |
| Keyword placement | Extractable answer blocks |
| Backlinks | Authority signals + structure |

**Google AI Overviews** follow core Search quality — helpful, people-first content
with strong E-E-A-T. **Other engines** (ChatGPT, Perplexity, Claude) reward
extractable structure, FAQs, comparison tables, and machine-readable files.

When in doubt: write for people, organize for clarity. That satisfies both.

## Three pillars

Apply all three before returning HTML. **Done when** every pillar is addressed.

### 1. Structure — make it extractable

AI systems extract passages, not pages. Every key claim should work standalone.

- Lead each section with a direct answer
- Keep key answer passages to 40–60 words
- Use headings that match how people phrase queries
- Tables beat prose for comparisons; numbered lists beat paragraphs for processes
- Include an FAQ or answer-focused section when it fits page intent

For block templates, see [content-patterns](./references/content-patterns.md).

### 2. Authority — make it citable

- Cite sources with links where claims need backing
- Include specific statistics with dates when source data provides them
- Name authors or expertise when available from source data
- Do not invent statistics, awards, customers, or testimonials

### 3. Presence — machine-readable files

When the generated site should expose agent-readable context:

- `/llms.txt` — product overview and key page links
- `/pricing.md` or `/pricing.txt` — structured pricing when pricing exists in
  source data

For platform-specific ranking factors and robots.txt bot lists, see
[platform-ranking-factors](./references/platform-ranking-factors.md). For OKF
bundles, see [okf](./references/okf.md).

## Extractability checklist

For each priority section, verify:

| Check | Pass when |
|-------|-----------|
| Clear definition in first paragraph | Reader knows what the section covers immediately |
| Self-contained answer blocks | Block makes sense without surrounding context |
| FAQ with natural-language questions | Present when page intent warrants it |
| Schema markup | JSON-LD matches visible content |
| Claims grounded | Every fact traceable to Context.dev or user input |

## Schema for AI

Structured data helps AI systems understand content:

| Content | Schema |
|---------|--------|
| Page | `WebPage`, `Organization` |
| FAQ section | `FAQPage` |
| Product page | `Product` |
| How-to section | `HowTo` |

Schema is not required for Google generative AI, but helps non-Google engines.
Align schema with the on-page SEO checklist in the `seo-audit` skill.

## What not to do

1. Write separate content "for AI" — serve people and AI from the same copy
2. Chunk pages into AI-bait fragments — use normal headings and paragraphs
3. Keyword stuff — it reduces AI visibility
4. Block AI search bots if you want citation (`GPTBot`, `PerplexityBot`, `ClaudeBot`,
   `Google-Extended`)
5. Hide main content behind JS that does not render

For content-type tactics (comparison pages, docs, local), see
[content-types](./references/content-types.md).
