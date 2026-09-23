import { beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { AutomationDashboardMainPage } from './AutomationDashboardMainPage';
import { useAutomationDashboardCollectionStatus } from './common/useAutomationDashboardCollectionStatus';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('./common/useAutomationDashboardCollectionStatus');

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  };
});

vi.mock('@ansible/ansible-ui-framework/components/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock('@ansible/common-ui/PageRoutedTabs', () => ({
  PageRoutedTabs: ({ tabs }: { tabs: { label: string; page: string }[] }) => {
    const { columns } = React.useContext(PageDashboardContext);
    return (
      <div data-testid="routed-tabs" data-grid-columns={columns}>
        {tabs.map((tab) => (
          <span key={tab.page}>{tab.label}</span>
        ))}
      </div>
    );
  },
}));

vi.mock('./AutomationDashboard', () => ({
  AutomationDashboard: () => <div data-testid="automation-dashboard">Dashboard content</div>,
}));

vi.mock('./AutomationLeaderboards', () => ({
  AutomationLeaderboards: () => (
    <div data-testid="automation-leaderboards">Leaderboards content</div>
  ),
}));

type CollectionStatusResult = ReturnType<typeof useAutomationDashboardCollectionStatus>;

function mockStatus(overrides: Partial<CollectionStatusResult> = {}) {
  vi.mocked(useAutomationDashboardCollectionStatus).mockReturnValue({
    collectionStatus: {
      enabled: true,
      min_collection_timestamp: null,
      show_dashboard: true,
      show_gamification: true,
    },
    isLoading: false,
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    error: undefined,
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AutomationDashboardMainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus();
  });

  test('should render the page title and the Dashboard/Leaderboards tabs when the user can see both', () => {
    render(<AutomationDashboardMainPage />);

    expect(screen.getByRole('heading', { name: 'Automation Dashboard' })).toBeInTheDocument();
    expect(screen.getByTestId('routed-tabs')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Leaderboards')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
  });

  test('should measure the grid columns and provide them through PageDashboardContext', () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(1600);

    render(<AutomationDashboardMainPage />);

    // (1600 - 56 inset) / (1662 / 24) => 22 columns
    expect(screen.getByTestId('routed-tabs')).toHaveAttribute('data-grid-columns', '22');

    clientWidthSpy.mockRestore();
  });

  test('should show only the loading state while the collection status is loading', () => {
    mockStatus({ isLoading: true });

    render(<AutomationDashboardMainPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Automation Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('routed-tabs')).not.toBeInTheDocument();
  });

  test('should render only the dashboard, without tabs, when the user cannot see leaderboards', () => {
    mockStatus({ canSeeLeaderboard: false });

    render(<AutomationDashboardMainPage />);

    expect(screen.getByTestId('automation-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('routed-tabs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('automation-leaderboards')).not.toBeInTheDocument();
  });

  test('should render only the leaderboards, without tabs, when the user cannot see the dashboard', () => {
    mockStatus({ canSeeDashboard: false });

    render(<AutomationDashboardMainPage />);

    expect(screen.getByTestId('automation-leaderboards')).toBeInTheDocument();
    expect(screen.queryByTestId('routed-tabs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('automation-dashboard')).not.toBeInTheDocument();
  });

  test('should show the unauthorized empty state when the user can see neither view', () => {
    mockStatus({ canSeeDashboard: false, canSeeLeaderboard: false });

    render(<AutomationDashboardMainPage />);

    expect(
      screen.getByRole('heading', {
        name: 'You do not have permission to view the Automation Dashboard or Leaderboards.',
      })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('routed-tabs')).not.toBeInTheDocument();
  });

  test('should show an error state instead of a permission message when collection status fails', () => {
    mockStatus({
      canSeeDashboard: false,
      canSeeLeaderboard: false,
      error: new Error('Server error'),
    });

    render(<AutomationDashboardMainPage />);

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(
      screen.queryByText(
        'You do not have permission to view the Automation Dashboard or Leaderboards.'
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('routed-tabs')).not.toBeInTheDocument();
  });
});
