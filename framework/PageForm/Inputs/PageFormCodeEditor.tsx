import { CSSProperties } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext, Validate } from 'react-hook-form';
import { FormGroupTextInputProps } from '../..';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { PageCodeEditor } from './PageCodeEditor';
import './PageFormCodeEditor.css';
import { PageFormGroup } from './PageFormGroup';

export type PageFormTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  style?: CSSProperties;
  lines?: number;
} & Omit<FormGroupTextInputProps, 'onChange' | 'value'>;

/** PatternFly TextInput wrapper for use with react-hook-form */
export function PageFormCodeEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormTextInputProps<TFieldValues, TFieldName>) {
  const { isReadOnly, validate, ...formGroupInputProps } = props;
  const { label, name, isRequired } = props;
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

  const id = props.id ?? name.split('.').join('-');

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <PageFormGroup
            {...formGroupInputProps}
            id={id}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            <PageCodeEditor
              id={id}
              // aria-describedby={id ? `${id}-form-group` : undefined}
              value={value as unknown as string}
              onChange={onChange}
              isReadOnly={isReadOnly || isSubmitting}
              style={{ ...props.style, height: props.lines ? `${props.lines}rem` : '20rem' }}
              className="pf-c-form-control"
              invalid={!(validate && isValidating) && error?.message !== undefined}
            />
          </PageFormGroup>
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
      }}
    />
  );
}
