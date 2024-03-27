import { TFunction } from 'i18next';

export function getAuthenticatorTypeLabel(type: string, t: TFunction<'translation'>) {
  const labels: { [k: string]: string } = {
    local: t('Local'),
    ldap: t('LDAP'),
    saml: t('SAML'),
    keycloak: t('Keycloak'),
    github: t('GitHub'),
  };

  const shortType = type?.split('.').pop() || type;

  return labels[shortType] || shortType;
}
