// Copyright (c) Artem Iagovdik

import { OpenAICompatibleProvider } from './base/OpenAICompatibleProvider';

export class ZaiProvider extends OpenAICompatibleProvider {
  readonly baseUrl = 'https://api.zai.ai/v1';

  readonly headers = (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
  });
}
