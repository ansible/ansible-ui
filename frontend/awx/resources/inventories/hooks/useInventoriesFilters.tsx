import {
  useCreatedByToolbarFilter,
  useInventoryTypeToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useInventoriesFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const inventoryTypeToolbarFilter = useInventoryTypeToolbarFilter();

  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'inventories',
    preSortedKeys: ['name', 'id', 'created-by', 'modified-by', 'type'],
    preFilledValueKeys: { name: { apiPath: 'inventories' }, id: { apiPath: 'inventories' } },
    removeFilters: ['kind'],
    additionalFilters: [
      createdByToolbarFilter,
      modifiedByToolbarFilter,
      inventoryTypeToolbarFilter,
    ],
  });
  return toolbarFilters;
}
