import { PageFormSelect } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';
import { getAuthenticatorTypeLabel } from '../../getAuthenticatorTypeLabel';

export function AuthenticatorTypeStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();

  // Users cannot create new authenticators using legacy plugins, but can modify those created by the system.
  const excludedPlugins = [
    'aap_gateway_api.authentication.authenticator_plugins.legacy_sso',
    'aap_gateway_api.authentication.authenticator_plugins.legacy_password',
    'aap_gateway_api.authentication.authenticator_plugins.legacy_external_password',
  ];

  const options = props.plugins.authenticators
    .filter((plugin) => !excludedPlugins.includes(plugin.type))
    .map((plugin) => ({
      value: plugin.type,
      label: getAuthenticatorTypeLabel(plugin.type, t),
    }));

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h2}>{t('Authentication type')}</Text>
      </TextContent>
      <PageFormSection>
        <PageFormSelect
          id="authentication-type-select"
          name="type"
          label={t('Authentication type')}
          options={options}
          isRequired
        />
      </PageFormSection>
    </>
  );
}
