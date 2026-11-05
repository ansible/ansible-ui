import { TFunction } from 'i18next';

export interface INumberInputLimits {
  min?: number;
  max?: number;
  isInteger?: boolean;
}

/**
 * Validation message for a numeric dashboard input, or undefined when the value is valid.
 * Shared by the inline table/toolbar inputs and the "Set template values" dialog.
 */
export function getNumberInputError(
  value: unknown,
  limits: INumberInputLimits,
  t: TFunction
): string | undefined {
  const numberValue = Number(value);
  if (value === '' || value === null || value === undefined || Number.isNaN(numberValue)) {
    return t('Please enter a valid number.');
  }
  if (limits.isInteger && !Number.isInteger(numberValue)) {
    return t('Please enter a valid integer.');
  }
  if (limits.max !== undefined && numberValue > limits.max) {
    return t('Value must be less than or equal to {{max}}.', { max: limits.max });
  }
  if (limits.min !== undefined && numberValue < limits.min) {
    return t('Value must be greater than or equal to {{min}}.', { min: limits.min });
  }
  return undefined;
}
