/* eslint-disable i18next/no-literal-string */
import { renderHook, act } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { useApprovalActions, approveCollection } from './useApprovalActions';
import { CollectionVersionSearch } from '../Approval';

const mockT = ((s: string) => s) as TFunction<'translation', undefined>;

const mockApproveModal = vi.fn();
const mockCopyToRepository = vi.fn();

vi.mock('../../../collections/hooks/useCopyToRepository', () => ({
  useCopyToRepository: () => mockCopyToRepository,
}));

vi.mock('./useRejectCollections', () => ({
  useRejectCollections: () => vi.fn(),
}));

vi.mock('./useApproveCollections', () => ({
  useApproveCollectionsFrameworkModal: () => mockApproveModal,
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('../../../main/HubRoutes', () => ({
  HubRoute: {
    CollectionSignatureUpload: 'CollectionSignatureUpload',
    MyImports: 'MyImports',
  },
}));

const mockPageNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

// Mock isInsightsMode
vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../../common/isInsights';

// Configurable feature flags
const mockFeatureFlags = {
  collection_auto_sign: false,
  require_upload_signatures: false,
  can_upload_signatures: false,
  display_signatures: true,
};

let mockUser: Record<string, unknown> | null = null;
let mockHasPermission: (perm: string) => boolean = () => false;

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: mockFeatureFlags,
    settings: {},
    user: mockUser,
    hasPermission: mockHasPermission,
  }),
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
    name: 'staging',
    pulp_href: '/test/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
    pulp_labels: { pipeline: 'staging' },
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

function renderUseApprovalActions() {
  const callback = vi.fn();
  return renderHook(() => useApprovalActions(callback), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function getAction(actions: ReturnType<typeof useApprovalActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function isActionHidden(
  action: ReturnType<typeof getAction>,
  collection: CollectionVersionSearch = mockCollection
) {
  if (action && 'isHidden' in action && typeof action.isHidden === 'function') {
    return action.isHidden(collection as never);
  }
  return undefined;
}

describe('useApprovalActions', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    mockUser = null;
    mockHasPermission = () => false;
    mockFeatureFlags.collection_auto_sign = false;
    mockFeatureFlags.require_upload_signatures = false;
    mockFeatureFlags.can_upload_signatures = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockPageNavigate.mockClear();
  });

  it('should return an array of actions', () => {
    const { result } = renderUseApprovalActions();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  describe('Upload signature action', () => {
    it('should be hidden when can_upload_signatures is false', () => {
      mockFeatureFlags.can_upload_signatures = false;
      const { result } = renderUseApprovalActions();
      const uploadSigAction = getAction(result.current, 'Upload signature');
      expect(isActionHidden(uploadSigAction)).toBe(true);
    });

    it('should be visible when can_upload_signatures is true and collection is unsigned', () => {
      mockFeatureFlags.can_upload_signatures = true;
      const { result } = renderUseApprovalActions();
      const uploadSigAction = getAction(result.current, 'Upload signature');
      expect(isActionHidden(uploadSigAction)).toBe(false);
    });

    it('should be hidden when collection is already signed', () => {
      mockFeatureFlags.can_upload_signatures = true;
      const { result } = renderUseApprovalActions();
      const uploadSigAction = getAction(result.current, 'Upload signature');
      expect(isActionHidden(uploadSigAction, { ...mockCollection, is_signed: true })).toBe(true);
    });

    it('should be disabled when collection is already signed', () => {
      mockFeatureFlags.can_upload_signatures = true;
      const { result } = renderUseApprovalActions();
      const uploadSigAction = getAction(result.current, 'Upload signature');
      if (
        uploadSigAction &&
        'isDisabled' in uploadSigAction &&
        typeof uploadSigAction.isDisabled === 'function'
      ) {
        expect(uploadSigAction.isDisabled({ ...mockCollection, is_signed: true } as never)).toBe(
          'Collection is already signed'
        );
      }
    });

    it('should not be disabled when collection is unsigned', () => {
      mockFeatureFlags.can_upload_signatures = true;
      const { result } = renderUseApprovalActions();
      const uploadSigAction = getAction(result.current, 'Upload signature');
      if (
        uploadSigAction &&
        'isDisabled' in uploadSigAction &&
        typeof uploadSigAction.isDisabled === 'function'
      ) {
        expect(uploadSigAction.isDisabled(mockCollection as never)).toBeUndefined();
      }
    });
  });

  describe('Approve action', () => {
    it('should show "Approve collection" when autoSign is false', () => {
      mockFeatureFlags.collection_auto_sign = false;
      const { result } = renderUseApprovalActions();
      expect(getAction(result.current, 'Approve collection')).toBeDefined();
    });

    it('should show "Approve and sign collection" when autoSign is true', () => {
      mockFeatureFlags.collection_auto_sign = true;
      mockFeatureFlags.require_upload_signatures = false;
      const { result } = renderUseApprovalActions();
      expect(getAction(result.current, 'Approve and sign collection')).toBeDefined();
    });

    it('should be disabled when collection is already approved', () => {
      const { result } = renderUseApprovalActions();
      const approveAction = getAction(result.current, 'Approve collection');
      if (
        approveAction &&
        'isDisabled' in approveAction &&
        typeof approveAction.isDisabled === 'function'
      ) {
        const approvedCollection = {
          ...mockCollection,
          repository: {
            ...mockCollection.repository!,
            pulp_labels: { pipeline: 'approved' },
          },
        };
        const result = approveAction.isDisabled(approvedCollection as never);
        const resultStr = Array.isArray(result) ? result.join('') : result;
        expect(resultStr).toBe('Collection is already approved');
      }
    });

    it('should require signature when can_upload_signatures and require_upload_signatures are true', () => {
      mockFeatureFlags.can_upload_signatures = true;
      mockFeatureFlags.require_upload_signatures = true;
      const { result } = renderUseApprovalActions();
      const approveAction = getAction(result.current, 'Approve collection');
      if (
        approveAction &&
        'isDisabled' in approveAction &&
        typeof approveAction.isDisabled === 'function'
      ) {
        const result = approveAction.isDisabled(mockCollection as never);
        const resultStr = Array.isArray(result) ? result.join('') : result;
        expect(resultStr).toBe('Signature must be uploaded first');
      }
    });
  });

  describe('Reject action', () => {
    it('should include Reject collection action', () => {
      const { result } = renderUseApprovalActions();
      expect(getAction(result.current, 'Reject collection')).toBeDefined();
    });

    it('should be disabled when collection is already rejected', () => {
      const { result } = renderUseApprovalActions();
      const rejectAction = getAction(result.current, 'Reject collection');
      if (
        rejectAction &&
        'isDisabled' in rejectAction &&
        typeof rejectAction.isDisabled === 'function'
      ) {
        const rejectedCollection = {
          ...mockCollection,
          repository: {
            ...mockCollection.repository!,
            pulp_labels: { pipeline: 'rejected' },
          },
        };
        const result = rejectAction.isDisabled(rejectedCollection as never);
        const resultStr = Array.isArray(result) ? result.join('') : result;
        expect(resultStr).toBe('Collection is already rejected');
      }
    });
  });

  it('should include View import logs action', () => {
    const { result } = renderUseApprovalActions();
    expect(getAction(result.current, 'View import logs')).toBeDefined();
  });

  it('navigates when row actions are clicked', () => {
    mockFeatureFlags.can_upload_signatures = true;
    const { result } = renderUseApprovalActions();

    const uploadAction = getAction(result.current, 'Upload signature');
    act(() => {
      uploadAction && 'onClick' in uploadAction && uploadAction.onClick(mockCollection as never);
    });
    expect(mockPageNavigate).toHaveBeenCalled();

    mockPageNavigate.mockClear();
    const logsAction = getAction(result.current, 'View import logs');
    act(() => {
      logsAction && 'onClick' in logsAction && logsAction.onClick(mockCollection as never);
    });
    expect(mockPageNavigate).toHaveBeenCalled();

    const rejectAction = getAction(result.current, 'Reject collection');
    act(() => {
      rejectAction && 'onClick' in rejectAction && rejectAction.onClick(mockCollection as never);
    });
  });

  it('runs approve action handler', async () => {
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({ count: 1, results: [{}] })
      )
    );
    const { result } = renderUseApprovalActions();
    const approveAction = getAction(result.current, 'Approve collection');

    act(() => {
      approveAction && 'onClick' in approveAction && approveAction.onClick(mockCollection as never);
    });

    await vi.waitFor(() => {
      expect(mockApproveModal).toHaveBeenCalledWith([mockCollection]);
    });
  });

  describe('Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should show Approve action regardless of permissions', () => {
      const { result } = renderUseApprovalActions();
      const approveAction = getAction(result.current, 'Approve collection');
      expect(isActionHidden(approveAction)).toBe(false);
    });

    it('should show Reject action regardless of permissions', () => {
      const { result } = renderUseApprovalActions();
      const rejectAction = getAction(result.current, 'Reject collection');
      expect(isActionHidden(rejectAction)).toBe(false);
    });

    it('should show Upload signature when can_upload_signatures is true', () => {
      mockFeatureFlags.can_upload_signatures = true;
      const { result } = renderUseApprovalActions();
      const uploadSigAction = getAction(result.current, 'Upload signature');
      expect(isActionHidden(uploadSigAction)).toBe(false);
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

      it('should hide Approve action', () => {
        const { result } = renderUseApprovalActions();
        const approveAction = getAction(result.current, 'Approve collection');
        expect(isActionHidden(approveAction)).toBe(true);
      });

      it('should hide Reject action', () => {
        const { result } = renderUseApprovalActions();
        const rejectAction = getAction(result.current, 'Reject collection');
        expect(isActionHidden(rejectAction)).toBe(true);
      });

      it('should hide Upload signature even when can_upload_signatures is true', () => {
        mockFeatureFlags.can_upload_signatures = true;
        const { result } = renderUseApprovalActions();
        const uploadSigAction = getAction(result.current, 'Upload signature');
        expect(isActionHidden(uploadSigAction)).toBe(true);
      });
    });

    describe('with ansible.modify_ansible_repo_content permission', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) => perm === 'ansible.modify_ansible_repo_content';
      });

      it('should show Approve action', () => {
        const { result } = renderUseApprovalActions();
        const approveAction = getAction(result.current, 'Approve collection');
        expect(isActionHidden(approveAction)).toBe(false);
      });

      it('should show Reject action', () => {
        const { result } = renderUseApprovalActions();
        const rejectAction = getAction(result.current, 'Reject collection');
        expect(isActionHidden(rejectAction)).toBe(false);
      });

      it('should show Upload signature when can_upload_signatures is true', () => {
        mockFeatureFlags.can_upload_signatures = true;
        const { result } = renderUseApprovalActions();
        const uploadSigAction = getAction(result.current, 'Upload signature');
        expect(isActionHidden(uploadSigAction)).toBe(false);
      });
    });

    describe('with superuser', () => {
      beforeEach(() => {
        mockUser = { is_superuser: true };
        mockHasPermission = () => false;
      });

      it('should show Approve action', () => {
        const { result } = renderUseApprovalActions();
        const approveAction = getAction(result.current, 'Approve collection');
        expect(isActionHidden(approveAction)).toBe(false);
      });

      it('should show Reject action', () => {
        const { result } = renderUseApprovalActions();
        const rejectAction = getAction(result.current, 'Reject collection');
        expect(isActionHidden(rejectAction)).toBe(false);
      });
    });
  });
});

describe('approveCollection', () => {
  it('opens approve modal when a single approved repository exists', async () => {
    let requestedUrl: string | undefined;
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ count: 1, results: [{}] });
      })
    );

    approveCollection([mockCollection], mockCopyToRepository, mockApproveModal, false, mockT);

    await vi.waitFor(() => {
      expect(mockApproveModal).toHaveBeenCalledWith([mockCollection]);
    });
    expect(requestedUrl).toContain('pulp_label_select=pipeline=approved');
  });

  it('delegates to copy flow when multiple approved repositories exist', async () => {
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({ count: 2, results: [{}, {}] })
      )
    );

    approveCollection([mockCollection], mockCopyToRepository, mockApproveModal, true, mockT);

    await vi.waitFor(() => {
      expect(mockCopyToRepository).toHaveBeenCalled();
    });
  });
});
