# OpenUI Assistant

An Eve agent that responds with **OpenUI Lang** and renders rich generative UI
through the official `openuiChatLibrary`. It follows the
[`openui-chat`](https://github.com/thesysdev/openui/tree/main/examples/openui-chat)
reference app: the model streams structured UI instead of markdown, and a React
`Renderer` turns that stream into live components.

## What it does

1. **Injects the OpenUI system prompt** - `agent/instructions/openui-prompt.ts`
   calls `openuiChatLibrary.prompt(openuiChatPromptOptions)` at build time, the
   same library and prompt options used by the GitHub example.
2. **Answers with OpenUI Lang only** - cards, grids, charts, tables, and buttons
   instead of plain text replies.
3. **Calls demo data tools** - `get_weather`, `get_stock_price`, and `search_web`
   mirror the sample tools from `examples/openui-chat/src/app/api/chat/route.ts`;
   `search_web` is mock demo data, not live search.
4. **Ships a frontend reference** -
   `agent/skills/openui/references/openui-eve-chat.tsx` shows how to connect
   `useEveAgent()` to `@openuidev/react-lang` `Renderer`.

## Installation

```bash
npx shadcn@latest add @evex/openui-assistant
```

Install the registry dependencies in your Eve app if they are not already present:

```bash
npm install @openuidev/react-ui @openuidev/react-lang eve just-bash zod
```

## Configuration

This agent does not require agent-specific environment variables. The host Eve
app still needs a model credential (`AI_GATEWAY_API_KEY`, `VERCEL_OIDC_TOKEN`, or
your provider's equivalent).

See `.env.example` for optional notes.

## Usage

Ask for structured UI backed by the demo tools:

```text
Show me the weather in Tokyo with a short forecast.
```

```text
Quote NVDA and render the move as a dashboard card.
```

```text
Show demo search results for "generative UI frameworks".
```

The assistant should return OpenUI Lang starting with `root = ...` and use tool
results for factual values. Search results are labeled as demo data because the
bundled search tool is deterministic and does not call a live provider.

## Web UI setup

To render generative UI in the browser:

1. Ensure your Next.js app uses `withEve()` from `eve/next`.
2. Copy `agent/skills/openui/references/openui-eve-chat.tsx` into your app
   components folder.
3. Render `<OpenUIEveChat />` on a page.

See `agent/skills/openui/references/frontend-wiring.md` for the full wiring
guide and an `AgentInterface` alternative that matches the upstream OpenUI chat
shell.

## Smoke test

1. Install the agent into an Eve app and run `pnpm dev` (or `eve dev`).
2. In the terminal UI or your web chat, send:

   ```text
   What's the weather in San Francisco?
   ```

3. Confirm the agent calls `get_weather`, then streams OpenUI Lang with weather
   cards rather than markdown prose.
4. If you mounted the frontend reference, confirm `Renderer` paints the UI while
   the stream is active.

## Troubleshooting

- **Plain text instead of UI** - the model ignored the OpenUI contract. Reload the
  `openui` skill and retry with an explicit layout request.
- **Parser errors in the browser** - an assistant reply included markdown fences or
  prose around the program. The agent should output raw OpenUI Lang only.
- **Missing tool data** - verify the turn includes a `get_weather`,
  `get_stock_price`, or `search_web` tool call before the UI references numbers.
- **Renderer shows nothing** - confirm `@openuidev/react-lang` and
  `@openuidev/react-ui` are installed in the host app and that you passed
  `openuiChatLibrary` to `Renderer`.

## Development

```bash
pnpm install
pnpm --dir packages/agent-registry/agents/openui-assistant typecheck
pnpm --dir packages/agent-registry/agents/openui-assistant build
pnpm --dir packages/agent-registry/agents/openui-assistant check
```

The package `tsconfig.json` includes the `.tsx` frontend reference under
`agent/skills/openui/references/`, plus DOM and React types, so `typecheck`
validates the shipped reference component as well as the Eve agent source.

After editing `registry.json`, regenerate the embedded catalog:

```bash
pnpm --filter @evex/agent-registry generate
```
