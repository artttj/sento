export const bubbleStyles = `
:host {
  all: initial;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.sento-root {
  --c-glass: #bbbbbc;
  --c-light: #fff;
  --c-dark: #000;
  --rl: 0.3;
  --rd: 2;
  --sat: 150%;
  --bg: rgba(12, 12, 16, 0.80);
  --bg-2: rgba(18, 18, 24, 0.86);
  --text:   rgba(238, 238, 238, 0.96);
  --text-2: rgba(196, 196, 196, 0.82);
  --text-3: rgba(160, 160, 160, 0.68);
  --error:        #ff7070;
  --error-bg:     rgba(255, 80, 80, 0.14);
  --error-border: rgba(255, 110, 110, 0.32);
  --font: system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif;
  --ease-glass: cubic-bezier(1, 0, 0.4, 1);
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}

.sento-root[data-theme="light"] {
  --bg: rgba(12, 12, 16, 0.74);
  --bg-2: rgba(18, 18, 24, 0.80);
  --rl: 0.5;
  --rd: 1.5;
  --sat: 180%;
}

.sento-bubble {
  position: fixed;
  width: min(340px, calc(100vw - 12px));
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

/* ── outer glass container (exact original recipe) ── */
.quick-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 3px;
  padding: 4px;
  border-radius: 22px;
  border: none;
  background: var(--bg);
  backdrop-filter: blur(24px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(24px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--rl) * 90%), transparent),
    inset -2px -2px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--rl) * 80%), transparent),
    inset -3px -8px 1px -6px color-mix(in srgb, var(--c-light) calc(var(--rl) * 60%), transparent),
    inset -0.3px -1px 4px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 12%), transparent),
    inset -1.5px 2.5px 0px -2px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 20%), transparent),
    inset 0px 3px 4px -2px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 20%), transparent),
    inset 2px -6.5px 1px -4px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 1px 5px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 6px 16px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 8%), transparent);
  transition:
    background-color 400ms var(--ease-glass),
    box-shadow 400ms var(--ease-glass);
}

/* ── sliding glass pill (exact original inner pill recipe) ── */
.grid-pill {
  position: absolute;
  top: 4px;
  left: 0;
  height: calc(100% - 8px);
  border-radius: 18px;
  background-color: color-mix(in srgb, var(--c-glass) 36%, transparent);
  pointer-events: none;
  z-index: 0;
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 10%), transparent),
    inset 2px 1px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 90%), transparent),
    inset -1.5px -1px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 80%), transparent),
    inset -2px -6px 1px -5px color-mix(in srgb, var(--c-light) calc(var(--rl) * 60%), transparent),
    inset -1px 2px 3px -1px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 20%), transparent),
    inset 0px -4px 1px -2px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 3px 6px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 8%), transparent);
  transition:
    transform 400ms var(--ease-glass),
    width 400ms var(--ease-glass),
    background-color 400ms var(--ease-glass),
    box-shadow 400ms var(--ease-glass);
}

.grid-pill.squish {
  animation: pill-squish 440ms ease;
}

@keyframes pill-squish {
  0%  { scale: 1 1; }
  40% { scale: 1.12 0.94; }
  70% { scale: 0.97 1.02; }
  100%{ scale: 1 1; }
}

/* ── template tiles ── */
.template-square {
  position: relative;
  z-index: 1;
  height: 34px;
  border-radius: 18px;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  padding: 0 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 160ms;
}

.template-square:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--c-light) 6%, transparent);
}

.template-square:hover:not(:disabled) .icon-wrap {
  scale: 1.15;
}

.template-square:disabled {
  opacity: 0.38;
  cursor: progress;
}

.template-square.loading {
  animation: tile-loading 1s linear infinite;
}

.icon-wrap {
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  flex-shrink: 0;
  transition: scale 200ms cubic-bezier(0.5, 0, 0, 1), color 160ms;
}

.template-square.active .icon-wrap {
  color: var(--text);
}

.icon-svg {
  width: 14px;
  height: 14px;
  display: block;
  fill: currentColor;
}

.tile-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-3);
  line-height: 1;
  pointer-events: none;
  white-space: nowrap;
  transition: color 160ms;
}

.template-square.active .tile-label {
  color: var(--text-2);
}

.template-square:hover:not(:disabled) .tile-label {
  color: var(--text-2);
}

.sr-only {
  position: absolute !important;
  width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

@keyframes tile-loading {
  0%  { filter: brightness(1); }
  50% { filter: brightness(1.15); }
  100%{ filter: brightness(1); }
}

.selection-meta {
  display: none;
}

/* ── status / error ── */
.status-msg {
  margin: 0;
  border-radius: 16px;
  padding: 7px 12px;
  font-size: 11px;
  line-height: 1.45;
  border: none;
  background: var(--bg);
  color: var(--text-3);
  backdrop-filter: blur(24px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(24px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--rl) * 60%), transparent),
    inset -0.3px -1px 3px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 4px 12px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent);
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

/* ── preview textarea ── */
.preview {
  width: 100%;
  min-height: 80px;
  max-height: 60vh;
  border-radius: 18px;
  border: none;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 12px;
  line-height: 1.5;
  padding: 10px 14px;
  resize: vertical;
  outline: none;
  backdrop-filter: blur(24px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(24px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--rl) * 60%), transparent),
    inset -1.5px -1.5px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 30%), transparent),
    inset -0.3px -1px 3px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 4px 12px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent);
}

.preview:focus {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 16%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--rl) * 80%), transparent),
    inset -1.5px -1.5px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 50%), transparent),
    inset -0.3px -1px 3px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 6px 16px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 12%), transparent);
}

/* ── action buttons ── */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-ghost,
.btn-apply {
  border-radius: 14px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms var(--ease-glass);
}

.btn-ghost {
  border: none;
  background: var(--bg);
  color: var(--text-2);
  backdrop-filter: blur(24px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(24px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 10%), transparent),
    inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--rl) * 60%), transparent),
    inset -0.3px -1px 3px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 3px 8px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 8%), transparent);
}

.btn-ghost:hover {
  color: var(--text);
  background: var(--bg-2);
}

.btn-apply {
  border: none;
  background: var(--bg-2);
  color: var(--text);
  backdrop-filter: blur(24px) saturate(var(--sat));
  -webkit-backdrop-filter: blur(24px) saturate(var(--sat));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 10%), transparent),
    inset 2px 1px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 90%), transparent),
    inset -1.5px -1px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--rl) * 80%), transparent),
    inset -2px -6px 1px -5px color-mix(in srgb, var(--c-light) calc(var(--rl) * 60%), transparent),
    inset -1px 2px 3px -1px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 20%), transparent),
    inset 0px -4px 1px -2px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 10%), transparent),
    0px 3px 6px 0px color-mix(in srgb, var(--c-dark) calc(var(--rd) * 8%), transparent);
}

.btn-apply:hover {
  background: rgba(24, 24, 32, 0.92);
}

.hidden-select,
.hidden-trigger,
.close-btn {
  display: none !important;
}
`;
