function normalizeBaseUrl(value: string | undefined) {
  if (!value) return "";
  return value.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

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

export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  const body = await response.json();
  if (!response.ok) {
    const message = (body as { error?: string }).error || "Request failed.";
    throw new Error(message);
  }
  return body as T;
}
