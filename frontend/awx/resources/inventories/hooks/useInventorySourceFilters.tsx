import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInventorySourceFilters(url?: string) {
  const searchFilter = useSearchToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: url ? url : 'inventory_sources',
    preFilledValueKeys: {
      name: {
        apiPath: url ? url : 'inventory_sources',
      },
      id: {
        apiPath: url ? url : 'inventory_sources',
      },
    },
    preSortedKeys: ['search', 'name', 'id', 'description'],
    additionalFilters: [searchFilter],
  });
  return toolbarFilters;
}
