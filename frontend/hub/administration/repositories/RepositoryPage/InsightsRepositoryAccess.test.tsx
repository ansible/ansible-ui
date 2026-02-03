import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InsightsRepositoryAccess } from './InsightsRepositoryAccess';

// Mock the LoadingPage component
vi.mock('@ansible/ansible-ui-framework', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
}));

// Mock InsightsAccessTab to verify it receives correct props
vi.mock('../../../common/InsightsAccessTab', () => ({
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

// Create mock functions
const mockListRoles = vi.fn();
const mockAssignRoles = vi.fn();

// Mock the RBAC API
vi.mock('../../../common/api/pulp-rbac', () => ({
  AnsibleRepositoryRbacAPI: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    listRoles: (id: string, params?: Record<string, unknown>) => mockListRoles(id, params),
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  assignRoles: (roles: unknown[]) => mockAssignRoles(roles),
}));

const mockRepository = {
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
  name: 'test-repository',
  description: 'Test repository',
};

// Mock useGet hook
const mockUseGet = vi.fn<() => { data?: unknown; error?: Error; refresh: () => void }>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => mockUseGet(),
}));

describe('InsightsRepositoryAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListRoles.mockResolvedValue({ roles: [] });
    mockAssignRoles.mockReturnValue({ users: [], groups: [] });
  });

  const renderWithRouter = (repoName = 'test-repository') => {
    return render(
      <MemoryRouter initialEntries={[`/repositories/${repoName}/access`]}>
        <Routes>
          <Route path="/repositories/:id/access" element={<InsightsRepositoryAccess />} />
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

  it('should show error when repository fetch fails', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('should show error when pulpId cannot be extracted', () => {
    mockUseGet.mockReturnValue({
      data: { results: [{ ...mockRepository, pulp_href: '' }] },
      error: undefined,
      refresh: vi.fn(),
    });

    renderWithRouter();

    expect(screen.getByText('Failed to get repository ID')).toBeInTheDocument();
  });

  it('should fetch RBAC data and pass to InsightsAccessTab', async () => {
    mockUseGet.mockReturnValue({
      data: { results: [mockRepository] },
      error: undefined,
      refresh: vi.fn(),
    });

    mockListRoles.mockResolvedValue({
      roles: [{ role: 'admin', users: ['alice'], groups: ['admins'] }],
    });
    mockAssignRoles.mockReturnValue({
      users: [{ username: 'alice', object_roles: ['admin'] }],
      groups: [{ name: 'admins', object_roles: ['admin'] }],
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
    });

    expect(screen.getByTestId('users-count')).toHaveTextContent('1');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('1');
    expect(screen.getByTestId('resource-name')).toHaveTextContent('test-repository');
  });

  it('should show error when RBAC fetch fails', async () => {
    mockUseGet.mockReturnValue({
      data: { results: [mockRepository] },
      error: undefined,
      refresh: vi.fn(),
    });

    mockListRoles.mockRejectedValue(new Error('RBAC fetch failed'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('RBAC fetch failed')).toBeInTheDocument();
    });
  });
});
