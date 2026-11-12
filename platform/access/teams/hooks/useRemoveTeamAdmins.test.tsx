import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mocks = vi.hoisted(() => ({
  bulkConfirmation: vi.fn(),
  onComplete: vi.fn(),
  getRequest: vi.fn().mockResolvedValue({
    results: [{ id: 500 }, { id: 501 }],
  }),
  deleteRequest: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
  }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '9' }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mocks.bulkConfirmation,
  };
});

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: () => ({ data: { id: 9, name: 'T' } }),
    useGet: () => ({
      data: { results: [{ id: 88, name: 'Team Admin' }] },
    }),
    useGetRequest: () => mocks.getRequest,
  };
});

vi.mock('../../users/hooks/useUserColumns', () => ({
  useUsersColumns: () => [{ id: 'u1', header: 'User' }],
}));

vi.mock('@ansible/common-ui/crud/useDeleteRequest', () => ({
  useDeleteRequest: () => mocks.deleteRequest,
}));

import { useRemoveTeamAdmins } from './useRemoveTeamAdmins';

const alice: PlatformUser = {
  id: 1,
  url: '/1',
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
  username: 'zoe',
  last_login_map_results: [],
  managed: false,
};

const bob: PlatformUser = {
  ...alice,
  id: 2,
  username: 'adam',
};

describe('useRemoveTeamAdmins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('opens bulk confirmation and deletes assignments for each admin', async () => {
    const { result } = renderHook(() => useRemoveTeamAdmins(mocks.onComplete));
    result.current([alice, bob]);

    expect(mocks.bulkConfirmation).toHaveBeenCalledTimes(1);
    const cfg = mocks.bulkConfirmation.mock.calls[0][0] as {
      items: PlatformUser[];
      actionFn: (user: PlatformUser) => Promise<void>;
    };

    expect(cfg.items.map((u) => u.username)).toEqual(['adam', 'zoe']);

    await cfg.actionFn(alice);

    expect(mocks.getRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/`, {
      user: 1,
      object_id: 9,
      role_definition: '88',
    });
    expect(mocks.deleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/500/`);
    expect(mocks.deleteRequest).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/501/`);
  });
});
