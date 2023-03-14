import { FormGroup, Switch } from '@patternfly/react-core';
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
  Validate,
  ValidationRule,
} from 'react-hook-form';
import { SwitchProps } from '@patternfly/react-core';
import { ReactElement } from 'react';
import { Help } from '../../components/Help';

export type PageFormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  helperText?: string;
  isRequired?: boolean;
  pattern?: ValidationRule<RegExp>;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  autoFocus?: boolean;
  additionalControls?: ReactElement;
  formLabel?: string;
  labelHelp?: string;
  labelHelpTitle?: string;
} & Omit<SwitchProps, 'onChange' | 'ref' | 'instance'>;

export function PageFormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormSwitchProps<TFieldValues, TFieldName>) {
  const {
    name,
    id,
    helperText,
    validate,
    additionalControls,
    formLabel,
    labelHelp,
    labelHelpTitle,
    ...rest
  } = props;
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <FormGroup
            helperTextInvalid={!(validate && isValidating) && error?.message}
            fieldId={id}
            label={formLabel}
            helperText={helperText}
            validated={error?.message ? 'error' : undefined}
            labelInfo={additionalControls}
            labelIcon={labelHelp ? <Help title={labelHelpTitle} help={labelHelp} /> : undefined}
          >
            <Switch
              {...rest}
              isChecked={value}
              onChange={(e) => onChange(e)}
              isDisabled={isSubmitting}
            />
          </FormGroup>
        );
      }}
    />
  );
}
