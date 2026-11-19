/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useCollectionsActions } from './useCollectionsActions';
import { CollectionVersionSearch } from '../Collection';

const actionFns = vi.hoisted(() => ({
  deleteCollections: vi.fn(),
  deprecateOrUndeprecate: vi.fn(),
  signCollection: vi.fn(),
}));

// Mock PageNavigate
const mockPageNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

// Mock the dependent hooks
vi.mock('./useDeleteCollections', () => ({
  useDeleteCollections: () => actionFns.deleteCollections,
}));

vi.mock('./useDeprecateOrUndeprecateCollections', () => ({
  useDeprecateOrUndeprecateCollections: () => actionFns.deprecateOrUndeprecate,
}));

vi.mock('./useSignCollection', () => ({
  useSignCollection: () => actionFns.signCollection,
}));

// Mock HubRoute enum
vi.mock('../../main/HubRoutes', () => ({
  HubRoute: {
    UploadCollection: 'UploadCollection',
  },
}));

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../common/isInsights';

// Mock canSign and permission check
vi.mock('../../common/utils/canSign', () => ({
  useCanSignNamespace: vi.fn(() => true),
  useCollectionPermissionCheck: vi.fn(
    (namespace?: { related_fields?: { my_permissions?: string[] } }) => {
      return (permission: string) =>
        mockHasPermission(permission) ||
        !!namespace?.related_fields?.my_permissions?.includes(permission) ||
        !!mockUser?.is_superuser;
    }
  ),
}));

import { useCanSignNamespace } from '../../common/utils/canSign';

// Mock useHubContext with configurable values
const mockFeatureFlags = {
  can_upload_signatures: false,
};

let mockUser: Record<string, unknown> | null = null;
let mockHasPermission: (perm: string) => boolean = () => false;

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: mockFeatureFlags,
    settings: {},
    user: mockUser,
    hasPermission: mockHasPermission,
  }),
}));

function renderUseCollectionsActions(namespace?: string) {
  const callback = vi.fn();
  return renderHook(() => useCollectionsActions(callback, namespace), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function getAction(actions: ReturnType<typeof useCollectionsActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function hasAction(actions: ReturnType<typeof useCollectionsActions>, label: string) {
  return actions.some((action) => 'label' in action && action.label === label);
}

describe('useCollectionsActions', () => {
  beforeEach(() => {
    mockPageNavigate.mockClear();
    vi.mocked(isInsightsMode).mockReturnValue(false);
    vi.mocked(useCanSignNamespace).mockReturnValue(true);
    mockUser = null;
    mockHasPermission = () => false;
    mockFeatureFlags.can_upload_signatures = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array of actions', () => {
    const { result } = renderUseCollectionsActions();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Upload collection action', () => {
    const { result } = renderUseCollectionsActions();
    expect(getAction(result.current, 'Upload collection')).toBeDefined();
  });

  describe('Upload collection action', () => {
    it('should navigate to upload page without query when no namespace provided', () => {
      const { result } = renderUseCollectionsActions();
      const uploadAction = getAction(result.current, 'Upload collection');
      expect(uploadAction).toBeDefined();
      if (uploadAction && 'onClick' in uploadAction && typeof uploadAction.onClick === 'function') {
        (uploadAction.onClick as () => void)();
        expect(mockPageNavigate).toHaveBeenCalledWith('UploadCollection', undefined);
      }
    });

    it('should navigate to upload page with namespace query when namespace provided', () => {
      const { result } = renderUseCollectionsActions('my-namespace');
      const uploadAction = getAction(result.current, 'Upload collection');
      expect(uploadAction).toBeDefined();
      if (uploadAction && 'onClick' in uploadAction && typeof uploadAction.onClick === 'function') {
        (uploadAction.onClick as () => void)();
        expect(mockPageNavigate).toHaveBeenCalledWith('UploadCollection', {
          query: { namespace: 'my-namespace' },
        });
      }
    });
  });

  it('should include deprecate/undeprecate action', () => {
    const { result } = renderUseCollectionsActions();
    expect(getAction(result.current, 'Deprecate collections')).toBeDefined();
  });

  it('should include sign action when signing is enabled', () => {
    const { result } = renderUseCollectionsActions();
    expect(getAction(result.current, 'Sign collections')).toBeDefined();
  });

  it('should include delete action', () => {
    const { result } = renderUseCollectionsActions();
    expect(getAction(result.current, 'Delete collections')).toBeDefined();
  });

  describe('Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should include all actions regardless of permissions', () => {
      const { result } = renderUseCollectionsActions();
      expect(hasAction(result.current, 'Upload collection')).toBe(true);
      expect(hasAction(result.current, 'Sign collections')).toBe(true);
      expect(hasAction(result.current, 'Deprecate collections')).toBe(true);
      expect(hasAction(result.current, 'Delete collections')).toBe(true);
    });

    it('hides signing when the feature flag is off', () => {
      vi.mocked(useCanSignNamespace).mockReturnValue(false);
      const { result } = renderUseCollectionsActions();
      expect(hasAction(result.current, 'Sign collections')).toBe(false);
    });

    it('invokes sign, deprecate, and delete with duplicate names collapsed', () => {
      const { result } = renderUseCollectionsActions('my-namespace');
      const collection = (name?: string) =>
        ({
          collection_version: name === undefined ? undefined : { name },
        }) as CollectionVersionSearch;
      const collections = [
        collection('alpha'),
        collection('alpha'),
        collection(''),
        collection(undefined),
      ];

      const click = (label: string) => {
        const action = getAction(result.current, label);
        if (action && 'onClick' in action && typeof action.onClick === 'function') {
          (action.onClick as (items: CollectionVersionSearch[]) => void)(collections);
        }
      };

      click('Sign collections');
      expect(actionFns.signCollection).toHaveBeenCalledWith(collections);

      click('Deprecate collections');
      expect(actionFns.deprecateOrUndeprecate).toHaveBeenCalledWith(collections, 'deprecate');

      click('Delete collections');
      expect(actionFns.deleteCollections).toHaveBeenCalledWith([
        collection('alpha'),
        collection(''),
      ]);
    });
  });

  describe('Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    describe('without permissions', () => {
      beforeEach(() => {
        mockHasPermission = () => false;
        mockUser = null;
      });

      it('should exclude Upload collection', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Upload collection')).toBe(false);
      });

      it('should exclude Sign collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Sign collections')).toBe(false);
      });

      it('should exclude Deprecate collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Deprecate collections')).toBe(false);
      });

      it('should exclude Delete collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Delete collections')).toBe(false);
      });
    });

    describe('with galaxy.upload_to_namespace permission', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) => perm === 'galaxy.upload_to_namespace';
      });

      it('should include Upload collection', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Upload collection')).toBe(true);
      });

      it('should still exclude Delete collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Delete collections')).toBe(false);
      });
    });

    describe('with galaxy.change_namespace permission', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) => perm === 'galaxy.change_namespace';
      });

      it('should include Deprecate collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Deprecate collections')).toBe(true);
      });

      it('should include Delete collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Delete collections')).toBe(true);
      });

      it('should exclude Sign collections without galaxy.upload_to_namespace', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Sign collections')).toBe(false);
      });

      it('should exclude Sign collections when can_upload_signatures is true', () => {
        mockFeatureFlags.can_upload_signatures = true;
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Sign collections')).toBe(false);
      });
    });

    describe('with galaxy.change_namespace and galaxy.upload_to_namespace permissions', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) =>
          perm === 'galaxy.change_namespace' || perm === 'galaxy.upload_to_namespace';
      });

      it('should include Sign collections when both permissions present', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Sign collections')).toBe(true);
      });

      it('should exclude Sign collections when can_upload_signatures is true', () => {
        mockFeatureFlags.can_upload_signatures = true;
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Sign collections')).toBe(false);
      });
    });

    describe('with ansible.delete_collection permission', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) => perm === 'ansible.delete_collection';
      });

      it('should include Delete collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Delete collections')).toBe(true);
      });

      it('should still exclude Deprecate collections', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Deprecate collections')).toBe(false);
      });
    });

    describe('with superuser', () => {
      beforeEach(() => {
        mockUser = { is_superuser: true };
        mockHasPermission = () => false;
      });

      it('should include all actions', () => {
        const { result } = renderUseCollectionsActions();
        expect(hasAction(result.current, 'Upload collection')).toBe(true);
        expect(hasAction(result.current, 'Sign collections')).toBe(true);
        expect(hasAction(result.current, 'Deprecate collections')).toBe(true);
        expect(hasAction(result.current, 'Delete collections')).toBe(true);
      });
    });
  });
});
