# Brand Visual Asset Generator

An on-demand Eve agent that turns a company website, product description, or brand
profile into a coherent pack of brand-aligned SVG visual assets for SaaS and
digital products. It uses Context.dev MCP for brand extraction and calls a
`generate_svg_with_arrow` tool powered by Quiver Arrow for SVG generation.

## What it does

1. **Extracts brand context with Context.dev MCP** - resolves company name,
   description, colors, logos, industry labels, homepage copy, and styleguide
   cues from a domain or URL.
2. **Plans a visual asset pack** - scopes icons, empty states, hero illustrations,
   badges, feature graphics, onboarding visuals, changelog art, and dashboard or
   modal graphics from the user request.
3. **Generates structured SVG output** - calls `generate_svg_with_arrow` once per
   finalized asset brief. The tool uses `quiverai/arrow-1.1` through Vercel AI
   Gateway's image-generation endpoint, passes optional Quiver reference images
   when available, and returns editable SVG markup.
4. **Keeps the pack cohesive** - enforces shared palette, stroke language, and
   illustration metaphors across every asset in the set.

## Asset types

- Icons (feature, navigation, status)
- Empty states
- Hero illustrations
- Badges and labels
- Feature graphics
- Onboarding visuals
- Changelog illustrations
- Dashboard or modal visuals

## Installation

```bash
npx shadcn@latest add @evex/brand-visual-asset-generator
```

Install the public runtime dependencies listed by the registry item if your Eve
app does not already have them.

## Configuration

Copy `.env.example` into your Eve app environment and fill in the Context.dev
credential plus an AI Gateway credential for Quiver Arrow.

```env
CONTEXT_DEV_API_KEY=ctxt_secret_...
CONTEXT_API_KEY=
AI_GATEWAY_API_KEY=vck_...
VERCEL_OIDC_TOKEN=
```

`CONTEXT_API_KEY` is also supported as a fallback for projects that already use
that name. The Eve MCP connection sends the resolved key as the
`x-context-dev-api-key` header.

`AI_GATEWAY_API_KEY` is optional on Vercel deployments that provide
`VERCEL_OIDC_TOKEN`. Local runs can use either `AI_GATEWAY_API_KEY` or a pulled
`VERCEL_OIDC_TOKEN`.

Never expose the Context.dev key to browser-side code. This agent sends it only
from the Eve MCP connection runtime.

## Models

| Role | Model |
| --- | --- |
| Root orchestrator | `deepseek/deepseek-v4-pro` |
| SVG generation tool | `quiverai/arrow-1.1` |

Ensure your Eve deployment has access to both model providers.

`generate_svg_with_arrow` accepts up to four reference images for Arrow 1.1 as
public image URLs or base64 image payloads. Use references for brand style,
palette, composition, or typography direction; the brief should explicitly state
what to preserve and what to change.

## Usage

Ask for a visual pack from a domain:

```text
Create a feature launch visual pack for linear.app: hero illustration, three feature icons, an empty state, a "new feature" badge, and an onboarding visual.
```

Or provide product context without a domain:

```text
We're a B2B analytics SaaS with primary color #2563EB and a precise, friendly tone. Generate an empty state and dashboard modal illustration for "no reports yet".
```

The agent returns:

1. A brand brief with palette, tone, and Context.dev source URLs.
2. An asset pack manifest with filename suggestions and purposes.
3. One fenced `svg` block per asset.
4. Usage notes for theming and placement.
5. Assumptions when any visual choices were inferred.

## Smoke test

1. Set `CONTEXT_DEV_API_KEY` in the Eve app environment.
2. Start the app in development:

   ```bash
   pnpm dev
   ```

3. In your Eve chat/client, ask:

   ```text
   Generate a small visual pack for stripe.com: one hero illustration, two feature icons, and a "new" badge.
   ```

4. Confirm the agent:
   - calls the `context-dev` MCP connection for brand data;
   - calls `generate_svg_with_arrow` for each finalized asset brief;
   - passes reference images when Context.dev returns useful logos, backdrops, or
     source imagery;
   - returns valid SVG markup with `viewBox`, semantic groups, and brand-aligned
     colors.

## Troubleshooting

- **`CONTEXT_DEV_API_KEY is required`** - set `CONTEXT_DEV_API_KEY` in the Eve app
  environment and restart the server.
- **`Context.dev API 401`** - the key is missing, revoked, or copied incorrectly.
- **`Context.dev API 408` or `429`** - the MCP call hit a cold-start timeout or
  rate limit. Retry later or lower concurrent usage.
- **`AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` is required** - set one of those
  credentials so `generate_svg_with_arrow` can call `quiverai/arrow-1.1`.
- **Quiver Arrow model errors** - confirm `quiverai/arrow-1.1` is enabled for
  your Vercel AI Gateway project.
- **Generic or off-brand SVGs** - Context.dev may have returned sparse brand data.
  Provide explicit colors, tone adjectives, or a product description.

## Development

```bash
pnpm install
pnpm info
pnpm build
```

Run `pnpm typecheck` while editing the Context.dev MCP connection or Arrow SVG
tool.
