// Copyright (c) Artem Iagovdik

import { PROVIDER_MODELS } from '../shared/constants';
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
} from '../shared/storage';
import type { AppLanguage, RewriteTemplateId, SiteListMode, TemplateConfig } from '../shared/types';
import { t } from './i18n';

type Provider = 'openai' | 'gemini' | 'grok';

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
  templateConfigs: document.getElementById('template-configs') as HTMLElement,
};

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
  const [openaiKey, geminiKey, grokKey] = await Promise.all([getOpenAIKey(), getGeminiKey(), getGrokKey()]);

  setBadge(refs.badgeOpenai, !!openaiKey);
  setBadge(refs.badgeGemini, !!geminiKey);
  setBadge(refs.badgeGrok, !!grokKey);

  refs.navAiWarning.classList.toggle('hidden', !!(openaiKey && geminiKey && grokKey));
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
  wireSegmented(refs.languageSeg, (value) => {
    applyTranslations(value as AppLanguage);
  });
  wireSegmented(refs.siteModeSeg, (value) => {
    const lang = (getSegmentedValue(refs.languageSeg) || 'en') as AppLanguage;
    updateSiteListVisibility(value as SiteListMode);
  });

  const settings = await getProviderSettings();
  refs.defaultTemplate.value = settings.defaultTemplateId ?? 'auto_fix';
  setSegmentedValue(refs.providerSegmented, settings.llmProvider);
  refs.systemPrompt.value = settings.systemPrompt ?? '';
  refs.showPillLabels.checked = settings.showPillLabels;
  refs.forceInsert.checked = settings.forceInsert;
  setSegmentedValue(refs.languageSeg, settings.language);
  setSegmentedValue(refs.siteModeSeg, settings.siteListMode);
  refs.siteList.value = settings.siteList.join('\n');
  updateSiteListVisibility(settings.siteListMode);
  refs.openaiModel.value = settings.openaiModel;
  refs.geminiModel.value = settings.geminiModel;
  refs.grokModel.value = settings.grokModel;
  renderTemplateConfigs(settings.templateConfigs ?? {}, settings.templateOrder);

  applyTranslations(settings.language);

  refs.openaiKey.value = await getOpenAIKey();
  refs.geminiKey.value = await getGeminiKey();
  refs.grokKey.value = await getGrokKey();
  await refreshBadges();

  let saving = false;

  const saveAllSettings = async (statusEl: HTMLElement): Promise<void> => {
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
  };

  refs.btnSaveSettings.addEventListener('click', async () => { await saveAllSettings(refs.settingsStatus); });
  refs.btnSaveTemplates.addEventListener('click', async () => { await saveAllSettings(refs.templatesStatus); });

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
