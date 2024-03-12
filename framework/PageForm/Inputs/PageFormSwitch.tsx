import { Switch } from '@patternfly/react-core';
import { ReactElement, ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldValues,
  Validate,
  ValidationRule,
  useFormContext,
} from 'react-hook-form';
import { useID } from '../../hooks/useID';
import { PageFormGroup } from './PageFormGroup';

export type PageFormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  label?: string;
  labelHelpTitle?: string;
  labelHelp?: string | string[] | ReactNode;
  isRequired?: boolean;
  additionalControls?: ReactElement;
  helperText?: string;
  pattern?: ValidationRule<RegExp>;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  autoFocus?: boolean;
  labelOn?: string;
  labelOff?: string;
};

export function PageFormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormSwitchProps<TFieldValues, TFieldName>) {
  const {
    name,
    helperText,
    validate,
    additionalControls,
    label,
    labelHelp,
    labelHelpTitle,
    labelOn,
    labelOff,
  } = props;
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const id = useID(props);
  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const helperTextInvalid = !(validate && isValidating) ? error?.message : undefined;
        return (
          <PageFormGroup
            fieldId={id}
            data-cy={id + '-form-group'}
            label={label}
            labelHelpTitle={labelHelpTitle ?? label}
            labelHelp={labelHelp}
            helperText={helperText}
            helperTextInvalid={helperTextInvalid}
            additionalControls={additionalControls}
          >
            <Switch
              data-cy={id + '-toggle'}
              aria-label={label}
              isChecked={value}
              onChange={(e) => onChange(e)}
              isDisabled={isSubmitting}
              label={labelOn}
              labelOff={labelOff}
            />
          </PageFormGroup>
        );
      }}
    />
  );
}
