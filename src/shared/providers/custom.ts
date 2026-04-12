// Copyright (c) Artem Iagovdik

import { buildMessages, parseProviderResponse } from './utils';
import type { ProviderStrategy } from '../types';

export interface RewriteInput {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  signal: AbortSignal;
}

export class CustomEndpointProvider implements ProviderStrategy {
  readonly baseUrl: string;
  private readonly includeAuth: boolean;

  constructor(baseUrl: string, includeAuth = true) {
    this.baseUrl = baseUrl;
    this.includeAuth = includeAuth;
  }

  readonly headers = (apiKey: string): Record<string, string> => {
    if (!this.includeAuth) return {};
    if (!apiKey?.trim()) return {};
    return { 'Authorization': `Bearer ${apiKey}` };
  };

  async rewrite(input: RewriteInput): Promise<string> {
    const messages = buildMessages(input.systemPrompt, input.userPrompt);

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers(input.apiKey),
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        stream: false,
      }),
      signal: input.signal,
    });

    return parseProviderResponse(res);
  }
}
