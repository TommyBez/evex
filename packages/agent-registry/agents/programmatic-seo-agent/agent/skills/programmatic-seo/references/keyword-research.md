# Keyword research for programmatic SEO

## Seed → pattern → permutation → validation

1. **Seeds** come from the product itself: category terms, feature names, use
   cases, integrations, personas, competitor names. 5-10 seeds is enough.
2. **Discovery** expands seeds into adjacent queries with real metrics
   (volume, difficulty, intent, CPC). Read the results for *shapes*, not
   individual keywords: recurring modifiers (`for`, `vs`, `template`,
   `how to`) reveal the viable playbook patterns.
3. **Permutation** enumerates the exact keyword for every candidate page in
   the chosen pattern. Write the literal query a searcher would type.
4. **Validation** checks every permutation against real search volume data
   before any page is written. Discovery metrics cover what the API surfaced;
   permutations you constructed yourself must be validated explicitly.

## Selection rules

- **Volume threshold**: drop permutations below the configured minimum. Long-tail
  pages can work in aggregate, but zero-volume pages are index bloat.
- **Intent match**: the page must be able to satisfy the query with the
  product's actual capabilities. A high-volume keyword the product cannot
  serve is a bounce generator, not a target.
- **One intent, one page**: cluster near-duplicates (plurals, reordering,
  synonyms) and pick one canonical keyword per page. If two permutations
  would produce near-identical pages, they are one page.
- **Coverage check**: skip keywords the site already targets — search the
  repository tree for existing pages before selecting.
- **Difficulty sanity check**: for a new page set, prefer low-competition
  long-tail queries over head terms already owned by entrenched domains.

## Per-page metadata to carry forward

For every selected keyword record: canonical keyword, search volume, intent,
the playbook pattern, and the sibling keywords clustered into it. This feeds
the page's title/H1, the internal-link plan, and the pull request review notes.
