import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';
import type { ProviderName, ProviderSettings, RewriteTemplateId } from './types';

function isProviderName(value: string): value is ProviderName {
  return value === 'openai' || value === 'gemini' || value === 'grok';
}

function isRewriteTemplateId(value: string): value is RewriteTemplateId {
  return value === 'auto_fix' || value === 'professional' || value === 'technical' || value === 'shorten';
}

export async function getProviderSettings(): Promise<ProviderSettings> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const raw = (stored[STORAGE_KEYS.SETTINGS] as Partial<ProviderSettings> | undefined) ?? {};

  const rawProvider = raw.llmProvider;
  const provider: ProviderName = rawProvider && isProviderName(rawProvider) ? rawProvider : DEFAULT_SETTINGS.llmProvider;

  const rawTemplateId = raw.defaultTemplateId;
  const defaultTemplateId: RewriteTemplateId =
    rawTemplateId && isRewriteTemplateId(rawTemplateId) ? rawTemplateId : DEFAULT_SETTINGS.defaultTemplateId;

  return {
    defaultTemplateId,
    llmProvider: provider,
    openaiModel: raw.openaiModel ?? DEFAULT_SETTINGS.openaiModel,
    geminiModel: raw.geminiModel ?? DEFAULT_SETTINGS.geminiModel,
    grokModel: raw.grokModel ?? DEFAULT_SETTINGS.grokModel,
    theme: raw.theme === 'light' ? 'light' : 'dark',
    systemPrompt: raw.systemPrompt ?? DEFAULT_SETTINGS.systemPrompt,
  };
}

export async function saveProviderSettings(partial: Partial<ProviderSettings>): Promise<void> {
  const current = await getProviderSettings();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: {
      ...current,
      ...partial,
    },
  });
}

export async function getOpenAIKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OPENAI_KEY);
  return (result[STORAGE_KEYS.OPENAI_KEY] as string | undefined) ?? '';
}

export async function saveOpenAIKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OPENAI_KEY]: key });
}

export async function getGeminiKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GEMINI_KEY);
  return (result[STORAGE_KEYS.GEMINI_KEY] as string | undefined) ?? '';
}

export async function saveGeminiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GEMINI_KEY]: key });
}

export async function getGrokKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GROK_KEY);
  return (result[STORAGE_KEYS.GROK_KEY] as string | undefined) ?? '';
}

export async function saveGrokKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GROK_KEY]: key });
}
