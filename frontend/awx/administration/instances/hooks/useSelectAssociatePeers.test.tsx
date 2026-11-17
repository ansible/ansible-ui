import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePeerInstanceModal } from './useSelectAssociatePeers';

const mockPushDialog = vi.fn();
const mockPopDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageDialogs: () => ({ pushDialog: mockPushDialog, popDialog: mockPopDialog }),
    MultiSelectDialog: () => <div data-testid="peer-select-dialog" />,
  };
});

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: () => ({ data: [], error: undefined, isLoading: false }),
}));
vi.mock('../../../common/useAwxGetAllPages', () => ({
  useAwxGetAllPages: () => ({ results: [] }),
}));
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: () => ({ data: { id: 1, peers: [], managed: false } }),
}));
vi.mock('./usePeersColumns', () => ({
  usePeersColumns: () => [{ header: 'Instance name' }, { header: 'Address' }],
}));
vi.mock('../Instances', () => ({
  usePeersTabFilters: () => [],
}));

describe('usePeerInstanceModal', () => {
  it('opens the associate peers dialog when props are set', async () => {
    const { result } = renderHook(() => usePeerInstanceModal());
    const onPeer = vi.fn();

    result.current({ instanceId: '1', onPeer });

    await waitFor(() => expect(mockPushDialog).toHaveBeenCalledTimes(1));
    expect(mockPushDialog.mock.calls[0]?.[0]).toBeTruthy();
  });

  it('closes the dialog when props are cleared', async () => {
    const { result } = renderHook(() => usePeerInstanceModal());

    result.current({ instanceId: '1', onPeer: vi.fn() });
    await waitFor(() => expect(mockPushDialog).toHaveBeenCalled());

    result.current(undefined);
    await waitFor(() => expect(mockPopDialog).toHaveBeenCalled());
  });
});
