import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { useHostsActions } from './useHostsActions';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()), // Mock navigate to avoid Router context requirement
  };
});

describe('useHostsActions', () => {
  const mockOnDelete = vi.fn();
  const mockOnToggle = vi.fn();

  test('should return empty array when inventory_type is smart_inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'smart_inventory',
      host_id: '123',
    });

    const { result } = renderHook(() => useHostsActions(mockOnDelete, mockOnToggle));

    expect(result.current).toEqual([]);
  });

  test('should return empty array when inventory_type is constructed_inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'constructed_inventory',
      host_id: '123',
    });

    const { result } = renderHook(() => useHostsActions(mockOnDelete, mockOnToggle));

    expect(result.current).toEqual([]);
  });

  test('should return actions array when inventory_type is inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'inventory',
      host_id: '123',
    });

    const { result } = renderHook(() => useHostsActions(mockOnDelete, mockOnToggle));

    expect(result.current.length).toBe(3); // Toggle, Edit, Delete actions
  });

  test('should return actions array when inventory_type is undefined (standalone host)', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '123',
    });

    const { result } = renderHook(() => useHostsActions(mockOnDelete, mockOnToggle));

    expect(result.current.length).toBe(3); // Toggle, Edit, Delete actions
  });
});
