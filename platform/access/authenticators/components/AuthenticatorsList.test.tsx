import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Authenticator } from '../../../interfaces/Authenticator';
import type { IPlatformView } from '../../../hooks/usePlatformView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { AuthenticatorsList } from './AuthenticatorsList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const toolbarFilters = [{ key: 'name' }];
const tableColumns = [{ header: 'Name', cell: () => null }];
const toolbarActions = [{ type: 'Button', label: 'toolbar' }];
const rowActions = [{ type: 'Button', label: 'row' }];

vi.mock('../hooks/useAuthenticatorsFilters', () => ({
  useAuthenticatorsFilters: () => toolbarFilters,
}));

vi.mock('../hooks/useAuthenticatorColumns', () => ({
  useAuthenticatorsColumns: () => tableColumns,
}));

vi.mock('../hooks/useAuthenticatorActions', () => ({
  useAuthenticatorToolbarActions: () => toolbarActions,
  useAuthenticatorRowActions: () => rowActions,
}));

type UseOptionsResult = {
  data: { actions?: Record<string, unknown> } | undefined;
  isLoading: boolean;
};

const mockUseOptions = vi.fn<() => UseOptionsResult>();
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: (): UseOptionsResult => mockUseOptions(),
}));

const mockGetPageUrl = vi.fn((route: string) => `/mock/${route}`);
vi.mock('@ansible/ansible-ui-framework', () => ({
  PageLayout: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
  PageHeader: (props: { title: string }) => <h1>{props.title}</h1>,
  PageTable: (props: Record<string, unknown>) => (
    <div
      data-testid="page-table"
      data-id={String(props.id ?? '')}
      data-error-title={String(props.errorStateTitle ?? '')}
    >
      {props.emptyState as React.ReactNode}
    </div>
  ),
  useGetPageUrl: (): typeof mockGetPageUrl => mockGetPageUrl,
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageLoadingTable', () => ({
  PageLoadingTable: () => <div data-testid="page-loading-table" />,
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageTableEmptyState', () => ({
  PageTableEmptyState: (props: {
    title: string;
    description: string;
    children?: React.ReactNode;
    icon?: unknown;
  }) => (
    <div data-testid="page-empty-state">
      <span data-testid="empty-title">{props.title}</span>
      <span data-testid="empty-description">{props.description}</span>
      {props.icon !== undefined && props.icon !== null ? (
        <span data-testid="empty-has-icon">icon</span>
      ) : null}
      {props.children}
    </div>
  ),
}));

vi.mock('@ansible/ansible-ui-framework/components/ButtonLink', () => ({
  ButtonLink: (props: { href: string; children: React.ReactNode }) => (
    <a data-testid="create-auth-link" href={props.href}>
      {props.children}
    </a>
  ),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com/auth',
}));

const minimalView = {
  page: 1,
  perPage: 10,
  setPage: vi.fn(),
  setPerPage: vi.fn(),
  sort: undefined,
  setSort: vi.fn(),
  sortDirection: 'asc' as const,
  setSortDirection: vi.fn(),
  filterState: {},
  setFilterState: vi.fn(),
  clearAllFilters: vi.fn(),
  refresh: async () => {},
  itemCount: 0,
  pageItems: [] as Authenticator[],
  keyFn: (item: Authenticator) => item.id,
  isSelected: () => false,
  selectedItems: [] as Authenticator[],
  selectItem: vi.fn(),
  unselectItem: vi.fn(),
  selectItems: vi.fn(),
  unselectAll: vi.fn(),
  unselectItemsAndRefresh: async () => {},
  selectItemsAndRefresh: async () => {},
} as unknown as IPlatformView<Authenticator>;

const mockUsePlatformView = vi.fn<(options: unknown) => IPlatformView<Authenticator>>();

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: (options: unknown): IPlatformView<Authenticator> => mockUsePlatformView(options),
}));

function renderList() {
  return render(
    <MemoryRouter>
      <AuthenticatorsList />
    </MemoryRouter>
  );
}

describe('AuthenticatorsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageUrl.mockImplementation((route: string) => `/mock/${route}`);
    mockUsePlatformView.mockReturnValue(minimalView);
    mockUseOptions.mockReturnValue({
      data: { actions: { POST: {} } },
      isLoading: false,
    });
  });

  it('calls usePlatformView with the authenticators gateway URL', () => {
    renderList();
    expect(mockUsePlatformView).toHaveBeenCalledWith({
      url: gatewayAPI`/authenticators/`,
      toolbarFilters,
      tableColumns,
    });
  });

  it('shows PageLoadingTable while OPTIONS request is loading', () => {
    mockUseOptions.mockReturnValue({ data: undefined, isLoading: true });
    renderList();
    expect(screen.getByTestId('page-loading-table')).toBeInTheDocument();
    expect(screen.queryByTestId('page-table')).not.toBeInTheDocument();
  });

  it('renders PageTable with toolbar props and error title when options loaded', () => {
    renderList();
    const table = screen.getByTestId('page-table');
    expect(table).toHaveAttribute('data-id', 'platform-authenticators-table');
    expect(table).toHaveAttribute('data-error-title', 'Error loading authentications');
  });

  it('empty state shows create link when POST is allowed', () => {
    renderList();
    const empty = screen.getByTestId('page-empty-state');
    expect(within(empty).getByTestId('empty-title')).toHaveTextContent(
      'There are currently no authentications added.'
    );
    const link = within(empty).getByTestId('create-auth-link');
    expect(link).toHaveAttribute('href', `/mock/${PlatformRoute.CreateAuthenticator}`);
    expect(link).toHaveTextContent('Create authentication');
  });

  it('empty state shows permission message when POST is not allowed', () => {
    mockUseOptions.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
    });
    renderList();
    const empty = screen.getByTestId('page-empty-state');
    expect(within(empty).getByTestId('empty-title')).toHaveTextContent(
      'You do not have permission to create an authentication'
    );
    expect(within(empty).getByTestId('empty-has-icon')).toBeInTheDocument();
    expect(within(empty).queryByTestId('create-auth-link')).not.toBeInTheDocument();
  });
});
