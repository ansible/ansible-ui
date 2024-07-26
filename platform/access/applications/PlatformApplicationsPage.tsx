/* eslint-disable i18next/no-literal-string */
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../framework';
import { PageRoutedTabs } from '../../../frontend/common/PageRoutedTabs';
import { AwxRoute } from '../../../frontend/awx/main/AwxRoutes';
import { PlatformRoute } from '../../main/PlatformRoutes';

export function PlatformApplicationsPage() {
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
      <PageRoutedTabs
        tabs={[
          { label: t('Ansible Automation Platform'), page: PlatformRoute.Applications },
          { label: t('Automation Execution'), page: AwxRoute.Applications },
        ].filter((tab) => !!tab.page)}
      />
    </PageLayout>
  );
}
