import { useTranslation } from 'react-i18next';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  DashboardChartCard,
  DashboardMainTableCard,
  DashboardValueCard,
  useAutomationDashboardToolbar,
} from './components';

import { useAutomationDashboardView } from './views/useAutomationDashboardView';
import { DashboardToolbar } from './components/DashboardToolbar';
import { DashboardGridRow, DashboardLayout } from './components/DashboardLayout';

/** Breakpoint range (in grid columns) where value cards switch from 'md' to 'xs' size. */
const WIDE_LAYOUT_MIN_COLUMNS = 16;
const WIDE_LAYOUT_MAX_COLUMNS = 31;

export function AutomationDashboard() {
  const { t } = useTranslation();
  const toolbarFilters = useAutomationDashboardToolbar();
  const getPageUrl = useGetPageUrl();

  const view = useAutomationDashboardView({ toolbarFilters });
  const { details } = view;

  const noDataString = t('No jobs have been run.');

  const renderDashboardContent = (gridColumns: number) => {
    const isWideLayout =
      WIDE_LAYOUT_MIN_COLUMNS <= gridColumns && gridColumns <= WIDE_LAYOUT_MAX_COLUMNS;
    const valueCardWidth = isWideLayout ? 'xs' : ('md' as const);

    return (
      <>
        <DashboardGridRow>
          <DashboardValueCard
            id="successful-jobs-card"
            title={t('Successful jobs')}
            help={t(
              'Number of job runs that completed without error in the selected period. Use the ratio between successful and failed jobs to track automation health and reliability over time.'
            )}
            linkText={t('See all successful jobs')}
            to={getPageUrl(AwxRoute.Jobs) + '?status=successful'}
            value={details?.total_number_of_successful_jobs ?? noDataString}
            error={view.detailsError}
            errorStateTitle={t('Error loading successful jobs')}
            width={valueCardWidth}
          ></DashboardValueCard>
          <DashboardValueCard
            id="failed-jobs-card"
            title={t('Failed jobs')}
            help={t(
              'Number of job runs that ended in failure in the selected period. Review failed jobs to fix playbooks, credentials, or inventory issues and improve success rates.'
            )}
            linkText={t('See all failed jobs')}
            to={getPageUrl(AwxRoute.Jobs) + '?status=failed'}
            value={details?.total_number_of_failed_jobs ?? noDataString}
            error={view.detailsError}
            errorStateTitle={t('Error loading failed jobs')}
            width={valueCardWidth}
          ></DashboardValueCard>
          <DashboardValueCard
            id="unique-hosts-card"
            title={t('Hosts automated')}
            help={t(
              'Number of hosts that executed at least one automation job in the selected period. Indicates how much of your inventory is actively automated and can help with license or capacity planning.'
            )}
            value={details?.total_number_of_unique_hosts ?? noDataString}
            error={view.detailsError}
            errorStateTitle={t('Error loading unique hosts')}
            width={valueCardWidth}
          ></DashboardValueCard>
          <DashboardValueCard
            id="automation-hours-card"
            title={t('Hours of automation')}
            help={t(
              'Sum of all job runtimes in the selected period. Reflects total automation workload and can inform capacity planning and resource allocation.'
            )}
            value={details?.total_hours_of_automation ?? noDataString}
            valueSuffix={details?.total_hours_of_automation ? 'h' : undefined}
            error={view.detailsError}
            errorStateTitle={t('Error loading hours of automation')}
            width={valueCardWidth}
          ></DashboardValueCard>
        </DashboardGridRow>
        <DashboardGridRow>
          <DashboardChartCard
            id="host-chart-card"
            title={t('Number of hosts jobs are running on')}
            help={t(
              'Number of hosts that ran at least one job in the selected period. Complements run count by showing how broadly automation is applied across your inventory.'
            )}
            summaryValue={details?.total_number_of_host_job_runs ?? 0}
            data={details?.host_chart ?? { kind: 'day', items: [] }}
            variant={'lineChart'}
            error={view.detailsError}
            errorStateTitle={t('Error loading host chart')}
            legendLabel={t('Hosts')}
          ></DashboardChartCard>
          <DashboardChartCard
            id="job-chart-card"
            title={t('Number of times jobs were run')}
            help={t(
              'Total number of job executions in the selected period, regardless of success or failure. Use this to understand automation volume, trends, and adoption over time.'
            )}
            variant={'barChart'}
            summaryValue={details?.total_number_of_job_runs ?? 0}
            data={details?.job_chart ?? { kind: 'day', items: [] }}
            errorStateTitle={t('Error loading job chart')}
            error={view.detailsError}
            legendLabel={t('Job runs')}
          ></DashboardChartCard>
        </DashboardGridRow>
        <DashboardGridRow>
          <DashboardMainTableCard
            {...view}
            toolbarFilters={toolbarFilters}
            topCardsWidth={valueCardWidth}
          />
        </DashboardGridRow>
      </>
    );
  };

  return (
    <>
      <DashboardToolbar
        toolbarFilters={toolbarFilters}
        {...view.mainTableView}
        keyFn={(item) => item.id}
        registerClearCallback={view.registerClearCallback}
      />
      <DashboardLayout>{renderDashboardContent}</DashboardLayout>
    </>
  );
}
