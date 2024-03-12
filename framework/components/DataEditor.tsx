import useResizeObserver from '@react-hook/resize-observer';
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { usePageSettings } from '../PageSettings/PageSettingsProvider';
import { useID } from '../hooks/useID';
import './DataEditor.css';

export type DataEditorLanguages = 'json' | 'yaml' | 'markdown';

/**
 * DataEditor is a wrapper over Monaco editor for editing JSON or YAML data.
 */
export function DataEditor(props: {
  id?: string;
  name: string;
  language: DataEditorLanguages;
  value: string;
  onChange: (value: string) => void;
  setError: (error?: string) => void;
  isReadOnly?: boolean;
  className?: string;
  lineNumbers?: boolean;
}) {
  const id = useID(props);
  const { language, value, onChange, setError, isReadOnly } = props;

  const [ready, setReady] = useState(false);

  // The outter div is used to contain the inner div that is absolutely positioned to fill the outer div
  const outerDivEl = useRef<HTMLDivElement>(null);
  const innerDivEl = useRef<HTMLDivElement>(null);

  // When content changes, we need to update the height of the outer div to match the content
  const updateEditorHeight = useCallback((value: string) => {
    if (!outerDivEl.current) return;
    outerDivEl.current.style.minHeight = `${EditorLineHeight + EditorPadding}` + 'px';
    const visibleLines = value.split('\n').length;
    outerDivEl.current.style.height = `${visibleLines * EditorLineHeight + EditorPadding}` + 'px';
  }, []);

  // Create editor
  const editorRef = useRef<{ editor?: monaco.editor.IStandaloneCodeEditor }>({});
  useEffect(() => {
    if (innerDivEl.current) {
      const editor = monaco.editor.create(innerDivEl.current, {
        lineNumbers: props.lineNumbers ? 'on' : 'off',
        lineDecorationsWidth: props.lineNumbers ? undefined : 0,
        theme: 'data-editor-dark',
        padding: { top: EditorPaddingTop, bottom: EditorPaddingBottom },
        fontSize: 14,
        fontFamily: 'RedHatMono',
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        // renderLineHighlight: 'none',
        renderLineHighlightOnlyWhenFocus: true,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
      });
      editorRef.current.editor = editor;
      return () => editor.dispose();
    }
  }, [props.lineNumbers]);

  // Hook up editor change event to call onChange
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const didChangeContentDisposable = model.onDidChangeContent(() => {
      const value = editor.getValue() ?? '';
      onChange(value);
      updateEditorHeight(value);
    });
    return () => didChangeContentDisposable.dispose();
  }, [onChange, updateEditorHeight]);

  // Set editor value to change on value change
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;
    if (editor.getValue() === value) return;
    editor.setValue(value);
    updateEditorHeight(value);
  }, [value, updateEditorHeight]);

  // Editor is read-only
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;
    editor.updateOptions({ readOnly: isReadOnly });
  }, [isReadOnly]);

  // Hook up editor language change event which hooks up the form errors
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    monaco.editor.setModelLanguage(model, language);

    const didChangeMarkersDisposable = monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({
        owner: model.getLanguageId(),
        resource: model.uri,
      });
      setHasError(markers.length > 0);
      setError(markers.length > 0 ? markers.map((marker) => marker.message).join('\n') : undefined);
    });

    return () => didChangeMarkersDisposable.dispose();
  }, [language, setError]);

  // Update editor size when container size changes
  useResizeObserver(innerDivEl, () => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;
    editor.layout();
    setReady(true);
  });

  // Update editor theme when settings change
  const settings = usePageSettings();
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;
    editor.updateOptions({
      theme: settings.activeTheme === 'dark' ? 'data-editor-dark' : 'data-editor-light',
    });
  }, [settings.activeTheme]);

  return (
    <OuterDiv
      className={props.className}
      aria-invalid={hasError ? 'true' : undefined}
      ref={outerDivEl}
    >
      <InnerDiv
        id={id}
        data-cy={id}
        ref={innerDivEl}
        className="data-editor"
        aria-disabled={ready ? 'false' : 'true'}
      />
    </OuterDiv>
  );
}

// The outer div is used to contain an inner div that is absolutely positioned to fill the outer div
const OuterDiv = styled.div`
  position: relative;
  min-height: 33px;
`;

// The inner div is used to contain the editor and is absolutely positioned to fill the outer div
const InnerDiv = styled.div`
  position: absolute;
  inset: 0;
`;

// Editor constants
const EditorLineHeight = 21;
const EditorPaddingTop = 6;
const EditorPaddingBottom = 6;
const EditorPadding = EditorPaddingTop + EditorPaddingBottom;

// workers are singletons at a global level
// this solves the problem of creating multiple workers for the same language
// when multiple editors are created
let editorWorkerService: Worker;
let jsonWorker: Worker;
let yamlWorker: Worker;
function getWorker(moduleId: string, label: string) {
  switch (label) {
    case 'editorWorkerService':
      if (!editorWorkerService) {
        editorWorkerService = new Worker(
          new URL('../../node_modules/monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
          { type: 'module' }
        );
      }
      return editorWorkerService;
    case 'json':
      if (!jsonWorker) {
        jsonWorker = new Worker(
          new URL(
            '../../node_modules/monaco-editor/esm/vs/language/json/json.worker',
            import.meta.url
          ),
          { type: 'module' }
        );
      }
      return jsonWorker;
    case 'yaml':
      if (!yamlWorker) {
        yamlWorker = new Worker(
          new URL('../../node_modules/monaco-yaml/yaml.worker', import.meta.url),
          { type: 'module' }
        );
      }
      return yamlWorker;
    default:
      throw new Error(`Unknown label ${label}`);
  }
}
window.MonacoEnvironment = { getWorker };

// Set up Monaco editor json language support
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: true });

// Set up Monaco editor yaml language support
configureMonacoYaml(monaco, {
  validate: true,
  format: true,
  schemas: [
    {
      uri: '',
      fileMatch: [],
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: true,
      },
    },
  ],
});

// Set up Monaco editor dark theme
monaco.editor.defineTheme('data-editor-dark', {
  base: 'vs-dark',
  inherit: true,
  colors: {
    'editor.background': '#00000000',
    'minimap.background': '#00000000',
    'scrollbarSlider.background': '#FFFFFF22',
    'editor.outline': '#00000000',
    'editor.lineHighlightBorder': '#00000000',
    'editor.lineHighlightBackground': '#00000000',
    'editorLineNumber.foreground': '#FFFFFF88',
    'editorBracketMatch.border': '#00000000',
    'editorBracketMatch.background': '#FFFFFF00',
  },
  rules: [{ token: '', background: '#222222' }],
});

// Set up Monaco editor light theme
monaco.editor.defineTheme('data-editor-light', {
  base: 'vs',
  inherit: true,
  colors: {
    'editor.background': '#FFFFFF00',
    'minimap.background': '#FFFFFF00',
    'scrollbarSlider.background': '#FFFFFF22',
    'editor.outline': '#00000000',
    'editor.lineHighlightBorder': '#ffffff00',
    'editor.lineHighlightBackground': '#ffffff00',
    'editorLineNumber.foreground': '#00000088',
    'editorBracketMatch.border': '#ffffff00',
    'editorBracketMatch.background': '#00000000',
  },
  rules: [],
});
