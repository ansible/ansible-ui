import { Checkbox, CheckboxProps } from '@patternfly/react-core';
import { Controller, FieldPath, FieldValues, useFormContext, Validate } from 'react-hook-form';

export type PageFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  id?: string;
  name: TFieldName;
  validate?: Validate<boolean, TFieldValues> | Record<string, Validate<boolean, TFieldValues>>;
} & Omit<CheckboxProps, 'id' | 'onChange' | 'value'>;

/** PatternFly Checkbox wrapper for use with react-hook-form */
export function PageFormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormCheckboxProps<TFieldValues, TFieldName>) {
  const { name, readOnly, validate } = props;
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value } }) => {
        return (
          <Checkbox
            {...props}
            id={props.id ?? name.split('.').join('-')}
            isChecked={!!value}
            onChange={onChange}
            readOnly={readOnly || isSubmitting}
            minLength={undefined}
            maxLength={undefined}
            ref={undefined}
          />
        );
      }}
      rules={{ validate }}
    />
  );
}
