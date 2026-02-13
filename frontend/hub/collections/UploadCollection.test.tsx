/* eslint-disable i18next/no-literal-string */
import { render, screen, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { UploadCollection, useRepositoriesColumns, useRepoFilters } from './UploadCollection';

// Mock isInsightsMode
vi.mock('../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
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
  useHubView: () => ({
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
  }),
}));

// Mock useGet and useGetRequest
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetRequest: () => vi.fn().mockResolvedValue({ results: [{ base_path: 'staging' }] }),
}));

// Mock requestGet
vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn().mockResolvedValue({
    data: [
      {
        name: 'test-namespace',
        related_fields: { my_permissions: ['galaxy.upload_to_namespace'] },
      },
    ],
  }),
}));

// Mock hubPostRequestFile
vi.mock('../common/api/request', () => ({
  hubPostRequestFile: vi.fn().mockResolvedValue({}),
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
    usePageNavigate: () => vi.fn(),
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
  useURLSearchParams: () => [new URLSearchParams()],
}));

vi.mock('../common/HubPageForm', () => ({
  HubPageForm: ({
    children,
    submitText,
    cancelText,
  }: {
    children: React.ReactNode;
    submitText: string;
    cancelText: string;
  }) => (
    <form data-testid="hub-page-form">
      {children}
      <button type="submit" data-testid="submit-button">
        {submitText}
      </button>
      <button type="button" data-testid="cancel-button">
        {cancelText}
      </button>
    </form>
  ),
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
      // Platform mode shows "Staging repos" label
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
      // Insights mode shows "Staging Repos" label (capital R)
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
