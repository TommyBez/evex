import {
  defaultGitHubAuth,
  type GitHubEventContext,
  type GitHubInboundContext,
  type GitHubJsonObject,
  githubChannel,
  type GitHubChannelState,
} from "eve/channels/github";
import { toolResultFrom } from "eve/tools";

import openDocsIssueTool, {
  type OpenDocsIssueOutput,
} from "../tools/open_docs_issue";

const BOT_NAME = process.env.GITHUB_APP_SLUG || "docs-knowledge-assistant";
const BOT_MENTION_PATTERN = new RegExp(
  `@${escapeRegExp(BOT_NAME)}(?=$|[^A-Za-z0-9_-])`,
  "i",
);
const GITHUB_COMMENT_CHUNK_SIZE = 60_000;

type DocsAssistantGitHubState = GitHubChannelState & {
  docsIssueOpened?: boolean;
};

export default githubChannel({
  botName: BOT_NAME,
  async onComment(ctx, comment) {
    if (!BOT_MENTION_PATTERN.test(comment.body)) {
      return null;
    }

    // Docs Q&A only — never act on pull request conversations or reviews.
    if (!isIssueConversation(ctx)) {
      return null;
    }

    if (ctx.conversation.issueNumber === null) {
      return null;
    }

    return {
      auth: defaultGitHubAuth(ctx),
      context: [
        [
          "<github_docs_question_context>",
          `repository: ${ctx.repository.fullName}`,
          `issue_number: ${ctx.conversation.issueNumber}`,
          `sender: ${ctx.sender.login}`,
          "surface: github_issue_comment",
          "</github_docs_question_context>",
          "",
          "Answer this documentation question from README, docs/, CONTRIBUTING*, or AGENTS.md only. Cite file paths. If the docs lack the answer, say so. Optionally call open_docs_issue for a clear docs gap. Never review pull requests and never apply taxonomy labels.",
        ].join("\n"),
      ],
    };
  },
  events: {
    async "action.result"(data, channel) {
      const match = toolResultFrom(data.result, openDocsIssueTool);
      if (!match) {
        return;
      }

      const output = match.output as OpenDocsIssueOutput;
      if (!output.readyToOpen) {
        return;
      }

      const state = channel.state as DocsAssistantGitHubState;
      if (state.docsIssueOpened) {
        return;
      }

      if (state.conversationKind !== "issue") {
        return;
      }

      await publishDocsIssue(channel, output);
      state.docsIssueOpened = true;
    },
    async "message.completed"(data, channel) {
      if (data.finishReason === "tool-calls" || !data.message) {
        return;
      }

      const state = channel.state as DocsAssistantGitHubState;
      if (state.conversationKind !== "issue") {
        return;
      }

      await postCommentChunks(channel, data.message);
    },
  },
});

function isIssueConversation(ctx: GitHubInboundContext) {
  return ctx.conversation.kind === "issue";
}

async function publishDocsIssue(
  channel: GitHubEventContext,
  issue: Extract<OpenDocsIssueOutput, { readyToOpen: true }>,
) {
  const owner = channel.state.owner;
  const repo = channel.state.repo;
  const response = await channel.github.request({
    method: "POST",
    path: `/repos/${owner}/${repo}/issues`,
    body: {
      title: issue.title,
      body: [
        issue.body.trim(),
        "",
        `Opened by @${BOT_NAME} after a documentation Q&A gap.`,
        "",
        `Rationale: ${issue.rationale.trim()}`,
      ].join("\n"),
    },
  });

  const created = asObject(response.body);
  const number = created?.number;
  const htmlUrl = created?.html_url;
  if (typeof number === "number" && typeof htmlUrl === "string") {
    await postCommentChunks(
      channel,
      `Opened documentation issue #${number}: ${htmlUrl}`,
    );
  }
}

async function postCommentChunks(channel: GitHubEventContext, body: string) {
  for (const chunk of chunkText(body, GITHUB_COMMENT_CHUNK_SIZE)) {
    await channel.thread.post(chunk);
  }
}

function chunkText(value: string, size: number): string[] {
  if (value.length <= size) {
    return [value];
  }

  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}

function asObject(value: unknown): GitHubJsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as GitHubJsonObject;
  }
  return null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
