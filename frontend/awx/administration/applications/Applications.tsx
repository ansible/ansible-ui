import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';
import { PageNotImplemented } from '../../../common/PageNotImplemented';

export function Applications() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Applications')}
        description={t(
          'Create and configure token-based authentication for external applications.'
        )}
        titleHelpTitle={t('Applications')}
        titleHelp={t('Create and configure token-based authentication for external applications.')}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/notifications.html`}
      />
      <PageNotImplemented />
    </PageLayout>
  );
}
