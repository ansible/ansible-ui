import type { ReactElement } from 'react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageDialog } from '@ansible/ansible-ui-framework';
import { Team } from '../../../interfaces/Team';
import { useSelectTeams } from './useSelectTeams';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageDialog: vi.fn(),
}));
vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({ pageItems: [], selectedItems: [] })),
}));
vi.mock('./useTeamsColumns', () => ({ useTeamsColumns: vi.fn(() => []) }));
vi.mock('./useTeamsFilters', () => ({ useTeamsFilters: vi.fn(() => []) }));

describe('useSelectTeams', () => {
  const setDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageDialog).mockReturnValue([null, setDialog]);
  });

  it('opens team multi-select dialog with custom title', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectTeams());
    result.current('Choose teams', onSelect);
    const dialogElement = setDialog.mock.calls[0]?.[0] as ReactElement<{ title: string }>;
    expect(dialogElement.props.title).toBe('Choose teams');
  });

  it('forwards selected teams to onSelect', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectTeams());
    result.current('Choose teams', onSelect);
    const dialogElement: unknown = setDialog.mock.calls[0]?.[0];
    expect(React.isValidElement(dialogElement)).toBe(true);
    if (!React.isValidElement(dialogElement)) {
      throw new Error('expected dialog element');
    }
    const props = dialogElement.props as {
      title: string;
      onSelect: (teams: Team[]) => void;
    };
    const teams = [{ id: 1, name: 'Ops' } as Team, { id: 2, name: 'Dev' } as Team];
    props.onSelect(teams);
    expect(onSelect).toHaveBeenCalledWith(teams);
  });

  it('returns a stable opener across re-renders', () => {
    const { result, rerender } = renderHook(() => useSelectTeams());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses SelectTeams dialog component', () => {
    const { result } = renderHook(() => useSelectTeams());
    result.current('Teams', vi.fn());
    const dialogElement = setDialog.mock.calls[0]?.[0] as ReactElement;
    expect((dialogElement.type as { name?: string }).name).toBe('SelectTeams');
  });
});
