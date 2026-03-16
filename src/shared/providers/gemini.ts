// Copyright (c) Artem Iagovdik

import type { ProviderStrategy } from '../types';
import { parseProviderResponse } from './utils';

export class GeminiProvider implements ProviderStrategy {
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

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
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
