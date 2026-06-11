import { IFilterState } from '@ansible/ansible-ui-framework';
import { useCallback } from 'react';
import { IDashboardFilterSet } from '../types';
import { useCreateEditToolbarFilterSetDialog } from './useCreateEditToolbarFilterSetDialog';

export function useUpdateToolbarFilterSet(onComplete: (filterSet: IDashboardFilterSet) => void) {
  const updateFilters = useCreateEditToolbarFilterSetDialog(onComplete);
  return useCallback(
    (filterSet: IDashboardFilterSet, filterState: IFilterState) => {
      updateFilters(filterState, filterSet);
    },
    [updateFilters]
  );
}
