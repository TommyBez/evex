import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";
import {
  createTypefullyTag,
  TypefullyApiError,
  type TypefullyTagResponse,
} from "../lib/typefully-client.js";

const TAG_NAME_MAX_CHARS = 60;

const tagNameSchema = z
  .string()
  .min(1)
  .max(TAG_NAME_MAX_CHARS, `Typefully tag names must be at most ${TAG_NAME_MAX_CHARS} characters.`);

const inputSchema = z.object({
  name: tagNameSchema.describe(
    "The Typefully tag name to create. Tags are scoped to the configured social set.",
  ),
  confirmCreate: z
    .boolean()
    .describe(
      "Must be true to create the tag in Typefully. Acts as an explicit guard against accidental creates.",
    ),
});

type CreatedTag = {
  readonly created: true;
  readonly tagId: number;
  readonly socialSetId: string;
  readonly name: string;
  readonly slug?: string | null;
};

type FailedTag = {
  readonly created: false;
  readonly name: string;
  readonly error: { readonly message: string; readonly status?: number };
};

type CreateTypefullyTagOutput = CreatedTag | FailedTag;

export default defineTool({
  description:
    "Create a Typefully tag in the configured social set. The target social set comes from TYPEFULLY_SOCIAL_SET_ID and cannot be overridden via input. Use this when X_HOT_TOPIC_DRAFT_TAG references a tag that does not yet exist in the social set; otherwise prefer to reuse an existing tag. Tags are scoped per social set. The agent only creates the tag — it never attaches it to a draft (create_x_drafts uses X_HOT_TOPIC_DRAFT_TAG for that).",
  inputSchema,
  async execute({ name, confirmCreate }): Promise<CreateTypefullyTagOutput> {
    const apiKey = process.env.TYPEFULLY_API_KEY;
    const socialSetId = hotTopicConfig.draft.socialSetId;

    if (!apiKey) {
      return {
        name,
        created: false,
        error: { message: "Missing TYPEFULLY_API_KEY environment variable." },
      };
    }

    if (!socialSetId) {
      return {
        name,
        created: false,
        error: { message: "Missing TYPEFULLY_SOCIAL_SET_ID environment variable." },
      };
    }

    if (!confirmCreate) {
      return {
        name,
        created: false,
        error: {
          message: "confirmCreate must be true to create a tag.",
        },
      };
    }

    try {
      const response: TypefullyTagResponse = await createTypefullyTag(
        { socialSetId, name },
        apiKey,
      );
      return {
        created: true,
        tagId: response.id,
        socialSetId,
        name: response.name,
        slug: response.slug ?? null,
      };
    } catch (error) {
      const message =
        error instanceof TypefullyApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);
      return error instanceof TypefullyApiError
        ? { name, created: false, error: { message, status: error.status } }
        : { name, created: false, error: { message } };
    }
  },
});
