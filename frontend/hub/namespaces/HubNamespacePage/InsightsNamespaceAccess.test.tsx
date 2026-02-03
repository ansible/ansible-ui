import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InsightsNamespaceAccess } from './InsightsNamespaceAccess';

// Mock the LoadingPage component
vi.mock('@ansible/ansible-ui-framework', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
}));

// Mock InsightsAccessTab to verify it receives correct props
vi.mock('../../common/InsightsAccessTab', () => ({
  InsightsAccessTab: ({
    users,
    groups,
    resourceName,
  }: {
    users: unknown[];
    groups: unknown[];
    resourceName?: string;
  }) => (
    <div data-testid="insights-access-tab">
      <div data-testid="users-count">{users.length}</div>
      <div data-testid="groups-count">{groups.length}</div>
      {resourceName && <div data-testid="resource-name">{resourceName}</div>}
    </div>
  ),
}));

const mockNamespaceWithAccess = {
  pulp_href: '/api/galaxy/_ui/v1/namespaces/test_namespace/',
  id: 1,
  name: 'test_namespace',
  company: 'Test Company',
  email: 'test@example.com',
  avatar_url: '',
  description: 'Test namespace description',
  links: [],
  users: [
    { username: 'alice', object_roles: ['admin', 'viewer'] },
    { username: 'bob', object_roles: ['viewer'] },
  ],
  groups: [
    { id: 1, name: 'admins', object_roles: ['admin'] },
    { id: 2, name: 'viewers', object_roles: ['viewer'] },
  ],
  related_fields: {},
  resources: '',
};

const mockNamespaceNoAccess = {
  ...mockNamespaceWithAccess,
  users: [],
  groups: [],
};

// Mock useGet hook
const mockUseGet = vi.fn<() => { data?: unknown; error?: Error; refresh: () => void }>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  useGet: (): { data?: unknown; error?: Error; refresh: () => void } => mockUseGet(),
}));

describe('InsightsNamespaceAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (namespaceName = 'test_namespace') => {
    return render(
      <MemoryRouter initialEntries={[`/namespaces/${namespaceName}/access`]}>
        <Routes>
          <Route path="/namespaces/:id/access" element={<InsightsNamespaceAccess />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should show loading state initially', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      error: undefined,
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('should pass users and groups to InsightsAccessTab', () => {
    mockUseGet.mockReturnValue({
      data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
      error: undefined,
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
    expect(screen.getByTestId('users-count')).toHaveTextContent('2');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('2');
    expect(screen.getByTestId('resource-name')).toHaveTextContent('test_namespace');
  });

  it('should pass empty arrays when namespace has no access configured', () => {
    mockUseGet.mockReturnValue({
      data: { meta: { count: 1 }, data: [mockNamespaceNoAccess] },
      error: undefined,
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
    expect(screen.getByTestId('users-count')).toHaveTextContent('0');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('0');
  });

  it('should show error when API fails', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('should handle missing namespace data gracefully', () => {
    mockUseGet.mockReturnValue({
      data: { meta: { count: 0 }, data: [] },
      error: undefined,
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
    expect(screen.getByTestId('users-count')).toHaveTextContent('0');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('0');
  });
});
