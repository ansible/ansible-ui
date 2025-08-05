import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useTranslation } from 'react-i18next';
import { LegacyApplicationsTable } from './LegacyApplicationsTable';

export function LegacyApplications() {
  const { t } = useTranslation();
  const docsLink = useGetDocsUrl(undefined, 'applications');
  return (
    <PageLayout>
      <PageHeader
        title={t('Legacy Applications')}
        description={t(
          'Create and configure token-based authentication for external applications.'
        )}
        titleHelpTitle={t('Legacy Applications')}
        titleHelp={t('Create and configure token-based authentication for external applications.')}
        titleDocLink={docsLink}
      />
      <LegacyApplicationsTable />
    </PageLayout>
  );
}
