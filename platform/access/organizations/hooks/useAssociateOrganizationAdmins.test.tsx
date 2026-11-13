import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';

const mocks = vi.hoisted(() => ({
  onComplete: vi.fn(),
  postRequest: vi.fn().mockResolvedValue(undefined),
  selectUsers: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '5' }),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: () => ({ data: { id: 5, name: 'Test Org' } }),
    useGet: () => ({
      data: { results: [{ id: 99, name: 'Organization Admin' }] },
    }),
  };
});

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: () => mocks.postRequest,
}));

vi.mock('../../users/hooks/useSelectUsers', () => ({
  useSelectUsers: () => mocks.selectUsers,
}));

import { useAssociateOrganizationAdmins } from './useAssociateOrganizationAdmins';

const baseUser: PlatformUser = {
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
    resource: { ansible_id: 'a', resource_type: 'user' },
  },
  username: 'alice',
  last_login_map_results: [],
  managed: false,
};

describe('useAssociateOrganizationAdmins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('opens user picker and posts role assignments per selected user', async () => {
    const { result } = renderHook(() => useAssociateOrganizationAdmins(mocks.onComplete));

    result.current();

    expect(mocks.selectUsers).toHaveBeenCalledTimes(1);
    const onSelect = mocks.selectUsers.mock.calls[0][3] as (users: PlatformUser[]) => Promise<void>;

    await onSelect([baseUser, { ...baseUser, id: 2, username: 'bob' }]);

    expect(mocks.postRequest).toHaveBeenCalledTimes(2);
    expect(mocks.postRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      object_id: 5,
      role_definition: 99,
      user: 1,
    });
    expect(mocks.postRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      object_id: 5,
      role_definition: 99,
      user: 2,
    });
    expect(mocks.onComplete).toHaveBeenCalledTimes(1);
  });
});
