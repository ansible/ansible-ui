import { Checkbox, CheckboxProps } from '@patternfly/react-core';
import { Controller, useFormContext, Validate } from 'react-hook-form';

export type PageFormCheckboxProps = {
  id?: string;
  name: string;
  validate?: Validate<string> | Record<string, Validate<string>>;
} & Omit<CheckboxProps, 'id' | 'onChange' | 'value'>;

/** PatternFly Checkbox wrapper for use with react-hook-form */
export function PageFormCheckbox(props: PageFormCheckboxProps) {
  const { name, readOnly, validate } = props;
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Controller
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
