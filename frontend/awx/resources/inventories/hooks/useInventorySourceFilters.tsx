import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInventorySourceFilters(url?: string) {
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
    preSortedKeys: ['name', 'id', 'description'],
  });
  return toolbarFilters;
}
