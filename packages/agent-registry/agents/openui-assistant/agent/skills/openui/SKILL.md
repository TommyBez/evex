---
name: openui
description: Build generative UI with OpenUI Lang and the bundled openuiChatLibrary. Use when choosing components, debugging OpenUI Lang syntax, extending the library, or wiring the Eve frontend reference.
---

# OpenUI generative UI

OpenUI Lang is a compact, line-oriented DSL for model-generated interfaces. This
agent ships with the `openuiChatLibrary` from `@openuidev/react-ui/genui-lib`,
the same library used by the official
[`openui-chat`](https://github.com/thesysdev/openui/tree/main/examples/openui-chat)
example.

## Pipeline

```
Component library → system prompt → LLM → OpenUI Lang stream → Renderer → UI
```

The build-time prompt in `agent/instructions/openui-prompt.ts` is generated from
`openuiChatLibrary.prompt(openuiChatPromptOptions)`.

## Syntax rules

1. One statement per line: `identifier = Expression`
2. The first statement must assign to `root`
3. Write top-down: layout → nested components → leaf values
4. Positional arguments map to Zod prop order
5. Forward references are allowed; the renderer shows placeholders until defined

Example:

```
root = Stack([header, stats], "column", "m")
header = TextContent("Q4 Dashboard", "large-heavy")
stats = Grid([revenue, users])
revenue = StatCard("Revenue", "$1.2M", "up")
users = StatCard("Users", "450k", "flat")
```

## When to load this skill

- The user asks for a new component pattern or layout
- OpenUI Lang fails to parse or render
- You need to confirm which built-in components are available
- You are extending the library with custom components

## Built-in library

This agent uses `openuiChatLibrary`, which includes chat-oriented layouts,
content blocks, charts, forms, tables, and buttons. Prefer those primitives over
inventing raw text responses.

## References

- OpenUI docs: https://www.openui.com/docs/openui-lang/overview
- Language spec: https://www.openui.com/docs/openui-lang/specification
- Example app: https://github.com/thesysdev/openui/tree/main/examples/openui-chat

## Debugging checklist

1. Confirm the reply starts with `root = ...`
2. Confirm every referenced identifier is defined
3. Confirm tool-backed values match the latest tool JSON
4. Remove markdown fences or prose around the program
5. Re-run with a smaller layout if the stream was truncated
