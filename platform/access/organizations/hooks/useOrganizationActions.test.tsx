import { renderHook } from '@testing-library/react';
import {
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

const mockPageNavigate = vi.fn();
const mockDeleteOrganizations = vi.fn();
const mockUnselectItemsAndRefresh = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => (route: string) => `/mock/${route}`,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '42' }),
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({
    data: { actions: { POST: true, PUT: true, PATCH: true } },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../hooks/useDeleteOrganizations', () => ({
  useDeleteOrganizations: () => mockDeleteOrganizations,
}));

import { useOrganizationRowActions, useOrganizationPageActions } from './useOrganizationActions';

function findSingleButtonAction(
  actions: ReturnType<typeof useOrganizationRowActions>,
  label: string
) {
  return actions.find(
    (a) =>
      a.type === PageActionType.Button &&
      a.selection === PageActionSelection.Single &&
      a.label === label
  ) as IPageActionButtonSingle<PlatformOrganization> | undefined;
}

const mockOrganization: PlatformOrganization = {
  id: 42,
  name: 'Test Organization',
  description: 'A test organization',
  url: '/api/gateway/v1/organizations/42/',
  created: '2024-01-01T00:00:00Z',
  created_by: 1,
  modified: '2024-01-01T00:00:00Z',
  modified_by: 1,
  managed: false,
  related: {
    created_by: '/api/gateway/v1/users/1/',
    modified_by: '/api/gateway/v1/users/1/',
    teams: '/api/gateway/v1/organizations/42/teams/',
  },
  summary_fields: {
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
  },
};

const mockManagedOrganization: PlatformOrganization = {
  ...mockOrganization,
  id: 1,
  name: 'Default',
  managed: true,
};

describe('useOrganizationRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return edit and delete actions', () => {
    const { result } = renderHook(() => useOrganizationRowActions(mockUnselectItemsAndRefresh));

    expect(findSingleButtonAction(result.current, 'Edit organization')).toBeDefined();
    expect(findSingleButtonAction(result.current, 'Delete organization')).toBeDefined();
  });

  test('should navigate to edit route when edit action is clicked', () => {
    const { result } = renderHook(() => useOrganizationRowActions(mockUnselectItemsAndRefresh));

    const editAction = findSingleButtonAction(result.current, 'Edit organization');
    expect(editAction).toBeDefined();
    editAction!.onClick(mockOrganization);

    expect(mockPageNavigate).toHaveBeenCalledWith(
      'platform-edit-organization',
      expect.objectContaining({ params: { id: 42 } })
    );
  });

  test('should call delete when delete action is clicked', () => {
    const { result } = renderHook(() => useOrganizationRowActions(mockUnselectItemsAndRefresh));

    const deleteAction = findSingleButtonAction(result.current, 'Delete organization');
    expect(deleteAction).toBeDefined();
    deleteAction!.onClick(mockOrganization);

    expect(mockDeleteOrganizations).toHaveBeenCalledWith([mockOrganization]);
  });

  test('should disable delete for system managed organizations', () => {
    const { result } = renderHook(() => useOrganizationRowActions(mockUnselectItemsAndRefresh));

    const deleteAction = findSingleButtonAction(result.current, 'Delete organization');
    expect(deleteAction).toBeDefined();
    expect(typeof deleteAction!.isDisabled).toBe('function');
    const disabledMessage = (deleteAction!.isDisabled as (item: PlatformOrganization) => string)(
      mockManagedOrganization
    );
    expect(disabledMessage).toBeTruthy();
  });

  test('should allow delete for non-managed organizations', () => {
    const { result } = renderHook(() => useOrganizationRowActions(mockUnselectItemsAndRefresh));

    const deleteAction = findSingleButtonAction(result.current, 'Delete organization');
    expect(deleteAction).toBeDefined();
    const disabledMessage = (deleteAction!.isDisabled as (item: PlatformOrganization) => string)(
      mockOrganization
    );
    expect(disabledMessage).toBe('');
  });
});

describe('useOrganizationPageActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return edit and delete actions for the details page', () => {
    const { result } = renderHook(() => useOrganizationPageActions(mockUnselectItemsAndRefresh));

    expect(findSingleButtonAction(result.current, 'Edit organization')).toBeDefined();
    expect(findSingleButtonAction(result.current, 'Delete organization')).toBeDefined();
  });

  test('should navigate to edit route when details page edit action is clicked', () => {
    const { result } = renderHook(() => useOrganizationPageActions(mockUnselectItemsAndRefresh));

    const editAction = findSingleButtonAction(result.current, 'Edit organization');
    expect(editAction).toBeDefined();
    editAction!.onClick(mockOrganization);

    expect(mockPageNavigate).toHaveBeenCalledWith(
      'platform-edit-organization',
      expect.objectContaining({ params: { id: 42 } })
    );
  });

  test('should disable delete for managed organizations on details page', () => {
    const { result } = renderHook(() => useOrganizationPageActions(mockUnselectItemsAndRefresh));

    const deleteAction = findSingleButtonAction(result.current, 'Delete organization');
    expect(deleteAction).toBeDefined();
    const disabledMessage = (deleteAction!.isDisabled as (item: PlatformOrganization) => string)(
      mockManagedOrganization
    );
    expect(disabledMessage).toBeTruthy();
  });
});
