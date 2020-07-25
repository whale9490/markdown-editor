import * as CodeMirror from "codemirror";
import { Position, Token } from "codemirror";
import { Span } from "./object";

// TODO 同じ行に限定しているが・・・できれば行を跨ったのも検出したい。
export function getSpanOfSameTypeTokens(cm: CodeMirror.EditorFromTextArea, pos: Position, type: string): Span | null {
  const tokens = cm.getLineTokens(pos.line);
  if (tokens.length <= 0) return null;

  const anchorIndex = findTokenIndexOfChPosition(tokens, pos.ch);
  if (anchorIndex === null || !hasTypeAt(cm, pos, type)) return null;

  const findStartIndex = (tokens: Token[], anchorIndex: number): number => {
    for (let i = anchorIndex; i >= 0; i--) {
      if (!hasType(tokens[i], type)) return i + 1;
    }
    return 0;
  };

  const findEndIndex = (tokens: Token[], anchorIndex: number): number => {
    for (let i = anchorIndex; i < tokens.length; i++) {
      if (!hasType(tokens[i], type)) return i - 1;
    }
    return tokens.length - 1;
  };

  const startIndex = findStartIndex(tokens, anchorIndex);
  const endIndex = findEndIndex(tokens, anchorIndex);

  return Span.create({ line: pos.line, ch: tokens[startIndex].start }, { line: pos.line, ch: tokens[endIndex].end });
}

// TODO 同じ行に限定しているが・・・できれば行を跨ったのも検出したい。ただ、行を跨って次のトークンが欲しいかは、場合によるかも。
export function getSpanOfNextSameTypeTokens(
  cm: CodeMirror.EditorFromTextArea,
  pos: Position,
  type: string,
  nextType: string
): Span | null {
  const tokens = cm.getLineTokens(pos.line);
  if (tokens.length <= 0) return null;

  const anchorIndex = findTokenIndexOfChPosition(tokens, pos.ch);
  if (anchorIndex === null || !hasTypeAt(cm, pos, type)) return null;

  const findStartIndex = (tokens: Token[], anchorIndex: number): number | null => {
    for (let i = anchorIndex; i < tokens.length; i++) {
      if (!hasType(tokens[i], type)) return i;
    }
    return null;
  };

  const findEndIndex = (tokens: Token[], startIndex: number): number => {
    for (let i = startIndex; i < tokens.length; i++) {
      console.log(`i=${i}`);
      if (!hasType(tokens[i], nextType)) return i - 1;
    }
    return tokens.length - 1;
  };

  const startIndex = findStartIndex(tokens, anchorIndex);
  console.log(`tokens.length=${tokens.length}, anchorIndex=${anchorIndex}, startIndex=${startIndex}`);
  if (startIndex === null || !hasType(tokens[startIndex], nextType)) return null;

  const endIndex = findEndIndex(tokens, startIndex);

  console.log(
    `tokens.length=${tokens.length}, anchorIndex=${anchorIndex}, startIndex=${startIndex}, endIndex=${endIndex}`
  );

  return Span.create({ line: pos.line, ch: tokens[startIndex].start }, { line: pos.line, ch: tokens[endIndex].end });
}

function findTokenIndexOfChPosition(tokens: Token[], ch: number): number | null {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].start <= ch && ch <= tokens[i].end) return i;
  }
  return null;
}

export function hasType(token: CodeMirror.Token, type: string): boolean {
  return token.type?.split(" ").includes(type) ?? false;
}

export function hasTypeAt(cm: CodeMirror.EditorFromTextArea, pos: Position, type: string): boolean {
  const types = getTokenTypesAt(cm, pos);
  return types.includes(type);
}

export function getTokenTypesAt(cm: CodeMirror.EditorFromTextArea, pos?: Position): string[] {
  pos = pos ?? cm.getCursor();
  return cm.getTokenTypeAt({ line: pos.line, ch: pos.ch })?.split(" ") ?? [];
}

export function isBetween(pos: Position, from: Position, to: Position): boolean {
  const fromIsBeforePos = isBeforeOrEqual(from, pos);
  const posIsBeforeTo = isBeforeOrEqual(pos, to);
  return fromIsBeforePos && posIsBeforeTo;
}

export function isBeforeOrEqual(pos: Position, anotherPos: Position): boolean {
  if (pos.line < anotherPos.line) return true;
  if (pos.line > anotherPos.line) return false;
  return pos.ch <= anotherPos.ch;
}
