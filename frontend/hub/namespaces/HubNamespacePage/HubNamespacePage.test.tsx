/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { HubNamespacePage } from './HubNamespacePage';

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../common/isInsights';

// Mock useGet hook
const mockNamespaceData = {
  data: [
    {
      name: 'test-namespace',
      pulp_href: '/pulp/api/v3/namespaces/1/',
      description: 'Test namespace',
    },
  ],
};

const mockMyNamespaceData = {
  name: 'test-namespace',
  pulp_href: '/pulp/api/v3/namespaces/1/',
};

let mockMyNamespaceResponse: unknown = null;

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url: string) => {
    if (url.includes('my-namespaces')) {
      return { data: mockMyNamespaceResponse, error: null, refresh: vi.fn() };
    }
    return { data: mockNamespaceData, error: null, refresh: vi.fn() };
  },
}));

// Mock namespace actions hook
const mockActions = [
  { type: 'button', label: 'Edit namespace', onClick: vi.fn() },
  { type: 'button', label: 'Delete namespace', onClick: vi.fn() },
];

vi.mock('../hooks/useHubNamespaceActions', () => ({
  useHubNamespaceActions: () => mockActions,
}));

// Mock framework components
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="page-layout">{children}</div>
    ),
    PageHeader: ({ title, headerActions }: { title: string; headerActions: React.ReactNode }) => (
      <div data-testid="page-header">
        <h1>{title}</h1>
        <div data-testid="header-actions">{headerActions}</div>
      </div>
    ),
    PageActions: ({ actions }: { actions: Array<{ label?: string }> }) => (
      <div data-testid="page-actions">
        {actions.map((action) => (
          <button key={action.label} data-testid={`action-${action.label}`}>
            {action.label}
          </button>
        ))}
      </div>
    ),
    useGetPageUrl: () => (route: string) => `/hub/${route}`,
    usePageNavigate: () => vi.fn(),
  };
});

vi.mock('@ansible/common-ui/PageRoutedTabs', () => ({
  PageRoutedTabs: ({ tabs }: { tabs: Array<{ label: string; page: string }> }) => (
    <div data-testid="page-tabs">
      {tabs.map((tab) => (
        <div key={tab.label} data-testid={`tab-${tab.label.toLowerCase().replaceAll(/\s+/g, '-')}`}>
          {tab.label}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../common/HubError', () => ({
  HubError: ({ error }: { error: Error }) => <div data-testid="hub-error">{error.message}</div>,
}));

function renderHubNamespacePage(namespaceId = 'test-namespace') {
  return render(
    <MemoryRouter initialEntries={[`/namespaces/${namespaceId}`]}>
      <Routes>
        <Route path="/namespaces/:id" element={<HubNamespacePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HubNamespacePage', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    mockMyNamespaceResponse = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page layout', () => {
    renderHubNamespacePage();
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should render the namespace name in the header', () => {
    renderHubNamespacePage();
    expect(screen.getByRole('heading', { name: 'test-namespace' })).toBeInTheDocument();
  });

  describe('in Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should show all page actions', () => {
      renderHubNamespacePage();
      expect(screen.getByTestId('action-Edit namespace')).toBeInTheDocument();
      expect(screen.getByTestId('action-Delete namespace')).toBeInTheDocument();
    });

    it('should show Team Access and User Access tabs', () => {
      renderHubNamespacePage();
      expect(screen.getByTestId('tab-team-access')).toBeInTheDocument();
      expect(screen.getByTestId('tab-user-access')).toBeInTheDocument();
    });

    it('should not show single Access tab', () => {
      renderHubNamespacePage();
      expect(screen.queryByTestId('tab-access')).not.toBeInTheDocument();
    });
  });

  describe('in Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    describe('when user has access to namespace (my-namespaces returns data)', () => {
      beforeEach(() => {
        mockMyNamespaceResponse = mockMyNamespaceData;
      });

      it('should show all page actions', () => {
        renderHubNamespacePage();
        expect(screen.getByTestId('action-Edit namespace')).toBeInTheDocument();
        expect(screen.getByTestId('action-Delete namespace')).toBeInTheDocument();
      });
    });

    describe('when user does not have access to namespace (my-namespaces returns null)', () => {
      beforeEach(() => {
        mockMyNamespaceResponse = null;
      });

      it('should hide all page actions', () => {
        renderHubNamespacePage();
        expect(screen.queryByTestId('action-Edit namespace')).not.toBeInTheDocument();
        expect(screen.queryByTestId('action-Delete namespace')).not.toBeInTheDocument();
      });
    });

    it('should show single Access tab instead of Team/User Access tabs', () => {
      renderHubNamespacePage();
      expect(screen.getByTestId('tab-access')).toBeInTheDocument();
      expect(screen.queryByTestId('tab-team-access')).not.toBeInTheDocument();
      expect(screen.queryByTestId('tab-user-access')).not.toBeInTheDocument();
    });
  });

  it('should render Details tab', () => {
    renderHubNamespacePage();
    expect(screen.getByTestId('tab-details')).toBeInTheDocument();
  });

  it('should render Collections tab', () => {
    renderHubNamespacePage();
    expect(screen.getByTestId('tab-collections')).toBeInTheDocument();
  });

  it('should render CLI Configuration tab', () => {
    renderHubNamespacePage();
    expect(screen.getByTestId('tab-cli-configuration')).toBeInTheDocument();
  });
});
