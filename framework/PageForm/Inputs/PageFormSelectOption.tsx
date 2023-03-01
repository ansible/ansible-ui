import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
  Validate,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { FormGroupSelectOption, FormGroupSelectOptionProps } from './FormGroupSelectOption';

export type PageFormSelectOptionProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection = unknown
> = {
  name: TFieldName;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
} & Omit<FormGroupSelectOptionProps<TSelection>, 'onSelect' | 'value'>;

/**  Select wrapper for use with react-hook-form */
export function PageFormSelectOption<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection = unknown
>(props: PageFormSelectOptionProps<TFieldValues, TFieldName, TSelection>) {
  const { label, isRequired, validate } = props;
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();

  return (
    <Controller<TFieldValues, TFieldName>
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupSelectOption
          {...props}
          id={props.id ?? props.name.split('.').join('-')}
          value={value as TSelection}
          onSelect={(_, value) => onChange(value)}
          helperTextInvalid={error?.message}
          isReadOnly={props.isReadOnly || isSubmitting}
        />
      )}
      rules={{
        required:
          typeof label === 'string' && typeof isRequired === 'boolean'
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : isRequired,
        validate: validate,
      }}
    />
  );
}
