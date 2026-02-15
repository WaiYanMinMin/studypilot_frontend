"use client";

import { buildApiUrl } from "@/lib/apiClient";

export type DocumentListItem = {
  id: string;
  title: string;
  uploadedAt: string;
  fileUrl: string;
  pageCount?: number;
  chunkCount?: number;
};

export async function asJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    const message = (body as { error?: string }).error || "Request failed.";
    throw new Error(message);
  }
  return body as T;
}

function normalizeDocumentItem(item: DocumentListItem): DocumentListItem {
  const fallbackPath = `/api/documents/${encodeURIComponent(item.id)}/file`;
  const rawFileUrl = item.fileUrl || fallbackPath;
  const fileUrl = rawFileUrl.startsWith("/") ? buildApiUrl(rawFileUrl) : rawFileUrl;
  return { ...item, fileUrl };
}

export function asDocumentList(payload: unknown): DocumentListItem[] {
  if (Array.isArray(payload)) {
    return (payload as DocumentListItem[]).map(normalizeDocumentItem);
  }
  if (
    typeof payload === "object" &&
    payload !== null &&
    "documents" in payload &&
    Array.isArray((payload as { documents?: unknown }).documents)
  ) {
    return (payload as { documents: DocumentListItem[] }).documents.map(
      normalizeDocumentItem
    );
  }
  return [];
}
