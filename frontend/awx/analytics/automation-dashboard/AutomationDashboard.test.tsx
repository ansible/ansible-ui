import { vi, test, afterEach, describe, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import {
  IToolbarFilter,
  PageAlertToasterProvider,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { AutomationDashboard } from './AutomationDashboard';
import { useAutomationDashboardToolbar } from './components';
import { useAutomationDashboardView } from './views/useAutomationDashboardView';
import { useAutomationDashboardCollectionStatus } from './common/useAutomationDashboardCollectionStatus';
import type {
  IAutomationDashboardView,
  IDashboardDetails,
  IJobTemplate,
  DashboardValueCardProps,
  IAutomationDashboardCollectionStatus,
} from './types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const DEFAULT_COLLECTION_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: true,
  next_run: null,
  initial_collection_status: null,
};

vi.mock('./common/useAutomationDashboardCollectionStatus', () => ({
  useAutomationDashboardCollectionStatus: vi.fn(() => ({
    collectionStatus: DEFAULT_COLLECTION_STATUS,
    isLoading: false,
  })),
}));

vi.mock('./components', () => ({
  useAutomationDashboardToolbar: vi.fn(() => []),
  DashboardValueCard: ({ title, value, valueSuffix, linkText }: DashboardValueCardProps) => (
    <>
      <span>{title}</span>
      <span>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {valueSuffix ? ` ${valueSuffix}` : ''}
      </span>
      {linkText && <span>{linkText}</span>}
    </>
  ),
  DashboardChartCard: ({ title }: { title: string }) => <div>{title}</div>,
  DashboardTableCard: ({
    title,
    items,
    emptyStateTitle,
    emptyStateDescription,
  }: {
    title: string;
    items?: unknown[];
    emptyStateTitle?: string;
    emptyStateDescription?: string;
  }) => (
    <div>
      <div>{title}</div>
      {(!items || items.length === 0) && (
        <div data-testid={`${title}-empty-state`}>
          {emptyStateTitle && <div data-testid="empty-state-title">{emptyStateTitle}</div>}
          {emptyStateDescription && (
            <div data-testid="empty-state-description">{emptyStateDescription}</div>
          )}
        </div>
      )}
    </div>
  ),
  DashboardMainTableCard: ({ toolbarFilters }: { toolbarFilters?: IToolbarFilter[] }) => (
    <div
      data-testid="dashboard-main-table-card"
      data-toolbar-filter-keys={toolbarFilters?.map((filter) => filter.key).join(',') ?? ''}
    />
  ),
}));

vi.mock('./views/useAutomationDashboardView', () => ({
  useAutomationDashboardView: vi.fn(() => mockView),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PageDashboard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PageToolbar: () => null,
    PageHeader: ({ title, controls }: { title: string; controls?: React.ReactNode }) => (
      <div>
        <h1>{title}</h1>
        <div>{controls}</div>
      </div>
    ),
    useGetPageUrl: vi.fn(() => (route: string) => `/mock/${route}`),
    usePageDialog: vi.fn(() => [undefined, vi.fn()]),
    usePageAlertToaster: vi.fn(() => ({ addAlert: vi.fn() })),
  };
});

vi.mock('@ansible/ansible-ui-framework/components/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockJobTemplate: IJobTemplate = {
  id: 1,
  template_name: 'Demo Template',
  runs: 10,
  num_hosts: 3,
  time_taken_manually_execute_minutes: 30,
  time_taken_create_automation_minutes: 60,
  elapsed: '300',
  elapsed_str: '00:05:00',
  automated_costs: 100,
  manual_costs: 200,
  savings: 100,
};

const mockDetails: IDashboardDetails = {
  total_number_of_successful_jobs: 42,
  total_number_of_failed_jobs: 7,
  total_number_of_unique_hosts: 15,
  cost_of_automated_execution: 500,
  cost_of_manual_automation: 1000,
  total_hours_of_automation: 88,
  total_saving: 500,
  total_time_saving: 50,
  total_number_of_host_job_runs: 20,
  total_number_of_job_runs: 30,
  top_projects: [{ id: 1, name: 'Project Alpha', execution_count: 10 }],
  top_users: [{ id: 1, name: 'Alice', execution_count: 5 }],
  job_chart: { kind: 'day', items: [{ label: '2024-01-01', value: 3 }] },
  host_chart: { kind: 'day', items: [{ label: '2024-01-01', value: 2 }] },
};

const mockMainTableView: IAutomationDashboardView['mainTableView'] = {
  page: 1,
  setPage: vi.fn(),
  perPage: 10,
  setPerPage: vi.fn(),
  sort: 'template_name',
  setSort: vi.fn(),
  sortDirection: 'asc',
  setSortDirection: vi.fn(),
  filterState: {},
  setFilterState: vi.fn(),
  clearAllFilters: vi.fn(),
  selectedItems: [],
  selectItem: vi.fn(),
  selectItems: vi.fn(),
  unselectItem: vi.fn(),
  unselectItems: vi.fn(),
  isSelected: vi.fn(() => false),
  selectAll: vi.fn(),
  unselectAll: vi.fn(),
  allSelected: false,
  keyFn: (item: IJobTemplate) => item.id,
  itemCount: 1,
  pageItems: [mockJobTemplate],
  refresh: vi.fn(),
  selectItemsAndRefresh: vi.fn(),
  unselectItemsAndRefresh: vi.fn(),
  limitFiltersToOneOrOperation: true,
  updateItem: vi.fn(),
  upsertItem: vi.fn(),
  listUrl: '',
} as unknown as IAutomationDashboardView['mainTableView'];

const mockView: IAutomationDashboardView = {
  mainTableView: mockMainTableView,
  details: mockDetails,
  detailsError: undefined,
  detailsLoading: false,
  costState: {
    id: 1,
    monthly_subscription_cost: 100,
    engineer_avg_hourly_rate: 50,
    include_template_creation_time_in_costs: true,
  },
  setCostState: vi.fn(),
  loading: false,
  refresh: vi.fn(),
  exportCsv: vi.fn(),
  isFilterStateDefault: true,
  registerClearCallback: vi.fn(),
};

// ─── Test wrapper ─────────────────────────────────────────────────────────────

function testWrapper() {
  return (
    <MemoryRouter>
      <SWRConfig
        value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}
      >
        <PageAlertToasterProvider>
          <AutomationDashboard />
        </PageAlertToasterProvider>
      </SWRConfig>
    </MemoryRouter>
  );
}

describe('AutomationDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders AutomationDashboard component', () => {
    render(testWrapper());
  });

  test('renders dashboard title', () => {
    const { getByText } = render(testWrapper());
    expect(getByText('Automation Dashboard')).toBeInTheDocument();
  });

  test('should render all dashboard card labels', () => {
    const { getByText } = render(testWrapper());

    // Value cards
    expect(getByText('Successful jobs')).toBeInTheDocument();
    expect(getByText('Failed jobs')).toBeInTheDocument();
    expect(getByText('Hosts automated')).toBeInTheDocument();
    expect(getByText('Hours of automation')).toBeInTheDocument();

    // Table cards
    expect(getByText('Top 5 projects')).toBeInTheDocument();
    expect(getByText('Top 5 users')).toBeInTheDocument();

    // Chart cards
    expect(getByText('Number of hosts jobs are running on')).toBeInTheDocument();
    expect(getByText('Number of times jobs were run')).toBeInTheDocument();

    // Main table card placeholder (internals covered by DashboardMainTableCard.test.tsx)
    expect(screen.getByTestId('dashboard-main-table-card')).toBeInTheDocument();
  });

  test('should pass toolbarFilters through to DashboardMainTableCard', () => {
    const mockToolbarFilters: IToolbarFilter[] = [
      {
        type: ToolbarFilterType.DateRange,
        key: 'period',
        label: 'Period',
        query: 'period',
        options: [{ label: 'Last 7 days', value: 'last_7_days' }],
        placeholder: 'Filter by period',
        isRequired: true,
      },
    ];
    vi.mocked(useAutomationDashboardToolbar).mockReturnValueOnce(mockToolbarFilters);

    render(testWrapper());

    expect(screen.getByTestId('dashboard-main-table-card')).toHaveAttribute(
      'data-toolbar-filter-keys',
      'period'
    );
  });

  // ─── Value card data ───────────────────────────────────────────────────────

  test('should display metric values from details', () => {
    render(testWrapper());
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('88 h')).toBeInTheDocument();
  });

  test('should not render "h" suffix when total_hours_of_automation is 0', () => {
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce({
      ...mockView,
      details: { ...mockDetails, total_hours_of_automation: 0 },
    });
    render(testWrapper());
    expect(screen.getByText('Hours of automation')).toBeInTheDocument();
    expect(screen.queryByText('88 h')).not.toBeInTheDocument();
    expect(screen.queryByText(/0 h/)).not.toBeInTheDocument();
  });

  test('should display no jobs have been run when details are undefined', () => {
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce({ ...mockView, details: undefined });
    render(testWrapper());
    const zeros = screen.getAllByText('No jobs have been run.');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  test('should render links for successful and failed job value cards', () => {
    render(testWrapper());
    expect(screen.getByText('See all successful jobs')).toBeInTheDocument();
    expect(screen.getByText('See all failed jobs')).toBeInTheDocument();
  });

  // ─── Collection status loading ─────────────────────────────────────────────

  test('should show loading state when collection status is loading', () => {
    vi.mocked(useAutomationDashboardCollectionStatus).mockReturnValueOnce({
      collectionStatus: DEFAULT_COLLECTION_STATUS,
      isLoading: true,
    });
    render(testWrapper());
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.queryByText('Automation Dashboard')).not.toBeInTheDocument();
  });

  test('should show dashboard when collection status is not loading', () => {
    vi.mocked(useAutomationDashboardCollectionStatus).mockReturnValueOnce({
      collectionStatus: DEFAULT_COLLECTION_STATUS,
      isLoading: false,
    });
    render(testWrapper());
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.getByText('Automation Dashboard')).toBeInTheDocument();
  });

  // ─── Empty state scenarios ─────────────────────────────────────────────────

  test('should show "no data yet" empty state when there are no items and no top projects', () => {
    const viewWithNoData = {
      ...mockView,
      details: { ...mockDetails, top_projects: [] },
      mainTableView: { ...mockMainTableView, itemCount: 0 },
    };
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce(viewWithNoData);
    render(testWrapper());
    expect(screen.getByText('No project data yet')).toBeInTheDocument();
    expect(
      screen.getByText('Project data will appear after your first automation runs.')
    ).toBeInTheDocument();
  });

  test('should show "no data yet" empty state when there are no items and no top users', () => {
    const viewWithNoData = {
      ...mockView,
      details: { ...mockDetails, top_users: [] },
      mainTableView: { ...mockMainTableView, itemCount: 0 },
    };
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce(viewWithNoData);
    render(testWrapper());
    expect(screen.getByText('No user data yet')).toBeInTheDocument();
    expect(
      screen.getByText('User data will appear after your first automation runs.')
    ).toBeInTheDocument();
  });

  test('should show filtered empty state when items exist but top projects are empty', () => {
    const viewWithFilteredData = {
      ...mockView,
      details: { ...mockDetails, top_projects: [] },
      mainTableView: { ...mockMainTableView, itemCount: 5 },
    };
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce(viewWithFilteredData);
    render(testWrapper());
    expect(screen.getByText('No projects to rank')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Automation data exists, but no runs are currently associated with projects.'
      )
    ).toBeInTheDocument();
  });

  test('should show filtered empty state when items exist but top users are empty', () => {
    const viewWithFilteredData = {
      ...mockView,
      details: { ...mockDetails, top_users: [] },
      mainTableView: { ...mockMainTableView, itemCount: 5 },
    };
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce(viewWithFilteredData);
    render(testWrapper());
    expect(screen.getByText('No users to rank')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Automation data exists, but no runs are currently attributed to individual users.'
      )
    ).toBeInTheDocument();
  });
});
