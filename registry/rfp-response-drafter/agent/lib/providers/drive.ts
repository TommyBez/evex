import { draftsOnlyJson, readOnlyJson, readText } from "../http";
import {
  createAccessTokenCache,
  DRIVE_DRAFT_SCOPES,
  DRIVE_READ_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { RfpResponseConfig } from "../rfp-config";
import type { DriveClient, DriveDraftResult, DriveFile, DriveSource } from "./types";

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DOCS_API = "https://docs.googleapis.com/v1/documents";
const GOOGLE_DOC = "application/vnd.google-apps.document";

type DriveListResponse = {
  readonly files?: readonly DriveFile[];
};

type DriveCreateResponse = {
  readonly id?: string;
  readonly name?: string;
};

const isGoogleDoc = (mimeType: string): boolean => mimeType === GOOGLE_DOC;

export function createDriveClient(
  config: RfpResponseConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): DriveClient {
  const readToken = createAccessTokenCache(async () => {
    const connectorUid = config.google.connectUid;
    if (!connectorUid) {
      throw new Error("Google Drive Connect is not configured.");
    }
    return mintConnectAccessToken({
      connectorUid,
      scopes: DRIVE_READ_SCOPES,
      mintImpl,
    });
  });

  const writeToken = createAccessTokenCache(async () => {
    const connectorUid = config.google.connectUid;
    if (!connectorUid) {
      throw new Error("Google Drive Connect is not configured.");
    }
    return mintConnectAccessToken({
      connectorUid,
      scopes: DRIVE_DRAFT_SCOPES,
      mintImpl,
    });
  });

  return {
    async listFiles(input) {
      const folderId = input.folderId ?? config.google.driveFolderId;
      const query = folderId
        ? `'${folderId}' in parents and trashed = false`
        : "trashed = false";
      const params = new URLSearchParams({
        q: query,
        fields: "files(id,name,mimeType)",
        pageSize: "50",
      });
      const listed = await readOnlyJson<DriveListResponse>({
        url: `${DRIVE_API}?${params.toString()}`,
        headers: { authorization: `Bearer ${await readToken()}` },
        fetchImpl,
      });
      return listed.files ?? [];
    },

    async readFile(input) {
      const meta = await readOnlyJson<DriveFile>({
        url: `${DRIVE_API}/${encodeURIComponent(input.fileId)}?fields=id,name,mimeType`,
        headers: { authorization: `Bearer ${await readToken()}` },
        fetchImpl,
      });
      const token = await readToken();
      const contentUrl = isGoogleDoc(meta.mimeType)
        ? `${DRIVE_API}/${encodeURIComponent(meta.id)}/export?mimeType=text/plain`
        : `${DRIVE_API}/${encodeURIComponent(meta.id)}?alt=media`;
      const content = await readText({
        url: contentUrl,
        headers: { authorization: `Bearer ${token}` },
        fetchImpl,
      });
      return {
        ...meta,
        content: content.slice(0, 48_000),
        kind: input.kind,
      } satisfies DriveSource;
    },

    async createDraftDoc(input) {
      const created = await draftsOnlyJson<DriveCreateResponse>({
        url: DRIVE_API,
        method: "POST",
        headers: { authorization: `Bearer ${await writeToken()}` },
        body: {
          name: input.title,
          mimeType: GOOGLE_DOC,
        },
        fetchImpl,
      });
      const documentId = created.id ?? "unknown";
      if (documentId !== "unknown") {
        await draftsOnlyJson({
          url: `${DOCS_API}/${encodeURIComponent(documentId)}:batchUpdate`,
          method: "POST",
          headers: { authorization: `Bearer ${await writeToken()}` },
          body: {
            requests: [
              {
                insertText: {
                  location: { index: 1 },
                  text: input.body,
                },
              },
            ],
          },
          fetchImpl,
        });
      }
      return {
        drafted: true,
        submitted: false,
        sent: false,
        provider: "drive",
        documentId,
        title: created.name ?? input.title,
      } satisfies DriveDraftResult;
    },
  };
}

export function createConfiguredDrive(
  config: RfpResponseConfig,
  options: {
    readonly fetchImpl?: FetchLike;
    readonly mintImpl?: ConnectTokenMint;
  } = {},
):
  | { readonly ok: true; readonly value: DriveClient }
  | { readonly ok: false; readonly note: string; readonly missingEnv: readonly string[] } {
  if (!config.google.connectUid) {
    return {
      ok: false,
      note: "Google Drive Connect is not configured.",
      missingEnv: ["RFP_RESPONSE_GOOGLE_CONNECT_UID"],
    };
  }
  return {
    ok: true,
    value: createDriveClient(config, options.fetchImpl, options.mintImpl),
  };
}
