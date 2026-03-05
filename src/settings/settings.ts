import { PROVIDER_MODELS } from '../shared/constants';
import { REWRITE_TEMPLATES } from '../shared/rewriteTemplates';
import {
  getProviderSettings,
  saveProviderSettings,
  getOpenAIKey,
  saveOpenAIKey,
  getGeminiKey,
  saveGeminiKey,
  getGrokKey,
  saveGrokKey,
} from '../shared/storage';
import type { RewriteTemplateId } from '../shared/types';

type Provider = 'openai' | 'gemini' | 'grok';
type Theme = 'dark' | 'light';

const refs = {
  defaultTemplate: document.getElementById('default-template') as HTMLSelectElement,
  providerSegmented: document.getElementById('provider-segmented') as HTMLElement,
  themeSegmented: document.getElementById('theme-segmented') as HTMLElement,
  systemPrompt: document.getElementById('system-prompt') as HTMLTextAreaElement,
  btnSaveSettings: document.getElementById('btn-save-settings') as HTMLButtonElement,
  settingsStatus: document.getElementById('settings-status') as HTMLElement,

  openaiModel: document.getElementById('openai-model') as HTMLSelectElement,
  geminiModel: document.getElementById('gemini-model') as HTMLSelectElement,
  grokModel: document.getElementById('grok-model') as HTMLSelectElement,

  openaiKey: document.getElementById('openai-key') as HTMLInputElement,
  geminiKey: document.getElementById('gemini-key') as HTMLInputElement,
  grokKey: document.getElementById('grok-key') as HTMLInputElement,

  btnSaveOpenai: document.getElementById('btn-save-openai') as HTMLButtonElement,
  btnClearOpenai: document.getElementById('btn-clear-openai') as HTMLButtonElement,
  btnSaveGemini: document.getElementById('btn-save-gemini') as HTMLButtonElement,
  btnClearGemini: document.getElementById('btn-clear-gemini') as HTMLButtonElement,
  btnSaveGrok: document.getElementById('btn-save-grok') as HTMLButtonElement,
  btnClearGrok: document.getElementById('btn-clear-grok') as HTMLButtonElement,

  badgeOpenai: document.getElementById('badge-openai') as HTMLElement,
  badgeGemini: document.getElementById('badge-gemini') as HTMLElement,
  badgeGrok: document.getElementById('badge-grok') as HTMLElement,
  navAiWarning: document.getElementById('nav-ai-warning') as HTMLElement,
  keysStatus: document.getElementById('keys-status') as HTMLElement,

  aboutVersion: document.getElementById('about-version') as HTMLElement,
};

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

function flash(el: HTMLElement, text = 'Saved'): void {
  el.textContent = text;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 1800);
}

function populateSelect(el: HTMLSelectElement, values: string[], selected: string): void {
  el.innerHTML = '';
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    option.selected = value === selected;
    el.appendChild(option);
  });
}

function setBadge(el: HTMLElement, connected: boolean): void {
  el.textContent = connected ? 'Connected' : 'Not Configured';
  el.className = connected ? 'status-badge connected' : 'status-badge unconfigured';
}

function setSegmentedValue(container: HTMLElement, value: string): void {
  container.querySelectorAll<HTMLElement>('.seg-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

function getSegmentedValue(container: HTMLElement): string {
  return container.querySelector<HTMLElement>('.seg-btn.active')?.dataset.value ?? '';
}

function wireSegmented(container: HTMLElement, onChange?: (value: string) => void): void {
  container.querySelectorAll<HTMLElement>('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setSegmentedValue(container, btn.dataset.value ?? '');
      onChange?.(btn.dataset.value ?? '');
    });
  });
}

async function refreshBadges(): Promise<void> {
  const [openaiKey, geminiKey, grokKey] = await Promise.all([getOpenAIKey(), getGeminiKey(), getGrokKey()]);

  setBadge(refs.badgeOpenai, !!openaiKey);
  setBadge(refs.badgeGemini, !!geminiKey);
  setBadge(refs.badgeGrok, !!grokKey);

  refs.navAiWarning.classList.toggle('hidden', !!(openaiKey && geminiKey && grokKey));
}

function wireTabs(): void {
  const navItems = Array.from(document.querySelectorAll<HTMLElement>('.nav-item'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('.tab-panel'));

  const navigate = (tab: string): void => {
    navItems.forEach((item) => item.classList.toggle('active', item.dataset.tab === tab));
    panels.forEach((panel) => panel.classList.toggle('hidden', panel.id !== `tab-${tab}`));
    history.replaceState(null, '', `#${tab}`);
  };

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navigate(item.dataset.tab ?? 'general');
    });
  });

  const hash = location.hash.replace('#', '');
  if (hash && navItems.some((item) => item.dataset.tab === hash)) {
    navigate(hash);
  }
}

async function init(): Promise<void> {
  wireTabs();
  refs.aboutVersion.textContent = chrome.runtime.getManifest().version;

  refs.defaultTemplate.innerHTML = '';
  REWRITE_TEMPLATES.forEach((template) => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.label;
    refs.defaultTemplate.appendChild(option);
  });
  populateSelect(refs.openaiModel, PROVIDER_MODELS.openai, PROVIDER_MODELS.openai[0]);
  populateSelect(refs.geminiModel, PROVIDER_MODELS.gemini, PROVIDER_MODELS.gemini[0]);
  populateSelect(refs.grokModel, PROVIDER_MODELS.grok, PROVIDER_MODELS.grok[0]);

  wireSegmented(refs.providerSegmented);
  wireSegmented(refs.themeSegmented, (value) => applyTheme(value === 'light' ? 'light' : 'dark'));

  const settings = await getProviderSettings();
  refs.defaultTemplate.value = settings.defaultTemplateId ?? 'auto_fix';
  setSegmentedValue(refs.providerSegmented, settings.llmProvider);
  setSegmentedValue(refs.themeSegmented, settings.theme);
  refs.systemPrompt.value = settings.systemPrompt ?? '';
  refs.openaiModel.value = settings.openaiModel;
  refs.geminiModel.value = settings.geminiModel;
  refs.grokModel.value = settings.grokModel;
  applyTheme(settings.theme);

  refs.openaiKey.value = await getOpenAIKey();
  refs.geminiKey.value = await getGeminiKey();
  refs.grokKey.value = await getGrokKey();
  await refreshBadges();

  refs.btnSaveSettings.addEventListener('click', async () => {
    const llmProvider = (getSegmentedValue(refs.providerSegmented) || 'openai') as Provider;
    const theme = (getSegmentedValue(refs.themeSegmented) || 'dark') as Theme;

    await saveProviderSettings({
      defaultTemplateId: refs.defaultTemplate.value as RewriteTemplateId,
      llmProvider,
      theme,
      openaiModel: refs.openaiModel.value,
      geminiModel: refs.geminiModel.value,
      grokModel: refs.grokModel.value,
      systemPrompt: refs.systemPrompt.value,
    });

    applyTheme(theme);
    flash(refs.settingsStatus, '✓ Saved');
  });

  refs.btnSaveOpenai.addEventListener('click', async () => {
    await saveOpenAIKey(refs.openaiKey.value.trim());
    await refreshBadges();
    flash(refs.keysStatus, '✓ OpenAI key saved');
  });
  refs.btnClearOpenai.addEventListener('click', async () => {
    refs.openaiKey.value = '';
    await saveOpenAIKey('');
    await refreshBadges();
    flash(refs.keysStatus, '✓ OpenAI key cleared');
  });

  refs.btnSaveGemini.addEventListener('click', async () => {
    await saveGeminiKey(refs.geminiKey.value.trim());
    await refreshBadges();
    flash(refs.keysStatus, '✓ Gemini key saved');
  });
  refs.btnClearGemini.addEventListener('click', async () => {
    refs.geminiKey.value = '';
    await saveGeminiKey('');
    await refreshBadges();
    flash(refs.keysStatus, '✓ Gemini key cleared');
  });

  refs.btnSaveGrok.addEventListener('click', async () => {
    await saveGrokKey(refs.grokKey.value.trim());
    await refreshBadges();
    flash(refs.keysStatus, '✓ Grok key saved');
  });
  refs.btnClearGrok.addEventListener('click', async () => {
    refs.grokKey.value = '';
    await saveGrokKey('');
    await refreshBadges();
    flash(refs.keysStatus, '✓ Grok key cleared');
  });
}

void init().catch((error: unknown) => {
  console.error('[Sentō] settings init failed', error);
});
