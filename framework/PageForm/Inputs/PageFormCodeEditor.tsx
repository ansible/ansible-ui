import useResizeObserver from '@react-hook/resize-observer';
import * as monaco from 'monaco-editor';
import { setDiagnosticsOptions as setYamlDiagnosticOptions } from 'monaco-yaml';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Controller,
  FieldPath,
  FieldValues,
  useForm,
  UseFormClearErrors,
  UseFormSetError,
  Validate,
} from 'react-hook-form';
import { FormGroupTextInputProps, useSettings } from '../..';
import { YAMLException } from 'js-yaml';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { isJsonObject, isJsonString, jsonToYaml, yamlToJson } from '../../utils/codeEditorUtils';
import { useTranslation } from 'react-i18next';

export type PageFormCodeEditorInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  toggleLanguages?: string[];
} & Omit<FormGroupTextInputProps, 'onChange' | 'value'>;

export function PageFormCodeEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormCodeEditorInputProps<TFieldValues, TFieldName>) {
  const { isReadOnly, validate, toggleLanguages, ...formGroupInputProps } = props;
  const { label, name, isRequired } = props;
  const [isSelected, setIsSelected] = useState('yaml');
  const {
    control,
    formState: { isSubmitting, isValidating, errors },
    setError: setFormError,
    clearErrors,
  } = useForm<TFieldValues>();

  useEffect(() => {
    if (!errors[name]) {
      clearErrors(name);
    }
  }, [errors, name, clearErrors]);

  const id = props.id ?? name.split('.').join('-');

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <PageFormGroup
            {...formGroupInputProps}
            label={props.label}
            id={id}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            {toggleLanguages?.length && (
              <ToggleGroup isCompact>
                {toggleLanguages.map((language) => (
                  <ToggleGroupItem
                    key={language}
                    isSelected={isSelected === language}
                    onChange={() => setIsSelected(language)}
                    text="JSON"
                    isDisabled={Boolean(errors[name])}
                  />
                ))}
              </ToggleGroup>
            )}
            <MonacoEditor<TFieldValues, TFieldName>
              setError={setFormError}
              clearErrors={clearErrors}
              id={id}
              name={name}
              language={isSelected}
              value={value as unknown as string}
              onChange={onChange}
              isReadOnly={isReadOnly || isSubmitting}
              invalid={!(validate && isValidating) && error?.message !== undefined}
            />
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

export function MonacoEditor<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: PageFormCodeEditorInputProps<TFieldValues, TFieldName> & {
    language: string;
    setError: UseFormSetError<TFieldValues>;
    clearErrors: UseFormClearErrors<TFieldValues>;
    invalid?: boolean;
    value?: string;
    onChange?: (value: string) => void;
  }
) {
  const { onChange, language, setError, name, clearErrors } = props;
  const { t } = useTranslation();
  const divEl = useRef<HTMLDivElement>(null);

  const editorRef = useRef<{
    editor?: monaco.editor.IStandaloneCodeEditor;
  }>({});

  const settings = useSettings();

  useEffect(() => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
    });

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
  }, []);

  useEffect(() => {
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
  }, [language]);

  useEffect(() => {
    let editor: monaco.editor.IStandaloneCodeEditor;

    if (divEl.current) {
      editor = monaco?.editor?.create(divEl.current, {
        language: language,
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
    const currentValue: string | object | undefined = editorRef?.current?.editor?.getValue();
    if (currentValue) {
      if (isJsonString(currentValue) && language === 'json') {
        editorRef.current?.editor?.setValue(currentValue);
      }
      if (!(isJsonObject(currentValue) && isJsonString(currentValue)) && language === 'json') {
        editorRef.current?.editor?.setValue(yamlToJson(currentValue));
      }

      if (language === 'yaml') {
        if (isJsonObject(currentValue)) {
          editorRef.current?.editor?.setValue(jsonToYaml(JSON.parse(currentValue) as string));
        } else {
          editorRef.current?.editor?.setValue(jsonToYaml(currentValue));
        }
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

  monaco.editor.onDidChangeMarkers(() => {
    const markers = monaco.editor.getModelMarkers({
      owner: monaco.editor?.getModels()[0]?.getLanguageId(),
    });

    if (markers?.length > 0) {
      setError(name, { message: markers.map((marker) => marker.message).join('\n') });
    } else {
      clearErrors(name);
    }
  });

  const handleValidation = useCallback(async () => {
    try {
      await editorRef?.current?.editor?.getAction('editor.action.formatDocument')?.run();
    } catch (err) {
      if (err instanceof YAMLException || Object.prototype.hasOwnProperty.call(err, 'message'))
        setError(name, { message: (err as { message: string }).message });
      else {
        setError(name, { message: t('Unknown error occurred') });
      }
    }
  }, [name, setError, t]);

  return (
    <div
      className={`pf-c-form-control`}
      style={{ padding: 0, height: 400 }}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      <div
        id={props.id}
        ref={divEl}
        onBlur={() => void handleValidation()}
        style={{ height: '100%' }}
      ></div>
    </div>
  );
}
