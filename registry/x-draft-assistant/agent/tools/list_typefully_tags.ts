import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";
import {
  listTypefullyTags,
  TypefullyApiError,
  type TypefullyTagResponse,
} from "../lib/typefully-client.js";

export default defineTool({
  description:
    "List the existing Typefully tags in the configured social set. Use this before create_typefully_tag to avoid creating a duplicate tag, and to resolve a configured X_HOT_TOPIC_DRAFT_TAG into its existing tag. The target social set comes from TYPEFULLY_SOCIAL_SET_ID and cannot be overridden via input. Tags are scoped per social set.",
  inputSchema: z.object({}),
  async execute(): Promise<
    | {
        readonly socialSetId: string;
        readonly tags: readonly {
          readonly id: number;
          readonly name: string;
          readonly slug?: string | null;
        }[];
      }
    | { readonly authRequired: true; readonly missingEnv: string }
    | { readonly notConfigured: true; readonly missingEnv: string }
    | { readonly failed: true; readonly error: { readonly message: string; readonly status?: number } }
  > {
    const apiKey = process.env.TYPEFULLY_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "TYPEFULLY_API_KEY" };
    }

    const socialSetId = hotTopicConfig.draft.socialSetId;
    if (!socialSetId) {
      return { notConfigured: true, missingEnv: "TYPEFULLY_SOCIAL_SET_ID" };
    }

    try {
      const tags: readonly TypefullyTagResponse[] = await listTypefullyTags(socialSetId, apiKey);
      return {
        socialSetId,
        tags: tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug ?? null,
        })),
      };
    } catch (error) {
      const message =
        error instanceof TypefullyApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);
      return error instanceof TypefullyApiError
        ? { failed: true, error: { message, status: error.status } }
        : { failed: true, error: { message } };
    }
  },
});
