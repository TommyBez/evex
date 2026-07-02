const DATAFORSEO_BASE_URL = "https://api.dataforseo.com";
const DATAFORSEO_OK_STATUS = 20_000;

export type DataForSeoCredentials = {
  readonly login: string;
  readonly password: string;
};

export const readDataForSeoCredentials = (): DataForSeoCredentials | null => {
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!(login && password)) {
    return null;
  }
  return { login, password };
};

type DataForSeoTask = {
  status_code?: number;
  status_message?: string;
  result?: unknown[] | null;
};

type DataForSeoResponse = {
  status_code?: number;
  status_message?: string;
  tasks?: DataForSeoTask[] | null;
};

export const dataForSeoPost = async (
  credentials: DataForSeoCredentials,
  path: string,
  payload: Record<string, unknown>,
): Promise<unknown[]> => {
  const authorization = Buffer.from(
    `${credentials.login}:${credentials.password}`,
  ).toString("base64");

  const response = await fetch(`${DATAFORSEO_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([payload]),
  });

  if (!response.ok) {
    throw new Error(
      `DataForSEO request to ${path} failed with HTTP ${response.status}.`,
    );
  }

  const body = (await response.json()) as DataForSeoResponse;
  if (body.status_code !== DATAFORSEO_OK_STATUS) {
    throw new Error(
      `DataForSEO request to ${path} failed: ${body.status_message ?? "unknown error"}.`,
    );
  }

  const task = body.tasks?.[0];
  if (!task || task.status_code !== DATAFORSEO_OK_STATUS) {
    throw new Error(
      `DataForSEO task for ${path} failed: ${task?.status_message ?? "no task returned"}.`,
    );
  }

  return task.result ?? [];
};
