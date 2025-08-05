import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useTranslation } from 'react-i18next';
import { OAuthApplicationsTable } from './OAuthApplicationsTable';

export function OAuthGatewayApplications() {
  const { t } = useTranslation();
  const docsLink = useGetDocsUrl(undefined, 'applications');
  return (
    <PageLayout>
      <PageHeader
        title={t('OAuth Applications')}
        description={t(
          'Create and configure token-based authentication for external applications.'
        )}
        titleHelpTitle={t('OAuth Applications')}
        titleHelp={t('Create and configure token-based authentication for external applications.')}
        titleDocLink={docsLink}
      />
      <OAuthApplicationsTable />
    </PageLayout>
  );
}
