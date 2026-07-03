import {
  openuiChatLibrary,
  openuiChatPromptOptions,
} from "@openuidev/react-ui/genui-lib";
import { defineInstructions } from "eve/instructions";

const openuiSystemPrompt = createOpenuiSystemPrompt();

export default defineInstructions({
  markdown: openuiSystemPrompt,
});

function createOpenuiSystemPrompt(): string {
  try {
    return openuiChatLibrary.prompt(openuiChatPromptOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Failed to generate OpenUI system prompt: ${message}`);
  }
}
