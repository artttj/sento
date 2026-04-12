// Copyright (c) Artem Iagovdik

import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider';

export class CustomEndpointProvider extends OpenAICompatibleProvider {
  readonly baseUrl: string;
  private readonly includeAuth: boolean;

  constructor(baseUrl: string, includeAuth = true) {
    super();
    this.baseUrl = baseUrl;
    this.includeAuth = includeAuth;
  }

  readonly headers = (apiKey: string): Record<string, string> => {
    if (!this.includeAuth) return {};
    if (!apiKey?.trim()) return {};
    return { 'Authorization': `Bearer ${apiKey}` };
  };
}
