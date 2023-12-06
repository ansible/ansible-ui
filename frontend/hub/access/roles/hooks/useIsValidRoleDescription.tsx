import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useIsValidRoleDescription() {
  const { t } = useTranslation();
  const isValidRoleDescription = useCallback(
    (roleName: string) => {
      if (roleName.length <= 2) {
        return t('This field must be longer than 2 characters');
      }
    },
    [t]
  );
  return isValidRoleDescription;
}
