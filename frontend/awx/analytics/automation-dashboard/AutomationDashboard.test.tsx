import { vi, test, afterEach, describe, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { AutomationDashboard } from './AutomationDashboard';
import { useAutomationDashboardView } from './views/useAutomationDashboardView';
import type {
  IAutomationDashboardView,
  IDashboardDetails,
  IJobTemplate,
  DashboardValueCardProps,
} from './types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
  DashboardTableCard: ({ title }: { title: string }) => <div>{title}</div>,
  DashboardMainTableCard: () => <div data-testid="dashboard-main-table-card" />,
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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockJobTemplate: IJobTemplate = {
  id: 1,
  template_name: 'Demo Template',
  runs: 10,
  num_hosts: 3,
  time_taken_manually_execute_minutes: 30,
  time_taken_create_automation_minutes: 60,
  elapsed: '00:05:00',
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
  exportPdf: vi.fn(),
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

  // ─── Export report button ──────────────────────────────────────────────────

  test('should render Export report button', () => {
    render(testWrapper());
    expect(screen.getByTestId('export-report-button')).toBeInTheDocument();
  });

  test('should label the button "Export report"', () => {
    render(testWrapper());
    expect(screen.getByRole('button', { name: 'Export report' })).toBeInTheDocument();
  });

  test('should enable Export report button when table has items', () => {
    render(testWrapper());
    expect(screen.getByTestId('export-report-button')).toBeEnabled();
  });

  test('should disable Export report button when loading', () => {
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce({ ...mockView, loading: true });
    render(testWrapper());
    expect(screen.getByTestId('export-report-button')).toBeDisabled();
  });

  test('should disable Export report button when table has no items', () => {
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce({
      ...mockView,
      mainTableView: { ...mockMainTableView, itemCount: 0 },
    });
    render(testWrapper());
    expect(screen.getByTestId('export-report-button')).toBeDisabled();
  });

  test('should call exportPdf when Export report button is clicked', async () => {
    const user = userEvent.setup();
    const exportPdf = vi.fn();
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce({ ...mockView, exportPdf });
    render(testWrapper());
    await user.click(screen.getByTestId('export-report-button'));
    expect(exportPdf).toHaveBeenCalledTimes(1);
  });

  test('should show warning toast when template count exceeds 500', async () => {
    const user = userEvent.setup();
    const addAlert = vi.fn();
    const { usePageAlertToaster } = await import('@ansible/ansible-ui-framework');
    vi.mocked(usePageAlertToaster).mockReturnValueOnce({
      addAlert,
      removeAlert: vi.fn(),
      replaceAlert: vi.fn(),
      removeAlerts: vi.fn(),
    });
    vi.mocked(useAutomationDashboardView).mockReturnValueOnce({
      ...mockView,
      mainTableView: { ...mockMainTableView, itemCount: 501 },
    });
    render(testWrapper());
    await user.click(screen.getByTestId('export-report-button'));
    expect(addAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'warning' })
    );
  });

  test('should not show warning toast when template count is within limit', async () => {
    const user = userEvent.setup();
    const addAlert = vi.fn();
    const { usePageAlertToaster } = await import('@ansible/ansible-ui-framework');
    vi.mocked(usePageAlertToaster).mockReturnValueOnce({
      addAlert,
      removeAlert: vi.fn(),
      replaceAlert: vi.fn(),
      removeAlerts: vi.fn(),
    });
    render(testWrapper());
    await user.click(screen.getByTestId('export-report-button'));
    expect(addAlert).not.toHaveBeenCalled();
  });

  // ─── Value card data ───────────────────────────────────────────────────────

  test('should display metric values from details', () => {
    render(testWrapper());
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('88 h')).toBeInTheDocument();
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
});
