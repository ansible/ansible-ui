import type { ReactElement } from 'react';
import { render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Instance } from '../../../interfaces/Instance';
import { useMultiSelectPeer } from './useSelectPeers';

const mockSetDialog: ReturnType<typeof vi.fn> = vi.fn();
const mockColumns = vi.hoisted(() => [
  { header: 'Name' },
  { header: 'Node type' },
  { header: 'Latency' },
]);

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog],
    MultiSelectDialog: (props: {
      title: string;
      onSelect: (instances: Instance[]) => void;
      tableColumns: { header: string }[];
    }) => (
      <div data-testid="multi-select-dialog">
        <span>{props.title}</span>
        <span data-testid="column-count">{props.tableColumns.length}</span>
        <button
          type="button"
          onClick={() => props.onSelect([{ id: 9, hostname: 'peer' } as Instance])}
        >
          pick peer
        </button>
      </div>
    ),
  };
});

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: () => ({ data: [], error: undefined, isLoading: false }),
}));

vi.mock('./useInstancesColumns', () => ({
  useInstancesColumns: () => mockColumns,
}));

vi.mock('../Instances', () => ({
  usePeersFilters: () => [],
}));

describe('useMultiSelectPeer', () => {
  beforeEach(() => {
    mockSetDialog.mockClear();
  });

  it('opens the select peers dialog with lookup title and filtered columns', () => {
    const { result } = renderHook(() => useMultiSelectPeer());
    const onSelect = vi.fn();

    result.current(onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
    const dialog = mockSetDialog.mock.calls[0]?.[0] as ReactElement;
    const { getByText, getByTestId } = render(dialog);
    expect(getByText('Select peers')).toBeInTheDocument();
    expect(getByTestId('column-count')).toHaveTextContent('2');
  });

  it('forwards peer selection from dialog to opener callback', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useMultiSelectPeer());
    result.current(onSelect);
    const dialog = mockSetDialog.mock.calls[0]?.[0] as ReactElement<{
      onSelect: (instances: Instance[]) => void;
    }>;
    const peers = [{ id: 9, hostname: 'peer' } as Instance];
    dialog.props.onSelect(peers);
    expect(onSelect).toHaveBeenCalledWith(peers);
  });
});
