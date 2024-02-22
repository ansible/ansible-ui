import { t } from 'i18next';
import { capitalizeFirstLetter } from '../../utils/strings';

export function useRequiredValidationRule(label: string, isRequired?: boolean) {
  return typeof label === 'string' && isRequired === true
    ? {
        value: true,
        message: t('{{label}} is required.', {
          label: capitalizeFirstLetter(label.toLocaleLowerCase()),
        }),
      }
    : undefined;
}
