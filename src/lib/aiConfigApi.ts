import { apiFetchJson } from "@/lib/apiClient";

export type AiConfigResponse = {
  hasApiKey: boolean;
  model: string | null;
  allowedModels: string[];
};

export type UpdateAiConfigPayload = {
  apiKey?: string;
  model?: string;
};

export type UpdateAiConfigResponse = {
  ok: true;
  hasApiKey: boolean;
  model: string | null;
  allowedModels: string[];
};

export type RevokeAiKeyResponse = {
  ok: true;
  hasApiKey: false;
  model: string | null;
};

export const FALLBACK_MODELS = [
  "gpt-4o-mini",
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-4o",
];

export function isAiSetupComplete(config: { hasApiKey: boolean; model: string | null }) {
  return config.hasApiKey && Boolean(config.model);
}

export async function getAiConfig() {
  return apiFetchJson<AiConfigResponse>("/api/ai/config", { cache: "no-store" });
}

export async function updateAiConfig(payload: UpdateAiConfigPayload) {
  return apiFetchJson<UpdateAiConfigResponse>("/api/ai/config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function revokeAiKey() {
  return apiFetchJson<RevokeAiKeyResponse>("/api/ai/config/key", {
    method: "DELETE",
  });
}
