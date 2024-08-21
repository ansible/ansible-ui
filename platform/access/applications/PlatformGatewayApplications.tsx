import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../framework';
import { PlatformApplicationsTable } from './PlatformApplicationsTable';

export function PlatformGatewayApplications() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('OAuth Applications')}
        description={t(
          'Create and configure token-based authentication for external applications.'
        )}
        titleHelpTitle={t('OAuth Applications')}
        titleHelp={t('Create and configure token-based authentication for external applications.')}
      />
      <PlatformApplicationsTable />
    </PageLayout>
  );
}
