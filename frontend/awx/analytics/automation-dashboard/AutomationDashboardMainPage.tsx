import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutomationDashboardCollectionStatus } from './common/useAutomationDashboardCollectionStatus';
import { useDashboardGridColumns } from './common/useDashboardGridColumns';
import { PageDashboardContext, PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { EmptyStateError } from '@ansible/ansible-ui-framework/components/EmptyStateError';
import { EmptyStateUnauthorized } from '@ansible/ansible-ui-framework/components/EmptyStateUnauthorized';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { AutomationLeaderboards } from './AutomationLeaderboards';
import { AutomationDashboard } from './AutomationDashboard';
import { Divider } from '@patternfly/react-core';

export function AutomationDashboardMainPage() {
  const { t } = useTranslation();
  const { isLoading, error, canSeeDashboard, canSeeLeaderboard } =
    useAutomationDashboardCollectionStatus();
  // Measured once here, in the shell that stays mounted across tab switches, and handed to
  // the tab content via PageDashboardContext — so changing tabs never re-measures or flashes.
  const { ref: gridProbeRef, gridColumns } = useDashboardGridColumns();
  const dashboardContextValue = useMemo(() => ({ columns: gridColumns }), [gridColumns]);
  const description = t(
    'View automation performance, goals, and cost savings for your organization.'
  );

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
          <AutomationDashboardMainPageContent
            canSeeDashboard={canSeeDashboard}
            canSeeLeaderboard={canSeeLeaderboard}
            hasError={!!error}
          />
        </PageDashboardContext.Provider>
      )}
    </PageLayout>
  );
}

function AutomationDashboardMainPageContent(
  props: Readonly<{ canSeeDashboard: boolean; canSeeLeaderboard: boolean; hasError: boolean }>
) {
  const { canSeeDashboard, canSeeLeaderboard, hasError } = props;
  const { t } = useTranslation();

  if (hasError) {
    return <EmptyStateError />;
  }
  if (canSeeDashboard && canSeeLeaderboard) {
    return (
      <PageRoutedTabs
        tabs={[
          { label: t('Dashboard'), page: AwxRoute.AutomationDashboard },
          { label: t('Leaderboards'), page: AwxRoute.AutomationLeaderboards },
        ]}
      />
    );
  }
  if (canSeeDashboard) {
    return (
      <>
        <Divider style={{ marginBlockEnd: 'var(--pf-t--global--spacer--md)' }} />
        <AutomationDashboard />
      </>
    );
  }
  if (canSeeLeaderboard) {
    return (
      <>
        {/* No spacing here: DashboardLayout inside AutomationLeaderboards already adds the top margin */}
        <Divider />
        <AutomationLeaderboards />
      </>
    );
  }
  return (
    <EmptyStateUnauthorized
      title={t('You do not have permission to view the Automation Dashboard or Leaderboards.')}
    />
  );
}
