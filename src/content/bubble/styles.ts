export const bubbleStyles = `
:host {
  all: initial;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.sento-root {
  --glass-bg: rgba(252, 254, 255, 0.12);
  --glass-bg-2: rgba(255, 255, 255, 0.22);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-border-soft: rgba(255, 255, 255, 0.34);
  --text: rgba(246, 248, 255, 0.98);
  --text-2: rgba(224, 229, 242, 0.86);
  --text-3: rgba(209, 216, 231, 0.74);
  --error: #ff7d7d;
  --error-bg: rgba(255, 96, 96, 0.12);
  --error-border: rgba(255, 130, 130, 0.36);
  --btn-bg: rgba(255, 255, 255, 0.86);
  --btn-text: #101218;
  --shadow: 0 8px 18px rgba(0, 8, 20, 0.14);
  --font: system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}

.sento-root[data-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.62);
  --glass-bg-2: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(143, 156, 181, 0.28);
  --glass-border-soft: rgba(143, 156, 181, 0.2);
  --text: rgba(16, 20, 30, 0.96);
  --text-2: rgba(39, 49, 68, 0.88);
  --text-3: rgba(60, 72, 94, 0.78);
  --error: #bf3434;
  --error-bg: rgba(196, 52, 52, 0.08);
  --error-border: rgba(196, 52, 52, 0.24);
  --btn-bg: rgba(25, 29, 38, 0.92);
  --btn-text: rgba(252, 253, 255, 0.96);
  --shadow: 0 6px 14px rgba(20, 28, 44, 0.1);
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
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(20px) saturate(150%);
}

.template-square {
  position: relative;
  height: 38px;
  border-radius: 9px;
  border: 0.5px solid var(--glass-border-soft);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
  color: var(--text);
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
  transition: transform 180ms var(--ease), box-shadow 180ms var(--ease), border-color 180ms var(--ease);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.46), 0 2px 6px rgba(2, 8, 18, 0.1);
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.template-square:hover:not(:disabled),
.template-square:focus-visible {
  transform: translateY(-0.5px);
  border-color: var(--glass-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 6px 10px rgba(4, 10, 22, 0.12);
}

.template-square:disabled {
  opacity: 0.52;
  cursor: progress;
}

.template-square.active {
  border-color: rgba(255, 255, 255, 0.5);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06));
  box-shadow:
    inset 0 1.5px 2px rgba(255, 255, 255, 0.22),
    inset 0 -2px 6px rgba(15, 22, 34, 0.24),
    0 0 0 0.5px rgba(255, 255, 255, 0.34);
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
  color: var(--text-3);
  backdrop-filter: blur(14px) saturate(145%);
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
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(14px) saturate(145%);
}

.preview:focus {
  border-color: var(--glass-border);
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
}

.btn-ghost:hover {
  border-color: var(--glass-border);
  color: var(--text);
}

.btn-apply {
  border: none;
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow: 0 8px 16px rgba(6, 8, 14, 0.25);
}

.btn-apply:hover {
  filter: brightness(0.95);
}

.hidden-select,
.hidden-trigger,
.close-btn {
  display: none !important;
}
`;
