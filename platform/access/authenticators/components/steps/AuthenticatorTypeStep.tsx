import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSelect } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';
import { getAuthenticatorTypeLabel } from '../../getAuthenticatorTypeLabel';

export function AuthenticatorTypeStep(props: { plugins: AuthenticatorPlugins }) {
  const { t } = useTranslation();

  const options = props.plugins.authenticators.map((plugin) => {
    return {
      value: plugin.type,
      label: getAuthenticatorTypeLabel(plugin.type, t),
    };
  });

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
