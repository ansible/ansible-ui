import { ControllerProps, FieldPath, FieldValues, ValidationRule } from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/strings';

type TextInputRules<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
> = NonNullable<ControllerProps<TFieldValues, TFieldName>['rules']>;

export function createTextInputRules<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(params: {
  label?: string;
  required: TextInputRules<TFieldValues, TFieldName>['required'];
  validate: TextInputRules<TFieldValues, TFieldName>['validate'];
  minLength?: number | ValidationRule<number>;
  maxLength?: number | ValidationRule<number>;
  min?: number | string;
  max?: number | string;
  pattern?: ValidationRule<RegExp>;
}): TextInputRules<TFieldValues, TFieldName> {
  const { label, required, validate, minLength, maxLength, min, max, pattern } = params;
  return {
    required,
    validate,
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
    min:
      typeof label === 'string' && (typeof min === 'number' || typeof min === 'string')
        ? {
            value: min,
            message: `${capitalizeFirstLetter(
              label.toLocaleLowerCase()
            )} must be greater or equal to ${min}.`,
          }
        : min,
    max:
      typeof label === 'string' && (typeof max === 'number' || typeof max === 'string')
        ? {
            value: max,
            message: `${capitalizeFirstLetter(
              label.toLocaleLowerCase()
            )} cannot be greater than ${max}.`,
          }
        : max,
    pattern,
  };
}
