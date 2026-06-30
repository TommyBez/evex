"use client";

import { Renderer } from "@openuidev/react-lang";
import { openuiChatLibrary } from "@openuidev/react-ui/genui-lib";
import { useEveAgent } from "eve/react";
import { useMemo } from "react";

function getLatestAssistantText(
  messages: ReturnType<typeof useEveAgent>["data"]["messages"],
): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message?.role !== "assistant") {
      continue;
    }

    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  }

  return "";
}

/**
 * Reference chat surface that streams Eve assistant text into the OpenUI
 * Renderer. Copy this component into a Next.js app that already uses
 * `withEve()` from `eve/next`.
 */
export function OpenUIEveChat() {
  const agent = useEveAgent();
  const isBusy =
    agent.status === "submitted" || agent.status === "streaming";

  const assistantProgram = useMemo(
    () => getLatestAssistantText(agent.data.messages),
    [agent.data.messages],
  );

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col gap-4 p-4">
      <section className="min-h-0 flex-1 overflow-auto rounded-xl border p-4">
        {assistantProgram.length > 0 ? (
          <Renderer
            isStreaming={agent.status === "streaming"}
            library={openuiChatLibrary}
            response={assistantProgram}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask for weather, a stock quote, or a web search to see generative UI.
          </p>
        )}
      </section>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const message = String(form.get("message") ?? "").trim();

          if (message.length > 0) {
            void agent.send({ message });
            event.currentTarget.reset();
          }
        }}
      >
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          disabled={isBusy}
          name="message"
          placeholder="Show me the weather in Tokyo"
        />
        <button
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          disabled={isBusy}
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
}
