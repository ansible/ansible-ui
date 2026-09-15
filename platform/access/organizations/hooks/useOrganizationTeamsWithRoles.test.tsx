import { renderHook } from '@testing-library/react';
import { IToolbarFilter } from '@ansible/ansible-ui-framework';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOrganizationTeamsWithRoles } from './useOrganizationTeamsWithRoles';

const { useGetMock, usePlatformViewMock } = vi.hoisted(() => ({
  useGetMock: vi.fn(),
  usePlatformViewMock: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: useGetMock,
}));

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: usePlatformViewMock,
}));

describe('useOrganizationTeamsWithRoles', () => {
  beforeEach(() => {
    useGetMock.mockReset();
    usePlatformViewMock.mockReset();
    usePlatformViewMock.mockReturnValue({ pageItems: [], itemCount: 0 });
  });

  it('filters by organization when there are no role assignments', () => {
    useGetMock.mockReturnValue({ data: { results: [] } });

    const toolbarFilters: IToolbarFilter[] = [];
    const { result } = renderHook(() => useOrganizationTeamsWithRoles(42, toolbarFilters));

    expect(result.current.rolesByTeamId.size).toBe(0);
    expect(useGetMock).toHaveBeenCalledWith(expect.stringContaining('object_id=42'));
    expect(usePlatformViewMock).toHaveBeenCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { organization: '42' },
      toolbarFilters,
    });
  });

  it('includes assigned team IDs and builds roles by team', () => {
    useGetMock.mockReturnValue({
      data: {
        results: [
          {
            team: 7,
            summary_fields: {
              role_definition: { id: 5, name: 'Organization Admin' },
            },
          },
          {
            team: 7,
            summary_fields: {
              role_definition: { id: 6, name: 'Organization Auditor' },
            },
          },
          {
            team: 8,
            summary_fields: {
              role_definition: { id: 5, name: 'Organization Admin' },
            },
          },
        ],
      },
    });

    const toolbarFilters: IToolbarFilter[] = [];
    const { result } = renderHook(() => useOrganizationTeamsWithRoles(42, toolbarFilters));

    expect(result.current.rolesByTeamId.get(7)).toEqual([
      { id: 5, name: 'Organization Admin' },
      { id: 6, name: 'Organization Auditor' },
    ]);
    expect(result.current.rolesByTeamId.get(8)).toEqual([{ id: 5, name: 'Organization Admin' }]);
    expect(usePlatformViewMock).toHaveBeenCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { or__organization: '42', or__id__in: '7,8' },
      toolbarFilters,
    });
  });

  it('does not request assignments before the organization is available', () => {
    useGetMock.mockReturnValue({ data: undefined });

    const toolbarFilters: IToolbarFilter[] = [];
    const { result } = renderHook(() => useOrganizationTeamsWithRoles(undefined, toolbarFilters));

    expect(result.current.rolesByTeamId.size).toBe(0);
    expect(useGetMock).toHaveBeenCalledWith(undefined);
    expect(usePlatformViewMock).toHaveBeenCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { organization: '' },
      toolbarFilters,
    });
  });
});
