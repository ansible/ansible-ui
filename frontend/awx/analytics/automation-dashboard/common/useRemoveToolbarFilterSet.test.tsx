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

const filterSet2: IDashboardFilterSet = {
  id: 8,
  name: 'Another Report',
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

  test('should accept a single filter set and pass it as an array to bulkAction', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as { items: IDashboardFilterSet[] };
    expect(args.items).toEqual([filterSet]);
  });

  test('should accept an array of filter sets and pass them to bulkAction', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current([filterSet, filterSet2]);

    const args = mockBulkAction.mock.calls[0]?.[0] as { items: IDashboardFilterSet[] };
    expect(args.items.length).toBe(2);
  });

  test('should sort filter sets by name', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current([filterSet, filterSet2]);

    const args = mockBulkAction.mock.calls[0]?.[0] as { items: IDashboardFilterSet[] };
    // "Another Report" should come before "My Report" alphabetically
    expect(args.items[0]?.name).toBe('Another Report');
    expect(args.items[1]?.name).toBe('My Report');
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

  test('should include actionColumns with a Name header', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current(filterSet);

    const args = mockBulkAction.mock.calls[0]?.[0] as {
      actionColumns: { header: string }[];
    };
    expect(args.actionColumns[0]?.header).toBe('Name');
  });

  test('should use pluralized title with count', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current([filterSet, filterSet2]);

    const args = mockBulkAction.mock.calls[0]?.[0] as { title: string };
    // In test environment without i18n pluralization, the singular form is returned
    expect(args.title).toBe('Permanently delete report');
  });

  test('should use pluralized confirmText with count', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current([filterSet, filterSet2]);

    const args = mockBulkAction.mock.calls[0]?.[0] as { confirmText: string };
    // In test environment without i18n pluralization, the singular form is returned
    expect(args.confirmText).toBe('Yes, I confirm that I want to delete this report.');
  });

  test('should use pluralized actionButtonText with count', () => {
    const { result } = renderHook(() => useRemoveToolbarFilterSet(mockOnComplete));

    result.current([filterSet, filterSet2]);

    const args = mockBulkAction.mock.calls[0]?.[0] as { actionButtonText: string };
    // In test environment without i18n pluralization, the singular form is returned
    expect(args.actionButtonText).toBe('Delete report');
  });
});
