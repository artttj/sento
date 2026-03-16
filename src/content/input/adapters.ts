// Copyright (c) Artem Iagovdik

import { extractStructuredText, isContentEditableElement, isTextControl } from '../editable';

export interface EditableAdapter {
  canHandle(el: Element): boolean;
  readSelection(el: Element): string;
  replaceSelection(el: Element, replacement: string): boolean;
}

function textToRichHtml(text: string): string {
  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);

    if (bulletMatch) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const content = bulletMatch[1]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      htmlParts.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      if (!trimmed) {
        htmlParts.push('<p></p>');
      } else {
        const content = trimmed
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        htmlParts.push(`<p>${content}</p>`);
      }
    }
  }

  if (inList) htmlParts.push('</ul>');
  return htmlParts.join('');
}

function simulatePaste(el: Element, text: string, html: string): boolean {
  const dt = new DataTransfer();
  dt.setData('text/plain', text);
  dt.setData('text/html', html);

  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    composed: true,
    clipboardData: dt,
  });

  const cancelled = !el.dispatchEvent(pasteEvent);
  return cancelled;
}

function isSelectionInside(el: HTMLElement, selection: Selection | null): boolean {
  if (!selection || selection.rangeCount === 0) return false;
  return el.contains(selection.getRangeAt(0).commonAncestorContainer);
}

function setNativeValue(el: HTMLTextAreaElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
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
    if (!isSelectionInside(el, selection) || !selection || selection.rangeCount === 0) return '';
    return extractStructuredText(selection.getRangeAt(0));
  }

  replaceSelection(el: Element, replacement: string): boolean {
    if (!isContentEditableElement(el)) return false;

    const selection = window.getSelection();
    if (!isSelectionInside(el, selection)) return false;
    if (!selection || selection.rangeCount === 0) return false;

    const html = textToRichHtml(replacement);
    return simulatePaste(el, replacement, html);
  }
}

export class FrameworkEditableAdapter implements EditableAdapter {
  canHandle(el: Element): boolean {
    return isContentEditableElement(el);
  }

  readSelection(el: Element): string {
    if (!isContentEditableElement(el)) return '';
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    return extractStructuredText(selection.getRangeAt(0));
  }

  replaceSelection(el: Element, replacement: string): boolean {
    if (!isContentEditableElement(el)) return false;
    el.focus();
    const html = textToRichHtml(replacement);
    return simulatePaste(el, replacement, html);
  }
}
