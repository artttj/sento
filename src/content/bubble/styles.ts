export const bubbleStyles = `
:host {
  all: initial;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.sento-root {
  --glass-bg:          rgba(10, 11, 22, 0.82);
  --glass-bg-2:        rgba(16, 18, 34, 0.90);
  --glass-tile:        rgba(255, 255, 255, 0.07);
  --glass-tile-2:      rgba(255, 255, 255, 0.13);
  --glass-border:      rgba(255, 255, 255, 0.22);
  --glass-border-soft: rgba(255, 255, 255, 0.12);
  --text:   rgba(240, 244, 255, 0.96);
  --text-2: rgba(190, 198, 225, 0.82);
  --text-3: rgba(150, 160, 195, 0.68);
  --error:        #ff7070;
  --error-bg:     rgba(255, 80, 80, 0.14);
  --error-border: rgba(255, 110, 110, 0.32);
  --btn-bg:   rgba(255, 255, 255, 0.94);
  --btn-text: #0a0b18;
  --shadow: 0 12px 32px rgba(0, 0, 10, 0.62), 0 2px 8px rgba(0, 0, 10, 0.40);
  --font: system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}

.sento-root[data-theme="light"] {
  --glass-bg:          rgba(10, 11, 22, 0.76);
  --glass-bg-2:        rgba(16, 18, 34, 0.86);
  --glass-tile:        rgba(255, 255, 255, 0.09);
  --glass-tile-2:      rgba(255, 255, 255, 0.16);
  --glass-border:      rgba(255, 255, 255, 0.24);
  --glass-border-soft: rgba(255, 255, 255, 0.14);
  --text:   rgba(240, 244, 255, 0.96);
  --text-2: rgba(190, 198, 225, 0.82);
  --text-3: rgba(150, 160, 195, 0.68);
  --error:        #ff7070;
  --error-bg:     rgba(255, 80, 80, 0.14);
  --error-border: rgba(255, 110, 110, 0.32);
  --btn-bg:   rgba(255, 255, 255, 0.94);
  --btn-text: #0a0b18;
  --shadow: 0 12px 32px rgba(0, 0, 10, 0.52), 0 2px 8px rgba(0, 0, 10, 0.32);
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
  padding: 4px;
  border-radius: 12px;
  background: linear-gradient(148deg, var(--glass-bg-2), var(--glass-bg));
  border: 0.5px solid var(--glass-border-soft);
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
}

.template-square {
  position: relative;
  height: 38px;
  border-radius: 9px;
  border: 0.5px solid var(--glass-border-soft);
  background: linear-gradient(165deg, var(--glass-tile-2), var(--glass-tile));
  color: var(--text);
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
  transition: transform 180ms var(--ease), box-shadow 180ms var(--ease), border-color 180ms var(--ease), background 180ms var(--ease);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 2px 8px rgba(0, 0, 12, 0.40);
  animation: tile-float 5.6s var(--ease) infinite;
}

.template-square:nth-child(2) {
  animation-delay: 160ms;
}

.template-square:nth-child(3) {
  animation-delay: 320ms;
}

.template-square:nth-child(4) {
  animation-delay: 480ms;
}

.template-square::before {
  content: '';
  position: absolute;
  left: 3px;
  right: 3px;
  top: 3px;
  height: 44%;
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.template-square:hover:not(:disabled),
.template-square:focus-visible {
  transform: translateY(-1px);
  border-color: var(--glass-border);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0.09));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 8px 16px rgba(0, 0, 12, 0.56);
}

.template-square:disabled {
  opacity: 0.38;
  cursor: progress;
}

.template-square.active {
  border-color: rgba(255, 255, 255, 0.30);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 16, 0.40));
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 20, 0.52),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 0 0 0.5px rgba(255, 255, 255, 0.16);
}

.template-square.loading {
  animation: tile-loading 1s linear infinite;
}

.icon-wrap {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
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

@keyframes tile-float {
  0%, 100% { transform: translateY(0); }
  35% { transform: translateY(-1.5px); }
  70% { transform: translateY(1px); }
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
  border-radius: 11px;
  padding: 7px 9px;
  font-size: 11px;
  line-height: 1.45;
  background: linear-gradient(160deg, var(--glass-bg-2), var(--glass-bg));
  border: 0.5px solid var(--glass-border-soft);
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  color: var(--text-3);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
}

.status-msg.error {
  background: var(--error-bg);
  border-color: var(--error-border);
  color: var(--error);
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
  border-radius: 13px;
  border: 0.5px solid var(--glass-border-soft);
  background: linear-gradient(168deg, var(--glass-bg-2), var(--glass-bg));
  color: var(--text);
  font-family: var(--font);
  font-size: 12px;
  line-height: 1.45;
  padding: 10px;
  resize: vertical;
  outline: none;
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
}

.preview:focus {
  border-color: var(--glass-border);
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.10);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-ghost,
.btn-apply {
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.btn-ghost {
  border: 0.5px solid var(--glass-border-soft);
  background: linear-gradient(160deg, var(--glass-bg-2), var(--glass-bg));
  color: var(--text-2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 6px rgba(0, 0, 12, 0.40);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.btn-ghost:hover {
  border-color: var(--glass-border);
  color: var(--text);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
}

.btn-apply {
  border: none;
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow:
    0 8px 20px rgba(0, 0, 12, 0.52),
    inset 0 1px 0 rgba(255, 255, 255, 0.60);
}

.btn-apply:hover {
  filter: brightness(0.96);
  box-shadow:
    0 10px 24px rgba(0, 0, 12, 0.60),
    inset 0 1px 0 rgba(255, 255, 255, 0.60);
}

.hidden-select,
.hidden-trigger,
.close-btn {
  display: none !important;
}
`;
