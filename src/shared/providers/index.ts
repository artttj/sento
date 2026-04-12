// Copyright (c) Artem Iagovdik

import type { ProviderName, ProviderStrategy } from '../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { GrokProvider } from './grok';
import { OpenRouterProvider } from './openrouter';
import { ZaiProvider } from './zai';
import { AnthropicProvider } from './anthropic';
import { CustomEndpointProvider } from './custom';

const providers: Record<ProviderName, ProviderStrategy> = {
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
  grok: new GrokProvider(),
  openrouter: new OpenRouterProvider(),
  zai: new ZaiProvider(),
  anthropic: new AnthropicProvider(),
  custom: new CustomEndpointProvider(''),
};

export function getProviderStrategy(provider: ProviderName): ProviderStrategy {
  return providers[provider];
}
