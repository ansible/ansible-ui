import { Checkbox, CheckboxProps } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, Validate, useFormContext } from 'react-hook-form';
import { Help } from '../../components/Help';
import { PFColorE, getPatternflyColor } from '../../components/pfcolors';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  validate?: Validate<boolean, TFieldValues> | Record<string, Validate<boolean, TFieldValues>>;
  labelHelpTitle?: string;
  labelHelp?: string | string[] | ReactNode;
  label?: string;
} & Pick<CheckboxProps, 'description' | 'readOnly' | 'isDisabled' | 'isRequired'>;

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
  const required = useRequiredValidationRule(props.label, props.isRequired);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message;
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
            isChecked={!!value}
            onChange={onChange}
            readOnly={readOnly || isSubmitting}
            isDisabled={props.isDisabled}
            isRequired={props.isRequired}
            description={
              helperTextInvalid ? (
                <span style={{ color: getPatternflyColor(PFColorE.Danger) }}>
                  {helperTextInvalid}
                </span>
              ) : (
                props.description
              )
            }
          />
        );
      }}
      rules={{ required, validate }}
    />
  );
}
