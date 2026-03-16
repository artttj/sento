// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../types';
import { ProviderBadResponseError, ProviderHttpError } from './errors';

interface CompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

async function parseResponse(res: Response): Promise<string> {
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

export class GrokProvider implements ProviderStrategy {
  async rewrite(input: {
    apiKey: string;
    model: string;
    systemPrompt?: string;
    userPrompt: string;
    signal: AbortSignal;
  }): Promise<string> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (input.systemPrompt?.trim()) {
      messages.push({ role: 'system', content: input.systemPrompt.trim() });
    }
    messages.push({ role: 'user', content: input.userPrompt });

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        temperature: 0.3,
      }),
      signal: input.signal,
    });

    return parseResponse(res);
  }
}
