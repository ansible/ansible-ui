import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mocks = vi.hoisted(() => ({
  bulkConfirmation: vi.fn(),
  onComplete: vi.fn(),
  teamRolesColumns: vi.fn(() => [{ id: 'c1', header: 'Col' }]),
  requestDelete: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mocks.bulkConfirmation,
  };
});

vi.mock('./useTeamRolesColumns', () => ({
  useTeamRolesColumns: () => mocks.teamRolesColumns(),
}));

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    requestDelete: mocks.requestDelete,
  };
});

import { useRemoveTeamRoleAssignments } from './useRemoveTeamRoleAssignments';

const assignmentA: TeamAssignment = {
  id: 2,
  team: 1,
  object_id: 'o',
  content_type: 'shared.team',
  role_definition: 10,
  summary_fields: {
    team: { id: 1, name: 't' },
    object_role: { id: 1 },
    role_definition: { id: 10, name: 'Beta', description: '', managed: false },
    content_object: { name: 'x', id: 1 },
  },
};

const assignmentB: TeamAssignment = {
  ...assignmentA,
  id: 3,
  summary_fields: {
    ...assignmentA.summary_fields,
    role_definition: { id: 11, name: 'Alpha', description: '', managed: false },
  },
};

describe('useRemoveTeamRoleAssignments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('passes sorted items to bulk confirmation and deletes by assignment id', async () => {
    const { result } = renderHook(() => useRemoveTeamRoleAssignments(mocks.onComplete));

    result.current([assignmentA, assignmentB]);

    expect(mocks.bulkConfirmation).toHaveBeenCalledTimes(1);
    const arg = mocks.bulkConfirmation.mock.calls[0][0] as {
      items: TeamAssignment[];
      actionFn: (a: TeamAssignment, s: AbortSignal) => Promise<unknown>;
    };

    expect(arg.items.map((i) => i.summary_fields.role_definition.name)).toEqual(['Alpha', 'Beta']);
    expect(mocks.teamRolesColumns).toHaveBeenCalled();

    const signal = new AbortController().signal;
    await arg.actionFn(assignmentA, signal);

    expect(mocks.requestDelete).toHaveBeenCalledWith(
      gatewayAPI`/role_team_assignments/${assignmentA.id.toString()}/`,
      signal
    );
  });
});
