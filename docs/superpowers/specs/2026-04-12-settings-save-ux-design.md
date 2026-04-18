# Settings Save UX Fix

Date: 2026-04-12

## Problem

Three bugs in the settings page:

1. **Custom model name not saved via Save button** — `btnSaveCustom` only saves the API key and endpoint URL. `customOverrideModel` and `customUseAuth` are excluded from the explicit save call.
2. **No visible save confirmation** — Auto-save flashes `refs.settingsStatus` which lives in the General tab. When the user is on AI Connections, the flash is invisible.
3. **Custom model placeholder truncated** — `.custom-model-input` is 110px wide. The placeholder "Model (e.g. qwen3:1.7b, llama3)" gets cut off.

## Solution

### 1. Global Fixed Toast

Replace the three per-tab status spans with a single fixed-position toast at bottom-center of the viewport.

- Add `<div id="global-toast" class="global-toast hidden"></div>` before `</body>`
- Remove `#settings-status`, `#templates-status`, `#keys-status` from HTML
- Remove corresponding refs from `settings.ts`
- Rewrite `flash()` to always target the global toast element
- All save operations (auto-save, button clicks) use the same toast

CSS: fixed position, bottom center, dark glass style, fade animation, z-index 9999.

### 2. Fix Custom Save Button

Update `btnSaveCustom` click handler to include all custom card fields:

```
customEndpoint, customOverrideModel, customUseAuth
```

### 3. Auto-Save Custom Endpoint

Add `refs.customEndpoint` to the `modelInputs` array in `wireModelInputs()` so it gets `input` (debounced) and `blur` event listeners for auto-save. The auth checkbox is already wired.

### 4. Widen Custom Model Input

- CSS: `.custom-model-input` width from `110px` to `160px`
- HTML: placeholder from `"Model (e.g. qwen3:1.7b, llama3)"` to `"e.g. llama3, qwen3:1.7b"`

## Files

| File | Change |
|------|--------|
| `src/settings/settings.html` | Add global toast, remove 3 status spans |
| `src/settings/settings.css` | Add `.global-toast` styles, widen `.custom-model-input` |
| `src/settings/settings.ts` | Rewrite `flash()`, fix `btnSaveCustom`, wire endpoint auto-save, drop stale refs |

## Out of Scope

- Redesigning the provider card layout
- Adding validation to endpoint URL
- Changing the auto-save debounce timing
