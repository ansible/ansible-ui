import { useTranslation } from 'react-i18next';
import { PageFormGrid, PageFormSelect } from '../../../../../framework';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';

export function AuthenticatorTypeStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();
  const authTypeNames = {
    'ansible_base.authenticator_plugins.local': t('Local'),
    'ansible_base.authenticator_plugins.ldap': t('LDAP'),
    'ansible_base.authenticator_plugins.saml': t('SAML'),
    'ansible_base.authenticator_plugins.keycloak': t('Keycloak'),
  };

  const options = props.plugins.authenticators.map((plugin) => ({
    value: plugin.type,
    label: authTypeNames[plugin.type] || plugin.type,
  }));

  return (
    <PageFormGrid isVertical>
      <PageFormSelect
        name="type"
        label={t('Authentication setting')}
        options={options}
        isRequired
      />
    </PageFormGrid>
  );
}
