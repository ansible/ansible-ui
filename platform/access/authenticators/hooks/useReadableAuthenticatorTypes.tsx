import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuthenticatorTypeLabel } from '../getAuthenticatorTypeLabel';
import { Authenticator } from '../../../interfaces/Authenticator';

export function useReadableAuthenticatorTypes(authenticators?: Authenticator[]) {
  const { t } = useTranslation();
  return useMemo<string[]>(() => {
    if (authenticators?.length) {
      return authenticators.map((authenticator) =>
        getAuthenticatorTypeLabel(authenticator.type, t)
      );
    }
    return [];
  }, [authenticators, t]);
}
