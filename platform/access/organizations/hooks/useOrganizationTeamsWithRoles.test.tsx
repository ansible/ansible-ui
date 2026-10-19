import { ITableColumn, IToolbarFilter } from '@ansible/ansible-ui-framework';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOrganizationTeamsWithRoles } from './useOrganizationTeamsWithRoles';

const { useGetAllMock, usePlatformViewMock } = vi.hoisted(() => ({
  useGetAllMock: vi.fn(),
  usePlatformViewMock: vi.fn(),
}));

vi.mock('@ansible/platform-ui/common/useGetAll', () => ({
  useGetAll: useGetAllMock,
}));

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: usePlatformViewMock,
}));

describe('useOrganizationTeamsWithRoles', () => {
  beforeEach(() => {
    useGetAllMock.mockReset();
    usePlatformViewMock.mockReset();
    usePlatformViewMock.mockReturnValue({ pageItems: [], itemCount: 0 });
  });

  it('filters by organization when there are no role assignments', () => {
    useGetAllMock.mockReturnValue({ items: [] });

    const toolbarFilters: IToolbarFilter[] = [];
    const tableColumns: ITableColumn<PlatformTeam>[] = [];
    const { result } = renderHook(() =>
      useOrganizationTeamsWithRoles(42, toolbarFilters, tableColumns)
    );

    expect(result.current.rolesByTeamId.size).toBe(0);
    expect(useGetAllMock).toHaveBeenCalledWith(expect.stringContaining('object_id=42'), 200, null);
    expect(usePlatformViewMock).toHaveBeenCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { organization: '42' },
      toolbarFilters,
      tableColumns,
    });
  });

  it('includes assigned team IDs and builds roles by team', () => {
    useGetAllMock.mockReturnValue({
      items: [
        {
          team: 7,
          summary_fields: { role_definition: { id: 5, name: 'Organization Admin' } },
        },
        {
          team: 7,
          summary_fields: { role_definition: { id: 6, name: 'Organization Auditor' } },
        },
        {
          team: 8,
          summary_fields: { role_definition: { id: 5, name: 'Organization Admin' } },
        },
      ],
    });

    const toolbarFilters: IToolbarFilter[] = [];
    const tableColumns: ITableColumn<PlatformTeam>[] = [];
    const { result } = renderHook(() =>
      useOrganizationTeamsWithRoles(42, toolbarFilters, tableColumns)
    );

    expect(result.current.rolesByTeamId.get(7)).toEqual([
      { id: 5, name: 'Organization Admin' },
      { id: 6, name: 'Organization Auditor' },
    ]);
    expect(result.current.rolesByTeamId.get(8)).toEqual([{ id: 5, name: 'Organization Admin' }]);
    expect(usePlatformViewMock).toHaveBeenCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { or__organization: '42', or__id__in: '7,8' },
      toolbarFilters,
      tableColumns,
    });
  });

  it('does not request assignments before the organization is available', () => {
    useGetAllMock.mockReturnValue({ items: undefined, isLoading: false });

    const toolbarFilters: IToolbarFilter[] = [];
    const tableColumns: ITableColumn<PlatformTeam>[] = [];
    const { result } = renderHook(() =>
      useOrganizationTeamsWithRoles(undefined, toolbarFilters, tableColumns)
    );

    expect(result.current.rolesByTeamId.size).toBe(0);
    expect(useGetAllMock).toHaveBeenCalledWith(undefined, 200, null);
    expect(usePlatformViewMock).toHaveBeenCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { organization: '' },
      toolbarFilters,
      tableColumns,
    });
    expect(result.current.isLoadingRoleAssignments).toBe(false);
  });

  it('reports loading while the initial assignments request is pending', () => {
    useGetAllMock.mockReturnValue({ items: undefined, isLoading: true });

    const toolbarFilters: IToolbarFilter[] = [];
    const tableColumns: ITableColumn<PlatformTeam>[] = [];
    const { result } = renderHook(() =>
      useOrganizationTeamsWithRoles(42, toolbarFilters, tableColumns)
    );

    expect(result.current.isLoadingRoleAssignments).toBe(true);
  });

  it('keeps the last known cross-org IDs while assignments revalidate', () => {
    const roleAssignment = {
      team: 7,
      summary_fields: { role_definition: { id: 5, name: 'Organization Admin' } },
    };
    useGetAllMock
      .mockReturnValueOnce({ items: [roleAssignment], isLoading: false })
      .mockReturnValueOnce({ items: undefined, isLoading: true });

    const toolbarFilters: IToolbarFilter[] = [];
    const tableColumns: ITableColumn<PlatformTeam>[] = [];
    const { result, rerender } = renderHook(() =>
      useOrganizationTeamsWithRoles(42, toolbarFilters, tableColumns)
    );
    rerender();

    expect(result.current.isLoadingRoleAssignments).toBe(true);
    expect(usePlatformViewMock).toHaveBeenLastCalledWith({
      url: expect.stringContaining('/teams/') as unknown as string,
      queryParams: { or__organization: '42', or__id__in: '7' },
      toolbarFilters,
      tableColumns,
    });
  });
});
