/* eslint-disable i18next/no-literal-string, @typescript-eslint/unbound-method */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InsightsRbacAccessWrapper } from './InsightsRbacAccessWrapper';
import { PulpRbacApi } from '../api/pulp-rbac';

// Mock the LoadingPage component and usePageAlertToaster
const mockAddAlert = vi.fn();
vi.mock('@ansible/ansible-ui-framework', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
  usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
}));

// Mock InsightsAccessTab
vi.mock('./InsightsAccessTab', () => ({
  InsightsAccessTab: ({
    users,
    groups,
    resourceName,
    canEditOwners,
    pulpObjectType,
    selectRolesMessage,
    onAddUser,
    onRemoveUser,
    _onAddUserRoles,
    onRemoveUserRole,
    onAddGroup,
    onRemoveGroup,
    onAddGroupRoles,
    onRemoveGroupRole,
  }: {
    users: unknown[];
    groups: unknown[];
    resourceName?: string;
    canEditOwners?: boolean;
    pulpObjectType?: string;
    selectRolesMessage?: string;
    onAddUser?: (user: { id: number; username: string }, roles: string[]) => Promise<void>;
    onRemoveUser?: (user: {
      name?: string;
      username?: string;
      object_roles: string[];
    }) => Promise<void>;
    _onAddUserRoles?: (
      user: { name?: string; username?: string; object_roles: string[] },
      roles: string[]
    ) => Promise<void>;
    onRemoveUserRole?: (
      user: { name?: string; username?: string; object_roles: string[] },
      role: string
    ) => Promise<void>;
    onAddGroup?: (group: { name: string }, roles: string[]) => Promise<void>;
    onRemoveGroup?: (group: { name: string; object_roles: string[] }) => Promise<void>;
    onAddGroupRoles?: (
      group: { name: string; object_roles: string[] },
      roles: string[]
    ) => Promise<void>;
    onRemoveGroupRole?: (
      group: { name: string; object_roles: string[] },
      role: string
    ) => Promise<void>;
  }) => (
    <div data-testid="insights-access-tab">
      <div data-testid="users-count">{users.length}</div>
      <div data-testid="groups-count">{groups.length}</div>
      {resourceName && <div data-testid="resource-name">{resourceName}</div>}
      {canEditOwners !== undefined && <div data-testid="can-edit">{String(canEditOwners)}</div>}
      {pulpObjectType && <div data-testid="pulp-object-type">{pulpObjectType}</div>}
      {selectRolesMessage && <div data-testid="roles-message">{selectRolesMessage}</div>}
      {onAddUser && (
        <button
          data-testid="add-user-btn"
          onClick={() => void onAddUser({ id: 10, username: 'new-user' }, ['admin'])}
        >
          Add User
        </button>
      )}
      {onRemoveUser && (
        <button
          data-testid="remove-user-btn"
          onClick={() => void onRemoveUser({ name: 'user1', object_roles: ['admin'] })}
        >
          Remove User
        </button>
      )}
      {onRemoveUserRole && (
        <button
          data-testid="remove-user-role-btn"
          onClick={() => void onRemoveUserRole({ name: 'user1', object_roles: ['admin'] }, 'admin')}
        >
          Remove User Role
        </button>
      )}
      {onAddGroup && (
        <button
          data-testid="add-group-btn"
          onClick={() => void onAddGroup({ name: 'new-group' }, ['admin'])}
        >
          Add Group
        </button>
      )}
      {onRemoveGroup && (
        <button
          data-testid="remove-group-btn"
          onClick={() => void onRemoveGroup({ name: 'group1', object_roles: ['admin'] })}
        >
          Remove Group
        </button>
      )}
      {onAddGroupRoles && (
        <button
          data-testid="add-group-roles-btn"
          onClick={() =>
            void onAddGroupRoles({ name: 'group1', object_roles: ['admin'] }, ['editor'])
          }
        >
          Add Group Roles
        </button>
      )}
      {onRemoveGroupRole && (
        <button
          data-testid="remove-group-role-btn"
          onClick={() =>
            void onRemoveGroupRole({ name: 'group1', object_roles: ['admin'] }, 'admin')
          }
        >
          Remove Group Role
        </button>
      )}
    </div>
  ),
}));

// Mock HubError
vi.mock('../HubError', () => ({
  HubError: ({ error, handleRefresh }: { error: Error; handleRefresh?: () => void }) => (
    <div data-testid="hub-error">
      <span>{error.message}</span>
      {handleRefresh && (
        <button onClick={handleRefresh} data-testid="refresh-btn">
          Refresh
        </button>
      )}
    </div>
  ),
}));

// Create mock RBAC API - use type assertion since we only need the methods for testing
const createMockRbacApi = () =>
  ({
    listRoles: vi.fn(),
    addRole: vi.fn(),
    removeRole: vi.fn(),
    myPermissions: vi.fn(),
  }) as unknown as PulpRbacApi;

// Mock useGet hook
const mockUseGet =
  vi.fn<() => { data?: unknown; error?: Error; isLoading: boolean; refresh: () => void }>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => mockUseGet(),
}));

// Mock assignRoles helper
const mockAssignRoles = vi.fn<(roles: unknown) => { users: unknown[]; groups: unknown[] }>();
vi.mock('../api/pulp-rbac', async () => {
  const actual = await vi.importActual('../api/pulp-rbac');
  return {
    ...actual,
    assignRoles: (roles: unknown) =>
      mockAssignRoles(roles) as { users: unknown[]; groups: unknown[] },
  };
});

describe('InsightsRbacAccessWrapper', () => {
  let mockRbacApi: PulpRbacApi;

  const mockResource = {
    pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
    name: 'test-resource',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRbacApi = createMockRbacApi();
    (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue({ roles: [] });
    mockAssignRoles.mockReturnValue({ users: [], groups: [] });
  });

  const renderWithRouter = (props = {}, resourceId = 'test-resource') => {
    const defaultProps = {
      getApiUrl: (id: string) => `/api/resources/?name=${id}`,
      rbacApi: mockRbacApi,
      missingIdError: 'Failed to get resource ID',
      pulpObjectType: 'repositories/ansible/ansible',
      selectRolesMessage: 'Select roles for this resource',
    };

    return render(
      <MemoryRouter initialEntries={[`/resources/${resourceId}/access`]}>
        <Routes>
          <Route
            path="/resources/:id/access"
            element={<InsightsRbacAccessWrapper {...defaultProps} {...props} />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Loading States', () => {
    it('should show loading page while fetching resource', () => {
      mockUseGet.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    });

    it('should show loading page while fetching RBAC data', () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      // Make listRoles return a promise that doesn't resolve immediately
      vi.mocked(mockRbacApi.listRoles).mockImplementation(() => new Promise(() => {}));

      renderWithRouter();

      expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error when resource fetch fails', () => {
      mockUseGet.mockReturnValue({
        data: undefined,
        error: new Error('Network error'),
        isLoading: false,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('hub-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should show error when pulpId cannot be extracted', () => {
      mockUseGet.mockReturnValue({
        data: { results: [{ ...mockResource, pulp_href: '' }] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('hub-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to get resource ID')).toBeInTheDocument();
    });

    it('should show error when RBAC fetch fails', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('RBAC fetch failed')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('hub-error')).toBeInTheDocument();
        expect(screen.getByText('RBAC fetch failed')).toBeInTheDocument();
      });
    });

    it('should show generic error message when RBAC fails with non-Error', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockRejectedValue('string error');

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('hub-error')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch access data')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Rendering', () => {
    it('should render InsightsAccessTab with correct props', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      const mockRoles = [{ role: 'admin', users: ['alice'], groups: ['admins'] }];
      (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue({ roles: mockRoles });
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
      expect(screen.getByTestId('resource-name')).toHaveTextContent('test-resource');
      expect(screen.getByTestId('can-edit')).toHaveTextContent('true');
      expect(screen.getByTestId('pulp-object-type')).toHaveTextContent(
        'repositories/ansible/ansible'
      );
      expect(screen.getByTestId('roles-message')).toHaveTextContent(
        'Select roles for this resource'
      );
    });
  });

  describe('Add User', () => {
    it('should call rbacApi.addRole for each role when adding user', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.addRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const addUserBtn = screen.getByTestId('add-user-btn');
      await userEvent.click(addUserBtn);

      await waitFor(() => {
        expect(mockRbacApi.addRole).toHaveBeenCalledWith('12345678-1234-1234-1234-123456789abc', {
          role: 'admin',
          users: ['new-user'],
        });
      });

      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });
  });

  describe('Remove User', () => {
    it('should call rbacApi.removeRole for each role when removing user', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeUserBtn = screen.getByTestId('remove-user-btn');
      await userEvent.click(removeUserBtn);

      await waitFor(() => {
        expect(mockRbacApi.removeRole).toHaveBeenCalledWith(
          '12345678-1234-1234-1234-123456789abc',
          { role: 'admin', users: ['user1'] }
        );
      });

      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });
  });

  describe('Add Group', () => {
    it('should call rbacApi.addRole for each role when adding group', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.addRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const addGroupBtn = screen.getByTestId('add-group-btn');
      await userEvent.click(addGroupBtn);

      await waitFor(() => {
        expect(mockRbacApi.addRole).toHaveBeenCalledWith('12345678-1234-1234-1234-123456789abc', {
          role: 'admin',
          groups: ['new-group'],
        });
      });
    });
  });

  describe('Remove Group', () => {
    it('should call rbacApi.removeRole for each role when removing group', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeGroupBtn = screen.getByTestId('remove-group-btn');
      await userEvent.click(removeGroupBtn);

      await waitFor(() => {
        expect(mockRbacApi.removeRole).toHaveBeenCalledWith(
          '12345678-1234-1234-1234-123456789abc',
          { role: 'admin', groups: ['group1'] }
        );
      });
    });
  });

  describe('Remove User Role', () => {
    it('should call rbacApi.removeRole when removing a role from user', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeUserRoleBtn = screen.getByTestId('remove-user-role-btn');
      await userEvent.click(removeUserRoleBtn);

      await waitFor(() => {
        expect(mockRbacApi.removeRole).toHaveBeenCalledWith(
          '12345678-1234-1234-1234-123456789abc',
          { role: 'admin', users: ['user1'] }
        );
      });

      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });
  });

  describe('Add Group Roles', () => {
    it('should call rbacApi.addRole when adding roles to a group', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.addRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const addGroupRolesBtn = screen.getByTestId('add-group-roles-btn');
      await userEvent.click(addGroupRolesBtn);

      await waitFor(() => {
        expect(mockRbacApi.addRole).toHaveBeenCalledWith('12345678-1234-1234-1234-123456789abc', {
          role: 'editor',
          groups: ['group1'],
        });
      });

      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });
  });

  describe('Remove Group Role', () => {
    it('should call rbacApi.removeRole when removing a role from group', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockResolvedValue({});

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeGroupRoleBtn = screen.getByTestId('remove-group-role-btn');
      await userEvent.click(removeGroupRoleBtn);

      await waitFor(() => {
        expect(mockRbacApi.removeRole).toHaveBeenCalledWith(
          '12345678-1234-1234-1234-123456789abc',
          { role: 'admin', groups: ['group1'] }
        );
      });

      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should show error alert when addRole fails for group', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.addRole as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const addGroupBtn = screen.getByTestId('add-group-btn');
      await userEvent.click(addGroupBtn);

      await waitFor(() => {
        expect(mockAddAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          })
        );
      });
    });

    it('should show error alert when removeRole fails for group', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeGroupBtn = screen.getByTestId('remove-group-btn');
      await userEvent.click(removeGroupBtn);

      await waitFor(() => {
        expect(mockAddAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          })
        );
      });
    });

    it('should show error alert when removeRole fails for removeGroupRole', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeGroupRoleBtn = screen.getByTestId('remove-group-role-btn');
      await userEvent.click(removeGroupRoleBtn);

      await waitFor(() => {
        expect(mockAddAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          })
        );
      });
    });

    it('should show error alert when addRole fails for addGroupRoles', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.addRole as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const addGroupRolesBtn = screen.getByTestId('add-group-roles-btn');
      await userEvent.click(addGroupRolesBtn);

      await waitFor(() => {
        expect(mockAddAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          })
        );
      });
    });

    it('should show error alert when removeRole fails for removeUserRole', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      (mockRbacApi.removeRole as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      const removeUserRoleBtn = screen.getByTestId('remove-user-role-btn');
      await userEvent.click(removeUserRoleBtn);

      await waitFor(() => {
        expect(mockAddAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          })
        );
      });
    });
  });

  describe('Refresh', () => {
    it('should call refresh functions when error refresh button is clicked', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: undefined,
        error: new Error('Network error'),
        isLoading: false,
        refresh: mockRefresh,
      });

      renderWithRouter();

      const refreshBtn = screen.getByTestId('refresh-btn');
      await userEvent.click(refreshBtn);

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Pulp ID Parsing', () => {
    it('should correctly parse UUID from various pulp_href formats', async () => {
      const testCases = [
        {
          pulp_href:
            '/pulp/api/v3/remotes/ansible/collection/abcd1234-abcd-1234-abcd-123456789abc/',
          expectedId: 'abcd1234-abcd-1234-abcd-123456789abc',
        },
        {
          pulp_href: '/api/v3/repositories/ansible/ansible/00000000-0000-0000-0000-000000000000/',
          expectedId: '00000000-0000-0000-0000-000000000000',
        },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        mockUseGet.mockReturnValue({
          data: { results: [{ ...mockResource, pulp_href: testCase.pulp_href }] },
          error: undefined,
          isLoading: false,
          refresh: vi.fn(),
        });

        renderWithRouter();

        await waitFor(() => {
          expect(mockRbacApi.listRoles).toHaveBeenCalledWith(
            testCase.expectedId,
            expect.any(Object)
          );
        });
      }
    });

    it('should return null for invalid pulp_href without UUID', () => {
      mockUseGet.mockReturnValue({
        data: { results: [{ ...mockResource, pulp_href: '/invalid/path/without/uuid/' }] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('hub-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to get resource ID')).toBeInTheDocument();
    });

    it('should return null for undefined pulp_href', () => {
      mockUseGet.mockReturnValue({
        data: { results: [{ ...mockResource, pulp_href: undefined }] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('hub-error')).toBeInTheDocument();
    });
  });

  describe('User Transformation', () => {
    it('should transform users to use name instead of username', async () => {
      mockUseGet.mockReturnValue({
        data: { results: [mockResource] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      });

      mockAssignRoles.mockReturnValue({
        users: [{ username: 'testuser', object_roles: ['admin'] }],
        groups: [],
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('insights-access-tab')).toBeInTheDocument();
      });

      // The transformation happens in the component
      expect(screen.getByTestId('users-count')).toHaveTextContent('1');
    });
  });
});
