import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Authenticator } from '../../../interfaces/Authenticator';

export function useReadableAuthenticatorTypes(authenticators?: Authenticator[]) {
  const { t } = useTranslation();
  const typeLabels = useMemo<{ [k: string]: string }>(
    () => ({
      'ansible_base.authentication.authenticator_plugins.github': t('GitHub'),
      'ansible_base.authentication.authenticator_plugins.keycloak': t('Keycloak'),
      'ansible_base.authentication.authenticator_plugins.ldap': t('LDAP'),
      'ansible_base.authentication.authenticator_plugins.local': t('Local'),
      'ansible_base.authentication.authenticator_plugins.saml': t('SAML'),
    }),
    [t]
  );
  return useMemo<string[]>(() => {
    if (authenticators?.length) {
      return authenticators.map((authenticator) =>
        typeLabels[authenticator.type] ? typeLabels[authenticator.type] : authenticator.type
      );
    }
    return [];
  }, [authenticators, typeLabels]);
}
