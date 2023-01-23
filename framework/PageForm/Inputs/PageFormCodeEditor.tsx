import { Controller, useFormContext } from 'react-hook-form';
import { FormGroupCodeEditor, FormGroupCodeEditorProps } from './FormGroupCodeEditor';

export type PageFormCodeEditorProps = { name: string } & Omit<
  FormGroupCodeEditorProps,
  'onCodeChange' | 'code'
>;

/** PatternFly CodeEditor wrapper for use with react-hook-form */
export function PageFormCodeEditor(props: PageFormCodeEditorProps) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  return (
    <Controller
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupCodeEditor
          {...props}
          code={value as string}
          onCodeChange={onChange}
          helperTextInvalid={error?.message}
          isReadOnly={props.isReadOnly || isSubmitting}
        />
      )}
    />
  );
}
