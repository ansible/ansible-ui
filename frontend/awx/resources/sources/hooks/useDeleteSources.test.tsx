/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteSources } from './useDeleteSources';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { InventorySource } from '../../../interfaces/InventorySource';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('./useSourcesColumns', () => ({
  useSourcesColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockSource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    name: 'Source A',
    type: 'inventory_source',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, start: true, schedule: true },
    },
    ...overrides,
  } as InventorySource;
}

describe('useDeleteSources', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const sources = [createMockSource(), createMockSource({ id: 2, name: 'Source B' })];
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete sources/i);
  });

  test('should call bulkAction with correct confirm text including count', () => {
    const sources = [createMockSource(), createMockSource({ id: 2, name: 'Source B' })];
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmText).toContain('2');
  });

  test('should sort sources by name', () => {
    const sources = [
      createMockSource({ id: 1, name: 'Zulu' }),
      createMockSource({ id: 2, name: 'Alpha' }),
    ];
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zulu');
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current([createMockSource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current([createMockSource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should provide actionFn that calls requestDelete with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current([createMockSource({ id: 55 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockSource({ id: 55 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining('/inventory_sources/55/'),
      signal
    );
  });

  test('should pass confirmationColumns and actionColumns', () => {
    const { result } = renderHook(() => useDeleteSources(mockOnComplete));

    result.current([createMockSource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmationColumns).toBeDefined();
    expect(callArgs.actionColumns).toBeDefined();
    expect(Array.isArray(callArgs.actionColumns)).toBe(true);
  });
});
