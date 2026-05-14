// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';

const settingsHtml = `<!DOCTYPE html><html><head></head><body>
  <select id="default-template"><option value="auto_fix">Fix</option></select>
  <div id="provider-segmented"><button class="seg-btn active" data-value="openai">OpenAI</button></div>
  <textarea id="system-prompt"></textarea>
  <input id="show-pill-labels" type="checkbox" />
  <input id="force-insert" type="checkbox" />
  <div id="language-segmented"><button class="seg-btn active" data-value="en">EN</button></div>
  <div id="site-mode-segmented"><button class="seg-btn active" data-value="all">All</button></div>
  <div id="site-list-row"><h3 id="site-list-title"></h3><textarea id="site-list"></textarea></div>
  <textarea id="site-list"></textarea>
  <button id="btn-save-settings">Save</button>
  <button id="btn-save-templates">Save</button>

  <select id="openai-model"><option>gpt-4o-mini</option></select>
  <input id="openai-custom-model" />
  <select id="gemini-model"><option>gemini-2.5-flash</option></select>
  <input id="gemini-custom-model" />
  <select id="grok-model"><option>grok-3-mini</option></select>
  <input id="grok-custom-model" />

  <input id="openai-key" /><button id="btn-save-openai">Save</button><button id="btn-clear-openai">Clear</button>
  <input id="gemini-key" /><button id="btn-save-gemini">Save</button><button id="btn-clear-gemini">Clear</button>
  <input id="grok-key" /><button id="btn-save-grok">Save</button><button id="btn-clear-grok">Clear</button>

  <span id="badge-openai"></span><span id="badge-gemini"></span><span id="badge-grok"></span>

  <select id="openrouter-model"><option>anthropic/claude-sonnet-4-6</option></select>
  <input id="openrouter-custom-model" />
  <select id="zai-model"><option>zai-7b</option></select>
  <input id="zai-custom-model" />
  <select id="anthropic-model"><option>claude-sonnet-4-6</option></select>
  <input id="anthropic-custom-model" />

  <input id="openrouter-key" /><button id="btn-save-openrouter">Save</button><button id="btn-clear-openrouter">Clear</button>
  <input id="zai-key" /><button id="btn-save-zai">Save</button><button id="btn-clear-zai">Clear</button>
  <input id="anthropic-key" /><button id="btn-save-anthropic">Save</button><button id="btn-clear-anthropic">Clear</button>

  <span id="badge-openrouter"></span><span id="badge-zai"></span><span id="badge-anthropic"></span>

  <input id="custom-override-model" placeholder="e.g. llama3, qwen3:1.7b" />
  <input id="custom-endpoint" />
  <input id="custom-key" />
  <input id="custom-use-auth" type="checkbox" />
  <button id="btn-save-custom">Save</button><button id="btn-clear-custom">Clear</button>
  <span id="badge-custom"></span>
  <div id="nav-ai-warning"></div>
  <div id="global-toast" class="hidden"></div>

  <div id="about-version"></div>
  <div id="template-configs"></div>

  <div id="openai-card" data-provider="openai"><div>
    <input id="openai-key" /><button id="btn-save-openai">Save</button><button id="btn-clear-openai">Clear</button>
  </div></div>
  <div id="gemini-card" data-provider="gemini"><div>
    <input id="gemini-key" /><button id="btn-save-gemini">Save</button><button id="btn-clear-gemini">Clear</button>
  </div></div>
  <div id="grok-card" data-provider="grok"><div>
    <input id="grok-key" /><button id="btn-save-grok">Save</button><button id="btn-clear-grok">Clear</button>
  </div></div>
  <div id="openrouter-card" data-provider="openrouter"><div>
    <input id="openrouter-key" /><button id="btn-save-openrouter">Save</button><button id="btn-clear-openrouter">Clear</button>
  </div></div>
  <div id="zai-card" data-provider="zai"><div>
    <input id="zai-key" /><button id="btn-save-zai">Save</button><button id="btn-clear-zai">Clear</button>
  </div></div>
  <div id="anthropic-card" data-provider="anthropic"><div>
    <input id="anthropic-key" /><button id="btn-save-anthropic">Save</button><button id="btn-clear-anthropic">Clear</button>
  </div></div>
  <div id="custom-card" data-provider="custom"><div>
    <input id="custom-key" /><button id="btn-save-custom">Save</button><button id="btn-clear-custom">Clear</button>
  </div></div>
</body></html>`;

const mockStorage: Record<string, unknown> = {};

function setupChromeApi(): void {
  const storageMock = {
    local: {
      get: vi.fn(async (keys: string | string[]) => {
        if (typeof keys === 'string') {
          return { [keys]: mockStorage[keys] };
        }
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          result[key] = mockStorage[key];
        }
        return result;
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
      }),
    },
  };

  const runtimeMock = {
    getManifest: vi.fn(() => ({ version: '1.0.0-test' })),
  };

  Object.defineProperty(globalThis, 'chrome', {
    value: { storage: storageMock, runtime: runtimeMock },
    writable: true,
    configurable: true,
  });
}

function setupDom(): void {
  const parser = new DOMParser();
  const doc = parser.parseFromString(settingsHtml, 'text/html');
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  while (doc.body.firstChild) {
    document.body.appendChild(document.adoptNode(doc.body.firstChild));
  }
}

function flushTimers(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

async function loadSettingsModule(): Promise<void> {
  vi.resetModules();
  await import('./settings');
  await flushTimers();
  await flushTimers();
}

describe('settings page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    setupChromeApi();
    setupDom();
  });

  describe('init', () => {
    it('loads without errors', async () => {
      await expect(loadSettingsModule()).resolves.not.toThrow();
    });

    it('renders the global toast element', async () => {
      await loadSettingsModule();
      const toast = document.getElementById('global-toast');
      expect(toast).not.toBeNull();
      expect(toast!.classList.contains('hidden')).toBe(true);
    });

    it('does not render old per-tab status spans', async () => {
      await loadSettingsModule();
      expect(document.getElementById('settings-status')).toBeNull();
      expect(document.getElementById('templates-status')).toBeNull();
      expect(document.getElementById('keys-status')).toBeNull();
    });
  });

  describe('save settings button', () => {
    it('saves all settings to chrome.storage.local on click', async () => {
      await loadSettingsModule();

      const btn = document.getElementById('btn-save-settings') as HTMLButtonElement;
      btn.click();
      await flushTimers();
      await flushTimers();

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const saved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(saved).toBeDefined();
      expect(saved.llmProvider).toBe('openai');
    });

    it('shows toast after save', async () => {
      await loadSettingsModule();

      const btn = document.getElementById('btn-save-settings') as HTMLButtonElement;
      btn.click();
      await flushTimers();
      await flushTimers();

      const toast = document.getElementById('global-toast')!;
      expect(toast.classList.contains('visible')).toBe(true);
      expect(toast.textContent).toBe('✓ Saved');
    });
  });

  describe('custom model name', () => {
    it('saves customOverrideModel when typing in the field', async () => {
      await loadSettingsModule();

      const input = document.getElementById('custom-override-model') as HTMLInputElement;
      input.value = 'qwen3:1.7b';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise((r) => setTimeout(r, 350));
      await flushTimers();

      const saved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(saved).toBeDefined();
      expect(saved.customOverrideModel).toBe('qwen3:1.7b');
    });

    it('saves customOverrideModel on blur', async () => {
      await loadSettingsModule();

      const input = document.getElementById('custom-override-model') as HTMLInputElement;
      input.value = 'llama3';
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await flushTimers();
      await flushTimers();

      const saved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(saved).toBeDefined();
      expect(saved.customOverrideModel).toBe('llama3');
    });

    it('persists customOverrideModel through custom Save button', async () => {
      await loadSettingsModule();

      const modelInput = document.getElementById('custom-override-model') as HTMLInputElement;
      modelInput.value = 'mistral:7b';

      const btn = document.getElementById('btn-save-custom') as HTMLButtonElement;
      btn.click();
      await flushTimers();
      await flushTimers();

      const saved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(saved).toBeDefined();
      expect(saved.customOverrideModel).toBe('mistral:7b');
    });
  });

  describe('custom endpoint auto-save', () => {
    it('saves customEndpoint on input change', async () => {
      await loadSettingsModule();

      const input = document.getElementById('custom-endpoint') as HTMLInputElement;
      input.value = 'http://my-server:8080';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise((r) => setTimeout(r, 350));
      await flushTimers();

      const saved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(saved).toBeDefined();
      expect(saved.customEndpoint).toBe('http://my-server:8080');
    });
  });

  describe('custom Clear button', () => {
    it('resets all custom fields', async () => {
      await loadSettingsModule();

      const endpoint = document.getElementById('custom-endpoint') as HTMLInputElement;
      const model = document.getElementById('custom-override-model') as HTMLInputElement;
      const auth = document.getElementById('custom-use-auth') as HTMLInputElement;

      endpoint.value = 'http://custom:1234';
      model.value = 'test-model';
      auth.checked = true;

      const clearBtn = document.getElementById('btn-clear-custom') as HTMLButtonElement;
      clearBtn.click();
      await flushTimers();
      await flushTimers();

      expect(endpoint.value).toBe('http://localhost:11434');
      expect(model.value).toBe('');
      expect(auth.checked).toBe(false);
    });
  });

  describe('toast visibility', () => {
    it('toast is hidden by default', () => {
      const toast = document.getElementById('global-toast')!;
      expect(toast.classList.contains('hidden')).toBe(true);
      expect(toast.classList.contains('visible')).toBe(false);
    });
  });

  describe('saving guard', () => {
    it('second save works after first save completes', async () => {
      await loadSettingsModule();

      const btn = document.getElementById('btn-save-settings') as HTMLButtonElement;
      btn.click();
      await flushTimers();
      await flushTimers();

      const firstSaved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(firstSaved).toBeDefined();

      btn.click();
      await flushTimers();
      await flushTimers();

      const secondSaved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(secondSaved).toBeDefined();
    });
  });

  describe('provider model select auto-save', () => {
    it('saves when model dropdown changes', async () => {
      await loadSettingsModule();

      const select = document.getElementById('openai-model') as HTMLSelectElement;
      select.value = 'gpt-4.1';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      await new Promise((r) => setTimeout(r, 350));
      await flushTimers();

      const saved = mockStorage['apc_settings'] as Record<string, unknown>;
      expect(saved).toBeDefined();
      expect(saved.openaiModel).toBe('gpt-4.1');
    });
  });

  describe('placeholder text', () => {
    it('custom model input has a short placeholder that fits', () => {
      const input = document.getElementById('custom-override-model') as HTMLInputElement;
      expect(input.placeholder).toBe('e.g. llama3, qwen3:1.7b');
    });
  });
});
