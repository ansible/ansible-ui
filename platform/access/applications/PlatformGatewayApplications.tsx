import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../framework';
import { PlatformApplicationsTable } from './PlatformApplicationsTable';
import { useGetDocsUrl } from '../../../frontend/awx/common/util/useGetDocsUrl';

export function PlatformGatewayApplications() {
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
      <PlatformApplicationsTable />
    </PageLayout>
  );
}
