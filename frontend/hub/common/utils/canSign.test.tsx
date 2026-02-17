/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { useCanSignNamespace, useCollectionPermissionCheck, useCanSignEE } from './canSign';

// Configurable mock for useHubContext
const mockFeatureFlags: Record<string, unknown> = {
  can_create_signatures: false,
  container_signing: false,
};

let mockUser: Record<string, unknown> | null = null;
let mockHasPermission: (perm: string) => boolean = () => false;

vi.mock('../useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: mockFeatureFlags,
    settings: {},
    user: mockUser,
    hasPermission: mockHasPermission,
  }),
}));

describe('canSign', () => {
  beforeEach(() => {
    mockFeatureFlags.can_create_signatures = false;
    mockFeatureFlags.container_signing = false;
    mockUser = null;
    mockHasPermission = () => false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useCanSignNamespace', () => {
    it('should return true when can_create_signatures is true', () => {
      mockFeatureFlags.can_create_signatures = true;
      const { result } = renderHook(() => useCanSignNamespace());
      expect(result.current).toBe(true);
    });

    it('should return false when can_create_signatures is false', () => {
      mockFeatureFlags.can_create_signatures = false;
      const { result } = renderHook(() => useCanSignNamespace());
      expect(result.current).toBe(false);
    });

    it('should return false when can_create_signatures is undefined', () => {
      delete mockFeatureFlags.can_create_signatures;
      const { result } = renderHook(() => useCanSignNamespace());
      expect(result.current).toBe(false);
    });
  });

  describe('useCollectionPermissionCheck', () => {
    it('should return a function', () => {
      const { result } = renderHook(() => useCollectionPermissionCheck());
      expect(typeof result.current).toBe('function');
    });

    it('should return true when hasPermission returns true for the given permission', () => {
      mockHasPermission = (perm: string) => perm === 'galaxy.change_namespace';
      const { result } = renderHook(() => useCollectionPermissionCheck());
      expect(result.current('galaxy.change_namespace')).toBe(true);
      expect(result.current('galaxy.upload_to_namespace')).toBe(false);
    });

    it('should return true when user is superuser even without model-level permission', () => {
      mockUser = { is_superuser: true };
      mockHasPermission = () => false;
      const { result } = renderHook(() => useCollectionPermissionCheck());
      expect(result.current('galaxy.change_namespace')).toBe(true);
      expect(result.current('any.permission')).toBe(true);
    });

    it('should return false when user is not superuser and has no permissions', () => {
      mockUser = { is_superuser: false };
      mockHasPermission = () => false;
      const { result } = renderHook(() => useCollectionPermissionCheck());
      expect(result.current('galaxy.change_namespace')).toBe(false);
    });

    it('should return false when user is null and has no permissions', () => {
      mockUser = null;
      mockHasPermission = () => false;
      const { result } = renderHook(() => useCollectionPermissionCheck());
      expect(result.current('galaxy.change_namespace')).toBe(false);
    });

    describe('with namespace object-level permissions', () => {
      it('should return true when namespace has the permission in my_permissions', () => {
        mockHasPermission = () => false;
        mockUser = { is_superuser: false };
        const namespace = {
          name: 'testns',
          pulp_href: '/pulp/1/',
          related_fields: {
            my_permissions: ['galaxy.change_namespace', 'galaxy.upload_to_namespace'],
          },
        };
        const { result } = renderHook(() => useCollectionPermissionCheck(namespace as never));
        expect(result.current('galaxy.change_namespace')).toBe(true);
        expect(result.current('galaxy.upload_to_namespace')).toBe(true);
      });

      it('should return false when namespace does not have the permission', () => {
        mockHasPermission = () => false;
        mockUser = { is_superuser: false };
        const namespace = {
          name: 'testns',
          pulp_href: '/pulp/1/',
          related_fields: {
            my_permissions: ['galaxy.upload_to_namespace'],
          },
        };
        const { result } = renderHook(() => useCollectionPermissionCheck(namespace as never));
        expect(result.current('galaxy.change_namespace')).toBe(false);
        expect(result.current('galaxy.upload_to_namespace')).toBe(true);
      });

      it('should return true when model-level permission exists even without namespace permission', () => {
        mockHasPermission = (perm: string) => perm === 'ansible.delete_collection';
        mockUser = { is_superuser: false };
        const namespace = {
          name: 'testns',
          pulp_href: '/pulp/1/',
          related_fields: {
            my_permissions: [],
          },
        };
        const { result } = renderHook(() => useCollectionPermissionCheck(namespace as never));
        expect(result.current('ansible.delete_collection')).toBe(true);
      });

      it('should handle undefined namespace gracefully', () => {
        mockHasPermission = () => false;
        mockUser = { is_superuser: false };
        const { result } = renderHook(() => useCollectionPermissionCheck());
        expect(result.current('galaxy.change_namespace')).toBe(false);
      });

      it('should handle namespace without related_fields gracefully', () => {
        mockHasPermission = () => false;
        mockUser = { is_superuser: false };
        const namespace = {
          name: 'testns',
          pulp_href: '/pulp/1/',
        };
        const { result } = renderHook(() => useCollectionPermissionCheck(namespace as never));
        expect(result.current('galaxy.change_namespace')).toBe(false);
      });
    });
  });

  describe('useCanSignEE', () => {
    it('should return true when container_signing is true', () => {
      mockFeatureFlags.container_signing = true;
      const { result } = renderHook(() => useCanSignEE());
      expect(result.current).toBe(true);
    });

    it('should return false when container_signing is false', () => {
      mockFeatureFlags.container_signing = false;
      const { result } = renderHook(() => useCanSignEE());
      expect(result.current).toBeFalsy();
    });
  });
});
