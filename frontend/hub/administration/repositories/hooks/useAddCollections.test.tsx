/* eslint-disable i18next/no-literal-string */
import { render, renderHook, act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { hubAPI, pulpAPI } from '../../../common/api/formatPath';
import { useCollectionColumns, useAddCollections } from './useAddCollections';

// Mock useHubContext
vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      display_signatures: false,
      can_upload_signatures: false,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

vi.mock('../../../main/HubRoutes', () => ({
  HubRoute: {
    CollectionPage: 'CollectionPage',
    RepositoryDetails: 'RepositoryDetails',
    NamespaceDetails: 'NamespaceDetails',
  },
}));

const mockPushDialog = vi.fn();
const mockPopDialog = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    usePageDialogs: () => ({ pushDialog: mockPushDialog, popDialog: mockPopDialog }),
  };
});

const mockCollection = {
  collection_version: {
    namespace: 'amazon',
    name: 'aws',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/test/',
    description: 'AWS collection',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    contents: [],
    dependencies: {},
  },
  repository: {
    name: 'published',
    pulp_href: '/test/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
  },
  namespace_metadata: {
    pulp_href: '/test/',
    name: 'amazon',
    company: 'Amazon Web Services',
    description: '',
    avatar_url: '',
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

function renderUseCollectionColumns() {
  return renderHook(() => useCollectionColumns(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useCollectionColumns (useAddCollections)', () => {
  it('should return an array of table columns', () => {
    const { result } = renderUseCollectionColumns();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should have a Name column', () => {
    const { result } = renderUseCollectionColumns();
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    if (nameColumn && 'value' in nameColumn) {
      expect(nameColumn.value!(mockCollection)).toBe('aws');
    }
  });

  it('should have a "Provided by" column that uses namespaceTitle', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    expect(providedByColumn).toBeDefined();

    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(mockCollection);
      // In non-insights mode, namespaceTitle returns the namespace name
      expect(value).toContain('amazon');
    }
  });

  it('should display "Provided by" with namespace name when company is empty', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    const collectionNoCompany = {
      ...mockCollection,
      namespace_metadata: { ...mockCollection.namespace_metadata, company: '' },
    };
    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(collectionNoCompany);
      expect(value).toContain('amazon');
    }
  });

  it('should display "Provided by" with namespace name when namespace_metadata is missing', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    const collectionNoMetadata = {
      ...mockCollection,
      namespace_metadata: undefined,
    };
    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(collectionNoMetadata);
      expect(value).toContain('amazon');
    }
  });

  it('should have Repository column', () => {
    const { result } = renderUseCollectionColumns();
    const repoColumn = result.current.find((col) => col.header === 'Repository');
    expect(repoColumn).toBeDefined();
    if (repoColumn && 'value' in repoColumn) {
      expect(repoColumn.value!(mockCollection)).toBe('published');
    }
  });

  it('should have Namespace column', () => {
    const { result } = renderUseCollectionColumns();
    const nsColumn = result.current.find((col) => col.header === 'Namespace');
    expect(nsColumn).toBeDefined();
    if (nsColumn && 'value' in nsColumn) {
      expect(nsColumn.value!(mockCollection)).toBe('amazon');
    }
  });

  it('renders linked collection name cell', () => {
    const { result } = renderUseCollectionColumns();
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    if (nameColumn && 'cell' in nameColumn && nameColumn.cell) {
      render(<MemoryRouter>{nameColumn.cell(mockCollection)}</MemoryRouter>);
      expect(screen.getByText('aws')).toBeInTheDocument();
    }
  });

  it('renders linked repository and namespace cells', () => {
    const { result } = renderUseCollectionColumns();
    const repoColumn = result.current.find((col) => col.header === 'Repository');
    const nsColumn = result.current.find((col) => col.header === 'Namespace');
    if (repoColumn && 'cell' in repoColumn && repoColumn.cell) {
      render(<MemoryRouter>{repoColumn.cell(mockCollection)}</MemoryRouter>);
      expect(screen.getByText('published')).toBeInTheDocument();
    }
    if (nsColumn && 'cell' in nsColumn && nsColumn.cell) {
      render(<MemoryRouter>{nsColumn.cell(mockCollection)}</MemoryRouter>);
      expect(screen.getByText('amazon')).toBeInTheDocument();
    }
  });
});

describe('useAddCollections', () => {
  const REPO_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const TASK_UUID = 'cccccccc-dddd-eeee-ffff-000000000001';

  const mockRepository = {
    name: 'published',
    description: '',
    pulp_href: `/pulp/api/v3/repositories/ansible/ansible/${REPO_UUID}/`,
    pulp_created: '2026-01-01T00:00:00Z',
    pulp_labels: {},
    private: false,
    retain_repo_versions: 1,
    remote: null,
    gpgkey: null,
    last_sync_task: {
      state: 'completed',
      task_id: '1',
      started_at: '2026-01-01T00:00:00Z',
      finished_at: '2026-01-01T00:00:00Z',
    },
    last_synced_metadata_time: null,
    latest_version_href: '',
    versions_href: '',
  };

  it('opens add collections modal via page dialog', () => {
    mockPushDialog.mockClear();
    const refresh = vi.fn();
    const { result } = renderHook(() => useAddCollections(mockRepository, refresh), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current();
    });

    expect(mockPushDialog).toHaveBeenCalledTimes(1);
  });

  describe('AddCollectionToRepositoryModal', () => {
    const modalServer = setupServer(
      http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
        HttpResponse.json({ count: 1, results: [mockCollection] })
      ),
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ ...mockRepository, latest_version_href: '/v/1/' }],
        })
      ),
      http.post(pulpAPI`/repositories/ansible/ansible/${REPO_UUID}/modify/`, () =>
        HttpResponse.json({ task: `/pulp/api/v3/tasks/${TASK_UUID}/` })
      ),
      http.get(pulpAPI`/tasks/${TASK_UUID}/`, () =>
        HttpResponse.json({ state: 'completed', pulp_href: `/pulp/api/v3/tasks/${TASK_UUID}/` })
      )
    );

    beforeAll(() => modalServer.listen({ onUnhandledRequest: 'bypass' }));
    afterEach(() => modalServer.resetHandlers());
    afterAll(() => modalServer.close());

    it('renders modal and adds selected collections', async () => {
      mockPushDialog.mockClear();
      mockPopDialog.mockClear();
      const refresh = vi.fn();
      const { result } = renderHook(() => useAddCollections(mockRepository, refresh), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      act(() => {
        result.current();
      });

      const modalElement = mockPushDialog.mock.calls[0]?.[0] as React.ReactElement;
      render(<MemoryRouter>{modalElement}</MemoryRouter>);

      expect(await screen.findByText('Add collections versions to repository')).toBeInTheDocument();

      const selectButton = screen.getByRole('button', { name: 'Select' });
      expect(selectButton).toBeDisabled();

      const user = userEvent.setup();
      const checkboxes = await screen.findAllByRole('checkbox');
      const rowCheckbox =
        checkboxes.find((box) => box.getAttribute('name') !== 'select-all') ?? checkboxes[1];
      await user.click(rowCheckbox!);

      await waitFor(() => {
        expect(selectButton).not.toBeDisabled();
      });

      await user.click(selectButton);

      await waitFor(() => {
        expect(mockPopDialog).toHaveBeenCalled();
        expect(refresh).toHaveBeenCalled();
      });
    }, 30000);

    it('closes modal when cancel is clicked', async () => {
      mockPushDialog.mockClear();
      mockPopDialog.mockClear();
      const refresh = vi.fn();
      const { result } = renderHook(() => useAddCollections(mockRepository, refresh), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      act(() => {
        result.current();
      });

      const modalElement = mockPushDialog.mock.calls[0]?.[0] as React.ReactElement;
      render(<MemoryRouter>{modalElement}</MemoryRouter>);

      await screen.findByText('Add collections versions to repository');
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockPopDialog).toHaveBeenCalled();
    });

    it('shows error when modify request fails', async () => {
      modalServer.use(
        http.post(pulpAPI`/repositories/ansible/ansible/${REPO_UUID}/modify/`, () =>
          HttpResponse.json({ detail: 'failed' }, { status: 400 })
        )
      );

      mockPushDialog.mockClear();
      const refresh = vi.fn();
      const { result } = renderHook(() => useAddCollections(mockRepository, refresh), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      act(() => {
        result.current();
      });

      const modalElement = mockPushDialog.mock.calls[0]?.[0] as React.ReactElement;
      render(<MemoryRouter>{modalElement}</MemoryRouter>);

      const user = userEvent.setup();
      const checkboxes = await screen.findAllByRole('checkbox');
      const rowCheckbox =
        checkboxes.find((box) => box.getAttribute('name') !== 'select-all') ?? checkboxes[1];
      await user.click(rowCheckbox!);

      await user.click(screen.getByRole('button', { name: 'Select' }));

      expect(await screen.findByText(/Can not add collections to repository/i)).toBeInTheDocument();
      expect(refresh).not.toHaveBeenCalled();
    }, 30000);
  });
});
