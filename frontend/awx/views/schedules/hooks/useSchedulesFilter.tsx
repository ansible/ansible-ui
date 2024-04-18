import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useSchedulesFilter() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'schedules',
    preSortedKeys: ['name', 'id', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: {
        apiPath: 'schedules',
      },
      id: {
        apiPath: 'schedules',
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}
