import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mocks = vi.hoisted(() => ({
  selectUsers: vi.fn(),
  postRequest: vi.fn(),
  onComplete: vi.fn(() => Promise.resolve()),
  useGetItem: vi.fn(),
  useGet: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '5' }),
}));

vi.mock('../../users/hooks/useSelectUsers', () => ({
  useSelectUsers: () => mocks.selectUsers,
}));

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: () => mocks.postRequest,
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: mocks.useGetItem as typeof actual.useGetItem,
    useGet: mocks.useGet as typeof actual.useGet,
  };
});

import { useAssociateTeamAdmins } from './useAssociateTeamAdmins';

const team: PlatformTeam = {
  id: 9,
  name: 'T',
  description: '',
  url: '',
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: { created_by: '', modified_by: '', organization: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 1, name: 'O' },
    resource: { ansible_id: 'x', resource_type: 'team' },
  },
  organization: 1,
  users: [],
};

const user: PlatformUser = {
  id: 3,
  url: '/u/3',
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'u', resource_type: 'user' },
  },
  username: 'u3',
  last_login_map_results: [],
  managed: false,
};

describe('useAssociateTeamAdmins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useGetItem.mockReturnValue({ data: team });
    mocks.useGet.mockReturnValue({
      data: { results: [{ id: 200, name: 'Team Admin' }] },
    });
  });

  test('posts Team Admin role assignments and completes', async () => {
    const { result } = renderHook(() => useAssociateTeamAdmins(mocks.onComplete));
    result.current();

    expect(mocks.selectUsers).toHaveBeenCalled();
    const [, , , onSelect] = mocks.selectUsers.mock.calls[0] as [
      string,
      string,
      string,
      (users: PlatformUser[]) => Promise<void>,
    ];

    await onSelect([user]);

    expect(mocks.postRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      object_id: 9,
      role_definition: 200,
      user: 3,
    });
    expect(mocks.onComplete).toHaveBeenCalled();
  });

  test('does not post when team is missing', async () => {
    mocks.useGetItem.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useAssociateTeamAdmins(mocks.onComplete));
    result.current();

    const [, , , onSelect] = mocks.selectUsers.mock.calls[0] as [
      string,
      string,
      string,
      (users: PlatformUser[]) => Promise<void>,
    ];
    await onSelect([user]);

    expect(mocks.postRequest).not.toHaveBeenCalled();
    expect(mocks.onComplete).not.toHaveBeenCalled();
  });
});
