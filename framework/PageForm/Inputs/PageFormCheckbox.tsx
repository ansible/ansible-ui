import { Checkbox, CheckboxProps } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, Validate, useFormContext } from 'react-hook-form';
import { Help } from '../../components/Help';

export type PageFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  validate?: Validate<boolean, TFieldValues> | Record<string, Validate<boolean, TFieldValues>>;
  labelHelpTitle?: string;
  labelHelp?: string | string[] | ReactNode;
} & Pick<CheckboxProps, 'label' | 'description' | 'readOnly' | 'isDisabled' | 'isRequired'>;

/** PatternFly Checkbox wrapper for use with react-hook-form */
export function PageFormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormCheckboxProps<TFieldValues, TFieldName>) {
  const { name, readOnly, validate } = props;
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();
  props.label;

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value } }) => {
        return (
          <Checkbox
            name={name}
            id={props.id ?? name.split('.').join('-')}
            data-cy={props.id ?? name.split('.').join('-')}
            label={
              <>
                {props.label}
                {props.labelHelp && <Help title={props.labelHelpTitle} help={props.labelHelp} />}
              </>
            }
            description={props.description}
            isChecked={!!value}
            onChange={onChange}
            readOnly={readOnly || isSubmitting}
            isDisabled={props.isDisabled}
            isRequired={props.isRequired}
          />
        );
      }}
      rules={{ validate }}
    />
  );
}
