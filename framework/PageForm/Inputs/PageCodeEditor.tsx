import { CodeEditor, Language } from '@patternfly/react-code-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { CSSProperties, useRef } from 'react';
import { ChangeHandler } from 'react-monaco-editor';
import { useSettings } from '../..';
import './PageCodeEditor.css';

export function PageCodeEditor(props: {
  id?: string;
  value?: string | undefined;
  onChange?: ChangeHandler;
  style?: CSSProperties;
  className?: string;
  invalid?: boolean;
  isReadOnly?: boolean;
  showLineNumbers?: boolean;
}) {
  const editorRef = useRef<{
    editor?: monacoEditor.editor.IStandaloneCodeEditor;
    monaco?: typeof monacoEditor;
  }>({});
  const onEditorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    editorRef.current.editor = editor;
    editorRef.current.monaco = monaco;
    // editor.layout();
    // editor.focus();
    // monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };
  const settings = useSettings();
  return (
    <div
      id={props.id}
      className={props.className}
      style={{ ...props.style, flexGrow: 1, position: 'relative', padding: 0 }}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      <CodeEditor
        isDarkTheme={settings.activeTheme === 'dark'}
        isLineNumbersVisible={props.showLineNumbers === true}
        isReadOnly={props.isReadOnly}
        isMinimapVisible={false}
        isLanguageLabelVisible={false}
        code={props.value}
        onChange={props.onChange}
        language={Language.yaml}
        onEditorDidMount={onEditorDidMount}
        // height={`${height}px`}
      />
    </div>
  );
}
