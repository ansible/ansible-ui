import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { AwxUser } from '../../../interfaces/User';
import { useDeleteUsers } from './useDeleteUsers';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useUsersColumns', () => ({
  useUsersColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/crud/Data');

const user = (overrides: Partial<AwxUser>): AwxUser =>
  ({
    id: 1,
    username: 'alice',
    summary_fields: { user_capabilities: { delete: true } },
    ...overrides,
  }) as AwxUser;

describe('useDeleteUsers', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  it('sorts users and opens delete confirmation', () => {
    const { result } = renderHook(() => useDeleteUsers(vi.fn()));
    result.current([user({ username: 'zara' }), user({ id: 2, username: 'amy' })]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { items: AwxUser[]; isDanger: boolean };
    expect(callArgs.items[0]?.username).toBe('amy');
    expect(callArgs.isDanger).toBe(true);
  });

  it('shows alert when users cannot be deleted', () => {
    const { result } = renderHook(() => useDeleteUsers(vi.fn()));
    result.current([
      user({
        summary_fields: {
          user_capabilities: { edit: false, delete: false },
        } as AwxUser['summary_fields'],
      }),
    ]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { alertPrompts?: string[] };
    expect(callArgs.alertPrompts?.[0]).toMatch(/cannot be deleted/i);
  });
});
