import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useHostsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'hosts',
    preSortedKeys: ['name', 'description', 'created-by', 'modified-by'],
    preFilledValueKeys: { name: { apiPath: 'hosts' }, id: { apiPath: 'hosts' } },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
    removeFilters: ['last_job_host_summary'],
  });
  return toolbarFilters;
}
