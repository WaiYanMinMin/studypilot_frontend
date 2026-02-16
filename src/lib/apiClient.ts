function normalizeBaseUrl(value: string | undefined) {
  if (!value) return "";
  return value.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  if (!path.startsWith("/")) return API_BASE_URL ? `${API_BASE_URL}/${path}` : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(buildApiUrl(path), {
    credentials: "include",
    ...init
  });
}

async function parseErrorBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown) {
  if (typeof body === "string" && body.trim()) return body;
  if (typeof body === "object" && body !== null) {
    const candidate = body as { error?: unknown; message?: unknown };
    if (typeof candidate.error === "string" && candidate.error.trim()) return candidate.error;
    if (typeof candidate.message === "string" && candidate.message.trim()) return candidate.message;
  }
  return "Request failed.";
}

export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  const body = await parseErrorBody(response);
  if (!response.ok) {
    throw new ApiError(getErrorMessage(body), response.status, body);
  }
  return body as T;
}
