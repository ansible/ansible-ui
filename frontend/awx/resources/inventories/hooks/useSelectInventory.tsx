import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Inventory } from '../../../interfaces/Inventory';
import { useAwxView } from '../../../useAwxView';
import { useInventoriesColumns, useInventoriesFilters } from '../Inventories';

export function useSelectInventory() {
  const { t } = useTranslation();
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns({ disableLinks: true });

  const view = useAwxView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  return {
    useSelectDialog: useSelectDialog<Inventory>({
      toolbarFilters,
      tableColumns,
      view,
      confirm: t('Confirm'),
      cancel: t('Cancel'),
      selected: t('Selected'),
    }),
    view,
  };
}
