import { useEffect, useRef } from 'react';
import { FieldPath, FieldValues, UseFormClearErrors, UseFormSetError } from 'react-hook-form';
import { useSettings } from '../../Settings';
import { setDiagnosticsOptions as setYamlDiagnosticOptions } from 'monaco-yaml';
import * as monaco from 'monaco-editor';
import useResizeObserver from '@react-hook/resize-observer';

export function DataEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
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
}) {
  const { onChange, language, setError, name, clearErrors } = props;

  const divEl = useRef<HTMLDivElement>(null);

  const editorRef = useRef<{
    editor?: monaco.editor.IStandaloneCodeEditor;
  }>({});

  const settings = useSettings();

  useEffect(() => {
    setYamlDiagnosticOptions({
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
        lineNumbers: 'on',
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

    window.MonacoEnvironment = {
      getWorker(moduleId, label) {
        switch (label) {
          case 'editorWorkerService':
            return new Worker(
              new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url)
            );
          case 'json':
            return new Worker(
              new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url)
            );
          case 'yaml':
            return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
          default:
            throw new Error(`Unknown label ${label}`);
        }
      },
    };
    return () => {
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef?.current?.editor;
    const uri = monaco.editor.getModels()[0];
    if (editor && uri && language) {
      monaco.editor.setModelLanguage(uri, language);
    }
    editorRef.current?.editor?.getModel()?.onDidChangeContent(() => {
      onChange(editorRef.current?.editor?.getValue() ?? '');
    });
    const currentValue = editorRef.current?.editor?.getValue();
    if (editorRef.current?.editor && currentValue !== props.value) {
      editorRef.current?.editor?.setValue(props.value);
    }
    const valueArray = props.value.split('\n');
    const element = document.getElementById('wrapper');
    if (valueArray.length > 0 && element) {
      element.style.minHeight = '75px';
      element.style.height = `${(valueArray.length + 3) * 19}` + 'px';
    }
  }, [props.value, language, onChange]);

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
    monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({
        owner: monaco.editor?.getModels()[0]?.getLanguageId(),
      });
      if (markers.length > 0) {
        setError(name, { message: markers.map((marker) => marker.message).join('\n') });
      } else {
        clearErrors(name);
      }
    });
  }, [setError, clearErrors, name]);

  return (
    <div
      className={`pf-c-form-control`}
      id="wrapper"
      style={{ backgroundPosition: 'calc(100% - 1.2em) .5em', padding: 0 }}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      <div id={props.id} ref={divEl} style={{ height: '100%' }}></div>
    </div>
  );
}
