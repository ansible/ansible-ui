import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useHostsGroupsColumns } from './useHostsGroupsColumns';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  useGetPageUrl: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

function createMockGroup(overrides: Partial<InventoryGroup> = {}): InventoryGroup {
  return {
    id: 3,
    name: 'web',
    summary_fields: {
      inventory: { id: 10, kind: '' },
    },
    ...overrides,
  } as InventoryGroup;
}

describe('useHostsGroupsColumns', () => {
  const mockGetPageUrl = vi.fn(() => '/group/3');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetPageUrl).mockReturnValue(mockGetPageUrl);
    vi.mocked(useParams).mockReturnValue({ id: '10', inventory_type: 'inventory' });
  });

  test('returns a single name column', () => {
    const { result } = renderHook(() => useHostsGroupsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].header).toBe('Name');
  });

  test('name link uses route params from inventory context', () => {
    const { result } = renderHook(() => useHostsGroupsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const column = result.current[0];
    if ('to' in column && typeof column.to === 'function') {
      column.to(createMockGroup());
    }
    expect(mockGetPageUrl).toHaveBeenCalledWith('awx-inventory-group-details', {
      params: { id: '10', group_id: 3, inventory_type: 'inventory' },
    });
  });

  test('useGroupInventory uses group inventory id and kind mapping', () => {
    const { result } = renderHook(() => useHostsGroupsColumns({ useGroupInventory: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const column = result.current[0];
    if ('to' in column && typeof column.to === 'function') {
      column.to(
        createMockGroup({
          summary_fields: {
            inventory: { id: 99, kind: 'smart' },
          } as InventoryGroup['summary_fields'],
        })
      );
    }
    expect(mockGetPageUrl).toHaveBeenCalledWith('awx-inventory-group-details', {
      params: { id: 99, group_id: 3, inventory_type: 'smart_inventory' },
    });
  });
});
