/* eslint-disable i18next/no-literal-string */
import { PageActionSelection } from '@ansible/ansible-ui-framework';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { HubNamespaceCollections } from './HubNamespaceCollections';

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
}));

import { isInsightsMode } from '../../common/isInsights';

// Track whether my-namespaces should return data
let mockMyNamespaceResponse: unknown = null;

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url: string) => {
    if (url.includes('my-namespaces')) {
      return { data: mockMyNamespaceResponse, error: null, refresh: vi.fn() };
    }
    return { data: null, error: null, refresh: vi.fn() };
  },
}));

// Mock the view hook to avoid API calls
vi.mock('../../common/useHubView', () => ({
  useHubView: () => ({
    pageItems: [],
    itemCount: 0,
    isLoading: false,
    error: null,
    unselectItemsAndRefresh: vi.fn(),
    refresh: vi.fn(),
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    isSelected: vi.fn(),
    selectedItems: [],
  }),
}));

// Mock collection hooks
vi.mock('../../collections/hooks/useCollectionActions', () => ({
  useCollectionActions: () => [],
}));

vi.mock('../../collections/hooks/useCollectionColumns', () => ({
  useCollectionColumns: () => [
    { header: 'Name', cell: () => null },
    { header: 'Namespace', cell: () => null },
  ],
}));

vi.mock('../../collections/hooks/useCollectionFilters', () => ({
  useCollectionFilters: () => [],
}));

// Mock uses actual PageActionSelection enum values
vi.mock('../../collections/hooks/useCollectionsActions', () => ({
  useCollectionsActions: () => [
    {
      type: 'button',
      selection: PageActionSelection.None,
      variant: 'primary',
      isPinned: true,
      label: 'Upload collection',
      onClick: vi.fn(),
    },
    {
      type: 'bulk',
      selection: PageActionSelection.Multiple,
      label: 'Delete selected collections',
      onClick: vi.fn(),
    },
  ],
}));

// Mock the framework components
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="page-layout">{children}</div>
    ),
    PageTable: ({
      emptyState,
      toolbarActions,
    }: {
      emptyState: React.ReactNode;
      toolbarActions: Array<{ label?: string }>;
    }) => (
      <div data-testid="page-table">
        <div data-testid="toolbar-actions">
          {toolbarActions?.map((action) => (
            <span key={action.label} data-testid="toolbar-action">
              {action.label}
            </span>
          ))}
        </div>
        <div data-testid="empty-state-container">{emptyState}</div>
      </div>
    ),
    useGetPageUrl: () => (route: string, params?: { query?: { namespace: string } }) =>
      params?.query?.namespace
        ? `/hub/${route}?namespace=${params.query.namespace}`
        : `/hub/${route}`,
  };
});

vi.mock('@ansible/ansible-ui-framework/PageTable/PageTableEmptyState', () => ({
  PageTableEmptyState: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p data-testid="empty-state-description">{description}</p>
      {children}
    </div>
  ),
}));

vi.mock('@ansible/ansible-ui-framework/components/ButtonLink', () => ({
  ButtonLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="upload-collection-link">
      {children}
    </a>
  ),
}));

function renderHubNamespaceCollections(namespaceId = 'test-namespace') {
  return render(
    <MemoryRouter initialEntries={[`/namespaces/${namespaceId}/collections`]}>
      <Routes>
        <Route path="/namespaces/:id/collections" element={<HubNamespaceCollections />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HubNamespaceCollections', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    mockMyNamespaceResponse = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page layout', () => {
    renderHubNamespaceCollections();
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should render the page table', () => {
    renderHubNamespaceCollections();
    expect(screen.getByTestId('page-table')).toBeInTheDocument();
  });

  describe('in Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should show upload collection button in toolbar', () => {
      renderHubNamespaceCollections();
      const toolbarActions = screen.getAllByTestId('toolbar-action');
      expect(toolbarActions.some((el) => el.textContent === 'Upload collection')).toBe(true);
    });

    it('should show upload button in empty state', () => {
      renderHubNamespaceCollections();
      expect(screen.getByTestId('upload-collection-link')).toBeInTheDocument();
    });

    it('should show standard empty state description', () => {
      renderHubNamespaceCollections();
      expect(screen.getByTestId('empty-state-description').textContent).toBe(
        'To get started, upload a collection.'
      );
    });

    it('should include namespace in upload link', () => {
      renderHubNamespaceCollections('my-namespace');
      const uploadLink = screen.getByTestId('upload-collection-link');
      expect(uploadLink.getAttribute('href')).toContain('namespace=my-namespace');
    });
  });

  describe('in Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    describe('when user has access to namespace (my-namespaces returns data)', () => {
      beforeEach(() => {
        mockMyNamespaceResponse = { name: 'test-namespace', pulp_href: '/pulp/1/' };
      });

      it('should show upload collection button in toolbar', () => {
        renderHubNamespaceCollections();
        const toolbarActions = screen.getAllByTestId('toolbar-action');
        expect(toolbarActions.some((el) => el.textContent === 'Upload collection')).toBe(true);
      });

      it('should show upload button in empty state', () => {
        renderHubNamespaceCollections();
        expect(screen.getByTestId('upload-collection-link')).toBeInTheDocument();
      });

      it('should show standard empty state description', () => {
        renderHubNamespaceCollections();
        expect(screen.getByTestId('empty-state-description').textContent).toBe(
          'To get started, upload a collection.'
        );
      });
    });

    describe('when user does not have access to namespace (my-namespaces returns null)', () => {
      beforeEach(() => {
        mockMyNamespaceResponse = null;
      });

      it('should not show upload collection button in toolbar', () => {
        renderHubNamespaceCollections();
        const toolbarActions = screen.getAllByTestId('toolbar-action');
        // The filter removes the "Upload collection" button
        expect(toolbarActions.some((el) => el.textContent === 'Upload collection')).toBe(false);
      });

      it('should not show upload button in empty state', () => {
        renderHubNamespaceCollections();
        expect(screen.queryByTestId('upload-collection-link')).not.toBeInTheDocument();
      });

      it('should show no-access empty state description', () => {
        renderHubNamespaceCollections();
        expect(screen.getByTestId('empty-state-description').textContent).toBe(
          'Collections will appear once uploaded.'
        );
      });
    });
  });
});
