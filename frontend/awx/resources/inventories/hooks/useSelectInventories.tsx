import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Inventory } from '../../../interfaces/Inventory';
import { useControllerView } from '../../../useControllerView';
import { useInventoriesColumns, useInventoriesFilters } from '../Inventories';

export function useSelectInventories() {
  const { t } = useTranslation();
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns({ disableLinks: true });
  const view = useControllerView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Inventory>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
