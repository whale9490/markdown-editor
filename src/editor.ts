import * as CodeMirror from "codemirror";
import "../node_modules/codemirror/lib/codemirror.css";
import "../node_modules/codemirror/mode/markdown/markdown.js";
import "../css/editor.css";
import { EditorState } from "./editor_state";

export class Editor {
  private codeMirrorEditor: CodeMirror.EditorFromTextArea;
  private editorState: EditorState;

  constructor(textAreaElement: HTMLTextAreaElement) {
    this.codeMirrorEditor = CodeMirror.fromTextArea(textAreaElement, {
      value: "# marukujira\n\n* kachou\n* dairi\n",
      mode: "markdown",
      lineNumbers: true,
      lineWrapping: true,
      extraKeys: {
        Tab: (cm: CodeMirror.Editor): void => {
          if (cm.somethingSelected()) {
            cm.execCommand("indentMore");
          } else {
            cm.execCommand("insertSoftTab");
          }
        },
        "Shift-Tab": (cm: CodeMirror.Editor): void => cm.execCommand("indentLess"),
      },
    });
    this.editorState = new EditorState();

    this.codeMirrorEditor.on("cursorActivity", (cm: CodeMirror.EditorFromTextArea) => {
      this.editorState.step(cm);
    });
  }
}
