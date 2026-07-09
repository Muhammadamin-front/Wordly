import { apiFetch } from "@/lib/api";

export interface AiQuota {
  remaining: number;
  daily_quota: number;
  enabled: boolean;
}

export interface AiText {
  text: string;
  ai_generated: boolean;
}

export interface WritingCheck {
  corrected: string;
  feedback: string;
  ai_generated: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiApi = {
  quota: () => apiFetch<AiQuota>("/ai/quota", { auth: true }),

  explain: (wordId: string) =>
    apiFetch<AiText>("/ai/explain", { method: "POST", body: { word_id: wordId }, auth: true }),

  mnemonic: (wordId: string) =>
    apiFetch<AiText>("/ai/mnemonic", { method: "POST", body: { word_id: wordId }, auth: true }),

  chat: (messages: ChatMessage[], level: string) =>
    apiFetch<AiText>("/ai/chat", { method: "POST", body: { messages, level }, auth: true }),

  writingCheck: (text: string) =>
    apiFetch<WritingCheck>("/ai/writing-check", {
      method: "POST",
      body: { text },
      auth: true,
    }),

  report: (kind: string, output: string, reason?: string) =>
    apiFetch<{ message: string }>("/ai/report", {
      method: "POST",
      body: { kind, output, reason },
      auth: true,
    }),
};
