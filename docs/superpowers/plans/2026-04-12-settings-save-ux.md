# Settings Save UX Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three bugs: invisible save confirmations, custom model name not persisting via Save button, and truncated placeholder text.

**Architecture:** Replace three per-tab status spans with a single fixed-position toast. Fix the custom card Save handler to include all fields. Wire the custom endpoint input for auto-save. Widen the custom model input.

**Tech Stack:** TypeScript, CSS, HTML (Chrome extension settings page)

---

### Task 1: Add Global Toast to HTML

**Files:**
- Modify: `src/settings/settings.html:149-152` (remove settings-status span)
- Modify: `src/settings/settings.html:173-176` (remove templates-status span)
- Modify: `src/settings/settings.html:399` (remove keys-status span)
- Modify: `src/settings/settings.html:537` (add toast before script tag)

- [ ] **Step 1: Remove the three per-tab status spans**

In `src/settings/settings.html`, remove these three elements:

Line 151 — remove:
```html
          <span id="settings-status" class="saved-msg hidden">✓ Saved</span>
```

Line 175 — remove:
```html
          <span id="templates-status" class="saved-msg hidden">✓ Saved</span>
```

Line 399 — remove:
```html
        <span id="keys-status" class="saved-msg hidden">✓ Saved</span>
```

- [ ] **Step 2: Add global toast element**

In `src/settings/settings.html`, add the toast div right before the `<script>` tag (currently line 537):

```html
  <div id="global-toast" class="global-toast hidden"></div>

  <script type="module" src="settings.js"></script>
```

- [ ] **Step 3: Fix custom model placeholder**

In `src/settings/settings.html`, change the `custom-override-model` input placeholder (line 373):

From:
```html
                <input id="custom-override-model" type="text" class="custom-model-input" placeholder="Model (e.g. qwen3:1.7b, llama3)" />
```

To:
```html
                <input id="custom-override-model" type="text" class="custom-model-input" placeholder="e.g. llama3, qwen3:1.7b" />
```

- [ ] **Step 4: Commit**

```bash
git add src/settings/settings.html
git commit -m "fix: replace per-tab status spans with global toast element"
```

---

### Task 2: Add Toast CSS Styles

**Files:**
- Modify: `src/settings/settings.css` (end of file — add toast styles)
- Modify: `src/settings/settings.css:1683-1684` (widen custom-model-input)

- [ ] **Step 1: Widen `.custom-model-input`**

In `src/settings/settings.css`, change line 1684:

From:
```css
  width: 110px;
```

To:
```css
  width: 160px;
```

- [ ] **Step 2: Add `.global-toast` styles at end of file**

Append to `src/settings/settings.css`:

```css

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL TOAST
═══════════════════════════════════════════════════════════════════════════ */
.global-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  padding: 8px 20px;
  background: var(--c-elevated);
  border: 1px solid var(--c-border-hi);
  border-radius: var(--r-lg);
  color: var(--c-success);
  font-size: 13px;
  font-weight: 500;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  box-shadow: var(--shadow-md);
  transition: opacity 180ms var(--ease), transform 180ms var(--ease);
}

.global-toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/settings/settings.css
git commit -m "fix: add global toast styles and widen custom model input"
```

---

### Task 3: Rewire TypeScript — Toast, Save Button, Auto-Save

**Files:**
- Modify: `src/settings/settings.ts:28-100` (refs object — remove stale refs, add toast ref)
- Modify: `src/settings/settings.ts:102-106` (rewrite `flash()`)
- Modify: `src/settings/settings.ts:444-447` (update `wireSettingsButtons` to use `flash` without status element)
- Modify: `src/settings/settings.ts:449-489` (update `wireModelInputs` — add customEndpoint, use `flash` without status element)
- Modify: `src/settings/settings.ts:520-538` (fix `btnSaveCustom` and `btnClearCustom`)

- [ ] **Step 1: Update refs — remove stale, add toast**

In `src/settings/settings.ts`, remove these three lines from the `refs` object:

```typescript
  settingsStatus: document.getElementById('settings-status') as HTMLElement,
```

```typescript
  templatesStatus: document.getElementById('templates-status') as HTMLElement,
```

```typescript
  keysStatus: document.getElementById('keys-status') as HTMLElement,
```

Add this new ref (after `navAiWarning` line):

```typescript
  globalToast: document.getElementById('global-toast') as HTMLElement,
```

- [ ] **Step 2: Rewrite `flash()` to target the global toast**

Replace the existing `flash` function (lines 102-106):

From:
```typescript
function flash(el: HTMLElement, text = 'Saved'): void {
  el.textContent = text;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 1800);
}
```

To:
```typescript
let flashTimer: ReturnType<typeof setTimeout> | null = null;

function flash(text = '✓ Saved'): void {
  const el = refs.globalToast;
  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.add('visible');
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('hidden'), 200);
  }, 1800);
}
```

- [ ] **Step 3: Update `saveAllSettings` — call `flash()` without element parameter**

In `saveAllSettings` (line 400), change the signature and the flash call.

From:
```typescript
async function saveAllSettings(statusEl: HTMLElement): Promise<void> {
```

To:
```typescript
async function saveAllSettings(): Promise<void> {
```

And at the end of the function (line 441), change:

From:
```typescript
  flash(statusEl, '✓ Saved');
```

To:
```typescript
  flash('✓ Saved');
```

- [ ] **Step 4: Update all callers of `saveAllSettings` — drop the status element argument**

In `wireSettingsButtons` (lines 444-447):

From:
```typescript
  refs.btnSaveSettings.addEventListener('click', async () => { await saveAllSettings(refs.settingsStatus); });
  refs.btnSaveTemplates.addEventListener('click', async () => { await saveAllSettings(refs.templatesStatus); });
```

To:
```typescript
  refs.btnSaveSettings.addEventListener('click', async () => { await saveAllSettings(); });
  refs.btnSaveTemplates.addEventListener('click', async () => { await saveAllSettings(); });
```

In `wireModelInputs` (line 466):

From:
```typescript
  const debouncedSave = debounce(() => saveAllSettings(refs.settingsStatus), 300);
```

To:
```typescript
  const debouncedSave = debounce(() => saveAllSettings(), 300);
```

In `wireModelInputs`, the `blur` handler (line 478):

From:
```typescript
      input.addEventListener('blur', () => {
        saveAllSettings(refs.settingsStatus);
      });
```

To:
```typescript
      input.addEventListener('blur', () => {
        saveAllSettings();
      });
```

In the provider segmented `wireSegmented` callback (line 590):

From:
```typescript
  wireSegmented(refs.providerSegmented, () => {
    saveAllSettings(refs.settingsStatus);
  });
```

To:
```typescript
  wireSegmented(refs.providerSegmented, () => {
    saveAllSettings();
  });
```

- [ ] **Step 5: Add `customEndpoint` to `wireModelInputs` auto-save inputs**

In `wireModelInputs`, add `refs.customEndpoint` to the `modelInputs` array (after `refs.customOverrideModel` on line 463):

From:
```typescript
    refs.customOverrideModel,
  ];
```

To:
```typescript
    refs.customOverrideModel,
    refs.customEndpoint,
  ];
```

- [ ] **Step 6: Fix `btnSaveCustom` to save all custom card fields**

Replace the `btnSaveCustom` click handler (lines 520-527):

From:
```typescript
  refs.btnSaveCustom.addEventListener('click', async () => {
    await saveCustomKey(refs.customKey.value);
    await saveProviderSettings({
      customEndpoint: refs.customEndpoint.value,
    });
    await refreshBadges();
    flash(refs.keysStatus, '✓ Custom endpoint saved');
  });
```

To:
```typescript
  refs.btnSaveCustom.addEventListener('click', async () => {
    await saveCustomKey(refs.customKey.value);
    await saveProviderSettings({
      customEndpoint: refs.customEndpoint.value,
      customOverrideModel: refs.customOverrideModel.value.trim() || undefined,
      customUseAuth: refs.customUseAuth.checked,
    });
    await refreshBadges();
    flash('✓ Custom endpoint saved');
  });
```

- [ ] **Step 7: Fix `btnClearCustom` flash call**

Replace the `btnClearCustom` click handler (lines 529-538):

From:
```typescript
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
```

To:
```typescript
  refs.btnClearCustom.addEventListener('click', async () => {
    refs.customKey.value = '';
    refs.customEndpoint.value = DEFAULT_SETTINGS.customEndpoint;
    refs.customOverrideModel.value = '';
    refs.customUseAuth.checked = false;
    await saveCustomKey('');
    await saveProviderSettings({
      customEndpoint: DEFAULT_SETTINGS.customEndpoint,
      customOverrideModel: undefined,
      customUseAuth: false,
    });
    await refreshBadges();
    flash('✓ Custom endpoint cleared');
  });
```

- [ ] **Step 8: Fix all remaining `flash(refs.keysStatus, ...)` calls in `wireKeyButton`**

In `wireKeyButton` function (lines 498-509), change:

From:
```typescript
    flash(refs.keysStatus, `✓ ${providerName} key saved`);
```

To:
```typescript
    flash(`✓ ${providerName} key saved`);
```

And:

From:
```typescript
    flash(refs.keysStatus, `✓ ${providerName} key cleared`);
```

To:
```typescript
    flash(`✓ ${providerName} key cleared`);
```

- [ ] **Step 9: Build and verify**

```bash
npm run build
```

Expected: no TypeScript errors, clean build.

- [ ] **Step 10: Commit**

```bash
git add src/settings/settings.ts
git commit -m "fix: global toast, custom save button, and endpoint auto-save"
```

---

### Task 4: Manual Smoke Test Checklist

- [ ] **Step 1: Load extension and open settings**

Load the extension from `dist/` folder. Open the settings page.

- [ ] **Step 2: Verify toast on General tab**

Change any setting (toggle pill labels, switch language). Confirm the toast appears at bottom-center with "✓ Saved" text, then fades out.

- [ ] **Step 3: Verify toast on AI Connections tab**

Switch to AI Connections. Change the provider segmented control. Confirm the toast appears at bottom-center.

- [ ] **Step 4: Verify custom model saves**

In the Custom card, type a model name (e.g. `qwen3:1.7b`). Confirm the toast shows "✓ Saved" after debounce. Click Save button. Confirm "✓ Custom endpoint saved" toast. Reload the settings page. Confirm the model name persists.

- [ ] **Step 5: Verify custom endpoint auto-saves**

Change the custom endpoint URL. Confirm the toast appears after debounce. Reload. Confirm it persists.

- [ ] **Step 6: Verify placeholder fits**

Check the custom model input placeholder reads "e.g. llama3, qwen3:1.7b" and is fully visible without truncation.

- [ ] **Step 7: Verify Clear resets all custom fields**

Click Clear on the Custom card. Confirm endpoint resets to `http://localhost:11434`, model clears, auth checkbox unchecks.
