// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../../types';
import { buildMessages, parseProviderResponse } from '../utils';

export interface RewriteInput {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  signal: AbortSignal;
}

export abstract class OpenAICompatibleProvider implements ProviderStrategy {
  abstract readonly baseUrl: string;
  abstract readonly headers: (apiKey: string) => Record<string, string>;

  async rewrite(input: RewriteInput): Promise<string> {
    const messages = buildMessages(input.systemPrompt, input.userPrompt);

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers(input.apiKey),
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        temperature: 0.3,
      }),
      signal: input.signal,
    });

    return parseProviderResponse(res);
  }
}
