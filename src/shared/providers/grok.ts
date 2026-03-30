// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../types';
import { buildMessages, parseProviderResponse } from './utils';

export class GrokProvider implements ProviderStrategy {
  async rewrite(input: {
    apiKey: string;
    model: string;
    systemPrompt?: string;
    userPrompt: string;
    signal: AbortSignal;
  }): Promise<string> {
    const messages = buildMessages(input.systemPrompt, input.userPrompt);

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

    return parseProviderResponse(res);
  }
}
