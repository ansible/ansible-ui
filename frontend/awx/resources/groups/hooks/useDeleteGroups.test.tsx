/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteGroups } from './useDeleteGroups';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';

const mockDeleteRequest = vi.fn().mockResolvedValue(undefined);
const mockPostRequest = vi.fn().mockResolvedValue(undefined);
const mockSetDialog = vi.fn();

vi.mock('@ansible/common-ui/crud/useDeleteRequest', () => ({
  useDeleteRequest: vi.fn(() => mockDeleteRequest),
}));
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => mockPostRequest),
}));
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    usePageDialog: vi.fn(() => [undefined, mockSetDialog]),
  };
});
vi.mock('../../../common/AwxError', () => ({
  AwxError: () => null,
}));

function createMockGroup(overrides: Partial<InventoryGroup> = {}): InventoryGroup {
  return {
    id: 1,
    name: 'Test Group',
    created: '2025-01-01T00:00:00Z',
    modified: '2025-01-01T00:00:00Z',
    inventory: 10,
    summary_fields: {
      groups: { results: [], count: 0 },
      user_capabilities: { edit: true, delete: true, copy: true },
      inventory: {
        name: 'Test Inventory',
        description: '',
        has_active_failures: false,
        has_inventory_sources: false,
        hosts_with_active_failures: 0,
        id: 10,
        inventory_sources_with_failures: 0,
        kind: '',
        organization_id: 1,
        total_groups: 1,
        total_hosts: 0,
        total_inventory_sources: 0,
      },
      created_by: { id: 1, username: 'admin' },
      modified_by: { id: 1, username: 'admin' },
    },
    related: {
      children: { count: 0, results: [] },
      hosts: { count: 0, results: [] },
    },
    ...overrides,
  } as InventoryGroup;
}

describe('useDeleteGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return a function', () => {
    const { result } = renderHook(() => useDeleteGroups(vi.fn()));

    expect(typeof result.current).toBe('function');
  });

  test('should call setDialog with DeleteGroupsDialog when invoked', () => {
    const mockOnDelete = vi.fn();
    const { result } = renderHook(() => useDeleteGroups(mockOnDelete));

    result.current([createMockGroup()]);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
    expect(mockSetDialog).toHaveBeenCalledWith(expect.anything());
  });

  test('should pass groups to the dialog component', () => {
    const groups = [createMockGroup({ name: 'G1' }), createMockGroup({ id: 2, name: 'G2' })];
    const { result } = renderHook(() => useDeleteGroups(vi.fn()));

    result.current(groups);

    const dialogElement = mockSetDialog.mock.calls[0][0];
    expect(dialogElement.props.groups).toEqual(groups);
  });

  test('should pass onDelete callback to the dialog', () => {
    const mockOnDelete = vi.fn();
    const { result } = renderHook(() => useDeleteGroups(mockOnDelete));

    result.current([createMockGroup()]);

    const dialogElement = mockSetDialog.mock.calls[0][0];
    expect(dialogElement.props.onDelete).toBe(mockOnDelete);
  });

  test('should pass onClose callback that clears the dialog', () => {
    const { result } = renderHook(() => useDeleteGroups(vi.fn()));

    result.current([createMockGroup()]);

    const dialogElement = mockSetDialog.mock.calls[0][0];
    mockSetDialog.mockClear();
    dialogElement.props.onClose();
    expect(mockSetDialog).toHaveBeenCalledWith(undefined);
  });
});
