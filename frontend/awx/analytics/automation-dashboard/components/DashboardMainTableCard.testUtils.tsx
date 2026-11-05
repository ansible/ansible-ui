/**
 * Shared fixtures and render helpers for the `DashboardMainTableCard` test files.
 * Each test file still sets up its own MSW server and `useAwxActiveUser` mock.
 */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import {
  IToolbarFilter,
  PageAlertToasterProvider,
  PageDialogProvider,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { DashboardMainTableCard } from './DashboardMainTableCard';
import type { IAutomationDashboardView, IDashboardDetails, IJobTemplate } from '../types';

export const mockItem: IJobTemplate = {
  id: 1,
  template_name: 'Test Template',
  runs: 5,
  num_hosts: 3,
  time_taken_manually_execute_minutes: 30,
  time_taken_create_automation_minutes: 60,
  elapsed: '1800',
  elapsed_str: '00:30:00',
  automated_costs: 100,
  manual_costs: 200,
  savings: 100,
  time_savings: 3600,
  time_savings_str: '01:00:00',
};

export const mockDetails: IDashboardDetails = {
  total_number_of_successful_jobs: 10,
  total_number_of_failed_jobs: 2,
  total_number_of_unique_hosts: 5,
  cost_of_automated_execution: 500,
  cost_of_manual_automation: 1000,
  total_hours_of_automation: 100,
  total_saving: 500,
  total_time_saving: 50,
  total_number_of_host_job_runs: 15,
  total_number_of_job_runs: 12,
  top_projects: [{ id: 1, name: 'Project A', execution_count: 3 }],
  top_users: [{ id: 1, name: 'User A', execution_count: 2 }],
  job_chart: { kind: 'day', items: [{ label: '2024-01-01', value: 1 }] },
  host_chart: { kind: 'day', items: [{ label: '2024-01-01', value: 1 }] },
};

export const mockRefresh = vi.fn();

export const mockToolbarFilters: IToolbarFilter[] = [
  {
    type: ToolbarFilterType.DateRange,
    key: 'period',
    label: 'Period',
    query: 'period',
    options: [
      { label: 'Last 7 days', value: 'last_7_days' },
      { label: 'Custom', value: 'custom', isCustom: true },
    ],
    placeholder: 'Filter by period',
    isRequired: true,
  },
];

export type MainTableView = IAutomationDashboardView['mainTableView'];

export function buildMainTableView(overrides: Partial<MainTableView> = {}): MainTableView {
  const base: MainTableView = {
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'template_name',
    setSort: vi.fn(),
    sortDirection: 'asc',
    setSortDirection: vi.fn(),
    filterState: { period: ['last_7_days'] },
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    itemCount: 1,
    pageItems: [mockItem],
    refresh: vi.fn(),
    limitFiltersToOneOrOperation: true,
    updateItem: vi.fn(),
    error: undefined,
  };
  return { ...base, ...overrides } as MainTableView;
}

export function buildProps(
  overrides: Partial<IAutomationDashboardView> = {}
): IAutomationDashboardView {
  return {
    mainTableView: buildMainTableView(),
    toolbarFilters: mockToolbarFilters,
    details: mockDetails,
    detailsError: undefined,
    detailsLoading: false,
    costState: {
      id: 1,
      monthly_subscription_cost: 100,
      engineer_avg_hourly_rate: 50,
      include_template_creation_time_in_costs: false,
    },
    setCostState: vi.fn(),
    loading: false,
    refresh: mockRefresh,
    exportCsv: vi.fn(),
    isFilterStateDefault: true,
    registerClearCallback: vi.fn(),
    ...overrides,
  };
}

export function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <PageDialogProvider>
        <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
      </PageDialogProvider>
    </MemoryRouter>
  );
}

export function renderCard(props: IAutomationDashboardView = buildProps()) {
  return render(<DashboardMainTableCard {...props} />, { wrapper: Wrapper });
}
