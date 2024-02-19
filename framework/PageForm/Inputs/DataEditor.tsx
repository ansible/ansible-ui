import useResizeObserver from '@react-hook/resize-observer';
import jsyaml from 'js-yaml';
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useEffect, useRef, useState } from 'react';
import { FieldPath, FieldValues, UseFormClearErrors, UseFormSetError } from 'react-hook-form';
import { useSettings } from '../../Settings';

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

export function DataEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  language?: string;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  invalid?: boolean;
  value: string | object;
  id: string;
  isReadOnly?: boolean;
  onChange: (value: string) => void;
  disableLineNumbers?: boolean;
}) {
  // We set the default value and language in state to avoid re-rendering the editor when the value or language changes
  const [defaultValue] = useState(props.value);
  const [defaultLanguage] = useState(props.language);

  const { onChange, language, setError, name, clearErrors } = props;
  const idDataEditorElement = `data-editor-${name}`;

  const divEl = useRef<HTMLDivElement>(null);

  const editorRef = useRef<{
    editor?: monaco.editor.IStandaloneCodeEditor;
  }>({});

  const settings = useSettings();

  useEffect(() => {
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

    let editor: monaco.editor.IStandaloneCodeEditor;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: true });

    if (divEl.current) {
      editor = monaco?.editor?.create(divEl.current, {
        lineNumbers: props.disableLineNumbers ? 'off' : 'on',
        theme: 'my-dark',
        lineDecorationsWidth: 8,
        padding: { top: 6, bottom: 8 },
        fontSize: 14,
        fontFamily: 'RedHatMono',
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        renderLineHighlightOnlyWhenFocus: true,
      });

      editorRef.current.editor = editor;
    }
    window.MonacoEnvironment = { getWorker };

    return () => {
      editor.dispose();
    };
  }, [props.disableLineNumbers]);

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
      const element = document.getElementById(idDataEditorElement);
      if (element) {
        element.style.minHeight = '75px';
        const visibleLines = value.split('\n').length;
        element.style.height = `${visibleLines * 21 + 12}` + 'px';
      }
    }
  }, [defaultValue, idDataEditorElement, defaultLanguage]);

  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const didChangeContentDisposable = model.onDidChangeContent(() => {
      const value = editor.getValue() ?? '';
      onChange(value);
      const element = document.getElementById(idDataEditorElement);
      if (element) {
        element.style.minHeight = '75px';
        const visibleLines = value.split('\n').length;
        element.style.height = `${visibleLines * 21 + 12}` + 'px';
      }
    });

    return () => {
      didChangeContentDisposable.dispose();
    };
  }, [onChange, idDataEditorElement]);

  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    if (language) {
      monaco.editor.setModelLanguage(model, language);
    }

    const disChangeMarkersDisposable = monaco.editor.onDidChangeMarkers(() => {
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
    } catch (e) {
      try {
        obj = jsyaml.load(editor.getValue()) as object;
      } catch (e) {
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

    return () => {
      disChangeMarkersDisposable.dispose();
    };
  }, [clearErrors, language, name, setError]);

  useResizeObserver(divEl, () => {
    if (editorRef.current?.editor) {
      editorRef.current.editor.layout();
    }
  });

  useEffect(() => {
    if (editorRef.current?.editor) {
      editorRef.current.editor.updateOptions({
        theme: settings.activeTheme === 'dark' ? 'my-dark' : 'my-light',
      });
    }
  }, [settings.activeTheme]);

  return (
    <div
      className={`pf-v5-c-form-control`}
      id={idDataEditorElement}
      style={{ backgroundPosition: 'calc(100% - 1.2em) .5em', padding: 0 }}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      <div id={props.id} data-cy={props.id} ref={divEl} style={{ height: '100%' }}></div>
    </div>
  );
}
