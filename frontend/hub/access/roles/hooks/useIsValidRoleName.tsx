import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useIsValidRoleName() {
  const { t } = useTranslation();
  const isValidRoleName = useCallback(
    (roleName: string) => {
      if (!/^[ a-zA-Z0-9_.]+$/.test(roleName)) {
        return t('This field can only contain letters and numbers');
      } else if (roleName.length <= 2) {
        return t('This field must be longer than 2 characters');
      } else if (!roleName.startsWith('galaxy.')) {
        return t("This field must start with 'galaxy.'.");
      }
    },
    [t]
  );
  return isValidRoleName;
}
