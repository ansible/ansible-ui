import { useTranslation } from 'react-i18next';
import {
  IFilterState,
  PageDashboard,
  PageHeader,
  PageLayout,
  PageToolbar,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { Button } from '@patternfly/react-core';
import { getItemKey } from '../../../common/crud/Data';
import { useState } from 'react';
import { AutomationDashboardDateRangeFilterPresets } from './constants';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  DashboardChartCard,
  DashboardMainTableCard,
  DashboardTableCard,
  DashboardValueCard,
  useAutomationDashboardToolbar,
} from './components';
import { DashboardTableItem } from './interfaces';
import { DashboardChartValueProps } from './types';

export function AutomationDashboard() {
  const { t } = useTranslation();
  const toolbarFilters = useAutomationDashboardToolbar();
  const [filterState, setFilterState] = useState<IFilterState>({
    period: [AutomationDashboardDateRangeFilterPresets.monthToDate],
  });
  const getPageUrl = useGetPageUrl();

  const description = t(
    'Discover the significant cost and time savings achieved by automating Ansible jobs with the Ansible Automation Platform. Explore how automation reduces manual effort, enhances efficiency, and optimizes IT operations across your organization.'
  );

  const downloadPdf = () => {};

  /* Sample data for top projects */
  const topProjects: DashboardTableItem[] = [
    { name: 'Project Alpha', value: 1000 },
    { name: 'Project Beta', value: 800 },
    { name: 'Project Gamma', value: 600 },
    { name: 'Project Delta', value: 400 },
    { name: 'Project Epsilon', value: 200 },
  ];

  /* Sample data for chart values */
  const chartValues: DashboardChartValueProps[] = [];
  /** Generating dummy data for the chart */
  for (let i = 0; i < 12; i++) {
    chartValues.push({
      label: `2025-${(i + 1).toString().padStart(2, '0')}`,
      value: Math.floor(Math.random() * 100) + 1,
    });
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Automation Dashboard')}
        titleHelpTitle={t('Automation Dashboard')}
        titleHelp={description}
        description={description}
        controls={
          <Button variant="secondary" onClick={downloadPdf}>
            {t('Save as PDF')}
          </Button>
        }
      />
      <PageToolbar
        keyFn={getItemKey}
        itemCount={0}
        toolbarFilters={toolbarFilters}
        setFilterState={setFilterState}
        filterState={filterState}
        disableCardView
        disableListView
        disableTableView
      />
      <PageDashboard>
        <DashboardValueCard
          id="successful-jobs-card"
          title={t('Successful jobs')}
          help={t(
            'Number of job runs that completed without error in the selected period. Use the ratio between successful and failed jobs to track automation health and reliability over time.'
          )}
          linkText={t('See all successful jobs in AAP')}
          to={getPageUrl(AwxRoute.Jobs) + '?status=successful'}
          value={15}
        ></DashboardValueCard>
        <DashboardValueCard
          id="failed-jobs-card"
          title={t('Failed jobs')}
          help={t(
            'Number of job runs that ended in failure in the selected period. Review failed jobs to fix playbooks, credentials, or inventory issues and improve success rates.'
          )}
          linkText={t('See all failed jobs in AAP')}
          to={getPageUrl(AwxRoute.Jobs) + '?status=failed'}
          value={5}
        ></DashboardValueCard>
        <DashboardValueCard
          id="unique-hosts-card"
          title={t('Hosts automated')}
          help={t(
            'Number of hosts that executed at least one automation job in the selected period. Indicates how much of your inventory is actively automated and can help with license or capacity planning.'
          )}
          value={2}
        ></DashboardValueCard>
        <DashboardValueCard
          id="automation-hours-card"
          title={t('Hours of automation')}
          help={t(
            'Sum of all job runtimes in the selected period. Reflects total automation workload and can inform capacity planning and resource allocation.'
          )}
          value={2}
          valueSuffix="h"
        ></DashboardValueCard>
        <DashboardTableCard
          id="top-projects-card"
          title={t('Top 5 projects')}
          help={t(
            'Projects ranked by total job count in the selected period. Helps identify which projects are driving the most automation activity.'
          )}
          firstColumnHeader={t('Project name')}
          emptyStateTitle={t('No projects')}
          errorStateTitle={t('Error loading projects')}
          items={topProjects}
        ></DashboardTableCard>
        <DashboardTableCard
          id="top-users-card"
          title={t('Top 5 users')}
          help={t(
            'Users ranked by automation runs they triggered or that ran in their context in the selected period. Shows individual adoption and activity.'
          )}
          firstColumnHeader={t('User name')}
          emptyStateTitle={t('No users')}
          errorStateTitle={t('Error loading users')}
          items={[]}
        ></DashboardTableCard>
        <DashboardChartCard
          id="host-chart-card"
          title={t('Number of hosts jobs are running on')}
          help={t(
            'Number of hosts that ran at least one job in the selected period. Complements run count by showing how broadly automation is applied across your inventory.'
          )}
          summaryValue={12015}
          values={chartValues}
          variant={'lineChart'}
        ></DashboardChartCard>
        <DashboardChartCard
          id="job-chart-card"
          title={t('Number of times jobs were run')}
          help={t(
            'Total number of job executions in the selected period, regardless of success or failure. Use this to understand automation volume, trends, and adoption over time.'
          )}
          variant={'barChart'}
          summaryValue={0}
          values={[]}
        ></DashboardChartCard>
        <DashboardMainTableCard></DashboardMainTableCard>
      </PageDashboard>
    </PageLayout>
  );
}
