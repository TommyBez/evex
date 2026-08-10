import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";
import {
  createTypefullyDraft,
  TypefullyApiError,
  type TypefullyCreateDraftResponse,
} from "../lib/typefully-client.js";

const X_POST_MAX_CHARS = 280;

const postSchema = z
  .string()
  .min(1)
  .max(X_POST_MAX_CHARS, `X posts must be at most ${X_POST_MAX_CHARS} characters.`);

const draftSchema = z.object({
  idempotencyKey: z
    .string()
    .min(1)
    .max(255)
    .describe(
      "Stable unique key for this draft, scoped to this run. Reused across retries of the same step so a replayed create does not duplicate the draft. Must be unique per draft, not per run.",
    ),
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
  .describe("Up to 5 X draft candidates to create in Typefully.");

const payloadSchema = z.object({
  drafts: draftsSchema,
  confirmCreate: z
    .boolean()
    .describe(
      "Must be true to create drafts in Typefully. Acts as an explicit guard against accidental creates.",
    ),
});

type CreatedDraft = {
  readonly idempotencyKey: string;
  readonly title: string;
  readonly created: true;
  readonly draftId: number;
  readonly socialSetId: string;
  readonly privateUrl: string;
  readonly preview: string;
  readonly status: string;
};

type ReplayedDraft = {
  readonly idempotencyKey: string;
  readonly title: string;
  readonly replayed: true;
  readonly draftId: number;
  readonly socialSetId: string;
  readonly privateUrl: string;
};

type FailedDraft = {
  readonly idempotencyKey: string;
  readonly title: string;
  readonly created: false;
  readonly error: { readonly message: string; readonly status?: number };
};

type CreateXDraftsOutput = {
  readonly socialSetId: string;
  readonly tag?: string;
  readonly madeWithAi: boolean;
  readonly createdCount: number;
  readonly replayedCount: number;
  readonly failedCount: number;
  readonly drafts: readonly (CreatedDraft | ReplayedDraft | FailedDraft)[];
};

// Successful creates are cached so a replayed Eve step returns the recorded
// result instead of issuing a second POST, as long as the replay happens in
// the same Node process. The Typefully v2 API does not accept a server-side
// idempotency key, so the cache is in-process and keyed by the caller-provided
// idempotencyKey. A replay that crosses a process boundary (serverless cold
// start, redeploy, restart) sees an empty cache and will POST again — a
// durable store would be needed to close that gap. Failures are not cached so
// they can be retried with the same key.
const createdCache = new Map<
  string,
  { readonly title: string; readonly socialSetId: string; readonly response: TypefullyCreateDraftResponse }
>();

function duplicateIdempotencyKeys(drafts: readonly { idempotencyKey: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const draft of drafts) {
    if (seen.has(draft.idempotencyKey)) {
      duplicates.add(draft.idempotencyKey);
    } else {
      seen.add(draft.idempotencyKey);
    }
  }
  return [...duplicates];
}

export default defineTool({
  description:
    "Create one or more X draft candidates in Typefully. Each draft requires a stable idempotencyKey so a replayed step does not duplicate the draft. The target social set, tag, and madeWithAi disclosure come from configuration and cannot be overridden via input. Always call preview_x_draft first. Drafts are saved (not scheduled and not published). When madeWithAi is enabled (default), every X post is labeled as made with AI per X's content disclosure policy.",
  inputSchema: payloadSchema,
  async execute({ drafts, confirmCreate }): Promise<CreateXDraftsOutput> {
    const apiKey = process.env.TYPEFULLY_API_KEY;
    const madeWithAi = hotTopicConfig.draft.madeWithAi;
    if (!apiKey) {
      return {
        socialSetId: hotTopicConfig.draft.socialSetId ?? "",
        madeWithAi,
        createdCount: 0,
        replayedCount: 0,
        failedCount: drafts.length,
        drafts: drafts.map((draft) => ({
          idempotencyKey: draft.idempotencyKey,
          title: draft.title,
          created: false,
          error: { message: "Missing TYPEFULLY_API_KEY environment variable." },
        })),
      };
    }

    if (!confirmCreate) {
      return {
        socialSetId: hotTopicConfig.draft.socialSetId ?? "",
        madeWithAi,
        createdCount: 0,
        replayedCount: 0,
        failedCount: drafts.length,
        drafts: drafts.map((draft) => ({
          idempotencyKey: draft.idempotencyKey,
          title: draft.title,
          created: false,
          error: {
            message:
              "confirmCreate must be true to create drafts. Call preview_x_draft to review them first.",
          },
        })),
      };
    }

    const socialSetId = hotTopicConfig.draft.socialSetId;
    if (!socialSetId) {
      return {
        socialSetId: "",
        madeWithAi,
        createdCount: 0,
        replayedCount: 0,
        failedCount: drafts.length,
        drafts: drafts.map((draft) => ({
          idempotencyKey: draft.idempotencyKey,
          title: draft.title,
          created: false,
          error: { message: "Missing TYPEFULLY_SOCIAL_SET_ID environment variable." },
        })),
      };
    }

    const duplicates = duplicateIdempotencyKeys(drafts);
    if (duplicates.length > 0) {
      return {
        socialSetId,
        madeWithAi,
        createdCount: 0,
        replayedCount: 0,
        failedCount: drafts.length,
        drafts: drafts.map((draft) => ({
          idempotencyKey: draft.idempotencyKey,
          title: draft.title,
          created: false,
          error: {
            message: `Duplicate idempotencyKey "${draft.idempotencyKey}". Each draft needs a unique key.`,
          },
        })),
      };
    }

    const tag = hotTopicConfig.draft.tag;
    const tags = tag ? [tag] : undefined;
    const results: (CreatedDraft | ReplayedDraft | FailedDraft)[] = [];

    for (const draft of drafts) {
      const cached = createdCache.get(draft.idempotencyKey);
      if (cached) {
        results.push({
          idempotencyKey: draft.idempotencyKey,
          title: draft.title,
          replayed: true,
          draftId: cached.response.id,
          socialSetId: cached.socialSetId,
          privateUrl: cached.response.private_url,
        });
        continue;
      }

      try {
        const response = await createTypefullyDraft(
          {
            socialSetId,
            posts: draft.posts.map((post) => ({ text: post, madeWithAi })),
            draftTitle: draft.title,
            scratchpad: draft.scratchpad,
            tags,
          },
          apiKey,
        );
        createdCache.set(draft.idempotencyKey, {
          title: draft.title,
          socialSetId,
          response,
        });
        results.push({
          idempotencyKey: draft.idempotencyKey,
          title: draft.title,
          created: true,
          draftId: response.id,
          socialSetId,
          privateUrl: response.private_url,
          preview: response.preview,
          status: response.status,
        });
      } catch (error) {
        const message =
          error instanceof TypefullyApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : String(error);
        const failedDraft: FailedDraft =
          error instanceof TypefullyApiError
            ? {
                idempotencyKey: draft.idempotencyKey,
                title: draft.title,
                created: false,
                error: { message, status: error.status },
              }
            : {
                idempotencyKey: draft.idempotencyKey,
                title: draft.title,
                created: false,
                error: { message },
              };
        results.push(failedDraft);
      }
    }

    const createdCount = results.filter(isCreatedDraft).length;
    const replayedCount = results.filter(isReplayedDraft).length;
    const failedCount = results.filter(isFailedDraft).length;

    return {
      socialSetId,
      madeWithAi,
      ...(tag ? { tag } : {}),
      createdCount,
      replayedCount,
      failedCount,
      drafts: results,
    };
  },
});

function isCreatedDraft(draft: CreatedDraft | ReplayedDraft | FailedDraft): draft is CreatedDraft {
  return "created" in draft && draft.created === true;
}

function isReplayedDraft(
  draft: CreatedDraft | ReplayedDraft | FailedDraft,
): draft is ReplayedDraft {
  return "replayed" in draft;
}

function isFailedDraft(draft: CreatedDraft | ReplayedDraft | FailedDraft): draft is FailedDraft {
  return "created" in draft && draft.created === false;
}
