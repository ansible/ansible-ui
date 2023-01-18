import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
  useFormContext,
  Validate,
  ValidationRule,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { FormGroupTextInput, FormGroupTextInputProps } from './FormGroupTextInput';

export type PageFormTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues
> = {
  name: TFieldName;
  minLength?: number | ValidationRule<number>;
  maxLength?: number | ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
  selectTitle?: string;
  selectValue?: (selection: TSelection) => FieldPathValue<TSelection, FieldPath<TSelection>>;
  selectOpen?: (callback: (selection: TSelection) => void, title: string) => void;
} & Omit<FormGroupTextInputProps, 'onChange' | 'value'>;

/** PatternFly TextInput wrapper for use with react-hook-form */
export function PageFormTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues
>(props: PageFormTextInputProps<TFieldValues, TFieldName, TSelection>) {
  const {
    label,
    name,
    isReadOnly,
    isRequired,
    minLength,
    maxLength,
    pattern,
    validate,
    selectTitle,
  } = props;
  const {
    control,
    setValue,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <FormGroupTextInput
            {...props}
            id={props.id ?? name.split('.').join('-')}
            value={value as string}
            onChange={onChange}
            helperTextInvalid={!(validate && isValidating) && error?.message}
            isReadOnly={isReadOnly || isSubmitting}
            minLength={undefined}
            maxLength={undefined}
          >
            {selectTitle && (
              <Button
                variant="control"
                onClick={() =>
                  props.selectOpen?.((item: TSelection) => {
                    if (props.selectValue) {
                      const value = props.selectValue(item);
                      setValue(name, value as unknown as PathValue<TFieldValues, TFieldName>, {
                        shouldValidate: true,
                      });
                    }
                  }, props.selectTitle as string)
                }
                aria-label="Options menu"
                isDisabled={isSubmitting}
              >
                <SearchIcon />
              </Button>
            )}
          </FormGroupTextInput>
        );
      }}
      rules={{
        required:
          typeof label === 'string' && typeof isRequired === 'boolean'
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : isRequired,

        minLength:
          typeof label === 'string' && typeof minLength === 'number'
            ? {
                value: minLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} must be at least ${minLength} characters.`,
              }
            : minLength,

        maxLength:
          typeof label === 'string' && typeof maxLength === 'number'
            ? {
                value: maxLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} cannot be greater than ${maxLength} characters.`,
              }
            : maxLength,

        pattern: pattern,
        validate: validate,
      }}
    />
  );
}
