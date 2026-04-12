// Copyright (c) Artem Iagovdik

import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider';

export class OpenRouterProvider extends OpenAICompatibleProvider {
  readonly baseUrl = 'https://openrouter.ai/api/v1';

  readonly headers = (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': chrome.runtime.getURL(''),
    'X-Title': 'Sentō',
  });
}
