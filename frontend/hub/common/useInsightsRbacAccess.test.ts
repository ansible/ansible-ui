/* eslint-disable i18next/no-literal-string, @typescript-eslint/unbound-method */
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useInsightsRbacAccess, PulpResource } from './useInsightsRbacAccess';
import type { PulpRbacApi } from './api/pulp-rbac';
import type { PulpItemsResponse } from './useHubView';

// Mock useGet hook
const mockRefresh = vi.fn();
const mockUseGet = vi.fn<
  () => {
    data?: PulpItemsResponse<PulpResource>;
    error?: Error;
    refresh: () => void;
  }
>();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => mockUseGet(),
}));

// Mock parsePulpIDFromURL
vi.mock('./api/hub-api-utils', () => ({
  parsePulpIDFromURL: (href: string | undefined) => {
    if (!href) return null;
    const uuidMatch = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.exec(href);
    return uuidMatch?.[0] || null;
  },
}));

// Mock assignRoles helper
vi.mock('./api/pulp-rbac', () => ({
  assignRoles: (roles: Array<{ role: string; users?: string[]; groups?: string[] }>) => {
    const usersMap: Record<string, string[]> = {};
    const groupsMap: Record<string, string[]> = {};

    for (const roleAssignment of roles) {
      for (const user of roleAssignment.users || []) {
        usersMap[user] = usersMap[user] || [];
        usersMap[user].push(roleAssignment.role);
      }
      for (const group of roleAssignment.groups || []) {
        groupsMap[group] = groupsMap[group] || [];
        groupsMap[group].push(roleAssignment.role);
      }
    }

    return {
      users: Object.entries(usersMap).map(([username, object_roles]) => ({
        username,
        object_roles,
      })),
      groups: Object.entries(groupsMap).map(([name, object_roles]) => ({
        name,
        object_roles,
      })),
    };
  },
}));

describe('useInsightsRbacAccess', () => {
  const mockResource: PulpResource = {
    pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
    name: 'test-resource',
  };

  const mockRbacApi = {
    listRoles: vi.fn(),
    addRole: vi.fn(),
    removeRole: vi.fn(),
    myPermissions: vi.fn(),
  } as unknown as PulpRbacApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefresh.mockReset();
    mockUseGet.mockReturnValue({
      data: { results: [mockResource], count: 1 },
      error: undefined,
      refresh: mockRefresh,
    });
    (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue({
      roles: [],
    });
  });

  it('should return loading state initially', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      error: undefined,
      refresh: mockRefresh,
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    expect(result.current.resourceLoading).toBe(true);
  });

  it('should return resource error when fetch fails', () => {
    const testError = new Error('Network error');
    mockUseGet.mockReturnValue({
      data: undefined,
      error: testError,
      refresh: mockRefresh,
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    expect(result.current.resourceError).toBe(testError);
    expect(result.current.resourceLoading).toBe(false);
  });

  it('should return pulpId as null when resource has no pulp_href', () => {
    mockUseGet.mockReturnValue({
      data: { results: [{ name: 'test', pulp_href: undefined }], count: 1 },
      error: undefined,
      refresh: mockRefresh,
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    expect(result.current.pulpId).toBeNull();
  });

  it('should extract pulpId from pulp_href', async () => {
    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.pulpId).toBe('12345678-1234-1234-1234-123456789abc');
    });
  });

  it('should fetch RBAC data when pulpId is available', async () => {
    (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue({
      roles: [
        { role: 'admin', users: ['alice'], groups: ['admins'] },
        { role: 'viewer', users: ['bob'], groups: [] },
      ],
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.rbacLoading).toBe(false);
    });

    expect(mockRbacApi.listRoles).toHaveBeenCalledWith('12345678-1234-1234-1234-123456789abc', {
      limit: 100,
    });
    expect(result.current.users).toHaveLength(2);
    expect(result.current.groups).toHaveLength(1);
  });

  it('should return rbacError when RBAC fetch fails', async () => {
    const rbacError = new Error('RBAC fetch failed');
    (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockRejectedValue(rbacError);

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.rbacLoading).toBe(false);
    });

    expect(result.current.rbacError).toBe(rbacError);
    expect(result.current.users).toHaveLength(0);
    expect(result.current.groups).toHaveLength(0);
  });

  it('should return resourceName from the resource', async () => {
    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.resourceName).toBe('test-resource');
    });
  });

  it('should use custom extractResource function', async () => {
    const customExtractor = vi.fn((data: PulpItemsResponse<PulpResource> | undefined) => {
      return data?.results?.[0];
    });

    renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
        extractResource: customExtractor,
      })
    );

    await waitFor(() => {
      expect(customExtractor).toHaveBeenCalled();
    });
  });

  it('should call refresh function correctly', async () => {
    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.rbacLoading).toBe(false);
    });

    act(() => {
      result.current.refresh();
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should not fetch RBAC data when pulpId is null', async () => {
    mockUseGet.mockReturnValue({
      data: { results: [{ name: 'test', pulp_href: '' }], count: 1 },
      error: undefined,
      refresh: mockRefresh,
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    // Wait a bit to ensure any async operations would have completed
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockRbacApi.listRoles).not.toHaveBeenCalled();
    expect(result.current.users).toHaveLength(0);
    expect(result.current.groups).toHaveLength(0);
  });

  it('should handle empty roles response', async () => {
    (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue({
      roles: [],
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.rbacLoading).toBe(false);
    });

    expect(result.current.users).toHaveLength(0);
    expect(result.current.groups).toHaveLength(0);
    expect(result.current.rbacError).toBeNull();
  });

  it('should handle undefined roles in response', async () => {
    (mockRbacApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue({
      roles: undefined,
    });

    const { result } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.rbacLoading).toBe(false);
    });

    expect(result.current.users).toHaveLength(0);
    expect(result.current.groups).toHaveLength(0);
  });

  it('should update state when resource data changes', async () => {
    const { result, rerender } = renderHook(() =>
      useInsightsRbacAccess({
        apiUrl: '/api/test/',
        rbacApi: mockRbacApi,
      })
    );

    await waitFor(() => {
      expect(result.current.resourceName).toBe('test-resource');
    });

    // Update mock to return different data
    mockUseGet.mockReturnValue({
      data: {
        results: [
          {
            pulp_href:
              '/pulp/api/v3/repositories/ansible/ansible/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/',
            name: 'updated-resource',
          },
        ],
        count: 1,
      },
      error: undefined,
      refresh: mockRefresh,
    });

    rerender();

    await waitFor(() => {
      expect(result.current.resourceName).toBe('updated-resource');
    });
  });
});
