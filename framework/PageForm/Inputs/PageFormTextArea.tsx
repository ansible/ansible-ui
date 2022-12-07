import { Controller, useFormContext } from 'react-hook-form';
import { FormGroupTextArea, FormGroupTextAreaProps } from './FormGroupTextArea';

export type PageFormTextAreaProps = { name: string } & Omit<
  FormGroupTextAreaProps,
  'onChange' | 'value'
>;

/** PatternFly TextArea wrapper for use with react-hook-form */
export function PageFormTextArea(props: PageFormTextAreaProps) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupTextArea
          {...props}
          value={value as string}
          onChange={onChange}
          helperTextInvalid={error?.message}
          isReadOnly={props.isReadOnly || isSubmitting}
        />
      )}
    />
  );
}
