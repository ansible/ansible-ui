import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useIsValidUrl() {
  const { t } = useTranslation();
  const isValidUrl = useCallback(
    (url: string) => {
      let valid = true;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          valid = false;
        }
        if (!parsed.host) {
          valid = false;
        }
        if (!valid) return parsed.protocol;
      } catch {
        valid = false;
      }
      if (!valid) return t('Must be a valid URL.');
    },
    [t]
  );
  return isValidUrl;
}
