import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { AutomationDashboardMainPage } from './AutomationDashboardMainPage';
import { useAutomationDashboardCollectionStatus } from './common/useAutomationDashboardCollectionStatus';
import type { IAutomationDashboardCollectionStatus } from './types';

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AutomationDashboardMainPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render the page title and the Dashboard/Leaderboards tabs when not loading', () => {
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
    vi.mocked(useAutomationDashboardCollectionStatus).mockReturnValueOnce({
      collectionStatus: DEFAULT_COLLECTION_STATUS,
      isLoading: true,
    });

    render(<AutomationDashboardMainPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Automation Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('routed-tabs')).not.toBeInTheDocument();
  });
});
