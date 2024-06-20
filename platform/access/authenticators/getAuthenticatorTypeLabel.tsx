import { TFunction } from 'i18next';

export function getAuthenticatorTypeLabel(type: string, t: TFunction<'translation'>) {
  const labels: { [k: string]: string } = {
    github: t('GitHub'),
    github_enterprise: t('GitHub enterprise'),
    github_enterprise_org: t('GitHub enterprise organization'),
    github_enterprise_team: t('GitHub enterprise team'),
    github_org: t('GitHub organization'),
    github_team: t('GitHub team'),
    google_oauth2: t('Google OAuth'),
    keycloak: t('Keycloak'),
    local: t('Local'),
    ldap: t('LDAP'),
    oidc: t('Generic OIDC'),
    radius: t('Radius'),
    saml: t('SAML'),
    tacacs: t('TACACS+'),
  };

  const shortType = type?.split('.').pop() || type;

  return labels[shortType] || format(shortType);
}

function format(string: string) {
  return (string.charAt(0).toUpperCase() + string.slice(1)).replace(/_/g, ' ');
}
