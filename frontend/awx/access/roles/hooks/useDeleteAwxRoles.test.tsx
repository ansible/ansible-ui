import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { useDeleteAwxRoles } from './useDeleteAwxRoles';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('../../../common/useAwxActiveUser');
vi.mock('./useAwxRoleColumns', () => ({
  useAwxRoleColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/crud/Data');

const baseRole = (overrides: Partial<AwxRbacRole>): AwxRbacRole =>
  ({
    id: 1,
    name: 'Custom Role',
    managed: false,
    ...overrides,
  }) as AwxRbacRole;

describe('useDeleteAwxRoles', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: { is_superuser: true } } as never);
  });

  it('opens bulk confirmation for deletable roles', () => {
    const { result } = renderHook(() => useDeleteAwxRoles(vi.fn()));
    result.current([baseRole({ id: 1, name: 'Alpha' }), baseRole({ id: 2, name: 'Beta' })]);

    expect(mockBulkAction).toHaveBeenCalledWith(
      expect.objectContaining({
        isDanger: true,
      })
    );
    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { items: AwxRbacRole[] };
    expect(callArgs.items[0]?.name).toBe('Alpha');
    expect(callArgs.items[1]?.name).toBe('Beta');
  });

  it('includes alert prompts for built-in and permission-blocked roles', () => {
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_superuser: false },
    } as never);

    const { result } = renderHook(() => useDeleteAwxRoles(vi.fn()));
    result.current([
      baseRole({ id: 1, managed: true, name: 'Built-in' }),
      baseRole({ id: 2, managed: false, name: 'Custom' }),
    ]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { alertPrompts?: string[] };
    expect(callArgs.alertPrompts?.length).toBeGreaterThan(0);
  });

  it('marks built-in roles as non-actionable', () => {
    const { result } = renderHook(() => useDeleteAwxRoles(vi.fn()));
    result.current([baseRole({ managed: true })]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      isItemNonActionable: (role: AwxRbacRole) => string | undefined;
    };
    expect(callArgs.isItemNonActionable(baseRole({ managed: true }))).toMatch(/built-in/i);
  });
});
