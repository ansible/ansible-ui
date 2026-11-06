import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

const { mockBulkConfirmation, mockRequestDelete } = vi.hoisted(() => ({
  mockBulkConfirmation: vi.fn(),
  mockRequestDelete: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (!options) return key;
      return key.replace(/\{\{(\w+)\}\}/g, (_m, name: string) =>
        String(options[name] ?? `{{${name}}}`)
      );
    },
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});

vi.mock('./useTeamColumns', () => ({
  useTeamColumns: () => [{ id: 'name', header: 'Name', cell: () => null }],
}));

vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: () => ({ id: 'action-name', header: 'Team', cell: () => null }),
}));

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/Data');
  return {
    ...actual,
    requestDelete: (...args: unknown[]): Promise<void> =>
      mockRequestDelete(...args) as Promise<void>,
  };
});

import { useDeleteTeams } from './useDeleteTeams';

const mockTeam = (overrides: Partial<PlatformTeam> = {}): PlatformTeam => ({
  id: 7,
  name: 'gamma',
  description: '',
  url: '/api/gateway/v1/teams/7/',
  created: '',
  created_by: '1',
  modified: '',
  modified_by: '1',
  related: {
    created_by: '',
    modified_by: '',
    organization: '',
  },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 1, name: 'Org' },
    resource: { ansible_id: 'x', resource_type: 'team' },
  },
  organization: 1,
  users: [],
  ...overrides,
});

describe('useDeleteTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should invoke bulk confirmation with sorted teams and call delete URL', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete));

    const teamB = mockTeam({ id: 2, name: 'b-team' });
    const teamA = mockTeam({ id: 1, name: 'a-team' });

    result.current([teamB, teamA]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: PlatformTeam[];
      actionFn: (team: PlatformTeam, signal: AbortSignal) => unknown;
      onComplete: (teams: PlatformTeam[]) => void;
    };

    expect(callArg.items.map((t) => t.name)).toEqual(['a-team', 'b-team']);

    const signal = new AbortController().signal;
    callArg.actionFn(teamA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith('/api/gateway/v1/teams/1/', signal);

    const teams: PlatformTeam[] = [teamA];
    callArg.onComplete(teams);
    expect(onComplete).toHaveBeenCalledWith(teams);
  });
});
