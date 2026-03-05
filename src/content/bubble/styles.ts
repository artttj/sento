export const bubbleStyles = `
:host {
  all: initial;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.sento-root {
  --glass-c: #bbbbbc;
  --glass-l: #fff;
  --glass-d: #000;
  --rl: 0.3;
  --rd: 2;
  --sat: 150%;
  --text:   rgba(238, 238, 238, 0.96);
  --text-2: rgba(196, 196, 196, 0.82);
  --text-3: rgba(160, 160, 160, 0.68);
  --error:        #ff7070;
  --error-bg:     rgba(255, 80, 80, 0.14);
  --error-border: rgba(255, 110, 110, 0.32);
  --btn-bg:   rgba(255, 255, 255, 0.94);
  --btn-text: #0d0d0d;
  --font: system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}

.sento-root[data-theme="light"] {
  --rl: 1;
  --rd: 1;
  --sat: 180%;
}

.sento-bubble {
  position: fixed;
  width: min(228px, calc(100vw - 12px));
  color: var(--text);
  font-family: var(--font);
  z-index: 2147483647;
  display: grid;
  gap: 4px;
  pointer-events: auto;
}

.hidden {
  display: none !important;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 6px;
  border-radius: 99em;
  border: none;
  background-color: color-mix(in srgb, var(--glass-c) 12%, transparent);
  backdrop-filter: blur(12px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(12px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 90%), transparent),
    inset -2px -2px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 80%), transparent),
    inset -3px -8px 1px -6px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 60%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent),
    inset -1.5px 2.5px 0px -2px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 20%), transparent),
    inset 0px 3px 4px -2px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 20%), transparent),
    inset 2px -6.5px 1px -4px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent),
    0px 1px 5px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent),
    0px 6px 16px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 8%), transparent);
  transition:
    background-color 400ms cubic-bezier(1, 0, 0.4, 1),
    box-shadow 400ms cubic-bezier(1, 0, 0.4, 1);
}

.template-square {
  position: relative;
  height: 46px;
  border-radius: 99em;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  padding: 0 0 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 180ms var(--ease);
}

.template-square:hover:not(:disabled),
.template-square:focus-visible {
  background-color: color-mix(in srgb, var(--glass-c) 18%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 8%), transparent),
    inset 1px 2px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 50%), transparent),
    inset -1px -1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 40%), transparent);
}

.template-square:hover:not(:disabled) .theme-icon {
  scale: 1.15;
}

.template-square:disabled {
  opacity: 0.38;
  cursor: progress;
}

.template-square.active {
  background-color: color-mix(in srgb, var(--glass-c) 36%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 10%), transparent),
    inset 2px 1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 90%), transparent),
    inset -1.5px -1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 80%), transparent),
    inset -2px -6px 1px -5px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 60%), transparent),
    inset -1px 2px 3px -1px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 20%), transparent),
    inset 0px -4px 1px -2px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent),
    0px 3px 6px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 8%), transparent);
  animation: tile-select 440ms ease;
}

.template-square.loading {
  animation: tile-loading 1s linear infinite;
}

@keyframes tile-select {
  0% { scale: 1 1; }
  50% { scale: 1.06 1; }
  100% { scale: 1 1; }
}

.icon-wrap {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  transition: scale 200ms cubic-bezier(0.5, 0, 0, 1);
}

.template-square.active .icon-wrap {
  color: var(--text);
}

.icon-svg {
  width: 16px;
  height: 16px;
  display: block;
  fill: currentColor;
}

.tile-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--text-3);
  line-height: 1;
  pointer-events: none;
  transition: color 180ms var(--ease);
}

.template-square:hover:not(:disabled) .tile-label,
.template-square.active .tile-label {
  color: var(--text-2);
}

.sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes tile-loading {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
  100% { filter: brightness(1); }
}

.selection-meta {
  display: none;
}

.status-msg {
  margin: 0;
  border-radius: 99em;
  padding: 7px 12px;
  font-size: 11px;
  line-height: 1.45;
  border: none;
  background-color: color-mix(in srgb, var(--glass-c) 12%, transparent);
  color: var(--text-3);
  backdrop-filter: blur(12px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(12px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 60%), transparent),
    inset -2px -2px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 50%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent),
    0px 4px 12px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent);
}

.status-msg.error {
  background: var(--error-bg);
  border: 0.5px solid var(--error-border);
  color: var(--error);
  box-shadow: 0px 4px 12px 0px rgba(255, 80, 80, 0.12);
}

.status-msg button {
  margin-left: 8px;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  font-size: 11px;
}

.preview {
  width: 100%;
  min-height: 92px;
  max-height: 280px;
  border-radius: 21px;
  border: none;
  background-color: color-mix(in srgb, var(--glass-c) 12%, transparent);
  color: var(--text);
  font-family: var(--font);
  font-size: 12px;
  line-height: 1.45;
  padding: 10px 14px;
  resize: vertical;
  outline: none;
  backdrop-filter: blur(12px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(12px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 60%), transparent),
    inset -2px -2px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 50%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent),
    0px 4px 12px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent);
}

.preview:focus {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 18%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 80%), transparent),
    inset -2px -2px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 70%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent),
    0px 6px 16px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-ghost,
.btn-apply {
  border-radius: 99em;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms cubic-bezier(1, 0, 0.4, 1);
}

.btn-ghost {
  border: none;
  background-color: color-mix(in srgb, var(--glass-c) 12%, transparent);
  color: var(--text-2);
  backdrop-filter: blur(12px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(12px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 60%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent),
    0px 3px 8px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 8%), transparent);
}

.btn-ghost:hover {
  color: var(--text);
  background-color: color-mix(in srgb, var(--glass-c) 22%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 16%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 80%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 12%), transparent),
    0px 4px 12px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent);
}

.btn-apply {
  border: none;
  background-color: color-mix(in srgb, var(--glass-c) 36%, transparent);
  color: var(--text);
  backdrop-filter: blur(12px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(12px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 10%), transparent),
    inset 2px 1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 90%), transparent),
    inset -1.5px -1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 80%), transparent),
    inset -2px -6px 1px -5px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 60%), transparent),
    inset -1px 2px 3px -1px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 20%), transparent),
    inset 0px -4px 1px -2px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent),
    0px 3px 6px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 8%), transparent);
}

.btn-apply:hover {
  background-color: color-mix(in srgb, var(--glass-c) 48%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 14%), transparent),
    inset 2px 1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 95%), transparent),
    inset -1.5px -1px 0px -1px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 85%), transparent),
    inset -2px -6px 1px -5px color-mix(in srgb, var(--glass-l) calc(var(--rl) * 65%), transparent),
    inset -1px 2px 3px -1px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 20%), transparent),
    inset 0px -4px 1px -2px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent),
    0px 4px 10px 0px color-mix(in srgb, var(--glass-d) calc(var(--rd) * 10%), transparent);
}

.hidden-select,
.hidden-trigger,
.close-btn {
  display: none !important;
}
`;
