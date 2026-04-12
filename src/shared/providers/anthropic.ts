// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../types';
import { ProviderBadResponseError, ProviderHttpError } from './errors';

type RewriteInput = {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  signal: AbortSignal;
};

export class AnthropicProvider implements ProviderStrategy {
  async rewrite(input: RewriteInput): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': input.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: input.model,
        system: input.systemPrompt || 'You are a helpful assistant.',
        messages: [{ role: 'user', content: input.userPrompt }],
        max_tokens: 4096,
        temperature: 0.3,
      }),
      signal: input.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ProviderHttpError(res.status, body.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();

    if (!text) {
      throw new ProviderBadResponseError('Provider returned an empty rewrite result.');
    }

    return text;
  }
}
