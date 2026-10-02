/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { IFilterState } from '@ansible/ansible-ui-framework';
import type { IDashboardFilterSet } from '../types';
import { useUpdateToolbarFilterSet } from './useUpdateToolbarFilterSet';
import { useCreateEditToolbarFilterSetDialog } from './useCreateEditToolbarFilterSetDialog';

vi.mock('./useCreateEditToolbarFilterSetDialog');

const existingFilterSet: IDashboardFilterSet = {
  id: 42,
  name: 'Existing Report',
  filters: '{"period":["last_7_days"]}',
  is_default: false,
};

const filterState: IFilterState = {
  period: ['last_30_days'],
  project: ['1', '2'],
};

describe('useUpdateToolbarFilterSet', () => {
  const mockUpdateDialog = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateEditToolbarFilterSetDialog).mockReturnValue(mockUpdateDialog);
  });

  test('should forward onComplete callback to useCreateEditToolbarFilterSetDialog', () => {
    renderHook(() => useUpdateToolbarFilterSet(mockOnComplete));

    expect(useCreateEditToolbarFilterSetDialog).toHaveBeenCalledWith(mockOnComplete);
  });

  test('should call dialog hook with filter state and existing filter set', () => {
    const { result } = renderHook(() => useUpdateToolbarFilterSet(mockOnComplete));

    result.current(existingFilterSet, filterState);

    expect(mockUpdateDialog).toHaveBeenCalledWith(filterState, existingFilterSet);
  });
});
