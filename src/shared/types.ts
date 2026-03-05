export type ProviderName = 'openai' | 'gemini' | 'grok';

export type RewriteTemplateId = 'auto_fix' | 'professional' | 'technical' | 'shorten';

export interface ProviderSettings {
  defaultTemplateId: RewriteTemplateId;
  llmProvider: ProviderName;
  openaiModel: string;
  geminiModel: string;
  grokModel: string;
  theme: 'dark' | 'light';
  systemPrompt?: string;
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
