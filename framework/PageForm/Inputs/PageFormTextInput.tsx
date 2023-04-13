import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { ReactElement } from 'react';
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
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
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
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  selectTitle?: string;
  selectValue?: (selection: TSelection) => FieldPathValue<TSelection, FieldPath<TSelection>>;
  selectOpen?: (callback: (selection: TSelection) => void, title: string) => void;
  button?: ReactElement;
} & Omit<FormGroupTextInputProps, 'onChange' | 'value'>;

/** PatternFly TextInput wrapper for use with react-hook-form */
export function PageFormTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues
>(props: PageFormTextInputProps<TFieldValues, TFieldName, TSelection>) {
  const {
    name,
    isReadOnly,
    isRequired,
    minLength,
    maxLength,
    pattern,
    validate,
    selectTitle,
    button,
    id,
    selectOpen,
    selectValue,
    ...rest
  } = props;
  const { label } = props;
  const {
    control,
    setValue,
    trigger,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const [translations] = useFrameworkTranslations();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value, name }, fieldState: { error } }) => {
        return (
          <FormGroupTextInput
            {...rest}
            onBlur={() => trigger(name) as unknown as () => void}
            isRequired={isRequired}
            id={id ?? name.split('.').join('-')}
            value={value}
            onChange={onChange}
            helperTextInvalid={
              error?.message
                ? validate && isValidating
                  ? translations.validating
                  : error?.message
                : undefined
            }
            isReadOnly={isReadOnly || isSubmitting}
            minLength={undefined}
            maxLength={undefined}
          >
            {selectTitle && (
              <Button
                ouiaId={`lookup-${name}-button`}
                variant="control"
                onClick={() =>
                  selectOpen?.((item: TSelection) => {
                    if (selectValue) {
                      const value = selectValue(item);
                      setValue(name, value as unknown as PathValue<TFieldValues, TFieldName>, {
                        shouldValidate: true,
                      });
                    }
                  }, selectTitle)
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
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,

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
