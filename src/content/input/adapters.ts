import { isContentEditableElement, isTextControl } from '../editable';

export interface EditableAdapter {
  canHandle(el: Element): boolean;
  readSelection(el: Element): string;
  replaceSelection(el: Element, replacement: string): boolean;
}

function isSelectionInside(el: HTMLElement, selection: Selection | null): boolean {
  if (!selection || selection.rangeCount === 0) return false;
  return el.contains(selection.getRangeAt(0).commonAncestorContainer);
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  if (descriptor?.set) {
    descriptor.set.call(el, value);
    return;
  }
  el.value = value;
}

export class TextControlAdapter implements EditableAdapter {
  canHandle(el: Element): boolean {
    return isTextControl(el);
  }

  readSelection(el: Element): string {
    if (!isTextControl(el)) return '';
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    return end > start ? el.value.slice(start, end) : '';
  }

  replaceSelection(el: Element, replacement: string): boolean {
    if (!isTextControl(el)) return false;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start == null || end == null || end < start) return false;

    const next = el.value.slice(0, start) + replacement + el.value.slice(end);
    setNativeValue(el, next);

    const caret = start + replacement.length;
    el.setSelectionRange(caret, caret);
    return true;
  }
}

export class ContentEditableAdapter implements EditableAdapter {
  canHandle(el: Element): boolean {
    return isContentEditableElement(el);
  }

  readSelection(el: Element): string {
    if (!isContentEditableElement(el)) return '';
    const selection = window.getSelection();
    if (!isSelectionInside(el, selection)) return '';
    return selection?.toString() ?? '';
  }

  replaceSelection(el: Element, replacement: string): boolean {
    if (!isContentEditableElement(el)) return false;

    const selection = window.getSelection();
    if (!isSelectionInside(el, selection)) return false;
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(replacement);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }
}

export class FrameworkEditableAdapter implements EditableAdapter {
  canHandle(el: Element): boolean {
    return isContentEditableElement(el);
  }

  readSelection(el: Element): string {
    if (!isContentEditableElement(el)) return '';
    return window.getSelection()?.toString() ?? '';
  }

  replaceSelection(el: Element, replacement: string): boolean {
    if (!isContentEditableElement(el)) return false;
    el.focus();
    try {
      return document.execCommand('insertText', false, replacement);
    } catch {
      return false;
    }
  }
}
