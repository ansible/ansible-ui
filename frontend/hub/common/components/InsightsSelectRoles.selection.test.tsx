import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { InsightsSelectRoles, type Role } from './InsightsSelectRoles';

const viewState = vi.hoisted(() => ({
  pageItems: undefined as Role[] | undefined,
  itemCount: undefined as number | undefined,
  filterState: {} as Record<string, string[] | undefined>,
  queryParams: undefined as Record<string, string> | undefined,
}));

const tableProps = vi.hoisted(() => ({
  current: undefined as
    | {
        pageItems?: Role[];
        itemCount?: number;
        filterState?: Record<string, string[] | undefined>;
        tableColumns?: {
          header: string;
          value?: (role: Role) => string;
        }[];
        toolbarFilters?: { key: string; query: string }[];
        isSelected: (role: Role) => boolean;
        selectItem: (role: Role) => void;
        selectItems: (roles: Role[]) => void;
        unselectItem: (role: Role) => void;
        unselectAll: () => void;
      }
    | undefined,
}));

vi.mock('../useHubView', () => ({
  useHubView: (options: { queryParams?: Record<string, string> }) => {
    viewState.queryParams = options.queryParams;
    return {
      pageItems: viewState.pageItems,
      itemCount: viewState.itemCount,
      filterState: viewState.filterState,
      error: undefined,
      isLoading: false,
    };
  },
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageTable: (props: NonNullable<(typeof tableProps)['current']>) => {
      tableProps.current = props;
      return <div data-testid="roles-table" />;
    },
  };
});

const admin: Role = { name: 'galaxy.admin', description: 'Administrator' };
const editor: Role = { name: 'galaxy.editor' };
const viewer: Role = { name: 'galaxy.viewer', description: 'Viewer' };

function renderRoles(props: Partial<React.ComponentProps<typeof InsightsSelectRoles>> = {}) {
  const onSelectRoles = props.onSelectRoles ?? vi.fn();
  render(
    <MemoryRouter>
      <InsightsSelectRoles
        assignedRoles={[]}
        selectedRoles={[]}
        onSelectRoles={onSelectRoles}
        {...props}
      />
    </MemoryRouter>
  );
  return onSelectRoles;
}

describe('InsightsSelectRoles selection', () => {
  it('filters assigned roles, adjusts counts, and selects new roles', () => {
    viewState.pageItems = [admin, editor, viewer];
    viewState.itemCount = 10;
    viewState.filterState = {};
    const onSelectRoles = renderRoles({
      assignedRoles: ['galaxy.editor'],
      selectedRoles: [admin],
      pulpObjectType: 'pulp_ansible/namespaces',
    });

    expect(screen.getByTestId('roles-table')).toBeInTheDocument();
    expect(tableProps.current?.pageItems?.map((role) => role.name)).toEqual([
      'galaxy.admin',
      'galaxy.viewer',
    ]);
    expect(tableProps.current?.itemCount).toBe(9);
    expect(tableProps.current?.filterState).toEqual({});
    expect(tableProps.current?.tableColumns?.[1].value?.(editor)).toBe('');
    expect(tableProps.current?.tableColumns?.[0].value?.(admin)).toBe('galaxy.admin');
    expect(tableProps.current?.toolbarFilters?.[0].query).toBe('name__icontains');
    expect(viewState.queryParams?.for_object_type).toContain('pulp_ansible/namespaces');
    expect(tableProps.current?.isSelected(admin)).toBe(true);
    expect(tableProps.current?.isSelected(viewer)).toBe(false);

    tableProps.current?.selectItem(admin);
    expect(onSelectRoles).not.toHaveBeenCalled();

    tableProps.current?.selectItem(viewer);
    expect(onSelectRoles).toHaveBeenCalledWith([admin, viewer]);

    tableProps.current?.selectItems([admin, viewer]);
    expect(onSelectRoles).toHaveBeenCalledWith([admin, viewer]);

    tableProps.current?.selectItems([admin]);
    expect(onSelectRoles).toHaveBeenCalledTimes(2);

    tableProps.current?.unselectItem(admin);
    expect(onSelectRoles).toHaveBeenCalledWith([]);

    tableProps.current?.unselectAll();
    expect(onSelectRoles).toHaveBeenLastCalledWith([]);
  });

  it('keeps active filters when every role is already assigned and handles missing page data', () => {
    viewState.pageItems = [admin, editor];
    viewState.itemCount = 2;
    viewState.filterState = { name: ['galaxy'] };
    renderRoles({ assignedRoles: ['galaxy.admin', 'galaxy.editor'] });
    expect(tableProps.current?.itemCount).toBe(0);
    expect(tableProps.current?.filterState).toEqual({ name: ['galaxy'] });

    viewState.pageItems = [admin];
    viewState.itemCount = 1;
    viewState.filterState = { name: [] };
    renderRoles({ assignedRoles: ['galaxy.admin'] });
    expect(tableProps.current?.filterState).toEqual({});

    viewState.pageItems = undefined;
    viewState.itemCount = 4;
    viewState.filterState = { name: undefined };
    renderRoles();
    expect(tableProps.current?.itemCount).toBe(4);
    expect(tableProps.current?.pageItems).toEqual([]);
    expect(viewState.queryParams?.for_object_type).toBeUndefined();

    viewState.pageItems = [];
    viewState.itemCount = undefined;
    renderRoles();
    expect(tableProps.current?.itemCount).toBeUndefined();
  });
});
