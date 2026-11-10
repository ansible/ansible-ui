import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSelectInventory } from './useSelectInventory';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog],
  };
});

vi.mock('@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog', () => ({
  SingleSelectDialog: () => <div data-testid="single-select-dialog" />,
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: () => ({ data: [], error: undefined, isLoading: false }),
}));

vi.mock('./useInventoriesColumns', () => ({
  useInventoriesColumns: () => [],
}));

vi.mock('./useInventoriesFilters', () => ({
  useInventoriesFilters: () => [],
}));

describe('useSelectInventory', () => {
  it('opens the select inventory dialog', () => {
    const { result } = renderHook(() => useSelectInventory());

    result.current(vi.fn());

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
  });
});
