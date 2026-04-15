import { IFilterState } from '@ansible/ansible-ui-framework';
import { useCallback } from 'react';
import { IDashboardFilterSet } from '../types';
import { useCreateEditToolbarFilterSetDialog } from './useCreateEditToolbarFilterSetDialog';

export function useCreateToolbarFilterSet(onComplete: (filterSet: IDashboardFilterSet) => void) {
  const createFilters = useCreateEditToolbarFilterSetDialog(onComplete);
  return useCallback(
    (filterState: IFilterState) => {
      const filterSet = {
        id: undefined,
        name: '',
        is_default: false,
        filters: '{}',
      } as IDashboardFilterSet & { id: undefined };
      createFilters(filterState, filterSet);
    },
    [createFilters]
  );
}
