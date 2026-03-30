// Copyright (c) Artem Iagovdik

import { ProviderBadResponseError, ProviderHttpError } from './errors';

export interface CompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export function buildMessages(systemPrompt: string | undefined, userPrompt: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  if (systemPrompt?.trim()) {
    messages.push({ role: 'system', content: systemPrompt.trim() });
  }
  messages.push({ role: 'user', content: userPrompt });
  return messages;
}

export async function parseProviderResponse(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as CompletionResponse;

  if (!res.ok) {
    throw new ProviderHttpError(res.status, body.error?.message ?? `HTTP ${res.status}`);
  }

  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new ProviderBadResponseError('Provider returned an empty rewrite result.');
  }

  return text;
}
