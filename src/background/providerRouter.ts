import { REQUEST_TIMEOUT_MS } from '../shared/constants';
import { buildRewritePrompt } from '../shared/rewriteTemplates';
import { getProviderSettings, getOpenAIKey, getGeminiKey, getGrokKey } from '../shared/storage';
import { getProviderStrategy } from '../shared/providers';
import type {
  ProviderName,
  ProviderSettings,
  RewriteErrorPayload,
  RewriteRequestPayload,
  RewriteResponsePayload,
} from '../shared/types';
import { ProviderBadResponseError, ProviderHttpError } from '../shared/providers/errors';

function normalizeError(error: unknown, provider?: ProviderName, model?: string): RewriteErrorPayload {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { code: 'ABORTED', message: 'Request cancelled.', provider, model };
  }

  if (error instanceof ProviderHttpError) {
    if (error.status === 401 || error.status === 403) {
      return { code: 'UNAUTHORIZED', message: 'API key is invalid or unauthorized.', provider, model };
    }
    if (error.status === 429) {
      return { code: 'RATE_LIMITED', message: 'Rate limited by provider. Try again in a moment.', provider, model };
    }
    return { code: 'NETWORK', message: error.message, provider, model };
  }

  if (error instanceof ProviderBadResponseError) {
    return { code: 'BAD_RESPONSE', message: error.message, provider, model };
  }

  if (error instanceof TypeError) {
    return { code: 'NETWORK', message: 'Network error while contacting provider.', provider, model };
  }

  if (error instanceof Error && /timed out/i.test(error.message)) {
    return { code: 'TIMEOUT', message: 'Request timed out. Try again.', provider, model };
  }

  if (error instanceof Error) {
    return { code: 'UNKNOWN', message: error.message, provider, model };
  }

  return { code: 'UNKNOWN', message: 'Unknown error.', provider, model };
}

async function resolveProviderContext(): Promise<{ provider: ProviderName; model: string; key: string; systemPrompt?: string; settings: ProviderSettings }> {
  const settings = await getProviderSettings();
  const provider = settings.llmProvider;

  if (provider === 'gemini') {
    return {
      provider,
      model: settings.geminiModel,
      key: await getGeminiKey(),
      systemPrompt: settings.systemPrompt,
      settings,
    };
  }

  if (provider === 'grok') {
    return {
      provider,
      model: settings.grokModel,
      key: await getGrokKey(),
      systemPrompt: settings.systemPrompt,
      settings,
    };
  }

  return {
    provider: 'openai',
    model: settings.openaiModel,
    key: await getOpenAIKey(),
    systemPrompt: settings.systemPrompt,
    settings,
  };
}

export async function rewriteWithProvider(
  payload: RewriteRequestPayload,
  signal: AbortSignal
): Promise<{ ok: true; payload: RewriteResponsePayload } | { ok: false; error: RewriteErrorPayload }> {
  const started = Date.now();
  const { provider, model, key, systemPrompt, settings } = await resolveProviderContext();

  if (!key.trim()) {
    return {
      ok: false,
      error: {
        code: 'MISSING_KEY',
        message: `No ${provider.toUpperCase()} API key configured. Open Settings to add one.`,
        provider,
        model,
      },
    };
  }

  const templateConfig = settings.templateConfigs?.[payload.templateId];
  const providerStrategy = getProviderStrategy(provider);
  const prompt = buildRewritePrompt({
    templateId: payload.templateId,
    text: payload.text,
    title: payload.context?.title,
    url: payload.context?.url,
    instructionOverride: templateConfig?.instruction,
    language: settings.language,
  });

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any([signal, timeout]);

  try {
    const text = await providerStrategy.rewrite({
      apiKey: key,
      model,
      systemPrompt,
      userPrompt: prompt,
      signal: combinedSignal,
    });

    return {
      ok: true,
      payload: {
        text,
        provider,
        model,
        latencyMs: Date.now() - started,
      },
    };
  } catch (error: unknown) {
    if (timeout.aborted && !signal.aborted) {
      return {
        ok: false,
        error: { code: 'TIMEOUT', message: 'Request timed out. Try again.', provider, model },
      };
    }
    return { ok: false, error: normalizeError(error, provider, model) };
  }
}
