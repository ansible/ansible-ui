import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InsightsNamespaceAccess } from './InsightsNamespaceAccess';

// Mock putHubRequest
const mockPutHubRequest = vi.fn<(url: string, data: unknown) => Promise<void>>();
vi.mock('../../common/api/request', () => ({
  putHubRequest: (url: string, data: unknown) => mockPutHubRequest(url, data),
}));

// Mock hubAPI
vi.mock('../../common/api/formatPath', () => ({
  hubAPI: (strings: TemplateStringsArray, ...values: string[]) => {
    let result = strings[0];
    values.forEach((value, i) => {
      result += value + strings[i + 1];
    });
    return result;
  },
}));

// Mock HubError
vi.mock('../../common/HubError', () => ({
  HubError: ({ error }: { error: Error }) => <div>{error.message}</div>,
}));

// Mock LoadingPage and usePageAlertToaster
const mockAddAlert = vi.fn();
vi.mock('@ansible/ansible-ui-framework', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
  usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
}));

// Store callback functions from InsightsAccessTab
let capturedCallbacks: Record<string, (...args: unknown[]) => unknown> = {};

// Mock InsightsAccessTab to capture and verify callback functions
vi.mock('../../common/components/InsightsAccessTab', () => ({
  InsightsAccessTab: (props: {
    users: unknown[];
    groups: unknown[];
    resourceName?: string;
    canEditOwners?: boolean;
    onAddUser?: (user: { id: number; username: string }, roles: string[]) => Promise<void>;
    onRemoveUser?: (user: { name: string }) => Promise<void>;
    onAddUserRoles?: (user: { name: string }, roles: string[]) => Promise<void>;
    onRemoveUserRole?: (user: { name: string }, role: string) => Promise<void>;
    onAddGroup?: (group: { name: string; id?: number }, roles: string[]) => Promise<void>;
    onRemoveGroup?: (group: { name: string }) => Promise<void>;
    onAddGroupRoles?: (group: { name: string }, roles: string[]) => Promise<void>;
    onRemoveGroupRole?: (group: { name: string }, role: string) => Promise<void>;
  }) => {
    // Capture all callbacks for testing
    capturedCallbacks = {
      onAddUser: props.onAddUser as (...args: unknown[]) => unknown,
      onRemoveUser: props.onRemoveUser as (...args: unknown[]) => unknown,
      onAddUserRoles: props.onAddUserRoles as (...args: unknown[]) => unknown,
      onRemoveUserRole: props.onRemoveUserRole as (...args: unknown[]) => unknown,
      onAddGroup: props.onAddGroup as (...args: unknown[]) => unknown,
      onRemoveGroup: props.onRemoveGroup as (...args: unknown[]) => unknown,
      onAddGroupRoles: props.onAddGroupRoles as (...args: unknown[]) => unknown,
      onRemoveGroupRole: props.onRemoveGroupRole as (...args: unknown[]) => unknown,
    };

    return (
      <div data-testid="insights-access-tab">
        <div data-testid="users-count">{props.users.length}</div>
        <div data-testid="groups-count">{props.groups.length}</div>
        {props.resourceName && <div data-testid="resource-name">{props.resourceName}</div>}
        {props.canEditOwners !== undefined && (
          <div data-testid="can-edit-owners">{props.canEditOwners.toString()}</div>
        )}
      </div>
    );
  },
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
    { name: 'alice', object_roles: ['galaxy.admin', 'galaxy.viewer'] },
    { name: 'bob', object_roles: ['galaxy.viewer'] },
  ],
  groups: [
    { id: 1, name: 'admins', object_roles: ['galaxy.admin'] },
    { id: 2, name: 'viewers', object_roles: ['galaxy.viewer'] },
  ],
  related_fields: {
    my_permissions: ['galaxy.change_namespace'],
  },
  resources: '',
};

const mockNamespaceNoAccess = {
  ...mockNamespaceWithAccess,
  users: [],
  groups: [],
};

const mockNamespaceNoEditPermission = {
  ...mockNamespaceWithAccess,
  related_fields: {
    my_permissions: [],
  },
};

// Mock useGet hook - returns different values for my-namespaces vs partner namespaces
const mockUseGet = vi.fn<() => { data?: unknown; error?: Error; refresh: () => void }>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  useGet: (): { data?: unknown; error?: Error; refresh: () => void } => mockUseGet(),
}));

describe('InsightsNamespaceAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallbacks = {};
    mockPutHubRequest.mockResolvedValue(undefined);
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

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      mockUseGet.mockReturnValue({
        data: undefined,
        error: undefined,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
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

    it('should set canEditOwners to true when user has change_namespace permission', () => {
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('can-edit-owners')).toHaveTextContent('true');
    });

    it('should set canEditOwners to false when user lacks permission', () => {
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceNoEditPermission] },
        error: undefined,
        refresh: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('can-edit-owners')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
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

  describe('User Callbacks', () => {
    it('should handle adding a user', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback with a full API user object
      await capturedCallbacks.onAddUser?.({ id: 5, username: 'charlie' }, ['galaxy.viewer']);

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle removing a user', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onRemoveUser?.({ name: 'alice' });

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle adding roles to a user', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onAddUserRoles?.({ name: 'alice' }, ['galaxy.editor']);

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle removing a role from a user', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onRemoveUserRole?.({ name: 'alice' }, 'galaxy.viewer');

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle non-existent user for add roles', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call with non-existent user - should not call API
      await capturedCallbacks.onAddUserRoles?.({ name: 'nonexistent' }, ['galaxy.editor']);

      expect(mockPutHubRequest).not.toHaveBeenCalled();
    });
  });

  describe('Group Callbacks', () => {
    it('should handle adding a group', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onAddGroup?.({ id: 3, name: 'editors' }, ['galaxy.editor']);

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle removing a group', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onRemoveGroup?.({ name: 'admins' });

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle adding roles to a group', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onAddGroupRoles?.({ name: 'admins' }, ['galaxy.editor']);

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle removing a role from a group', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call the captured callback
      await capturedCallbacks.onRemoveGroupRole?.({ name: 'admins' }, 'galaxy.admin');

      expect(mockPutHubRequest).toHaveBeenCalled();
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
        })
      );
    });

    it('should handle non-existent group for add roles', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });

      renderWithRouter();

      // Call with non-existent group - should not call API
      await capturedCallbacks.onAddGroupRoles?.({ name: 'nonexistent' }, ['galaxy.editor']);

      expect(mockPutHubRequest).not.toHaveBeenCalled();
    });
  });

  describe('API Error Handling in Callbacks', () => {
    it('should show error alert when add user fails', async () => {
      const mockRefresh = vi.fn();
      mockUseGet.mockReturnValue({
        data: { meta: { count: 1 }, data: [mockNamespaceWithAccess] },
        error: undefined,
        refresh: mockRefresh,
      });
      mockPutHubRequest.mockRejectedValue(new Error('API Error'));

      renderWithRouter();

      // Call the captured callback - it catches errors internally and shows an alert
      await capturedCallbacks.onAddUser?.({ id: 5, username: 'charlie' }, ['galaxy.viewer']);

      await waitFor(() => {
        expect(mockAddAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          })
        );
      });
    });
  });
});
