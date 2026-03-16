// Copyright (c) Artem Iagovdik

import { MAX_SELECTION_CHARS } from '../shared/constants';
import { MSG, type RewriteRuntimeResult } from '../shared/messages';
import { getOrderedTemplates, REWRITE_TEMPLATES } from '../shared/rewriteTemplates';
import { getProviderSettings } from '../shared/storage';
import type { ProviderSettings, RewriteTemplateId } from '../shared/types';
import { RewriteBubble } from './bubble/rewriteBubble';
import { InputHandler } from './input/inputHandler';
import { ActiveEditableTracker } from './selectionTracker';
import type { SelectionSnapshot } from './types';

function isExtensionAlive(): boolean {
  return !!(chrome.runtime && chrome.runtime.id);
}

export class RewriteController {
  private readonly bubble: RewriteBubble;
  private readonly tracker: ActiveEditableTracker;
  private readonly inputHandler: InputHandler;

  private snapshot: SelectionSnapshot | null = null;
  private pendingRequestId: string | null = null;
  private loading = false;
  private hasPreview = false;
  private lastTemplateId: RewriteTemplateId = 'auto_fix';
  private forceInsert = false;

  constructor() {
    this.inputHandler = new InputHandler();

    this.bubble = new RewriteBubble({
      onRewrite: (templateId, forceApply) => {
        void this.handleRewrite(templateId, forceApply);
      },
      onApply: (text) => {
        this.handleApply(text);
      },
      onRetry: () => {
        void this.handleRewrite(this.lastTemplateId);
      },
      onClose: () => {
        void this.abortPending();
        this.loading = false;
        this.hasPreview = false;
        this.bubble.setLoading(false);
        this.bubble.clearPreview();
        this.bubble.clearError();
        this.bubble.hide();
      },
      onOpenSettings: () => {
        if (isExtensionAlive()) {
          void chrome.runtime.sendMessage({ type: MSG.OPEN_SETTINGS });
        }
      },
    });

    this.tracker = new ActiveEditableTracker({
      onSnapshotChange: (snapshot) => {
        this.handleSnapshot(snapshot);
      },
      shouldIgnoreBlur: (target) => this.bubble.containsTarget(target) || this.bubble.isInteracting(),
    });
  }

  async start(): Promise<void> {
    const settings = await getProviderSettings();
    this.applySettings(settings);

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      const settingsChange = changes.apc_settings as chrome.storage.StorageChange | undefined;
      const nextSettings = settingsChange?.newValue as Partial<ProviderSettings> | undefined;
      if (nextSettings) {
        this.applySettings(nextSettings);
      }
    });

    this.tracker.start();
  }

  private applySettings(settings: Partial<ProviderSettings>): void {
    if (settings.templateConfigs || settings.defaultTemplateId || settings.templateOrder) {
      const enabledIds = this.getEnabledIds(settings.templateConfigs, settings.templateOrder);
      this.bubble.setEnabledTemplates(enabledIds);
    }
    if (settings.defaultTemplateId) {
      this.lastTemplateId = settings.defaultTemplateId;
      this.bubble.setTemplateId(settings.defaultTemplateId);
    }
    if (settings.showPillLabels !== undefined) {
      this.bubble.setShowLabels(settings.showPillLabels);
    }
    if (settings.forceInsert !== undefined) {
      this.forceInsert = settings.forceInsert;
    }
  }

  private getEnabledIds(configs?: ProviderSettings['templateConfigs'], order?: ProviderSettings['templateOrder']): RewriteTemplateId[] {
    const ordered = getOrderedTemplates(order);
    if (!configs) return ordered.map((t) => t.id);
    const ids = ordered.filter((t) => configs[t.id]?.enabled !== false).map((t) => t.id);
    return ids.length > 0 ? ids : [ordered[0].id];
  }

  private handleSnapshot(snapshot: SelectionSnapshot | null): void {
    if (snapshot) {
      if (this.loading || this.hasPreview) {
        return;
      }
      this.snapshot = snapshot;
      this.hasPreview = false;
      this.bubble.clearPreview();
      this.bubble.clearError();
      this.bubble.show(snapshot.rect, snapshot.text);
      return;
    }

    if (this.bubble.isInteracting()) {
      return;
    }

    void this.abortPending();
    this.loading = false;
    this.hasPreview = false;
    this.snapshot = null;
    this.bubble.setLoading(false);
    this.bubble.clearPreview();
    this.bubble.clearError();
    this.bubble.hide();
  }

  private async handleRewrite(templateId: RewriteTemplateId, forceApply = false): Promise<void> {
    const shouldForce = forceApply || this.forceInsert;
    if (this.loading) return;

    const snapshot = this.snapshot;
    if (!snapshot || !snapshot.element.isConnected) {
      this.bubble.showError('Selection expired. Please reselect text.');
      return;
    }

    const requestId = crypto.randomUUID();
    this.pendingRequestId = requestId;
    this.lastTemplateId = templateId;

    let text = snapshot.text;
    if (!text.trim()) {
      this.bubble.showError('Select text in an editable field first.');
      return;
    }

    if (text.length > MAX_SELECTION_CHARS) {
      text = text.slice(0, MAX_SELECTION_CHARS);
      this.bubble.showError(`Selection truncated to ${MAX_SELECTION_CHARS.toLocaleString()} characters for performance.`);
    } else {
      this.bubble.clearError();
    }

    this.loading = true;
    this.bubble.setLoading(true);

    try {
      if (!isExtensionAlive()) {
        this.bubble.showError('Extension was reloaded. Refresh the page.');
        return;
      }

      const response = (await chrome.runtime.sendMessage({
        type: MSG.REWRITE_REQUEST,
        payload: {
          requestId,
          text,
          templateId,
          context: {
            url: location.href,
            title: document.title,
          },
        },
      })) as RewriteRuntimeResult;

      if (!response || response.ok !== true) {
        const errMsg = response?.error?.message ?? 'Rewrite failed.';
        const showSettingsAction = response?.error?.code === 'MISSING_KEY';
        this.bubble.showError(errMsg, showSettingsAction);
        return;
      }

      if (shouldForce) {
        this.handleApply(response.payload.text);
        return;
      }

      this.hasPreview = true;
      this.bubble.setPreview(response.payload.text);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected runtime error.';
      this.bubble.showError(message);
    } finally {
      this.loading = false;
      this.pendingRequestId = null;
      this.bubble.setLoading(false);
    }
  }

  private handleApply(text: string): void {
    const snapshot = this.snapshot;
    if (!snapshot) {
      this.bubble.showError('Selection expired. Reselect text and retry.');
      return;
    }

    const result = this.inputHandler.apply(snapshot, text);
    if (!result.ok) {
      this.bubble.showError(result.message ?? 'Could not apply rewrite.');
      return;
    }

    this.hasPreview = false;
    this.snapshot = null;
    this.tracker.clearSnapshot();
    this.bubble.clearPreview();
    this.bubble.clearError();
    this.bubble.hide();
  }

  private async abortPending(): Promise<void> {
    if (!this.pendingRequestId) return;

    if (isExtensionAlive()) {
      await chrome.runtime.sendMessage({
        type: MSG.REWRITE_ABORT,
        requestId: this.pendingRequestId,
      }).catch(() => {});
    }

    this.pendingRequestId = null;
  }
}
