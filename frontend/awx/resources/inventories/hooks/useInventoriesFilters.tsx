import {
  useCreatedByToolbarFilter,
  useInventoryTypeToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInventoriesFilters() {
  const inventoryTypeToolbarFilter = useInventoryTypeToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'inventories',
    preSortedKeys: ['name', 'id', 'created-by', 'modified-by', 'inventory-type'],
    preFilledValueKeys: { name: { apiPath: 'inventories' }, id: { apiPath: 'inventories' } },
    additionalFilters: [
      createdByToolbarFilter,
      modifiedByToolbarFilter,
      inventoryTypeToolbarFilter,
    ],
    removeFilters: ['kind'],
  });
  return toolbarFilters;
}
