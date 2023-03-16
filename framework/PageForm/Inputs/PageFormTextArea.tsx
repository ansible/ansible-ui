import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
  Validate,
  ValidationRule,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { FormGroupTextArea, FormGroupTextAreaProps } from './FormGroupTextArea';

export type PageFormTextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  minLength?: number | ValidationRule<number>;
  maxLength?: number | ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
} & Omit<FormGroupTextAreaProps, 'onChange' | 'value'>;

/** PatternFly TextArea wrapper for use with react-hook-form */
export function PageFormTextArea<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormTextAreaProps<TFieldValues, TFieldName>) {
  const { name, label, isReadOnly, isRequired, minLength, maxLength, pattern, validate } = props;
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();
  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupTextArea
          {...props}
          id={props.id ?? name}
          value={value as string}
          onChange={onChange}
          helperTextInvalid={error?.message}
          isReadOnly={isReadOnly || isSubmitting}
          minLength={undefined}
          maxLength={undefined}
        />
      )}
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
