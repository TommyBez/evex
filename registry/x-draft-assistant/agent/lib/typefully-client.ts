// Typefully Public API v2 client. Minimal surface for creating X drafts.
// Reference: https://typefully.com/docs/api

const TYPEFULLY_API_BASE = "https://api.typefully.com";

export type TypefullyXPost = {
  readonly text: string;
  readonly madeWithAi?: boolean;
};

export type TypefullyCreateDraftInput = {
  readonly socialSetId: string;
  readonly posts: readonly TypefullyXPost[];
  readonly draftTitle?: string;
  readonly scratchpad?: string;
  readonly tags?: readonly string[];
};

export type TypefullyCreateDraftResponse = {
  readonly id: number;
  readonly social_set_id: number;
  readonly status: string;
  readonly preview: string;
  readonly private_url: string;
  readonly share_url?: string | null;
  readonly draft_title?: string | null;
  readonly scheduled_date?: string | null;
  readonly created_at: string;
};

export type TypefullyTagResponse = {
  readonly id: number;
  readonly name: string;
  readonly slug?: string | null;
  readonly social_set_id?: number | null;
};

export type TypefullyCreateTagInput = {
  readonly socialSetId: string;
  readonly name: string;
};

export type TypefullyListTagsResponse = {
  readonly total?: number;
  readonly results?: readonly TypefullyTagResponse[];
  readonly items?: readonly TypefullyTagResponse[];
  readonly data?: readonly TypefullyTagResponse[];
};

export type TypefullyError = {
  readonly message: string;
  readonly status: number;
  readonly body: string;
};

export class TypefullyApiError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(error: TypefullyError) {
    super(error.message);
    this.name = "TypefullyApiError";
    this.status = error.status;
    this.body = error.body;
  }
}

type TypefullyErrorBody = {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly details?: readonly {
      readonly message?: string;
      readonly field?: string;
    }[];
  };
};

function summarizeErrorBody(body: string, status: number): string {
  if (!body) {
    return `Typefully API ${status} with no response body.`;
  }
  try {
    const parsed = JSON.parse(body) as TypefullyErrorBody;
    const top = parsed.error?.message;
    if (top) {
      return `Typefully API ${status}: ${top}`;
    }
  } catch {
    // Fall through to the raw slice.
  }
  return `Typefully API ${status}: ${body.slice(0, 500)}`;
}

export async function createTypefullyDraft(
  input: TypefullyCreateDraftInput,
  apiKey: string,
): Promise<TypefullyCreateDraftResponse> {
  const payload = {
    platforms: {
      x: {
        enabled: true,
        posts: input.posts.map((post) => ({
          text: post.text,
          ...(post.madeWithAi ? { made_with_ai: true } : {}),
        })),
        settings: {},
      },
    },
    draft_title: input.draftTitle,
    scratchpad_text: input.scratchpad,
    tags: input.tags,
    share: false,
  };

  const response = await fetch(
    `${TYPEFULLY_API_BASE}/v2/social-sets/${encodeURIComponent(input.socialSetId)}/drafts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new TypefullyApiError({
      message: summarizeErrorBody(responseText, response.status),
      status: response.status,
      body: responseText,
    });
  }

  const data = JSON.parse(responseText) as TypefullyCreateDraftResponse;
  return {
    ...data,
    draft_title: data.draft_title ?? input.draftTitle ?? null,
  };
}

export async function createTypefullyTag(
  input: TypefullyCreateTagInput,
  apiKey: string,
): Promise<TypefullyTagResponse> {
  const response = await fetch(
    `${TYPEFULLY_API_BASE}/v2/social-sets/${encodeURIComponent(input.socialSetId)}/tags`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: input.name }),
    },
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new TypefullyApiError({
      message: summarizeErrorBody(responseText, response.status),
      status: response.status,
      body: responseText,
    });
  }

  return JSON.parse(responseText) as TypefullyTagResponse;
}

export async function listTypefullyTags(
  socialSetId: string,
  apiKey: string,
): Promise<readonly TypefullyTagResponse[]> {
  const response = await fetch(
    `${TYPEFULLY_API_BASE}/v2/social-sets/${encodeURIComponent(socialSetId)}/tags?limit=50`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new TypefullyApiError({
      message: summarizeErrorBody(responseText, response.status),
      status: response.status,
      body: responseText,
    });
  }

  const parsed = JSON.parse(responseText) as
    | TypefullyListTagsResponse
    | TypefullyTagResponse[];
  if (Array.isArray(parsed)) {
    return parsed;
  }
  return parsed.results ?? parsed.items ?? parsed.data ?? [];
}
