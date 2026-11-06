import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@patternfly/react-core';
import styled from 'styled-components';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  DashboardChartCard,
  DashboardMainTableCard,
  DashboardTableCard,
  DashboardValueCard,
  useAutomationDashboardPeriodFilter,
  useAutomationDashboardToolbar,
} from './components';

import { useAutomationDashboardView } from './views/useAutomationDashboardView';
import { DashboardToolbar } from './components/DashboardToolbar';
import { DashboardGridRow, DashboardLayout } from './components/DashboardLayout';
import type { IAutomationDashboardView } from './types';

/** Breakpoint range (in grid columns) where value cards switch from 'md' to 'xs' size. */
const WIDE_LAYOUT_MIN_COLUMNS = 16;
const WIDE_LAYOUT_MAX_COLUMNS = 31;

export function AutomationDashboard() {
  const { t } = useTranslation();
  const periodFilter = useAutomationDashboardPeriodFilter();
  const toolbarFilters = useAutomationDashboardToolbar();
  // The query string, required-filter validation and export work on all filters, period included.
  const allFilters = useMemo(
    () => [periodFilter, ...toolbarFilters],
    [periodFilter, toolbarFilters]
  );
  const getPageUrl = useGetPageUrl();

  const view = useAutomationDashboardView({ toolbarFilters: allFilters });
  const { details } = view;

  const noDataString = t('No jobs have been run.');

  const renderDashboardContent = (gridColumns: number) => {
    const isWideLayout =
      WIDE_LAYOUT_MIN_COLUMNS <= gridColumns && gridColumns <= WIDE_LAYOUT_MAX_COLUMNS;
    const valueCardWidth = isWideLayout ? 'xs' : ('md' as const);
    const chartCardWidth = gridColumns <= WIDE_LAYOUT_MAX_COLUMNS ? 'md' : ('xl' as const);

    return (
      <>
        <FiltersTooLargeAlert filtersTooLarge={view.filtersTooLarge} />
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
              'Number of hosts that executed at least one automation job in the selected period.'
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
            filterState={view.isFilterStateDefault ? undefined : view.mainTableView.filterState}
            emptyStateTitle={
              view?.mainTableView?.itemCount ? t('No projects to rank') : t('No project data yet')
            }
            emptyStateDescription={
              view?.mainTableView?.itemCount
                ? t('Automation data exists, but no runs are currently associated with projects.')
                : t('Project data will appear after your first automation runs.')
            }
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
            filterState={view.isFilterStateDefault ? undefined : view.mainTableView.filterState}
            emptyStateTitle={
              view?.mainTableView?.itemCount ? t('No users to rank') : t('No user data yet')
            }
            emptyStateDescription={
              view?.mainTableView?.itemCount
                ? t(
                    'Automation data exists, but no runs are currently attributed to individual users.'
                  )
                : t('User data will appear after your first automation runs.')
            }
          ></DashboardTableCard>
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
            width={chartCardWidth}
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
            width={chartCardWidth}
          ></DashboardChartCard>
        </DashboardGridRow>
        <DashboardGridRow>
          <DashboardMainTableCard
            {...view}
            toolbarFilters={allFilters}
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
        periodFilter={periodFilter}
        validationFilters={allFilters}
        {...view.mainTableView}
        keyFn={(item) => item.id}
        registerClearCallback={view.registerClearCallback}
        replaceFilterState={view.replaceFilterState}
        filterResetCount={view.filterResetCount}
      />
      <DashboardLayout>{renderDashboardContent}</DashboardLayout>
    </>
  );
}

/**
 * Shown right below the filters (spanning the whole grid) when the API rejected a request as too
 * large because of too many filter values. It tells whether the data of the previous request is
 * shown; without it, the cards show their error states.
 */
function FiltersTooLargeAlert(
  props: Readonly<{ filtersTooLarge: IAutomationDashboardView['filtersTooLarge'] }>
) {
  const { t } = useTranslation();
  if (!props.filtersTooLarge) return null;
  // Whole sentences per case, so each translates as a whole.
  const text = {
    all: t(
      'Too many values are selected to load the data. Narrow the filters, for example by selecting fewer values. The data shown is from the previous filters.'
    ),
    some: t(
      'Too many values are selected to load the data. Narrow the filters, for example by selecting fewer values. Some of the data shown is from the previous filters.'
    ),
    none: t(
      'Too many values are selected to load the data. Narrow the filters, for example by selecting fewer values.'
    ),
  }[props.filtersTooLarge.previousData];
  return (
    <FullWidthGridCell>
      <Alert
        variant="danger"
        isInline
        // Announced when it appears, e.g. after selecting more values.
        isLiveRegion
        title={t('The filters are too large')}
        data-testid="filters-too-large-alert"
      >
        {text}
      </Alert>
    </FullWidthGridCell>
  );
}

/** A cell of the dashboard grid that spans every column. */
const FullWidthGridCell = styled.div`
  grid-column: 1 / -1;
`;
