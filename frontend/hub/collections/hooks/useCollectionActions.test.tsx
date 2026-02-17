/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { useCollectionActions } from './useCollectionActions';
import { CollectionVersionSearch } from '../Collection';

// Mock dependent hooks
vi.mock('./useDeleteCollections', () => ({
  useDeleteCollections: () => vi.fn(),
}));

vi.mock('./useDeleteCollectionsFromRepository', () => ({
  useDeleteCollectionsFromRepository: () => vi.fn(),
}));

vi.mock('./useDeprecateOrUndeprecateCollections', () => ({
  useDeprecateOrUndeprecateCollections: () => vi.fn(),
}));

vi.mock('./useCopyToRepository', () => ({
  useCopyToRepository: () => vi.fn(),
}));

vi.mock('./useSignCollection', () => ({
  useSignCollection: () => vi.fn(),
}));

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
}));

import { isInsightsMode } from '../../common/isInsights';

// Mock canSign hooks
vi.mock('../../common/utils/canSign', () => ({
  useCanSignNamespace: vi.fn(() => true),
  useCollectionPermissionCheck: vi.fn(() => () => false),
}));

import { useCanSignNamespace, useCollectionPermissionCheck } from '../../common/utils/canSign';

// Mock useHubContext with configurable feature flags
const mockFeatureFlags = {
  can_upload_signatures: false,
  display_signatures: true,
  display_repositories: true,
  require_upload_signatures: false,
  collection_auto_sign: false,
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

vi.mock('../../main/HubRoutes', () => ({
  HubRoute: {
    UploadCollection: 'UploadCollection',
    CollectionPage: 'CollectionPage',
    Collections: 'Collections',
  },
}));

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testns',
    name: 'testcol',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/test/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: 'Test collection',
  },
  repository: {
    name: 'published',
    pulp_href: '/test/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

function renderUseCollectionActions(detail?: boolean) {
  const callback = vi.fn();
  return renderHook(() => useCollectionActions(callback, detail), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function getAction(actions: ReturnType<typeof useCollectionActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function isActionHidden(
  action: ReturnType<typeof getAction>,
  collection: CollectionVersionSearch = mockCollection
) {
  if (action && 'isHidden' in action && typeof action.isHidden === 'function') {
    return action.isHidden(collection);
  }
  return undefined;
}

describe('useCollectionActions', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    vi.mocked(useCanSignNamespace).mockReturnValue(true);
    vi.mocked(useCollectionPermissionCheck).mockReturnValue(() => false);
    mockUser = null;
    mockHasPermission = () => false;
    mockFeatureFlags.can_upload_signatures = false;
    mockFeatureFlags.display_repositories = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array of actions', () => {
    const { result } = renderUseCollectionActions();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Sign collection action', () => {
    const { result } = renderUseCollectionActions();
    const signAction = getAction(result.current, 'Sign collection');
    expect(signAction).toBeDefined();
  });

  it('should hide Sign collection when can_upload_signatures is true', () => {
    mockFeatureFlags.can_upload_signatures = true;
    const { result } = renderUseCollectionActions();
    const signAction = getAction(result.current, 'Sign collection');
    expect(isActionHidden(signAction)).toBe(true);
  });

  it('should hide Sign collection when canSign is false', () => {
    vi.mocked(useCanSignNamespace).mockReturnValue(false);
    const { result } = renderUseCollectionActions();
    const signAction = getAction(result.current, 'Sign collection');
    expect(isActionHidden(signAction)).toBe(true);
  });

  it('should show Sign version only in detail view', () => {
    const { result: listResult } = renderUseCollectionActions(false);
    const signVersionList = getAction(listResult.current, 'Sign version');
    expect(isActionHidden(signVersionList)).toBe(true);
  });

  it('should include Deprecate and Undeprecate actions', () => {
    const { result } = renderUseCollectionActions();
    expect(getAction(result.current, 'Deprecate collection')).toBeDefined();
    expect(getAction(result.current, 'Undeprecate collection')).toBeDefined();
  });

  it('should hide Deprecate when collection is already deprecated', () => {
    const { result } = renderUseCollectionActions();
    const deprecateAction = getAction(result.current, 'Deprecate collection');
    expect(isActionHidden(deprecateAction, { ...mockCollection, is_deprecated: true })).toBe(true);
    expect(isActionHidden(deprecateAction, { ...mockCollection, is_deprecated: false })).toBe(
      false
    );
  });

  it('should hide Undeprecate when collection is not deprecated', () => {
    const { result } = renderUseCollectionActions();
    const undeprecateAction = getAction(result.current, 'Undeprecate collection');
    expect(isActionHidden(undeprecateAction, { ...mockCollection, is_deprecated: false })).toBe(
      true
    );
    expect(isActionHidden(undeprecateAction, { ...mockCollection, is_deprecated: true })).toBe(
      false
    );
  });

  it('should include Upload new version action', () => {
    const { result } = renderUseCollectionActions();
    expect(getAction(result.current, 'Upload new version')).toBeDefined();
  });

  it('should include Copy version to repositories action', () => {
    const { result } = renderUseCollectionActions();
    expect(getAction(result.current, 'Copy version to repositories')).toBeDefined();
  });

  it('should include Delete entire collection from system action', () => {
    const { result } = renderUseCollectionActions();
    expect(getAction(result.current, 'Delete entire collection from system')).toBeDefined();
  });

  it('should show version delete actions only in detail view', () => {
    const { result } = renderUseCollectionActions(false);
    const deleteVersionAction = getAction(result.current, 'Delete version from system');
    expect(isActionHidden(deleteVersionAction)).toBe(true);

    const { result: detailResult } = renderUseCollectionActions(true);
    const detailDeleteAction = getAction(detailResult.current, 'Delete version from system');
    expect(isActionHidden(detailDeleteAction)).toBe(false);
  });

  describe('Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should show all actions regardless of permissions', () => {
      const { result } = renderUseCollectionActions();
      expect(isActionHidden(getAction(result.current, 'Sign collection'))).toBe(false);
      expect(
        isActionHidden(getAction(result.current, 'Deprecate collection'), {
          ...mockCollection,
          is_deprecated: false,
        })
      ).toBe(false);
      expect(isActionHidden(getAction(result.current, 'Upload new version'))).toBe(false);
      expect(
        isActionHidden(getAction(result.current, 'Delete entire collection from system'))
      ).toBe(false);
    });

    it('should show Copy action when display_repositories is true and user is not anonymous', () => {
      mockUser = { is_anonymous: false };
      const { result } = renderUseCollectionActions();
      expect(isActionHidden(getAction(result.current, 'Copy version to repositories'))).toBe(false);
    });

    it('should hide Copy action when user is anonymous', () => {
      mockUser = { is_anonymous: true };
      const { result } = renderUseCollectionActions();
      expect(isActionHidden(getAction(result.current, 'Copy version to repositories'))).toBe(true);
    });

    it('should hide Copy action when display_repositories is false', () => {
      mockFeatureFlags.display_repositories = false;
      mockUser = { is_anonymous: false };
      const { result } = renderUseCollectionActions();
      expect(isActionHidden(getAction(result.current, 'Copy version to repositories'))).toBe(true);
    });

    it('should hide repository-related delete actions when display_repositories is false', () => {
      mockFeatureFlags.display_repositories = false;
      const { result } = renderUseCollectionActions(true);
      expect(isActionHidden(getAction(result.current, 'Delete version from repository'))).toBe(
        true
      );
      expect(
        isActionHidden(getAction(result.current, 'Delete entire collection from repository'))
      ).toBe(true);
    });
  });

  describe('Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    describe('without permissions', () => {
      beforeEach(() => {
        vi.mocked(useCollectionPermissionCheck).mockReturnValue(() => false);
      });

      it('should hide Sign collection', () => {
        const { result } = renderUseCollectionActions();
        expect(isActionHidden(getAction(result.current, 'Sign collection'))).toBe(true);
      });

      it('should hide Deprecate collection', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Deprecate collection'), {
            ...mockCollection,
            is_deprecated: false,
          })
        ).toBe(true);
      });

      it('should hide Undeprecate collection', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Undeprecate collection'), {
            ...mockCollection,
            is_deprecated: true,
          })
        ).toBe(true);
      });

      it('should hide Upload new version', () => {
        const { result } = renderUseCollectionActions();
        expect(isActionHidden(getAction(result.current, 'Upload new version'))).toBe(true);
      });

      it('should hide Delete entire collection from system', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Delete entire collection from system'))
        ).toBe(true);
      });

      it('should hide Delete entire collection from repository', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Delete entire collection from repository'))
        ).toBe(true);
      });

      it('should hide Delete version from system in detail view', () => {
        const { result } = renderUseCollectionActions(true);
        expect(isActionHidden(getAction(result.current, 'Delete version from system'))).toBe(true);
      });

      it('should hide Delete version from repository in detail view', () => {
        const { result } = renderUseCollectionActions(true);
        expect(isActionHidden(getAction(result.current, 'Delete version from repository'))).toBe(
          true
        );
      });
    });

    describe('with galaxy.change_namespace permission', () => {
      beforeEach(() => {
        vi.mocked(useCollectionPermissionCheck).mockReturnValue(
          (perm: string) => perm === 'galaxy.change_namespace'
        );
      });

      it('should show Deprecate collection', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Deprecate collection'), {
            ...mockCollection,
            is_deprecated: false,
          })
        ).toBe(false);
      });

      it('should show Delete entire collection from system', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Delete entire collection from system'))
        ).toBe(false);
      });

      it('should show Delete entire collection from repository when display_repositories is set', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Delete entire collection from repository'))
        ).toBe(false);
      });

      it('should still hide Sign collection (needs both galaxy.change_namespace and galaxy.upload_to_namespace)', () => {
        const { result } = renderUseCollectionActions();
        expect(isActionHidden(getAction(result.current, 'Sign collection'))).toBe(true);
      });
    });

    describe('with galaxy.upload_to_namespace permission', () => {
      beforeEach(() => {
        vi.mocked(useCollectionPermissionCheck).mockReturnValue(
          (perm: string) => perm === 'galaxy.upload_to_namespace'
        );
      });

      it('should show Upload new version', () => {
        const { result } = renderUseCollectionActions();
        expect(isActionHidden(getAction(result.current, 'Upload new version'))).toBe(false);
      });
    });

    describe('with both galaxy.change_namespace and galaxy.upload_to_namespace permissions', () => {
      beforeEach(() => {
        vi.mocked(useCollectionPermissionCheck).mockReturnValue(
          (perm: string) =>
            perm === 'galaxy.change_namespace' || perm === 'galaxy.upload_to_namespace'
        );
      });

      it('should show Sign collection', () => {
        const { result } = renderUseCollectionActions();
        expect(isActionHidden(getAction(result.current, 'Sign collection'))).toBe(false);
      });
    });

    describe('with ansible.delete_collection permission', () => {
      beforeEach(() => {
        vi.mocked(useCollectionPermissionCheck).mockReturnValue(
          (perm: string) => perm === 'ansible.delete_collection'
        );
      });

      it('should show Delete entire collection from system', () => {
        const { result } = renderUseCollectionActions();
        expect(
          isActionHidden(getAction(result.current, 'Delete entire collection from system'))
        ).toBe(false);
      });

      it('should show Delete version from system in detail view', () => {
        const { result } = renderUseCollectionActions(true);
        expect(isActionHidden(getAction(result.current, 'Delete version from system'))).toBe(false);
      });
    });

    describe('with namespace-level object permissions', () => {
      it('should pass namespace to useCollectionPermissionCheck', () => {
        const mockNamespace = {
          name: 'testns',
          pulp_href: '/pulp/1/',
          related_fields: {
            my_permissions: ['galaxy.change_namespace', 'galaxy.upload_to_namespace'],
          },
        };
        const callback = vi.fn();
        renderHook(() => useCollectionActions(callback, false, mockNamespace as never), {
          wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
        });
        expect(useCollectionPermissionCheck).toHaveBeenCalledWith(mockNamespace);
      });
    });
  });
});
