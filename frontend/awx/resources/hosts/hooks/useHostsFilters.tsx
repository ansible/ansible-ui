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
    // 2.7 OPTIONS still sets filterable:true on last_job / last_job_host_summary
    // because the Host FKs remain (tower#7575). Filtering those FKs is stale
    // and can 400. AWX devel OPTIONS is honest (filterable:false) after
    // awx#16529 dropped the FKs. Hide both so neither backend sends those
    // list queries. summary_fields.last_job_host_summary is still populated.
    removeFilters: ['last_job', 'last_job_host_summary'],
  });
  return toolbarFilters;
}
