import { ReactElement, ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/strings';
import { FormGroupTypeAheadMultiSelect } from './FormGroupTypeAheadMultiSelect';

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
  isRequired?: boolean;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
};

export function PageFormCreatableSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormCreatableSelectProps<TFieldValues, TFieldName>) {
  const { isRequired, validate, ...rest } = props;
  const {
    control,
    formState: { isSubmitting },
    getValues,
  } = useFormContext<TFieldValues>();
  return (
    <Controller<TFieldValues, TFieldName>
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupTypeAheadMultiSelect
          {...rest}
          id={props.id ?? props.name}
          helperTextInvalid={error?.message}
          value={value}
          isSubmitting={isSubmitting}
          isRequired={isRequired}
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
      rules={{
        required:
          typeof props.label === 'string' && typeof isRequired === 'boolean'
            ? {
                value: true,
                message: `${capitalizeFirstLetter(props.label.toLocaleLowerCase())} is required.`,
              }
            : isRequired,
        validate: validate,
      }}
    />
  );
}
