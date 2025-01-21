import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useHostsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'hosts',
    preSortedKeys: ['search', 'name', 'description', 'created-by', 'modified-by'],
    preFilledValueKeys: { name: { apiPath: 'hosts' }, id: { apiPath: 'hosts' } },
    additionalFilters: [searchFilter, createdByToolbarFilter, modifiedByToolbarFilter],
    removeFilters: ['last_job_host_summary'],
  });
  return toolbarFilters;
}
