/**
 * Input event handling for triggering text replacement after a rewrite.
 */

import { isTextControl } from '../editable';
import type { ApplyResult, SelectionSnapshot } from '../types';
import {
  ContentEditableAdapter,
  FrameworkEditableAdapter,
  TextControlAdapter,
  type EditableAdapter,
} from './adapters';

function createBeforeInputEvent(text: string): InputEvent {
  return new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    composed: true,
    inputType: 'insertReplacementText',
    data: text,
  });
}

function createInputEvent(text: string): InputEvent {
  return new InputEvent('input', {
    bubbles: true,
    composed: true,
    inputType: 'insertReplacementText',
    data: text,
  });
}

export class InputHandler {
  private readonly adapters: EditableAdapter[];
  private readonly fallbackAdapter: FrameworkEditableAdapter;

  constructor() {
    this.adapters = [new TextControlAdapter(), new ContentEditableAdapter()];
    this.fallbackAdapter = new FrameworkEditableAdapter();
  }

  apply(snapshot: SelectionSnapshot, replacement: string): ApplyResult {
    if (!snapshot.element.isConnected) {
      return { ok: false, message: 'Target field is no longer available. Reselect text and try again.' };
    }

    const element = snapshot.element;
    element.focus();

    if (!this.restoreSelection(snapshot)) {
      return { ok: false, message: 'Could not restore text selection. Reselect and try again.' };
    }

    const richEditor = snapshot.mode === 'contenteditable';

    if (!richEditor) {
      const beforeInput = createBeforeInputEvent(replacement);
      if (!element.dispatchEvent(beforeInput)) {
        return { ok: false, message: 'Editor prevented rewrite insertion.' };
      }
    }

    const adapter = this.adapters.find((item) => item.canHandle(element));
    let replaced = adapter?.replaceSelection(element, replacement) ?? false;

    if (!replaced && this.fallbackAdapter.canHandle(element)) {
      replaced = this.fallbackAdapter.replaceSelection(element, replacement);
    }

    if (!replaced) {
      return { ok: false, message: 'Unsupported editor implementation. Try selecting again.' };
    }

    if (!richEditor) {
      element.dispatchEvent(createInputEvent(replacement));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return { ok: true };
  }

  private restoreSelection(snapshot: SelectionSnapshot): boolean {
    if (snapshot.mode === 'text-control') {
      if (!isTextControl(snapshot.element)) return false;
      if (snapshot.start == null || snapshot.end == null) return false;
      snapshot.element.setSelectionRange(snapshot.start, snapshot.end);
      return true;
    }

    if (!snapshot.range) return false;

    const selection = window.getSelection();
    if (!selection) return false;

    try {
      selection.removeAllRanges();
      selection.addRange(snapshot.range.cloneRange());
      return true;
    } catch {
      return false;
    }
  }
}
