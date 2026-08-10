# Frontend wiring

These files are reference implementations for a Next.js app that already hosts
an Eve agent. They mirror the official OpenUI
[`openui-chat`](https://github.com/thesysdev/openui/tree/main/examples/openui-chat)
example, but route turns through Eve's built-in HTTP channel instead of a custom
`/api/chat` route.

## Required app dependencies

```bash
npm install @openuidev/react-lang @openuidev/react-ui eve
```

## Next.js setup

1. Wrap `next.config.ts` with `withEve()` from `eve/next`.
2. Copy `openui-eve-chat.tsx` into your app, for example
   `app/_components/openui-eve-chat.tsx`.
3. Render it from `app/page.tsx`.

The component uses `useEveAgent()` for session streaming and `@openuidev/react-lang`
`Renderer` with `openuiChatLibrary` to turn assistant text into live UI.

## Accessibility notes

- The send form keeps a persistent label for the message input so keyboard and
  screen-reader users do not have to rely on placeholder text.
- The rendered assistant area uses `aria-live="polite"` and `aria-busy` while the
  stream is active, so updates from `Renderer` are announced without interrupting
  the current task.
- If your host app moves focus after submit or renders additional controls from
  OpenUI actions, keep focus management in the host component so new UI does not
  unexpectedly steal focus.

## Alternative: AgentInterface

For the full OpenUI chat chrome (history rail, tool-call cards, theming), follow
the upstream `openui-chat` page and point its `ChatLLM.send` handler at Eve's
session routes. The Eve + Renderer path in `openui-eve-chat.tsx` is the minimal
integration when you already manage chat state with `useEveAgent`.

## Smoke test

1. Start the Eve app with this agent installed.
2. Open the page that renders `OpenUIEveChat`.
3. Ask: `What's the weather in Tokyo?`
4. Confirm the assistant streams OpenUI Lang and the renderer shows cards instead
   of raw text.
5. Optional: ask for a demo search (for example `Search for Eve agents`) and
   confirm results are labeled as demo data, not live web results.
