import type { EditableElement } from './types';

const INPUT_TYPES = new Set(['text', 'search', 'url', 'email', 'tel']);

export function isTextControl(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return INPUT_TYPES.has(el.type || 'text');
  }
  return false;
}

export function isContentEditableElement(el: Element): el is HTMLElement {
  return el instanceof HTMLElement && el.isContentEditable;
}

export function isSupportedEditable(el: Element): el is EditableElement {
  return isTextControl(el) || isContentEditableElement(el);
}

export function findEditableFromNode(node: Node | null): EditableElement | null {
  if (!node) return null;

  if (node instanceof Element) {
    if (isSupportedEditable(node)) return node;
    const closest = node.closest('textarea,input,[contenteditable="true"],[contenteditable=""]');
    return closest && isSupportedEditable(closest) ? closest : null;
  }

  if (node.parentElement) {
    return findEditableFromNode(node.parentElement);
  }

  return null;
}

export function rectToPlain(rect: DOMRect): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}
