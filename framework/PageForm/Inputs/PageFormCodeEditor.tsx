import { Split } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import useResizeObserver from '@react-hook/resize-observer';
import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { Controller, FieldPath, FieldValues, Validate, useFormContext } from 'react-hook-form';
import { FormGroupTextInputProps, useSettings } from '../..';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { isJsonObject, isJsonString, jsonToYaml, yamlToJson } from './codeEditorUtils';

export type PageFormCodeEditorInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
} & Omit<FormGroupTextInputProps, 'onChange' | 'value'>;

export function PageFormCodeEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormCodeEditorInputProps<TFieldValues, TFieldName>) {
  const { isReadOnly, validate, isExpandable, defaultExpanded, ...formGroupInputProps } = props;
  const { label, name, isRequired } = props;
  const [isSelected, setIsSelected] = useState('yaml');
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

  const id = props.id ?? name.split('.').join('-');
  const [isCollapsed, setCollapsed] = useState(!defaultExpanded);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <PageFormGroup
            {...formGroupInputProps}
            label={
              isExpandable ? (
                <Split hasGutter style={{ alignItems: 'center' }}>
                  <AngleRightIcon
                    style={{
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                      transition: 'transform',
                    }}
                    onClick={() => setCollapsed((c) => !c)}
                  />
                  {props.label}
                </Split>
              ) : (
                props.label
              )
            }
            id={id}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            {(!isExpandable || !isCollapsed) && (
              <MonacoEditor
                id={id}
                value={value as unknown as string}
                onChange={onChange}
                isReadOnly={isReadOnly || isSubmitting}
                invalid={!(validate && isValidating) && error?.message !== undefined}
              />
            )}
          </PageFormGroup>
        );
      }}
      rules={{
        required:
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,
        validate: props.validate,
      }}
    />
  );
}

export function MonacoEditor(props: {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  invalid?: boolean;
  language: string;
}) {
  const { onChange, language } = props;

  const divEl = useRef<HTMLDivElement>(null);

  const editorRef = useRef<{
    editor?: monaco.editor.IStandaloneCodeEditor;
  }>({});

  const settings = useSettings();

  useEffect(() => {
    let editor: monaco.editor.IStandaloneCodeEditor;
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

    if (divEl.current) {
      editor = monaco?.editor?.create(divEl.current, {
        language: language,
        lineNumbers: 'on',
        theme: 'my-dark',
        lineDecorationsWidth: 8,
        // lineNumbersMinChars: 0,
        // glyphMargin: false,
        // folding: false,
        padding: { top: 6, bottom: 8 },
        fontSize: 14,
        fontFamily: 'RedHatMono',
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        renderLineHighlightOnlyWhenFocus: true,
      });

      monaco.editor.setModelLanguage(monaco.editor.getModels()[0], language);

      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
      });

      const yamlModelUri = monaco.Uri.parse('a://b/foo.yaml');
      setYamlDiagnosticOptions({
        validate: true,
        format: true,
        enableSchemaRequest: true,
        schemas: [
          {
            uri: 'http://myserver/foo-schema.json',
            fileMatch: [String(yamlModelUri)],
            schema: {
              type: 'object',
              properties: {},
              additionalProperties: true,
            },
          },
        ],
      });

      editorRef.current.editor = editor;

      editor.getModel()?.onDidChangeContent(() => {
        onChange?.(editor.getValue() ?? '');
      });
    }
    return () => {
      editor.dispose();
    };
  }, [onChange, language]);

  useEffect(() => {
    if (editorRef.current?.editor) {
      const currentValue = editorRef.current.editor.getValue();
      if (currentValue !== props.value) editorRef.current.editor.setValue(props.value ?? '');
    }
  }, [props.value, language]);

  useEffect(() => {
    if (editorRef.current?.editor) {
      editorRef.current.editor.updateOptions({ readOnly: props.isReadOnly });
    }
  }, [props.isReadOnly]);
  monaco.editor.onDidChangeMarkers((e) => {
    ///////////////////////
    const markers = monaco.editor.getModelMarkers({
      owner: monaco.editor?.getModels()[0]?.getLanguageId(),
    });
    console.log(markers, e, 'ondidchange  markers');
    ///////////////////////
  });
  const markers = monaco.editor.getModelMarkers({
    owner: monaco.editor?.getModels()[0]?.getLanguageId(),
  });
  console.log(markers, 'ondidchange  markers');

  useEffect(() => {
    const currentValue: string | object | undefined = editorRef?.current?.editor?.getValue();

    if (currentValue) {
      // if (isJsonObject(currentValue) && language === 'json') {
      //   return;
      // }
      if (isJsonString(currentValue) && language === 'json') {
        editorRef.current?.editor?.setValue(currentValue);
      }
      if (!(isJsonObject(currentValue) && isJsonString(currentValue)) && language === 'json') {
        console.log('here', currentValue);
        try {
          // const jsonValue: Record<string, unknown> = JSON.parse(jsonString);
          editorRef.current?.editor?.setValue(yamlToJson(currentValue));
        } catch (error) {
          console.log(error);
        }
      }
      if (language === 'yaml' && isJsonObject(currentValue)) {
        editorRef.current?.editor?.setValue(jsonToYaml(currentValue));
      }
      if (language === 'yaml' && isJsonString(currentValue)) {
        editorRef.current?.editor?.setValue(jsonToYaml(currentValue));
      }
    }
  }, [language]);

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
  const handleFormatting = async () => {
    await editorRef?.current?.editor?.getAction('editor.action.formatDocument')?.run();
  };
  return (
    <div
      className={`pf-c-form-control`}
      style={{ padding: 0, height: 400 }}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      <div id={props.id} ref={divEl} onBlur={handleFormatting} style={{ height: '100%' }}></div>
    </div>
  );
}
