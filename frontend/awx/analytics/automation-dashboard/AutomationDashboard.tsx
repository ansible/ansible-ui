import { useTranslation } from 'react-i18next';
import {
  PageDashboard,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { Button } from '@patternfly/react-core';
import { useState } from 'react';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  DashboardChartCard,
  DashboardMainTableCard,
  DashboardTableCard,
  DashboardValueCard,
  useAutomationDashboardToolbar,
} from './components';

import { useAutomationDashboardView } from './views/useAutomationDashboardView';
import { DashboardToolbar } from './components/DashboardToolbar';

export function AutomationDashboard() {
  const { t } = useTranslation();
  const toolbarFilters = useAutomationDashboardToolbar();
  const getPageUrl = useGetPageUrl();

  const description = t(
    'Discover the significant cost and time savings achieved by automating Ansible jobs with the Ansible Automation Platform. Explore how automation reduces manual effort, enhances efficiency, and optimizes IT operations across your organization.'
  );

  const view = useAutomationDashboardView({ toolbarFilters });
  const { details, exportPdf, loading } = view;
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportPdf();
    } finally {
      setExporting(false);
    }
  };

  const noDataString = t('No jobs have been run.');

  return (
    <PageLayout>
      <PageHeader
        title={t('Automation Dashboard')}
        titleHelpTitle={t('Automation Dashboard')}
        titleHelp={description}
        description={description}
        controls={
          <Button
            data-testid="save-as-pdf-button"
            // TODO: Remove `|| true` once PDF export is implemented on the BE.
            isDisabled={loading || exporting || !view?.mainTableView?.itemCount || true}
            variant="secondary"
            onClick={() => void handleExportPdf()}
          >
            {t('Save as PDF')}
          </Button>
        }
      />
      <DashboardToolbar toolbarFilters={toolbarFilters} {...view.mainTableView} />
      <PageDashboard>
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
        ></DashboardValueCard>
        <DashboardValueCard
          id="automation-hours-card"
          title={t('Hours of automation')}
          help={t(
            'Sum of all job runtimes in the selected period. Reflects total automation workload and can inform capacity planning and resource allocation.'
          )}
          value={details?.total_hours_of_automation ?? noDataString}
          valueSuffix="h"
          error={view.detailsError}
          errorStateTitle={t('Error loading hours of automation')}
        ></DashboardValueCard>

        <DashboardTableCard
          id="top-projects-card"
          title={t('Top 5 projects')}
          help={t(
            'Projects ranked by total job count in the selected period. Helps identify which projects are driving the most automation activity.'
          )}
          firstColumnHeader={t('Project name')}
          errorStateTitle={t('Error loading projects')}
          items={details?.top_projects ?? []}
          error={view.detailsError}
          loading={view.detailsLoading}
          clearAllFilters={view.mainTableView.clearAllFilters}
          filterState={view.mainTableView.filterState}
        ></DashboardTableCard>
        <DashboardTableCard
          id="top-users-card"
          title={t('Top 5 users')}
          help={t(
            'Users ranked by automation runs they triggered or that ran in their context in the selected period. Shows individual adoption and activity.'
          )}
          firstColumnHeader={t('User name')}
          errorStateTitle={t('Error loading users')}
          items={details?.top_users ?? []}
          error={view.detailsError}
          loading={view.detailsLoading}
          clearAllFilters={view.mainTableView.clearAllFilters}
          filterState={view.mainTableView.filterState}
        ></DashboardTableCard>
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
        ></DashboardChartCard>
        <DashboardMainTableCard {...view}></DashboardMainTableCard>
      </PageDashboard>
    </PageLayout>
  );
}
