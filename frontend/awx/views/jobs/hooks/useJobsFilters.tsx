import { QueryParams } from '@ansible/ansible-ui-framework';
import {
  useLabelsToolbarFilter,
  useLaunchedByToolbarFilter,
  useSearchToolbarFilter,
  useLimitToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useJobsFilters(queryParams: QueryParams = {}) {
  const searchFilter = useSearchToolbarFilter();
  const labelsToolbarFilter = useLabelsToolbarFilter();
  const launchedByFilter = useLaunchedByToolbarFilter();
  const limitFilter = useLimitToolbarFilter();
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['search', 'name', 'labels', 'description', 'status', 'launched-by'],
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
    additionalFilters: [searchFilter, labelsToolbarFilter, launchedByFilter, limitFilter],
  });

  return toolBarFilters;
}
