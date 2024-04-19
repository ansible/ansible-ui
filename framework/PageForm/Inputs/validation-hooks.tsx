import { t } from 'i18next';
import { capitalizeFirstLetter } from '../../utils/strings';

export function useRequiredValidationRule(label?: string, isRequired?: boolean) {
  return typeof label === 'string' && isRequired === true
    ? {
        value: true,
        message: t('{{label}} is required.', {
          label: fixSpecialCases(capitalizeFirstLetter(label.toLocaleLowerCase())),
        }),
      }
    : undefined;
}

function fixSpecialCases(label: string) {
  const names = ['Red Hat'];
  for (const name of names) {
    label = label.replace(capitalizeFirstLetter(name.toLocaleLowerCase()), name);
  }
  return label;
}
