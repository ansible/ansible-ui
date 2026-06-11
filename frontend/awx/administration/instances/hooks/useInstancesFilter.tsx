import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInstancesFilters() {
  const searchFilter = useSearchToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'instances',
    preSortedKeys: ['search', 'hostname', 'node_type', 'id'],
    preFilledValueKeys: {
      hostname: { apiPath: 'instances' },
      id: { apiPath: 'instances' },
    },
    additionalFilters: [searchFilter],
  });
  return toolbarFilters;
}
