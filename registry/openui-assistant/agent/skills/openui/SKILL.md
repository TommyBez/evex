---
name: openui
description: OpenUI Lang generative UI with openuiChatLibrary. Use when composing layouts, debugging parse/render failures, or extending the chat library.
---

# OpenUI Lang

Every assistant reply is an OpenUI Lang **program** whose first statement assigns
**root**. This agent uses `openuiChatLibrary` from `@openuidev/react-ui/genui-lib`
(the same library as the official
[`openui-chat`](https://github.com/thesysdev/openui/tree/main/examples/openui-chat)
example). The build-time system prompt comes from
`openuiChatLibrary.prompt(openuiChatPromptOptions)`.

## Chat library constraints

`openuiChatLibrary` centers on chat primitives: `Card`, `CardHeader`, `TextContent`,
`Table`, lists, and follow-ups. Do not use `Stack`; it belongs to the broader
OpenUI library, not this agent's chat library.

For a layout example, see [syntax-examples](./references/syntax-examples.md).

## Debugging checklist

1. Confirm the reply starts with `root = ...`
2. Confirm every referenced identifier is defined
3. Confirm tool-backed values match the latest tool JSON
4. Remove markdown fences or prose around the program
5. Re-run with a smaller layout if the stream was truncated

**Done when** each item is confirmed or ruled out and the reply is a valid OpenUI
Lang program starting with `root =`.

## Frontend integration

For Next.js + Eve wiring (dependencies, `withEve()`, `OpenUIEveChat`, accessibility,
smoke tests), see [frontend-wiring](./references/frontend-wiring.md).

## External references

- OpenUI docs: https://www.openui.com/docs/openui-lang/overview
- Language spec: https://www.openui.com/docs/openui-lang/specification
- Example app: https://github.com/thesysdev/openui/tree/main/examples/openui-chat
