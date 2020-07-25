import * as CodeMirror from "codemirror";
import { Position } from "codemirror";
import { getTokenTypesAt } from "./util";

export class Span {
  readonly from: Position;
  readonly to: Position;

  private constructor(from: Position, to: Position) {
    this.from = from;
    this.to = to;
  }

  static create(from: Position, to: Position): Span | null {
    const valid = (from: Position, to: Position): boolean => {
      if (from.line < to.line) {
        return true;
      } else if (from.line === to.line) {
        return from.ch <= to.ch;
      } else {
        return false;
      }
    };

    return valid(from, to) ? new Span(from, to) : null;
  }
}

export class CursorInfo {
  readonly pos: Position;
  readonly types: string[];

  private constructor(pos: Position, types: string[]) {
    this.pos = pos;
    this.types = types;
  }

  static createFromCurrentCursor(cm: CodeMirror.EditorFromTextArea): CursorInfo {
    const pos = cm.getCursor();
    const types = getTokenTypesAt(cm, pos);
    return new CursorInfo(pos, types);
  }
}
