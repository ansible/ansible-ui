import {
  useCreatedByToolbarFilter,
  useHostFailedStatusFilter,
  useHostReadyStatusFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useHostsFilters() {
  const searchFilter = useSearchToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const failedHostStatusToolbarFilter = useHostFailedStatusFilter();
  const readyHostStatusToolbarFilter = useHostReadyStatusFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'hosts',
    preSortedKeys: ['search', 'name', 'description', 'created-by', 'modified-by'],
    preFilledValueKeys: { name: { apiPath: 'hosts' }, id: { apiPath: 'hosts' } },
    additionalFilters: [
      searchFilter,
      failedHostStatusToolbarFilter,
      readyHostStatusToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    removeFilters: ['last_job_host_summary'],
  });
  return toolbarFilters;
}
