import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
} from '../../../../framework';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';
import { PageNotImplemented } from '../../../common/PageNotImplemented';

export function CredentialTypes() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Credential Types')}
        description={t(
          'Define custom credential types to support authentication with other systems during automation.'
        )}
        titleHelpTitle={t('Credential Types')}
        titleHelp={t(
          'Define custom credential types to support authentication with other systems during automation.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/credential_types.html`}
      />
      <PageNotImplemented />
    </PageLayout>
  );
}