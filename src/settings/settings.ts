// Copyright (c) Artem Iagovdik

import { PROVIDER_MODELS, DEFAULT_SETTINGS } from '../shared/constants';
import { getOrderedTemplates, REWRITE_TEMPLATES } from '../shared/rewriteTemplates';
import {
  getProviderSettings,
  saveProviderSettings,
  getOpenAIKey,
  saveOpenAIKey,
  getGeminiKey,
  saveGeminiKey,
  getGrokKey,
  saveGrokKey,
  getOpenRouterKey,
  saveOpenRouterKey,
  getZaiKey,
  saveZaiKey,
  getAnthropicKey,
  saveAnthropicKey,
  getCustomKey,
  saveCustomKey,
} from '../shared/storage';
import type { AppLanguage, ProviderSettings, RewriteTemplateId, SiteListMode, TemplateConfig } from '../shared/types';
import { t } from './i18n';

type Provider = 'openai' | 'gemini' | 'grok' | 'openrouter' | 'zai' | 'anthropic' | 'custom';

const refs = {
  defaultTemplate: document.getElementById('default-template') as HTMLSelectElement,
  providerSegmented: document.getElementById('provider-segmented') as HTMLElement,
  systemPrompt: document.getElementById('system-prompt') as HTMLTextAreaElement,
  showPillLabels: document.getElementById('show-pill-labels') as HTMLInputElement,
  forceInsert: document.getElementById('force-insert') as HTMLInputElement,
  languageSeg: document.getElementById('language-segmented') as HTMLElement,
  siteModeSeg: document.getElementById('site-mode-segmented') as HTMLElement,
  siteListRow: document.getElementById('site-list-row') as HTMLElement,
  siteListTitle: document.getElementById('site-list-title') as HTMLElement,
  siteList: document.getElementById('site-list') as HTMLTextAreaElement,
  btnSaveSettings: document.getElementById('btn-save-settings') as HTMLButtonElement,
  settingsStatus: document.getElementById('settings-status') as HTMLElement,
  btnSaveTemplates: document.getElementById('btn-save-templates') as HTMLButtonElement,
  templatesStatus: document.getElementById('templates-status') as HTMLElement,

  openaiModel: document.getElementById('openai-model') as HTMLSelectElement,
  openaiCustomModel: document.getElementById('openai-custom-model') as HTMLInputElement,
  geminiModel: document.getElementById('gemini-model') as HTMLSelectElement,
  geminiCustomModel: document.getElementById('gemini-custom-model') as HTMLInputElement,
  grokModel: document.getElementById('grok-model') as HTMLSelectElement,
  grokCustomModel: document.getElementById('grok-custom-model') as HTMLInputElement,

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

  openrouterModel: document.getElementById('openrouter-model') as HTMLSelectElement,
  openrouterCustomModel: document.getElementById('openrouter-custom-model') as HTMLInputElement,
  zaiModel: document.getElementById('zai-model') as HTMLSelectElement,
  zaiCustomModel: document.getElementById('zai-custom-model') as HTMLInputElement,
  anthropicModel: document.getElementById('anthropic-model') as HTMLSelectElement,
  anthropicCustomModel: document.getElementById('anthropic-custom-model') as HTMLInputElement,

  openrouterKey: document.getElementById('openrouter-key') as HTMLInputElement,
  zaiKey: document.getElementById('zai-key') as HTMLInputElement,
  anthropicKey: document.getElementById('anthropic-key') as HTMLInputElement,

  btnSaveOpenrouter: document.getElementById('btn-save-openrouter') as HTMLButtonElement,
  btnClearOpenrouter: document.getElementById('btn-clear-openrouter') as HTMLButtonElement,
  btnSaveZai: document.getElementById('btn-save-zai') as HTMLButtonElement,
  btnClearZai: document.getElementById('btn-clear-zai') as HTMLButtonElement,
  btnSaveAnthropic: document.getElementById('btn-save-anthropic') as HTMLButtonElement,
  btnClearAnthropic: document.getElementById('btn-clear-anthropic') as HTMLButtonElement,

  badgeOpenrouter: document.getElementById('badge-openrouter') as HTMLElement,
  badgeZai: document.getElementById('badge-zai') as HTMLElement,
  badgeAnthropic: document.getElementById('badge-anthropic') as HTMLElement,

  customOverrideModel: document.getElementById('custom-override-model') as HTMLInputElement,
  customEndpoint: document.getElementById('custom-endpoint') as HTMLInputElement,
  customKey: document.getElementById('custom-key') as HTMLInputElement,
  btnSaveCustom: document.getElementById('btn-save-custom') as HTMLButtonElement,
  btnClearCustom: document.getElementById('btn-clear-custom') as HTMLButtonElement,
  badgeCustom: document.getElementById('badge-custom') as HTMLElement,
  navAiWarning: document.getElementById('nav-ai-warning') as HTMLElement,
  keysStatus: document.getElementById('keys-status') as HTMLElement,

  aboutVersion: document.getElementById('about-version') as HTMLElement,
  templateConfigs: document.getElementById('template-configs') as HTMLElement,
};

function flash(el: HTMLElement, text = 'Saved'): void {
  el.textContent = text;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 1800);
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
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

function updateSiteListVisibility(mode: SiteListMode): void {
  const show = mode !== 'all';
  refs.siteListRow.classList.toggle('hidden', !show);
  const lang = (getSegmentedValue(refs.languageSeg) || 'en') as AppLanguage;
  const titleKey = mode === 'allowlist' ? 'allowed-sites' : 'blocked-sites';
  refs.siteListTitle.textContent = t(titleKey, lang);
}

const DRAG_HANDLE_SVG = '<svg viewBox="0 0 12 12" fill="currentColor"><circle cx="4" cy="2.5" r="1"/><circle cx="8" cy="2.5" r="1"/><circle cx="4" cy="6" r="1"/><circle cx="8" cy="6" r="1"/><circle cx="4" cy="9.5" r="1"/><circle cx="8" cy="9.5" r="1"/></svg>';

let dragSourceCard: HTMLElement | null = null;

function renderTemplateConfigs(configs: Partial<Record<RewriteTemplateId, TemplateConfig>>, order?: RewriteTemplateId[]): void {
  const container = refs.templateConfigs;
  container.querySelectorAll('.tpl-card').forEach((el) => el.remove());

  const templates = getOrderedTemplates(order);

  templates.forEach((tpl) => {
    const cfg = configs[tpl.id];
    const enabled = cfg?.enabled !== false;
    const instruction = (cfg?.instruction && cfg.instruction.trim()) ? cfg.instruction : tpl.instruction;

    const card = document.createElement('div');
    card.className = 'tpl-card';
    card.dataset.templateId = tpl.id;
    card.draggable = true;
    card.innerHTML = `
      <div class="tpl-header">
        <span class="tpl-drag-handle" title="Drag to reorder">${DRAG_HANDLE_SVG}</span>
        <label class="tpl-switch">
          <input type="checkbox" class="tpl-checkbox" ${enabled ? 'checked' : ''} />
          <span class="tpl-switch-track"></span>
        </label>
        <span class="tpl-name">${tpl.label}</span>
      </div>
      <textarea class="tpl-instruction setting-textarea" rows="2"></textarea>
    `;
    const textarea = card.querySelector('.tpl-instruction') as HTMLTextAreaElement;
    textarea.value = instruction;
    container.appendChild(card);

    const checkbox = card.querySelector('.tpl-checkbox') as HTMLInputElement;
    checkbox.addEventListener('change', () => {
      enforceMinOneEnabled();
    });

    card.addEventListener('dragstart', (e) => {
      dragSourceCard = card;
      card.classList.add('dragging');
      e.dataTransfer!.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      container.querySelectorAll('.tpl-card').forEach((el) => el.classList.remove('drag-over'));
      dragSourceCard = null;
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      if (dragSourceCard && dragSourceCard !== card) {
        card.classList.add('drag-over');
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      if (!dragSourceCard || dragSourceCard === card) return;

      const cards = Array.from(container.querySelectorAll<HTMLElement>('.tpl-card'));
      const fromIndex = cards.indexOf(dragSourceCard);
      const toIndex = cards.indexOf(card);
      if (fromIndex < 0 || toIndex < 0) return;

      if (fromIndex < toIndex) {
        container.insertBefore(dragSourceCard, card.nextSibling);
      } else {
        container.insertBefore(dragSourceCard, card);
      }
    });
  });
}

function enforceMinOneEnabled(): void {
  const checkboxes = Array.from(refs.templateConfigs.querySelectorAll<HTMLInputElement>('.tpl-checkbox'));
  const enabledCount = checkboxes.filter((cb) => cb.checked).length;
  if (enabledCount <= 1) {
    checkboxes.forEach((cb) => { if (cb.checked) cb.disabled = true; });
  } else {
    checkboxes.forEach((cb) => { cb.disabled = false; });
  }
}

function collectTemplateOrder(): RewriteTemplateId[] {
  return Array.from(refs.templateConfigs.querySelectorAll<HTMLElement>('.tpl-card'))
    .map((card) => card.dataset.templateId as RewriteTemplateId);
}

function collectTemplateConfigs(): Partial<Record<RewriteTemplateId, TemplateConfig>> {
  const result: Partial<Record<RewriteTemplateId, TemplateConfig>> = {};
  refs.templateConfigs.querySelectorAll<HTMLElement>('.tpl-card').forEach((card) => {
    const id = card.dataset.templateId as RewriteTemplateId;
    const tpl = REWRITE_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    const checkbox = card.querySelector('.tpl-checkbox') as HTMLInputElement;
    const textarea = card.querySelector('.tpl-instruction') as HTMLTextAreaElement;
    const instruction = textarea.value.trim();
    result[id] = {
      enabled: checkbox.checked,
      instruction: instruction === tpl.instruction ? '' : instruction,
    };
  });
  return result;
}

async function refreshBadges(): Promise<void> {
  const [keys, settingsResult] = await Promise.all([
    Promise.all([
      getOpenAIKey(),
      getGeminiKey(),
      getGrokKey(),
      getOpenRouterKey(),
      getZaiKey(),
      getAnthropicKey(),
      getCustomKey(),
    ]),
    chrome.storage.local.get('apc_settings'),
  ]);

  const [openaiKey, geminiKey, grokKey, openrouterKey, zaiKey, anthropicKey, customKey] = keys;
  const settings = settingsResult.apc_settings as ProviderSettings | undefined;
  const customEndpoint = settings?.customEndpoint?.trim() ?? '';

  setBadge(refs.badgeOpenai, !!openaiKey);
  setBadge(refs.badgeGemini, !!geminiKey);
  setBadge(refs.badgeGrok, !!grokKey);
  setBadge(refs.badgeOpenrouter, !!openrouterKey);
  setBadge(refs.badgeZai, !!zaiKey);
  setBadge(refs.badgeAnthropic, !!anthropicKey);
  setBadge(refs.badgeCustom, !!(customKey || customEndpoint));

  refs.navAiWarning.classList.toggle('hidden', keys.some(k => k.trim()));
}

function applyTranslations(lang: AppLanguage): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && key !== 'allowed-sites' && key !== 'blocked-sites') {
      const text = t(key, lang);
      if (el.innerHTML.includes('<code>')) {
        const code = el.innerHTML.match(/<code>.*?<\/code>/)?.[0];
        el.innerHTML = text + (code ? ' ' + code : '');
      } else {
        el.textContent = text;
      }
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (key) {
      el.innerHTML = t(key, lang);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      (el as HTMLInputElement).placeholder = t(key, lang);
    }
  });

  const mode = getSegmentedValue(refs.siteModeSeg) as SiteListMode;
  if (mode !== 'all') {
    const titleKey = mode === 'allowlist' ? 'allowed-sites' : 'blocked-sites';
    refs.siteListTitle.textContent = t(titleKey, lang);
  }
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

function populateTemplateDropdown(): void {
  refs.defaultTemplate.innerHTML = '';
  REWRITE_TEMPLATES.forEach((template) => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.label;
    refs.defaultTemplate.appendChild(option);
  });
}

function applySettings(settings: ProviderSettings): void {
  refs.defaultTemplate.value = settings.defaultTemplateId ?? 'auto_fix';
  setSegmentedValue(refs.providerSegmented, settings.llmProvider);
  refs.systemPrompt.value = settings.systemPrompt ?? '';
  refs.showPillLabels.checked = settings.showPillLabels;
  refs.forceInsert.checked = settings.forceInsert;
  setSegmentedValue(refs.languageSeg, settings.language);
  setSegmentedValue(refs.siteModeSeg, settings.siteListMode);
  refs.siteList.value = settings.siteList.join('\n');
  refs.openaiModel.value = settings.openaiModel;
  refs.openaiCustomModel.value = settings.openaiCustomModel || '';
  refs.geminiModel.value = settings.geminiModel;
  refs.geminiCustomModel.value = settings.geminiCustomModel || '';
  refs.grokModel.value = settings.grokModel;
  refs.grokCustomModel.value = settings.grokCustomModel || '';
  refs.openrouterModel.value = settings.openrouterModel;
  refs.openrouterCustomModel.value = settings.openrouterCustomModel || '';
  refs.zaiModel.value = settings.zaiModel;
  refs.zaiCustomModel.value = settings.zaiCustomModel || '';
  refs.anthropicModel.value = settings.anthropicModel;
  refs.anthropicCustomModel.value = settings.anthropicCustomModel || '';
  refs.customOverrideModel.value = settings.customOverrideModel || '';
  refs.customEndpoint.value = settings.customEndpoint;
  renderTemplateConfigs(settings.templateConfigs ?? {}, settings.templateOrder);
  updateSiteListVisibility(settings.siteListMode);
  applyTranslations(settings.language);
}

let saving = false;

async function saveAllSettings(statusEl: HTMLElement): Promise<void> {
  if (saving) return;
  saving = true;

  const llmProvider = (getSegmentedValue(refs.providerSegmented) || 'openai') as Provider;
  const language = (getSegmentedValue(refs.languageSeg) || 'en') as AppLanguage;
  const siteListMode = (getSegmentedValue(refs.siteModeSeg) || 'all') as SiteListMode;
  const siteList = refs.siteList.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  await saveProviderSettings({
    defaultTemplateId: refs.defaultTemplate.value as RewriteTemplateId,
    llmProvider,
    openaiModel: refs.openaiModel.value,
    geminiModel: refs.geminiModel.value,
    grokModel: refs.grokModel.value,
    openrouterModel: refs.openrouterModel.value,
    zaiModel: refs.zaiModel.value,
    anthropicModel: refs.anthropicModel.value,
    customEndpoint: refs.customEndpoint.value,
    openaiCustomModel: refs.openaiCustomModel.value.trim() || undefined,
    geminiCustomModel: refs.geminiCustomModel.value.trim() || undefined,
    grokCustomModel: refs.grokCustomModel.value.trim() || undefined,
    openrouterCustomModel: refs.openrouterCustomModel.value.trim() || undefined,
    zaiCustomModel: refs.zaiCustomModel.value.trim() || undefined,
    anthropicCustomModel: refs.anthropicCustomModel.value.trim() || undefined,
    customOverrideModel: refs.customOverrideModel.value.trim() || undefined,
    systemPrompt: refs.systemPrompt.value,
    templateConfigs: collectTemplateConfigs(),
    templateOrder: collectTemplateOrder(),
    showPillLabels: refs.showPillLabels.checked,
    forceInsert: refs.forceInsert.checked,
    language,
    siteListMode,
    siteList,
  });

  saving = false;
  flash(statusEl, '✓ Saved');
}

function wireSettingsButtons(): void {
  refs.btnSaveSettings.addEventListener('click', async () => { await saveAllSettings(refs.settingsStatus); });
  refs.btnSaveTemplates.addEventListener('click', async () => { await saveAllSettings(refs.templatesStatus); });
}

function wireModelInputs(): void {
  const modelInputs = [
    refs.openaiModel,
    refs.geminiModel,
    refs.grokModel,
    refs.openrouterModel,
    refs.zaiModel,
    refs.anthropicModel,
    refs.openaiCustomModel,
    refs.geminiCustomModel,
    refs.grokCustomModel,
    refs.openrouterCustomModel,
    refs.zaiCustomModel,
    refs.anthropicCustomModel,
    refs.customOverrideModel,
  ];

  const debouncedSave = debounce(() => saveAllSettings(refs.settingsStatus), 300);

  modelInputs.forEach((input) => {
    if (input instanceof HTMLSelectElement) {
      input.addEventListener('change', () => {
        debouncedSave();
      });
    } else {
      input.addEventListener('input', () => {
        debouncedSave();
      });
      input.addEventListener('blur', () => {
        saveAllSettings(refs.settingsStatus);
      });
    }
  });

  refs.systemPrompt.addEventListener('input', () => debouncedSave());
  refs.showPillLabels.addEventListener('change', () => debouncedSave());
  refs.forceInsert.addEventListener('change', () => debouncedSave());
  refs.defaultTemplate.addEventListener('change', () => debouncedSave());
  refs.siteList.addEventListener('input', () => debouncedSave());
}

function wireKeyButton(
  input: HTMLInputElement,
  saveBtn: HTMLButtonElement,
  clearBtn: HTMLButtonElement,
  saveFn: (key: string) => Promise<void>,
  providerName: string
): void {
  saveBtn.addEventListener('click', async () => {
    await saveFn(input.value.trim());
    await refreshBadges();
    flash(refs.keysStatus, `✓ ${providerName} key saved`);
  });

  clearBtn.addEventListener('click', async () => {
    input.value = '';
    await saveFn('');
    await refreshBadges();
    flash(refs.keysStatus, `✓ ${providerName} key cleared`);
  });
}

function wireProviderKeyButtons(): void {
  wireKeyButton(refs.openaiKey, refs.btnSaveOpenai, refs.btnClearOpenai, saveOpenAIKey, 'OpenAI');
  wireKeyButton(refs.geminiKey, refs.btnSaveGemini, refs.btnClearGemini, saveGeminiKey, 'Gemini');
  wireKeyButton(refs.grokKey, refs.btnSaveGrok, refs.btnClearGrok, saveGrokKey, 'Grok');
  wireKeyButton(refs.openrouterKey, refs.btnSaveOpenrouter, refs.btnClearOpenrouter, saveOpenRouterKey, 'OpenRouter');
  wireKeyButton(refs.zaiKey, refs.btnSaveZai, refs.btnClearZai, saveZaiKey, 'Zai');
  wireKeyButton(refs.anthropicKey, refs.btnSaveAnthropic, refs.btnClearAnthropic, saveAnthropicKey, 'Anthropic');

  refs.btnSaveCustom.addEventListener('click', async () => {
    await saveCustomKey(refs.customKey.value);
    await saveProviderSettings({
      customEndpoint: refs.customEndpoint.value,
    });
    await refreshBadges();
    flash(refs.keysStatus, '✓ Custom endpoint saved');
  });

  refs.btnClearCustom.addEventListener('click', async () => {
    refs.customKey.value = '';
    refs.customEndpoint.value = DEFAULT_SETTINGS.customEndpoint;
    await saveCustomKey('');
    await saveProviderSettings({
      customEndpoint: DEFAULT_SETTINGS.customEndpoint,
    });
    await refreshBadges();
    flash(refs.keysStatus, '✓ Custom endpoint cleared');
  });
}

async function loadApiKeys(): Promise<void> {
  const [keys, settingsResult] = await Promise.all([
    Promise.all([
      getOpenAIKey(),
      getGeminiKey(),
      getGrokKey(),
      getOpenRouterKey(),
      getZaiKey(),
      getAnthropicKey(),
      getCustomKey(),
    ]),
    chrome.storage.local.get('apc_settings'),
  ]);

  const [openaiKey, geminiKey, grokKey, openrouterKey, zaiKey, anthropicKey, customKey] = keys;
  const settings = settingsResult.apc_settings as ProviderSettings | undefined;
  const customEndpoint = settings?.customEndpoint?.trim() ?? '';

  refs.openaiKey.value = openaiKey;
  refs.geminiKey.value = geminiKey;
  refs.grokKey.value = grokKey;
  refs.openrouterKey.value = openrouterKey;
  refs.zaiKey.value = zaiKey;
  refs.anthropicKey.value = anthropicKey;
  refs.customKey.value = customKey;

  setBadge(refs.badgeOpenai, !!openaiKey);
  setBadge(refs.badgeGemini, !!geminiKey);
  setBadge(refs.badgeGrok, !!grokKey);
  setBadge(refs.badgeOpenrouter, !!openrouterKey);
  setBadge(refs.badgeZai, !!zaiKey);
  setBadge(refs.badgeAnthropic, !!anthropicKey);
  setBadge(refs.badgeCustom, !!(customKey || customEndpoint));
  refs.navAiWarning.classList.toggle('hidden', !!(openaiKey && geminiKey && grokKey));
}

async function init(): Promise<void> {
  wireTabs();
  refs.aboutVersion.textContent = chrome.runtime.getManifest().version;

  populateTemplateDropdown();
  populateSelect(refs.openaiModel, PROVIDER_MODELS.openai, PROVIDER_MODELS.openai[0]);
  populateSelect(refs.geminiModel, PROVIDER_MODELS.gemini, PROVIDER_MODELS.gemini[0]);
  populateSelect(refs.grokModel, PROVIDER_MODELS.grok, PROVIDER_MODELS.grok[0]);
  populateSelect(refs.openrouterModel, PROVIDER_MODELS.openrouter, PROVIDER_MODELS.openrouter[0]);
  populateSelect(refs.zaiModel, PROVIDER_MODELS.zai, PROVIDER_MODELS.zai[0]);
  populateSelect(refs.anthropicModel, PROVIDER_MODELS.anthropic, PROVIDER_MODELS.anthropic[0]);

  wireSegmented(refs.providerSegmented, () => {
    saveAllSettings(refs.settingsStatus);
  });
  wireSegmented(refs.languageSeg, (value) => {
    applyTranslations(value as AppLanguage);
  });
  wireSegmented(refs.siteModeSeg, (value) => {
    const lang = (getSegmentedValue(refs.languageSeg) || 'en') as AppLanguage;
    updateSiteListVisibility(value as SiteListMode);
  });

  const settings = await getProviderSettings();
  applySettings(settings);
  await loadApiKeys();

  wireSettingsButtons();
  wireModelInputs();
  wireProviderKeyButtons();
}

void init().catch((error: unknown) => {
  console.error('[Sentō] settings init failed', error);
});
