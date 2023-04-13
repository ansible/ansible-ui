import useResizeObserver from '@react-hook/resize-observer';
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext, Validate } from 'react-hook-form';
import { FormGroupTextInputProps, useSettings } from '../..';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';

export type PageFormCodeEditorInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
} & Omit<FormGroupTextInputProps, 'onChange' | 'value'>;

export function PageFormCodeEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormCodeEditorInputProps<TFieldValues, TFieldName>) {
  const { isReadOnly, validate, ...formGroupInputProps } = props;
  const { label, name, isRequired } = props;
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

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
            id={id}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            <MonacoEditor
              id={id}
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

export function MonacoEditor(props: {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  invalid?: boolean;
}) {
  const { onChange } = props;

  const divEl = useRef<HTMLDivElement>(null);

  const editorRef = useRef<{
    editor?: monaco.editor.IStandaloneCodeEditor;
  }>({});

  const settings = useSettings();

  useEffect(() => {
    let editor: monaco.editor.IStandaloneCodeEditor;

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
      editor = monaco.editor.create(divEl.current, {
        language: 'yaml',
        lineNumbers: 'off',
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
      editorRef.current.editor = editor;

      editor.getModel()?.onDidChangeContent(() => {
        onChange?.(editor.getValue() ?? '');
      });
    }
    return () => {
      editor.dispose();
    };
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current?.editor) {
      const currentValue = editorRef.current.editor.getValue();
      if (currentValue !== props.value) editorRef.current.editor.setValue(props.value ?? '');
    }
  }, [props.value]);

  useEffect(() => {
    if (editorRef.current?.editor) {
      editorRef.current.editor.updateOptions({ readOnly: props.isReadOnly });
    }
  }, [props.isReadOnly]);

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
      className={`pf-c-form-control`}
      style={{ padding: 0, height: 400 }}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      <div id={props.id} ref={divEl} style={{ height: '100%' }}></div>
    </div>
  );
}
