import { renderHook } from '@testing-library/react';
import {
  IPageActionButton,
  IPageActionButtonMultiple,
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { IPlatformView } from '../../../hooks/usePlatformView';
import type {
  ActionsResponse,
  OptionsResponse,
} from '@ansible/common-ui/interfaces/OptionsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mockAssociate = vi.fn();
const mockRemove = vi.fn();
const mockRefresh = vi.fn();
const mockUnselectItemsAndRefresh = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '12' }),
}));

type UseGetItemOrg = { data: PlatformOrganization | undefined };
type UseOptionsOrg = { data: OptionsResponse<ActionsResponse> | undefined };

const mockUseGetItem = vi.fn<(url: unknown, id: unknown) => UseGetItemOrg>();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: (url: unknown, id: unknown): UseGetItemOrg => mockUseGetItem(url, id),
}));

const mockUseOptions = vi.fn<(url: unknown) => UseOptionsOrg>();
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: (url: unknown): UseOptionsOrg => mockUseOptions(url),
}));

vi.mock('./useAssociateOrganizationAdmins', () => ({
  useAssociateOrganizationAdmins: (refresh: () => void) => {
    expect(refresh).toBe(mockRefresh);
    return mockAssociate;
  },
}));

vi.mock('./useRemoveOrganizationAdmins', () => ({
  useRemoveOrganizationAdmins: (unselect: typeof mockUnselectItemsAndRefresh) => {
    expect(unselect).toBe(mockUnselectItemsAndRefresh);
    return mockRemove;
  },
}));

import {
  useOrganizationAdminsRowActions,
  useOrganizationAdminsToolbarActions,
} from './useOrganizationAdminsActions';

const org: PlatformOrganization = {
  id: 99,
  name: 'Test Org',
  description: '',
  url: '/api/gateway/v1/organizations/99/',
  created: '',
  created_by: 1,
  modified: '',
  modified_by: 1,
  managed: false,
  related: { created_by: '', modified_by: '', teams: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
  },
};

const adminUser: PlatformUser = {
  id: 1,
  url: '/u/1',
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'x', resource_type: 'user' },
  },
  username: 'alice',
  last_login_map_results: [],
  managed: false,
};

const minimalView = {
  refresh: mockRefresh,
  unselectItemsAndRefresh: mockUnselectItemsAndRefresh,
} as unknown as IPlatformView<PlatformUser>;

function toolbarButton(
  actions: ReturnType<typeof useOrganizationAdminsToolbarActions>,
  label: string
): IPageActionButton | IPageActionButtonMultiple<PlatformUser> | undefined {
  return actions.find(
    (a): a is IPageActionButton | IPageActionButtonMultiple<PlatformUser> =>
      a.type === PageActionType.Button && 'label' in a && a.label === label
  );
}

describe('useOrganizationAdminsToolbarActions', () => {
  const optionsEditable: OptionsResponse<ActionsResponse> = {
    name: 'Organization',
    description: '',
    actions: { PATCH: { x: {} as ActionsResponse } },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({ data: org });
    mockUseOptions.mockReturnValue({
      data: optionsEditable,
    });
  });

  test('wires associate/remove hooks with view refresh callbacks', () => {
    const { result } = renderHook(() => useOrganizationAdminsToolbarActions(minimalView));

    const add = toolbarButton(result.current, 'Add administrators');
    expect(add).toBeDefined();
    if (add?.selection === PageActionSelection.None) {
      add.onClick();
    }
    expect(mockAssociate).toHaveBeenCalledTimes(1);

    const remove = toolbarButton(result.current, 'Remove administrators');
    expect(remove).toBeDefined();
    if (remove?.selection === PageActionSelection.Multiple) {
      remove.onClick([]);
    }
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  test('enables actions when organization OPTIONS include PUT or PATCH', () => {
    const { result } = renderHook(() => useOrganizationAdminsToolbarActions(minimalView));

    expect(toolbarButton(result.current, 'Add administrators')?.isDisabled).toBeUndefined();
    expect(toolbarButton(result.current, 'Remove administrators')?.isDisabled).toBeUndefined();
  });

  test('disables actions when organization cannot be edited', () => {
    const optionsReadOnly: OptionsResponse<ActionsResponse> = {
      name: 'Organization',
      description: '',
      actions: { GET: { x: {} as ActionsResponse } },
    };
    mockUseOptions.mockReturnValue({ data: optionsReadOnly });

    const { result } = renderHook(() => useOrganizationAdminsToolbarActions(minimalView));

    expect(typeof toolbarButton(result.current, 'Add administrators')?.isDisabled).toBe('string');
    expect(typeof toolbarButton(result.current, 'Remove administrators')?.isDisabled).toBe(
      'string'
    );
  });

  test('requests options using organization id from useGetItem', () => {
    renderHook(() => useOrganizationAdminsToolbarActions(minimalView));

    expect(mockUseGetItem).toHaveBeenCalledWith(gatewayAPI`/organizations`, '12');
    expect(mockUseOptions).toHaveBeenCalledWith(gatewayAPI`/organizations/${org.id.toString()}/`);
  });
});

describe('useOrganizationAdminsRowActions', () => {
  const optionsEditable: OptionsResponse<ActionsResponse> = {
    name: 'Organization',
    description: '',
    actions: { PUT: { x: {} as ActionsResponse } },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({ data: org });
    mockUseOptions.mockReturnValue({
      data: optionsEditable,
    });
  });

  function findRowRemove(actions: ReturnType<typeof useOrganizationAdminsRowActions>) {
    return actions.find(
      (a): a is IPageActionButtonSingle<PlatformUser> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Single
    );
  }

  test('remove row action calls remove hook with selected admin', () => {
    const { result } = renderHook(() => useOrganizationAdminsRowActions(minimalView));

    const remove = findRowRemove(result.current);
    expect(remove).toBeDefined();
    remove?.onClick(adminUser);
    expect(mockRemove).toHaveBeenCalledWith([adminUser]);
  });

  test('row remove is enabled when organization is editable', () => {
    const { result } = renderHook(() => useOrganizationAdminsRowActions(minimalView));

    const remove = findRowRemove(result.current);
    expect(remove?.isDisabled).toBe('');
  });

  test('row remove shows disabled message without edit permission', () => {
    const optionsNoEdit: OptionsResponse<ActionsResponse> = {
      name: 'Organization',
      description: '',
      actions: {},
    };
    mockUseOptions.mockReturnValue({ data: optionsNoEdit });

    const { result } = renderHook(() => useOrganizationAdminsRowActions(minimalView));

    const remove = findRowRemove(result.current);
    expect(remove?.isDisabled).toBe(
      'The administrator cannot be removed due to insufficient permissions.'
    );
  });
});
