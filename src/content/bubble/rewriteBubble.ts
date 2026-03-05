import { REWRITE_TEMPLATES } from '../../shared/rewriteTemplates';
import type { RewriteTemplateId } from '../../shared/types';
import type { SelectionRect } from '../types';
import { bubbleStyles } from './styles';

interface BubbleHandlers {
  onRewrite: (templateId: RewriteTemplateId) => void;
  onApply: (text: string) => void;
  onRetry: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

interface BubbleRefs {
  root: HTMLElement;
  bubble: HTMLElement;
  templateSelect: HTMLSelectElement;
  templateButtons: HTMLButtonElement[];
  btnRewrite: HTMLButtonElement;
  btnClose: HTMLButtonElement;
  selectionMeta: HTMLElement;
  status: HTMLElement;
  btnSettings: HTMLButtonElement;
  preview: HTMLTextAreaElement;
  actions: HTMLElement;
  btnApply: HTMLButtonElement;
  btnRetry: HTMLButtonElement;
}

export class RewriteBubble {
  private readonly host: HTMLDivElement;
  private readonly shadow: ShadowRoot;
  private readonly refs: BubbleRefs;
  private readonly handlers: BubbleHandlers;
  private lastRect: SelectionRect | null = null;
  private rafId = 0;
  private interacting = false;
  private interactionUntil = 0;

  constructor(handlers: BubbleHandlers) {
    this.handlers = handlers;

    this.host = document.createElement('div');
    this.host.style.position = 'fixed';
    this.host.style.left = '0';
    this.host.style.top = '0';
    this.host.style.zIndex = '2147483647';

    this.shadow = this.host.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = this.render();

    this.refs = {
      root: this.shadow.querySelector('.sento-root') as HTMLElement,
      bubble: this.shadow.querySelector('.sento-bubble') as HTMLElement,
      templateSelect: this.shadow.querySelector('#sento-template') as HTMLSelectElement,
      templateButtons: Array.from(
        this.shadow.querySelectorAll<HTMLButtonElement>('[data-template-id]')
      ),
      btnRewrite: this.shadow.querySelector('#sento-rewrite') as HTMLButtonElement,
      btnClose: this.shadow.querySelector('#sento-close') as HTMLButtonElement,
      selectionMeta: this.shadow.querySelector('#sento-selection-meta') as HTMLElement,
      status: this.shadow.querySelector('#sento-status') as HTMLElement,
      btnSettings: this.shadow.querySelector('#sento-open-settings') as HTMLButtonElement,
      preview: this.shadow.querySelector('#sento-preview') as HTMLTextAreaElement,
      actions: this.shadow.querySelector('#sento-actions') as HTMLElement,
      btnApply: this.shadow.querySelector('#sento-apply') as HTMLButtonElement,
      btnRetry: this.shadow.querySelector('#sento-retry') as HTMLButtonElement,
    };

    this.wire();
    document.documentElement.appendChild(this.host);

    window.addEventListener('resize', this.handleViewportChange, { passive: true });
    window.addEventListener('scroll', this.handleViewportChange, { passive: true, capture: true });
    window.addEventListener('pointerup', this.handlePointerUp, true);
    window.addEventListener('pointercancel', this.handlePointerUp, true);
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleViewportChange);
    window.removeEventListener('scroll', this.handleViewportChange, true);
    window.removeEventListener('pointerup', this.handlePointerUp, true);
    window.removeEventListener('pointercancel', this.handlePointerUp, true);
    this.shadow.removeEventListener('mousedown', this.handleMouseDown, true);
    this.host.remove();
  }

  setTheme(theme: 'dark' | 'light'): void {
    this.refs.root.dataset.theme = theme;
  }

  show(rect: SelectionRect, selectedText: string): void {
    this.lastRect = rect;
    this.refs.bubble.classList.remove('hidden');
    this.refs.selectionMeta.textContent = `${selectedText.length.toLocaleString()} chars selected`;
    this.reposition();
  }

  hide(): void {
    this.refs.bubble.classList.add('hidden');
    this.lastRect = null;
  }

  containsTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    if (this.host === target) return true;
    if (this.host.contains(target)) return true;
    return this.shadow.contains(target);
  }

  isVisible(): boolean {
    return !this.refs.bubble.classList.contains('hidden');
  }

  isInteracting(): boolean {
    return this.interacting || Date.now() < this.interactionUntil;
  }

  setLoading(loading: boolean): void {
    this.refs.btnRewrite.disabled = loading;
    const selectedId = this.getTemplateId();
    for (const button of this.refs.templateButtons) {
      button.disabled = loading;
      button.classList.toggle('loading', loading && button.dataset.templateId === selectedId);
    }
    this.refs.btnRewrite.textContent = loading ? 'Rewriting…' : 'Auto-Fix';
  }

  getTemplateId(): RewriteTemplateId {
    return this.refs.templateSelect.value as RewriteTemplateId;
  }

  setTemplateId(templateId: RewriteTemplateId): void {
    this.refs.templateSelect.value = templateId;
    for (const button of this.refs.templateButtons) {
      const isActive = button.dataset.templateId === templateId;
      if (isActive) {
        button.classList.remove('active');
        void button.offsetWidth;
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  }

  setPreview(text: string): void {
    this.refs.preview.classList.remove('hidden');
    this.refs.preview.value = text;
    this.refs.actions.classList.remove('hidden');
    this.clearError();
    this.reposition();
  }

  clearPreview(): void {
    this.refs.preview.classList.add('hidden');
    this.refs.preview.value = '';
    this.refs.actions.classList.add('hidden');
  }

  showError(message: string, showSettingsAction = false): void {
    this.refs.status.classList.remove('hidden');
    this.refs.status.classList.add('error');
    const textNode = this.refs.status.querySelector('[data-role="msg"]') as HTMLElement;
    textNode.textContent = message;
    this.refs.btnSettings.classList.toggle('hidden', !showSettingsAction);
  }

  clearError(): void {
    this.refs.status.classList.add('hidden');
    this.refs.status.classList.remove('error');
    const textNode = this.refs.status.querySelector('[data-role="msg"]') as HTMLElement;
    textNode.textContent = '';
    this.refs.btnSettings.classList.add('hidden');
  }

  private wire(): void {
    this.shadow.addEventListener('mousedown', this.handleMouseDown, true);
    this.shadow.addEventListener('pointerdown', this.handlePointerDown, true);
    this.shadow.addEventListener('focusin', this.handleFocusIn, true);
    this.shadow.addEventListener('focusout', this.handleFocusOut, true);

    for (const button of this.refs.templateButtons) {
      button.addEventListener('click', () => {
        const templateId = button.dataset.templateId as RewriteTemplateId;
        this.setTemplateId(templateId);
        setTimeout(() => this.handlers.onRewrite(templateId), 460);
      });
    }

    this.refs.btnRewrite.addEventListener('click', () => {
      this.handlers.onRewrite(this.getTemplateId());
    });

    this.refs.btnApply.addEventListener('click', () => {
      this.handlers.onApply(this.refs.preview.value);
    });

    this.refs.btnRetry.addEventListener('click', () => {
      this.handlers.onRetry();
    });

    this.refs.btnClose.addEventListener('click', () => {
      this.handlers.onClose();
    });

    this.refs.btnSettings.addEventListener('click', () => {
      this.handlers.onOpenSettings();
    });
  }

  private handleViewportChange = (): void => {
    if (!this.isVisible()) return;
    this.scheduleReposition();
  };

  private handleMouseDown = (event: Event): void => {
    const target = event.target as Element | null;
    if (!target) return;

    // Keep editor selection stable while using action buttons inside the bubble.
    if (target.closest('button')) {
      event.preventDefault();
    }
  };

  private handlePointerDown = (): void => {
    this.interacting = true;
    this.interactionUntil = Date.now() + 1200;
  };

  private handlePointerUp = (): void => {
    this.interacting = false;
    this.interactionUntil = Date.now() + 900;
  };

  private handleFocusIn = (): void => {
    this.interacting = true;
    this.interactionUntil = Date.now() + 1200;
  };

  private handleFocusOut = (event: Event): void => {
    const relatedTarget = (event as FocusEvent).relatedTarget;
    if (this.containsTarget(relatedTarget)) {
      this.interactionUntil = Date.now() + 900;
      return;
    }
    this.interacting = false;
    this.interactionUntil = Date.now() + 600;
  };

  private scheduleReposition(): void {
    if (this.rafId !== 0) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.reposition();
    });
  }

  private reposition(): void {
    if (!this.lastRect) return;

    const padding = 8;
    const targetX = this.lastRect.left + this.lastRect.width / 2;
    const targetY = this.lastRect.bottom + 10;

    const width = this.refs.bubble.offsetWidth || 228;
    const height = this.refs.bubble.offsetHeight || 46;

    const left = Math.min(Math.max(padding, targetX - width / 2), window.innerWidth - width - padding);

    let top = targetY;
    if (top + height > window.innerHeight - padding) {
      top = Math.max(padding, this.lastRect.top - height - 10);
    }

    this.refs.bubble.style.left = `${Math.round(left)}px`;
    this.refs.bubble.style.top = `${Math.round(top)}px`;
  }

  private render(): string {
    const options = REWRITE_TEMPLATES.map(
      (tpl) => `<option value="${tpl.id}">${tpl.label}</option>`
    ).join('');
    const iconByTemplate: Record<RewriteTemplateId, string> = {
      auto_fix:
        '<svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true"><path d="M12 2.5l1.9 7.1 7.1 1.9-7.1 1.9-1.9 7.1-1.9-7.1-7.1-1.9 7.1-1.9z"/></svg>',
      professional:
        '<svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true"><path d="M10.5 3h3l1 5.5H9.5L10.5 3zm-1.2 7h5.4l-1.5 11h-2.4L9.3 10z"/></svg>',
      technical:
        '<svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true"><path d="M8.8 7.5L4 12l4.8 4.5 1.6-1.6L7.2 12l3.2-2.9-1.6-1.6zm6.4 0-1.6 1.6 3.2 2.9-3.2 2.9 1.6 1.6L20 12l-4.8-4.5z"/></svg>',
      shorten:
        '<svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true"><path d="M4 6h16v2.5H4zm0 5.5h11v2.5H4zm0 5.5h7v2.5H4z"/></svg>',
    };
    const labelByTemplate: Record<RewriteTemplateId, string> = {
      auto_fix:     'Fix',
      professional: 'Pro',
      technical:    'Code',
      shorten:      'Trim',
    };
    const templateButtons = REWRITE_TEMPLATES.map((tpl, index) => {
      const isActive = index === 0 ? ' active' : '';
      return `
        <button
          class="template-square${isActive}"
          type="button"
          data-template-id="${tpl.id}"
          aria-label="Rewrite as ${tpl.label}"
          aria-pressed="${index === 0 ? 'true' : 'false'}"
          title="${tpl.label}"
        >
          <span class="icon-wrap">${iconByTemplate[tpl.id]}</span>
          <span class="tile-label">${labelByTemplate[tpl.id]}</span>
        </button>
      `;
    }).join('');

    return `
      <style>${bubbleStyles}</style>
      <div class="sento-root" data-theme="dark">
        <div class="sento-bubble hidden">
          <div class="quick-grid" role="toolbar" aria-label="Sentō rewrite templates">
            ${templateButtons}
          </div>

          <select id="sento-template" class="hidden-select" aria-hidden="true" tabindex="-1">${options}</select>
          <button id="sento-rewrite" class="hidden-trigger" type="button">Auto-Fix</button>
          <button id="sento-close" class="close-btn" type="button" aria-label="Close">×</button>

          <div id="sento-selection-meta" class="selection-meta">0 chars selected</div>

          <div id="sento-status" class="status-msg hidden">
            <span data-role="msg"></span>
            <button id="sento-open-settings" class="hidden" type="button">Open Settings</button>
          </div>

          <textarea id="sento-preview" class="preview hidden" aria-label="Rewrite preview"></textarea>

          <div id="sento-actions" class="actions hidden">
            <button id="sento-retry" class="btn-ghost" type="button">Retry</button>
            <button id="sento-apply" class="btn-apply" type="button">Apply</button>
          </div>
        </div>
      </div>
    `;
  }
}
