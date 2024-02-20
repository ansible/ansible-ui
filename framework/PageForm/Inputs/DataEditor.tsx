import useResizeObserver from '@react-hook/resize-observer';
import jsyaml from 'js-yaml';
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldPath, FieldValues, UseFormClearErrors, UseFormSetError } from 'react-hook-form';
import styled from 'styled-components';
import { useSettings } from '../../Settings';
import { useID } from '../../hooks/useID';

export enum DataEditorLanguage {
  JSON = 'json',
  YAML = 'yaml',
}

/**
 * DataEditor is a wrapper over Monaco editor for editing JSON or YAML data.
 */
export function DataEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  id?: string;
  name: TFieldName;
  language: 'json' | 'yaml';
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  invalid?: boolean;
  value: string | object;
  isReadOnly?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useID(props);

  const outerDivEl = useRef<HTMLDivElement>(null);
  const innerDivEl = useRef<HTMLDivElement>(null);

  // We set the default value and language in state to avoid re-rendering the editor when the value or language changes
  const [defaultValue] = useState(props.value);
  const [defaultLanguage] = useState(props.language);

  const { onChange, language, setError, name, clearErrors } = props;

  // When content changes, we need to update the height of the editor
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
        lineNumbers: 'on',
        theme: 'my-dark',
        lineDecorationsWidth: 8,
        padding: { top: EditorPaddingTop, bottom: EditorPaddingBottom },
        fontSize: 14,
        fontFamily: 'RedHatMono',
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        renderLineHighlightOnlyWhenFocus: true,
      });
      editorRef.current.editor = editor;
      return () => editor.dispose();
    }
  }, []);

  // Set editor default value
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (editor) {
      let value: string = '';
      if (typeof defaultValue === 'object') {
        if (defaultValue === null) {
          editor.setValue('');
        } else {
          switch (defaultLanguage) {
            case 'json':
              try {
                value = JSON.stringify(defaultValue, null, 2);
              } catch (e) {
                // do nothing
              }
              break;
            case 'yaml':
              try {
                value = jsyaml.dump(defaultValue);
              } catch (e) {
                // do nothing
              }
              break;
          }
        }
      } else {
        value = defaultValue ?? '';
      }
      editor.setValue(value);
      updateEditorHeight(value);
    }
  }, [defaultValue, defaultLanguage, updateEditorHeight]);

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

  // Hook up editor language change event which hooks up the form errors
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
      if (markers.length > 0) {
        setError(name, { message: markers.map((marker) => marker.message).join('\n') });
      } else {
        clearErrors(name);
      }
    });

    let obj: object | undefined = undefined;
    try {
      obj = JSON.parse(editor.getValue()) as object;
    } catch {
      try {
        obj = jsyaml.load(editor.getValue()) as object;
      } catch {
        // do nothing
      }
    }
    if (obj) {
      switch (language) {
        case 'json':
          editor.setValue(JSON.stringify(obj, null, 2));
          break;
        case 'yaml':
          editor.setValue(jsyaml.dump(obj));
          break;
      }
    }

    return () => didChangeMarkersDisposable.dispose();
  }, [clearErrors, language, name, setError]);

  // Update editor size when container size changes
  useResizeObserver(innerDivEl, () => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;
    editor.layout();
  });

  // Update editor theme when settings change
  const settings = useSettings();
  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;
    editor.updateOptions({ theme: settings.activeTheme === 'dark' ? 'my-dark' : 'my-light' });
  }, [settings.activeTheme]);

  return (
    <OuterDiv
      className="pf-v5-c-form-control"
      aria-invalid={props.invalid ? 'true' : undefined}
      ref={outerDivEl}
    >
      <InnerDiv id={id} data-cy={id} ref={innerDivEl} />
    </OuterDiv>
  );
}

// The outer div is used to contain an inner div that is absolutely positioned to fill the outer div
const OuterDiv = styled.div`
  position: relative;
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
          new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
          { type: 'module' }
        );
      }
      return editorWorkerService;
    case 'json':
      if (!jsonWorker) {
        jsonWorker = new Worker(
          new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url),
          { type: 'module' }
        );
      }
      return jsonWorker;
    case 'yaml':
      if (!yamlWorker) {
        yamlWorker = new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url), {
          type: 'module',
        });
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
monaco.editor.defineTheme('my-dark', {
  base: 'vs-dark',
  inherit: true,
  colors: {
    'editor.background': '#00000000',
    'minimap.background': '#00000000',
    'scrollbarSlider.background': '#FFFFFF22',
  },
  rules: [{ token: '', background: '#222222' }],
});

// Set up Monaco editor light theme
monaco.editor.defineTheme('my-light', {
  base: 'vs',
  inherit: true,
  colors: {
    'editor.background': '#FFFFFF00',
    'minimap.background': '#FFFFFF00',
    'scrollbarSlider.background': '#FFFFFF22',
  },
  rules: [],
});
