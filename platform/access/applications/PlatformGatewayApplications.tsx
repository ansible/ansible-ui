import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useGetDocsUrl } from '@ansible/awx-ui/common/util/useGetDocsUrl';
import { useTranslation } from 'react-i18next';
import { PlatformApplicationsTable } from './PlatformApplicationsTable';

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
