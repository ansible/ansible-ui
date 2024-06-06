import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useInventoryTypes() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      '': t('Inventory'),
      smart: t('Smart inventory'),
      constructed: t('Constructed inventory'),
    }),
    [t]
  );
}
