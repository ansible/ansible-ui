import type { ChoiceOption } from '../../../common/MultipleChoiceField';
import type { Spec } from '../../../interfaces/Survey';

export const isMultiSelect = (type: string) => type === 'multiselect' || type === 'multiplechoice';

export function getFormattedChoices(question: Spec | undefined): ChoiceOption[] | undefined {
  if (!question || !isMultiSelect(question.type)) return undefined;

  const choices = Array.isArray(question.choices) ? question.choices : question.choices.split('\n');

  let defaults;
  if (Array.isArray(question.default)) {
    defaults = question.default;
  } else if (question.default) {
    defaults = question.default.toString().split('\n');
  } else {
    defaults = null;
  }

  return choices.map((c, i) => ({
    name: c,
    default: defaults?.includes(c) ?? false,
    id: i.toString(),
  }));
}

/** Options for min/max validation */
export interface ValidateMinMaxOptions {
  minRaw: number | null | undefined;
  maxRaw: number | null | undefined;
  isLengthType: boolean;
}

/** Validates the minimum value field in a survey question */
export function validateMin(
  options: ValidateMinMaxOptions,
  t: (key: string) => string
): string | undefined {
  const { minRaw, maxRaw, isLengthType } = options;
  const min = Number(minRaw);
  const max = Number(maxRaw);

  if (minRaw === null || minRaw === undefined) {
    return isLengthType
      ? t('Minimum length must be a valid number.')
      : t('Minimum must be a valid number.');
  }
  if (min > max) {
    return isLengthType
      ? t('Minimum length must be less than or equal to maximum length.')
      : t('Minimum must be less than or equal to maximum.');
  }
  return undefined;
}

/** Validates the maximum value field in a survey question */
export function validateMax(
  options: ValidateMinMaxOptions,
  t: (key: string) => string
): string | undefined {
  const { minRaw, maxRaw, isLengthType } = options;
  const min = Number(minRaw);
  const max = Number(maxRaw);

  if (maxRaw === null || maxRaw === undefined) {
    return isLengthType
      ? t('Maximum length must be a valid number.')
      : t('Maximum must be a valid number.');
  }
  if (max < min) {
    return isLengthType
      ? t('Maximum length must be greater than or equal to minimum length.')
      : t('Maximum must be greater than or equal to minimum.');
  }
  return undefined;
}

/** Determines if the answer type uses length-based validation */
export function isLengthType(answerType: string): boolean {
  return ['text', 'textarea', 'password'].includes(answerType);
}
