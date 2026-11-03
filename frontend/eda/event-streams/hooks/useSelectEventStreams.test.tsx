import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';

const setDialog = vi.fn();
const rulebookState = vi.hoisted(() => ({
  data: { id: 1, name: 'Demo rulebook' } as EdaRulebook | undefined,
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageDialog: () => [undefined, setDialog],
  };
});

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({ data: rulebookState.data }),
}));

vi.mock('../../rulebook-activations/components/SourceEventStreamMapping', () => ({
  SourceEventStreamMappingModal: () => <div>mapping-modal</div>,
}));

import { useSelectEventStreams } from './useSelectEventStreams';

describe('useSelectEventStreams', () => {
  it('should open the source mapping modal when a rulebook is loaded', () => {
    rulebookState.data = { id: 1, name: 'Demo rulebook' } as EdaRulebook;
    const setSourceMappings = vi.fn();
    const mappings: EdaSourceEventMapping[] = [];
    const { result } = renderHook(() => useSelectEventStreams('1', mappings, setSourceMappings));

    act(() => {
      result.current();
    });

    expect(setDialog).toHaveBeenCalled();
    expect(setDialog.mock.calls[0][0]).not.toBeUndefined();
  });

  it('should close the dialog when no rulebook is loaded', () => {
    rulebookState.data = undefined;
    setDialog.mockClear();
    const { result } = renderHook(() => useSelectEventStreams('1', [], vi.fn()));

    act(() => {
      result.current();
    });

    expect(setDialog).toHaveBeenCalledWith(undefined);
  });
});
