import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutomationDashboardCollectionStatus } from './common/useAutomationDashboardCollectionStatus';
import { useDashboardGridColumns } from './common/useDashboardGridColumns';
import { PageDashboardContext, PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';

export function AutomationDashboardMainPage() {
  const { t } = useTranslation();
  const { isLoading } = useAutomationDashboardCollectionStatus();
  // Measured once here, in the shell that stays mounted across tab switches, and handed to
  // the tab content via PageDashboardContext — so changing tabs never re-measures or flashes.
  const { ref: gridProbeRef, gridColumns } = useDashboardGridColumns();
  const dashboardContextValue = useMemo(() => ({ columns: gridColumns }), [gridColumns]);
  const description = t(
    'Discover the significant cost and time savings achieved by automating Ansible jobs with the Ansible Automation Platform. Explore how automation reduces manual effort, enhances efficiency, and optimizes IT operations across your organization.'
  );
  const tabs = [
    {
      label: t('Dashboard'),
      page: AwxRoute.AutomationDashboard,
    },
    {
      label: t('Leaderboards'),
      page: AwxRoute.AutomationLeaderboards,
    },
  ];

  return (
    <PageLayout>
      <div ref={gridProbeRef} aria-hidden="true" style={{ height: 0, overflow: 'hidden' }} />
      {!isLoading && (
        <PageHeader
          title={t('Automation Dashboard')}
          titleHelpTitle={t('Automation Dashboard')}
          titleHelp={description}
          description={description}
        />
      )}
      {isLoading ? (
        <LoadingState />
      ) : (
        <PageDashboardContext.Provider value={dashboardContextValue}>
          <PageRoutedTabs tabs={tabs} />
        </PageDashboardContext.Provider>
      )}
    </PageLayout>
  );
}
