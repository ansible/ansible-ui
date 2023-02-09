import { ReactElement } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
  Validate,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { Label } from '../../../frontend/awx/interfaces/Label';
import { FormGroupTypeAheadMultiSelect } from './FormGroupTypeAheadMultiSelect';

export type PageFormSelectOptionProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  id?: string;
  options: { value: string | Label; label: string }[];
  isRequired?: boolean;
  label: string;
  additionalControls?: ReactElement;
  placeholderText?: string;
  labelHelp?: string;
  labelHelpTitle?: string;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
};

/**  Select wrapper for use with react-hook-form */
export function PageFormCreatableSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormSelectOptionProps<TFieldValues, TFieldName>) {
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
          onHandleClear={(chip?: string) => {
            const values: { name: string }[] = getValues(props.name);
            onChange(!chip ? [] : values.filter((v: { name: string }) => v.name !== chip));
          }}
          onHandleSelection={(v) => {
            const values: string[] = getValues(props.name);

            if (values) {
              return onChange([...values, v]);
            }
            return onChange([v]);
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
