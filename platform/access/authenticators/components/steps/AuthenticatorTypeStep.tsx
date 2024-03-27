import { useTranslation } from 'react-i18next';
import { TextContent, Text, TextVariants } from '@patternfly/react-core';
import { PageFormGrid, PageFormSelect } from '../../../../../framework';
import { getAuthenticatorTypeLabel } from '../../getAuthenticatorTypeLabel';
import type { AuthenticatorPlugins } from '../../../../interfaces/AuthenticatorPlugin';

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
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Authentication details')}</Text>
      </TextContent>
      <PageFormGrid isVertical>
        <PageFormSelect
          id="authentication-type-select"
          name="type"
          label={t('Authentication setting')}
          options={options}
          isRequired
        />
      </PageFormGrid>
    </>
  );
}
