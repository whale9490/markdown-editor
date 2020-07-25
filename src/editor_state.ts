import * as CodeMirror from "codemirror";
import { Position, TextMarker, Token } from "codemirror";
import { CursorInfo } from "./object";
import * as _ from "lodash";
import { getSpanOfNextSameTypeTokens, getSpanOfSameTypeTokens, isBetween } from "./util";

export class EditorState {
  private lastCursorInfo: CursorInfo | null = null;
  private urlTextMarkers: TextMarker[] = [];

  step(cm: CodeMirror.EditorFromTextArea): void {
    const lastCursorInfo = this.lastCursorInfo;
    const currentCursorInfo = CursorInfo.createFromCurrentCursor(cm);
    this.lastCursorInfo = currentCursorInfo;

    if (isIgnorableMove(lastCursorInfo, currentCursorInfo)) return;

    this.urlTextMarkers.forEach((tm: CodeMirror.TextMarker) => tm.clear());
    this.urlTextMarkers = [];

    const currentToken = cm.getTokenAt({
      line: currentCursorInfo.pos.line,
      ch: currentCursorInfo.pos.ch,
    });
    console.log(`currentToken = from ${currentToken.start} to ${currentToken.end}`);

    for (const type of currentCursorInfo.types) {
      if (type === "link") {
        linkFocusAction(this.urlTextMarkers, cm, currentCursorInfo, currentToken);
      } else if (type === "url") {
        urlFocusAction(this.urlTextMarkers, cm, currentCursorInfo, currentToken);
      }
    }

    // if (lastCursorInfo !== null) {
    //   const lastToken = cm.getTokenAt({
    //     line: lastCursorInfo.pos.line,
    //     ch: lastCursorInfo.pos.ch,
    //   });
    //   console.log(`lastToken = from ${lastToken.start} to ${lastToken.end}`);
    //
    //   for (const type of lastCursorInfo.types) {
    //     if (type === "link") {
    //       linkUnfocusAction(this.urlTextMarkers, cm, lastCursorInfo, lastToken);
    //     } else if (type === "url") {
    //       urlUnfocusAction(this.urlTextMarkers, cm, lastCursorInfo, lastToken);
    //     }
    //   }
    // }

    cm.refresh();
  }
}

function isIgnorableMove(lastCursorInfo: CursorInfo | null, currentCursorInfo: CursorInfo): boolean {
  if (lastCursorInfo === null) return false;

  if (lastCursorInfo.pos.line !== currentCursorInfo.pos.line) return false;

  const chDiff = currentCursorInfo.pos.ch - lastCursorInfo.pos.ch;
  if (chDiff < -1 || 1 < chDiff) return false;

  if (_.isEqual(new Set(lastCursorInfo.types), new Set(currentCursorInfo.types))) return false;

  return true;
}

// const collapsedElement = ((): HTMLElement => {
//   const el = document.createElement("p");
//   el.appendChild(document.createTextNode("..."));
//   return el;
// })();

function linkFocusAction(
  urlTextMarkers: TextMarker[],
  cm: CodeMirror.EditorFromTextArea,
  currentCursorInfo: CursorInfo,
  currentToken: Token
): void {
  console.log("focus: link");

  // const pos = currentCursorInfo.pos;
  //
  // const span = getSpanOfNextSameTypeTokens(cm, pos, "link", "url");
  // if (span === null) return;
  //
  // const findMatchedTextMarkerIndex = (): number | null => {
  //   for (let i = 0; i < urlTextMarkers.length; i++) {
  //     const marker = urlTextMarkers[i];
  //     const markerPos = marker.find();
  //     if (markerPos.from === span.from && markerPos.to === span.to) {
  //       return i;
  //     }
  //   }
  //   return null;
  // };
  // const matchedTextMarkerIndex = findMatchedTextMarkerIndex();
  //
  // if (matchedTextMarkerIndex !== null) {
  //   urlTextMarkers[matchedTextMarkerIndex].clear();
  //   urlTextMarkers.splice(matchedTextMarkerIndex, 1);
  // }

  const span = getSpanOfNextSameTypeTokens(cm, currentCursorInfo.pos, "link", "url");
  if (span === null) return;

  const textMarker = cm.markText(span.from, span.to);
  textMarker.className = "cm-url-visible";
  urlTextMarkers.push(textMarker);
}

// function linkUnfocusAction(
//   urlTextMarkers: TextMarker[],
//   cm: CodeMirror.EditorFromTextArea,
//   lastCursorInfo: CursorInfo,
//   lastToken: Token
// ): void {
//   console.log("unfocus: link");
//
//   const span = getSpanOfNextSameTypeTokens(cm, lastCursorInfo.pos, "link", "url");
//   if (span === null) return;
//
//   const textMarker = cm.markText(span.from, span.to);
//   textMarker.collapsed = true;
//   urlTextMarkers.push(textMarker);
// }

function urlFocusAction(
  urlTextMarkers: TextMarker[],
  cm: CodeMirror.EditorFromTextArea,
  currentCursorInfo: CursorInfo,
  currentToken: Token
): void {
  console.log("focus: url");

  const span = getSpanOfSameTypeTokens(cm, currentCursorInfo.pos, "url");
  if (span === null) return;

  const textMarker = cm.markText(span.from, span.to);
  textMarker.className = "cm-url-visible";
  urlTextMarkers.push(textMarker);
}

// function urlUnfocusAction(
//   urlTextMarkers: TextMarker[],
//   cm: CodeMirror.EditorFromTextArea,
//   lastCursorInfo: CursorInfo,
//   lastToken: Token
// ): void {
//   console.log("unfocus: url");
//
//   const span = getSpanOfSameTypeTokens(cm, lastCursorInfo.pos, "url");
//   if (span === null) return;
//
//   const textMarker = cm.markText(span.from, span.to);
//   textMarker.collapsed = true;
//   urlTextMarkers.push(textMarker);
// }
