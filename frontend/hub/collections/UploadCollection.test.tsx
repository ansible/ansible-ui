/* eslint-disable i18next/no-literal-string */
import { render, screen, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { UploadCollection, useRepositoriesColumns, useRepoFilters } from './UploadCollection';

const {
  mockPageNavigate,
  mockRequestGet,
  mockGetRepositoryBasePath,
  mockHubPostRequestFile,
  mockSearchParams,
  mockUseHubView,
  submitRef,
} = vi.hoisted(() => ({
  mockPageNavigate: vi.fn(),
  mockRequestGet: vi.fn(),
  mockGetRepositoryBasePath: vi.fn(),
  mockHubPostRequestFile: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
  mockUseHubView: vi.fn(),
  submitRef: {
    current: null as ((data: { file: File }) => Promise<void> | void) | null,
  },
}));

// Mock isInsightsMode
vi.mock('../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../common/isInsights';

// Mock useRepositories hook
vi.mock('../administration/repositories/hooks/useRepositories', () => ({
  useRepositories: () => ({
    data: { results: [{ name: 'test-repo', pulp_href: '/pulp/api/v3/repos/1/' }] },
    error: null,
    refresh: vi.fn(),
  }),
}));

// Mock useHubView
vi.mock('../common/useHubView', () => ({
  useHubView: (...args: unknown[]): unknown => mockUseHubView(...args),
}));

// Mock useGet and useGetRequest
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetRequest: () => vi.fn().mockResolvedValue({ results: [{ base_path: 'staging' }] }),
}));

// Mock requestGet
vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: (...args: unknown[]): unknown => mockRequestGet(...args),
}));

// Mock hubPostRequestFile
vi.mock('../common/api/request', () => ({
  hubPostRequestFile: (...args: unknown[]): unknown => mockHubPostRequestFile(...args),
}));

// Mock getRepositoryBasePath
vi.mock('../common/api/hub-api-utils', () => ({
  getRepositoryBasePath: (...args: unknown[]): unknown => mockGetRepositoryBasePath(...args),
}));

// Mock the framework components
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="page-layout">{children}</div>
    ),
    PageHeader: ({ title }: { title: string }) => (
      <div data-testid="page-header">
        <h1>{title}</h1>
      </div>
    ),
    PageTable: ({
      onSelect,
      pageItems,
    }: {
      onSelect?: (item: unknown) => void;
      pageItems?: unknown[];
    }) => (
      <div data-testid="page-table">
        {pageItems?.map((item: unknown) => (
          <button
            key={(item as { name: string }).name}
            data-testid={`select-repo-${(item as { name: string }).name}`}
            onClick={() => onSelect?.(item)}
          >
            {(item as { name: string }).name}
          </button>
        ))}
      </div>
    ),
    useGetPageUrl: () => (route: string) => `/hub/${route}`,
    usePageNavigate: () => mockPageNavigate,
    TextCell: ({ text }: { text: string }) => <span>{text}</span>,
    LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
  };
});

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload', () => ({
  PageFormFileUpload: ({ label, name }: { label: string; name: string }) => (
    <div data-testid="file-upload">
      <label>{label}</label>
      <input type="file" name={name} data-testid="file-input" />
    </div>
  ),
}));

vi.mock('@ansible/ansible-ui-framework/components/useURLSearchParams', () => ({
  useURLSearchParams: () => [mockSearchParams.current],
}));

vi.mock('../common/HubPageForm', () => ({
  HubPageForm: ({
    children,
    submitText,
    cancelText,
    onSubmit,
  }: {
    children: React.ReactNode;
    submitText: string;
    cancelText: string;
    onSubmit: (data: { file: File }) => Promise<void>;
  }) => {
    submitRef.current = onSubmit;
    return (
      <form data-testid="hub-page-form">
        {children}
        <button type="submit" data-testid="submit-button">
          {submitText}
        </button>
        <button type="button" data-testid="cancel-button">
          {cancelText}
        </button>
      </form>
    );
  },
}));

vi.mock('../common/HubError', () => ({
  HubError: ({ error }: { error: { message: string } }) => (
    <div data-testid="hub-error">{error.message}</div>
  ),
}));

vi.mock('@patternfly/react-core', async () => {
  const actual = await vi.importActual('@patternfly/react-core');
  return {
    ...actual,
    Radio: ({
      label,
      id,
      isChecked,
      onChange,
    }: {
      label: string;
      id: string;
      isChecked: boolean;
      onChange: (event: unknown, checked: boolean) => void;
    }) => (
      <label data-testid={id}>
        <input
          type="radio"
          checked={isChecked}
          onChange={(e) => onChange(e, e.target.checked)}
          data-testid={`radio-${id}`}
        />
        {label}
      </label>
    ),
  };
});

function defaultUseHubViewReturn() {
  return {
    pageItems: [
      { name: 'staging', pulp_href: '/pulp/api/v3/repos/staging/' },
      { name: 'published', pulp_href: '/pulp/api/v3/repos/published/' },
    ],
    itemCount: 2,
    isLoading: false,
    error: null,
    unselectItemsAndRefresh: vi.fn(),
    refresh: vi.fn(),
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    isSelected: vi.fn(),
    selectedItems: [],
  };
}

function renderUploadCollection() {
  return render(
    <MemoryRouter>
      <UploadCollection />
    </MemoryRouter>
  );
}

describe('UploadCollection', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    mockUseHubView.mockReturnValue(defaultUseHubViewReturn());
    mockRequestGet.mockResolvedValue({
      data: [
        {
          name: 'test-namespace',
          related_fields: { my_permissions: ['galaxy.upload_to_namespace'] },
        },
      ],
    });
    mockGetRepositoryBasePath.mockResolvedValue('staging');
    mockHubPostRequestFile.mockResolvedValue({});
    mockSearchParams.current = new URLSearchParams();
    submitRef.current = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page layout', () => {
    renderUploadCollection();
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should render the page header with title', () => {
    renderUploadCollection();
    expect(screen.getByRole('heading', { name: 'Upload collection' })).toBeInTheDocument();
  });

  it('should render the form', () => {
    renderUploadCollection();
    expect(screen.getByTestId('hub-page-form')).toBeInTheDocument();
  });

  it('should render file upload input', () => {
    renderUploadCollection();
    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should render submit and cancel buttons', () => {
    renderUploadCollection();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  describe('in Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should render PlatformUploadCollectionByFile component', () => {
      renderUploadCollection();
      expect(screen.getByText('Staging repos')).toBeInTheDocument();
    });

    it('should render staging radio button', () => {
      renderUploadCollection();
      expect(screen.getByTestId('radio-staging')).toBeInTheDocument();
    });

    it('should render non-pipeline radio button', () => {
      renderUploadCollection();
      expect(screen.getByTestId('radio-non-pipeline')).toBeInTheDocument();
    });
  });

  describe('in Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should render InsightsUploadCollectionByFile component', () => {
      renderUploadCollection();
      expect(screen.getByText('Staging Repos')).toBeInTheDocument();
    });

    it('should render staging radio button', () => {
      renderUploadCollection();
      expect(screen.getByTestId('radio-staging')).toBeInTheDocument();
    });

    it('should render all repos radio button', () => {
      renderUploadCollection();
      expect(screen.getByTestId('radio-all')).toBeInTheDocument();
    });
  });

  describe('InsightsUploadCollectionByFile submit logic', () => {
    const mockFile = new File(['content'], 'testnamespace-testcollection-1.0.0.tar.gz', {
      type: 'application/gzip',
    });

    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should show error when no file is selected', async () => {
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({} as { file: File });
      });
      expect(screen.getByTestId('hub-error')).toHaveTextContent(
        'Please select the file to be uploaded.'
      );
    });

    it('should show error when no repository is selected', async () => {
      mockUseHubView.mockReturnValue({
        ...defaultUseHubViewReturn(),
        pageItems: [{ name: 'published', pulp_href: '/pulp/api/v3/repos/published/' }],
      });
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({ file: mockFile });
      });
      expect(screen.getByTestId('hub-error')).toHaveTextContent('Please select a repository.');
    });

    it('should show error when namespace does not match URL param', async () => {
      mockSearchParams.current = new URLSearchParams('namespace=differentnamespace');
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({ file: mockFile });
      });
      expect(screen.getByTestId('hub-error')).toHaveTextContent(
        'Namespace "testnamespace" does not match namespace "differentnamespace".'
      );
    });

    it('should show error when namespace is not found', async () => {
      mockRequestGet.mockResolvedValue({ data: [] });
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({ file: mockFile });
      });
      expect(screen.getByTestId('hub-error')).toHaveTextContent(
        'Namespace "testnamespace" not found or you do not have permission to upload to it.'
      );
    });

    it('should show error when user lacks upload permission', async () => {
      mockRequestGet.mockResolvedValue({
        data: [
          {
            name: 'testnamespace',
            related_fields: { my_permissions: ['galaxy.view_namespace'] },
          },
        ],
      });
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({ file: mockFile });
      });
      expect(screen.getByTestId('hub-error')).toHaveTextContent(
        'You do not have permission to upload to namespace "testnamespace".'
      );
    });

    it('should show error when distribution base_path is not found', async () => {
      mockGetRepositoryBasePath.mockResolvedValue(undefined);
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({ file: mockFile });
      });
      expect(screen.getByTestId('hub-error')).toHaveTextContent(
        'Can not find distribution for selected repository.'
      );
    });

    it('should navigate to My Imports on successful staging upload', async () => {
      renderUploadCollection();
      await act(async () => {
        await submitRef.current?.({ file: mockFile });
      });
      expect(mockHubPostRequestFile).toHaveBeenCalledWith(
        expect.stringContaining('/collections/artifacts/'),
        mockFile
      );
      expect(mockPageNavigate).toHaveBeenCalledWith('hub-my-imports', {
        query: { namespace: 'testnamespace' },
      });
    });

    it('should let API errors from requestGet propagate', async () => {
      const apiError = new Error('Network error');
      mockRequestGet.mockRejectedValue(apiError);
      renderUploadCollection();
      let thrownError: unknown;
      await act(async () => {
        try {
          await submitRef.current?.({ file: mockFile });
        } catch (err) {
          thrownError = err;
        }
      });
      expect(thrownError).toBe(apiError);
    });

    it('should let API errors from getRepositoryBasePath propagate', async () => {
      const apiError = new Error('Distribution lookup failed');
      mockGetRepositoryBasePath.mockRejectedValue(apiError);
      renderUploadCollection();
      let thrownError: unknown;
      await act(async () => {
        try {
          await submitRef.current?.({ file: mockFile });
        } catch (err) {
          thrownError = err;
        }
      });
      expect(thrownError).toBe(apiError);
    });

    it('should let API errors from hubPostRequestFile propagate', async () => {
      const apiError = new Error('Upload failed');
      mockHubPostRequestFile.mockRejectedValue(apiError);
      renderUploadCollection();
      let thrownError: unknown;
      await act(async () => {
        try {
          await submitRef.current?.({ file: mockFile });
        } catch (err) {
          thrownError = err;
        }
      });
      expect(thrownError).toBe(apiError);
    });
  });
});

describe('useRepositoriesColumns', () => {
  it('should return an array of table columns', () => {
    const { result } = renderHook(() => useRepositoriesColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(2);
  });

  it('should have Name column', () => {
    const { result } = renderHook(() => useRepositoriesColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
  });

  it('should have Description column', () => {
    const { result } = renderHook(() => useRepositoriesColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const descColumn = result.current.find((col) => col.header === 'Description');
    expect(descColumn).toBeDefined();
  });
});

describe('useRepoFilters', () => {
  it('should return an array of toolbar filters', () => {
    const { result } = renderHook(() => useRepoFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(1);
  });

  it('should have Name filter', () => {
    const { result } = renderHook(() => useRepoFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const nameFilter = result.current.find((filter) => filter.key === 'name');
    expect(nameFilter).toBeDefined();
    expect(nameFilter?.label).toBe('Name');
  });
});
