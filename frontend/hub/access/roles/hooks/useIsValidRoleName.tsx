import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useIsValidRoleName() {
  const { t } = useTranslation();
  const isValidRoleName = useCallback(
    (roleName: string) => {
      if (!/^[ a-zA-Z0-9_.]+$/.test(roleName)) {
        return t('Name can only contain letters and numbers.');
      } else if (roleName.length <= 2) {
        return t('Name must be longer than 2 characters.');
      } else if (!roleName.startsWith('galaxy.')) {
        return t("Name must start with 'galaxy.'.");
      }
    },
    [t]
  );
  return isValidRoleName;
}
