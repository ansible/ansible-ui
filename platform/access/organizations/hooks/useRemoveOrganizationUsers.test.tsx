import { renderHook } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, afterEach, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import React from 'react';

const mockOnComplete = vi.fn();
const mockBulkConfirmation = vi.fn();

// Mock i18n (external dependency)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && typeof key === 'string') {
        return key.replace(/\{\{(\w+)\}\}/g, (_match, variable: string) => {
          const value = options[variable];
          if (value === undefined || value === null) {
            return `{{${variable}}}`;
          }
          if (typeof value === 'object') {
            try {
              return JSON.stringify(value);
            } catch {
              return '[object]';
            }
          }
          // Explicitly handle primitive types to satisfy SonarQube
          if (typeof value === 'string') {
            return value;
          }
          if (typeof value === 'number' || typeof value === 'boolean') {
            return value.toString();
          }
          // Fallback for other primitive types
          return String(value);
        });
      }
      return key;
    },
  }),
}));

// Partial mock - use actual implementations except for the function we're testing
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});

// Mock useParams to return the organization ID
vi.mock('react-router', () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
  useParams: () => ({ id: '1' }),
}));

// Partial mock - only mock useGetItem, use actual implementations for useGetRequest and useDeleteRequest
vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/useGet');
  return {
    ...actual,
    useGetItem: () => ({
      data: { id: 1, name: 'Test Organization' },
      isLoading: false,
      error: null,
    }),
  };
});

// Provide minimal working column configuration
vi.mock('../../users/hooks/useUserColumns', () => ({
  useUsersColumns: () => [
    {
      header: 'Username',
      cell: (user: PlatformUser) => user.username,
    },
  ],
}));

// Import after mocks are set up
import { useRemoveOrganizationUsers } from './useRemoveOrganizationUsers';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from '../components/fixtures/organization.fixture.json';
import { UserRoleAccess } from '@ansible/common-ui/access/interfaces/UserRoleAccess';

// Mock user object that matches the UserRoleAccess interface
const mockUser: UserRoleAccess = {
  id: '10',
  url: '/api/v2/users/10/',
  username: 'test-user1',
  first_name: 'Test',
  last_name: 'User',
  is_superuser: false,
  related: {
    details: 'test-user1',
  },
  object_role_assignments: [
    {
      type: 'direct',
      role_definition: {
        name: 'Organization Admin',
        url: '/api/v2/role_definitions/2/',
      },
    },
  ],
};

describe('useRemoveOrganizationUsers - Behavior Tests', () => {
  // MSW VERIFICATION: Spies to track API calls
  const getRoleAssignmentsSpy = vi.fn();
  const deleteAssignmentSpy = vi.fn();
  const getOrganizationSpy = vi.fn();

  const server = setupServer(
    // Organization endpoint with spy
    http.get(gatewayAPI`/organizations/1/`, ({ request }) => {
      getOrganizationSpy(request.url); // TRACK: Organization request made
      return HttpResponse.json(mockOrganization);
    }),

    // Role definitions (used by useOrganizationUserColumns for confirmation columns)
    http.get(gatewayAPI`/role_definitions/`, () => {
      return HttpResponse.json({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 2,
            name: 'Organization Admin',
            url: '/api/gateway/v1/role_definitions/2/',
          },
        ],
      });
    }),

    // Role user assignments GET endpoint with spy - handle query parameters
    http.get(/\/role_user_assignments\//, ({ request }) => {
      getRoleAssignmentsSpy(request.url); // TRACK: GET request made

      const url = new URL(request.url);
      const userId = url.searchParams.get('user');
      const objectId = url.searchParams.get('object_id');

      if (userId === '10' && objectId === '1') {
        // Return mock role assignments for the user in this organization
        return HttpResponse.json({
          count: 2,
          results: [
            {
              id: 100,
              user: 10,
              object_id: '1',
              role_definition: 2,
            },
            {
              id: 101,
              user: 10,
              object_id: '1',
              role_definition: 28,
            },
          ],
        });
      }
      return HttpResponse.json({ count: 0, results: [] });
    }),

    // Role user assignments DELETE endpoint with spy - handle both patterns
    http.delete(/\/role_user_assignments\/\d+\/?/, ({ request }) => {
      deleteAssignmentSpy(request.url); // TRACK: DELETE request made
      return new HttpResponse(null, { status: 204 });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    // Clear all mocks before each test
    mockBulkConfirmation.mockClear();
    mockOnComplete.mockClear();
    getRoleAssignmentsSpy.mockClear();
    deleteAssignmentSpy.mockClear();
    getOrganizationSpy.mockClear();
  });

  test('triggers bulk confirmation when called with users', () => {
    const { result } = renderHook(() => useRemoveOrganizationUsers(mockOnComplete));

    // BEHAVIOR: Calling the function should trigger bulk confirmation
    result.current([mockUser]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Remove users from organization',
        items: [mockUser],
        isDanger: true,
        actionFn: expect.any(Function) as (user: PlatformUser) => Promise<void>,
        onComplete: mockOnComplete,
      })
    );
  });

  test('includes warning about role removal in confirmation prompt', () => {
    const { result } = renderHook(() => useRemoveOrganizationUsers(mockOnComplete));

    result.current([mockUser]);

    // BEHAVIOR: Should warn about role removal consequences
    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Remove users from organization',
        isDanger: true,
      })
    );

    // Extract and verify the prompt content - we know it's a React Fragment with specific structure
    const callArgs = mockBulkConfirmation.mock.calls[0]?.[0] as { prompt?: React.ReactElement };
    expect(callArgs.prompt).toBeTruthy();

    // Access the Fragment's children directly since we know the structure
    const promptProps = callArgs.prompt!.props as { children: React.ReactNode[] };
    const children = React.Children.toArray(promptProps.children);

    // First child should be the main question text
    expect(children[0]).toBe('Are you sure you want to remove the user below?');

    // Should contain the warning text about role removal (it's in the last text element)
    const lastTextChild = children.find(
      (child) =>
        typeof child === 'string' &&
        child.includes('This will remove all directly assigned organization roles')
    );
    expect(lastTextChild).toBeTruthy();
  });

  test('makes correct API calls when removing user with role assignments', async () => {
    let capturedActionFn: ((user: UserRoleAccess) => Promise<void>) | undefined;

    // Capture the actionFn passed to bulk confirmation
    mockBulkConfirmation.mockImplementation(
      (config: { actionFn: (user: UserRoleAccess) => Promise<void> }) => {
        capturedActionFn = config.actionFn;
      }
    );

    const { result } = renderHook(() => useRemoveOrganizationUsers(mockOnComplete));

    // Set up the bulk action
    result.current([mockUser]);
    expect(capturedActionFn).toBeDefined();

    // BEHAVIOR: Execute the action and verify API calls
    if (capturedActionFn) {
      await capturedActionFn(mockUser);
    }

    // VERIFY: GET request was made to fetch role assignments with correct query params
    expect(getRoleAssignmentsSpy).toHaveBeenCalledTimes(1);

    const callUrl = getRoleAssignmentsSpy.mock.calls[0][0] as string;
    expect(callUrl).toContain('/role_user_assignments/');

    // Parse URL to specifically check query parameters
    const parsedUrl = new URL(callUrl);
    expect(parsedUrl.searchParams.get('user')).toBe('10');
    expect(parsedUrl.searchParams.get('object_id')).toBe('1');

    // VERIFY: DELETE requests were made for each role assignment
    expect(deleteAssignmentSpy).toHaveBeenCalledTimes(2);
    expect(deleteAssignmentSpy).toHaveBeenCalledWith(
      expect.stringContaining('/role_user_assignments/100/')
    );
    expect(deleteAssignmentSpy).toHaveBeenCalledWith(
      expect.stringContaining('/role_user_assignments/101/')
    );
  });

  test('handles users with no role assignments gracefully', async () => {
    let capturedActionFn: ((user: UserRoleAccess) => Promise<void>) | undefined;

    mockBulkConfirmation.mockImplementation(
      (config: { actionFn: (user: UserRoleAccess) => Promise<void> }) => {
        capturedActionFn = config.actionFn;
      }
    );

    // Mock a user with no role assignments
    server.use(
      http.get(gatewayAPI`/role_user_assignments/`, ({ request }) => {
        getRoleAssignmentsSpy(request.url); // Still track the call

        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const userWithNoRoles: UserRoleAccess = {
      ...mockUser,
      id: '20',
      username: 'user-no-roles',
    };

    const { result } = renderHook(() => useRemoveOrganizationUsers(mockOnComplete));

    // Set up the bulk action
    result.current([userWithNoRoles]);
    expect(capturedActionFn).toBeDefined();

    // BEHAVIOR: Should handle gracefully, not throw
    if (capturedActionFn) {
      await expect(capturedActionFn(userWithNoRoles)).resolves.not.toThrow();
    }

    // VERIFY: GET request was still made, but no DELETE requests
    expect(getRoleAssignmentsSpy).toHaveBeenCalledTimes(1);
    expect(deleteAssignmentSpy).not.toHaveBeenCalled();
  });

  test('handles multiple users correctly', () => {
    const secondUser: UserRoleAccess = {
      ...mockUser,
      id: '11',
      username: 'test-user2',
    };

    const { result } = renderHook(() => useRemoveOrganizationUsers(mockOnComplete));

    // BEHAVIOR: Should handle multiple users
    result.current([mockUser, secondUser]);

    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Remove users from organization',
        items: expect.arrayContaining([mockUser, secondUser]) as PlatformUser[],
        confirmText: expect.stringContaining('remove these 2 users') as string,
      })
    );
  });
});
