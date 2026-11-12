import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMultiSelectPeer } from './useSelectPeers';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog],
    MultiSelectDialog: () => <div data-testid="multi-select-dialog" />,
  };
});

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: () => ({ data: [], error: undefined, isLoading: false }),
}));

vi.mock('./useInstancesColumns', () => ({
  useInstancesColumns: () => [{ header: 'Name' }, { header: 'Node type' }, { header: 'Other' }],
}));

vi.mock('../Instances', () => ({
  usePeersFilters: () => [],
}));

describe('useMultiSelectPeer', () => {
  it('opens the select peers dialog', () => {
    const { result } = renderHook(() => useMultiSelectPeer());
    const onSelect = vi.fn();

    result.current(onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
    expect(mockSetDialog.mock.calls[0]?.[0]).toBeTruthy();
  });
});
