/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { IFilterState } from '@ansible/ansible-ui-framework';
import { useCreateToolbarFilterSet } from './useCreateToolbarFilterSet';
import { useCreateEditToolbarFilterSetDialog } from './useCreateEditToolbarFilterSetDialog';

vi.mock('./useCreateEditToolbarFilterSetDialog');

const filterState: IFilterState = {
  period: ['last_30_days'],
  project: ['1', '2'],
};

describe('useCreateToolbarFilterSet', () => {
  const mockCreateEditDialog = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateEditToolbarFilterSetDialog).mockReturnValue(mockCreateEditDialog);
  });

  test('should forward onComplete callback to useCreateEditToolbarFilterSetDialog', () => {
    renderHook(() => useCreateToolbarFilterSet(mockOnComplete));

    expect(useCreateEditToolbarFilterSetDialog).toHaveBeenCalledWith(mockOnComplete);
  });

  test('should call dialog hook with filter state and new filter set structure', () => {
    const { result } = renderHook(() => useCreateToolbarFilterSet(mockOnComplete));

    result.current(filterState);

    expect(mockCreateEditDialog).toHaveBeenCalledWith(filterState, {
      id: undefined,
      name: '',
      is_default: false,
      filters: '{}',
    });
  });
});
