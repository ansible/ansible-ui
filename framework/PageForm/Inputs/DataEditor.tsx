import useResizeObserver from '@react-hook/resize-observer';
import jsyaml from 'js-yaml';
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useEffect, useRef } from 'react';
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
  value: string;
  id: string;
  isReadOnly?: boolean;
  onChange: (value: string) => void;
  disableLineNumbers?: boolean;
}) {
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

  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    if (language) {
      monaco.editor.setModelLanguage(model, language);
    }
    const didChangeContentDisposable = model.onDidChangeContent(() => {
      onChange(editor.getValue() ?? '');
    });
    const currentValue = editor.getValue();
    let value = props.value;
    if (typeof value === 'object') {
      language === 'json' ? (value = JSON.stringify(value, null, 2)) : (value = jsyaml.dump(value));
    }
    if (currentValue !== value) {
      editor.setValue(value || '');
    }
    const valueArray = value?.split('\n') || [''];
    const element = document.getElementById(idDataEditorElement);
    if (valueArray.length > 0 && element) {
      element.style.minHeight = '75px';
      element.style.height = `${(valueArray.length + 3) * 19}` + 'px';
    }

    return () => {
      didChangeContentDisposable.dispose();
    };
  }, [props.value, language, onChange, idDataEditorElement]);

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

  useEffect(() => {
    const editor = editorRef?.current?.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

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

    return () => {
      disChangeMarkersDisposable.dispose();
    };
  }, [setError, clearErrors, name]);

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
