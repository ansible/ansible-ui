import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Organization } from '../../../interfaces/Organization';
import { useDeleteOrganizations } from './useDeleteOrganizations';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('../Organizations', () => ({
  useOrganizationsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));
vi.mock('@ansible/common-ui/crud/Data');

describe('useDeleteOrganizations', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  it('opens organization delete confirmation', () => {
    const onComplete = vi.fn();
    const orgs: Organization[] = [
      { id: 2, name: 'Z Org' } as Organization,
      { id: 1, name: 'A Org' } as Organization,
    ];
    const { result } = renderHook(() => useDeleteOrganizations(onComplete));
    result.current(orgs);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      items: Organization[];
      onComplete: () => void;
    };
    expect(callArgs.items[0]?.name).toBe('A Org');
    expect(callArgs.onComplete).toBe(onComplete);
  });
});
