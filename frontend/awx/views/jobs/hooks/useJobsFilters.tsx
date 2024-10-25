import { useLabelsToolbarFilter } from '../../../common/awx-toolbar-filters';
import { QueryParams } from '../../../common/useAwxView';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useJobsFilters(queryParams: QueryParams = {}) {
  const labelsToolbarFilter = useLabelsToolbarFilter();
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'labels', 'description', 'status'],
    preFilledValueKeys: {
      name: {
        apiPath: 'unified_jobs',
        queryParams: queryParams,
      },
      id: {
        apiPath: 'unified_jobs',
        queryParams: queryParams,
      },
    },
    additionalFilters: [labelsToolbarFilter],
  });

  return toolBarFilters;
}
