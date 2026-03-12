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
          title={t('Total number of successful jobs')}
          help={t('This indicates the number of automation jobs that were completed successfully.')}
          linkText={t('See all successful jobs in AAP')}
          to={getPageUrl(AwxRoute.Jobs) + '?status=successful'}
          value={15}
        ></DashboardValueCard>
        <DashboardValueCard
          id="failed-jobs-card"
          title={t('Total number of failed jobs')}
          help={t('This indicates the number of automation jobs that were completed successfully.')}
          linkText={t('See all failed jobs in AAP')}
          to={getPageUrl(AwxRoute.Jobs) + '?status=failed'}
          value={5}
        ></DashboardValueCard>
        <DashboardValueCard
          id="unique-hosts-card"
          title={t('All unique hosts automated')}
          help={t('This is the number of Controller inventory records you have automated.')}
          value={2}
        ></DashboardValueCard>
        <DashboardValueCard
          id="automation-hours-card"
          title={t('Total hours of automation')}
          help={t(
            'This represents the cumulative time that Ansible Automation Platform spent executing jobs.'
          )}
          value={2}
          valueSuffix="h"
        ></DashboardValueCard>
        <DashboardTableCard
          id="top-projects-card"
          title={t('Top 5 projects')}
          help={t(
            'This section lists the top five automation projects based on the number of jobs executed.'
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
            'This section lists the top five users of Ansible Automation Platform, with a breakdown of the total number of jobs run by each user.'
          )}
          firstColumnHeader={t('User name')}
          emptyStateTitle={t('No users')}
          errorStateTitle={t('Error loading users')}
          items={[]}
        ></DashboardTableCard>
        <DashboardChartCard
          id="host-chart-card"
          title={t('Number of hosts jobs are running on')}
          help={t('This is the total number of hosts that jobs are executed upon.')}
          summaryValue={12015}
          values={chartValues}
          variant={'lineChart'}
        ></DashboardChartCard>
        <DashboardChartCard
          id="job-chart-card"
          title={t('Number of times jobs are running')}
          help={t('This is the total number of individual job executions.')}
          variant={'barChart'}
          summaryValue={0}
          values={[]}
        ></DashboardChartCard>
        <DashboardMainTableCard></DashboardMainTableCard>
      </PageDashboard>
    </PageLayout>
  );
}
