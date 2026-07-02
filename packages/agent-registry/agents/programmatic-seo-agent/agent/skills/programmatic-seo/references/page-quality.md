# Page quality bar

Check every generated page against this list before publishing. Cut pages that
fail instead of padding them.

## Structure

- One `<h1>` (or frontmatter title) containing the canonical keyword naturally.
- Title tag ≤ 60 characters and meta description ≤ 155 characters, both
  specific to this page — no shared boilerplate with sibling pages.
- The opening section answers the query directly in the first 2-3 sentences;
  supporting detail follows. A searcher who reads only the intro should have
  their core answer.
- Logical heading hierarchy with descriptive section names, not clever ones.
- An FAQ section when the query shape implies follow-up questions, using real
  questions a searcher would ask.
- Structured data (JSON-LD) matching the page type when the site's existing
  pages carry it: `FAQPage`, `HowTo`, `Product`, or `Article`.

## Unique value (the doorway-page test)

- At least half of the page's substance must be specific to this page's
  keyword: researched facts, per-item data, worked examples, or product
  specifics. Shared scaffolding (intro framing, CTA, boilerplate sections)
  must carry less than half.
- Diff test: put two sibling pages side by side. If replacing the keyword
  makes them interchangeable, both fail.
- Every factual claim traces to a research excerpt, repository content, or
  explicit user input. No invented statistics, quotes, reviews, or pricing.

## Internal linking (hub-and-spoke)

- Every page links to its hub page and 3-5 relevant sibling pages with
  descriptive anchor text.
- Every page links to at least one core product page (signup, feature, docs)
  where it genuinely helps the reader.
- No orphans: if a page has no natural inbound link from the set, it does not
  ship.

## Conventions

- Match the repository's existing content format exactly: file extension,
  frontmatter fields, component usage, image handling, and URL/slug style.
- Slugs are lowercase, hyphenated, and derived from the canonical keyword.
- Language matches the configured target language and the site's existing
  content.

## Honesty

- Comparison and alternative pages represent competitors accurately from
  research; uncertain claims are omitted, not guessed.
- The page promises only what the product does. No fabricated testimonials,
  awards, or numbers — an honest shorter page beats a padded false one.
