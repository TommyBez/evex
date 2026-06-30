import {
  openuiChatLibrary,
  openuiChatPromptOptions,
} from "@openuidev/react-ui/genui-lib";
import { defineInstructions } from "eve/instructions";

const openuiSystemPrompt = openuiChatLibrary.prompt(openuiChatPromptOptions);

export default defineInstructions({
  markdown: openuiSystemPrompt,
});
