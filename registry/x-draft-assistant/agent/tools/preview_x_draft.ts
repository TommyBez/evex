import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";

const X_POST_MAX_CHARS = 280;

const postSchema = z
  .string()
  .min(1)
  .max(X_POST_MAX_CHARS, `X posts must be at most ${X_POST_MAX_CHARS} characters.`);

const draftSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(120)
    .describe("Internal Typefully draft title. Not posted to social media."),
  posts: z
    .array(postSchema)
    .min(1)
    .max(25)
    .describe(
      "Ordered X posts that make up the draft. A single post is a tweet; multiple posts are a thread.",
    ),
  scratchpad: z
    .string()
    .max(2_000)
    .optional()
    .describe(
      "Optional private notes attached to the draft in Typefully. Not posted to social media.",
    ),
});

const draftsSchema = z
  .array(draftSchema)
  .min(1)
  .max(5)
  .describe("Up to 5 X draft candidates to preview before creating them in Typefully.");

export default defineTool({
  description:
    "Preview one or more X draft candidates without creating them in Typefully. Validates each post against the 280-character X limit, the post count per draft, and resolves the target social set from configuration. Returns the exact payload that create_x_drafts would send, including the madeWithAi flag from configuration. The target social set and tag come from configuration and cannot be overridden via input. Always call preview_x_draft before create_x_drafts.",
  inputSchema: z.object({
    drafts: draftsSchema,
  }),
  async execute({ drafts }) {
    const apiKey = process.env.TYPEFULLY_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "TYPEFULLY_API_KEY" };
    }

    const socialSetId = hotTopicConfig.draft.socialSetId;
    if (!socialSetId) {
      return { notConfigured: true, missingEnv: "TYPEFULLY_SOCIAL_SET_ID" };
    }

    return {
      dryRun: true,
      socialSetId,
      tag: hotTopicConfig.draft.tag ?? null,
      madeWithAi: hotTopicConfig.draft.madeWithAi,
      draftCount: drafts.length,
      drafts: drafts.map((draft) => ({
        title: draft.title,
        postCount: draft.posts.length,
        posts: draft.posts,
        postChars: draft.posts.map((post) => post.length),
        maxChars: X_POST_MAX_CHARS,
        madeWithAi: hotTopicConfig.draft.madeWithAi,
        scratchpad: draft.scratchpad ?? null,
      })),
    };
  },
});
