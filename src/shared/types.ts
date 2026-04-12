// Copyright (c) Artem Iagovdik

export type ProviderName = 'openai' | 'gemini' | 'grok' | 'openrouter' | 'zai' | 'anthropic' | 'custom';

export type RewriteTemplateId = 'auto_fix' | 'professional' | 'custom' | 'shorten';

export type SiteListMode = 'all' | 'allowlist' | 'blocklist';

export type AppLanguage = 'en' | 'de';

export interface TemplateConfig {
  enabled: boolean;
  instruction: string;
}

export interface ProviderSettings {
  defaultTemplateId: RewriteTemplateId;
  llmProvider: ProviderName;
  openaiModel: string;
  geminiModel: string;
  grokModel: string;
  zaiModel: string;
  openrouterModel: string;
  anthropicModel: string;
  customEndpoint: string;
  openaiCustomModel?: string;
  geminiCustomModel?: string;
  grokCustomModel?: string;
  zaiCustomModel?: string;
  openrouterCustomModel?: string;
  anthropicCustomModel?: string;
  customOverrideModel?: string;
  systemPrompt?: string;
  templateConfigs?: Partial<Record<RewriteTemplateId, TemplateConfig>>;
  templateOrder?: RewriteTemplateId[];
  showPillLabels: boolean;
  forceInsert: boolean;
  language: AppLanguage;
  siteListMode: SiteListMode;
  siteList: string[];
}

export interface RewriteRequestPayload {
  requestId: string;
  text: string;
  templateId: RewriteTemplateId;
  context?: {
    url: string;
    title?: string;
  };
}

export interface RewriteResponsePayload {
  text: string;
  provider: ProviderName;
  model: string;
  latencyMs: number;
}

export interface RewriteErrorPayload {
  code:
    | 'MISSING_KEY'
    | 'UNAUTHORIZED'
    | 'RATE_LIMITED'
    | 'NETWORK'
    | 'TIMEOUT'
    | 'BAD_RESPONSE'
    | 'ABORTED'
    | 'UNKNOWN';
  message: string;
  provider?: ProviderName;
  model?: string;
}

export interface ProviderStrategy {
  rewrite(input: {
    apiKey: string;
    model: string;
    systemPrompt?: string;
    userPrompt: string;
    signal: AbortSignal;
  }): Promise<string>;
}
