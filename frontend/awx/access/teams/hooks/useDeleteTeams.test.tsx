import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Team } from '../../../interfaces/Team';
import { useDeleteTeams } from './useDeleteTeams';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useTeamsColumns', () => ({
  useTeamsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
  useOrganizationNameColumn: vi.fn(() => ({ header: 'Organization' })),
}));
vi.mock('@ansible/common-ui/crud/Data');

const team = (overrides: Partial<Team>): Team =>
  ({
    id: 1,
    name: 'Ops',
    summary_fields: { user_capabilities: { delete: true } },
    ...overrides,
  }) as Team;

describe('useDeleteTeams', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  it('opens delete teams confirmation sorted by name', () => {
    const { result } = renderHook(() => useDeleteTeams(vi.fn()));
    result.current([team({ name: 'Zulu' }), team({ id: 2, name: 'Alpha' })]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { items: Team[] };
    expect(callArgs.items[0]?.name).toBe('Alpha');
  });

  it('warns when teams lack delete permission', () => {
    const { result } = renderHook(() => useDeleteTeams(vi.fn()));
    result.current([
      team({
        summary_fields: {
          user_capabilities: { edit: false, delete: false },
        } as Team['summary_fields'],
      }),
    ]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { alertPrompts?: string[] };
    expect(callArgs.alertPrompts?.[0]).toMatch(/cannot be deleted/i);
  });
});
