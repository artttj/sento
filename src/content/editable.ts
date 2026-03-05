/**
 * Editable element detection and structured text extraction.
 */

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

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'TR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER',
  'DT', 'DD', 'FIGCAPTION',
]);

const LIST_CONTAINER_TAGS = new Set(['UL', 'OL']);

function isInsideListItem(node: Node): boolean {
  let parent = node.parentElement;
  while (parent) {
    if (parent.tagName === 'LI') return true;
    parent = parent.parentElement;
  }
  return false;
}

function walkNode(node: Node, parts: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (text) parts.push(text);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName;

  if (tag === 'BR') {
    parts.push('\n');
    return;
  }

  if (LIST_CONTAINER_TAGS.has(tag)) {
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      if (last && !last.endsWith('\n')) parts.push('\n');
    }
    for (const child of el.childNodes) {
      walkNode(child, parts);
    }
    return;
  }

  const isListItem = tag === 'LI';
  const isBlock = BLOCK_TAGS.has(tag);
  const skipBlockNewline = isBlock && !isListItem && isInsideListItem(el);

  if (isBlock && !skipBlockNewline && parts.length > 0) {
    const last = parts[parts.length - 1];
    if (last && !last.endsWith('\n')) parts.push('\n');
  }

  if (isListItem) {
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      if (last && !last.endsWith('\n')) parts.push('\n');
    }
    parts.push('- ');
  }

  for (const child of el.childNodes) {
    walkNode(child, parts);
  }

  if (isBlock && !skipBlockNewline && !isListItem) {
    const last = parts[parts.length - 1];
    if (last && !last.endsWith('\n')) parts.push('\n');
  }
}

export function extractStructuredText(range: Range): string {
  const fragment = range.cloneContents();
  const parts: string[] = [];
  for (const child of fragment.childNodes) {
    walkNode(child, parts);
  }
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
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
