import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Authenticator } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { getAuthenticatorTypeLabel } from '../getAuthenticatorTypeLabel';

export function useReadableAuthenticatorTypes(authenticators?: Authenticator[]) {
  const { t } = useTranslation();
  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);
  return useMemo<string[]>(() => {
    if (authenticators?.length) {
      return authenticators.map((authenticator) =>
        getAuthenticatorTypeLabel(authenticator.type, t, plugins?.authenticators)
      );
    }
    return [];
  }, [authenticators, plugins?.authenticators, t]);
}
