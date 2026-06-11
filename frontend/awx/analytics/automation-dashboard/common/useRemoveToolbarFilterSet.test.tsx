/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import type { IDashboardFilterSet } from '../types';
import { useRemoveToolbarFilterSet } from './useRemoveToolbarFilterSet';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const filterSet: IDashboardFilterSet = {
  id: 7,
  name: 'My Report',
  filters: '{}',
  is_default: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useRemoveToolbarFilterSet', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a function', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    expect(result.current).toBeTypeOf('function');
  });

  test('should call bulkAction when invoked with a filter set', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    expect(mockBulkAction).toHaveBeenCalledOnce();
  });

  test('should pass the filter set as a single-item array to bulkAction', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as { items: IDashboardFilterSet[] };
    expect(args.items).toEqual([filterSet]);
  });

  test('should set isDanger to true', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as { isDanger: boolean };
    expect(args.isDanger).toBe(true);
  });

  test('should use filter set id as the key function result', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as {
      keyFn: (item: IDashboardFilterSet) => number;
    };
    expect(args.keyFn(filterSet)).toBe(filterSet.id);
  });

  test('should include a DELETE actionFn targeting the filter set endpoint', async () => {
    const { requestDelete } = vi.mocked(await import('@ansible/common-ui/crud/Data'));
    requestDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));
    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as {
      actionFn: (item: IDashboardFilterSet, signal: AbortSignal) => Promise<void>;
    };

    const signal = new AbortController().signal;
    void args.actionFn(filterSet, signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining(`/dashboard_reports/filter_sets/${filterSet.id}/`),
      signal
    );
  });

  test('should forward the onComplete callback to bulkAction', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as {
      onComplete: (items: IDashboardFilterSet[]) => void;
    };
    args.onComplete([filterSet]);

    expect(mockOnComplete).toHaveBeenCalledWith([filterSet]);
  });

  test('should include a confirmation column with a Name header', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as {
      confirmationColumns: { header: string }[];
    };
    expect(args.confirmationColumns[0]?.header).toBe('Name');
  });
});
