import { ReactElement, ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { FormGroupTypeAheadMultiSelect } from './FormGroupTypeAheadMultiSelect';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormCreatableSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  label: string;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;
  additionalControls?: ReactElement;
  placeholderText?: string;
  options: { value: string | { name: string }; label: string }[];
  isReadOnly?: boolean;
  isRequired?: boolean;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
};

export function PageFormCreatableSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormCreatableSelectProps<TFieldValues, TFieldName>) {
  const {
    additionalControls,
    id,
    isReadOnly,
    isRequired,
    label,
    labelHelp,
    labelHelpTitle,
    name,
    options,
    placeholderText,
    validate,
  } = props;
  const {
    control,
    formState: { isSubmitting },
    getValues,
  } = useFormContext<TFieldValues>();
  const required = useRequiredValidationRule(props.label, props.isRequired);
  return (
    <Controller<TFieldValues, TFieldName>
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupTypeAheadMultiSelect
          additionalControls={additionalControls}
          helperTextInvalid={error?.message}
          id={id ?? name}
          isReadOnly={isReadOnly}
          isSubmitting={isSubmitting}
          isRequired={isRequired}
          label={label}
          labelHelp={labelHelp}
          labelHelpTitle={labelHelpTitle ?? label}
          options={options}
          placeholderText={placeholderText}
          value={value}
          onHandleClear={(chip?: string) => {
            const values: { name: string }[] = getValues(props.name);
            onChange(!chip ? [] : values.filter((v: { name: string }) => v.name !== chip));
          }}
          onHandleSelection={(item) => {
            let newValue;
            const selectedItem = item as { name: string };
            const values: { name: string }[] = getValues(props.name);

            if (values?.find((value) => value.name === selectedItem.name)) {
              newValue = values.filter((i) => i !== selectedItem);
            } else {
              newValue = values?.length ? [...values, selectedItem] : [selectedItem];
            }
            return onChange(newValue);
          }}
        />
      )}
      rules={{ required, validate: validate }}
    />
  );
}
