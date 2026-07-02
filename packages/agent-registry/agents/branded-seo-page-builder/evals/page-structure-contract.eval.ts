import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Builds a complete on-brand HTML page from provided Context.dev data with the mandated SEO structure, without inventing testimonials, pricing, or statistics.",
  timeoutMs: 300_000,
  async test(t) {
    await t.send(`
Build the SEO page for acme.dev as a homepage.

The Context.dev brand lookup for acme.dev already returned:

{
  "name": "Acme Dev Tools",
  "description": "Acme Dev Tools ships a CLI and dashboard that help teams catch flaky tests before deploys.",
  "industry": "developer tools",
  "colors": { "primary": "#1D4ED8", "background": "#F8FAFC", "text": "#0F172A" },
  "fonts": { "heading": "Inter", "body": "Inter" }
}

The homepage markdown returned only a short tagline: "Catch flaky tests before your users do." No testimonials, customer names, statistics, awards, or pricing information is available.

All the Context.dev data you need is provided above, so do not call Context.dev tools again in this run. Proceed according to your instructions: produce one complete HTML document in a single fenced html code block, grounded only in the data above — do not invent testimonials, customer names, statistics, awards, or pricing. Include the SEO notes section after the page.
`);

    t.succeeded();
    t.noFailedActions();

    const reply = t.reply ?? "";
    const replyLower = reply.toLowerCase();
    t.check(replyLower, includes("<!doctype html").gate());
    t.check(replyLower, includes("<html lang").gate());
    t.check(replyLower, includes("<title").gate());
    t.check(replyLower, includes('name="description"').gate());
    const h1Count = replyLower.split("<h1").length - 1;
    t.check(h1Count === 1, equals(true).gate());
    t.check(replyLower, includes('rel="canonical"').soft());
    t.check(replyLower, includes("application/ld+json").soft());
    t.check(replyLower, includes("seo notes").soft());
    t.check(replyLower.includes("<script src=\"http"), equals(false).gate());
    t.check(reply, includes("Acme Dev Tools").gate());
  },
});
