import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
  Validate,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/strings';
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
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        if (value === '') {
          if (props.options.length === 1 && isRequired) {
            onChange(props.options[0].value);
          }
        }

        return (
          <FormGroupSelectOption
            {...props}
            id={props.id ?? props.name}
            value={value as TSelection}
            onSelect={(_, value) => onChange(value)}
            helperTextInvalid={error?.message}
            isReadOnly={props.isReadOnly || isSubmitting}
          />
        );
      }}
      rules={{
        required:
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,
        validate: validate,
      }}
    />
  );
}
