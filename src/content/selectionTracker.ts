// Copyright (c) Artem Iagovdik

import { extractStructuredText, findEditableFromNode, isContentEditableElement, isTextControl, rectToPlain } from './editable';
import type { EditableElement, SelectionSnapshot } from './types';

interface TrackerOptions {
  onSnapshotChange: (snapshot: SelectionSnapshot | null) => void;
  shouldIgnoreBlur?: (target: EventTarget | null) => boolean;
}

export class ActiveEditableTracker {
  private activeEditable: EditableElement | null = null;
  private snapshot: SelectionSnapshot | null = null;
  private onSnapshotChange: (snapshot: SelectionSnapshot | null) => void;
  private shouldIgnoreBlur: (target: EventTarget | null) => boolean;

  constructor(options: TrackerOptions) {
    this.onSnapshotChange = options.onSnapshotChange;
    this.shouldIgnoreBlur = options.shouldIgnoreBlur ?? (() => false);
  }

  start(): void {
    document.addEventListener('focusin', this.handleFocusIn, true);
    document.addEventListener('selectionchange', this.handleSelectionChange, true);
    document.addEventListener('mouseup', this.handleSelectionChange, true);
    document.addEventListener('keyup', this.handleSelectionChange, true);
    document.addEventListener('blur', this.handleBlur, true);
  }

  stop(): void {
    document.removeEventListener('focusin', this.handleFocusIn, true);
    document.removeEventListener('selectionchange', this.handleSelectionChange, true);
    document.removeEventListener('mouseup', this.handleSelectionChange, true);
    document.removeEventListener('keyup', this.handleSelectionChange, true);
    document.removeEventListener('blur', this.handleBlur, true);
  }

  getSnapshot(): SelectionSnapshot | null {
    return this.snapshot;
  }

  clearSnapshot(): void {
    this.setSnapshot(null);
  }

  private handleFocusIn = (event: FocusEvent): void => {
    this.activeEditable = findEditableFromNode(event.target as Node | null);
    this.capture();
  };

  private handleSelectionChange = (): void => {
    if (!this.activeEditable) {
      this.activeEditable = findEditableFromNode(document.activeElement);
    }
    this.capture();
  };

  private handleBlur = (event: FocusEvent): void => {
    if (this.shouldIgnoreBlur(event.relatedTarget)) {
      return;
    }

    const target = event.target as Element | null;
    if (target && this.activeEditable === target) {
      this.activeEditable = null;
      this.setSnapshot(null);
    }
  };

  private capture(): void {
    const editable = this.activeEditable ?? findEditableFromNode(document.activeElement);
    if (!editable || !editable.isConnected) {
      this.setSnapshot(null);
      return;
    }

    if (isTextControl(editable)) {
      const start = editable.selectionStart ?? 0;
      const end = editable.selectionEnd ?? 0;
      if (end <= start) {
        this.setSnapshot(null);
        return;
      }

      const text = editable.value.slice(start, end);
      if (!text.trim()) {
        this.setSnapshot(null);
        return;
      }

      const rect = editable.getBoundingClientRect();
      this.setSnapshot({
        element: editable,
        text,
        mode: 'text-control',
        start,
        end,
        rect: rectToPlain(rect),
        timestamp: Date.now(),
      });
      return;
    }

    if (isContentEditableElement(editable)) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        this.setSnapshot(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!editable.contains(range.commonAncestorContainer)) {
        this.setSnapshot(null);
        return;
      }

      const text = extractStructuredText(range);
      if (!text.trim()) {
        this.setSnapshot(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const fallbackRect = editable.getBoundingClientRect();
      this.setSnapshot({
        element: editable,
        text,
        mode: 'contenteditable',
        range: range.cloneRange(),
        rect: rect.width > 0 || rect.height > 0 ? rectToPlain(rect) : rectToPlain(fallbackRect),
        timestamp: Date.now(),
      });
      return;
    }

    this.setSnapshot(null);
  }

  private setSnapshot(snapshot: SelectionSnapshot | null): void {
    this.snapshot = snapshot;
    this.onSnapshotChange(snapshot);
  }
}
