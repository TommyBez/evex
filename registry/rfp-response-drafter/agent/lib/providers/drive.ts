import { draftsOnlyJson, readBytes, readOnlyJson, readText } from "../http";
import {
  driveFileUrl,
  exportEncoding,
  isGoogleDocMime,
} from "../materialize";
import {
  createAccessTokenCache,
  DRIVE_DRAFT_SCOPES,
  DRIVE_READ_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import {
  resolveDrivePackFolderId,
  resolveDriveRfpFolderId,
  type RfpResponseConfig,
} from "../rfp-config";
import type {
  DriveClient,
  DriveDraftResult,
  DriveExport,
  DriveFile,
  DriveFolderListing,
} from "./types";

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DOCS_API = "https://docs.googleapis.com/v1/documents";
const GOOGLE_DOC = "application/vnd.google-apps.document";
const LIST_FIELDS = "files(id,name,mimeType,webViewLink)";

type DriveListResponse = {
  readonly files?: readonly DriveFile[];
};

type DriveCreateResponse = {
  readonly id?: string;
  readonly name?: string;
};

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

  const listFiles: DriveClient["listFiles"] = async (input) => {
    const folderId = input.folderId;
    const query = folderId
      ? `'${folderId}' in parents and trashed = false`
      : "trashed = false";
    const params = new URLSearchParams({
      q: query,
      fields: LIST_FIELDS,
      pageSize: "50",
    });
    const listed = await readOnlyJson<DriveListResponse>({
      url: `${DRIVE_API}?${params.toString()}`,
      headers: { authorization: `Bearer ${await readToken()}` },
      fetchImpl,
    });
    return listed.files ?? [];
  };

  const exportFile: DriveClient["exportFile"] = async (input) => {
    const meta = await readOnlyJson<DriveFile>({
      url: `${DRIVE_API}/${encodeURIComponent(input.fileId)}?fields=id,name,mimeType,webViewLink`,
      headers: { authorization: `Bearer ${await readToken()}` },
      fetchImpl,
    });
    const token = await readToken();
    const encoding = exportEncoding(meta.mimeType);
    const contentUrl = isGoogleDocMime(meta.mimeType)
      ? `${DRIVE_API}/${encodeURIComponent(meta.id)}/export?mimeType=text/plain`
      : `${DRIVE_API}/${encodeURIComponent(meta.id)}?alt=media`;
    const driveUrl = driveFileUrl(meta);
    if (encoding === "binary") {
      const bytes = await readBytes({
        url: contentUrl,
        headers: { authorization: `Bearer ${token}` },
        fetchImpl,
      });
      return {
        ...meta,
        kind: input.kind,
        encoding,
        bytes,
        driveUrl,
      } satisfies DriveExport;
    }
    const text = await readText({
      url: contentUrl,
      headers: { authorization: `Bearer ${token}` },
      fetchImpl,
    });
    return {
      ...meta,
      kind: input.kind,
      encoding,
      text: text.slice(0, 48_000),
      driveUrl,
    } satisfies DriveExport;
  };

  return {
    listFiles,

    async listConfiguredFolders() {
      const rfpFolderId = resolveDriveRfpFolderId(config);
      const packFolderId = resolveDrivePackFolderId(config);
      const rfpFiles = rfpFolderId
        ? await listFiles({ folderId: rfpFolderId })
        : [];
      const packFiles =
        packFolderId && packFolderId === rfpFolderId
          ? rfpFiles
          : packFolderId
            ? await listFiles({ folderId: packFolderId })
            : [];
      return {
        rfp: {
          role: "rfp",
          folderId: rfpFolderId,
          files: rfpFiles,
        } satisfies DriveFolderListing,
        pack: {
          role: "pack",
          folderId: packFolderId,
          files: packFiles,
        } satisfies DriveFolderListing,
      };
    },

    exportFile,
    readFile: exportFile,

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
