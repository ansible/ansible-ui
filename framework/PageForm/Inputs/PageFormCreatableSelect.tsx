import { ReactElement, ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { FormGroupSingleSelectTypeAhead } from './FormGroupSingleSelectTypeAhead';
import { FormGroupTypeAheadMultiSelect } from './FormGroupTypeAheadMultiSelect';
import { useRequiredValidationRule } from './validation-hooks';

export interface SelectOptionObject {
  /** Function returns a string to represent the select option object */
  toString(): string;
  /** Function returns a true if the passed in select option is equal to this select option object, false otherwise */
  compareTo?(selectOption: unknown): boolean;
}

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
  options: { value: string; label: string }[];
  isReadOnly?: boolean;
  isRequired?: boolean;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
  shouldUnregister?: boolean;
  isMulti?: boolean;
  toggleButtonId?: string;
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
    isMulti = true,
    toggleButtonId,
  } = props;
  const {
    control,
    formState: { isSubmitting },
    getValues,
  } = useFormContext<TFieldValues>();
  const required = useRequiredValidationRule(label, isRequired);

  const getSelectedValues = (item: string | SelectOptionObject | { name: string }) => {
    const selectedItem = item as { name: string };

    if (isMulti) {
      const values: { name: string }[] = getValues(name);

      if (values?.find((value) => value.name === selectedItem.name)) {
        return values.filter((i) => i.name !== selectedItem.name);
      } else {
        return values?.length ? [...values, selectedItem] : [selectedItem];
      }
    } else {
      return selectedItem;
    }
  };

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister={props.shouldUnregister !== false ? true : false}
      render={({ field: { onChange, value }, fieldState: { error } }) =>
        isMulti ? (
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
              const values: { name: string; isReadOnly?: boolean }[] = getValues(name);
              if (!chip) {
                onChange(values.filter((v) => v.isReadOnly));
              } else {
                onChange(values.filter((v) => v.name !== chip));
              }
            }}
            onHandleSelection={(item) => {
              const newValue = getSelectedValues(item);
              return onChange(newValue);
            }}
          />
        ) : (
          <FormGroupSingleSelectTypeAhead
            additionalControls={additionalControls}
            helperTextInvalid={error?.message}
            id={id ?? name}
            isReadOnly={isReadOnly}
            isSubmitting={isSubmitting}
            isRequired={isRequired}
            label={label}
            toggleButtonId={toggleButtonId}
            labelHelp={labelHelp}
            labelHelpTitle={labelHelpTitle ?? label}
            options={options}
            placeholderText={placeholderText}
            value={value}
            onHandleClear={() => {
              onChange(null);
            }}
            onHandleSelection={(item) => {
              const newValue = getSelectedValues(item);
              return onChange(newValue);
            }}
          />
        )
      }
      rules={{ required, validate: validate }}
    />
  );
}
