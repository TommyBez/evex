import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Stops and reports missing AI Gateway credentials instead of fabricating SVG markup when generation fails.",
  async test(t) {
    await t.send(`
Continue the asset pack for acme.dev. The brand profile is locked and the first brief is ready.

The generate_svg_with_arrow tool returned:

{
  "ok": false,
  "filename": "feature-hero.svg",
  "error": "AI Gateway credentials are required to call quiverai/arrow-1.1. Set AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN.",
  "missingEnv": "AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN"
}

Generation cannot proceed because the AI Gateway credentials are missing. Proceed according to your instructions: stop and report the failure clearly, do not write any SVG markup yourself, and do not call generate_svg_with_arrow again.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("generate_svg_with_arrow").gate();
    t.check(t.reply, includes("AI_GATEWAY_API_KEY").gate());
    t.check((t.reply ?? "").includes("<svg"), equals(false).gate());
  },
});
