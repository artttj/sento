// Copyright (c) Artem Iagovdik

export type EditableElement = HTMLTextAreaElement | HTMLElement;

export interface SelectionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface SelectionSnapshot {
  element: EditableElement;
  text: string;
  rect: SelectionRect;
  mode: 'text-control' | 'contenteditable';
  start?: number;
  end?: number;
  range?: Range;
  timestamp: number;
}

export interface ApplyResult {
  ok: boolean;
  message?: string;
}
