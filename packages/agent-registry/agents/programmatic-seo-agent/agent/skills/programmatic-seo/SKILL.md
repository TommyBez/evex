---
name: programmatic-seo
description: Build SEO pages at scale from repeatable patterns and validated keyword data. Use before any keyword research, page-pattern design, or batch page generation.
---

# Programmatic SEO

Programmatic SEO builds many similar pages from one template and a dataset, each
page targeting a distinct search query. It works when — and only when — every
page provides value specific to that page. A template that just swaps a variable
into otherwise identical copy produces doorway pages, which search engines
demote or deindex.

## Core strategy

- **Every page must earn its existence.** Each page answers a real query with
  content a searcher could not get from a sibling page. If two pages would
  satisfy the same intent, merge them.
- **Proprietary data wins.** Product data, integration details, benchmarks, and
  domain expertise from the product repository beat scraped public facts.
- **Quality over quantity.** 20 strong pages a week compound; 10,000 thin pages
  get the whole domain demoted. Skipping a batch is a valid outcome.
- **Subfolders over subdomains.** Keep generated pages in the main site's
  content tree so authority consolidates.
- **Match genuine intent.** Only target keywords with verified search volume
  and a clear intent the product can actually satisfy.

## Method

1. **Find the pattern, not the keyword.** Look for repeatable query shapes
   (`<product> vs <competitor>`, `<use case> for <persona>`, `how to <task> in
   <tool>`). One pattern yields a whole page set. See
   `references/playbooks.md` for the pattern catalog.
2. **Validate demand before writing.** Enumerate the exact permutations and
   check real search volumes. Kill permutations below the volume threshold or
   without a plausible intent match. See `references/keyword-research.md`.
3. **Design the template around unique value.** Decide which sections are
   shared scaffolding and which sections must be researched per page. A page is
   viable only if its per-page sections carry the substance.
4. **Link hub-and-spoke.** Every generated page links to a hub (category or
   pillar page) and to 3-5 sibling pages; hubs link back. Orphan pages do not
   get crawled or ranked.
5. **Hold the quality bar before publishing.** Check every page against
   `references/page-quality.md`. Cut pages that fail instead of padding them.

## Critical warnings

- **Thin content**: variable swaps with no per-page substance. The most common
  failure mode. Google's spam policies treat these as doorway pages.
- **Cannibalization**: multiple pages targeting the same intent split ranking
  signals. One intent, one page.
- **Zero-volume targets**: pages nobody searches for are pure index bloat.
- **Fabricated data**: never invent statistics, quotes, or product claims to
  fill a template section. An honest shorter page beats a padded false one.
