import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Token } from '../../../interfaces/Token';
import { useDeleteUserTokens } from './useDeleteUserTokens';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useUserTokensColumns', () => ({
  useUserTokensColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/crud/Data');

describe('useDeleteUserTokens', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  it('uses singular copy for one token', () => {
    const token = { id: 1, summary_fields: { user: { username: 'alice' } } } as Token;
    const { result } = renderHook(() => useDeleteUserTokens(vi.fn()));
    result.current([token]);
    expect(mockBulkAction).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Permanently delete token' })
    );
  });

  it('uses plural copy for multiple tokens', () => {
    const tokens = [
      { id: 1, summary_fields: { user: { username: 'z' } } },
      { id: 2, summary_fields: { user: { username: 'a' } } },
    ] as Token[];
    const { result } = renderHook(() => useDeleteUserTokens(vi.fn()));
    result.current(tokens);
    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { items: Token[] };
    expect(callArgs.items[0]?.summary_fields.user?.username).toBe('a');
  });
});
