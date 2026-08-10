"use client";

import { Renderer } from "@openuidev/react-lang";
import { openuiChatLibrary } from "@openuidev/react-ui/genui-lib";
import type { EveMessage } from "eve/react";
import { useEveAgent } from "eve/react";
import { useMemo, useState } from "react";

function getLatestAssistantText(messages: readonly EveMessage[]): string {
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isStreaming = agent.status === "streaming";
  const isBusy =
    agent.status === "submitted" || isStreaming;

  const assistantProgram = useMemo(
    () => getLatestAssistantText(agent.data.messages),
    [agent.data.messages],
  );

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col gap-4 p-4">
      <section
        aria-busy={isBusy}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-auto rounded-xl border p-4"
      >
        {assistantProgram.length > 0 ? (
          <Renderer
            isStreaming={isStreaming}
            library={openuiChatLibrary}
            response={assistantProgram}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask for weather, a stock quote, or a demo search to see generative UI.
          </p>
        )}
      </section>

      <form
        className="flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const formElement = event.currentTarget;
          const form = new FormData(formElement);
          const message = String(form.get("message") ?? "").trim();

          if (message.length > 0) {
            setSubmitError(null);

            try {
              await agent.send({ message });
              formElement.reset();
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Failed to send message.";
              setSubmitError(errorMessage);
            }
          }
        }}
      >
        <label className="sr-only" htmlFor="message">
          Message
        </label>
        <input
          aria-describedby={submitError ? "message-error" : undefined}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          disabled={isBusy}
          id="message"
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
      {submitError ? (
        <p className="text-sm text-destructive" id="message-error" role="alert">
          {submitError}
        </p>
      ) : null}
    </div>
  );
}
