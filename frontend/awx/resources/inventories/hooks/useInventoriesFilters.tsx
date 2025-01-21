import {
  useCreatedByToolbarFilter,
  useInventoryTypeToolbarFilter,
  useModifiedByToolbarFilter,
  useSearchToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInventoriesFilters() {
  const searchFilter = useSearchToolbarFilter();
  const inventoryTypeToolbarFilter = useInventoryTypeToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'inventories',
    preSortedKeys: ['search', 'name', 'id', 'created-by', 'modified-by', 'inventory-type'],
    preFilledValueKeys: { name: { apiPath: 'inventories' }, id: { apiPath: 'inventories' } },
    additionalFilters: [
      searchFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
      inventoryTypeToolbarFilter,
    ],
    removeFilters: ['kind'],
  });
  return toolbarFilters;
}
