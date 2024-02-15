import { useTranslation } from 'react-i18next';
import { TextContent, Text, TextVariants } from '@patternfly/react-core';
import { PageFormGrid, PageFormSelect } from '../../../../../framework';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';

export function AuthenticatorTypeStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();
  const authTypeNames: { [k: string]: string } = {
    local: t('Local'),
    ldap: t('LDAP'),
    saml: t('SAML'),
    keycloak: t('Keycloak'),
    github: t('GitHub'),
  };

  const options = props.plugins.authenticators.map((plugin) => {
    const shortType = plugin.type?.split('.').pop() || plugin.type;

    return {
      value: plugin.type,
      label: authTypeNames[shortType] || shortType,
    };
  });

  return (
    <>
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Authentication details')}</Text>
      </TextContent>
      <PageFormGrid isVertical>
        <PageFormSelect
          name="type"
          label={t('Authentication setting')}
          options={options}
          isRequired
        />
      </PageFormGrid>
    </>
  );
}
